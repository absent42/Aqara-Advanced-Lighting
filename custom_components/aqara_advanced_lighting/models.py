"""Data models for the Aqara Advanced Lighting integration."""

import math
from dataclasses import dataclass, field
from enum import StrEnum
from typing import Any, Self

from homeassistant.config_entries import ConfigEntry

from .const import (
    AUDIO_COLOR_ADVANCE_ON_ONSET,
    CCT_SEQUENCE_MAX_KELVIN,
    CCT_SEQUENCE_MIN_KELVIN,
    DEFAULT_AUDIO_DETECTION_MODE,
    DEFAULT_AUDIO_FREQUENCY_ZONE,
    DEFAULT_AUDIO_PREDICTION_AGGRESSIVENESS,
    DEFAULT_AUDIO_RESPONSE_CURVE,
    DEFAULT_AUDIO_SENSITIVITY,
    DEFAULT_AUDIO_SILENCE_BEHAVIOR,
    AUDIO_SILENCE_SLOW_CYCLE,
    DEFAULT_AUDIO_TRANSITION_SPEED,
    DEFAULT_LATENCY_COMPENSATION_MS,
    MAX_AUDIO_PREDICTION_AGGRESSIVENESS,
    MAX_AUDIO_SENSITIVITY,
    MAX_AUDIO_TRANSITION_SPEED,
    MIN_AUDIO_PREDICTION_AGGRESSIVENESS,
    MIN_AUDIO_SENSITIVITY,
    MIN_AUDIO_TRANSITION_SPEED,
    VALID_AUDIO_COLOR_ADVANCE,
    VALID_AUDIO_DETECTION_MODES,
    VALID_AUDIO_EFFECT_MODES,
    VALID_AUDIO_RESPONSE_CURVES,
    VALID_AUDIO_SILENCE_BEHAVIORS,
    brightness_percent_to_device,
)
from .sun_utils import ScheduleStep, SolarStep

def _validate_sequence_params(
    steps_count: int,
    loop_mode: str,
    loop_count: int | None,
    end_behavior: str,
) -> None:
    """Validate common sequence parameters shared by CCT and segment sequences."""
    if not (1 <= steps_count <= 20):
        msg = f"Sequence must have 1-20 steps, got {steps_count}"
        raise ValueError(msg)

    if loop_mode not in ("once", "count", "continuous"):
        msg = f"Loop mode must be 'once', 'count', or 'continuous', got {loop_mode}"
        raise ValueError(msg)

    if loop_mode == "count" and (loop_count is None or loop_count < 1):
        msg = "Loop count must be >= 1 when loop_mode is 'count'"
        raise ValueError(msg)

    if end_behavior not in ("maintain", "turn_off", "restore"):
        msg = f"End behavior must be 'maintain', 'turn_off', or 'restore', got {end_behavior}"
        raise ValueError(msg)

def round_xy(value: float) -> float:
    """Round XY coordinate to 4 decimal places for consistency.

    This matches industry standards and provides sufficient precision
    for Zigbee color control while reducing storage overhead.

    Args:
        value: Coordinate value to round

    Returns:
        Rounded value to 4 decimal places
    """
    return round(value, 4)

class AqaraLightModel(StrEnum):
    """Supported Aqara light models."""

    T1M_20_SEGMENT = "ACN031"
    T1M_26_SEGMENT = "ACN032"
    T1_STRIP = "STRIP1"
    T2_BULB = "ACN003"

class EffectType(StrEnum):
    """Dynamic effect types across all Aqara light models."""

    # T1M specific effects
    FLOW1 = "flow1"
    FLOW2 = "flow2"
    FADING = "fading"
    HOPPING = "hopping"
    BREATHING = "breathing"
    ROLLING = "rolling"

    # T1 Strip specific effects
    RAINBOW1 = "rainbow1"
    CHASING = "chasing"
    FLASH = "flash"
    RAINBOW2 = "rainbow2"
    FLICKER = "flicker"
    DASH = "dash"

    # T2 Bulb specific effects
    CANDLELIGHT = "candlelight"

