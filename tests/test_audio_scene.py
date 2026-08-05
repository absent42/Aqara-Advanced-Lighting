"""Integration tests for audio-reactive dynamic scenes."""
from __future__ import annotations

import asyncio
from unittest.mock import AsyncMock, MagicMock

import pytest

from custom_components.aqara_advanced_lighting.models import (
    DynamicScene,
    DynamicSceneColor,
)


def test_dynamic_scene_with_audio_fields():
    """DynamicScene should accept and validate audio fields."""
    scene = DynamicScene(
        colors=[DynamicSceneColor(x=0.3, y=0.3, brightness_pct=100)],
        transition_time=1.0,
        hold_time=1.0,
        distribution_mode="shuffle_rotate",
        offset_delay=0.0,
        random_order=False,
        loop_mode="continuous",
        audio_entity="binary_sensor.beat_detected",
        audio_sensitivity=75,
        audio_color_advance="on_onset",
        audio_transition_speed=80,
        audio_brightness_curve="linear",
    )
    assert scene.audio_entity == "binary_sensor.beat_detected"
    assert scene.audio_sensitivity == 75
    assert scene.audio_transition_speed == 80


def test_dynamic_scene_without_audio_unchanged():
    """DynamicScene without audio fields should work as before."""
    scene = DynamicScene(
        colors=[DynamicSceneColor(x=0.3, y=0.3, brightness_pct=100)],
        transition_time=1.0,
        hold_time=1.0,
        distribution_mode="shuffle_rotate",
        offset_delay=0.0,
        random_order=False,
        loop_mode="continuous",
    )
    assert scene.audio_entity is None
    assert scene.audio_sensitivity == 50
    assert scene.audio_color_advance == "on_onset"


def test_dynamic_scene_invalid_audio_color_advance():
    """Invalid audio_color_advance should raise ValueError."""
    with pytest.raises(ValueError, match="Invalid audio_color_advance"):
        DynamicScene(
            colors=[DynamicSceneColor(x=0.3, y=0.3, brightness_pct=100)],
            transition_time=1.0,
            hold_time=1.0,
            distribution_mode="shuffle_rotate",
            offset_delay=0.0,
            random_order=False,
            loop_mode="continuous",
            audio_color_advance="invalid",
        )


def test_build_scene_engine_config_matches_scene_audio_fields():
    """Engine config should reflect scene's audio settings."""
    from custom_components.aqara_advanced_lighting.audio_scene_consumer import (
        build_scene_engine_config,
    )
    scene = DynamicScene(
        colors=[DynamicSceneColor(x=0.3, y=0.3, brightness_pct=100)],
        transition_time=1.0,
        hold_time=1.0,
        distribution_mode="shuffle_rotate",
        offset_delay=0.0,
        random_order=False,
        loop_mode="continuous",
        audio_entity="binary_sensor.beat",
        audio_sensitivity=75,
        audio_detection_mode="bass_energy",
        audio_color_advance="continuous",
        audio_brightness_curve="linear",
    )
    config = build_scene_engine_config(scene)
    assert config.consumer_type == "scene"
    assert config.sensitivity == 75
    assert config.detection_mode == "bass_energy"
    assert config.subscribe_energy is True
    assert config.subscribe_onset is False  # continuous mode, not onset
    assert config.subscribe_silence is True


def test_scene_consumer_unavailable_timeout_signals_stop():
    """Consumer should set stop_event when audio sensor times out."""
    from custom_components.aqara_advanced_lighting.audio_scene_consumer import (
        DynamicSceneAudioConsumer,
    )

    scene = DynamicScene(
        colors=[DynamicSceneColor(x=0.3, y=0.3, brightness_pct=100)],
        transition_time=1.0,
        hold_time=1.0,
        distribution_mode="shuffle_rotate",
        offset_delay=0.0,
        random_order=False,
        loop_mode="continuous",
        audio_entity="binary_sensor.beat",
    )

    class FakeState:
        def __init__(self):
            self.scene = scene
            self.audio_waiting = False

    state = FakeState()
    stop = asyncio.Event()
    handler = MagicMock()

    consumer = DynamicSceneAudioConsumer(
        scene_state=state,
        handler=handler,
        stop_event=stop,
        apply_colors_fn=AsyncMock(),
        transition_seconds=0.5,
        is_onset_mode=True,
        is_energy_mode=False,
    )

    # Simulate unavailable timeout
    loop = asyncio.new_event_loop()
    try:
        loop.run_until_complete(consumer.on_unavailable_timeout())
    finally:
        loop.close()

    assert stop.is_set()
    assert state.audio_waiting is True


