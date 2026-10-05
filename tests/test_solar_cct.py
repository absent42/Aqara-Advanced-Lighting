"""Tests for solar CCT sequence mode."""

import pytest

from custom_components.aqara_advanced_lighting.models import (
    CCTSequence,
    CCTSequenceStep,
)
from custom_components.aqara_advanced_lighting.sun_utils import SolarStep


def test_cct_sequence_accepts_solar_mode() -> None:
    """CCTSequence should accept mode='solar' with solar_steps."""
    seq = CCTSequence(
        steps=[],
        loop_mode="continuous",
        end_behavior="maintain",
        mode="solar",
        solar_steps=[
            SolarStep(sun_elevation=-6, color_temp=2700, brightness=50),
            SolarStep(sun_elevation=45, color_temp=6500, brightness=255),
        ],
    )
    assert seq.mode == "solar"
    assert len(seq.solar_steps) == 2


def test_cct_sequence_default_mode_is_standard() -> None:
    """Default mode should be 'standard' for backwards compatibility."""
    seq = CCTSequence(
        steps=[CCTSequenceStep(color_temp=4000, brightness=200, transition=10, hold=60)],
        loop_mode="once",
        end_behavior="maintain",
    )
    assert seq.mode == "standard"


def test_solar_mode_requires_solar_steps() -> None:
    """Solar mode without solar_steps should raise ValueError."""
    raised = False
    try:
        CCTSequence(
            steps=[],
            loop_mode="continuous",
            end_behavior="maintain",
            mode="solar",
            solar_steps=[],
        )
    except ValueError:
        raised = True
    assert raised, "Should have raised ValueError"


def test_solar_mode_skips_standard_validation() -> None:
    """Solar mode should not validate steps count or loop params."""
    # Empty steps list would fail standard validation, but solar mode skips it
    seq = CCTSequence(
        steps=[],
        loop_mode="continuous",
        end_behavior="maintain",
        mode="solar",
        solar_steps=[
            SolarStep(sun_elevation=-10, color_temp=2700, brightness=64),
            SolarStep(sun_elevation=0, color_temp=4000, brightness=128),
        ],
    )
    assert seq.mode == "solar"
    assert len(seq.steps) == 0


def test_standard_mode_validates_normally() -> None:
    """Standard mode should still run normal validation."""
    raised = False
    try:
        CCTSequence(
            steps=[],
            loop_mode="once",
            end_behavior="maintain",
            mode="standard",
        )
    except ValueError:
        raised = True
    assert raised, "Should have raised ValueError for empty steps"


def test_cct_step_accepts_2000() -> None:
    step = CCTSequenceStep(color_temp=2000, brightness=100, transition=0, hold=0)
    assert step.color_temp == 2000


def test_cct_step_rejects_1999() -> None:
    with pytest.raises(ValueError, match="2000-6500K"):
        CCTSequenceStep(color_temp=1999, brightness=100, transition=0, hold=0)