@dataclass(frozen=True, slots=True)
class RGBColor:
    """RGB color representation."""

    r: int  # 0-255
    g: int  # 0-255
    b: int  # 0-255

    def to_dict(self) -> dict[str, int]:
        """Convert to dictionary for MQTT payload."""
        return {"r": self.r, "g": self.g, "b": self.b}

    @classmethod
    def from_dict(cls, data: dict[str, int]) -> Self:
        """Create from dictionary."""
        return cls(r=data["r"], g=data["g"], b=data["b"])

    def __post_init__(self) -> None:
        """Validate RGB values."""
        if not (0 <= self.r <= 255):
            msg = f"Red value must be 0-255, got {self.r}"
            raise ValueError(msg)
        if not (0 <= self.g <= 255):
            msg = f"Green value must be 0-255, got {self.g}"
            raise ValueError(msg)
        if not (0 <= self.b <= 255):
            msg = f"Blue value must be 0-255, got {self.b}"
            raise ValueError(msg)

@dataclass(frozen=True, slots=True)
class XYColor:
    """CIE 1931 XY color representation with brightness.

    XY coordinates represent chromaticity (hue and saturation) without brightness.
    This matches how Aqara lights actually work - color is separate from brightness.
    """

    x: float  # 0.0-1.0
    y: float  # 0.0-1.0
    brightness: int = 255  # 1-255 (optional, for display purposes)

    def to_dict(self) -> dict[str, float]:
        """Convert to dictionary for API/storage."""
        return {"x": round_xy(self.x), "y": round_xy(self.y)}

    @classmethod
    def from_dict(cls, data: dict[str, float | int]) -> Self:
        """Create from dictionary."""
        return cls(x=data["x"], y=data["y"], brightness=data.get("brightness", 255))

    def to_rgb(self) -> RGBColor:
        """Convert XY to RGB using the same algorithm as frontend.

        Returns RGB at full brightness (0-255 range) suitable for MQTT.
        Uses normalization to ensure vivid colors (matching frontend behavior).
        """
        # Prevent division by zero
        if self.y == 0:
            return RGBColor(r=0, g=0, b=0)

        # Convert XY to XYZ color space (using Y=1 as reference)
        z = 1.0 - self.x - self.y
        Y = 1.0
        X = (Y / self.y) * self.x
        Z = (Y / self.y) * z

        # Convert XYZ to linear RGB using sRGB D65 transformation matrix
        r_linear = X * 3.2406 + Y * -1.5372 + Z * -0.4986
        g_linear = X * -0.9689 + Y * 1.8758 + Z * 0.0415
        b_linear = X * 0.0557 + Y * -0.2040 + Z * 1.0570

        # Normalize so max component = 1.0 (preserves color ratios, fits in gamut)
        # This is critical for vivid colors - without it, colors appear washed out
        max_component = max(r_linear, g_linear, b_linear)
        if max_component > 1:
            r_linear /= max_component
            g_linear /= max_component
            b_linear /= max_component

        # Clamp negative values (out of gamut colors)
        r_linear = max(0, r_linear)
        g_linear = max(0, g_linear)
        b_linear = max(0, b_linear)

        # Apply gamma correction for sRGB
        r_srgb = (
            12.92 * r_linear
            if r_linear <= 0.0031308
            else 1.055 * math.pow(r_linear, 1.0 / 2.4) - 0.055
        )
        g_srgb = (
            12.92 * g_linear
            if g_linear <= 0.0031308
            else 1.055 * math.pow(g_linear, 1.0 / 2.4) - 0.055
        )
        b_srgb = (
            12.92 * b_linear
            if b_linear <= 0.0031308
            else 1.055 * math.pow(b_linear, 1.0 / 2.4) - 0.055
        )

        # Convert to 0-255 range (full brightness)
        return RGBColor(
            r=max(0, min(255, round(r_srgb * 255))),
            g=max(0, min(255, round(g_srgb * 255))),
            b=max(0, min(255, round(b_srgb * 255))),
        )

    def __post_init__(self) -> None:
        """Validate XY values."""
        if not (0.0 <= self.x <= 1.0):
            msg = f"X value must be 0.0-1.0, got {self.x}"
            raise ValueError(msg)
        if not (0.0 <= self.y <= 1.0):
            msg = f"Y value must be 0.0-1.0, got {self.y}"
            raise ValueError(msg)
        if not (1 <= self.brightness <= 255):
            msg = f"Brightness must be 1-255, got {self.brightness}"
            raise ValueError(msg)

