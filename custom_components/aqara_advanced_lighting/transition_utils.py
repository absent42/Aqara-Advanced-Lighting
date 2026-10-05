"""Shared utilities for software-interpolated transitions.

T1-family devices (T1M, T1 Strip) don't fully support hardware transitions.
These utilities provide cubic easing, step interval calculation, entity
model resolution, and the shared software CCT transition algorithm used by
both Zigbee backends and the dynamic scene manager.
"""

import asyncio
import logging
from collections.abc import Awaitable, Callable
from typing import TYPE_CHECKING, Any

from .capability_profile import clamp_color_temp_to_state
from .const import (
    DOMAIN,
    MIN_TRANSITION_STEPS,
    SOFTWARE_TRANSITION_MODELS,
    SOFTWARE_TRANSITION_T1M_INTERVAL,
    SOFTWARE_TRANSITION_T1_STRIP_INTERVAL,
    T1M_MODELS,
)

if TYPE_CHECKING:
    from homeassistant.core import Context, HomeAssistant

    from .backend_protocol import DeviceBackend
    from .entity_controller import EntityController

_LOGGER = logging.getLogger(__name__)

# Type alias for the callback that applies CCT values to a light entity.
# Parameters: (entity_id, color_temp_kelvin, brightness, transition_or_None)
ApplyCctCallback = Callable[[str, int, int, float | None], Awaitable[None]]

def ease_in_out_cubic(t: float) -> float:
    """Cubic easing function for smooth transitions.

    Args:
        t: Progress from 0.0 to 1.0

    Returns:
        Eased value from 0.0 to 1.0
    """
    if t < 0.5:
        return 4 * t * t * t
    return 1 - pow(-2 * t + 2, 3) / 2

def get_software_step_interval(model_id: str, transition: float) -> float:
    """Calculate the step interval for software-interpolated transitions.

    Balances visual smoothness against Zigbee network load. Shorter
    transitions use smaller intervals for smooth appearance, while longer
    transitions use larger intervals to reduce command traffic.

    Args:
        model_id: Device model ID to determine minimum interval
        transition: Total transition duration in seconds

    Returns:
        Step interval in seconds
    """
    if transition <= 10:
        interval = 0.5
    elif transition <= 60:
        interval = 1.0
    elif transition <= 300:
        interval = 2.0
    else:
        interval = 5.0

    # Enforce per-model minimum interval
    min_interval = (
        SOFTWARE_TRANSITION_T1M_INTERVAL
        if model_id in T1M_MODELS
        else SOFTWARE_TRANSITION_T1_STRIP_INTERVAL
    )
    return max(interval, min_interval)

def get_entity_model_id(hass: HomeAssistant, entity_id: str) -> str | None:
    """Resolve an entity ID to its Aqara device model ID.

    Uses the shared entity routing lookup to find the backend instance,
    then resolves the device model from the backend.

    Returns:
        Model ID string (e.g. "lumi.light.acn031") or None if not found.
    """
    from .entity_routing import get_instance_for_entity

    _entry_id, instance_data = get_instance_for_entity(hass, entity_id)
    if not instance_data:
        return None
    backend = instance_data.get("backend")
    if backend:
        device = backend.get_device_for_entity(entity_id)
        if device:
            return device.model_id
    return None

# ---------------------------------------------------------------------------
# Shared CCT transition and light control helpers
# ---------------------------------------------------------------------------

def make_service_apply_callback(
    hass: HomeAssistant,
    entity_controller: EntityController | None,
) -> ApplyCctCallback:
    """Create a standard apply-CCT callback that uses HA light.turn_on.

    Both MQTT and ZHA backends send CCT commands via hass.services.async_call
    with identical logic. This factory returns a callback suitable for
    software_cct_transition() and apply_cct_step().
    """

    async def _apply(
        entity_id: str,
        color_temp_kelvin: int,
        brightness: int,
        transition: float | None = None,
    ) -> None:
        service_data: dict[str, Any] = {
            "entity_id": entity_id,
            "color_temp_kelvin": color_temp_kelvin,
            "brightness": brightness,
        }
        if transition is not None:
            service_data["transition"] = transition

        context: Context | None = None
        if entity_controller:
            context = entity_controller.create_context()

        await hass.services.async_call(
            "light", "turn_on", service_data, blocking=True, context=context
        )

    return _apply

