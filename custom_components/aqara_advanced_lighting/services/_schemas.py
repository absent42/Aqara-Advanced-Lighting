"""Voluptuous schema definitions for Aqara Advanced Lighting services."""

import voluptuous as vol

from homeassistant.const import ATTR_ENTITY_ID
from homeassistant.helpers import config_validation as cv

from ..const import (
    ACTIVATION_ALL,
    ACTIVATION_CENTER_OUT,
    ACTIVATION_EDGES_IN,
    ACTIVATION_PAIRED,
    ACTIVATION_PING_PONG,
    ACTIVATION_RANDOM,
    ACTIVATION_SEQUENTIAL_FORWARD,
    ACTIVATION_SEQUENTIAL_REVERSE,
    ATTR_AUDIO_EFFECT,
    ATTR_AUDIO_ENTITY,
    ATTR_AUDIO_SENSITIVITY,
    ATTR_AUDIO_SILENCE_BEHAVIOR,
    ATTR_AUDIO_SPEED_MAX,
    ATTR_AUDIO_SPEED_MIN,
    ATTR_AUDIO_SPEED_MODE,
    ATTR_BRIGHTNESS,
    ATTR_CLEAR_SEGMENTS,
    ATTR_COLOR_1,
    ATTR_COLOR_2,
    ATTR_COLOR_3,
    ATTR_COLOR_4,
    ATTR_COLOR_5,
    ATTR_COLOR_6,
    ATTR_COLOR_7,
    ATTR_COLOR_8,
    ATTR_EFFECT,
    ATTR_ENABLED,
    ATTR_END_BEHAVIOR,
    ATTR_EXPAND,
    ATTR_LOOP_COUNT,
    ATTR_LOOP_MODE,
    ATTR_PRESET,
    ATTR_RESTORE_STATE,
    ATTR_SEGMENT_COLORS,
    ATTR_SEGMENTS,
    ATTR_SENSITIVITY,
    ATTR_SKIP_FIRST_IN_LOOP,
    ATTR_SPEED,
    ATTR_SYNC,
    ATTR_TURN_OFF_UNSPECIFIED,
    ATTR_TURN_ON,
    ATTR_Z2M_BASE_TOPIC,
    AUDIO_COLOR_ADVANCE_ON_ONSET,
    CCT_MODE_STANDARD,
    DEFAULT_AUDIO_DETECTION_MODE,
    DEFAULT_AUDIO_FREQUENCY_ZONE,
    DEFAULT_AUDIO_PREDICTION_AGGRESSIVENESS,
    DEFAULT_AUDIO_SENSITIVITY,
    AUDIO_SILENCE_SLOW_CYCLE,
    DEFAULT_AUDIO_RESPONSE_CURVE,
    DEFAULT_AUDIO_TRANSITION_SPEED,
    DEFAULT_DYNAMIC_SCENE_HOLD_TIME,
    DEFAULT_DYNAMIC_SCENE_TRANSITION_TIME,
    DEFAULT_LATENCY_COMPENSATION_MS,
    DISTRIBUTION_SHUFFLE_ROTATE,
    END_BEHAVIOR_MAINTAIN,
    END_BEHAVIOR_RESTORE,
    END_BEHAVIOR_TURN_OFF,
    LOOP_MODE_CONTINUOUS,
    LOOP_MODE_COUNT,
    LOOP_MODE_ONCE,
    MAX_AUDIO_PREDICTION_AGGRESSIVENESS,
    MAX_AUDIO_SENSITIVITY,
    MAX_AUDIO_TRANSITION_SPEED,
    MAX_BRIGHTNESS_PERCENT,
    MAX_COLOR_TEMP_KELVIN,
    MAX_DURATION,
    MAX_HOLD_TIME,
    MAX_LOOP_COUNT,
    MAX_RGB_VALUE,
    MAX_SEQUENCE_STEPS,
    MAX_SPEED,
    MAX_TRANSITION_TIME,
    MIN_AUDIO_PREDICTION_AGGRESSIVENESS,
    MIN_AUDIO_SENSITIVITY,
    MIN_AUDIO_TRANSITION_SPEED,
    MIN_BRIGHTNESS_PERCENT,
    MIN_COLOR_TEMP_KELVIN,
    MIN_DURATION,
    MIN_HOLD_TIME,
    MIN_LOOP_COUNT,
    MIN_RGB_VALUE,
    MIN_SPEED,
    MIN_TRANSITION_TIME,
    MUSIC_SYNC_EFFECT_RANDOM,
    MUSIC_SYNC_SENSITIVITY_LOW,
    SEGMENT_MODE_BLOCKS_EXPAND,
    SEGMENT_MODE_BLOCKS_REPEAT,
    SEGMENT_MODE_GRADIENT,
    VALID_AUDIO_COLOR_ADVANCE,
    VALID_AUDIO_DETECTION_MODES,
    VALID_AUDIO_RESPONSE_CURVES,
    VALID_AUDIO_SILENCE_BEHAVIORS,
    VALID_CCT_MODES,
    VALID_DISTRIBUTION_MODES,
    VALID_MUSIC_SYNC_EFFECTS,
    VALID_MUSIC_SYNC_SENSITIVITIES,
    VALID_SOLAR_PHASES,
)