@dataclass(frozen=True, slots=True)
class DynamicSceneColor:
    """Single color in a dynamic scene palette with per-color brightness."""

    x: float  # CIE x coordinate (0.0-1.0)
    y: float  # CIE y coordinate (0.0-1.0)
    brightness_pct: int  # Per-color brightness percentage (1-100)

    def to_dict(self) -> dict[str, float | int]:
        """Convert to dictionary for storage/API."""
        return {
            "x": round_xy(self.x),
            "y": round_xy(self.y),
            "brightness_pct": self.brightness_pct,
        }

    @classmethod
    def from_dict(cls, data: dict[str, float | int]) -> Self:
        """Create from dictionary."""
        return cls(
            x=float(data["x"]),
            y=float(data["y"]),
            brightness_pct=int(data.get("brightness_pct", 100)),
        )

    def to_xy_color(self) -> XYColor:
        """Convert to XYColor for color operations."""
        return XYColor(
            x=self.x, y=self.y, brightness=brightness_percent_to_device(self.brightness_pct)
        )

    def __post_init__(self) -> None:
        """Validate color values."""
        if not (0.0 <= self.x <= 1.0):
            msg = f"X value must be 0.0-1.0, got {self.x}"
            raise ValueError(msg)
        if not (0.0 <= self.y <= 1.0):
            msg = f"Y value must be 0.0-1.0, got {self.y}"
            raise ValueError(msg)
        if not (1 <= self.brightness_pct <= 100):
            msg = f"Brightness percentage must be 1-100, got {self.brightness_pct}"
            raise ValueError(msg)

