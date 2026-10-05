"""Light group resolution for service calls."""

from unittest.mock import AsyncMock, MagicMock

from custom_components.aqara_advanced_lighting.const import (
    DATA_CIRCADIAN_MANAGER,
    DATA_ENTITY_CONTROLLER,
    DOMAIN,
)
from custom_components.aqara_advanced_lighting.services._helpers import (
    _resolve_entity_ids,
)
from custom_components.aqara_advanced_lighting.services.circadian import (
    handle_resume_entity_control,
    handle_start_circadian_mode,
    handle_stop_circadian_mode,
)


def _light(members: list[str] | None = None) -> MagicMock:
    state = MagicMock()
    state.domain = "light"
    state.attributes = {"entity_id": members} if members else {}
    return state


def _make_hass() -> MagicMock:
    states = {
        "light.t2": _light(),
        "light.wide": _light(),
        "light.strip": _light(),
        "light.inner": _light(["light.wide", "light.strip"]),
        "light.outer": _light(["light.t2", "light.inner"]),
        "light.loop_a": _light(["light.loop_b", "light.t2"]),
        "light.loop_b": _light(["light.loop_a"]),
    }
    hass = MagicMock()
    hass.states.get = MagicMock(side_effect=states.get)
    return hass


def test_single_light_unchanged() -> None:
    assert _resolve_entity_ids(_make_hass(), ["light.t2"]) == ["light.t2"]


def test_flat_group_expanded() -> None:
    assert _resolve_entity_ids(_make_hass(), ["light.inner"]) == [
        "light.wide",
        "light.strip",
    ]


def test_nested_group_expanded() -> None:
    assert _resolve_entity_ids(_make_hass(), ["light.outer"]) == [
        "light.t2",
        "light.wide",
        "light.strip",
    ]


def test_duplicates_removed_in_order() -> None:
    assert _resolve_entity_ids(
        _make_hass(), ["light.wide", "light.outer"]
    ) == ["light.wide", "light.t2", "light.strip"]


def test_cyclic_groups_terminate() -> None:
    assert _resolve_entity_ids(_make_hass(), ["light.loop_a"]) == ["light.t2"]


def test_unknown_entity_kept() -> None:
    assert _resolve_entity_ids(_make_hass(), ["light.missing"]) == [
        "light.missing"
    ]


async def test_start_circadian_runs_on_members() -> None:
    hass = _make_hass()
    mgr = MagicMock()
    hass.data = {DOMAIN: {DATA_CIRCADIAN_MANAGER: mgr}}
    call = MagicMock()
    call.data = {
        "entity_id": ["light.inner"],
        "solar_steps": [
            {"sun_elevation": -6, "color_temp": 2000, "brightness": 50},
            {"sun_elevation": 45, "color_temp": 6500, "brightness": 255},
        ],
    }
    await handle_start_circadian_mode(hass, call)
    started = [c.args[0] for c in mgr.start_circadian.call_args_list]
    assert started == ["light.wide", "light.strip"]


async def test_stop_circadian_runs_on_members() -> None:
    hass = _make_hass()
    mgr = MagicMock()
    hass.data = {DOMAIN: {DATA_CIRCADIAN_MANAGER: mgr}}
    call = MagicMock()
    call.data = {"entity_id": ["light.inner"]}
    await handle_stop_circadian_mode(hass, call)
    stopped = [c.args[0] for c in mgr.stop_circadian.call_args_list]
    assert stopped == ["light.wide", "light.strip"]


async def test_resume_entity_control_runs_on_members() -> None:
    hass = _make_hass()
    controller = MagicMock()
    controller.resume_entity = AsyncMock(return_value=True)
    hass.data = {DOMAIN: {DATA_ENTITY_CONTROLLER: controller}}
    call = MagicMock()
    call.data = {"entity_id": ["light.inner"]}
    await handle_resume_entity_control(hass, call)
    resumed = [c.args[0] for c in controller.resume_entity.call_args_list]
    assert resumed == ["light.wide", "light.strip"]
