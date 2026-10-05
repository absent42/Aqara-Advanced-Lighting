"""Color temperature clamping on adaptive and circadian send paths."""

from unittest.mock import AsyncMock, MagicMock, patch

from custom_components.aqara_advanced_lighting.cct_sequence_manager import (
    CCTSequenceManager,
)
from custom_components.aqara_advanced_lighting.circadian_manager import (
    CircadianManager,
)
from custom_components.aqara_advanced_lighting.sun_utils import SolarStep

WARM_STEPS = [
    SolarStep(sun_elevation=-6, color_temp=2000, brightness=50, phase="any"),
    SolarStep(sun_elevation=45, color_temp=2000, brightness=255, phase="any"),
]


def _make_hass(light_min: int = 2700, light_max: int = 6500) -> MagicMock:
    """Mock hass with a sun entity and one CCT light."""
    sun = MagicMock()
    sun.attributes = {"elevation": 20.0, "rising": True}
    light = MagicMock()
    light.state = "on"
    light.attributes = {
        "supported_color_modes": ["color_temp"],
        "min_color_temp_kelvin": light_min,
        "max_color_temp_kelvin": light_max,
    }
    states = {"sun.sun": sun, "light.test": light}
    hass = MagicMock()
    hass.data = {}
    hass.states.get = MagicMock(side_effect=states.get)
    hass.services.async_call = AsyncMock()
    return hass


def _make_manager(hass: MagicMock) -> CCTSequenceManager:
    with patch(
        "custom_components.aqara_advanced_lighting.cct_sequence_manager.Store"
    ):
        return CCTSequenceManager(hass, MagicMock())


def _store_solar(mgr: CCTSequenceManager) -> None:
    mgr._solar_sequences["light.test"] = {
        "mode": "solar",
        "solar_steps": [
            {
                "sun_elevation": s.sun_elevation,
                "color_temp": s.color_temp,
                "brightness": s.brightness,
                "phase": s.phase,
            }
            for s in WARM_STEPS
        ],
    }


def test_adaptive_values_clamped_to_light_min() -> None:
    hass = _make_hass(light_min=2700)
    mgr = _make_manager(hass)
    _store_solar(mgr)
    ct, _ = mgr.get_current_adaptive_values("light.test")
    assert ct == 2700


def test_adaptive_values_pass_through_when_supported() -> None:
    hass = _make_hass(light_min=2000)
    mgr = _make_manager(hass)
    _store_solar(mgr)
    ct, _ = mgr.get_current_adaptive_values("light.test")
    assert ct == 2000


async def test_force_apply_current_sends_clamped_value() -> None:
    hass = _make_hass(light_min=2700)
    mgr = _make_manager(hass)
    _store_solar(mgr)
    assert await mgr.force_apply_current("light.test") is True
    service_data = hass.services.async_call.call_args.args[2]
    assert service_data["color_temp_kelvin"] == 2700


def test_calc_adaptive_target_clamped_to_light_min() -> None:
    hass = _make_hass(light_min=2700)
    mgr = _make_manager(hass)
    sequence = MagicMock(mode="solar", solar_steps=WARM_STEPS)
    ct, _ = mgr._calc_adaptive_target("light.test", sequence)
    assert ct == 2700


async def test_circadian_sends_clamped_value() -> None:
    hass = _make_hass(light_min=2700)
    hass.bus.async_listen = MagicMock(return_value=MagicMock())
    mgr = CircadianManager(hass)
    mgr.start_circadian("light.test", WARM_STEPS)
    await mgr._apply_circadian("light.test", mgr._entries["light.test"])
    service_data = hass.services.async_call.call_args.args[2]
    assert service_data["color_temp_kelvin"] == 2700


def test_circadian_active_info_reports_clamped_value() -> None:
    hass = _make_hass(light_min=2700)
    hass.bus.async_listen = MagicMock(return_value=MagicMock())
    mgr = CircadianManager(hass)
    mgr.start_circadian("light.test", WARM_STEPS)
    assert mgr.get_active_info()[0]["current_color_temp"] == 2700