@dataclass(frozen=True, slots=True)
class SegmentColor:
    """Segment color assignment for individual segment patterns."""

    segment: int | str  # int or range like "1-5", "odd", "even"
    color: RGBColor
    brightness: int | None = None  # 1-255, used for T1 Strip only

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary for MQTT payload."""
        result = {"segment": self.segment, "color": self.color.to_dict()}
        if self.brightness is not None:
            result["brightness"] = self.brightness
        return result

    def __post_init__(self) -> None:
        """Validate brightness value."""
        if self.brightness is not None and not (1 <= self.brightness <= 255):
            msg = f"Brightness must be 1-255, got {self.brightness}"
            raise ValueError(msg)

@dataclass(frozen=True, slots=True)
class AudioEffectConfig:
    """Audio-reactive configuration for dynamic effects.

    Encapsulates all audio parameters for effect speed modulation.
    Brightness modulation is not supported for hardware effects —
    the T1M restarts the effect on every brightness change.
    Frozen — new instances are created for overrides, not mutated.
    """

    audio_entity: str
    audio_sensitivity: int = DEFAULT_AUDIO_SENSITIVITY
    audio_silence_behavior: str = DEFAULT_AUDIO_SILENCE_BEHAVIOR

    # Speed modulation channel
    audio_speed_mode: str | None = None
    audio_speed_min: int = 1
    audio_speed_max: int = 100

    def __post_init__(self) -> None:
        """Validate and clamp audio configuration."""
        # Clamp sensitivity
        object.__setattr__(
            self, "audio_sensitivity",
            max(MIN_AUDIO_SENSITIVITY, min(MAX_AUDIO_SENSITIVITY, self.audio_sensitivity)),
        )

        # Validate silence behavior
        if self.audio_silence_behavior not in VALID_AUDIO_SILENCE_BEHAVIORS:
            msg = f"Invalid audio_silence_behavior: {self.audio_silence_behavior}"
            raise ValueError(msg)

        # Speed mode must be enabled
        if self.audio_speed_mode is None:
            msg = "AudioEffectConfig requires audio_speed_mode"
            raise ValueError(msg)

        # Validate speed mode
        if self.audio_speed_mode not in VALID_AUDIO_EFFECT_MODES:
            msg = f"Invalid audio_speed_mode: {self.audio_speed_mode}"
            raise ValueError(msg)

        # Clamp min/max ranges
        object.__setattr__(self, "audio_speed_min", max(1, min(100, self.audio_speed_min)))
        object.__setattr__(self, "audio_speed_max", max(1, min(100, self.audio_speed_max)))

        # Validate min < max
        if self.audio_speed_min >= self.audio_speed_max:
            msg = f"audio_speed_min ({self.audio_speed_min}) must be less than audio_speed_max ({self.audio_speed_max})"
            raise ValueError(msg)

    def to_dict(self) -> dict[str, Any]:
        """Serialize to dictionary for preset storage."""
        return {
            "audio_entity": self.audio_entity,
            "audio_sensitivity": self.audio_sensitivity,
            "audio_silence_behavior": self.audio_silence_behavior,
            "audio_speed_mode": self.audio_speed_mode,
            "audio_speed_min": self.audio_speed_min,
            "audio_speed_max": self.audio_speed_max,
        }

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> Self:
        """Deserialize from dictionary.

        Ignores legacy fields (audio_speed_curve, audio_detection_mode,
        audio_brightness_*) from older presets.
        """
        return cls(
            audio_entity=data["audio_entity"],
            audio_sensitivity=data.get("audio_sensitivity", DEFAULT_AUDIO_SENSITIVITY),
            audio_silence_behavior=data.get("audio_silence_behavior", DEFAULT_AUDIO_SILENCE_BEHAVIOR),
            audio_speed_mode=data.get("audio_speed_mode"),
            audio_speed_min=data.get("audio_speed_min", 1),
            audio_speed_max=data.get("audio_speed_max", 100),
        )

@dataclass(frozen=True, slots=True)
class DynamicEffect:
    """Dynamic effect configuration."""

    effect: EffectType
    effect_speed: int  # 1-100
    effect_colors: list[RGBColor]
    effect_segments: str | None = None  # T1 Strip only, e.g., "1-10", "odd"
    audio_config: AudioEffectConfig | None = None  # Audio-reactive modulation config

    def to_mqtt_payload(self, device_model: str | None = None) -> dict[str, Any]:
        """Convert to MQTT payload dictionary.

        IMPORTANT: Payload key order determines Z2M write order.
        T2: effect, effect_speed, effect_colors - speed before colors
            because writing speed restarts the effect with default colors.
        T1M/T1 Strip: effect, effect_colors, effect_speed - colors before
            speed for faster color rendering after effect type activates.
        """
        from .const import T2_RGB_MODELS

        colors = [color.to_dict() for color in self.effect_colors]

        if device_model and device_model in T2_RGB_MODELS:
            payload: dict[str, Any] = {
                "effect": self.effect.value,
                "effect_speed": self.effect_speed,
                "effect_colors": colors,
            }
        else:
            payload: dict[str, Any] = {
                "effect": self.effect.value,
                "effect_colors": colors,
                "effect_speed": self.effect_speed,
            }

        # Add effect_segments for T1 Strip if specified
        if self.effect_segments is not None:
            payload["effect_segments"] = self.effect_segments

        return payload

    def __post_init__(self) -> None:
        """Validate effect configuration."""
        if not (1 <= self.effect_speed <= 100):
            msg = f"Effect speed must be 1-100, got {self.effect_speed}"
            raise ValueError(msg)
        if not (1 <= len(self.effect_colors) <= 8):
            msg = f"Effect must have 1-8 colors, got {len(self.effect_colors)}"
            raise ValueError(msg)

@dataclass
class DeviceCapabilities:
    """Device capability definition for each Aqara light model."""

    model: AqaraLightModel
    segment_count: int
    supported_effects: list[EffectType]
    supports_segment_addressing: bool
    supports_effect_segments: bool
    model_name: str

@dataclass
class DeviceState:
    """Device state for restoration after effects."""

    entity_id: str
    z2m_friendly_name: str  # Kept for backwards compatibility with persisted state
    previous_state: dict[str, Any]  # Original state before effect
    effect_active: bool
    current_effect: DynamicEffect | None = None
    current_preset: str | None = None  # Preset name for event tracking
    device_identifier: str = ""  # Backend-agnostic device identifier
    # Runtime-only: not persisted, not included in to_dict()
    audio_modulator: Any = None  # AudioEffectModulator reference
    audio_engine: Any = None  # AudioEngine reference

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary for storage."""
        return {
            "entity_id": self.entity_id,
            "z2m_friendly_name": self.z2m_friendly_name,
            "previous_state": self.previous_state,
            "effect_active": self.effect_active,
            "current_effect": (
                {
                    "effect": self.current_effect.effect.value,
                    "effect_speed": self.current_effect.effect_speed,
                    "effect_colors": [
                        color.to_dict() for color in self.current_effect.effect_colors
                    ],
                    "effect_segments": self.current_effect.effect_segments,
                }
                if self.current_effect
                else None
            ),
            "current_preset": self.current_preset,
        }