async def software_cct_transition(
    hass: HomeAssistant,
    entity_id: str,
    target_color_temp: int,
    target_brightness: int,
    transition: float,
    model_id: str,
    apply_values: ApplyCctCallback,
    stop_event: asyncio.Event | None = None,
) -> bool:
    """Perform software-interpolated CCT transition for T1-family devices.

    T1M and T1 Strip devices don't fully support hardware transitions.
    This sends incremental light commands with cubic easing to simulate
    smooth transitions.

    Args:
        hass: Home Assistant instance
        entity_id: The Home Assistant light entity ID
        target_color_temp: Target color temperature in kelvin
        target_brightness: Target brightness level (1-255)
        transition: Total transition time in seconds
        model_id: Device model ID for interval selection
        apply_values: Async callback to send CCT values to the light
        stop_event: Optional event to signal interruption

    Returns:
        True if transition completed, False if interrupted
    """
    # Read current state as starting point
    state = hass.states.get(entity_id)
    if state is None or state.state == "unavailable":
        _LOGGER.debug(
            "Entity %s unavailable, applying target directly", entity_id
        )
        await apply_values(entity_id, target_color_temp, target_brightness, None)
        return True

    start_color_temp = state.attributes.get(
        "color_temp_kelvin", target_color_temp
    )
    start_brightness = state.attributes.get("brightness", target_brightness)

    # Calculate step interval and count
    step_interval = get_software_step_interval(model_id, transition)
    num_steps = max(MIN_TRANSITION_STEPS, round(transition / step_interval))
    actual_interval = transition / num_steps

    # Ensure actual_interval never drops below model minimum (can happen
    # when MIN_TRANSITION_STEPS forces more steps than the device can
    # handle, e.g. T1M with its fixed 2s hardware transition)
    if actual_interval < step_interval:
        num_steps = max(1, round(transition / step_interval))
        actual_interval = transition / num_steps

    _LOGGER.debug(
        "Software transition for %s (%s): %d steps, %.2fs interval, "
        "%dK->%dK, brightness %d->%d",
        entity_id,
        model_id,
        num_steps,
        actual_interval,
        start_color_temp,
        target_color_temp,
        start_brightness,
        target_brightness,
    )

    for step in range(1, num_steps + 1):
        if stop_event is not None and stop_event.is_set():
            _LOGGER.debug("Software transition stopped for %s", entity_id)
            return False

        # Calculate eased progress
        t = step / num_steps
        eased_t = ease_in_out_cubic(t)

        # Interpolate color temp and brightness
        color_temp = round(
            start_color_temp
            + (target_color_temp - start_color_temp) * eased_t
        )
        brightness = round(
            start_brightness
            + (target_brightness - start_brightness) * eased_t
        )

        await apply_values(entity_id, color_temp, brightness, None)

        # Wait before next sub-step (interruptible)
        if step < num_steps:
            if stop_event is not None:
                try:
                    await asyncio.wait_for(
                        stop_event.wait(), timeout=actual_interval
                    )
                    _LOGGER.debug(
                        "Software transition interrupted for %s at step"
                        " %d/%d",
                        entity_id,
                        step,
                        num_steps,
                    )
                    return False
                except asyncio.TimeoutError:
                    pass
            else:
                await asyncio.sleep(actual_interval)

    _LOGGER.debug("Software transition complete for %s", entity_id)
    return True

async def apply_cct_step(
    hass: HomeAssistant,
    backend: DeviceBackend,
    entity_id: str,
    color_temp_kelvin: int,
    brightness: int,
    transition: float,
    apply_values: ApplyCctCallback,
    stop_event: asyncio.Event | None = None,
) -> bool:
    """Apply a CCT step, using software transition when needed.

    Checks whether the target device requires software-interpolated
    transitions (T1-family) or can use hardware transitions (T2, generic).
    Handles the interruptible wait after hardware transitions.

    Args:
        hass: Home Assistant instance
        backend: The DeviceBackend for device lookup
        entity_id: The Home Assistant light entity ID
        color_temp_kelvin: Target color temperature in kelvin
        brightness: Target brightness level (1-255)
        transition: Transition time in seconds
        apply_values: Async callback to send CCT values to the light
        stop_event: Optional event to signal interruption

    Returns:
        True if transition completed, False if interrupted
    """
    color_temp_kelvin = clamp_color_temp_to_state(
        hass.states.get(entity_id), color_temp_kelvin
    )

    _LOGGER.info(
        "Applying CCT step to %s: %dK, brightness %d, transition %ss",
        entity_id,
        color_temp_kelvin,
        brightness,
        transition,
    )

    # Some devices (e.g. T1 Strip) ignore CCT commands while in RGB mode.
    # Send a preparatory mode-switch command so the device accepts CCT values.
    state = hass.states.get(entity_id)
    if state and state.attributes.get("color_mode") in (
        "xy", "rgb", "hs", "rgbw", "rgbww",
    ):
        _LOGGER.debug(
            "Light %s is in %s mode, switching to CCT before sequence step",
            entity_id,
            state.attributes.get("color_mode"),
        )
        await apply_values(entity_id, color_temp_kelvin, brightness, None)

    # Software transition path for T1-family devices
    if transition > 0:
        device = backend.get_device_for_entity(entity_id)
        if device and device.model_id in SOFTWARE_TRANSITION_MODELS:
            return await software_cct_transition(
                hass,
                entity_id,
                color_temp_kelvin,
                brightness,
                transition,
                device.model_id,
                apply_values,
                stop_event,
            )

    # Hardware transition path (T2 bulbs, generic lights)
    await apply_values(entity_id, color_temp_kelvin, brightness, transition)

    # Wait for transition to complete (interruptible)
    if stop_event is not None and transition > 0:
        try:
            await asyncio.wait_for(stop_event.wait(), timeout=transition)
            _LOGGER.debug("Transition interrupted for %s", entity_id)
            return False
        except asyncio.TimeoutError:
            pass
    elif transition > 0:
        await asyncio.sleep(transition)

    _LOGGER.debug("Transition complete for %s", entity_id)
    return True

async def turn_off_light(
    hass: HomeAssistant,
    entity_id: str,
    entity_controller: EntityController | None = None,
) -> None:
    """Turn off a light using HA light service.

    Shared by both backends since both use the same service call.
    """
    context: Context | None = None
    if entity_controller:
        context = entity_controller.create_context()

    _LOGGER.debug("Turning off light %s via HA service", entity_id)

    await hass.services.async_call(
        "light",
        "turn_off",
        {"entity_id": entity_id},
        blocking=True,
        context=context,
    )