# RGB color schema (for dict format - backward compatibility)
RGB_COLOR_SCHEMA = vol.Schema(
    {
        vol.Required("r"): vol.All(
            vol.Coerce(int), vol.Range(MIN_RGB_VALUE, MAX_RGB_VALUE)
        ),
        vol.Required("g"): vol.All(
            vol.Coerce(int), vol.Range(MIN_RGB_VALUE, MAX_RGB_VALUE)
        ),
        vol.Required("b"): vol.All(
            vol.Coerce(int), vol.Range(MIN_RGB_VALUE, MAX_RGB_VALUE)
        ),
    }
)

# XY color schema (for CIE 1931 color space)
XY_COLOR_SCHEMA = vol.Schema(
    {
        vol.Required("x"): vol.All(vol.Coerce(float), vol.Range(min=0.0, max=1.0)),
        vol.Required("y"): vol.All(vol.Coerce(float), vol.Range(min=0.0, max=1.0)),
    }
)

# RGB color list schema (for color picker [r, g, b] format - backward compatibility)
RGB_COLOR_LIST_SCHEMA = vol.All(
    [vol.All(vol.Coerce(int), vol.Range(MIN_RGB_VALUE, MAX_RGB_VALUE))],
    vol.Length(min=3, max=3),
)

# Flexible color schema that accepts both RGB and XY formats
COLOR_SCHEMA = vol.Any(RGB_COLOR_SCHEMA, XY_COLOR_SCHEMA, RGB_COLOR_LIST_SCHEMA)

# Segment color schema
SEGMENT_COLOR_SCHEMA = vol.Schema(
    {
        vol.Required("segment"): vol.Any(vol.Coerce(int), cv.string),
        vol.Required("color"): RGB_COLOR_SCHEMA,
    }
)

