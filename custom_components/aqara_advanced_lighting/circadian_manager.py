"""Passive circadian overlay manager.

Applies sun-calculated CCT/brightness when lights turn on.
Does not actively transition lights - only reacts to state change events.
"""

import logging
from dataclasses import dataclass
from typing import Any

from homeassistant.const import EVENT_STATE_CHANGED, STATE_OFF, STATE_ON
from homeassistant.core import Context, Event, HomeAssistant, callback

from .capability_profile import clamp_color_temp_to_state
from .const import INTEGRATION_CONTEXT_PARENT_ID
from .sun_utils import SolarStep, get_sun_state, interpolate_solar_values

_LOGGER = logging.getLogger(__name__)

@dataclass
class CircadianEntry:
    """Tracks a circadian overlay for one entity."""

    entity_id: str
    solar_steps: list[SolarStep]
    preset_name: str | None = None
    unsub: Any = None  # Callable to remove state listener

class CircadianManager:
    """Manages passive circadian overlays for light entities."""

    def __init__(self, hass: HomeAssistant) -> None:
        """Initialize the circadian manager."""
        self._hass = hass
        self._entries: dict[str, CircadianEntry] = {}

    def start_circadian(
        self,
        entity_id: str,
        solar_steps: list[SolarStep],
        preset_name: str | None = None,
    ) -> None:
        """Start a circadian overlay for an entity."""
        # Stop existing overlay if any
        if entity_id in self._entries:
            self.stop_circadian(entity_id)

        entry = CircadianEntry(
            entity_id=entity_id,
            solar_steps=solar_steps,
            preset_name=preset_name,
        )

        @callback
        def _state_changed(event: Event) -> None:
            if event.data.get("entity_id") != entity_id:
                return

            new_state = event.data.get("new_state")
            old_state = event.data.get("old_state")

            if new_state is None or old_state is None:
                return

            # Only act on off -> on transitions
            if old_state.state != STATE_OFF or new_state.state != STATE_ON:
                return

            # Skip if this was our own command
            if event.context.parent_id == INTEGRATION_CONTEXT_PARENT_ID:
                return

            self._hass.async_create_task(
                self._apply_circadian(entity_id, entry)
            )

        entry.unsub = self._hass.bus.async_listen(
            EVENT_STATE_CHANGED, _state_changed
        )
        self._entries[entity_id] = entry
        _LOGGER.debug("Started circadian overlay for %s", entity_id)

    def stop_circadian(self, entity_id: str) -> bool:
        """Stop a circadian overlay for an entity."""
        entry = self._entries.pop(entity_id, None)
        if entry is None:
            return False
        if entry.unsub:
            entry.unsub()
        _LOGGER.debug("Stopped circadian overlay for %s", entity_id)
        return True

    def stop_all(self) -> None:
        """Stop all circadian overlays."""
        for entity_id in list(self._entries):
            self.stop_circadian(entity_id)

    def is_active(self, entity_id: str) -> bool:
        """Check if a circadian overlay is active for an entity."""
        return entity_id in self._entries

    def get_active_entities(self) -> list[str]:
        """Get all entities with active circadian overlays."""
        return list(self._entries)

    def get_active_info(self) -> list[dict[str, Any]]:
        """Get info about all active overlays for the running operations API."""
        result: list[dict[str, Any]] = []
        for entity_id, entry in self._entries.items():
            sun_state = get_sun_state(self._hass)
            ct, br = (0, 0)
            if sun_state:
                ct, br = interpolate_solar_values(
                    entry.solar_steps, sun_state
                )
                ct = clamp_color_temp_to_state(
                    self._hass.states.get(entity_id), ct
                )
            result.append({
                "entity_id": entity_id,
                "preset_name": entry.preset_name,
                "current_color_temp": ct,
                "current_brightness": br,
            })
        return result

    async def _apply_circadian(
        self, entity_id: str, entry: CircadianEntry
    ) -> None:
        """Apply the circadian values to a light that just turned on."""
        # Verify overlay is still active and entry is current (guards against
        # stale tasks queued before stop/replace)
        current = self._entries.get(entity_id)
        if current is not entry:
            return

        sun_state = get_sun_state(self._hass)
        if sun_state is None:
            _LOGGER.debug(
                "Sun entity not available, skipping circadian for %s",
                entity_id,
            )
            return

        ct, br = interpolate_solar_values(entry.solar_steps, sun_state)
        ct = clamp_color_temp_to_state(self._hass.states.get(entity_id), ct)

        context = Context(parent_id=INTEGRATION_CONTEXT_PARENT_ID)
        await self._hass.services.async_call(
            "light",
            "turn_on",
            {
                "entity_id": entity_id,
                "color_temp_kelvin": ct,
                "brightness": br,
            },
            context=context,
        )
        _LOGGER.debug(
            "Applied circadian values to %s: %dK, brightness %d",
            entity_id,
            ct,
            br,
        )
