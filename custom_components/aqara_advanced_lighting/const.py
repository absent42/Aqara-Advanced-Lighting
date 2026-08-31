"""Constants for the Aqara Advanced Lighting integration."""

from enum import IntFlag, auto
from typing import Final

# Integration domain
DOMAIN: Final = "aqara_advanced_lighting"

# Configuration constants
CONF_BACKEND_TYPE: Final = "backend_type"
CONF_Z2M_BASE_TOPIC: Final = "z2m_base_topic"
CONF_PRESET_FILTER: Final = "preset"
DEFAULT_Z2M_BASE_TOPIC: Final = "zigbee2mqtt"

# Backend types
BACKEND_Z2M: Final = "z2m"
BACKEND_ZHA: Final = "zha"

# Service names
SERVICE_SET_DYNAMIC_EFFECT: Final = "set_dynamic_effect"
SERVICE_STOP_EFFECT: Final = "stop_effect"
SERVICE_SET_SEGMENT_PATTERN: Final = "set_segment_pattern"
SERVICE_CREATE_GRADIENT: Final = "create_gradient"
SERVICE_CREATE_BLOCKS: Final = "create_blocks"
SERVICE_START_CCT_SEQUENCE: Final = "start_cct_sequence"
SERVICE_STOP_CCT_SEQUENCE: Final = "stop_cct_sequence"
SERVICE_PAUSE_CCT_SEQUENCE: Final = "pause_cct_sequence"
SERVICE_RESUME_CCT_SEQUENCE: Final = "resume_cct_sequence"
SERVICE_START_SEGMENT_SEQUENCE: Final = "start_segment_sequence"
SERVICE_STOP_SEGMENT_SEQUENCE: Final = "stop_segment_sequence"
SERVICE_PAUSE_SEGMENT_SEQUENCE: Final = "pause_segment_sequence"
SERVICE_RESUME_SEGMENT_SEQUENCE: Final = "resume_segment_sequence"

# Service attributes
ATTR_Z2M_BASE_TOPIC: Final = "z2m_base_topic"
ATTR_EFFECT: Final = "effect"
ATTR_SPEED: Final = "speed"
ATTR_SYNC: Final = "sync"
ATTR_PRESET: Final = "preset"
ATTR_COLOR_1: Final = "color_1"
ATTR_COLOR_2: Final = "color_2"
ATTR_COLOR_3: Final = "color_3"
ATTR_COLOR_4: Final = "color_4"
ATTR_COLOR_5: Final = "color_5"
ATTR_COLOR_6: Final = "color_6"
ATTR_COLOR_7: Final = "color_7"
ATTR_COLOR_8: Final = "color_8"
ATTR_SEGMENTS: Final = "segments"
ATTR_SEGMENT_COLORS: Final = "segment_colors"
ATTR_BRIGHTNESS: Final = "brightness"
ATTR_TURN_ON: Final = "turn_on"
ATTR_EXPAND: Final = "expand"
ATTR_TURN_OFF_UNSPECIFIED: Final = "turn_off_unspecified"
ATTR_STEPS: Final = "steps"
ATTR_COLOR_TEMP: Final = "color_temp"
ATTR_TRANSITION: Final = "transition"
ATTR_HOLD: Final = "hold"
ATTR_LOOP_MODE: Final = "loop_mode"
ATTR_LOOP_COUNT: Final = "loop_count"
ATTR_END_BEHAVIOR: Final = "end_behavior"
ATTR_CLEAR_SEGMENTS: Final = "clear_segments"
ATTR_SKIP_FIRST_IN_LOOP: Final = "skip_first_in_loop"
ATTR_RESTORE_STATE: Final = "restore_state"
ATTR_MODE: Final = "mode"
ATTR_DURATION: Final = "duration"
ATTR_ACTIVATION_PATTERN: Final = "activation_pattern"
ATTR_ENABLED: Final = "enabled"
ATTR_SENSITIVITY: Final = "sensitivity"
ATTR_AUDIO_EFFECT: Final = "audio_effect"

# MQTT topics
TOPIC_Z2M_BRIDGE_DEVICES: Final = "bridge/devices"
TOPIC_Z2M_DEVICE_SET: Final = "{}/set"
TOPIC_Z2M_DEVICE_GET: Final = "{}/get"

# Z2M payload keys
PAYLOAD_EFFECT: Final = "effect"
PAYLOAD_EFFECT_SPEED: Final = "effect_speed"
PAYLOAD_EFFECT_COLORS: Final = "effect_colors"
PAYLOAD_SEGMENT_COLORS: Final = "segment_colors"
PAYLOAD_EFFECT_SEGMENTS: Final = "effect_segments"

MIN_SPEED: Final = 1
MAX_SPEED: Final = 100

# RGB color constraints
MIN_RGB_VALUE: Final = 0
MAX_RGB_VALUE: Final = 255

# Supported Aqara light models (Z2M model identifiers)
# RGB + CCT models
MODEL_T1M_20_SEGMENT: Final = "lumi.light.acn031"
MODEL_T1M_26_SEGMENT: Final = "lumi.light.acn032"
MODEL_T1_STRIP: Final = "lumi.light.acn132"
MODEL_T2_BULB_E26: Final = "lumi.light.agl001"
MODEL_T2_BULB_E27: Final = "lumi.light.agl003"
MODEL_T2_BULB_GU10_230V: Final = "lumi.light.agl005"
MODEL_T2_BULB_GU10_110V: Final = "lumi.light.agl007"
# CCT-only models (support CCT sequences only, no RGB effects)
MODEL_T2_CCT_E26: Final = "lumi.light.agl002"
MODEL_T2_CCT_E27: Final = "lumi.light.agl004"
MODEL_T2_CCT_GU10_230V: Final = "lumi.light.agl006"
MODEL_T2_CCT_GU10_110V: Final = "lumi.light.agl008"