# Service schemas
SERVICE_SET_DYNAMIC_EFFECT_SCHEMA = vol.Schema(
    {
        vol.Required(ATTR_ENTITY_ID): cv.entity_ids,
        vol.Optional(ATTR_PRESET): cv.string,
        vol.Optional(ATTR_EFFECT): cv.string,
        vol.Optional(ATTR_SPEED): vol.All(
            vol.Coerce(int), vol.Range(MIN_SPEED, MAX_SPEED)
        ),
        # Individual color pickers (optional when using preset)
        # Accept RGB list [r,g,b], RGB dict {r,g,b}, or XY dict {x,y}
        vol.Optional(ATTR_COLOR_1): COLOR_SCHEMA,
        vol.Optional(ATTR_COLOR_2): COLOR_SCHEMA,
        vol.Optional(ATTR_COLOR_3): COLOR_SCHEMA,
        vol.Optional(ATTR_COLOR_4): COLOR_SCHEMA,
        vol.Optional(ATTR_COLOR_5): COLOR_SCHEMA,
        vol.Optional(ATTR_COLOR_6): COLOR_SCHEMA,
        vol.Optional(ATTR_COLOR_7): COLOR_SCHEMA,
        vol.Optional(ATTR_COLOR_8): COLOR_SCHEMA,
        vol.Optional(ATTR_SEGMENTS): vol.All(cv.string, vol.Length(max=200)),
        vol.Optional(ATTR_BRIGHTNESS): vol.All(
            vol.Coerce(int),
            vol.Range(min=MIN_BRIGHTNESS_PERCENT, max=MAX_BRIGHTNESS_PERCENT),
        ),
        vol.Optional(ATTR_TURN_ON, default=False): cv.boolean,
        vol.Optional(ATTR_SYNC, default=True): cv.boolean,
        vol.Optional(ATTR_Z2M_BASE_TOPIC): cv.string,
        # Audio-reactive effect modulation
        vol.Optional(ATTR_AUDIO_ENTITY): cv.entity_id,
        vol.Optional(ATTR_AUDIO_SENSITIVITY): vol.All(
            vol.Coerce(int), vol.Range(min=1, max=100)
        ),
        vol.Optional(ATTR_AUDIO_SILENCE_BEHAVIOR): vol.In(
            ["hold", "decay_min", "decay_mid"]
        ),
        vol.Optional(ATTR_AUDIO_SPEED_MODE): vol.In(
            ["volume", "tempo", "combined"]
        ),
        vol.Optional(ATTR_AUDIO_SPEED_MIN): vol.All(
            vol.Coerce(int), vol.Range(min=1, max=100)
        ),
        vol.Optional(ATTR_AUDIO_SPEED_MAX): vol.All(
            vol.Coerce(int), vol.Range(min=1, max=100)
        ),
    }
)

SERVICE_STOP_EFFECT_SCHEMA = vol.Schema(
    {
        vol.Required(ATTR_ENTITY_ID): cv.entity_ids,
        vol.Optional(ATTR_RESTORE_STATE, default=True): cv.boolean,
        vol.Optional(ATTR_Z2M_BASE_TOPIC): cv.string,
    }
)

SERVICE_SET_SEGMENT_PATTERN_SCHEMA = vol.Schema(
    {
        vol.Required(ATTR_ENTITY_ID): cv.entity_ids,
        vol.Optional(ATTR_PRESET): cv.string,
        vol.Optional(ATTR_SEGMENT_COLORS): [SEGMENT_COLOR_SCHEMA],
        vol.Optional(ATTR_BRIGHTNESS): vol.All(
            vol.Coerce(int),
            vol.Range(min=MIN_BRIGHTNESS_PERCENT, max=MAX_BRIGHTNESS_PERCENT),
        ),
        vol.Optional(ATTR_TURN_ON, default=False): cv.boolean,
        vol.Optional(ATTR_TURN_OFF_UNSPECIFIED, default=False): cv.boolean,
        vol.Optional(ATTR_SYNC, default=True): cv.boolean,
        vol.Optional(ATTR_Z2M_BASE_TOPIC): cv.string,
    }
)

SERVICE_CREATE_GRADIENT_SCHEMA = vol.Schema(
    {
        vol.Required(ATTR_ENTITY_ID): cv.entity_ids,
        # Individual color pickers (color_1 and color_2 are required, 3-6 are optional)
        # Accept RGB list [r,g,b], RGB dict {r,g,b}, or XY dict {x,y}
        vol.Required(ATTR_COLOR_1): COLOR_SCHEMA,
        vol.Required(ATTR_COLOR_2): COLOR_SCHEMA,
        vol.Optional(ATTR_COLOR_3): COLOR_SCHEMA,
        vol.Optional(ATTR_COLOR_4): COLOR_SCHEMA,
        vol.Optional(ATTR_COLOR_5): COLOR_SCHEMA,
        vol.Optional(ATTR_COLOR_6): COLOR_SCHEMA,
        vol.Optional(ATTR_SEGMENTS): vol.All(cv.string, vol.Length(max=200)),
        vol.Optional(ATTR_BRIGHTNESS): vol.All(
            vol.Coerce(int),
            vol.Range(min=MIN_BRIGHTNESS_PERCENT, max=MAX_BRIGHTNESS_PERCENT),
        ),
        vol.Optional(ATTR_TURN_ON, default=False): cv.boolean,
        vol.Optional(ATTR_TURN_OFF_UNSPECIFIED, default=False): cv.boolean,
        vol.Optional(ATTR_SYNC, default=True): cv.boolean,
        vol.Optional(ATTR_Z2M_BASE_TOPIC): cv.string,
    }
)

