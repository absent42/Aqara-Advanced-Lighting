"""Tests for capability_profile module."""

import pytest
from unittest.mock import MagicMock

from custom_components.aqara_advanced_lighting.capability_profile import (
    CapabilityProfile,
    LightCapabilityLevel,
    build_capability_profile,
    adapt_xy_for_cct_light,
    clamp_color_temp,
    clamp_color_temp_to_state,
)


def _make_state(
    supported_color_modes: set[str],
    min_kelvin: int = 2700,
    max_kelvin: int = 6500,
) -> MagicMock:
    """Create a mock HA state object with light attributes."""
    state = MagicMock()
    state.attributes = {
        "supported_color_modes": supported_color_modes,
        "min_color_temp_kelvin": min_kelvin,
        "max_color_temp_kelvin": max_kelvin,
    }
    return state


def test_full_color_detection():
    """Detect full color capability from xy and color_temp modes."""
    state = _make_state({"xy", "color_temp"})
    profile = build_capability_profile(state)
    assert profile.level == LightCapabilityLevel.FULL_COLOR


def test_cct_only_detection():
    """Detect CCT-only capability with temp range."""
    state = _make_state({"color_temp"})
    profile = build_capability_profile(state)
    assert profile.level == LightCapabilityLevel.CCT_ONLY
    assert profile.min_color_temp_kelvin == 2700
    assert profile.max_color_temp_kelvin == 6500


def test_brightness_only_detection():
    """Detect brightness-only capability."""
    state = _make_state({"brightness"})
    profile = build_capability_profile(state)
    assert profile.level == LightCapabilityLevel.BRIGHTNESS_ONLY


def test_on_off_only_detection():
    """Detect on/off-only capability."""
    state = _make_state({"onoff"})
    profile = build_capability_profile(state)
    assert profile.level == LightCapabilityLevel.ON_OFF_ONLY


def test_hs_mode_is_full_color():
    """HS color mode should be classified as full color."""
    state = _make_state({"hs"})
    profile = build_capability_profile(state)
    assert profile.level == LightCapabilityLevel.FULL_COLOR


def test_rgb_mode_is_full_color():
    """RGB color mode should be classified as full color."""
    state = _make_state({"rgb", "color_temp"})
    profile = build_capability_profile(state)
    assert profile.level == LightCapabilityLevel.FULL_COLOR


def test_adapt_xy_warm_to_cct():
    """Warm XY color should map to low color temperature."""
    kelvin = adapt_xy_for_cct_light(0.45, 0.41, 2700, 6500)
    assert 2700 <= kelvin <= 4000


def test_adapt_xy_cool_to_cct():
    """Cool XY color should map to high color temperature."""
    kelvin = adapt_xy_for_cct_light(0.31, 0.33, 2700, 6500)
    assert 4000 <= kelvin <= 6500


def test_clamp_color_temp_within_range():
    """Color temp within range should pass through unchanged."""
    assert clamp_color_temp(4000, 2700, 6500) == 4000


def test_clamp_color_temp_below_min():
    """Color temp below minimum should clamp to minimum."""
    assert clamp_color_temp(2000, 3000, 6500) == 3000


def test_clamp_color_temp_above_max():
    """Color temp above maximum should clamp to maximum."""
    assert clamp_color_temp(7000, 2700, 5000) == 5000


def test_rgbw_mode_is_full_color():
    """RGBW color mode should be classified as full color."""
    state = _make_state({"rgbw"})
    profile = build_capability_profile(state)
    assert profile.level == LightCapabilityLevel.FULL_COLOR


def test_rgbww_mode_is_full_color():
    """RGBWW color mode should be classified as full color."""
    state = _make_state({"rgbww"})
    profile = build_capability_profile(state)
    assert profile.level == LightCapabilityLevel.FULL_COLOR


def test_adapt_xy_singularity_guard():
    """XY color near the singularity point (y ~= 0.1858) should not error."""
    kelvin = adapt_xy_for_cct_light(0.3320, 0.1858, 2700, 6500)
    assert 2700 <= kelvin <= 6500


def test_clamp_used_in_cct_step():
    """Color temp outside light's range should be clamped."""
    # Light supports 3000-5000K
    assert clamp_color_temp(2700, 3000, 5000) == 3000
    assert clamp_color_temp(6500, 3000, 5000) == 5000
    assert clamp_color_temp(4000, 3000, 5000) == 4000


def test_missing_color_modes_defaults_on_off():
    """State with no supported_color_modes defaults to on/off."""
    state = MagicMock()
    state.attributes = {}
    profile = build_capability_profile(state)
    assert profile.level == LightCapabilityLevel.ON_OFF_ONLY


def test_clamp_to_state_below_min():
    """Value below the light's minimum is raised to the minimum."""
    state = _make_state({"color_temp"}, min_kelvin=2700, max_kelvin=6500)
    assert clamp_color_temp_to_state(state, 2000) == 2700


def test_clamp_to_state_above_max():
    """Value above the light's maximum is lowered to the maximum."""
    state = _make_state({"color_temp"}, min_kelvin=2200, max_kelvin=5000)
    assert clamp_color_temp_to_state(state, 6500) == 5000


def test_clamp_to_state_within_range():
    """Value inside a wide range passes through."""
    state = _make_state({"color_temp"}, min_kelvin=2000, max_kelvin=6500)
    assert clamp_color_temp_to_state(state, 2000) == 2000


def test_clamp_to_state_none_state():
    """Missing entity state leaves the value unchanged."""
    assert clamp_color_temp_to_state(None, 2000) == 2000


def test_clamp_to_state_missing_bounds():
    """A light that reports no range leaves the value unchanged."""
    state = MagicMock()
    state.attributes = {"supported_color_modes": ["xy"]}
    assert clamp_color_temp_to_state(state, 2000) == 2000