# T2 RGB models require effect_speed before effect_colors in MQTT payload
# Writing speed restarts the effect with default colors on T2 firmware
T2_RGB_MODELS: Final = frozenset({
    MODEL_T2_BULB_E26,
    MODEL_T2_BULB_E27,
    MODEL_T2_BULB_GU10_230V,
    MODEL_T2_BULB_GU10_110V,
})

# T1-family models that need software-interpolated CCT transitions
# These devices ignore or partially ignore the transition parameter:
# - T1M: Fixed ~2s hardware transition, ignores requested duration
# - T1 Strip: Supports brightness transitions but not color temp transitions
SOFTWARE_TRANSITION_MODELS: Final = frozenset({
    MODEL_T1M_20_SEGMENT,   # lumi.light.acn031
    MODEL_T1M_26_SEGMENT,   # lumi.light.acn032
    MODEL_T1_STRIP,         # lumi.light.acn132
})

# T1M models have a fixed ~2s hardware transition that smooths each sub-step
T1M_MODELS: Final = frozenset({
    MODEL_T1M_20_SEGMENT,
    MODEL_T1M_26_SEGMENT,
})

# Minimum step intervals for software-interpolated transitions (seconds)
# T1M: Longer interval since hardware provides ~2s smoothing between steps
# T1 Strip: Shorter interval since color temp changes are instant
SOFTWARE_TRANSITION_T1M_INTERVAL: Final = 2.0
SOFTWARE_TRANSITION_T1_STRIP_INTERVAL: Final = 0.5

# T1 Strip segment density and defaults
T1_STRIP_SEGMENTS_PER_METER: Final = 5
T1_STRIP_DEFAULT_SEGMENT_COUNT: Final = 10  # 2 meters

# Maximum strip segments an image may be projected across. At the T1 strip's
# 5 segments per metre this is 12 metres of strip; T1M is fixed at 20 or 26,
# and segment_utils already guards at 100.
MAX_PROJECTION_SEGMENTS: Final = 60

# HSP perceived brightness below which a projected segment is left unlit rather
# than colored. Segments carry chromaticity only, so brightness cannot be varied
# per segment -- where this boundary sits is the only way projection can convey
# darkness at all.
#
# The metric is sqrt(0.299*R^2 + 0.587*G^2 + 0.114*B^2) over 0-1 channels, NOT
# plain Rec. 601 luma. Do not "simplify" it back to the linear form: linear luma
# caps pure blue at its 0.114 coefficient, which is below this threshold, so blue
# would be unreachable at any intensity and every blue region of an image would
# project as unlit. Squaring first and taking the root afterwards lifts saturated
# hues clear of their coefficients (pure blue scores 0.338) while leaving greys
# untouched -- the weights sum to 1, so a grey scores exactly its own normalised
# value and the threshold keeps its plain meaning.
#
# _MIN_CHANNEL is deliberately not reused here: at 5/255 it is a reproducibility
# floor ("can a light show this color"), not an on/off decision, and at ~2% it
# never fires on real photographs.
PROJECTION_DARK_THRESHOLD: Final = 0.12

# Brightness constraints (UI uses percentage, devices use 1-255)
MIN_BRIGHTNESS_PERCENT: Final = 1  # Minimum percentage for UI
MAX_BRIGHTNESS_PERCENT: Final = 100  # Maximum percentage for UI

# CCT sequence constraints
MIN_COLOR_TEMP_KELVIN: Final = 2700
MAX_COLOR_TEMP_KELVIN: Final = 6500
MIN_TRANSITION_TIME: Final = 0.0
MAX_TRANSITION_TIME: Final = 3600.0  # 1 hour
MIN_HOLD_TIME: Final = 0.0
MAX_HOLD_TIME: Final = 43200.0  # 12 hours
MIN_SEQUENCE_STEPS: Final = 1
MAX_SEQUENCE_STEPS: Final = 20
MIN_LOOP_COUNT: Final = 1
MAX_LOOP_COUNT: Final = 100

# Smooth transition settings using light's built-in transition capability
# These values balance smoothness with command overhead
MIN_TRANSITION_STEPS: Final = 10  # Minimum steps for any transition (ensures smooth easing even for short transitions)

# CCT sequence loop modes
LOOP_MODE_ONCE: Final = "once"
LOOP_MODE_COUNT: Final = "count"
LOOP_MODE_CONTINUOUS: Final = "continuous"

# Sequence end behaviors (used by CCT sequences, dynamic scenes, and segment sequences)
END_BEHAVIOR_MAINTAIN: Final = "maintain"
END_BEHAVIOR_RESTORE: Final = "restore"
END_BEHAVIOR_TURN_OFF: Final = "turn_off"

# Segment sequence modes
SEGMENT_MODE_BLOCKS_REPEAT: Final = "blocks_repeat"
SEGMENT_MODE_BLOCKS_EXPAND: Final = "blocks_expand"
SEGMENT_MODE_GRADIENT: Final = "gradient"

# Segment sequence activation patterns
ACTIVATION_ALL: Final = "all"
ACTIVATION_SEQUENTIAL_FORWARD: Final = "sequential_forward"
ACTIVATION_SEQUENTIAL_REVERSE: Final = "sequential_reverse"
ACTIVATION_RANDOM: Final = "random"
ACTIVATION_PING_PONG: Final = "ping_pong"
ACTIVATION_CENTER_OUT: Final = "center_out"
ACTIVATION_EDGES_IN: Final = "edges_in"
ACTIVATION_PAIRED: Final = "paired"