SERVICE_CREATE_BLOCKS_SCHEMA = vol.Schema(
    {
        vol.Required(ATTR_ENTITY_ID): cv.entity_ids,
        # Individual color pickers (color_1 is required, 2-6 are optional)
        # Accept RGB list [r,g,b], RGB dict {r,g,b}, or XY dict {x,y}
        vol.Required(ATTR_COLOR_1): COLOR_SCHEMA,
        vol.Optional(ATTR_COLOR_2): COLOR_SCHEMA,
        vol.Optional(ATTR_COLOR_3): COLOR_SCHEMA,
        vol.Optional(ATTR_COLOR_4): COLOR_SCHEMA,
        vol.Optional(ATTR_COLOR_5): COLOR_SCHEMA,
        vol.Optional(ATTR_COLOR_6): COLOR_SCHEMA,
        vol.Optional(ATTR_SEGMENTS): vol.All(cv.string, vol.Length(max=200)),
        vol.Optional(ATTR_BRIGHTNESS): vol.All(
            vol.Coerce(int),
            vol.Range(min=MIN_BRIGHTNESS_PERCENT, max=MAX_BRIGHTNESS_PERCENT),
        ),
        vol.Optional(ATTR_TURN_ON, default=False): cv.boolean,
        vol.Optional(ATTR_EXPAND, default=False): cv.boolean,
        vol.Optional(ATTR_TURN_OFF_UNSPECIFIED, default=False): cv.boolean,
        vol.Optional(ATTR_SYNC, default=True): cv.boolean,
        vol.Optional(ATTR_Z2M_BASE_TOPIC): cv.string,
    }
)

def _add_cct_step_fields(schema_dict: dict, step_num: int) -> None:
    """Add CCT sequence step fields to a schema dict."""
    schema_dict[vol.Optional(f"step_{step_num}_color_temp")] = vol.All(
        vol.Coerce(int),
        vol.Range(min=MIN_COLOR_TEMP_KELVIN, max=MAX_COLOR_TEMP_KELVIN),
    )
    schema_dict[vol.Optional(f"step_{step_num}_brightness")] = vol.All(
        vol.Coerce(int),
        vol.Range(min=MIN_BRIGHTNESS_PERCENT, max=MAX_BRIGHTNESS_PERCENT),
    )
    schema_dict[vol.Optional(f"step_{step_num}_transition")] = vol.All(
        vol.Coerce(float),
        vol.Range(min=MIN_TRANSITION_TIME, max=MAX_TRANSITION_TIME),
    )
    schema_dict[vol.Optional(f"step_{step_num}_hold")] = vol.All(
        vol.Coerce(float), vol.Range(min=MIN_HOLD_TIME, max=MAX_HOLD_TIME)
    )

# Activation patterns used in segment sequence step schemas
_ACTIVATION_PATTERN_VALUES = [
    ACTIVATION_ALL,
    ACTIVATION_SEQUENTIAL_FORWARD,
    ACTIVATION_SEQUENTIAL_REVERSE,
    ACTIVATION_RANDOM,
    ACTIVATION_PING_PONG,
    ACTIVATION_CENTER_OUT,
    ACTIVATION_EDGES_IN,
    ACTIVATION_PAIRED,
]

