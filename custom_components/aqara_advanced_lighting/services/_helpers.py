"""Helper functions for Aqara Advanced Lighting services."""

import asyncio
import logging
from typing import Any

from homeassistant.core import Context, HomeAssistant
from homeassistant.exceptions import HomeAssistantError, ServiceValidationError

from ..backend_protocol import DeviceBackend
from ..const import (
    DATA_CCT_SEQUENCE_MANAGER,
    DATA_DYNAMIC_SCENE_MANAGER,
    DATA_ENTITY_CONTROLLER,
    DATA_SEGMENT_ZONE_STORE,
    DOMAIN,
    MODEL_T1_STRIP,
    T1_STRIP_DEFAULT_SEGMENT_COUNT,
    T1_STRIP_SEGMENTS_PER_METER,
)
from ..light_capabilities import get_segment_count
from ..models import (
    CCTSequence,
    RGBColor,
    XYColor,
)
from ..state_manager import StateManager
from ..sun_utils import ScheduleStep, SolarStep

_LOGGER = logging.getLogger(__name__)

def _get_context_and_record(hass: HomeAssistant, entity_id: str) -> Context | None:
    """Get integration context for tagging service calls as internal.

    Call before any hass.services.async_call targeting a controlled entity
    to ensure the entity controller recognizes it as an internal command.
    """
    ec = hass.data[DOMAIN].get(DATA_ENTITY_CONTROLLER)
    if ec:
        return ec.create_context()
    return None

def _build_solar_sequence(
    solar_steps_data: list[dict[str, Any]],
    auto_resume_delay: float = 0,
) -> CCTSequence:
    """Build a solar CCTSequence from raw step data."""
    solar_steps = [
        SolarStep(
            sun_elevation=s["sun_elevation"],
            color_temp=s["color_temp"],
            brightness=s["brightness"],
            phase=s.get("phase", "any"),
        )
        for s in solar_steps_data
    ]
    return CCTSequence(
        steps=[],
        loop_mode="continuous",
        end_behavior="maintain",
        mode="solar",
        solar_steps=solar_steps,
        auto_resume_delay=max(0, auto_resume_delay),
    )

def _build_schedule_sequence(
    schedule_steps_data: list[dict[str, Any]],
    auto_resume_delay: float = 0,
) -> CCTSequence:
    """Build a schedule CCTSequence from raw step data."""
    schedule_steps = [
        ScheduleStep(
            time=s["time"],
            color_temp=s["color_temp"],
            brightness=s["brightness"],
            label=s.get("label", ""),
        )
        for s in schedule_steps_data
    ]
    return CCTSequence(
        steps=[],
        loop_mode="continuous",
        end_behavior="maintain",
        mode="schedule",
        schedule_steps=schedule_steps,
        auto_resume_delay=max(0, auto_resume_delay),
    )

def _normalize_color_to_rgb(color_data: dict[str, Any] | list[int]) -> RGBColor:
    """Convert color input (XY, RGB dict, or RGB list) to RGBColor.

    Accepts three formats for backward compatibility and XY support:
    - XY format: {"x": 0.5, "y": 0.5}
    - RGB dict: {"r": 255, "g": 0, "b": 0}
    - RGB list: [255, 0, 0]

    Args:
        color_data: Color in any supported format

    Returns:
        RGBColor object suitable for MQTT

    Raises:
        ServiceValidationError: If color format is invalid
    """
    if isinstance(color_data, list):
        # RGB list format [r, g, b]
        if len(color_data) == 3:
            return RGBColor(r=color_data[0], g=color_data[1], b=color_data[2])
        raise ServiceValidationError(
            translation_domain=DOMAIN,
            translation_key="rgb_list_invalid_length",
            translation_placeholders={"count": str(len(color_data))},
        )

    if isinstance(color_data, dict):
        # Check for XY format
        if "x" in color_data and "y" in color_data:
            # XY format - convert to RGB
            xy_color = XYColor.from_dict(color_data)
            return xy_color.to_rgb()

        # Check for RGB dict format
        if "r" in color_data and "g" in color_data and "b" in color_data:
            # RGB dict format - use directly
            return RGBColor.from_dict(color_data)

        raise ServiceValidationError(
            translation_domain=DOMAIN,
            translation_key="color_dict_invalid_format",
        )

    raise ServiceValidationError(
        translation_domain=DOMAIN,
        translation_key="color_invalid_type",
        translation_placeholders={"type": str(type(color_data).__name__)},
    )