# Music sync constants (T1 Strip audio-reactive mode)
MUSIC_SYNC_SENSITIVITY_LOW: Final = "low"
MUSIC_SYNC_SENSITIVITY_HIGH: Final = "high"
MUSIC_SYNC_EFFECT_RANDOM: Final = "random"
MUSIC_SYNC_EFFECT_BLINK: Final = "blink"
MUSIC_SYNC_EFFECT_RAINBOW: Final = "rainbow"
MUSIC_SYNC_EFFECT_WAVE: Final = "wave"

VALID_MUSIC_SYNC_SENSITIVITIES: Final = {
    MUSIC_SYNC_SENSITIVITY_LOW,
    MUSIC_SYNC_SENSITIVITY_HIGH,
}

VALID_MUSIC_SYNC_EFFECTS: Final = {
    MUSIC_SYNC_EFFECT_RANDOM,
    MUSIC_SYNC_EFFECT_BLINK,
    MUSIC_SYNC_EFFECT_RAINBOW,
    MUSIC_SYNC_EFFECT_WAVE,
}

# Music sync Z2M MQTT payload keys
PAYLOAD_AUDIO: Final = "audio"
PAYLOAD_AUDIO_SENSITIVITY: Final = "audio_sensitivity"
PAYLOAD_AUDIO_EFFECT: Final = "audio_effect"

# Music sync ZHA enum mappings
MUSIC_SYNC_EFFECT_ENUM: Final = {
    MUSIC_SYNC_EFFECT_RANDOM: 0,
    MUSIC_SYNC_EFFECT_BLINK: 1,
    MUSIC_SYNC_EFFECT_RAINBOW: 2,
    MUSIC_SYNC_EFFECT_WAVE: 3,
}

MUSIC_SYNC_SENSITIVITY_ENUM: Final = {
    MUSIC_SYNC_SENSITIVITY_LOW: 0,
    MUSIC_SYNC_SENSITIVITY_HIGH: 2,
}

# On-device audio opt-in configuration keys
CONF_AUDIO_ON_SERVICE: Final = "audio_on_service"
CONF_AUDIO_OFF_SERVICE: Final = "audio_off_service"
CONF_AUDIO_ON_SERVICE_DATA: Final = "audio_on_service_data"
CONF_AUDIO_OFF_SERVICE_DATA: Final = "audio_off_service_data"

# Audio-reactive dynamic scene constants
AUDIO_COLOR_ADVANCE_ON_ONSET: Final = "on_onset"
AUDIO_COLOR_ADVANCE_CONTINUOUS: Final = "continuous"
AUDIO_COLOR_ADVANCE_BEAT_PREDICTIVE: Final = "beat_predictive"
AUDIO_COLOR_ADVANCE_INTENSITY_BREATHING: Final = "intensity_breathing"
AUDIO_COLOR_ADVANCE_ONSET_FLASH: Final = "onset_flash"
# Pro-tier audio modes (audio-reactive pro DSP).
AUDIO_COLOR_ADVANCE_BASS_KICK: Final = "bass_kick"
AUDIO_COLOR_ADVANCE_FREQ_TO_HUE: Final = "freq_to_hue"

VALID_AUDIO_COLOR_ADVANCE: Final = [
    AUDIO_COLOR_ADVANCE_ON_ONSET,
    AUDIO_COLOR_ADVANCE_CONTINUOUS,
    AUDIO_COLOR_ADVANCE_BEAT_PREDICTIVE,
    AUDIO_COLOR_ADVANCE_INTENSITY_BREATHING,
    AUDIO_COLOR_ADVANCE_ONSET_FLASH,
    AUDIO_COLOR_ADVANCE_BASS_KICK,
    AUDIO_COLOR_ADVANCE_FREQ_TO_HUE,
]

# Audio detection mode constants
AUDIO_DETECTION_MODE_SPECTRAL_FLUX: Final = "spectral_flux"
AUDIO_DETECTION_MODE_BASS_ENERGY: Final = "bass_energy"
AUDIO_DETECTION_MODE_COMPLEX_DOMAIN: Final = "complex_domain"
VALID_AUDIO_DETECTION_MODES: Final = [
    AUDIO_DETECTION_MODE_SPECTRAL_FLUX,
    AUDIO_DETECTION_MODE_BASS_ENERGY,
    AUDIO_DETECTION_MODE_COMPLEX_DOMAIN,
]
DEFAULT_AUDIO_DETECTION_MODE: Final = AUDIO_DETECTION_MODE_SPECTRAL_FLUX

# Audio prediction, silence, and frequency zone constants
MIN_AUDIO_PREDICTION_AGGRESSIVENESS: Final = 1
MAX_AUDIO_PREDICTION_AGGRESSIVENESS: Final = 100
DEFAULT_AUDIO_PREDICTION_AGGRESSIVENESS: Final = 50
DEFAULT_LATENCY_COMPENSATION_MS: Final = 150

DEFAULT_AUDIO_FREQUENCY_ZONE: Final = False

# Shared audio signal processing parameters
AUDIO_EMA_ALPHA: Final = 0.05  # EMA smoothing factor (~2-4s window at 20Hz)
AUDIO_FLASH_BRIGHTNESS_DECAY: Final = 0.02  # Per-tick flash brightness decay

SILENCE_DEGRADATION_BLEND_SECONDS: Final = 5.0
SILENCE_DEGRADATION_STEP_SECONDS: Final = 12.0
AUDIO_SCENE_SILENCE_DECAY_SECONDS: Final = 3.0  # matches effect modulator decay duration

# Audio parameter constraints
MIN_AUDIO_SENSITIVITY: Final = 1
MAX_AUDIO_SENSITIVITY: Final = 100
DEFAULT_AUDIO_SENSITIVITY: Final = 50
MIN_AUDIO_TRANSITION_SPEED: Final = 1
MAX_AUDIO_TRANSITION_SPEED: Final = 100
DEFAULT_AUDIO_TRANSITION_SPEED: Final = 50