def _add_segment_step_fields(schema_dict: dict, step_num: int) -> None:
    """Add segment sequence step fields to a schema dict."""
    schema_dict[vol.Optional(f"step_{step_num}_segments")] = cv.string
    schema_dict[vol.Optional(f"step_{step_num}_mode")] = vol.In(
        [
            SEGMENT_MODE_BLOCKS_REPEAT,
            SEGMENT_MODE_BLOCKS_EXPAND,
            SEGMENT_MODE_GRADIENT,
        ]
    )
    for color_num in range(1, 7):
        schema_dict[vol.Optional(f"step_{step_num}_color_{color_num}")] = COLOR_SCHEMA
    schema_dict[vol.Optional(f"step_{step_num}_segment_colors")] = vol.All(
        cv.ensure_list,
        [
            vol.Schema(
                {
                    vol.Required("segment"): vol.Coerce(int),
                    vol.Required("color"): RGB_COLOR_SCHEMA,
                }
            )
        ],
    )
    schema_dict[vol.Optional(f"step_{step_num}_duration")] = vol.All(
        vol.Coerce(float), vol.Range(min=MIN_DURATION, max=MAX_DURATION)
    )
    schema_dict[vol.Optional(f"step_{step_num}_hold")] = vol.All(
        vol.Coerce(float), vol.Range(min=MIN_HOLD_TIME, max=MAX_HOLD_TIME)
    )
    schema_dict[vol.Optional(f"step_{step_num}_activation_pattern")] = vol.In(
        _ACTIVATION_PATTERN_VALUES
    )

# Build CCT sequence service schema with individual step fields
_cct_sequence_schema_dict = {
    vol.Required(ATTR_ENTITY_ID): cv.entity_ids,
    vol.Optional(ATTR_PRESET): cv.string,  # Preset name (optional)
    vol.Optional(ATTR_TURN_ON, default=False): cv.boolean,
    vol.Optional(ATTR_SYNC, default=True): cv.boolean,
}

# Add step 1-20 fields (all optional - required only when not using a preset)
for _step_num in range(1, MAX_SEQUENCE_STEPS + 1):
    _add_cct_step_fields(_cct_sequence_schema_dict, _step_num)

# Add loop/end behavior fields
_cct_sequence_schema_dict[vol.Optional(ATTR_LOOP_MODE, default=LOOP_MODE_ONCE)] = (
    vol.In([LOOP_MODE_ONCE, LOOP_MODE_COUNT, LOOP_MODE_CONTINUOUS])
)
_cct_sequence_schema_dict[vol.Optional(ATTR_LOOP_COUNT)] = vol.All(
    vol.Coerce(int), vol.Range(min=MIN_LOOP_COUNT, max=MAX_LOOP_COUNT)
)
_cct_sequence_schema_dict[
    vol.Optional(ATTR_END_BEHAVIOR, default=END_BEHAVIOR_MAINTAIN)
] = vol.In([END_BEHAVIOR_MAINTAIN, END_BEHAVIOR_TURN_OFF, END_BEHAVIOR_RESTORE])
_cct_sequence_schema_dict[vol.Optional(ATTR_SKIP_FIRST_IN_LOOP, default=False)] = (
    cv.boolean
)
_cct_sequence_schema_dict[vol.Optional(ATTR_Z2M_BASE_TOPIC)] = cv.string

SOLAR_STEP_SCHEMA = vol.Schema(
    {
        vol.Required("sun_elevation"): vol.All(
            vol.Coerce(float), vol.Range(min=-90.0, max=90.0)
        ),
        vol.Required("color_temp"): vol.All(
            vol.Coerce(int), vol.Range(min=MIN_COLOR_TEMP_KELVIN, max=MAX_COLOR_TEMP_KELVIN)
        ),
        vol.Required("brightness"): vol.All(
            vol.Coerce(int), vol.Range(min=1, max=255)
        ),
        vol.Optional("phase", default="any"): vol.In(VALID_SOLAR_PHASES),
    }
)

SCHEDULE_STEP_SCHEMA = vol.Schema(
    {
        vol.Required("time"): cv.string,
        vol.Required("color_temp"): vol.All(
            vol.Coerce(int), vol.Range(min=MIN_COLOR_TEMP_KELVIN, max=MAX_COLOR_TEMP_KELVIN)
        ),
        vol.Required("brightness"): vol.All(
            vol.Coerce(int), vol.Range(min=1, max=255)
        ),
        vol.Optional("label", default=""): cv.string,
    }
)

