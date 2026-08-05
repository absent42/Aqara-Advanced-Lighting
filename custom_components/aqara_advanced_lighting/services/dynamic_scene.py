"""Dynamic scene service handlers."""

import logging
from typing import Any

from homeassistant.core import HomeAssistant, ServiceCall
from homeassistant.exceptions import HomeAssistantError, ServiceValidationError

from ..const import (
    ATTR_END_BEHAVIOR,
    ATTR_LOOP_COUNT,
    ATTR_LOOP_MODE,
    ATTR_PRESET,
    ATTR_RESTORE_STATE,
    AUDIO_COLOR_ADVANCE_ON_ONSET,
    DATA_ENTITY_CONTROLLER,
    DATA_PRESET_STORE,
    DATA_USER_PREFERENCES_STORE,
    DEFAULT_AUDIO_DETECTION_MODE,
    DEFAULT_AUDIO_FREQUENCY_ZONE,
    DEFAULT_AUDIO_PREDICTION_AGGRESSIVENESS,
    DEFAULT_AUDIO_SENSITIVITY,
    AUDIO_SILENCE_SLOW_CYCLE,
    DEFAULT_AUDIO_RESPONSE_CURVE,
    DEFAULT_AUDIO_TRANSITION_SPEED,
    DEFAULT_DYNAMIC_SCENE_HOLD_TIME,
    DEFAULT_DYNAMIC_SCENE_TRANSITION_TIME,
    DEFAULT_LATENCY_COMPENSATION_MS,
    DISTRIBUTION_SHUFFLE_ROTATE,
    DOMAIN,
    PRESET_TYPE_DYNAMIC_SCENE,
)
from ..models import DynamicScene, DynamicSceneColor
from ..presets import DYNAMIC_SCENE_PRESETS
from ._helpers import (
    _get_dynamic_scene_manager,
    _is_valid_light_entity,
    _resolve_entity_ids,
)

from homeassistant.const import ATTR_ENTITY_ID

_LOGGER = logging.getLogger(__name__)


def _resolve_audio_entity_fallback(
    preset: dict[str, Any], default_audio_entity: str
) -> str | None:
    """Resolve audio_entity for a preset, falling back to user default.

    Returns the audio entity to use, or None if the preset is not audio-reactive
    or no default is configured.
    """
    # If preset has an explicit audio_entity, use it
    explicit = preset.get("audio_entity")
    if explicit:
        return explicit

    # Only apply fallback for audio-reactive presets
    if "audio_color_advance" not in preset:
        return None

    # Use default if configured
    return default_audio_entity or None