@dataclass
class AqaraDevice:
    """Backend-agnostic representation of a supported Aqara light.

    Used by both Z2M and ZHA backends to provide a common device model
    to services, sequence managers, and the frontend.
    """

    identifier: str  # IEEE address (common to both backends)
    name: str  # Human-readable device name
    model_id: str  # Zigbee model ID (e.g., "lumi.light.acn031")
    manufacturer: str  # "LUMI" or "Aqara"
    backend_type: str = "z2m"  # "z2m" or "zha"

    @property
    def capabilities(self) -> DeviceCapabilities | None:
        """Get device capabilities based on model ID."""
        from .light_capabilities import get_device_capabilities

        return get_device_capabilities(self.model_id)

@dataclass
class Z2MDevice:
    """Zigbee2MQTT device information."""

    ieee_address: str
    friendly_name: str
    model_id: str
    manufacturer: str
    supported: bool = True

@dataclass(frozen=True, slots=True)
class CCTSequenceStep:
    """Single step in a CCT dynamic sequence."""

    color_temp: int  # Color temperature in kelvin
    brightness: int  # Brightness 1-255
    transition: float  # Transition time to reach this step (seconds)
    hold: float  # Hold time after transition completes before next step (seconds)

    def __post_init__(self) -> None:
        """Validate step parameters."""
        if not (
            CCT_SEQUENCE_MIN_KELVIN <= self.color_temp <= CCT_SEQUENCE_MAX_KELVIN
        ):
            msg = (
                f"Color temp must be {CCT_SEQUENCE_MIN_KELVIN}-"
                f"{CCT_SEQUENCE_MAX_KELVIN}K, got {self.color_temp}"
            )
            raise ValueError(msg)
        if not (1 <= self.brightness <= 255):
            msg = f"Brightness must be 1-255, got {self.brightness}"
            raise ValueError(msg)
        if self.transition < 0:
            msg = "Transition time cannot be negative"
            raise ValueError(msg)
        if self.hold < 0:
            msg = "Hold time cannot be negative"
            raise ValueError(msg)

@dataclass
class CCTSequence:
    """CCT dynamic effect sequence configuration."""

    steps: list[CCTSequenceStep]  # 1-20 steps
    loop_mode: str  # "once", "count", "continuous"
    loop_count: int | None = None
    end_behavior: str = "maintain"
    skip_first_in_loop: bool = False
    mode: str = "standard"  # "standard", "solar", or "schedule"
    solar_steps: list[SolarStep] = field(default_factory=list)
    schedule_steps: list[ScheduleStep] = field(default_factory=list)
    auto_resume_delay: float = 0

    def __post_init__(self) -> None:
        """Validate sequence parameters."""
        if self.mode == "solar":
            if len(self.solar_steps) < 2:
                msg = "Solar mode requires at least 2 solar steps"
                raise ValueError(msg)
            if self.end_behavior != "maintain":
                msg = "Solar mode only supports end_behavior='maintain'"
                raise ValueError(msg)
        elif self.mode == "schedule":
            if len(self.schedule_steps) < 2:
                msg = "Schedule mode requires at least 2 schedule steps"
                raise ValueError(msg)
            if self.end_behavior != "maintain":
                msg = "Schedule mode only supports end_behavior='maintain'"
                raise ValueError(msg)
        else:
            _validate_sequence_params(
                len(self.steps), self.loop_mode, self.loop_count, self.end_behavior
            )

