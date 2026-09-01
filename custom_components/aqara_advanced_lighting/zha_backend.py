"""ZHA backend implementing the DeviceBackend protocol.

Uses the ZHA integration's gateway to communicate directly with Aqara
lights via Zigbee cluster writes, bypassing MQTT entirely. The
AqaraLumiCluster quirk (registered in quirks.py) defines all
manufacturer-specific attributes with proper types and handles the
Aqara manufacturer code automatically.
"""

import asyncio
import logging
from typing import TYPE_CHECKING, Any

from homeassistant.components.light import DOMAIN as LIGHT_DOMAIN
from homeassistant.core import HomeAssistant
from homeassistant.helpers import device_registry as dr, entity_registry as er
from homeassistant.helpers.device_registry import CONNECTION_ZIGBEE

from .const import (
    DOMAIN,
    MODEL_FRIENDLY_NAMES,
    MODEL_T1M_20_SEGMENT,
    MODEL_T1M_26_SEGMENT,
    MODEL_T1_STRIP,
    MODEL_T2_BULB_E26,
    MODEL_T2_BULB_E27,
    MODEL_T2_BULB_GU10_110V,
    MODEL_T2_BULB_GU10_230V,
    MODEL_T2_CCT_E26,
    MODEL_T2_CCT_E27,
    MODEL_T2_CCT_GU10_110V,
    MODEL_T2_CCT_GU10_230V,
    MUSIC_SYNC_EFFECT_ENUM,
    MUSIC_SYNC_SENSITIVITY_ENUM,
    T1M_MODELS,
)
from .transition_utils import (
    apply_cct_step,
    make_service_apply_callback,
    turn_off_light,
)
from .models import AqaraDevice, DynamicEffect, RGBColor, SegmentColor
from .mqtt_backend import SUPPORTED_MODELS
from .segment_utils import parse_segment_range
from .payload_builder import (
    build_effect_colors_payload,
    build_effect_segments_mask,
    build_strip_segment_packet,
    build_t1m_segment_packet,
)

if TYPE_CHECKING:
    from .entity_controller import EntityController
    from .models import AqaraLightingConfigEntry

_LOGGER = logging.getLogger(__name__)

# HA 2026.8 restricts a device registry entry to a single config entry and
# makes identifiers unique per config entry, so identifier lookups must name
# the owning entry. Probe for the API introduced by that change.
# See the legacy migration removal tracker.
_SINGLE_CONFIG_ENTRY_REGISTRY = hasattr(
    dr.DeviceRegistry, "async_get_device_by_identifier"
)

# Aqara manufacturer-specific Zigbee cluster ID
CLUSTER_MANU_SPECIFIC_LUMI = 0xFCC0

# Attribute IDs for cluster 0xFCC0
ATTR_AUDIO_ENABLE = 0x051C
ATTR_AUDIO_EFFECT = 0x051D
ATTR_AUDIO_SENSITIVITY = 0x051E
ATTR_EFFECT_TYPE = 0x051F
ATTR_EFFECT_SPEED = 0x0520
ATTR_T1M_SEGMENT = 0x0522
ATTR_EFFECT_COLORS = 0x0523
ATTR_STRIP_SEGMENT = 0x0527
ATTR_TRANSITION_CURVE = 0x0528
ATTR_EFFECT_SEGMENTS_MASK = 0x0530

# Default endpoint for manufacturer-specific writes
DEFAULT_ENDPOINT = 1

# Effect type enum values per device family
EFFECT_ENUM_T2: dict[str, int] = {
    "off": 0,
    "breathing": 1,
    "candlelight": 2,
    "fading": 3,
    "flash": 4,
}

EFFECT_ENUM_T1M: dict[str, int] = {
    "flow1": 0,
    "flow2": 1,
    "fading": 2,
    "hopping": 3,
    "breathing": 4,
    "rolling": 5,
}

EFFECT_ENUM_STRIP: dict[str, int] = {
    "breathing": 0,
    "rainbow1": 1,
    "chasing": 2,
    "flash": 3,
    "hopping": 4,
    "rainbow2": 5,
    "flicker": 6,
    "dash": 7,
}