# Audio sensor unavailability timeout (seconds)
AUDIO_SENSOR_UNAVAILABLE_TIMEOUT: Final = 60.0

# T1 Strip audio mode mapping
T1_STRIP_AUDIO_SENSITIVITY_CUTOFF: Final = 50

# Runtime data key for active music sync tracking
DATA_ACTIVE_MUSIC_SYNC: Final = "active_music_sync"

# Audio-reactive effect modulation modes
AUDIO_EFFECT_MODE_VOLUME: Final = "volume"
AUDIO_EFFECT_MODE_TEMPO: Final = "tempo"
AUDIO_EFFECT_MODE_COMBINED: Final = "combined"
VALID_AUDIO_EFFECT_MODES: Final = [
    AUDIO_EFFECT_MODE_VOLUME,
    AUDIO_EFFECT_MODE_TEMPO,
    AUDIO_EFFECT_MODE_COMBINED,
]

# Audio-reactive response curves
AUDIO_RESPONSE_CURVE_LINEAR: Final = "linear"
AUDIO_RESPONSE_CURVE_LOGARITHMIC: Final = "logarithmic"
AUDIO_RESPONSE_CURVE_EXPONENTIAL: Final = "exponential"
VALID_AUDIO_RESPONSE_CURVES: Final = [
    AUDIO_RESPONSE_CURVE_LINEAR,
    AUDIO_RESPONSE_CURVE_LOGARITHMIC,
    AUDIO_RESPONSE_CURVE_EXPONENTIAL,
]
DEFAULT_AUDIO_RESPONSE_CURVE: Final = AUDIO_RESPONSE_CURVE_LINEAR

# Audio-reactive silence behaviors
AUDIO_SILENCE_HOLD: Final = "hold"
AUDIO_SILENCE_DECAY_MIN: Final = "decay_min"
AUDIO_SILENCE_DECAY_MID: Final = "decay_mid"
AUDIO_SILENCE_SLOW_CYCLE: Final = "slow_cycle"
VALID_AUDIO_SILENCE_BEHAVIORS: Final = [
    AUDIO_SILENCE_HOLD,
    AUDIO_SILENCE_DECAY_MIN,
    AUDIO_SILENCE_DECAY_MID,
    AUDIO_SILENCE_SLOW_CYCLE,
]
DEFAULT_AUDIO_SILENCE_BEHAVIOR: Final = AUDIO_SILENCE_DECAY_MIN

# Deadband thresholds to prevent redundant Zigbee writes
SPEED_DEADBAND: Final = 4
BRIGHTNESS_DEADBAND: Final = 5

# Audio effect silence decay duration (seconds)
AUDIO_EFFECT_SILENCE_DECAY_SECONDS: Final = 3.0

# Audio effect service data attribute keys
ATTR_AUDIO_ENTITY: Final = "audio_entity"
ATTR_AUDIO_SENSITIVITY: Final = "audio_sensitivity"
ATTR_AUDIO_DETECTION_MODE: Final = "audio_detection_mode"
ATTR_AUDIO_SILENCE_BEHAVIOR: Final = "audio_silence_behavior"
ATTR_AUDIO_SPEED_MODE: Final = "audio_speed_mode"
ATTR_AUDIO_SPEED_MIN: Final = "audio_speed_min"
ATTR_AUDIO_SPEED_MAX: Final = "audio_speed_max"
ATTR_AUDIO_SPEED_CURVE: Final = "audio_speed_curve"

MIN_DURATION: Final = 0.0
MAX_DURATION: Final = 3600.0  # 1 hour

# Runtime data storage keys
DATA_AUDIO_ENGINE_REGISTRY: Final = "audio_engine_registry"
DATA_STATE_MANAGER: Final = "state_manager"
DATA_CCT_SEQUENCE_MANAGER: Final = "cct_sequence_manager"
DATA_SEGMENT_SEQUENCE_MANAGER: Final = "segment_sequence_manager"
DATA_FAVORITES_STORE: Final = "favorites_store"
DATA_PRESET_STORE: Final = "preset_store"
DATA_USER_PREFERENCES_STORE: Final = "user_preferences_store"
DATA_SEGMENT_ZONE_STORE: Final = "segment_zone_store"
DATA_SERVICE_SCHEMA_MANAGER: Final = "service_schema_manager"

# Valid sort options for user preferences (validated in backend)
VALID_SORT_OPTIONS: Final = {"custom", "name-asc", "name-desc", "date-new", "date-old"}

# Color history constraints
MAX_COLOR_HISTORY_SIZE: Final = 8

# User preset type constants
PRESET_TYPE_EFFECT: Final = "effect"
PRESET_TYPE_SEGMENT_PATTERN: Final = "segment_pattern"
PRESET_TYPE_CCT_SEQUENCE: Final = "cct_sequence"
PRESET_TYPE_SEGMENT_SEQUENCE: Final = "segment_sequence"

# Dynamic scene preset type
PRESET_TYPE_DYNAMIC_SCENE: Final = "dynamic_scene"

VALID_PRESET_TYPES: Final = [
    PRESET_TYPE_EFFECT,
    PRESET_TYPE_SEGMENT_PATTERN,
    PRESET_TYPE_CCT_SEQUENCE,
    PRESET_TYPE_SEGMENT_SEQUENCE,
    PRESET_TYPE_DYNAMIC_SCENE,
]

# Dynamic scene distribution modes
DISTRIBUTION_SHUFFLE_ROTATE: Final = "shuffle_rotate"
DISTRIBUTION_SYNCHRONIZED: Final = "synchronized"
DISTRIBUTION_RANDOM: Final = "random"

VALID_DISTRIBUTION_MODES: Final = [
    DISTRIBUTION_SHUFFLE_ROTATE,
    DISTRIBUTION_SYNCHRONIZED,
    DISTRIBUTION_RANDOM,
]