async def handle_start_dynamic_scene(hass: HomeAssistant, call: ServiceCall) -> None:
    """Handle start_dynamic_scene service call.

    Dynamic scenes use HA service calls (light.turn_on with xy_color) and
    work with both Aqara and generic RGB-capable lights.
    """
    entity_ids: list[str] = call.data[ATTR_ENTITY_ID]
    preset_name: str | None = call.data.get(ATTR_PRESET)
    # scene_name is used for display tracking when colors are passed
    # directly (not via preset lookup)
    display_name: str | None = preset_name or call.data.get("scene_name")

    # Resolve groups to individual entities
    entity_ids = _resolve_entity_ids(hass, entity_ids)

    # Filter to valid light entities (Aqara or generic)
    valid_entity_ids = [
        eid for eid in entity_ids if _is_valid_light_entity(hass, eid)
    ]
    if not valid_entity_ids:
        raise ServiceValidationError(
            translation_domain=DOMAIN,
            translation_key="unsupported_entities",
            translation_placeholders={"entity_list": ", ".join(entity_ids)},
        )

    manager = _get_dynamic_scene_manager(hass)

    # Build scene from preset or manual parameters
    if preset_name:
        preset: dict[str, Any] | None = None

        # Check built-in presets first (by key)
        if preset_name in DYNAMIC_SCENE_PRESETS:
            preset = DYNAMIC_SCENE_PRESETS[preset_name]
        else:
            # Check user-created presets (by name, then by ID)
            preset_store = hass.data[DOMAIN].get(DATA_PRESET_STORE)
            if not preset_store:
                raise HomeAssistantError("Preset store not initialized")

            preset = preset_store.get_preset_by_name(
                PRESET_TYPE_DYNAMIC_SCENE, preset_name
            )
            if not preset:
                preset = preset_store.get_preset(
                    PRESET_TYPE_DYNAMIC_SCENE, preset_name
                )

        if not preset:
            raise ServiceValidationError(
                f"Dynamic scene preset '{preset_name}' not found",
                translation_domain=DOMAIN,
                translation_key="preset_not_found",
            )

        # Resolve default audio entity from user preferences
        default_audio_entity = ""
        prefs_store = hass.data.get(DOMAIN, {}).get(DATA_USER_PREFERENCES_STORE)
        if prefs_store:
            user_id = call.context.user_id or "default"
            prefs = prefs_store.get_preferences(user_id)
            default_audio_entity = prefs.get("audio_override_entity", "")

        colors = [
            DynamicSceneColor(
                x=c["x"],
                y=c["y"],
                brightness_pct=c.get("brightness_pct", 100),
            )
            for c in preset["colors"]
        ]

        scene = DynamicScene(
            colors=colors,
            transition_time=preset["transition_time"],
            hold_time=preset["hold_time"],
            distribution_mode=preset["distribution_mode"],
            offset_delay=preset.get("offset_delay", 0.0),
            random_order=preset.get("random_order", False),
            loop_mode=preset["loop_mode"],
            loop_count=preset.get("loop_count"),
            end_behavior=preset["end_behavior"],
            audio_entity=_resolve_audio_entity_fallback(preset, default_audio_entity),
            audio_sensitivity=preset.get("audio_sensitivity", DEFAULT_AUDIO_SENSITIVITY),
            audio_brightness_curve=preset.get("audio_brightness_curve", "linear"),
            audio_brightness_min=preset.get("audio_brightness_min", 30),
            audio_brightness_max=preset.get("audio_brightness_max", 100),
            audio_color_advance=preset.get("audio_color_advance", AUDIO_COLOR_ADVANCE_ON_ONSET),
            audio_transition_speed=preset.get("audio_transition_speed", DEFAULT_AUDIO_TRANSITION_SPEED),
            audio_detection_mode=preset.get("audio_detection_mode", DEFAULT_AUDIO_DETECTION_MODE),
            audio_frequency_zone=preset.get("audio_frequency_zone", DEFAULT_AUDIO_FREQUENCY_ZONE),
            audio_silence_behavior=preset.get(
                "audio_silence_behavior", AUDIO_SILENCE_SLOW_CYCLE
            ),
            audio_prediction_aggressiveness=preset.get("audio_prediction_aggressiveness", DEFAULT_AUDIO_PREDICTION_AGGRESSIVENESS),
            audio_latency_compensation_ms=preset.get("audio_latency_compensation_ms", DEFAULT_LATENCY_COMPENSATION_MS),
            audio_color_by_frequency=preset.get("audio_color_by_frequency", False),
            audio_rolloff_brightness=preset.get("audio_rolloff_brightness", False),
        )
        if scene.audio_entity and not hass.states.get(scene.audio_entity):
            _LOGGER.warning(
                "Audio entity '%s' not found, falling back to timed mode",
                scene.audio_entity,
            )
            scene.audio_entity = None
    else:
        # Build from manual parameters
        colors_data = call.data.get("colors")
        if not colors_data:
            raise ServiceValidationError(
                "Either preset or colors must be provided",
                translation_domain=DOMAIN,
                translation_key="missing_scene_source",
            )

        colors = [
            DynamicSceneColor(
                x=c["x"],
                y=c["y"],
                brightness_pct=c.get("brightness_pct", 100),
            )
            for c in colors_data
        ]

        scene = DynamicScene(
            colors=colors,
            transition_time=call.data.get(
                "transition_time", DEFAULT_DYNAMIC_SCENE_TRANSITION_TIME
            ),
            hold_time=call.data.get("hold_time", DEFAULT_DYNAMIC_SCENE_HOLD_TIME),
            distribution_mode=call.data.get(
                "distribution_mode", DISTRIBUTION_SHUFFLE_ROTATE
            ),
            offset_delay=call.data.get("offset_delay", 0.0),
            random_order=call.data.get("random_order", False),
            loop_mode=call.data.get(ATTR_LOOP_MODE, "continuous"),
            loop_count=call.data.get(ATTR_LOOP_COUNT),
            end_behavior=call.data.get(ATTR_END_BEHAVIOR, "maintain"),
            audio_entity=call.data.get("audio_entity"),
            audio_sensitivity=call.data.get("audio_sensitivity", DEFAULT_AUDIO_SENSITIVITY),
            audio_brightness_curve=call.data.get("audio_brightness_curve", DEFAULT_AUDIO_RESPONSE_CURVE),
            audio_brightness_min=call.data.get("audio_brightness_min", 30),
            audio_brightness_max=call.data.get("audio_brightness_max", 100),
            audio_color_advance=call.data.get("audio_color_advance", AUDIO_COLOR_ADVANCE_ON_ONSET),
            audio_transition_speed=call.data.get("audio_transition_speed", DEFAULT_AUDIO_TRANSITION_SPEED),
            audio_detection_mode=call.data.get("audio_detection_mode", DEFAULT_AUDIO_DETECTION_MODE),
            audio_frequency_zone=call.data.get("audio_frequency_zone", DEFAULT_AUDIO_FREQUENCY_ZONE),
            audio_silence_behavior=call.data.get("audio_silence_behavior", AUDIO_SILENCE_SLOW_CYCLE),
            audio_prediction_aggressiveness=call.data.get("audio_prediction_aggressiveness", DEFAULT_AUDIO_PREDICTION_AGGRESSIVENESS),
            audio_latency_compensation_ms=call.data.get("audio_latency_compensation_ms", DEFAULT_LATENCY_COMPENSATION_MS),
            audio_color_by_frequency=call.data.get("audio_color_by_frequency", False),
            audio_rolloff_brightness=call.data.get("audio_rolloff_brightness", False),
        )

    # Stop all conflicting continuous actions on these entities
    entity_controller = hass.data[DOMAIN].get(DATA_ENTITY_CONTROLLER)
    if entity_controller:
        for entity_id in valid_entity_ids:
            await entity_controller.stop_all_for_entity(entity_id)

    static = call.data.get("static", False)
    if static:
        await manager.apply_static_scene(valid_entity_ids, scene, display_name)
    else:
        await manager.start_scene(valid_entity_ids, scene, display_name)

