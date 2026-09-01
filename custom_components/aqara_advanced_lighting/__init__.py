"""The Aqara Advanced Lighting integration."""

import logging

from homeassistant.components import mqtt
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.start import async_at_started
from homeassistant.exceptions import ConfigEntryError, ConfigEntryNotReady
from homeassistant.helpers import config_validation as cv, device_registry as dr, issue_registry as ir

from .cct_sequence_manager import CCTSequenceManager
from .circadian_manager import CircadianManager
from .const import (
    BACKEND_Z2M,
    BACKEND_ZHA,
    CONF_BACKEND_TYPE,
    CONF_Z2M_BASE_TOPIC,
    DATA_AUDIO_ENGINE_REGISTRY,
    DATA_CCT_SEQUENCE_MANAGER,
    DATA_CIRCADIAN_MANAGER,
    DATA_DYNAMIC_SCENE_MANAGER,
    DATA_ENTITY_CONTROLLER,
    DATA_FAVORITES_STORE,
    DATA_PRESET_STORE,
    DATA_SEGMENT_SEQUENCE_MANAGER,
    DATA_SEGMENT_ZONE_STORE,
    DATA_SERVICE_SCHEMA_MANAGER,
    DATA_USER_PREFERENCES_STORE,
    DEFAULT_Z2M_BASE_TOPIC,
    DOMAIN,
)
from .entity_controller import EntityController
from .dynamic_scene_manager import DynamicSceneManager
from .favorites_store import FavoritesStore
from .preset_store import PresetStore
from .segment_zone_store import SegmentZoneStore
from .user_preferences_store import UserPreferencesStore
from .segment_sequence_manager import SegmentSequenceManager
from .models import AqaraLightingConfigEntry, AqaraLightingRuntimeData
from .mqtt_backend import MQTTBackend
from .panel import async_register_panel
from .service_schema_manager import ServiceSchemaManager
from .services import async_setup_services
from .state_manager import StateManager

_LOGGER = logging.getLogger(__name__)

PLATFORMS: list[Platform] = []

CONFIG_SCHEMA = cv.config_entry_only_config_schema(DOMAIN)