_cct_sequence_schema_dict[vol.Optional("mode", default=CCT_MODE_STANDARD)] = vol.In(
    VALID_CCT_MODES
)
_cct_sequence_schema_dict[vol.Optional("auto_resume_delay")] = vol.All(
    vol.Coerce(float), vol.Range(min=0)
)
_cct_sequence_schema_dict[vol.Optional("solar_steps")] = vol.All(
    cv.ensure_list, [SOLAR_STEP_SCHEMA], vol.Length(min=2, max=20)
)
_cct_sequence_schema_dict[vol.Optional("schedule_steps")] = vol.All(
    cv.ensure_list, [SCHEDULE_STEP_SCHEMA], vol.Length(min=2, max=20)
)

SERVICE_START_CCT_SEQUENCE_SCHEMA = vol.Schema(_cct_sequence_schema_dict)

SERVICE_STOP_CCT_SEQUENCE_SCHEMA = vol.Schema(
    {
        vol.Required(ATTR_ENTITY_ID): cv.entity_ids,
        vol.Optional(ATTR_RESTORE_STATE, default=True): cv.boolean,
        vol.Optional(ATTR_Z2M_BASE_TOPIC): cv.string,
    }
)

SERVICE_PAUSE_CCT_SEQUENCE_SCHEMA = vol.Schema(
    {
        vol.Required(ATTR_ENTITY_ID): cv.entity_ids,
        vol.Optional(ATTR_Z2M_BASE_TOPIC): cv.string,
    }
)

SERVICE_RESUME_CCT_SEQUENCE_SCHEMA = vol.Schema(
    {
        vol.Required(ATTR_ENTITY_ID): cv.entity_ids,
        vol.Optional(ATTR_Z2M_BASE_TOPIC): cv.string,
    }
)

# Build segment sequence service schema with individual step fields
_segment_sequence_schema_dict = {
    vol.Required(ATTR_ENTITY_ID): cv.entity_ids,
    vol.Optional(ATTR_PRESET): cv.string,  # Preset name (optional)
    vol.Optional(ATTR_TURN_ON, default=False): cv.boolean,
    vol.Optional(ATTR_SYNC, default=True): cv.boolean,
}

# Add step 1-20 fields (all optional - required only when not using a preset)
for _step_num in range(1, MAX_SEQUENCE_STEPS + 1):
    _add_segment_step_fields(_segment_sequence_schema_dict, _step_num)

# Add loop/end behavior fields
_segment_sequence_schema_dict[vol.Optional(ATTR_LOOP_MODE, default=LOOP_MODE_ONCE)] = (
    vol.In([LOOP_MODE_ONCE, LOOP_MODE_COUNT, LOOP_MODE_CONTINUOUS])
)
_segment_sequence_schema_dict[vol.Optional(ATTR_LOOP_COUNT)] = vol.All(
    vol.Coerce(int), vol.Range(min=MIN_LOOP_COUNT, max=MAX_LOOP_COUNT)
)
_segment_sequence_schema_dict[
    vol.Optional(ATTR_END_BEHAVIOR, default=END_BEHAVIOR_MAINTAIN)
] = vol.In([END_BEHAVIOR_MAINTAIN, END_BEHAVIOR_TURN_OFF, END_BEHAVIOR_RESTORE])
_segment_sequence_schema_dict[vol.Optional(ATTR_CLEAR_SEGMENTS, default=False)] = (
    cv.boolean
)
_segment_sequence_schema_dict[vol.Optional(ATTR_SKIP_FIRST_IN_LOOP, default=False)] = (
    cv.boolean
)
_segment_sequence_schema_dict[vol.Optional(ATTR_Z2M_BASE_TOPIC)] = cv.string
_segment_sequence_schema_dict[vol.Optional(ATTR_BRIGHTNESS)] = vol.All(
    vol.Coerce(int),
    vol.Range(min=MIN_BRIGHTNESS_PERCENT, max=MAX_BRIGHTNESS_PERCENT),
)