def _get_instance_for_entity(
    hass: HomeAssistant, entity_id: str
) -> tuple[str | None, dict | None]:
    """Get the config entry ID and instance data for an entity."""
    from ..entity_routing import get_instance_for_entity

    return get_instance_for_entity(hass, entity_id)

def _get_backend_for_entity(
    hass: HomeAssistant, entity_id: str
) -> DeviceBackend | None:
    """Get the backend for an entity.

    Args:
        hass: Home Assistant instance
        entity_id: Entity ID to look up

    Returns:
        Backend for the instance that owns this entity, or None
    """
    _, instance_data = _get_instance_for_entity(hass, entity_id)
    if instance_data:
        return instance_data.get("backend")
    return None

def _get_instance_components_for_entity(
    hass: HomeAssistant, entity_id: str
) -> tuple[DeviceBackend, StateManager, str]:
    """Get backend, state manager, and entry_id for a specific entity.

    Args:
        hass: Home Assistant instance
        entity_id: Entity ID to look up

    Returns:
        Tuple of (backend, state_manager, entry_id)

    Raises:
        ServiceValidationError: If entity not found in any instance
    """
    entry_id, instance_data = _get_instance_for_entity(hass, entity_id)

    if not entry_id or not instance_data:
        # List all configured instances for helpful error message
        entries = hass.data.get(DOMAIN, {}).get("entries", {})
        instance_names = []
        for eid, idata in entries.items():
            backend = idata.get("backend")
            if backend:
                backend_type = getattr(
                    getattr(backend, "entry", None),
                    "runtime_data",
                    None,
                )
                if backend_type:
                    instance_names.append(
                        f"{backend_type.backend_type}:{backend_type.z2m_base_topic or eid}"
                    )

        raise ServiceValidationError(
            translation_domain=DOMAIN,
            translation_key="entity_not_found_in_any_instance",
            translation_placeholders={
                "entity_id": entity_id,
                "instances": ", ".join(instance_names) if instance_names else "none",
            },
        )

    backend = instance_data.get("backend")
    state_manager = instance_data.get("state_manager")

    if not backend or not state_manager:
        raise ServiceValidationError(
            translation_domain=DOMAIN,
            translation_key="components_not_initialized",
        )

    return backend, state_manager, entry_id

def _get_zones_for_device(
    hass: HomeAssistant, ieee_address: str
) -> dict[str, str] | None:
    """Get segment zones for a device, formatted for parse_segment_range().

    Args:
        hass: Home Assistant instance.
        ieee_address: Device IEEE address.

    Returns:
        Dict of lowercased zone name to segment range string, or None.
    """
    if DOMAIN not in hass.data:
        return None
    zone_store = hass.data[DOMAIN].get(DATA_SEGMENT_ZONE_STORE)
    if not zone_store:
        return None
    zones = zone_store.get_zones_for_resolution(ieee_address)
    return zones if zones else None

def _resolve_entity_ids(hass: HomeAssistant, entity_ids: list[str]) -> list[str]:
    """Resolve entity IDs, expanding light groups (including nested) to lights.

    Args:
        hass: Home Assistant instance
        entity_ids: List of entity IDs (may include groups)

    Returns:
        List of individual light entity IDs, deduplicated in order
    """
    resolved: list[str] = []
    seen: set[str] = set()

    def _add(entity_id: str) -> None:
        if entity_id in seen:
            return
        seen.add(entity_id)
        state = hass.states.get(entity_id)
        if (
            state
            and state.domain == "light"
            and (members := state.attributes.get("entity_id"))
        ):
            _LOGGER.debug(
                "Resolved group %s to %d entities: %s",
                entity_id,
                len(members),
                members,
            )
            for member in members:
                _add(member)
            return
        # Single light, or unknown entity kept for later validation
        resolved.append(entity_id)

    for entity_id in entity_ids:
        _add(entity_id)
    return resolved

