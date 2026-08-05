"""Per-user preferences storage for Aqara Advanced Lighting."""

import logging
from typing import Any, TypedDict

from homeassistant.core import HomeAssistant

from .base_store import BaseStore
from .const import DOMAIN, MAX_COLOR_HISTORY_SIZE

_LOGGER = logging.getLogger(__name__)

class _Unset:
    """Sentinel for distinguishing 'not provided' from None."""

_UNSET = _Unset()

STORAGE_KEY = f"{DOMAIN}.user_preferences"
STORAGE_VERSION = 1

class UserPreferences(TypedDict):
    """Per-user preferences."""

    color_history: list[dict[str, float]]
    sort_preferences: dict[str, str]
    collapsed_sections: dict[str, bool]
    include_all_lights: bool
    favorite_presets: list[dict[str, str]]
    static_scene_mode: bool
    distribution_mode_override: str | None
    brightness_override: int | None
    use_audio_reactive: bool
    audio_override_entity: str
    audio_override_sensitivity: int
    audio_override_color_advance: str
    audio_override_transition_speed: int
    audio_override_brightness_curve: str | None
    audio_override_brightness_min: int
    audio_override_brightness_max: int
    audio_override_detection_mode: str
    audio_override_frequency_zone: bool
    audio_override_silence_behavior: str
    audio_override_prediction_aggressiveness: int
    audio_override_latency_compensation_ms: int
    audio_override_color_by_frequency: bool
    audio_override_rolloff_brightness: bool
    use_effect_audio_reactive: bool
    effect_audio_override_sensitivity: int
    effect_audio_override_speed_enabled: bool
    effect_audio_override_brightness_enabled: bool
    effect_audio_override_silence_behavior: str
    hidden_builtin_presets: list[dict[str, str]]
    selected_entities: list[str]
    active_favorite_id: str | None

DEFAULT_PREFERENCES: UserPreferences = {
    "color_history": [],
    "sort_preferences": {},
    "collapsed_sections": {},
    "include_all_lights": False,
    "favorite_presets": [],
    "static_scene_mode": False,
    "distribution_mode_override": None,
    "brightness_override": None,
    "use_audio_reactive": False,
    "audio_override_entity": "",
    "audio_override_sensitivity": 50,
    "audio_override_color_advance": "on_onset",
    "audio_override_transition_speed": 50,
    "audio_override_brightness_curve": "linear",
    "audio_override_brightness_min": 30,
    "audio_override_brightness_max": 100,
    "audio_override_detection_mode": "spectral_flux",
    "audio_override_frequency_zone": False,
    "audio_override_silence_behavior": "slow_cycle",
    "audio_override_prediction_aggressiveness": 50,
    "audio_override_latency_compensation_ms": 150,
    "audio_override_color_by_frequency": False,
    "audio_override_rolloff_brightness": False,
    "use_effect_audio_reactive": False,
    "effect_audio_override_sensitivity": 50,
    "effect_audio_override_speed_enabled": True,
    "effect_audio_override_brightness_enabled": True,
    "effect_audio_override_silence_behavior": "hold",
    "hidden_builtin_presets": [],
    "selected_entities": [],
    "active_favorite_id": None,
}

GLOBAL_PREFERENCES_KEY = "__global__"

class GlobalPreferences(TypedDict):
    """Integration-wide preferences (not per-user)."""

    ignore_external_changes: bool
    software_transition_entities: list[str]
    override_control_mode: str
    bare_turn_on_only: bool
    detect_non_ha_changes: bool
    entity_audio_config: dict[str, dict[str, str]]

DEFAULT_GLOBAL_PREFERENCES: GlobalPreferences = {
    "ignore_external_changes": False,
    "software_transition_entities": [],
    "override_control_mode": "pause_changed",
    "bare_turn_on_only": False,
    "detect_non_ha_changes": False,
    "entity_audio_config": {},
}