# Dynamic scene timing constraints (seconds)
MIN_DYNAMIC_SCENE_TRANSITION_TIME: Final = 30.0
MAX_DYNAMIC_SCENE_TRANSITION_TIME: Final = 3600.0  # 1 hour
MIN_DYNAMIC_SCENE_HOLD_TIME: Final = 0.0
MAX_DYNAMIC_SCENE_HOLD_TIME: Final = 3600.0  # 1 hour
DEFAULT_DYNAMIC_SCENE_TRANSITION_TIME: Final = 120.0  # 2 minutes
DEFAULT_DYNAMIC_SCENE_HOLD_TIME: Final = 180.0  # 3 minutes

# Dynamic scene color constraints
MIN_DYNAMIC_SCENE_COLORS: Final = 1
MAX_DYNAMIC_SCENE_COLORS: Final = 8

# Dynamic scene ripple offset constraints (seconds)
MIN_OFFSET_DELAY: Final = 0.0
MAX_OFFSET_DELAY: Final = 120.0  # 2 minutes

# Dynamic scene sequence type for events
SEQUENCE_TYPE_DYNAMIC_SCENE: Final = "dynamic_scene"

# Dynamic scene service names
SERVICE_START_DYNAMIC_SCENE: Final = "start_dynamic_scene"
SERVICE_STOP_DYNAMIC_SCENE: Final = "stop_dynamic_scene"
SERVICE_PAUSE_DYNAMIC_SCENE: Final = "pause_dynamic_scene"
SERVICE_RESUME_DYNAMIC_SCENE: Final = "resume_dynamic_scene"

# Dynamic scene event types
EVENT_DYNAMIC_SCENE_STARTED: Final = f"{DOMAIN}_dynamic_scene_started"
EVENT_DYNAMIC_SCENE_PAUSED: Final = f"{DOMAIN}_dynamic_scene_paused"
EVENT_DYNAMIC_SCENE_RESUMED: Final = f"{DOMAIN}_dynamic_scene_resumed"
EVENT_DYNAMIC_SCENE_STOPPED: Final = f"{DOMAIN}_dynamic_scene_stopped"
EVENT_DYNAMIC_SCENE_LOOP_COMPLETED: Final = f"{DOMAIN}_dynamic_scene_loop_completed"
EVENT_DYNAMIC_SCENE_FINISHED: Final = f"{DOMAIN}_dynamic_scene_finished"

# HA event fired when running-operations state mutates.
# Carries no payload - subscribers refetch via /api/aqara_advanced_lighting/running_operations.
EVENT_OPERATIONS_CHANGED: Final = f"{DOMAIN}_operations_changed"

# Dynamic scene runtime data key
DATA_DYNAMIC_SCENE_MANAGER: Final = "dynamic_scene_manager"

# Entity controller constants
INTEGRATION_CONTEXT_PARENT_ID: Final = "aal_entity_control"
DATA_ENTITY_CONTROLLER: Final = "entity_controller"
EVENT_ENTITY_EXTERNALLY_CONTROLLED: Final = f"{DOMAIN}_entity_externally_controlled"
EVENT_ENTITY_CONTROL_RESUMED: Final = f"{DOMAIN}_entity_control_resumed"
SERVICE_SET_MUSIC_SYNC: Final = "set_music_sync"
SERVICE_RESUME_ENTITY_CONTROL: Final = "resume_entity_control"
SERVICE_START_CIRCADIAN_MODE: Final = "start_circadian_mode"
SERVICE_STOP_CIRCADIAN_MODE: Final = "stop_circadian_mode"
DATA_CIRCADIAN_MANAGER: Final = "circadian_manager"


class OverrideAttributes(IntFlag):
    """Attributes that can be individually overridden by external changes."""

    NONE = 0
    BRIGHTNESS = auto()
    COLOR = auto()
    ALL = BRIGHTNESS | COLOR


DEFAULT_OVERRIDE_CONTROL_MODE: Final = "pause_all"

# Music sync event types
EVENT_MUSIC_SYNC_ENABLED: Final = f"{DOMAIN}_music_sync_enabled"
EVENT_MUSIC_SYNC_DISABLED: Final = f"{DOMAIN}_music_sync_disabled"

# Music sync event data keys
EVENT_ATTR_SENSITIVITY: Final = "sensitivity"
EVENT_ATTR_AUDIO_EFFECT: Final = "audio_effect"

# Event types for automation triggers
EVENT_SEQUENCE_STARTED: Final = f"{DOMAIN}_sequence_started"
EVENT_SEQUENCE_COMPLETED: Final = f"{DOMAIN}_sequence_completed"
EVENT_SEQUENCE_STOPPED: Final = f"{DOMAIN}_sequence_stopped"
EVENT_STEP_CHANGED: Final = f"{DOMAIN}_step_changed"
EVENT_SEQUENCE_PAUSED: Final = f"{DOMAIN}_sequence_paused"
EVENT_SEQUENCE_RESUMED: Final = f"{DOMAIN}_sequence_resumed"
EVENT_EFFECT_ACTIVATED: Final = f"{DOMAIN}_effect_activated"
EVENT_EFFECT_STOPPED: Final = f"{DOMAIN}_effect_stopped"

# Event data keys
EVENT_ATTR_ENTITY_ID: Final = "entity_id"
EVENT_ATTR_SEQUENCE_ID: Final = "sequence_id"
EVENT_ATTR_STEP_INDEX: Final = "step_index"
EVENT_ATTR_TOTAL_STEPS: Final = "total_steps"
EVENT_ATTR_LOOP_ITERATION: Final = "loop_iteration"
EVENT_ATTR_EFFECT_TYPE: Final = "effect_type"
EVENT_ATTR_PRESET: Final = "preset"
EVENT_ATTR_REASON: Final = "reason"
EVENT_ATTR_SEQUENCE_TYPE: Final = "sequence_type"