@dataclass(frozen=True, slots=True)
class SegmentSequenceStep:
    """Single step in an RGB segment sequence."""

    segments: str  # Segment range: "1-20", "odd", "even", "1,5,10" (legacy when using segment_colors)
    colors: list[RGBColor]  # 1-6 colors for blocks or gradient (legacy when using segment_colors)
    mode: str  # "blocks_repeat", "blocks_expand", or "gradient" (legacy when using segment_colors)
    duration: float  # Total time to activate all segments (seconds)
    hold: float  # Hold time after activation completes before next step (seconds)
    activation_pattern: str  # "all", "sequential_forward", "sequential_reverse", "random"
    segment_colors: list[SegmentColor] | None = None  # Direct segment assignments (preferred)

    def __post_init__(self) -> None:
        """Validate step parameters."""
        # If using direct segment_colors, skip legacy field validation
        if self.segment_colors is not None:
            if not self.segment_colors:
                msg = "segment_colors cannot be empty when provided"
                raise ValueError(msg)
        else:
            # Legacy mode validation
            if not (1 <= len(self.colors) <= 6):
                msg = f"Step must have 1-6 colors, got {len(self.colors)}"
                raise ValueError(msg)

            if self.mode not in ("blocks_repeat", "blocks_expand", "gradient"):
                msg = f"Mode must be 'blocks_repeat', 'blocks_expand', or 'gradient', got {self.mode}"
                raise ValueError(msg)

        if self.duration < 0:
            msg = "Duration cannot be negative"
            raise ValueError(msg)

        if self.hold < 0:
            msg = "Hold time cannot be negative"
            raise ValueError(msg)

        valid_patterns = (
            "all",
            "sequential_forward",
            "sequential_reverse",
            "random",
            "ping_pong",
            "center_out",
            "edges_in",
            "paired",
        )
        if self.activation_pattern not in valid_patterns:
            msg = f"Activation pattern must be one of {valid_patterns}, got {self.activation_pattern}"
            raise ValueError(msg)

@dataclass
class SegmentSequence:
    """RGB segment sequence configuration."""

    steps: list[SegmentSequenceStep]  # 1-20 steps
    loop_mode: str  # "once", "count", "continuous"
    loop_count: int | None = None  # Number of loops if mode is "count"
    end_behavior: str = "maintain"  # "maintain", "turn_off", or "restore"
    clear_segments: bool = False  # Clear all segments (set to black) before starting
    skip_first_in_loop: bool = False  # Skip first step when looping (after first iteration)

    def __post_init__(self) -> None:
        """Validate sequence parameters."""
        _validate_sequence_params(
            len(self.steps), self.loop_mode, self.loop_count, self.end_behavior
        )