# Device family classification by model ID
# T1M_MODELS is imported from const.py as a frozenset
T1_STRIP_MODELS = {MODEL_T1_STRIP}
T2_BULB_MODELS = {
    MODEL_T2_BULB_E26,
    MODEL_T2_BULB_E27,
    MODEL_T2_BULB_GU10_230V,
    MODEL_T2_BULB_GU10_110V,
}
T2_CCT_MODELS = {
    MODEL_T2_CCT_E26,
    MODEL_T2_CCT_E27,
    MODEL_T2_CCT_GU10_230V,
    MODEL_T2_CCT_GU10_110V,
}

def _resolve_zha_model(device: Any) -> str | None:
    """Resolve the canonical model ID for a ZHA device.

    ZHA v2 quirks can override device.model to a friendly name (e.g.,
    "Ceiling Light T1M" instead of "lumi.light.acn031"). This function
    checks the underlying zigpy device for the raw model identifier.

    Args:
        device: A ZHA device from the gateway

    Returns:
        Canonical model ID if supported, None otherwise
    """
    # First check the ZHA-reported model directly
    if device.model in SUPPORTED_MODELS:
        return device.model

    # Try the underlying zigpy device's raw model (not overridden by quirks)
    zigpy_device = getattr(device, "device", None)
    if zigpy_device is not None:
        raw_model = getattr(zigpy_device, "model", None)
        if raw_model and raw_model in SUPPORTED_MODELS:
            _LOGGER.debug(
                "Resolved ZHA quirk model %s -> %s via zigpy device",
                device.model,
                raw_model,
            )
            return raw_model

    return None

def _get_device_family(model_id: str) -> str | None:
    """Classify model ID into device family.

    Returns:
        One of "t1m", "strip", "t2_bulb", "t2_cct", or None if unknown.
    """
    if model_id in T1M_MODELS:
        return "t1m"
    if model_id in T1_STRIP_MODELS:
        return "strip"
    if model_id in T2_BULB_MODELS:
        return "t2_bulb"
    if model_id in T2_CCT_MODELS:
        return "t2_cct"
    return None

def _get_effect_enum(device_family: str) -> dict[str, int]:
    """Get effect name to Zigbee enum mapping for a device family."""
    match device_family:
        case "t2_bulb":
            return EFFECT_ENUM_T2
        case "t1m":
            return EFFECT_ENUM_T1M
        case "strip":
            return EFFECT_ENUM_STRIP
        case _:
            return {}