SERVICE_START_SEGMENT_SEQUENCE_SCHEMA = vol.Schema(_segment_sequence_schema_dict)

SERVICE_STOP_SEGMENT_SEQUENCE_SCHEMA = vol.Schema(
    {
        vol.Required(ATTR_ENTITY_ID): cv.entity_ids,
        vol.Optional(ATTR_RESTORE_STATE, default=True): cv.boolean,
        vol.Optional(ATTR_Z2M_BASE_TOPIC): cv.string,
    }
)

SERVICE_PAUSE_SEGMENT_SEQUENCE_SCHEMA = vol.Schema(
    {
        vol.Required(ATTR_ENTITY_ID): cv.entity_ids,
        vol.Optional(ATTR_Z2M_BASE_TOPIC): cv.string,
    }
)

SERVICE_RESUME_SEGMENT_SEQUENCE_SCHEMA = vol.Schema(
    {
        vol.Required(ATTR_ENTITY_ID): cv.entity_ids,
        vol.Optional(ATTR_Z2M_BASE_TOPIC): cv.string,
    }
)

# Dynamic scene color schema with optional brightness percentage
DYNAMIC_SCENE_COLOR_SCHEMA = vol.Schema(
    {
        vol.Required("x"): vol.All(vol.Coerce(float), vol.Range(min=0.0, max=1.0)),
        vol.Required("y"): vol.All(vol.Coerce(float), vol.Range(min=0.0, max=1.0)),
        vol.Optional("brightness_pct", default=100): vol.All(
            vol.Coerce(int), vol.Range(min=1, max=100)
        ),
    }
)

# Dynamic scene service schemas
SERVICE_START_DYNAMIC_SCENE_SCHEMA = vol.Schema(
    {
        vol.Required(ATTR_ENTITY_ID): cv.entity_ids,
        vol.Exclusive(ATTR_PRESET, "scene_source"): cv.string,
        vol.Exclusive("colors", "scene_source"): vol.All(
            cv.ensure_list,
            [DYNAMIC_SCENE_COLOR_SCHEMA],
        ),
        vol.Optional(
            "transition_time", default=DEFAULT_DYNAMIC_SCENE_TRANSITION_TIME
        ): vol.Coerce(float),
        vol.Optional("hold_time", default=DEFAULT_DYNAMIC_SCENE_HOLD_TIME): vol.Coerce(
            float
        ),
        vol.Optional("distribution_mode", default=DISTRIBUTION_SHUFFLE_ROTATE): vol.In(
            VALID_DISTRIBUTION_MODES
        ),
        vol.Optional("offset_delay", default=0.0): vol.Coerce(float),
        vol.Optional("random_order", default=False): cv.boolean,
        vol.Optional(ATTR_LOOP_MODE, default="continuous"): vol.In(
            ["once", "count", "continuous"]
        ),
        vol.Optional(ATTR_LOOP_COUNT): vol.All(
            vol.Coerce(int), vol.Range(min=1, max=100)
        ),
        vol.Optional(ATTR_END_BEHAVIOR, default="maintain"): vol.In(
            ["maintain", "turn_off", "restore"]
        ),
        vol.Optional("scene_name"): cv.string,
        vol.Optional("static", default=False): cv.boolean,
        vol.Optional("audio_entity"): cv.entity_domain("binary_sensor"),
        vol.Optional("audio_sensitivity", default=DEFAULT_AUDIO_SENSITIVITY): vol.All(
            vol.Coerce(int), vol.Range(min=MIN_AUDIO_SENSITIVITY, max=MAX_AUDIO_SENSITIVITY)
        ),
        vol.Optional("audio_brightness_curve", default=DEFAULT_AUDIO_RESPONSE_CURVE): vol.Any(
            vol.In(VALID_AUDIO_RESPONSE_CURVES), None,
        ),
        vol.Optional("audio_brightness_min", default=30): vol.All(
            vol.Coerce(int), vol.Range(min=1, max=100),
        ),
        vol.Optional("audio_brightness_max", default=100): vol.All(
            vol.Coerce(int), vol.Range(min=1, max=100),
        ),
        vol.Optional("audio_color_advance", default=AUDIO_COLOR_ADVANCE_ON_ONSET): vol.In(
            VALID_AUDIO_COLOR_ADVANCE
        ),
        vol.Optional("audio_transition_speed", default=DEFAULT_AUDIO_TRANSITION_SPEED): vol.All(
            vol.Coerce(int),
            vol.Range(min=MIN_AUDIO_TRANSITION_SPEED, max=MAX_AUDIO_TRANSITION_SPEED),
        ),
        vol.Optional("audio_detection_mode", default=DEFAULT_AUDIO_DETECTION_MODE): vol.In(
            VALID_AUDIO_DETECTION_MODES
        ),
        vol.Optional("audio_frequency_zone", default=DEFAULT_AUDIO_FREQUENCY_ZONE): cv.boolean,
        vol.Optional("audio_silence_behavior", default=AUDIO_SILENCE_SLOW_CYCLE): vol.In(
            VALID_AUDIO_SILENCE_BEHAVIORS
        ),
        vol.Optional("audio_color_by_frequency", default=False): cv.boolean,
        vol.Optional("audio_rolloff_brightness", default=False): cv.boolean,
        vol.Optional("audio_prediction_aggressiveness", default=DEFAULT_AUDIO_PREDICTION_AGGRESSIVENESS): vol.All(
            vol.Coerce(int), vol.Range(min=MIN_AUDIO_PREDICTION_AGGRESSIVENESS, max=MAX_AUDIO_PREDICTION_AGGRESSIVENESS)
        ),
        vol.Optional("audio_latency_compensation_ms", default=DEFAULT_LATENCY_COMPENSATION_MS): vol.All(
            vol.Coerce(int), vol.Range(min=0, max=500)
        ),
    }
)

