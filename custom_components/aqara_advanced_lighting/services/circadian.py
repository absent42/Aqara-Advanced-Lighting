"""Circadian mode service handlers."""

import logging

from homeassistant.core import HomeAssistant, ServiceCall
from homeassistant.exceptions import HomeAssistantError, ServiceValidationError

from ..const import (
    ATTR_PRESET,
    CCT_MODE_SCHEDULE,
    CCT_MODE_SOLAR,
    DATA_CIRCADIAN_MANAGER,
    DATA_ENTITY_CONTROLLER,
    DOMAIN,
    PRESET_TYPE_CCT_SEQUENCE,
)
from ..presets import CCT_SEQUENCE_PRESETS
from ..preset_store import get_preset_store
from ..sun_utils import SolarStep
from ._helpers import (
    _build_schedule_sequence,
    _get_any_cct_manager,
    _resolve_entity_ids,
)

from homeassistant.const import ATTR_ENTITY_ID

_LOGGER = logging.getLogger(__name__)

async def handle_resume_entity_control(hass: HomeAssistant, call: ServiceCall) -> None:
    """Handle resume_entity_control service call.

    Resumes control of entities that were paused due to external changes.
    """
    entity_ids = _resolve_entity_ids(hass, call.data[ATTR_ENTITY_ID])

    entity_controller = hass.data[DOMAIN].get(DATA_ENTITY_CONTROLLER)
    if not entity_controller:
        raise HomeAssistantError("Entity controller not initialized")

    for entity_id in entity_ids:
        resumed = await entity_controller.resume_entity(entity_id)
        if not resumed:
            _LOGGER.debug(
                "Entity %s was not externally paused, nothing to resume",
                entity_id,
            )

async def handle_start_circadian_mode(hass: HomeAssistant, call: ServiceCall) -> None:
    """Handle start_circadian_mode service call."""
    entity_ids = _resolve_entity_ids(hass, call.data[ATTR_ENTITY_ID])
    preset_name: str | None = call.data.get(ATTR_PRESET)

    # Resolve preset data from user presets first, then built-in
    preset_data = None
    if preset_name:
        preset_store = get_preset_store(hass)
        if preset_store:
            preset_data = preset_store.get_preset_by_name(
                PRESET_TYPE_CCT_SEQUENCE, preset_name
            )
        if not preset_data:
            preset_data = CCT_SEQUENCE_PRESETS.get(preset_name)
        if not preset_data:
            raise ServiceValidationError(
                translation_domain=DOMAIN,
                translation_key="invalid_preset",
                translation_placeholders={"preset": preset_name},
            )

    mode = preset_data.get("mode") if preset_data else None

    if preset_data and mode == CCT_MODE_SCHEDULE:
        # Schedule mode presets route through the CCT sequence manager
        schedule_steps_data = preset_data.get("schedule_steps", [])
        if not schedule_steps_data:
            raise ServiceValidationError(
                translation_domain=DOMAIN,
                translation_key="schedule_steps_required",
            )
        sequence = _build_schedule_sequence(
            schedule_steps_data,
            auto_resume_delay=preset_data.get("auto_resume_delay", 0),
        )
        manager_pair = _get_any_cct_manager(hass)
        if not manager_pair:
            raise HomeAssistantError(
                "No integration instance available. "
                "Please ensure at least one Aqara Advanced Lighting "
                "instance is configured."
            )
        cct_manager, _ = manager_pair

        # Stop conflicting continuous actions
        entity_controller = hass.data[DOMAIN].get(DATA_ENTITY_CONTROLLER)
        if entity_controller:
            for entity_id in entity_ids:
                await entity_controller.stop_all_for_entity(entity_id)

        await cct_manager.start_synchronized_group(
            entity_ids, sequence, preset_name,
        )
        _LOGGER.info(
            "Started schedule sequence via circadian service for %d entities",
            len(entity_ids),
        )
        return

    # Solar mode - use circadian manager for passive overlay
    circadian_mgr = hass.data.get(DOMAIN, {}).get(DATA_CIRCADIAN_MANAGER)
    if not circadian_mgr:
        _LOGGER.warning("Circadian manager not initialized")
        return

    if preset_data:
        if mode != CCT_MODE_SOLAR:
            raise ServiceValidationError(
                translation_domain=DOMAIN,
                translation_key="invalid_solar_preset",
                translation_placeholders={"preset": preset_name or ""},
            )
        solar_steps = [
            SolarStep(
                sun_elevation=s["sun_elevation"],
                color_temp=s["color_temp"],
                brightness=s["brightness"],
                phase=s.get("phase", "any"),
            )
            for s in preset_data["solar_steps"]
        ]
    else:
        solar_steps_data = call.data.get("solar_steps", [])
        if not solar_steps_data:
            raise ServiceValidationError(
                translation_domain=DOMAIN,
                translation_key="solar_steps_required",
            )
        solar_steps = [
            SolarStep(
                sun_elevation=s["sun_elevation"],
                color_temp=s["color_temp"],
                brightness=s["brightness"],
                phase=s.get("phase", "any"),
            )
            for s in solar_steps_data
        ]

    for entity_id in entity_ids:
        circadian_mgr.start_circadian(entity_id, solar_steps, preset_name)

async def handle_stop_circadian_mode(hass: HomeAssistant, call: ServiceCall) -> None:
    """Handle stop_circadian_mode service call."""
    entity_ids = _resolve_entity_ids(hass, call.data[ATTR_ENTITY_ID])

    circadian_mgr = hass.data.get(DOMAIN, {}).get(DATA_CIRCADIAN_MANAGER)
    if not circadian_mgr:
        return

    for entity_id in entity_ids:
        circadian_mgr.stop_circadian(entity_id)