# Sequence type values (used in event data to distinguish CCT from segment sequences)
SEQUENCE_TYPE_CCT: Final = "cct"
SEQUENCE_TYPE_SEGMENT: Final = "segment"

# Device trigger types for HA automation UI
TRIGGER_TYPE_CCT_SEQUENCE_STARTED: Final = "cct_sequence_started"
TRIGGER_TYPE_CCT_SEQUENCE_COMPLETED: Final = "cct_sequence_completed"
TRIGGER_TYPE_CCT_SEQUENCE_STOPPED: Final = "cct_sequence_stopped"
TRIGGER_TYPE_CCT_SEQUENCE_STEP_CHANGED: Final = "cct_sequence_step_changed"
TRIGGER_TYPE_SEGMENT_SEQUENCE_STARTED: Final = "segment_sequence_started"
TRIGGER_TYPE_SEGMENT_SEQUENCE_COMPLETED: Final = "segment_sequence_completed"
TRIGGER_TYPE_SEGMENT_SEQUENCE_STOPPED: Final = "segment_sequence_stopped"
TRIGGER_TYPE_SEGMENT_SEQUENCE_STEP_CHANGED: Final = "segment_sequence_step_changed"
TRIGGER_TYPE_CCT_SEQUENCE_PAUSED: Final = "cct_sequence_paused"
TRIGGER_TYPE_CCT_SEQUENCE_RESUMED: Final = "cct_sequence_resumed"
TRIGGER_TYPE_SEGMENT_SEQUENCE_PAUSED: Final = "segment_sequence_paused"
TRIGGER_TYPE_SEGMENT_SEQUENCE_RESUMED: Final = "segment_sequence_resumed"
TRIGGER_TYPE_EFFECT_ACTIVATED: Final = "effect_activated"
TRIGGER_TYPE_EFFECT_STOPPED: Final = "effect_stopped"
TRIGGER_TYPE_DYNAMIC_SCENE_STARTED: Final = "dynamic_scene_started"
TRIGGER_TYPE_DYNAMIC_SCENE_PAUSED: Final = "dynamic_scene_paused"
TRIGGER_TYPE_DYNAMIC_SCENE_RESUMED: Final = "dynamic_scene_resumed"
TRIGGER_TYPE_DYNAMIC_SCENE_STOPPED: Final = "dynamic_scene_stopped"
TRIGGER_TYPE_DYNAMIC_SCENE_LOOP_COMPLETED: Final = "dynamic_scene_loop_completed"
TRIGGER_TYPE_DYNAMIC_SCENE_FINISHED: Final = "dynamic_scene_finished"
TRIGGER_TYPE_MUSIC_SYNC_ENABLED: Final = "music_sync_enabled"
TRIGGER_TYPE_MUSIC_SYNC_DISABLED: Final = "music_sync_disabled"

# All device trigger types
TRIGGER_TYPES: Final = {
    TRIGGER_TYPE_CCT_SEQUENCE_STARTED,
    TRIGGER_TYPE_CCT_SEQUENCE_COMPLETED,
    TRIGGER_TYPE_CCT_SEQUENCE_STOPPED,
    TRIGGER_TYPE_CCT_SEQUENCE_STEP_CHANGED,
    TRIGGER_TYPE_CCT_SEQUENCE_PAUSED,
    TRIGGER_TYPE_CCT_SEQUENCE_RESUMED,
    TRIGGER_TYPE_SEGMENT_SEQUENCE_STARTED,
    TRIGGER_TYPE_SEGMENT_SEQUENCE_COMPLETED,
    TRIGGER_TYPE_SEGMENT_SEQUENCE_STOPPED,
    TRIGGER_TYPE_SEGMENT_SEQUENCE_STEP_CHANGED,
    TRIGGER_TYPE_SEGMENT_SEQUENCE_PAUSED,
    TRIGGER_TYPE_SEGMENT_SEQUENCE_RESUMED,
    TRIGGER_TYPE_EFFECT_ACTIVATED,
    TRIGGER_TYPE_EFFECT_STOPPED,
    TRIGGER_TYPE_DYNAMIC_SCENE_STARTED,
    TRIGGER_TYPE_DYNAMIC_SCENE_PAUSED,
    TRIGGER_TYPE_DYNAMIC_SCENE_RESUMED,
    TRIGGER_TYPE_DYNAMIC_SCENE_STOPPED,
    TRIGGER_TYPE_DYNAMIC_SCENE_LOOP_COMPLETED,
    TRIGGER_TYPE_DYNAMIC_SCENE_FINISHED,
    TRIGGER_TYPE_MUSIC_SYNC_ENABLED,
    TRIGGER_TYPE_MUSIC_SYNC_DISABLED,
}

# Trigger type groupings for preset filtering
CCT_TRIGGER_TYPES: Final = {
    TRIGGER_TYPE_CCT_SEQUENCE_STARTED,
    TRIGGER_TYPE_CCT_SEQUENCE_COMPLETED,
    TRIGGER_TYPE_CCT_SEQUENCE_STOPPED,
    TRIGGER_TYPE_CCT_SEQUENCE_STEP_CHANGED,
    TRIGGER_TYPE_CCT_SEQUENCE_PAUSED,
    TRIGGER_TYPE_CCT_SEQUENCE_RESUMED,
}

SEGMENT_TRIGGER_TYPES: Final = {
    TRIGGER_TYPE_SEGMENT_SEQUENCE_STARTED,
    TRIGGER_TYPE_SEGMENT_SEQUENCE_COMPLETED,
    TRIGGER_TYPE_SEGMENT_SEQUENCE_STOPPED,
    TRIGGER_TYPE_SEGMENT_SEQUENCE_STEP_CHANGED,
    TRIGGER_TYPE_SEGMENT_SEQUENCE_PAUSED,
    TRIGGER_TYPE_SEGMENT_SEQUENCE_RESUMED,
}