async def async_migrate_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Migrate old config entries to new format."""
    _LOGGER.debug(
        "Migrating entry %s from version %s.%s",
        entry.entry_id,
        entry.version,
        entry.minor_version,
    )

    # Migrate from version 1.x: Add unique_id and backend_type
    if entry.version == 1:
        if entry.minor_version < 1:
            # v1.0 -> v1.1: Add unique_id based on z2m_base_topic
            z2m_base_topic = entry.data.get(CONF_Z2M_BASE_TOPIC, DEFAULT_Z2M_BASE_TOPIC)

            if not entry.unique_id:
                _LOGGER.info(
                    "Migrating config entry %s to add unique_id: %s",
                    entry.entry_id,
                    z2m_base_topic,
                )
                hass.config_entries.async_update_entry(
                    entry,
                    unique_id=z2m_base_topic,
                    minor_version=1,
                )

        if entry.minor_version < 2:
            # v1.1 -> v1.2: Add backend_type for existing Z2M entries
            new_data = {**entry.data}
            if CONF_BACKEND_TYPE not in new_data:
                new_data[CONF_BACKEND_TYPE] = BACKEND_Z2M
                _LOGGER.info(
                    "Migrating config entry %s to add backend_type: %s",
                    entry.entry_id,
                    BACKEND_Z2M,
                )
                hass.config_entries.async_update_entry(
                    entry,
                    data=new_data,
                    minor_version=2,
                )

        if entry.minor_version < 3:
            # v1.2 -> v1.3: One-time cleanup for device registry merging.
            # Previous versions created standalone devices that conflict
            # with MQTT/ZHA devices (duplicate MQTT identifiers). Remove
            # ALL devices owned by this config entry so the backend can
            # re-create them with proper identifier-based merging.
            device_registry = dr.async_get(hass)
            devices = dr.async_entries_for_config_entry(
                device_registry, entry.entry_id
            )
            if devices:
                _LOGGER.info(
                    "v1.3 migration: removing %d devices for clean "
                    "re-merge with MQTT/ZHA devices",
                    len(devices),
                )
                for device in devices:
                    _LOGGER.debug(
                        "v1.3 migration: removing device %s (%s)",
                        device.name,
                        device.id,
                    )
                    device_registry.async_remove_device(device.id)
            hass.config_entries.async_update_entry(
                entry,
                minor_version=3,
            )

        return True

    return True

CARD_RESOURCE_URL = f"/api/{DOMAIN}/aqara_preset_favorites_card.js"

async def _async_register_card_resource(hass: HomeAssistant) -> None:
    """Register the favorites card JS as a Lovelace resource if not already present."""
    try:
        from homeassistant.components.lovelace.const import LOVELACE_DATA

        lovelace_data = hass.data.get(LOVELACE_DATA)
        if lovelace_data is None:
            _LOGGER.debug("Lovelace not loaded, skipping card auto-registration")
            return

        # Only storage mode supports creating resources programmatically
        if lovelace_data.resource_mode != "storage":
            _LOGGER.debug("Lovelace in YAML mode, skipping card auto-registration")
            return

        # async_items() returns the in-memory list directly (synchronous)
        resources = lovelace_data.resources.async_items()
    except (ImportError, AttributeError, TypeError):
        _LOGGER.debug("Lovelace resources not available, skipping card auto-registration")
        return

    # Check if our resource URL is already registered
    for resource in resources:
        if resource.get("url") == CARD_RESOURCE_URL:
            _LOGGER.debug("Card resource already registered")
            return

    # Register the resource
    try:
        await lovelace_data.resources.async_create_item(
            {"res_type": "module", "url": CARD_RESOURCE_URL}
        )
        _LOGGER.info("Auto-registered Aqara Preset Favorites card as Lovelace resource")
    except Exception:
        _LOGGER.debug(
            "Could not auto-register card resource. Users can manually add: %s",
            CARD_RESOURCE_URL,
        )

async def async_setup(hass: HomeAssistant, config: dict) -> bool:
    """Set up the Aqara Advanced Lighting integration."""
    # Register ZHA quirks with zigpy so Aqara devices get our custom cluster
    # (0xFCC0) with proper attribute types. Because "zha" is in
    # after_dependencies, ZHA has already discovered devices by this point.
    # async_setup_entry() will trigger a one-time ZHA reload so devices
    # pick up the newly registered quirk definitions.
    from .quirks import register_quirks

    await hass.async_add_executor_job(register_quirks)

    # Initialize domain data storage with multi-instance support
    hass.data.setdefault(DOMAIN, {
        "entries": {},  # entry_id -> instance components (backend, managers, etc.)
        "entity_routing": {},  # entity_id -> entry_id (for service routing)
    })

    # Flag ZHA for reload if it already loaded before our quirks were
    # registered. The reload happens in async_setup_entry() so it only
    # triggers when a ZHA backend config entry actually exists.
    zha_entries = hass.config_entries.async_entries("zha")
    if any(entry.state.value == "loaded" for entry in zha_entries):
        hass.data[DOMAIN]["_zha_needs_quirk_reload"] = True

    # Initialize favorites store (per-user favorites for the panel)
    # Only initialize if not already present (handles config entry removal/re-add)
    if DATA_FAVORITES_STORE not in hass.data[DOMAIN]:
        favorites_store = FavoritesStore(hass)
        await favorites_store.async_load()
        hass.data[DOMAIN][DATA_FAVORITES_STORE] = favorites_store
        _LOGGER.debug("Favorites store initialized")

    # Initialize preset store (global user-created presets)
    # Only initialize if not already present (handles config entry removal/re-add)
    if DATA_PRESET_STORE not in hass.data[DOMAIN]:
        preset_store = PresetStore(hass)
        await preset_store.async_load()
        hass.data[DOMAIN][DATA_PRESET_STORE] = preset_store
        _LOGGER.debug("Preset store initialized")

    # Initialize user preferences store (per-user color history + sort preferences)
    # Only initialize if not already present (handles config entry removal/re-add)
    if DATA_USER_PREFERENCES_STORE not in hass.data[DOMAIN]:
        user_prefs_store = UserPreferencesStore(hass)
        await user_prefs_store.async_load()
        hass.data[DOMAIN][DATA_USER_PREFERENCES_STORE] = user_prefs_store
        _LOGGER.debug("User preferences store initialized")

    # Initialize segment zone store (per-device zone definitions)
    # Only initialize if not already present (handles config entry removal/re-add)
    if DATA_SEGMENT_ZONE_STORE not in hass.data[DOMAIN]:
        zone_store = SegmentZoneStore(hass)
        await zone_store.async_load()
        hass.data[DOMAIN][DATA_SEGMENT_ZONE_STORE] = zone_store
        _LOGGER.debug("Segment zone store initialized")

    # Initialize audio engine registry for orphan prevention
    if DATA_AUDIO_ENGINE_REGISTRY not in hass.data[DOMAIN]:
        from .audio_engine_registry import AudioEngineRegistry
        hass.data[DOMAIN][DATA_AUDIO_ENGINE_REGISTRY] = AudioEngineRegistry()
        _LOGGER.debug("Audio engine registry initialized")

    # Initialize entity controller for cross-type conflict resolution
    # and external change detection (integration-level singleton)
    if DATA_ENTITY_CONTROLLER not in hass.data[DOMAIN]:
        entity_controller = EntityController(hass)
        entity_controller.setup()
        hass.data[DOMAIN][DATA_ENTITY_CONTROLLER] = entity_controller
        _LOGGER.debug("Entity controller initialized")

    # Initialize circadian manager (integration-level singleton)
    if DATA_CIRCADIAN_MANAGER not in hass.data[DOMAIN]:
        hass.data[DOMAIN][DATA_CIRCADIAN_MANAGER] = CircadianManager(hass)
        _LOGGER.debug("Circadian manager initialized")

    # Register services
    await async_setup_services(hass)

    # Set up dynamic service schema updates for preset dropdowns
    # Must run after services are registered so descriptions are cached
    if DATA_SERVICE_SCHEMA_MANAGER not in hass.data[DOMAIN]:
        schema_manager = ServiceSchemaManager(hass)
        await schema_manager.async_setup()
        hass.data[DOMAIN][DATA_SERVICE_SCHEMA_MANAGER] = schema_manager
        _LOGGER.debug("Service schema manager initialized")

    # Register sidebar panel
    await async_register_panel(hass)

    # Auto-register the favorites card as a Lovelace resource
    await _async_register_card_resource(hass)

    return True

async def async_setup_entry(
    hass: HomeAssistant, entry: AqaraLightingConfigEntry
) -> bool:
    """Set up Aqara Advanced Lighting from a config entry."""
    # Determine backend type from config entry
    backend_type = entry.data.get(CONF_BACKEND_TYPE, BACKEND_Z2M)

    # Verify MQTT integration is loaded (required for Z2M backend)
    if backend_type == BACKEND_Z2M:
        try:
            await mqtt.async_wait_for_mqtt_client(hass)
        except Exception as ex:
            _LOGGER.error("MQTT integration is not available: %s", ex)
            raise ConfigEntryNotReady("MQTT integration not loaded") from ex

    # Verify ZHA integration is loaded (required for ZHA backend)
    if backend_type == BACKEND_ZHA:
        # One-time ZHA reload: our quirks were registered after ZHA discovered
        # devices (after_dependencies guarantees ZHA loads first). Reload ZHA
        # config entries so devices get re-discovered with our quirk definitions.
        # Uses pop() so the reload only triggers once per HA startup.
        if hass.data[DOMAIN].pop("_zha_needs_quirk_reload", False):
            _LOGGER.info("Reloading ZHA to apply Aqara device quirks")
            for zha_entry in hass.config_entries.async_entries("zha"):
                if zha_entry.state.value == "loaded":
                    hass.async_create_task(
                        hass.config_entries.async_reload(zha_entry.entry_id)
                    )
            raise ConfigEntryNotReady(
                "ZHA reloading to apply Aqara quirk definitions"
            )

        try:
            from homeassistant.components.zha.helpers import get_zha_gateway

            get_zha_gateway(hass)
        except ImportError as ex:
            ir.async_create_issue(
                hass,
                DOMAIN,
                "zha_not_installed",
                is_fixable=False,
                severity=ir.IssueSeverity.ERROR,
                translation_key="zha_not_installed",
            )
            raise ConfigEntryError("ZHA not installed") from ex
        except ValueError as ex:
            _LOGGER.warning(
                "ZHA gateway not ready yet, will retry: %s", ex
            )
            raise ConfigEntryNotReady("ZHA gateway not ready") from ex

        ir.async_delete_issue(hass, DOMAIN, "zha_not_installed")

    # Get Z2M base topic from config entry (only used for Z2M backend)
    z2m_base_topic = (
        entry.data.get(CONF_Z2M_BASE_TOPIC, DEFAULT_Z2M_BASE_TOPIC)
        if backend_type == BACKEND_Z2M
        else ""
    )

    # Initialize runtime data
    runtime_data = AqaraLightingRuntimeData(
        config_entry=entry,
        backend_type=backend_type,
        z2m_base_topic=z2m_base_topic,
    )

    # Store runtime data in config entry
    entry.runtime_data = runtime_data

    # NOTE: Do not prune devices here based on how many config entries own
    # them. From HA 2026.8 a device belongs to exactly one config entry, so
    # every device we own is "sole entry" by definition and such a check
    # deletes all of them on every setup. That loses area assignments and
    # user-set names, regenerates device IDs, and detaches the device from
    # the pre-migration composite that keeps existing device automations
    # resolving to us. The one-time minor_version < 3 cleanup in
    # async_migrate_entry handles legacy standalone devices instead.

    _LOGGER.info(
        "Setting up Aqara Advanced Lighting (backend: %s%s)",
        backend_type,
        f", topic: {z2m_base_topic}" if backend_type == BACKEND_Z2M else "",
    )

    # Get integration-level entity controller
    entity_controller = hass.data[DOMAIN].get(DATA_ENTITY_CONTROLLER)

    # Initialize backend based on type
    if backend_type == BACKEND_ZHA:
        from .zha_backend import ZHABackend

        backend = ZHABackend(hass, entry, entity_controller)
    else:
        backend = MQTTBackend(hass, entry, entity_controller)

    await backend.async_setup()

    # Initialize state manager and load persisted states
    state_manager = StateManager(hass)
    await state_manager.async_load()
    state_manager.start_tracking()

    # Initialize CCT sequence manager (needs backend for device communication)
    cct_sequence_manager = CCTSequenceManager(
        hass, backend, entity_controller, state_manager,
        entry_id=entry.entry_id,
    )

    # Initialize segment sequence manager (needs backend for device communication)
    segment_sequence_manager = SegmentSequenceManager(
        hass, backend, entity_controller, state_manager,
    )

    # Initialize dynamic scene manager (uses HA light.turn_on for transitions)
    dynamic_scene_manager = DynamicSceneManager(hass, state_manager, entity_controller)

    # Ensure domain data structure exists (handles case where async_setup wasn't called)
    if DOMAIN not in hass.data:
        hass.data[DOMAIN] = {
            "entries": {},
            "entity_routing": {},
        }
    if "entries" not in hass.data[DOMAIN]:
        hass.data[DOMAIN]["entries"] = {}
    if "entity_routing" not in hass.data[DOMAIN]:
        hass.data[DOMAIN]["entity_routing"] = {}

    # Store components per-entry for multi-instance support
    hass.data[DOMAIN]["entries"][entry.entry_id] = {
        "backend": backend,
        "state_manager": state_manager,
        DATA_CCT_SEQUENCE_MANAGER: cct_sequence_manager,
        DATA_SEGMENT_SEQUENCE_MANAGER: segment_sequence_manager,
        DATA_DYNAMIC_SCENE_MANAGER: dynamic_scene_manager,
    }

    _LOGGER.info(
        "Aqara Advanced Lighting instance setup complete (entry: %s, backend: %s)",
        entry.entry_id,
        backend_type,
    )

    # Restore persisted solar CCT sequences after HA is fully started
    # (entities must be registered before we can restore sequences)
    @callback
    def _schedule_solar_restore(_event: object) -> None:
        hass.async_create_task(
            cct_sequence_manager.async_restore_solar_sequences()
        )

    entry.async_on_unload(async_at_started(hass, _schedule_solar_restore))

    return True

async def async_unload_entry(
    hass: HomeAssistant, entry: AqaraLightingConfigEntry
) -> bool:
    """Unload a config entry."""
    _LOGGER.info("Unloading Aqara Advanced Lighting instance: %s", entry.entry_id)

    # Get instance data for this entry
    instance_data = hass.data[DOMAIN].get("entries", {}).get(entry.entry_id)
    if instance_data:
        # Get managers from instance data and cleanup
        cct_manager = instance_data.get(DATA_CCT_SEQUENCE_MANAGER)
        if cct_manager:
            # Preserve solar persistence across HA restarts
            cct_manager.set_shutting_down()
            # Stop all running sequences
            await cct_manager.stop_all_sequences()
            # Cleanup state listeners
            cct_manager.cleanup()

        segment_manager = instance_data.get(DATA_SEGMENT_SEQUENCE_MANAGER)
        if segment_manager:
            # Stop all running sequences
            await segment_manager.stop_all_sequences()
            # Cleanup state listeners
            segment_manager.cleanup()

        dynamic_scene_manager = instance_data.get(DATA_DYNAMIC_SCENE_MANAGER)
        if dynamic_scene_manager:
            # Stop all running scenes and cleanup (cleanup is synchronous)
            dynamic_scene_manager.cleanup()

        state_mgr = instance_data.get("state_manager")
        if state_mgr:
            state_mgr.stop_tracking()

        # Shut down backend
        backend = instance_data.get("backend")
        if backend:
            await backend.async_shutdown()

        # Remove this entry's data
        del hass.data[DOMAIN]["entries"][entry.entry_id]

    # Clean up entity routing for this entry
    entity_routing = hass.data[DOMAIN].get("entity_routing", {})
    entities_to_remove = [
        entity_id
        for entity_id, eid in entity_routing.items()
        if eid == entry.entry_id
    ]
    for entity_id in entities_to_remove:
        del entity_routing[entity_id]

    # Clean up integration-level singletons when the last config entry is unloaded
    if not hass.data[DOMAIN].get("entries"):
        entity_controller = hass.data[DOMAIN].get(DATA_ENTITY_CONTROLLER)
        if entity_controller:
            entity_controller.cleanup()
            del hass.data[DOMAIN][DATA_ENTITY_CONTROLLER]
            _LOGGER.debug("Entity controller cleaned up (last entry unloaded)")

        circadian_mgr = hass.data[DOMAIN].get(DATA_CIRCADIAN_MANAGER)
        if circadian_mgr:
            circadian_mgr.stop_all()
            del hass.data[DOMAIN][DATA_CIRCADIAN_MANAGER]
            _LOGGER.debug("Circadian manager cleaned up (last entry unloaded)")

    # NOTE: Services are NOT unloaded here because they are integration-level
    # (registered in async_setup) and should persist even when config entries
    # are removed or reloaded. Unloading services during config entry reload
    # causes "Unable to remove unknown service" warnings because async_setup()
    # is not called again during reload to re-register them.
    #
    # Integration-level resources (preset_store, favorites_store, services, panel)
    # persist for the lifetime of the integration in Home Assistant and are
    # automatically cleaned up when HA shuts down.

    _LOGGER.info(
        "Config entry %s unloaded, integration-level resources preserved",
        entry.entry_id,
    )

    return True

async def async_reload_entry(
    hass: HomeAssistant, entry: AqaraLightingConfigEntry
) -> None:
    """Reload config entry."""
    await async_unload_entry(hass, entry)
    await async_setup_entry(hass, entry)

async def async_remove_config_entry_device(
    hass: HomeAssistant,
    config_entry: AqaraLightingConfigEntry,
    device_entry: dr.DeviceEntry,
) -> bool:
    """Allow deleting a device the backend no longer reports.

    Defining this is what sets ConfigEntry.supports_remove_device, which is
    what puts a delete action on the device page. It matters from HA 2026.8:
    a device belongs to a single config entry, so ours is no longer shared
    with the MQTT/ZHA device and no other integration offers a way to remove
    it.

    A device the backend still reports is refused. Setup re-creates it on the
    next discovery, so accepting the delete would silently do nothing.
    """
    runtime_data = getattr(config_entry, "runtime_data", None)
    if runtime_data is None:
        # Entry never finished setting up (failed, disabled or unloaded), so
        # no backend claims the device and the user may clear it.
        return True

    return not any(
        identifier_domain == DOMAIN
        and identifier_value in runtime_data.aqara_devices
        for identifier_domain, identifier_value in device_entry.identifiers
    )