class ZHABackend:
    """ZHA backend implementing the DeviceBackend protocol.

    Communicates with Aqara lights by writing directly to the
    manufacturer-specific Zigbee cluster (0xFCC0) via the ZHA gateway.
    The AqaraLumiCluster quirk handles attribute types and manufacturer
    code, so callers pass plain Python values (int, float, bytes).
    """

    def __init__(
        self,
        hass: HomeAssistant,
        entry: AqaraLightingConfigEntry,
        entity_controller: EntityController | None = None,
    ) -> None:
        """Initialize the ZHA backend."""
        self.hass = hass
        self.entry = entry
        self._entity_controller = entity_controller
        self._entity_to_ieee: dict[str, str] = {}
        self._mapping_retry_task: asyncio.Task | None = None

    # --- Lifecycle ---

    async def async_setup(self) -> None:
        """Set up the ZHA backend: discover devices and map entities."""
        from homeassistant.components.zha.helpers import get_zha_gateway

        gateway = get_zha_gateway(self.hass)

        # Clear previous scan results so stale entries don't accumulate
        # if async_setup is called multiple times (e.g. on integration reload).
        self.entry.runtime_data.aqara_devices.clear()

        for ieee, device in gateway.devices.items():
            ieee_str = str(ieee)

            # Resolve model ID (handles ZHA v2 quirks that override model names)
            model_id = _resolve_zha_model(device)
            if not model_id:
                # Log Aqara devices that aren't in our supported list
                if device.manufacturer and "aqara" in device.manufacturer.lower():
                    _LOGGER.debug(
                        "Skipping Aqara device %s (model: %s, manufacturer: %s, ieee: %s) "
                        "- not in SUPPORTED_MODELS",
                        device.name,
                        device.model,
                        device.manufacturer,
                        ieee_str,
                    )
                continue

            aqara_device = AqaraDevice(
                identifier=ieee_str,
                name=device.name or ieee_str,
                model_id=model_id,
                manufacturer=device.manufacturer or "Aqara",
                backend_type="zha",
            )

            self.entry.runtime_data.aqara_devices[ieee_str] = aqara_device

            # Register in HA device registry
            device_registry = dr.async_get(self.hass)
            # sw_version is passed explicitly, including when None. A device
            # split from a pre-migration composite is a copy of it, so it
            # inherits ZHA's firmware string; identifier reconciliation does
            # not touch it. Passing it here keeps ours in step with ZHA's,
            # which sources the same zha_device.firmware_version.
            device_registry.async_get_or_create(
                config_entry_id=self.entry.entry_id,
                identifiers={(DOMAIN, ieee_str)},
                connections={(CONNECTION_ZIGBEE, ieee_str)},
                name=device.name or ieee_str,
                manufacturer=device.manufacturer or "Aqara",
                model=MODEL_FRIENDLY_NAMES.get(model_id, model_id),
                model_id=model_id,
                sw_version=getattr(device, "firmware_version", None),
                via_device_id=self._zha_via_device_id(device_registry, ieee_str),
            )

            _LOGGER.debug(
                "Discovered ZHA Aqara device %s (model: %s, zha_model: %s, ieee: %s)",
                device.name,
                model_id,
                device.model,
                ieee_str,
            )

        _LOGGER.info(
            "ZHA device discovery complete: found %d supported devices",
            len(self.entry.runtime_data.aqara_devices),
        )

        # Remove any devices that were previously registered but are no longer
        # present in the ZHA gateway (e.g. removed between HA restarts).
        seen_ieee = set(self.entry.runtime_data.aqara_devices.keys())
        self._remove_stale_devices(seen_ieee)

        self._update_entity_mapping()

        # After a ZHA reload, the gateway has devices but ZHA's entity
        # platform may take several seconds to create light entities.
        # Schedule a background retry if the initial mapping found nothing.
        if not self.entry.runtime_data.entity_mapping_ready:
            _LOGGER.info(
                "Found %d Aqara devices but no light entities yet, "
                "scheduling entity mapping retry",
                len(self.entry.runtime_data.aqara_devices),
            )
            self._schedule_mapping_retry()

    def _zha_config_entry_id(self) -> str | None:
        """Return the ZHA config entry id, or None if ZHA is not set up.

        Needed on HA 2026.8+ where device identifiers are unique per config
        entry, so looking a ZHA device up by identifier requires naming the
        entry that owns it.
        """
        zha_entries = self.hass.config_entries.async_entries("zha")
        return zha_entries[0].entry_id if zha_entries else None

    def _zha_via_device_id(
        self, device_registry: dr.DeviceRegistry, ieee_str: str
    ) -> str | None:
        """Return the device id of the ZHA device we shadow, if it is known.

        Since 2026.8 our device is a card of its own rather than part of the
        light's. Naming the ZHA device as our via device gives our card a
        "Connected via" link back to the light.

        None before 2026.8, where we merge into ZHA's device instead and a via
        link would point at ourselves. Also None when ZHA's own device is not
        registered yet: async_get_or_create raises DeviceInfoError for a
        via_device_id that is not a registered device, so the link cannot be
        guessed. Passing None also clears a link whose device has gone.
        """
        if not _SINGLE_CONFIG_ENTRY_REGISTRY:
            return None

        zha_entry_id = self._zha_config_entry_id()
        if zha_entry_id is None:
            return None

        zha_device = device_registry.async_get_device_by_identifier(
            ("zha", ieee_str), zha_entry_id
        )
        return zha_device.id if zha_device else None

    def _remove_stale_devices(self, seen_ieee: set[str]) -> None:
        """Remove devices no longer present in ZHA from the HA device registry."""
        device_reg = dr.async_get(self.hass)
        for device in list(dr.async_entries_for_config_entry(device_reg, self.entry.entry_id)):
            for identifier_domain, identifier_value in device.identifiers:
                if identifier_domain == DOMAIN:
                    if identifier_value not in seen_ieee:
                        if _SINGLE_CONFIG_ENTRY_REGISTRY:
                            # HA 2026.8+: the device is ours alone, so drop it.
                            device_reg.async_remove_device(device.id)
                        elif len(device.config_entries) > 1:
                            # Pre-2026.8: shared with ZHA, release only our
                            # claim so ZHA's device survives.
                            device_reg.async_update_device(
                                device.id,
                                remove_config_entry_id=self.entry.entry_id,
                            )
                        else:
                            device_reg.async_remove_device(device.id)
                        self.entry.runtime_data.aqara_devices.pop(identifier_value, None)
                    break

    def _update_entity_mapping(self) -> None:
        """Map HA light entities to ZHA Aqara devices via the device registry."""
        ent_reg = er.async_get(self.hass)
        dev_reg = dr.async_get(self.hass)

        self._entity_to_ieee.clear()
        mapped_count = 0

        zha_entry_id = self._zha_config_entry_id()

        for ieee_str, aqara_device in self.entry.runtime_data.aqara_devices.items():
            # ZHA registers devices with ("zha", ieee_str) identifiers
            if _SINGLE_CONFIG_ENTRY_REGISTRY and zha_entry_id is not None:
                # Identifiers are unique per config entry, so the lookup must
                # name ZHA's entry rather than searching globally.
                ha_device = dev_reg.async_get_device_by_identifier(
                    ("zha", ieee_str), zha_entry_id
                )
            else:
                ha_device = dev_reg.async_get_device(
                    identifiers={("zha", ieee_str)}
                )
            if not ha_device:
                _LOGGER.debug(
                    "No HA device found for ZHA device %s (%s)",
                    aqara_device.name,
                    ieee_str,
                )
                continue

            device_entities = er.async_entries_for_device(ent_reg, ha_device.id)
            for entity_entry in device_entities:
                if entity_entry.domain != LIGHT_DOMAIN:
                    continue

                self._entity_to_ieee[entity_entry.entity_id] = ieee_str

                # Update global entity routing for service dispatch
                if (
                    DOMAIN in self.hass.data
                    and "entity_routing" in self.hass.data[DOMAIN]
                ):
                    self.hass.data[DOMAIN]["entity_routing"][entity_entry.entity_id] = (
                        self.entry.entry_id
                    )

                mapped_count += 1
                _LOGGER.debug(
                    "Mapped entity %s to ZHA device %s",
                    entity_entry.entity_id,
                    aqara_device.name,
                )

        _LOGGER.info(
            "ZHA entity mapping complete: %d entities mapped to %d devices",
            mapped_count,
            len(self.entry.runtime_data.aqara_devices),
        )

        # Only mark as ready when entities are actually mapped (or no devices found).
        # After a ZHA reload, the gateway has devices but ZHA's entity platform
        # may not have finished creating light entities yet.
        if mapped_count > 0 or not self.entry.runtime_data.aqara_devices:
            self.entry.runtime_data.entity_mapping_ready = True
        else:
            self.entry.runtime_data.entity_mapping_ready = False

    def _schedule_mapping_retry(self) -> None:
        """Start the mapping retry unless one is already running."""
        if self._mapping_retry_task is not None and not self._mapping_retry_task.done():
            return
        # Background: this must not hold up config entry setup, and a retry
        # left on the pending task list would block anything waiting on it
        # for the full retry window.
        self._mapping_retry_task = self.hass.async_create_background_task(
            self._async_retry_entity_mapping(),
            "aqara_advanced_lighting_zha_entity_mapping_retry",
        )

    async def _async_retry_entity_mapping(self) -> None:
        """Retry entity mapping after ZHA finishes creating entities.

        After a ZHA reload, the gateway has devices immediately but ZHA's
        light platform may take several seconds to create entities. Retries
        every 5 seconds for up to 30 seconds.
        """
        max_retries = 6
        for attempt in range(1, max_retries + 1):
            await asyncio.sleep(5)
            self._update_entity_mapping()
            if self.entry.runtime_data.entity_mapping_ready:
                _LOGGER.info("Entity mapping succeeded on retry %d", attempt)
                return

        _LOGGER.warning(
            "Entity mapping found no light entities after %d retries "
            "(%d devices discovered). ZHA entities may not have been "
            "created yet -- try reloading the integration",
            max_retries,
            len(self.entry.runtime_data.aqara_devices),
        )
        # Mark ready to prevent infinite loading state in the frontend
        self.entry.runtime_data.entity_mapping_ready = True

    async def async_shutdown(self) -> None:
        """Shut down the backend and clean up resources."""
        if self._mapping_retry_task is not None:
            self._mapping_retry_task.cancel()
            self._mapping_retry_task = None
        self._entity_to_ieee.clear()
        _LOGGER.debug("ZHA backend shut down")

    # --- Discovery and mapping ---

    def is_entity_supported(self, entity_id: str) -> tuple[bool, str]:
        """Check if an entity is a supported Aqara device."""
        ieee_str = self._entity_to_ieee.get(entity_id)
        if not ieee_str:
            return False, "not_mapped_to_zha"

        device = self.entry.runtime_data.aqara_devices.get(ieee_str)
        if not device:
            return False, "zha_device_not_found"

        if device.model_id not in SUPPORTED_MODELS:
            return False, f"unsupported_model_{device.model_id}"

        return True, ""

    def get_device_for_entity(self, entity_id: str) -> AqaraDevice | None:
        """Get the Aqara device for a Home Assistant entity."""
        ieee_str = self._entity_to_ieee.get(entity_id)
        if not ieee_str:
            return None
        return self.entry.runtime_data.aqara_devices.get(ieee_str)

    def get_all_devices(self) -> dict[str, AqaraDevice]:
        """Get all discovered Aqara devices."""
        return dict(self.entry.runtime_data.aqara_devices)

    @property
    def entity_mapping_ready(self) -> bool:
        """Whether entity-to-device mapping has completed."""
        return self.entry.runtime_data.entity_mapping_ready

    # --- Zigbee cluster write helpers ---

    def _get_aqara_cluster(
        self,
        ieee_str: str,
        endpoint_id: int = DEFAULT_ENDPOINT,
    ) -> Any | None:
        """Get the Aqara manufacturer-specific cluster for a device.

        Returns the quirk-defined 0xFCC0 cluster instance which handles
        attribute types and manufacturer code automatically.
        """
        from homeassistant.components.zha.helpers import get_zha_gateway
        from zigpy.types import EUI64

        gateway = get_zha_gateway(self.hass)
        ieee = EUI64.convert(ieee_str)
        zha_device = gateway.devices.get(ieee)
        if not zha_device:
            return None

        endpoint = zha_device.device.endpoints.get(endpoint_id)
        if not endpoint:
            return None

        return endpoint.in_clusters.get(CLUSTER_MANU_SPECIFIC_LUMI)

    def _get_strip_segment_count(self, ieee_str: str) -> int:
        """Get T1 Strip segment count from the cluster attribute cache.

        The raw length attribute (0x051B) stores segment count as uint8
        (5 segments per meter). This matches the Z2M converter which uses
        scale: 5 to convert between raw segments and user-facing meters.

        Falls back to 10 (2 meters) if the attribute has not been read yet.
        """
        cluster = self._get_aqara_cluster(ieee_str)
        if cluster:
            try:
                raw_length = cluster.get(0x051B)
                if raw_length is not None and int(raw_length) > 0:
                    count = int(raw_length)
                    _LOGGER.debug(
                        "T1 Strip %s segment count from cluster: %d",
                        ieee_str,
                        count,
                    )
                    return count
            except (ValueError, TypeError, KeyError):
                pass
        _LOGGER.debug(
            "T1 Strip %s: length not in cluster cache, "
            "defaulting to 10 segments (2 meters)",
            ieee_str,
        )
        return 10

    async def _write_cluster_attribute(
        self,
        ieee_str: str,
        attribute: int,
        value: Any,
        endpoint_id: int = DEFAULT_ENDPOINT,
    ) -> bool:
        """Write a single attribute to the Aqara manufacturer-specific cluster.

        Uses the quirk-defined cluster which handles manufacturer code
        and type serialization automatically via write_attributes().

        Returns True on success, False on failure.
        """
        cluster = self._get_aqara_cluster(ieee_str, endpoint_id)
        if not cluster:
            _LOGGER.error(
                "Aqara cluster not found for write: %s endpoint %d",
                ieee_str,
                endpoint_id,
            )
            return False

        try:
            await cluster.write_attributes({attribute: value})
            _LOGGER.debug(
                "Wrote attribute 0x%04X to %s: %s",
                attribute,
                ieee_str,
                value
                if not isinstance(value, (bytes, bytearray))
                else f"<{len(value)} bytes>",
            )
            return True
        except Exception:
            _LOGGER.exception(
                "Failed to write attribute 0x%04X to %s", attribute, ieee_str
            )
            return False

    async def _write_effect_attributes(
        self,
        ieee_str: str,
        effect_type_value: int,
        speed: int,
        colors_payload: bytes,
        segments_mask: bytes | None = None,
        device_model: str | None = None,
    ) -> None:
        """Write all effect attributes in the correct order.

        T2: segments -> type+speed (combined) -> colors.
            Speed restarts effect with default colors, so colors must
            come last to overwrite. Type and speed are combined into a
            single ZCL frame to save one Zigbee round-trip.
        T1M/T1 Strip: segments -> type -> colors+speed (combined).
            Colors before speed for faster rendering. Speed is a live
            adjustment so it can share a frame with colors.
        """
        from .const import T2_RGB_MODELS

        if segments_mask is not None:
            await self._write_cluster_attribute(
                ieee_str, ATTR_EFFECT_SEGMENTS_MASK, segments_mask
            )

        cluster = self._get_aqara_cluster(ieee_str)
        if not cluster:
            _LOGGER.error("Aqara cluster not found for effect write: %s", ieee_str)
            return

        try:
            if device_model and device_model in T2_RGB_MODELS:
                # T2: type+speed combined, then colors separately
                await cluster.write_attributes(
                    {
                        ATTR_EFFECT_TYPE: effect_type_value,
                        ATTR_EFFECT_SPEED: speed,
                    }
                )
                await cluster.write_attributes(
                    {
                        ATTR_EFFECT_COLORS: colors_payload,
                    }
                )
            else:
                # T1M/T1 Strip: type first, then colors+speed combined
                await cluster.write_attributes(
                    {
                        ATTR_EFFECT_TYPE: effect_type_value,
                    }
                )
                await cluster.write_attributes(
                    {
                        ATTR_EFFECT_COLORS: colors_payload,
                        ATTR_EFFECT_SPEED: speed,
                    }
                )
        except Exception:
            _LOGGER.exception("Failed to write effect attributes to %s", ieee_str)

    async def async_write_effect_speed(
        self,
        entity_id: str,
        speed: int,
    ) -> None:
        """Write effect_speed independently without restarting the effect.

        Writes only ATTR_EFFECT_SPEED (0x0520) — no type or colors.
        Safe for T1M and T1 Strip (live adjustment, no restart).
        NOT safe for T2 (restarts effect and wipes colors).

        Args:
            entity_id: The HA entity ID
            speed: Speed value 1-100
        """
        speed = max(1, min(100, speed))
        ieee_str = self._entity_to_ieee.get(entity_id)
        if not ieee_str:
            _LOGGER.warning("No IEEE address for entity %s", entity_id)
            return

        cluster = self._get_aqara_cluster(ieee_str)
        if not cluster:
            _LOGGER.error("Aqara cluster not found for speed write: %s", ieee_str)
            return

        try:
            await cluster.write_attributes({ATTR_EFFECT_SPEED: speed})
        except Exception:
            _LOGGER.exception("Failed to write effect speed to %s", ieee_str)

    # --- Effects ---

    async def async_send_effect(
        self,
        entity_id: str,
        effect: DynamicEffect,
    ) -> None:
        """Send a dynamic effect to a device."""
        ieee_str = self._entity_to_ieee.get(entity_id)
        if not ieee_str:
            _LOGGER.warning("Cannot send effect: entity %s not mapped", entity_id)
            return

        device = self.entry.runtime_data.aqara_devices.get(ieee_str)
        if not device:
            _LOGGER.warning("Cannot send effect: device not found for %s", entity_id)
            return

        device_family = _get_device_family(device.model_id)
        if not device_family:
            _LOGGER.warning(
                "Cannot send effect: unknown device family for model %s",
                device.model_id,
            )
            return

        effect_enum = _get_effect_enum(device_family)
        effect_type_value = effect_enum.get(effect.effect.value)
        if effect_type_value is None:
            _LOGGER.warning(
                "Unsupported effect %s for device family %s",
                effect.effect.value,
                device_family,
            )
            return

        # Build effect colors payload
        colors_payload = build_effect_colors_payload(effect.effect_colors)

        # For T1 Strip, build effect segments mask if specified
        segments_mask: bytes | None = None
        if device_family == "strip" and effect.effect_segments is not None:
            max_segments = self._get_strip_segment_count(ieee_str)
            seg_nums = parse_segment_range(effect.effect_segments, max_segments)
            if seg_nums:
                segments_mask = build_effect_segments_mask(seg_nums, max_segments)

        await self._write_effect_attributes(
            ieee_str,
            effect_type_value,
            effect.effect_speed,
            colors_payload,
            segments_mask,
            device_model=device.model_id,
        )

        _LOGGER.debug(
            "Sent effect %s to %s (speed: %d, colors: %d)",
            effect.effect.value,
            entity_id,
            effect.effect_speed,
            len(effect.effect_colors),
        )

    async def async_send_batch_effects(
        self,
        entity_effects: list[tuple[str, DynamicEffect]],
    ) -> None:
        """Send dynamic effects to multiple devices in parallel."""
        tasks = [
            self.async_send_effect(entity_id, effect)
            for entity_id, effect in entity_effects
        ]
        await asyncio.gather(*tasks, return_exceptions=True)

    async def async_stop_effect(self, entity_id: str) -> None:
        """Stop the active effect by sending a solid RGB color.

        Overrides the dynamic effect by setting the light to a neutral
        warm white, matching the MQTT backend behavior.
        """
        context = (
            self._entity_controller.create_context()
            if self._entity_controller
            else None
        )

        await self.hass.services.async_call(
            "light",
            "turn_on",
            {"entity_id": entity_id, "rgb_color": [255, 200, 150]},
            blocking=True,
            context=context,
        )

        _LOGGER.debug("Stopped effect on %s by setting solid RGB color", entity_id)

    # --- Segments ---

    async def async_send_segment_pattern(
        self,
        entity_id: str,
        segments: list[SegmentColor],
    ) -> None:
        """Send a segment color pattern to a device.

        Groups segments by color, builds binary packets per group, and writes
        each packet to the appropriate cluster attribute with a delay between
        groups (matching Z2M converter behavior).
        """
        ieee_str = self._entity_to_ieee.get(entity_id)
        if not ieee_str:
            _LOGGER.warning("Cannot send segments: entity %s not mapped", entity_id)
            return

        device = self.entry.runtime_data.aqara_devices.get(ieee_str)
        if not device:
            _LOGGER.warning("Cannot send segments: device not found for %s", entity_id)
            return

        device_family = _get_device_family(device.model_id)
        if device_family not in ("t1m", "strip"):
            _LOGGER.warning(
                "Segments not supported for device family %s", device_family
            )
            return

        from .light_capabilities import get_segment_count

        static_count = get_segment_count(device.model_id)
        if static_count:
            max_segments = static_count
        else:
            # T1 Strip: variable segment count based on strip length
            max_segments = self._get_strip_segment_count(ieee_str)

        # Group segments by (color, brightness) to minimize cluster writes
        groups: dict[tuple[int, int, int, int], list[int]] = {}
        for sc in segments:
            seg_nums = parse_segment_range(sc.segment, max_segments)
            key = (sc.color.r, sc.color.g, sc.color.b, sc.brightness or 254)
            groups.setdefault(key, []).extend(seg_nums)

        attr_id = ATTR_T1M_SEGMENT if device_family == "t1m" else ATTR_STRIP_SEGMENT

        for (r, g, b, brightness), seg_nums in groups.items():
            color = RGBColor(r=r, g=g, b=b)

            if device_family == "t1m":
                payload = build_t1m_segment_packet(seg_nums, color, max_segments)
            else:
                payload = build_strip_segment_packet(
                    seg_nums, color, max_segments, brightness
                )

            await self._write_cluster_attribute(ieee_str, attr_id, payload)

        _LOGGER.debug(
            "Sent segment pattern to %s: %d color groups", entity_id, len(groups)
        )

    async def async_send_batch_segments(
        self,
        entity_segments: list[tuple[str, list[SegmentColor]]],
    ) -> None:
        """Send segment patterns to multiple devices in parallel."""
        tasks = [
            self.async_send_segment_pattern(entity_id, segs)
            for entity_id, segs in entity_segments
        ]
        await asyncio.gather(*tasks, return_exceptions=True)

    # --- CCT (uses shared transition logic from transition_utils) ---

    async def async_publish_cct_step(
        self,
        entity_id: str,
        color_temp_kelvin: int,
        brightness: int,
        transition: float,
        stop_event: asyncio.Event | None = None,
    ) -> bool:
        """Apply a CCT step using the shared transition algorithm."""
        callback = make_service_apply_callback(self.hass, self._entity_controller)
        return await apply_cct_step(
            self.hass,
            self,
            entity_id,
            color_temp_kelvin,
            brightness,
            transition,
            callback,
            stop_event,
        )

    async def async_turn_off_light(self, entity_id: str) -> None:
        """Turn off a light using HA light service."""
        await turn_off_light(self.hass, entity_id, self._entity_controller)

    # --- Music sync (T1 Strip only) ---

    async def async_send_music_sync(
        self,
        entity_id: str,
        enabled: bool,
        sensitivity: str,
        effect: str,
    ) -> None:
        """Send music sync configuration to a T1 Strip device.

        Writes audio enable, effect, and sensitivity attributes to the
        manufacturer-specific cluster. Enable is written first, then
        effect and sensitivity when enabling.

        Args:
            entity_id: The Home Assistant entity ID
            enabled: Whether to enable or disable audio-reactive mode
            sensitivity: Audio sensitivity level ("low" or "high")
            effect: Audio effect type ("random", "blink", "rainbow", "wave")
        """
        ieee_str = self._entity_to_ieee.get(entity_id)
        if not ieee_str:
            _LOGGER.warning("Cannot send music sync: entity %s not mapped", entity_id)
            return

        await self._write_cluster_attribute(
            ieee_str, ATTR_AUDIO_ENABLE, 1 if enabled else 0
        )

        if enabled:
            effect_value = MUSIC_SYNC_EFFECT_ENUM.get(effect, 0)
            sensitivity_value = MUSIC_SYNC_SENSITIVITY_ENUM.get(sensitivity, 0)

            await self._write_cluster_attribute(
                ieee_str, ATTR_AUDIO_EFFECT, effect_value
            )
            await self._write_cluster_attribute(
                ieee_str, ATTR_AUDIO_SENSITIVITY, sensitivity_value
            )

        _LOGGER.debug(
            "Sent music sync to %s: enabled=%s, effect=%s, sensitivity=%s",
            entity_id,
            enabled,
            effect,
            sensitivity,
        )

    async def async_stop_music_sync(self, entity_id: str) -> None:
        """Stop music sync on a T1 Strip device.

        Args:
            entity_id: The Home Assistant entity ID
        """
        ieee_str = self._entity_to_ieee.get(entity_id)
        if not ieee_str:
            _LOGGER.warning("Cannot stop music sync: entity %s not mapped", entity_id)
            return

        await self._write_cluster_attribute(ieee_str, ATTR_AUDIO_ENABLE, 0)

        _LOGGER.debug("Stopped music sync on %s", entity_id)

    # --- Device-specific ---