def _validate_supported_entities(hass: HomeAssistant, entity_ids: list[str]) -> None:
    """Validate that all entities are supported Aqara devices.

    Checks across all configured Z2M instances to find each entity.

    Args:
        hass: Home Assistant instance
        entity_ids: List of entity IDs to validate

    Raises:
        ServiceValidationError: If any entity is not supported
    """
    unsupported_entities = []

    for entity_id in entity_ids:
        # Try to find entity in any instance
        backend = _get_backend_for_entity(hass, entity_id)
        if backend:
            is_supported, reason = backend.is_entity_supported(entity_id)
            if not is_supported:
                unsupported_entities.append({"entity_id": entity_id, "reason": reason})
        else:
            # Entity not found in any instance
            unsupported_entities.append(
                {"entity_id": entity_id, "reason": "not_found_in_any_instance"}
            )

    if unsupported_entities:
        # Build detailed error message
        entity_list = ", ".join([e["entity_id"] for e in unsupported_entities])

        raise ServiceValidationError(
            translation_domain=DOMAIN,
            translation_key="unsupported_entities",
            translation_placeholders={"entity_list": entity_list},
        )

def _is_aqara_entity(hass: HomeAssistant, entity_id: str) -> bool:
    """Check if an entity is a supported Aqara device.

    Args:
        hass: Home Assistant instance
        entity_id: Entity ID to check

    Returns:
        True if entity is a supported Aqara device
    """
    backend = _get_backend_for_entity(hass, entity_id)
    if not backend:
        return False
    is_supported, _ = backend.is_entity_supported(entity_id)
    return is_supported

def _is_valid_light_entity(hass: HomeAssistant, entity_id: str) -> bool:
    """Check if an entity is a valid light entity in Home Assistant.

    Args:
        hass: Home Assistant instance
        entity_id: Entity ID to check

    Returns:
        True if entity exists and is a light
    """
    state = hass.states.get(entity_id)
    return state is not None and state.domain == "light"

def _get_any_cct_manager(
    hass: HomeAssistant,
) -> tuple[Any, StateManager] | None:
    """Get any available CCT sequence manager and state manager.

    Used for generic (non-Aqara) lights that don't belong to a specific
    Z2M instance. CCT sequences use HA service calls so any manager works.

    Returns:
        Tuple of (cct_manager, state_manager) or None if unavailable
    """
    if DOMAIN not in hass.data:
        return None
    for instance_data in hass.data[DOMAIN].get("entries", {}).values():
        cct_manager = instance_data.get(DATA_CCT_SEQUENCE_MANAGER)
        state_manager = instance_data.get("state_manager")
        if cct_manager and state_manager:
            return cct_manager, state_manager
    return None

def _find_cct_manager_for_entity(hass: HomeAssistant, entity_id: str) -> Any | None:
    """Find the CCT manager that has an active sequence for an entity.

    Searches all instances including generic routing. Used by stop/pause/resume
    handlers where the entity may be running on any manager.

    Args:
        hass: Home Assistant instance
        entity_id: Entity ID to find manager for

    Returns:
        CCT sequence manager or None
    """
    if DOMAIN not in hass.data:
        return None
    for instance_data in hass.data[DOMAIN].get("entries", {}).values():
        cct_manager = instance_data.get(DATA_CCT_SEQUENCE_MANAGER)
        if cct_manager and cct_manager.is_sequence_running(entity_id):
            return cct_manager
    return None

def _get_dynamic_scene_manager(hass: HomeAssistant) -> Any:
    """Get the dynamic scene manager from any available config entry.

    Dynamic scenes use HA service calls so any instance's manager works.

    Returns:
        Dynamic scene manager instance

    Raises:
        HomeAssistantError: If no manager is available
    """
    for instance_data in hass.data.get(DOMAIN, {}).get("entries", {}).values():
        manager = instance_data.get(DATA_DYNAMIC_SCENE_MANAGER)
        if manager:
            return manager
    raise HomeAssistantError("Dynamic scene manager not initialized")

def _get_t1_strip_length_from_state(
    hass: HomeAssistant, entity_id: str
) -> float | None:
    """Try to get T1 Strip length from the main entity's attributes."""
    state = hass.states.get(entity_id)
    if state and state.attributes:
        length = state.attributes.get("length")
        if length is not None:
            return float(length)
    return None

def _get_t1_strip_length_from_sibling(
    hass: HomeAssistant, entity_id: str
) -> float | None:
    """Try to get T1 Strip length from a sibling number/sensor entity.

    Builds the expected entity ID from the light entity name,
    e.g. light.t1_led_strip -> number.t1_led_strip_length.
    """
    base_name = entity_id.split(".", 1)[-1] if "." in entity_id else entity_id

    for domain in ("number", "sensor"):
        length_entity_id = f"{domain}.{base_name}_length"
        length_state = hass.states.get(length_entity_id)
        if length_state and length_state.state not in ("unknown", "unavailable"):
            try:
                length = float(length_state.state)
                _LOGGER.debug(
                    "Found T1 Strip length from entity %s: %s meters",
                    length_entity_id,
                    length,
                )
                return length
            except (ValueError, TypeError):
                pass
    return None