async def handle_stop_dynamic_scene(hass: HomeAssistant, call: ServiceCall) -> None:
    """Handle stop_dynamic_scene service call."""
    entity_ids: list[str] | None = call.data.get(ATTR_ENTITY_ID)
    restore_state: bool | None = call.data.get(ATTR_RESTORE_STATE)
    manager = _get_dynamic_scene_manager(hass)

    # Capture affected entities before stopping (scene may remove them)
    if entity_ids:
        affected = list(entity_ids)
    else:
        affected = [
            eid
            for scene_info in manager.get_active_scenes().values()
            for eid in scene_info.entity_ids
        ]

    await manager.stop_scene(
        entity_ids=entity_ids, restore_override=restore_state
    )

    # Resume preset-paused solar/schedule CCT for affected entities
    entity_controller = hass.data[DOMAIN].get(DATA_ENTITY_CONTROLLER)
    if entity_controller:
        for entity_id in affected:
            await entity_controller.check_and_resume_solar(entity_id)

async def handle_pause_dynamic_scene(hass: HomeAssistant, call: ServiceCall) -> None:
    """Handle pause_dynamic_scene service call."""
    entity_ids: list[str] = call.data[ATTR_ENTITY_ID]
    manager = _get_dynamic_scene_manager(hass)
    manager.pause_scene(entity_ids)

async def handle_resume_dynamic_scene(hass: HomeAssistant, call: ServiceCall) -> None:
    """Handle resume_dynamic_scene service call."""
    entity_ids: list[str] = call.data[ATTR_ENTITY_ID]
    manager = _get_dynamic_scene_manager(hass)
    manager.resume_scene(entity_ids)