SERVICE_STOP_DYNAMIC_SCENE_SCHEMA = vol.Schema(
    {
        vol.Optional(ATTR_ENTITY_ID): cv.entity_ids,
        vol.Optional(ATTR_RESTORE_STATE): cv.boolean,
    }
)

SERVICE_PAUSE_DYNAMIC_SCENE_SCHEMA = vol.Schema(
    {
        vol.Required(ATTR_ENTITY_ID): cv.entity_ids,
    }
)

SERVICE_RESUME_DYNAMIC_SCENE_SCHEMA = vol.Schema(
    {
        vol.Required(ATTR_ENTITY_ID): cv.entity_ids,
    }
)

SERVICE_SET_MUSIC_SYNC_SCHEMA = vol.Schema(
    {
        vol.Required(ATTR_ENTITY_ID): cv.entity_ids,
        vol.Required(ATTR_ENABLED): cv.boolean,
        vol.Optional(ATTR_SENSITIVITY, default=MUSIC_SYNC_SENSITIVITY_LOW): vol.In(
            VALID_MUSIC_SYNC_SENSITIVITIES
        ),
        vol.Optional(ATTR_AUDIO_EFFECT, default=MUSIC_SYNC_EFFECT_RANDOM): vol.In(
            VALID_MUSIC_SYNC_EFFECTS
        ),
    }
)

SERVICE_START_CIRCADIAN_MODE_SCHEMA = vol.Schema(
    {
        vol.Required(ATTR_ENTITY_ID): cv.entity_ids,
        vol.Optional(ATTR_PRESET): cv.string,
        vol.Optional("solar_steps"): vol.All(
            cv.ensure_list, [SOLAR_STEP_SCHEMA], vol.Length(min=2, max=20)
        ),
        vol.Optional("schedule_steps"): vol.All(
            cv.ensure_list, [SCHEDULE_STEP_SCHEMA], vol.Length(min=2, max=20)
        ),
        vol.Optional("auto_resume_delay"): vol.All(
            vol.Coerce(float), vol.Range(min=0)
        ),
    }
)

SERVICE_STOP_CIRCADIAN_MODE_SCHEMA = vol.Schema(
    {
        vol.Required(ATTR_ENTITY_ID): cv.entity_ids,
    }
)