EFFECT_TRIGGER_TYPES: Final = {
    TRIGGER_TYPE_EFFECT_ACTIVATED,
    TRIGGER_TYPE_EFFECT_STOPPED,
}

DYNAMIC_SCENE_TRIGGER_TYPES: Final = {
    TRIGGER_TYPE_DYNAMIC_SCENE_STARTED,
    TRIGGER_TYPE_DYNAMIC_SCENE_PAUSED,
    TRIGGER_TYPE_DYNAMIC_SCENE_RESUMED,
    TRIGGER_TYPE_DYNAMIC_SCENE_STOPPED,
    TRIGGER_TYPE_DYNAMIC_SCENE_LOOP_COMPLETED,
    TRIGGER_TYPE_DYNAMIC_SCENE_FINISHED,
}

MUSIC_SYNC_TRIGGER_TYPES: Final = {
    TRIGGER_TYPE_MUSIC_SYNC_ENABLED,
    TRIGGER_TYPE_MUSIC_SYNC_DISABLED,
}

# Device condition types for HA automation UI
CONDITION_TYPE_CCT_SEQUENCE_RUNNING: Final = "cct_sequence_running"
CONDITION_TYPE_CCT_SEQUENCE_PAUSED: Final = "cct_sequence_paused"
CONDITION_TYPE_SEGMENT_SEQUENCE_RUNNING: Final = "segment_sequence_running"
CONDITION_TYPE_SEGMENT_SEQUENCE_PAUSED: Final = "segment_sequence_paused"
CONDITION_TYPE_EFFECT_ACTIVE: Final = "effect_active"
CONDITION_TYPE_DYNAMIC_SCENE_RUNNING: Final = "dynamic_scene_running"
CONDITION_TYPE_DYNAMIC_SCENE_PAUSED: Final = "dynamic_scene_paused"
CONDITION_TYPE_MUSIC_SYNC_ACTIVE: Final = "music_sync_active"

# All device condition types
CONDITION_TYPES: Final = {
    CONDITION_TYPE_CCT_SEQUENCE_RUNNING,
    CONDITION_TYPE_CCT_SEQUENCE_PAUSED,
    CONDITION_TYPE_SEGMENT_SEQUENCE_RUNNING,
    CONDITION_TYPE_SEGMENT_SEQUENCE_PAUSED,
    CONDITION_TYPE_EFFECT_ACTIVE,
    CONDITION_TYPE_DYNAMIC_SCENE_RUNNING,
    CONDITION_TYPE_DYNAMIC_SCENE_PAUSED,
    CONDITION_TYPE_MUSIC_SYNC_ACTIVE,
}

# Condition type groupings for preset filtering
CCT_CONDITION_TYPES: Final = {
    CONDITION_TYPE_CCT_SEQUENCE_RUNNING,
    CONDITION_TYPE_CCT_SEQUENCE_PAUSED,
}

SEGMENT_CONDITION_TYPES: Final = {
    CONDITION_TYPE_SEGMENT_SEQUENCE_RUNNING,
    CONDITION_TYPE_SEGMENT_SEQUENCE_PAUSED,
}

EFFECT_CONDITION_TYPES: Final = {
    CONDITION_TYPE_EFFECT_ACTIVE,
}

DYNAMIC_SCENE_CONDITION_TYPES: Final = {
    CONDITION_TYPE_DYNAMIC_SCENE_RUNNING,
    CONDITION_TYPE_DYNAMIC_SCENE_PAUSED,
}

MUSIC_SYNC_CONDITION_TYPES: Final = {
    CONDITION_TYPE_MUSIC_SYNC_ACTIVE,
}

# Friendly model names for device registry display
MODEL_FRIENDLY_NAMES: Final = {
    MODEL_T1M_20_SEGMENT: "T1M ceiling light (20 segments)",
    MODEL_T1M_26_SEGMENT: "T1M ceiling light (26 segments)",
    MODEL_T1_STRIP: "T1 LED strip",
    MODEL_T2_BULB_E26: "T2 RGB+CCT bulb (E26)",
    MODEL_T2_BULB_E27: "T2 RGB+CCT bulb (E27)",
    MODEL_T2_BULB_GU10_230V: "T2 RGB+CCT bulb (GU10 230V)",
    MODEL_T2_BULB_GU10_110V: "T2 RGB+CCT bulb (GU10 110V)",
    MODEL_T2_CCT_E26: "T2 CCT bulb (E26)",
    MODEL_T2_CCT_E27: "T2 CCT bulb (E27)",
    MODEL_T2_CCT_GU10_230V: "T2 CCT bulb (GU10 230V)",
    MODEL_T2_CCT_GU10_110V: "T2 CCT bulb (GU10 110V)",
}

# Effect presets from Aqara app
# T2 Bulb presets
PRESET_T2_CANDLELIGHT: Final = "t2_candlelight"
PRESET_T2_BREATH: Final = "t2_breath"
PRESET_T2_COLORFUL: Final = "t2_colorful"
PRESET_T2_SECURITY: Final = "t2_security"

# T1M presets
PRESET_T1M_DINNER: Final = "t1m_dinner"
PRESET_T1M_SUNSET: Final = "t1m_sunset"
PRESET_T1M_AUTUMN: Final = "t1m_autumn"
PRESET_T1M_GALAXY: Final = "t1m_galaxy"
PRESET_T1M_DAYDREAM: Final = "t1m_daydream"
PRESET_T1M_HOLIDAY: Final = "t1m_holiday"
PRESET_T1M_PARTY: Final = "t1m_party"
PRESET_T1M_METEOR: Final = "t1m_meteor"
PRESET_T1M_ALERT: Final = "t1m_alert"