# --- Silence behavior tests ---

def test_dynamic_scene_silence_behavior_enum():
    """DynamicScene should accept audio_silence_behavior string enum."""
    scene = DynamicScene(
        colors=[DynamicSceneColor(x=0.3, y=0.3, brightness_pct=100)],
        transition_time=1.0,
        hold_time=1.0,
        distribution_mode="shuffle_rotate",
        offset_delay=0.0,
        random_order=False,
        loop_mode="continuous",
        audio_entity="binary_sensor.beat",
        audio_silence_behavior="slow_cycle",
    )
    assert scene.audio_silence_behavior == "slow_cycle"


def test_dynamic_scene_silence_behavior_invalid_raises():
    """Invalid audio_silence_behavior should raise ValueError."""
    with pytest.raises(ValueError, match="Invalid audio_silence_behavior"):
        DynamicScene(
            colors=[DynamicSceneColor(x=0.3, y=0.3, brightness_pct=100)],
            transition_time=1.0,
            hold_time=1.0,
            distribution_mode="shuffle_rotate",
            offset_delay=0.0,
            random_order=False,
            loop_mode="continuous",
            audio_silence_behavior="invalid",
        )


def test_dynamic_scene_silence_behavior_default():
    """Default silence behavior should be slow_cycle."""
    scene = DynamicScene(
        colors=[DynamicSceneColor(x=0.3, y=0.3, brightness_pct=100)],
        transition_time=1.0,
        hold_time=1.0,
        distribution_mode="shuffle_rotate",
        offset_delay=0.0,
        random_order=False,
        loop_mode="continuous",
    )
    assert scene.audio_silence_behavior == "slow_cycle"


# --- Brightness curve tests ---

def test_dynamic_scene_brightness_curve_defaults():
    """Default brightness curve should be linear over 30-100."""
    scene = DynamicScene(
        colors=[DynamicSceneColor(x=0.3, y=0.3, brightness_pct=100)],
        transition_time=1.0,
        hold_time=1.0,
        distribution_mode="shuffle_rotate",
        offset_delay=0.0,
        random_order=False,
        loop_mode="continuous",
        audio_entity="binary_sensor.beat",
    )
    assert scene.audio_brightness_curve == "linear"
    assert scene.audio_brightness_min == 30
    assert scene.audio_brightness_max == 100


def test_dynamic_scene_brightness_curve_none_disables():
    """Setting audio_brightness_curve to None disables brightness response."""
    scene = DynamicScene(
        colors=[DynamicSceneColor(x=0.3, y=0.3, brightness_pct=100)],
        transition_time=1.0,
        hold_time=1.0,
        distribution_mode="shuffle_rotate",
        offset_delay=0.0,
        random_order=False,
        loop_mode="continuous",
        audio_brightness_curve=None,
    )
    assert scene.audio_brightness_curve is None


def test_dynamic_scene_brightness_min_max_validation():
    """audio_brightness_min must be less than audio_brightness_max."""
    with pytest.raises(ValueError, match="audio_brightness_min"):
        DynamicScene(
            colors=[DynamicSceneColor(x=0.3, y=0.3, brightness_pct=100)],
            transition_time=1.0,
            hold_time=1.0,
            distribution_mode="shuffle_rotate",
            offset_delay=0.0,
            random_order=False,
            loop_mode="continuous",
            audio_brightness_curve="linear",
            audio_brightness_min=80,
            audio_brightness_max=20,
        )
