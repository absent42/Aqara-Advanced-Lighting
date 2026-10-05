"""Capability detection and adaptation for generic light entities."""

from dataclasses import dataclass
from enum import IntEnum
from typing import Any

from .const import MAX_COLOR_TEMP_KELVIN, MIN_COLOR_TEMP_KELVIN

# Full color modes from HA light platform
_COLOR_MODES: frozenset[str] = frozenset({"xy", "hs", "rgb", "rgbw", "rgbww"})

class LightCapabilityLevel(IntEnum):
    """Capability classification for a light entity."""

    FULL_COLOR = 4
    CCT_ONLY = 3
    BRIGHTNESS_ONLY = 2
    ON_OFF_ONLY = 1

@dataclass(frozen=True, slots=True)
class CapabilityProfile:
    """Resolved capability profile for a light entity."""

    level: LightCapabilityLevel
    min_color_temp_kelvin: int | None = None
    max_color_temp_kelvin: int | None = None

def build_capability_profile(state: Any) -> CapabilityProfile:
    """Build a capability profile from a light entity's state attributes.

    Inspects the ``supported_color_modes`` attribute to classify the light
    into one of four capability levels.  Works with real HA State objects
    as well as any object that exposes an ``attributes`` dict.
    """
    attrs: dict[str, Any] = getattr(state, "attributes", {})
    modes = set(attrs.get("supported_color_modes", []))

    if modes & _COLOR_MODES:
        return CapabilityProfile(
            level=LightCapabilityLevel.FULL_COLOR,
            min_color_temp_kelvin=attrs.get(
                "min_color_temp_kelvin", MIN_COLOR_TEMP_KELVIN
            ),
            max_color_temp_kelvin=attrs.get(
                "max_color_temp_kelvin", MAX_COLOR_TEMP_KELVIN
            ),
        )

    if "color_temp" in modes:
        return CapabilityProfile(
            level=LightCapabilityLevel.CCT_ONLY,
            min_color_temp_kelvin=attrs.get(
                "min_color_temp_kelvin", MIN_COLOR_TEMP_KELVIN
            ),
            max_color_temp_kelvin=attrs.get(
                "max_color_temp_kelvin", MAX_COLOR_TEMP_KELVIN
            ),
        )

    if "brightness" in modes:
        return CapabilityProfile(level=LightCapabilityLevel.BRIGHTNESS_ONLY)

    return CapabilityProfile(level=LightCapabilityLevel.ON_OFF_ONLY)

def adapt_xy_for_cct_light(
    x: float, y: float, min_kelvin: int, max_kelvin: int
) -> int:
    """Convert an XY color to the nearest correlated color temperature.

    Uses McCamy's approximation:
        CCT = 449n^3 + 3525n^2 + 6823.3n + 5520.33
    where n = (x - 0.3320) / (0.1858 - y).

    The result is clamped to the light's supported range.
    """
    if abs(0.1858 - y) < 1e-6:
        y = 0.1857
    n = (x - 0.3320) / (0.1858 - y)
    cct = 449.0 * n**3 + 3525.0 * n**2 + 6823.3 * n + 5520.33
    return clamp_color_temp(round(cct), min_kelvin, max_kelvin)

def clamp_color_temp(
    color_temp: int, min_kelvin: int, max_kelvin: int
) -> int:
    """Clamp a color temperature to the light's supported range."""
    return max(min_kelvin, min(color_temp, max_kelvin))

def clamp_color_temp_to_state(state: Any, color_temp: int) -> int:
    """Clamp a color temperature to the range a light entity reports.

    Returns the value unchanged when the state or either bound is missing.
    """
    if state is None:
        return color_temp
    attrs: dict[str, Any] = getattr(state, "attributes", {})
    min_k = attrs.get("min_color_temp_kelvin")
    max_k = attrs.get("max_color_temp_kelvin")
    if min_k is None or max_k is None:
        return color_temp
    return clamp_color_temp(color_temp, min_k, max_k)