# T1 Strip presets
PRESET_T1_STRIP_RAINBOW: Final = "t1_strip_rainbow"
PRESET_T1_STRIP_HEARTBEAT: Final = "t1_strip_heartbeat"
PRESET_T1_STRIP_GALA: Final = "t1_strip_gala"
PRESET_T1_STRIP_SEA_OF_FLOWERS: Final = "t1_strip_sea_of_flowers"
PRESET_T1_STRIP_RHYTHMIC: Final = "t1_strip_rhythmic"
PRESET_T1_STRIP_EXCITING: Final = "t1_strip_exciting"
PRESET_T1_STRIP_COLORFUL: Final = "t1_strip_colorful"

# Audio-reactive built-in effect presets
PRESET_T1M_LITTLE_FLUFFY_CLOUDS: Final = "t1m_little_fluffy_clouds"
PRESET_T1M_WAREHOUSE: Final = "t1m_warehouse"
PRESET_T1M_TANGERINE_DREAM: Final = "t1m_tangerine_dream"
PRESET_T1M_RIDE_THE_LIGHTNING: Final = "t1m_ride_the_lightning"

PRESET_T1_STRIP_THUNDERSTRUCK: Final = "t1_strip_thunderstruck"
PRESET_T1_STRIP_LUCY_IN_THE_SKY: Final = "t1_strip_lucy_in_the_sky"
PRESET_T1_STRIP_RUNNING_UP_THAT_HILL: Final = "t1_strip_running_up_that_hill"
PRESET_T1_STRIP_NEON: Final = "t1_strip_neon"

# CCT sequence presets
PRESET_CCT_GOODNIGHT: Final = "goodnight"
PRESET_CCT_WAKEUP: Final = "wakeup"
PRESET_CCT_POWER_NAP: Final = "power_nap"
PRESET_CCT_MINDFUL_BREATHING: Final = "mindful_breathing"
PRESET_CCT_CIRCADIAN: Final = "circadian"
PRESET_CCT_SOLAR_WARM: Final = "solar_warm"
PRESET_CCT_SOLAR_PRODUCTIVE: Final = "solar_productive"

CCT_MODE_STANDARD: Final = "standard"
CCT_MODE_SOLAR: Final = "solar"
CCT_MODE_SCHEDULE: Final = "schedule"
VALID_CCT_MODES: Final = [CCT_MODE_STANDARD, CCT_MODE_SOLAR, CCT_MODE_SCHEDULE]
SOLAR_STEP_PHASE_RISING: Final = "rising"
SOLAR_STEP_PHASE_SETTING: Final = "setting"
SOLAR_STEP_PHASE_ANY: Final = "any"
VALID_SOLAR_PHASES: Final = [SOLAR_STEP_PHASE_RISING, SOLAR_STEP_PHASE_SETTING, SOLAR_STEP_PHASE_ANY]

# Preset definitions
# Built-in preset dictionaries have been moved to presets.py
# Import them from there:
#   from .presets import (
#       EFFECT_PRESETS,
#       SEGMENT_PATTERN_PRESETS,
#       CCT_SEQUENCE_PRESETS,
#       SEGMENT_SEQUENCE_PRESETS,
#       DYNAMIC_SCENE_PRESETS,
#   )

# Segment pattern presets (T1M and T1 Strip)
PRESET_SEGMENT_1: Final = "segment_1"
PRESET_SEGMENT_2: Final = "segment_2"
PRESET_SEGMENT_3: Final = "segment_3"
PRESET_SEGMENT_4: Final = "segment_4"
PRESET_SEGMENT_5: Final = "segment_5"
PRESET_SEGMENT_6: Final = "segment_6"
PRESET_SEGMENT_7: Final = "segment_7"
PRESET_SEGMENT_8: Final = "segment_8"
PRESET_SEGMENT_9: Final = "segment_9"
PRESET_SEGMENT_10: Final = "segment_10"
PRESET_SEGMENT_11: Final = "segment_11"
PRESET_SEGMENT_12: Final = "segment_12"

# Segment sequence presets
PRESET_SEGMENT_SEQ_LOADING_BAR: Final = "loading_bar"
PRESET_SEGMENT_SEQ_WAVE: Final = "wave"
PRESET_SEGMENT_SEQ_SPARKLE: Final = "sparkle"
PRESET_SEGMENT_SEQ_THEATER_CHASE: Final = "theater_chase"
PRESET_SEGMENT_SEQ_RAINBOW_FILL: Final = "rainbow_fill"
PRESET_SEGMENT_SEQ_STELLA_BLUE: Final = "stella_blue"

# Image processing constants
MAX_IMAGE_SIZE_BYTES: Final = 10 * 1024 * 1024  # 10 MB
THUMBNAIL_MAX_DIMENSION: Final = 300  # Max width or height in pixels
THUMBNAIL_JPEG_QUALITY: Final = 85
DEFAULT_EXTRACTED_COLORS: Final = 8
THUMBNAIL_STORAGE_DIR: Final = "aqara_thumbnails"

# Utility functions
def brightness_percent_to_device(percent: int) -> int:
    """Convert brightness percentage (1-100) to device value (1-255).

    Args:
        percent: Brightness percentage (1-100)

    Returns:
        Device brightness value (1-255)
    """
    if percent < MIN_BRIGHTNESS_PERCENT or percent > MAX_BRIGHTNESS_PERCENT:
        msg = f"Brightness percentage must be {MIN_BRIGHTNESS_PERCENT}-{MAX_BRIGHTNESS_PERCENT}, got {percent}"
        raise ValueError(msg)

    # Linear conversion: 1% = 1, 100% = 255
    # Formula: device = round((percent / 100) * 254) + 1
    # This ensures: 1% -> 1, 100% -> 255
    return round(((percent - 1) / 99) * 254) + 1