def _get_t1_strip_length_from_registry(
    hass: HomeAssistant, entity_id: str
) -> float | None:
    """Try to get T1 Strip length by searching the device registry.

    Finds all entities on the same device and looks for one with
    "length" in its entity_id or unique_id.
    """
    from homeassistant.helpers import entity_registry as er

    entity_reg = er.async_get(hass)
    light_entry = entity_reg.async_get(entity_id)
    if not light_entry or not light_entry.device_id:
        return None

    for entry in er.async_entries_for_device(entity_reg, light_entry.device_id):
        if entry.domain not in ("number", "sensor"):
            continue
        if "length" not in entry.entity_id.lower() and not (
            entry.unique_id and "length" in entry.unique_id.lower()
        ):
            continue
        length_state = hass.states.get(entry.entity_id)
        if length_state and length_state.state not in ("unknown", "unavailable"):
            try:
                length = float(length_state.state)
                _LOGGER.debug(
                    "Found T1 Strip length from device entity %s: %s meters",
                    entry.entity_id,
                    length,
                )
                return length
            except (ValueError, TypeError):
                pass
    return None

# Cache for T1 Strip segment counts (entity_id -> segment_count).
# Cleared only on HA restart; strip length rarely changes at runtime.
_t1_strip_segment_cache: dict[str, int] = {}

def _get_actual_segment_count(
    hass: HomeAssistant, entity_id: str, model_id: str
) -> int:
    """Get actual segment count for a device, considering T1 Strip variable length.

    For T1 Strip, attempts to read the length attribute from entity state.
    Falls back to reasonable defaults if unavailable. Results for T1 Strip
    are cached since physical strip length rarely changes.
    """
    base_count = get_segment_count(model_id)
    if base_count != 0:
        return base_count

    if model_id == MODEL_T1_STRIP:
        if entity_id in _t1_strip_segment_cache:
            return _t1_strip_segment_cache[entity_id]

        # Try each lookup strategy in order of cost
        length_meters = (
            _get_t1_strip_length_from_state(hass, entity_id)
            or _get_t1_strip_length_from_sibling(hass, entity_id)
            or _get_t1_strip_length_from_registry(hass, entity_id)
        )

        if length_meters is not None:
            try:
                segment_count = int(float(length_meters) * T1_STRIP_SEGMENTS_PER_METER)
                _LOGGER.debug(
                    "T1 Strip %s: %s meters = %s segments",
                    entity_id,
                    length_meters,
                    segment_count,
                )
                _t1_strip_segment_cache[entity_id] = segment_count
                return segment_count
            except (ValueError, TypeError):
                pass

        _LOGGER.debug(
            "Could not determine T1 Strip length for %s, defaulting to %d segments",
            entity_id,
            T1_STRIP_DEFAULT_SEGMENT_COUNT,
        )
        return T1_STRIP_DEFAULT_SEGMENT_COUNT

    # Unknown device default
    return 20

async def _ensure_light_on(
    hass: HomeAssistant,
    entity_id: str,
    turn_on_if_off: bool,
) -> bool:
    """Ensure light is on if requested, checking current state first.

    Returns:
        True if light is on or was turned on, False if light is off and turn_on_if_off is False
    """
    if not turn_on_if_off:
        return True  # Don't check or turn on, proceed regardless

    # Check current light state
    state = hass.states.get(entity_id)
    if not state:
        _LOGGER.warning("Could not get state for %s", entity_id)
        return True  # Proceed anyway

    # If light is already on, no need to turn it on
    if state.state == "on":
        _LOGGER.debug("Light %s is already on", entity_id)
        return True

    # Light is off, turn it on using HA service (not direct MQTT)
    _LOGGER.info("Turning on light %s before applying effect", entity_id)
    try:
        await hass.services.async_call(
            "light",
            "turn_on",
            {"entity_id": entity_id},
            blocking=True,
            context=_get_context_and_record(hass, entity_id),
        )

        # Give the light a moment to turn on (blocking=True already confirms dispatch)
        await asyncio.sleep(0.25)

        return True
    except Exception as ex:
        _LOGGER.warning("Failed to turn on light %s: %s", entity_id, ex)
        return True  # Proceed anyway