@dataclass
class DynamicScene:
    """Dynamic scene configuration for ambient lighting."""

    colors: list[DynamicSceneColor]  # 1-8 colors
    transition_time: float  # Seconds for fade between colors
    hold_time: float  # Seconds to hold each color
    distribution_mode: str  # "shuffle_rotate", "synchronized", "random"
    offset_delay: float  # Seconds between lights for ripple effect (0 = no ripple)
    random_order: bool  # Randomize light order for offset
    loop_mode: str  # "once", "count", "continuous"
    loop_count: int | None = None  # Number of loops if mode is "count"
    end_behavior: str = "maintain"  # "maintain", "turn_off", or "restore"
    audio_entity: str | None = None
    audio_sensitivity: int = DEFAULT_AUDIO_SENSITIVITY
    audio_brightness_curve: str | None = DEFAULT_AUDIO_RESPONSE_CURVE  # None = disabled
    audio_brightness_min: int = 30  # Percent (matches old 0.3 floor)
    audio_brightness_max: int = 100  # Percent (matches old 1.0 ceiling)
    audio_color_advance: str = AUDIO_COLOR_ADVANCE_ON_ONSET
    audio_transition_speed: int = DEFAULT_AUDIO_TRANSITION_SPEED
    audio_detection_mode: str = DEFAULT_AUDIO_DETECTION_MODE
    audio_frequency_zone: bool = DEFAULT_AUDIO_FREQUENCY_ZONE
    audio_silence_behavior: str = AUDIO_SILENCE_SLOW_CYCLE
    audio_prediction_aggressiveness: int = DEFAULT_AUDIO_PREDICTION_AGGRESSIVENESS
    audio_latency_compensation_ms: int = DEFAULT_LATENCY_COMPENSATION_MS
    audio_color_by_frequency: bool = False
    audio_rolloff_brightness: bool = False

    def __post_init__(self) -> None:
        """Validate scene parameters."""
        if not (1 <= len(self.colors) <= 8):
            msg = f"Scene must have 1-8 colors, got {len(self.colors)}"
            raise ValueError(msg)

        if self.transition_time < 0:
            msg = "Transition time cannot be negative"
            raise ValueError(msg)

        if self.hold_time < 0:
            msg = "Hold time cannot be negative"
            raise ValueError(msg)

        valid_modes = ("shuffle_rotate", "synchronized", "random")
        if self.distribution_mode not in valid_modes:
            msg = f"Distribution mode must be one of {valid_modes}, got {self.distribution_mode}"
            raise ValueError(msg)

        if self.offset_delay < 0:
            msg = "Offset delay cannot be negative"
            raise ValueError(msg)

        if self.loop_mode not in ("once", "count", "continuous"):
            msg = f"Loop mode must be 'once', 'count', or 'continuous', got {self.loop_mode}"
            raise ValueError(msg)

        if self.loop_mode == "count" and (
            self.loop_count is None or self.loop_count < 1
        ):
            msg = "Loop count must be >= 1 when loop_mode is 'count'"
            raise ValueError(msg)

        if self.end_behavior not in ("maintain", "turn_off", "restore"):
            msg = f"End behavior must be 'maintain', 'turn_off', or 'restore', got {self.end_behavior}"
            raise ValueError(msg)

        # Audio field validation
        if self.audio_entity is not None and not isinstance(self.audio_entity, str):
            msg = f"audio_entity must be a string or None, got {type(self.audio_entity)}"
            raise TypeError(msg)
        self.audio_sensitivity = max(
            MIN_AUDIO_SENSITIVITY, min(MAX_AUDIO_SENSITIVITY, self.audio_sensitivity)
        )
        self.audio_transition_speed = max(
            MIN_AUDIO_TRANSITION_SPEED,
            min(MAX_AUDIO_TRANSITION_SPEED, self.audio_transition_speed),
        )
        if self.audio_color_advance not in VALID_AUDIO_COLOR_ADVANCE:
            msg = (
                f"Invalid audio_color_advance: {self.audio_color_advance}. "
                f"Must be one of {VALID_AUDIO_COLOR_ADVANCE}"
            )
            raise ValueError(msg)

        if self.audio_detection_mode not in VALID_AUDIO_DETECTION_MODES:
            self.audio_detection_mode = DEFAULT_AUDIO_DETECTION_MODE

        # Brightness curve validation
        if self.audio_brightness_curve is not None:
            if self.audio_brightness_curve not in VALID_AUDIO_RESPONSE_CURVES:
                msg = (
                    f"Invalid audio_brightness_curve: {self.audio_brightness_curve}. "
                    f"Must be one of {VALID_AUDIO_RESPONSE_CURVES} or None"
                )
                raise ValueError(msg)
        self.audio_brightness_min = max(1, min(100, self.audio_brightness_min))
        self.audio_brightness_max = max(1, min(100, self.audio_brightness_max))
        if (self.audio_brightness_curve is not None
                and self.audio_brightness_min >= self.audio_brightness_max):
            msg = (
                f"audio_brightness_min ({self.audio_brightness_min}) must be less than "
                f"audio_brightness_max ({self.audio_brightness_max})"
            )
            raise ValueError(msg)

        # Silence behavior validation
        if self.audio_silence_behavior not in VALID_AUDIO_SILENCE_BEHAVIORS:
            msg = (
                f"Invalid audio_silence_behavior: {self.audio_silence_behavior}. "
                f"Must be one of {VALID_AUDIO_SILENCE_BEHAVIORS}"
            )
            raise ValueError(msg)

        self.audio_prediction_aggressiveness = max(
            MIN_AUDIO_PREDICTION_AGGRESSIVENESS,
            min(MAX_AUDIO_PREDICTION_AGGRESSIVENESS, self.audio_prediction_aggressiveness),
        )

        self.audio_latency_compensation_ms = max(0, min(500, self.audio_latency_compensation_ms))

@dataclass
class AqaraLightingRuntimeData:
    """Runtime data for the Aqara Advanced Lighting integration."""

    config_entry: ConfigEntry
    backend_type: str = "z2m"  # "z2m" or "zha"
    z2m_base_topic: str = ""  # Z2M only: MQTT base topic
    devices: dict[str, Z2MDevice] = field(default_factory=dict)
    devices_by_name: dict[str, Z2MDevice] = field(default_factory=dict)
    entity_to_z2m_map: dict[str, str] = field(default_factory=dict)
    entity_mapping_methods: dict[str, str] = field(default_factory=dict)
    device_states: dict[str, DeviceState] = field(default_factory=dict)
    entity_mapping_ready: bool = False
    aqara_devices: dict[str, AqaraDevice] = field(default_factory=dict)

# Type alias for typed config entry
type AqaraLightingConfigEntry = ConfigEntry[AqaraLightingRuntimeData]