class UserPreferencesStore(BaseStore[dict[str, UserPreferences]]):
    """Manages per-user preferences storage, keyed by HA user ID."""

    def __init__(self, hass: HomeAssistant) -> None:
        """Initialize the user preferences store."""
        super().__init__(hass, STORAGE_VERSION, STORAGE_KEY, {})
        self._global_data: GlobalPreferences = {**DEFAULT_GLOBAL_PREFERENCES}

    async def async_load(self) -> None:
        """Load preferences from storage, extracting global prefs from reserved key."""
        data = await self._store.async_load()
        if data is not None:
            self._data = data
            raw_global = self._data.pop(GLOBAL_PREFERENCES_KEY, None)
            if raw_global and isinstance(raw_global, dict):
                self._global_data = {
                    key: raw_global.get(key, default)
                    for key, default in DEFAULT_GLOBAL_PREFERENCES.items()
                }
            else:
                self._global_data = {**DEFAULT_GLOBAL_PREFERENCES}
        else:
            self._data = {}
            self._global_data = {**DEFAULT_GLOBAL_PREFERENCES}
        _LOGGER.debug("Loaded preferences for %d users", len(self._data))

    async def async_save(self) -> None:
        """Save preferences to storage, merging global prefs into reserved key."""
        save_data = {**self._data, GLOBAL_PREFERENCES_KEY: self._global_data}
        await self._store.async_save(save_data)
        _LOGGER.debug("Saved user preferences")

    def get_preferences(self, user_id: str) -> UserPreferences:
        """Get preferences for a user.

        Args:
            user_id: The Home Assistant user ID.

        Returns:
            User preferences or defaults for new users.
        """
        if user_id in self._data:
            # Ensure all keys are present (handles forward compatibility)
            prefs = self._data[user_id]
            return {
                "color_history": prefs.get("color_history", []),
                "sort_preferences": prefs.get("sort_preferences", {}),
                "collapsed_sections": prefs.get("collapsed_sections", {}),
                "include_all_lights": prefs.get("include_all_lights", False),
                "favorite_presets": prefs.get("favorite_presets", []),
                "static_scene_mode": prefs.get("static_scene_mode", False),
                "distribution_mode_override": prefs.get("distribution_mode_override"),
                "brightness_override": prefs.get("brightness_override"),
                "use_audio_reactive": prefs.get("use_audio_reactive", False),
                "audio_override_entity": prefs.get("audio_override_entity", ""),
                "audio_override_sensitivity": prefs.get("audio_override_sensitivity", 50),
                "audio_override_color_advance": prefs.get("audio_override_color_advance", "on_onset"),
                "audio_override_transition_speed": prefs.get("audio_override_transition_speed", 50),
                "audio_override_brightness_curve": prefs.get("audio_override_brightness_curve", "linear"),
                "audio_override_brightness_min": prefs.get("audio_override_brightness_min", 30),
                "audio_override_brightness_max": prefs.get("audio_override_brightness_max", 100),
                "audio_override_detection_mode": prefs.get("audio_override_detection_mode", "spectral_flux"),
                "audio_override_frequency_zone": prefs.get("audio_override_frequency_zone", False),
                "audio_override_silence_behavior": prefs.get("audio_override_silence_behavior", "slow_cycle"),
                "audio_override_prediction_aggressiveness": prefs.get("audio_override_prediction_aggressiveness", 50),
                "audio_override_latency_compensation_ms": prefs.get("audio_override_latency_compensation_ms", 150),
                "audio_override_color_by_frequency": prefs.get("audio_override_color_by_frequency", False),
                "audio_override_rolloff_brightness": prefs.get("audio_override_rolloff_brightness", False),
                "use_effect_audio_reactive": prefs.get("use_effect_audio_reactive", False),
                "effect_audio_override_sensitivity": prefs.get("effect_audio_override_sensitivity", 50),
                "effect_audio_override_speed_enabled": prefs.get("effect_audio_override_speed_enabled", True),
                "effect_audio_override_brightness_enabled": prefs.get("effect_audio_override_brightness_enabled", True),
                "effect_audio_override_silence_behavior": prefs.get("effect_audio_override_silence_behavior", "hold"),
                "hidden_builtin_presets": prefs.get("hidden_builtin_presets", []),
                "selected_entities": prefs.get("selected_entities", []),
                "active_favorite_id": prefs.get("active_favorite_id"),
            }
        return {**DEFAULT_PREFERENCES}

    async def update_color_history(
        self, user_id: str, color_history: list[dict[str, float]]
    ) -> UserPreferences:
        """Replace the user's color history.

        The frontend sends the full list after each change. The backend
        just persists it, trimming to the maximum size.

        Args:
            user_id: The Home Assistant user ID.
            color_history: Full color history list, most recent first.

        Returns:
            The updated preferences.
        """
        if user_id not in self._data:
            self._data[user_id] = {**DEFAULT_PREFERENCES}

        # Trim to max size
        self._data[user_id]["color_history"] = color_history[:MAX_COLOR_HISTORY_SIZE]
        await self.async_save()

        _LOGGER.debug(
            "Updated color history for user %s (%d colors)",
            user_id,
            len(self._data[user_id]["color_history"]),
        )
        return self.get_preferences(user_id)

    async def update_sort_preferences(
        self, user_id: str, sort_preferences: dict[str, str]
    ) -> UserPreferences:
        """Replace the user's sort preferences.

        Args:
            user_id: The Home Assistant user ID.
            sort_preferences: Section ID to sort option mapping.

        Returns:
            The updated preferences.
        """
        if user_id not in self._data:
            self._data[user_id] = {**DEFAULT_PREFERENCES}

        self._data[user_id]["sort_preferences"] = sort_preferences
        await self.async_save()

        _LOGGER.debug("Updated sort preferences for user %s", user_id)
        return self.get_preferences(user_id)

    async def update_preferences(
        self,
        user_id: str,
        color_history: list[dict[str, float]] | None = None,
        sort_preferences: dict[str, str] | None = None,
        collapsed_sections: dict[str, bool] | None = None,
        include_all_lights: bool | None = None,
        favorite_presets: list[dict[str, str]] | None = None,
        static_scene_mode: bool | None = None,
        distribution_mode_override: str | None | _Unset = _UNSET,
        brightness_override: int | None | _Unset = _UNSET,
        use_audio_reactive: bool | None | _Unset = _UNSET,
        audio_override_entity: str | None | _Unset = _UNSET,
        audio_override_sensitivity: int | None | _Unset = _UNSET,
        audio_override_color_advance: str | None | _Unset = _UNSET,
        audio_override_transition_speed: int | None | _Unset = _UNSET,
        audio_override_brightness_curve: str | None | _Unset = _UNSET,
        audio_override_brightness_min: int | None | _Unset = _UNSET,
        audio_override_brightness_max: int | None | _Unset = _UNSET,
        audio_override_detection_mode: str | None | _Unset = _UNSET,
        audio_override_frequency_zone: bool | None | _Unset = _UNSET,
        audio_override_silence_behavior: str | None | _Unset = _UNSET,
        audio_override_prediction_aggressiveness: int | None | _Unset = _UNSET,
        audio_override_latency_compensation_ms: int | None | _Unset = _UNSET,
        audio_override_color_by_frequency: bool | None | _Unset = _UNSET,
        audio_override_rolloff_brightness: bool | None | _Unset = _UNSET,
        use_effect_audio_reactive: bool | None | _Unset = _UNSET,
        effect_audio_override_sensitivity: int | None | _Unset = _UNSET,
        effect_audio_override_speed_enabled: bool | None | _Unset = _UNSET,
        effect_audio_override_brightness_enabled: bool | None | _Unset = _UNSET,
        effect_audio_override_silence_behavior: str | None | _Unset = _UNSET,
        hidden_builtin_presets: list[dict[str, str]] | None = None,
        selected_entities: list[str] | None = None,
        active_favorite_id: str | None | _Unset = _UNSET,
    ) -> UserPreferences:
        """Partially update a user's preferences.

        Only the provided fields are updated. Omitted fields remain unchanged.

        Args:
            user_id: The Home Assistant user ID.
            color_history: New color history list, or None to leave unchanged.
            sort_preferences: New sort preferences, or None to leave unchanged.
            collapsed_sections: New collapsed section state, or None to leave unchanged.
            include_all_lights: Whether to show all lights in selector, or None to leave unchanged.
            favorite_presets: Favorite preset references, or None to leave unchanged.
            static_scene_mode: Whether to apply scenes statically, or None to leave unchanged.
            distribution_mode_override: Distribution mode override string, None to clear, or _UNSET to leave unchanged.
            brightness_override: Brightness override value (1-100), None to clear, or _UNSET to leave unchanged.
            use_audio_reactive: Whether audio-reactive override is enabled, or _UNSET to leave unchanged.
            audio_override_entity: Audio sensor entity ID, or _UNSET to leave unchanged.
            audio_override_sensitivity: Audio sensitivity (1-100), or _UNSET to leave unchanged.
            audio_override_color_advance: Color advance mode string, or _UNSET to leave unchanged.
            audio_override_transition_speed: Transition speed (1-100), or _UNSET to leave unchanged.
            audio_override_brightness_curve: Brightness response curve, None to disable, or _UNSET to leave unchanged.
            audio_override_brightness_min: Minimum brightness percent (1-100), or _UNSET to leave unchanged.
            audio_override_brightness_max: Maximum brightness percent (1-100), or _UNSET to leave unchanged.
            audio_override_detection_mode: Detection mode string, or _UNSET to leave unchanged.
            audio_override_frequency_zone: Whether frequency zone distribution is enabled, or _UNSET to leave unchanged.
            audio_override_silence_behavior: Silence behavior enum string, or _UNSET to leave unchanged.
            audio_override_prediction_aggressiveness: Prediction aggressiveness (1-100), or _UNSET to leave unchanged.
            audio_override_latency_compensation_ms: Latency compensation in ms, or _UNSET to leave unchanged.
            audio_override_color_by_frequency: Whether color-by-frequency is enabled, or _UNSET to leave unchanged.
            audio_override_rolloff_brightness: Whether rolloff brightness is enabled, or _UNSET to leave unchanged.
            use_effect_audio_reactive: Whether effect audio-reactive is enabled, or _UNSET to leave unchanged.
            effect_audio_override_sensitivity: Effect audio sensitivity (1-100), or _UNSET to leave unchanged.
            effect_audio_override_speed_enabled: Whether speed responds to audio in effects, or _UNSET to leave unchanged.
            effect_audio_override_brightness_enabled: Whether brightness responds to audio in effects, or _UNSET to leave unchanged.
            effect_audio_override_silence_behavior: Effect silence behavior enum string, or _UNSET to leave unchanged.
            hidden_builtin_presets: Hidden builtin preset references, or None to leave unchanged.
            selected_entities: Selected entity IDs, or None to leave unchanged.
            active_favorite_id: Active favorite ID, None to clear, or _UNSET to leave unchanged.

        Returns:
            The full updated preferences.
        """
        if user_id not in self._data:
            self._data[user_id] = {**DEFAULT_PREFERENCES}

        if color_history is not None:
            self._data[user_id]["color_history"] = color_history[
                :MAX_COLOR_HISTORY_SIZE
            ]

        if sort_preferences is not None:
            self._data[user_id]["sort_preferences"] = sort_preferences

        if collapsed_sections is not None:
            self._data[user_id]["collapsed_sections"] = collapsed_sections

        if include_all_lights is not None:
            self._data[user_id]["include_all_lights"] = include_all_lights

        if favorite_presets is not None:
            self._data[user_id]["favorite_presets"] = favorite_presets

        if static_scene_mode is not None:
            self._data[user_id]["static_scene_mode"] = static_scene_mode

        if not isinstance(distribution_mode_override, _Unset):
            self._data[user_id]["distribution_mode_override"] = distribution_mode_override

        if not isinstance(brightness_override, _Unset):
            self._data[user_id]["brightness_override"] = brightness_override

        if not isinstance(use_audio_reactive, _Unset):
            self._data[user_id]["use_audio_reactive"] = use_audio_reactive

        if not isinstance(audio_override_entity, _Unset):
            self._data[user_id]["audio_override_entity"] = audio_override_entity

        if not isinstance(audio_override_sensitivity, _Unset):
            self._data[user_id]["audio_override_sensitivity"] = audio_override_sensitivity

        if not isinstance(audio_override_color_advance, _Unset):
            self._data[user_id]["audio_override_color_advance"] = audio_override_color_advance

        if not isinstance(audio_override_transition_speed, _Unset):
            self._data[user_id]["audio_override_transition_speed"] = audio_override_transition_speed

        if not isinstance(audio_override_brightness_curve, _Unset):
            self._data[user_id]["audio_override_brightness_curve"] = audio_override_brightness_curve

        if not isinstance(audio_override_brightness_min, _Unset):
            self._data[user_id]["audio_override_brightness_min"] = audio_override_brightness_min

        if not isinstance(audio_override_brightness_max, _Unset):
            self._data[user_id]["audio_override_brightness_max"] = audio_override_brightness_max

        if not isinstance(audio_override_detection_mode, _Unset):
            self._data[user_id]["audio_override_detection_mode"] = audio_override_detection_mode

        if not isinstance(audio_override_frequency_zone, _Unset):
            self._data[user_id]["audio_override_frequency_zone"] = audio_override_frequency_zone

        if not isinstance(audio_override_silence_behavior, _Unset):
            self._data[user_id]["audio_override_silence_behavior"] = audio_override_silence_behavior

        if not isinstance(audio_override_prediction_aggressiveness, _Unset):
            self._data[user_id]["audio_override_prediction_aggressiveness"] = audio_override_prediction_aggressiveness

        if not isinstance(audio_override_latency_compensation_ms, _Unset):
            self._data[user_id]["audio_override_latency_compensation_ms"] = audio_override_latency_compensation_ms

        if not isinstance(audio_override_color_by_frequency, _Unset):
            self._data[user_id]["audio_override_color_by_frequency"] = audio_override_color_by_frequency

        if not isinstance(audio_override_rolloff_brightness, _Unset):
            self._data[user_id]["audio_override_rolloff_brightness"] = audio_override_rolloff_brightness

        if not isinstance(use_effect_audio_reactive, _Unset):
            self._data[user_id]["use_effect_audio_reactive"] = use_effect_audio_reactive

        if not isinstance(effect_audio_override_sensitivity, _Unset):
            self._data[user_id]["effect_audio_override_sensitivity"] = effect_audio_override_sensitivity

        if not isinstance(effect_audio_override_speed_enabled, _Unset):
            self._data[user_id]["effect_audio_override_speed_enabled"] = effect_audio_override_speed_enabled

        if not isinstance(effect_audio_override_brightness_enabled, _Unset):
            self._data[user_id]["effect_audio_override_brightness_enabled"] = effect_audio_override_brightness_enabled

        if not isinstance(effect_audio_override_silence_behavior, _Unset):
            self._data[user_id]["effect_audio_override_silence_behavior"] = effect_audio_override_silence_behavior

        if hidden_builtin_presets is not None:
            self._data[user_id]["hidden_builtin_presets"] = hidden_builtin_presets

        if selected_entities is not None:
            self._data[user_id]["selected_entities"] = selected_entities

        if not isinstance(active_favorite_id, _Unset):
            self._data[user_id]["active_favorite_id"] = active_favorite_id

        await self.async_save()

        _LOGGER.debug("Updated preferences for user %s", user_id)
        return self.get_preferences(user_id)

    def get_global_preferences(self) -> GlobalPreferences:
        """Get integration-wide global preferences."""
        return {**self._global_data}

    def get_global_preference(self, key: str) -> Any:
        """Get a single global preference value."""
        return self._global_data.get(key, DEFAULT_GLOBAL_PREFERENCES.get(key))

    async def update_global_preferences(
        self,
        ignore_external_changes: bool | None = None,
        software_transition_entities: list[str] | None = None,
        override_control_mode: str | None = None,
        bare_turn_on_only: bool | None = None,
        detect_non_ha_changes: bool | None = None,
        entity_audio_config: dict[str, dict[str, str]] | None = None,
    ) -> GlobalPreferences:
        """Update integration-wide global preferences.

        Only provided fields are updated. Omitted fields remain unchanged.
        """
        if ignore_external_changes is not None:
            self._global_data["ignore_external_changes"] = ignore_external_changes

        if software_transition_entities is not None:
            self._global_data["software_transition_entities"] = software_transition_entities

        if override_control_mode is not None:
            self._global_data["override_control_mode"] = override_control_mode

        if bare_turn_on_only is not None:
            self._global_data["bare_turn_on_only"] = bare_turn_on_only

        if detect_non_ha_changes is not None:
            self._global_data["detect_non_ha_changes"] = detect_non_ha_changes

        if entity_audio_config is not None:
            self._global_data["entity_audio_config"] = entity_audio_config

        await self.async_save()
        _LOGGER.debug("Updated global preferences")
        return self.get_global_preferences()
