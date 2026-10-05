# Services reference

[Back to README](../README.md) | [Automations](automations.md) | [REST API](rest-api.md)

All features are available as Home Assistant service actions. Call these services from automations, scripts, or the Developer Tools.

To use the services within an automation, when adding a "Then do" action scroll down to other actions -- Aqara Advanced Lighting, and select an action.

![Aqara Advanced Lighting Automation](https://raw.githubusercontent.com/absent42/Aqara-Advanced-Lighting/main/images/automation.png "Aqara Advanced Lighting Automation")

A UI will pop up showing the parameters for configuring the action. To edit the YAML directly, click the 3 dots on the upper right and select "Edit in YAML". To use a saved preset that was created via the frontend, tick Preset, type the name of the preset (case insensitive) and click "Add custom item".

![Aqara Advanced Lighting Action](https://raw.githubusercontent.com/absent42/Aqara-Advanced-Lighting/main/images/action.png "Aqara Advanced Lighting Action")

## Table of contents

- [1. Set dynamic effect](#1-set-dynamic-effect)
- [2. Stop dynamic effect](#2-stop-dynamic-effect)
- [3. Set segment pattern](#3-set-segment-pattern)
- [4. Create gradient](#4-create-gradient)
- [5. Create color blocks](#5-create-color-blocks)
- [6. Start CCT sequence](#6-start-cct-sequence)
- [7. Stop CCT sequence](#7-stop-cct-sequence)
- [8. Pause CCT sequence](#8-pause-cct-sequence)
- [9. Resume CCT sequence](#9-resume-cct-sequence)
- [10. Start RGB segment sequence](#10-start-rgb-segment-sequence)
- [11. Stop RGB segment sequence](#11-stop-rgb-segment-sequence)
- [12. Pause RGB segment sequence](#12-pause-rgb-segment-sequence)
- [13. Resume RGB segment sequence](#13-resume-rgb-segment-sequence)
- [14. Start dynamic scene](#14-start-dynamic-scene)
- [15. Stop dynamic scene](#15-stop-dynamic-scene)
- [16. Pause dynamic scene](#16-pause-dynamic-scene)
- [17. Resume dynamic scene](#17-resume-dynamic-scene)
- [18. Set music sync](#18-set-music-sync)
- [19. Resume entity control](#19-resume-entity-control)
- [20. Start circadian mode](#20-start-circadian-mode)
- [21. Stop circadian mode](#21-stop-circadian-mode)
- [Working with light groups](#working-with-light-groups)
- [Custom icons for presets](#custom-icons-for-presets)

---

## 1. Set dynamic effect

Activate a dynamic RGB effect on your lights -- choose from Aqara app presets or create your own custom effect.

**Service:** `aqara_advanced_lighting.set_dynamic_effect`

**Example (using preset):**

```yaml
service: aqara_advanced_lighting.set_dynamic_effect
target:
  entity_id: light.aqara_ceiling_light
data:
  preset: "t1m_sunset"
```

**Example (custom effect):**

```yaml
service: aqara_advanced_lighting.set_dynamic_effect
target:
  entity_id: light.aqara_ceiling_light
data:
  effect: "breathing"
  speed: 75
  color_1: [255, 0, 0]      # Red (required)
  color_2: [0, 0, 255]      # Blue (optional)
  color_3: [0, 255, 0]      # Green (optional)
```

**Parameters:**

- `entity_id` (required): Light entity or group to control
- `preset` (optional): Aqara app preset effect -- dropdown selector with 24 built-in presets. You can also type the name of a custom preset you created in the frontend panel (case-insensitive)
- `effect` (required if no preset): Effect type -- dropdown selector with all available effects
- `speed` (required if no preset): Animation speed (1-100%)
- `color_1` through `color_8`: RGB color pickers (color_1 required if no preset, others optional)
- `segments` (optional): For T1 Strip only -- segments to apply effect to (e.g., "1-20", "odd", "even"). Supports [segment zone names](device-configuration.md#segment-zones)
- `brightness` (optional): Brightness level (1-100%)
- `turn_on` (optional): Turn light on before applying effect (default: false)

**Audio-reactive parameters** (T1M and T1 Strip only):

- `audio_entity` (optional): ESPHome audio sensor entity (`binary_sensor` or `sensor`). Setting this enables audio-reactive modulation
- `audio_sensitivity` (optional): Beat detection sensitivity (1-100, default: 50)
- `audio_detection_mode` (optional): Detection algorithm -- `spectral_flux` (default), `bass_energy`, or `complex_domain`
- `audio_silence_behavior` (optional): Behavior when music stops -- `hold`, `decay_min` (default), or `decay_mid`
- `audio_speed_mode` (optional): How audio drives effect speed -- `on_onset`, `continuous` (default), `intensity_breathing`, or `onset_flash`. Omit to disable speed modulation
- `audio_speed_min` (optional): Minimum speed in modulation range (1-100, default: 1)
- `audio_speed_max` (optional): Maximum speed in modulation range (1-100, default: 100)
- `audio_speed_curve` (optional): Response curve for speed -- `linear` (default), `logarithmic`, or `exponential`
- `audio_brightness_mode` (optional): How audio drives brightness -- `on_onset`, `continuous`, `intensity_breathing`, or `onset_flash`. Omit to disable brightness modulation
- `audio_brightness_min` (optional): Minimum brightness in modulation range (1-100%, default: 1)
- `audio_brightness_max` (optional): Maximum brightness in modulation range (1-100%, default: 100)
- `audio_brightness_curve` (optional): Response curve for brightness -- `linear` (default), `logarithmic`, or `exponential`

**Note:** When using `preset`, manual `effect`, `speed`, and `color` parameters are ignored. Audio parameters can be combined with presets to add audio modulation to any saved effect. Custom presets created in the frontend panel can be used by typing their name exactly as you saved it (case doesn't matter). Audio-reactive effects are not available for T2 bulbs.

---

## 2. Stop dynamic effect

Stop a running dynamic effect and optionally restore the light to its previous state before the effect was applied.

**Service:** `aqara_advanced_lighting.stop_effect`

**Example:**

```yaml
service: aqara_advanced_lighting.stop_effect
target:
  entity_id: light.aqara_ceiling_light
data:
  restore_state: true
```

**Parameters:**

- `entity_id` (required): Light entity or group to stop effect on
- `restore_state` (optional): Restore light to pre-effect state (default: true)
  - When true: Restores brightness, color (RGB), and color temperature
  - When false: Simply stops the effect, leaving light in current state
  - Falls back to warm white if no previous state is saved

**Note:** The integration automatically saves light state when applying effects or patterns. Saved states persist for 24 hours and across Home Assistant restarts.

---

## 3. Set segment pattern

Set individual segment colors (T1, T1M, and T1 Strip only) -- choose from 12 Aqara app presets or create your own custom pattern.

**Service:** `aqara_advanced_lighting.set_segment_pattern`

**Example (using preset):**

```yaml
service: aqara_advanced_lighting.set_segment_pattern
target:
  entity_id: light.aqara_ceiling_light
data:
  preset: "segment_1"
  brightness: 200
```

**Example (custom pattern):**

```yaml
service: aqara_advanced_lighting.set_segment_pattern
target:
  entity_id: light.aqara_ceiling_light
data:
  segment_colors:
    - segment: 1
      color:
        r: 255
        g: 0
        b: 0
    - segment: "5-10"
      color:
        r: 0
        g: 255
        b: 0
    - segment: 20
      color:
        r: 0
        g: 0
        b: 255
```

**Parameters:**

- `entity_id` (required): Light entity with segment support
- `preset` (optional): Aqara app segment pattern preset (Preset 1 through Preset 12) -- dropdown selector with 12 built-in presets. You can also type the name of a custom pattern preset you created in the frontend panel (case-insensitive)
- `segment_colors` (required if no preset): List of segment/color pairs
  - `segment`: Segment number, range, keyword, or zone name (e.g., 1, "5-10", "odd", "even", "left side")
  - `color`: RGB color dict with r, g, b values (0-255)
- `brightness` (optional): Brightness level (1-100%)
- `turn_on` (optional): Turn light on before applying pattern (default: false)
- `turn_off_unspecified` (optional): Turn off segments not specified (default: false)

**Note:** When using `preset`, the `segment_colors` parameter is ignored. Presets work on T1 (20 segment), T1M (26 segment), and T1 Strip devices. Custom presets created in the frontend panel can be used by typing their name exactly as you saved it (case doesn't matter).

---

## 4. Create gradient

Create a smooth color gradient across segments.

**Service:** `aqara_advanced_lighting.create_gradient`

**Example:**

```yaml
service: aqara_advanced_lighting.create_gradient
target:
  entity_id: light.aqara_ceiling_light
data:
  color_1: [255, 0, 0]
  color_2: [255, 255, 0]
  color_3: [0, 0, 255]
  segments: "1-20"
```

**Parameters:**

- `entity_id` (required): Light entity with segment support
- `color_1` (required): First gradient color -- RGB color picker
- `color_2` (required): Second gradient color -- RGB color picker
- `color_3` through `color_6` (optional): Additional gradient colors -- RGB color pickers
- `segments` (optional): Segments to apply gradient to (e.g., "1-20", "5-15", "left side"). Supports ranges, keywords (all, odd, even, first-half, second-half), and [segment zone names](device-configuration.md#segment-zones)
- `brightness` (optional): Brightness level (1-100%)
- `turn_on` (optional): Turn light on before applying gradient (default: false)
- `turn_off_unspecified` (optional): Turn off segments not specified (default: false)

---

## 5. Create color blocks

Create evenly spaced blocks of color.

**Service:** `aqara_advanced_lighting.create_blocks`

**Example:**

```yaml
service: aqara_advanced_lighting.create_blocks
target:
  entity_id: light.aqara_ceiling_light
data:
  color_1: [255, 0, 0]      # Red (required)
  color_2: [0, 255, 0]      # Green (optional)
  color_3: [0, 0, 255]      # Blue (optional)
  segments: "1-20"
  expand: false
```

**Parameters:**

- `entity_id` (required): Light entity with segment support
- `color_1` (required): First block color -- RGB color picker
- `color_2` through `color_6` (optional): Additional block colors -- RGB color pickers
- `segments` (optional): Segments to apply blocks to (e.g., "1-20", "odd", "even", "left side"). Supports ranges, keywords, and [segment zone names](device-configuration.md#segment-zones)
- `expand` (optional): Expand colors to fill segments evenly vs. alternating (default: false)
- `brightness` (optional): Brightness level (1-100%)
- `turn_on` (optional): Turn light on before applying blocks (default: false)
- `turn_off_unspecified` (optional): Turn off segments not specified (default: false)

---

## 6. Start CCT sequence

Create and run dynamic CCT (color temperature) sequences with up to 20 customizable steps, or use built-in presets for common scenarios. Supports three modes: standard (timed steps), schedule (time-of-day adaptation), and solar (sun elevation tracking).

**Service:** `aqara_advanced_lighting.start_cct_sequence`

**Usage:** Choose a preset from the dropdown, or use the Home Assistant UI to configure each step individually. For standard mode, step 1 is required, steps 2-20 are optional and collapsed by default (click "Show advanced fields" to access them). For schedule mode, provide `schedule_steps` as an object. For solar mode, provide `solar_steps` as an object.

**Available presets:**

- **Goodnight**: Gently fade from neutral white to warm dim light over 30 minutes, ideal for falling asleep
- **Wakeup**: Gradually brighten from warm dim to cool daylight over 30 minutes, simulating sunrise
- **Mindful breathing**: Smooth breathing pattern alternating between warm and cool tones, continuous loop
- **Circadian**: Full circadian rhythm schedule using sun-relative times, from dawn (2700K) through midday (5500K) to night (2700K)
- **Warm day**: Warm-toned schedule for comfortable ambiance with evening warmth emphasis
- **Productive day**: Cool, bright schedule optimized for focus and productivity

**Example YAML (using a preset):**

```yaml
service: aqara_advanced_lighting.start_cct_sequence
target:
  entity_id: light.bedroom_ceiling
data:
  preset: "goodnight"        # Use built-in Goodnight preset
  turn_on: true              # Turn on light before starting sequence
```

**Example YAML (standard mode -- custom sequence):**

```yaml
service: aqara_advanced_lighting.start_cct_sequence
target:
  entity_id: light.aqara_ceiling_light
data:
  turn_on: true              # Turn on light before starting sequence
  step_1_color_temp: 2700    # Warm white
  step_1_brightness: 128
  step_1_transition: 2.0     # Fade to this setting over 2 seconds
  step_1_hold: 10.0          # Hold for 10 seconds after transition completes
  step_2_color_temp: 5000    # Cool white
  step_2_brightness: 255
  step_2_transition: 3.0     # Fade over 3 seconds
  step_2_hold: 15.0          # Hold for 15 seconds after transition completes
  step_3_color_temp: 3500    # Neutral white
  step_3_brightness: 200
  step_3_transition: 1.0
  step_3_hold: 8.0
  loop_mode: "count"
  loop_count: 3
  end_behavior: "maintain"
```

**Example YAML (schedule mode):**

```yaml
service: aqara_advanced_lighting.start_cct_sequence
target:
  entity_id:
    - light.aqara_ceiling_light
    - light.hue_bulb
data:
  mode: "schedule"
  turn_on: true
  schedule_steps:
    - time: "sunrise-30"
      color_temp: 2700
      brightness: 100
      label: "Dawn"
    - time: "09:00"
      color_temp: 4500
      brightness: 200
      label: "Morning"
    - time: "12:00"
      color_temp: 5500
      brightness: 255
      label: "Midday"
    - time: "sunset+0"
      color_temp: 3000
      brightness: 150
      label: "Evening"
    - time: "sunset+90"
      color_temp: 2700
      brightness: 100
      label: "Night"
```

**Example YAML (solar mode):**

```yaml
service: aqara_advanced_lighting.start_cct_sequence
target:
  entity_id:
    - light.aqara_ceiling_light
    - light.hue_bulb            # Works with any CCT light
data:
  mode: "solar"
  turn_on: true
  solar_steps:
    - sun_elevation: -6         # Civil twilight
      color_temp: 2700
      brightness: 80
      phase: "any"
    - sun_elevation: 0          # Horizon
      color_temp: 3000
      brightness: 150
      phase: "rising"
    - sun_elevation: 30         # Mid-morning
      color_temp: 5000
      brightness: 255
      phase: "any"
    - sun_elevation: 0          # Sunset
      color_temp: 3000
      brightness: 120
      phase: "setting"
```

**Parameters:**

- `entity_id` (required): Light entity or group to control. Works with any CCT-capable light, not just Aqara devices
- `preset` (optional): Use a built-in preset ("goodnight", "wakeup", "mindful_breathing", "power_nap", "circadian", "solar_warm", "solar_productive") -- dropdown selector with 7 built-in presets. You can also type the name of a custom CCT sequence preset you created in the frontend panel (case-insensitive). When preset is selected, manual step/loop/end_behavior parameters are ignored
- `turn_on` (optional): Turn light on before starting sequence (default: false)
- Each light is limited to the color temperature range it reports; values outside it are clamped.
- `mode` (optional): Sequence execution mode (default: "standard")
  - `"standard"`: Timed step-by-step sequence with transition and hold timing
  - `"schedule"`: Adapts color temperature based on the time of day, interpolating between time-based steps on a 24-hour cycle
  - `"solar"`: Adapts color temperature based on the sun's elevation angle, polling every 60 seconds
- `schedule_steps` (optional, required for schedule mode): List of time-of-day steps. Each step is an object with:
  - `time` (required): A fixed time (e.g., `"12:00"`) or a sun-relative offset (e.g., `"sunrise+30"`, `"sunset-60"`)
  - `color_temp` (required): Color temperature in kelvin (2000-6500)
  - `brightness` (required): Brightness level (1-255)
  - `label` (optional): Friendly name for the step (e.g., "Morning", "Midday")
- `solar_steps` (optional, required for solar mode): List of solar elevation steps. Each step is an object with:
  - `sun_elevation` (required): Sun angle in degrees (-90 to 90)
  - `color_temp` (required): Color temperature in kelvin (2000-6500)
  - `brightness` (required): Brightness level (1-255)
  - `phase` (optional): When the step applies -- `"rising"` (sun ascending), `"setting"` (sun descending), or `"any"` (both). Default: `"any"`
- **Step 1 fields** (required for standard mode if not using preset):
  - `step_1_color_temp`: Color temperature in kelvin (2000-6500)
  - `step_1_brightness`: Brightness level (1-255)
  - `step_1_transition`: Time in seconds to transition to this step (0-3600)
  - `step_1_hold`: Time to hold at this step after transition completes (0-3600)
- **Steps 2-20 fields** (optional): Same format as step 1, access via "Show advanced fields" in UI
- `loop_mode` (optional): How to loop the sequence (default: "once", ignored when using preset or solar mode)
  - `"once"`: Run sequence one time
  - `"count"`: Loop X times (requires loop_count)
  - `"continuous"`: Loop indefinitely until stopped
- `loop_count` (optional): Number of times to repeat (1-1000, required when loop_mode is "count", ignored when using preset)
- `end_behavior` (optional): Action when sequence completes (default: "maintain", ignored when using preset or solar mode)
  - `"maintain"`: Keep light at last step's settings
  - `"turn_off"`: Turn off the light
  - `"restore"`: Restore light to its pre-sequence state

**Note:** In standard mode, each step consists of a transition period followed by a hold period. For example, if transition is 2s and hold is 10s, the light will fade for 2s then remain at those settings for 10s before the next step starts. In schedule mode, the integration interpolates between time-based steps on a 24-hour cycle. Sun-relative times (e.g., `sunrise+30`, `sunset-60`) are resolved dynamically using your Home Assistant location. In solar mode, the integration continuously interpolates between the two nearest steps based on the current sun elevation. Both schedule and solar modes poll every 60 seconds and persist across Home Assistant restarts.

---

## 7. Stop CCT sequence

Stop a running CCT sequence on a light and optionally restore the light to its previous state.

**Service:** `aqara_advanced_lighting.stop_cct_sequence`

**Example:**

```yaml
service: aqara_advanced_lighting.stop_cct_sequence
target:
  entity_id: light.aqara_ceiling_light
data:
  restore_state: true
```

**Parameters:**

- `entity_id` (required): Light entity or group to stop sequence on
- `restore_state` (optional): Restore light to its pre-sequence state (default: true)

---

## 8. Pause CCT sequence

Pause a running CCT sequence while maintaining its current state.

**Service:** `aqara_advanced_lighting.pause_cct_sequence`

**Example:**

```yaml
service: aqara_advanced_lighting.pause_cct_sequence
target:
  entity_id: light.aqara_ceiling_light
```

**Parameters:**

- `entity_id` (required): Light entity or group to pause sequence on

---

## 9. Resume CCT sequence

Resume a paused CCT sequence from where it was paused.

**Service:** `aqara_advanced_lighting.resume_cct_sequence`

**Example:**

```yaml
service: aqara_advanced_lighting.resume_cct_sequence
target:
  entity_id: light.aqara_ceiling_light
```

**Parameters:**

- `entity_id` (required): Light entity or group to resume sequence on

---

## 10. Start RGB segment sequence

Create and run dynamic RGB segment sequences with up to 20 customizable steps on T1, T1M, and T1 Strip lights. Each step can have custom colors, activation patterns, and timing.

**Service:** `aqara_advanced_lighting.start_segment_sequence`

**Usage:** Choose a preset from the dropdown, or use the Home Assistant UI to configure each step individually. Step 1 is required, steps 2-20 are optional and collapsed by default (click "Show advanced fields" to access them).

**Available presets:**

- **Loading bar**: Sequential segment activation creating a loading bar effect
- **Wave**: Smooth color gradient wave flowing back and forth
- **Sparkle**: Random twinkling segments creating a sparkle effect

**Example YAML (using a preset):**

```yaml
service: aqara_advanced_lighting.start_segment_sequence
target:
  entity_id: light.aqara_ceiling_light
data:
  preset: "wave"
  turn_on: true
```

**Example YAML (custom sequence):**

```yaml
service: aqara_advanced_lighting.start_segment_sequence
target:
  entity_id: light.aqara_ceiling_light
data:
  turn_on: true
  step_1_segments: "all"
  step_1_colors:
    - r: 255
      g: 0
      b: 0
    - r: 0
      g: 0
      b: 255
  step_1_mode: "gradient"
  step_1_duration: 3.0
  step_1_hold: 2.0
  step_1_activation_pattern: "sequential_forward"
  step_2_segments: "all"
  step_2_colors:
    - r: 0
      g: 255
      b: 0
  step_2_mode: "blocks_repeat"
  step_2_duration: 2.0
  step_2_hold: 1.0
  step_2_activation_pattern: "random"
  loop_mode: "continuous"
  end_behavior: "maintain"
```

**Parameters:**

- `entity_id` (required): Light entity with segment support (T1, T1M, or T1 Strip)
- `preset` (optional): Use a built-in preset ("loading_bar", "wave", "sparkle", "theater_chase", "rainbow_fill", "comet") -- dropdown selector with 6 built-in presets. You can also type the name of a custom RGB segment sequence preset you created in the frontend panel (case-insensitive). When preset is selected, manual step parameters are ignored
- `turn_on` (optional): Turn light on before starting sequence (default: false)
- `clear_segments` (optional): Clear existing segment pattern before starting sequence (default: false)
- `skip_first_in_loop` (optional): Skip the first step when looping (useful for initialization steps, default: false)
- **Step 1 fields** (required if not using preset):
  - `step_1_segments`: Segments to apply pattern to (e.g., "all", "1-20", "odd", "even", "left side"). Supports ranges, keywords, and [segment zone names](device-configuration.md#segment-zones)
  - `step_1_colors`: List of RGB colors (1-6 colors)
  - `step_1_mode`: Pattern mode ("gradient", "blocks_repeat", "blocks_expand", "individual")
  - `step_1_duration`: Time to complete the activation pattern (0-3600 seconds)
  - `step_1_hold`: Time to hold after activation completes (0-3600 seconds)
  - `step_1_activation_pattern`: How segments activate during the duration phase
    - `"all"`: All segments activate simultaneously (All at Once)
    - `"sequential_forward"`: Segments activate one by one from first to last
    - `"sequential_reverse"`: Segments activate one by one from last to first
    - `"random"`: Segments activate in random order
    - `"ping_pong"`: Segments activate forward then reverse in a ping pong pattern
    - `"centre_out"`: Segments activate from the center outward to both edges
    - `"edges_in"`: Segments activate from both edges inward to the center
    - `"paired"`: Segments activate in pairs (first and last, second and second-last, etc.)
- **Steps 2-20 fields** (optional): Same format as step 1, access via "Show advanced fields" in UI
- `loop_mode` (optional): How to loop the sequence (default: "once", ignored when using preset)
  - `"once"`: Run sequence one time
  - `"count"`: Loop X times (requires loop_count)
  - `"continuous"`: Loop indefinitely until stopped
- `loop_count` (optional): Number of times to repeat (1-1000, required when loop_mode is "count", ignored when using preset)
- `end_behavior` (optional): Action when sequence completes (default: "maintain", ignored when using preset)
  - `"maintain"`: Keep light at last step's settings
  - `"turn_off"`: Turn off the light
  - `"restore"`: Restore light to its pre-sequence state

**Note:** Each step consists of an activation period (duration) followed by a hold period. Activation patterns determine how segments light up during the duration phase.

---

## 11. Stop RGB segment sequence

Stop a running RGB segment sequence on a light and optionally restore the light to its previous state.

**Service:** `aqara_advanced_lighting.stop_segment_sequence`

**Example:**

```yaml
service: aqara_advanced_lighting.stop_segment_sequence
target:
  entity_id: light.aqara_ceiling_light
data:
  restore_state: true
```

**Parameters:**

- `entity_id` (required): Light entity to stop sequence on
- `restore_state` (optional): Restore light to its pre-sequence state (default: true)

---

## 12. Pause RGB segment sequence

Pause a running RGB segment sequence while maintaining its current state.

**Service:** `aqara_advanced_lighting.pause_segment_sequence`

**Example:**

```yaml
service: aqara_advanced_lighting.pause_segment_sequence
target:
  entity_id: light.aqara_ceiling_light
```

**Parameters:**

- `entity_id` (required): Light entity to pause sequence on

---

## 13. Resume RGB segment sequence

Resume a paused RGB segment sequence from where it was paused.

**Service:** `aqara_advanced_lighting.resume_segment_sequence`

**Example:**

```yaml
service: aqara_advanced_lighting.resume_segment_sequence
target:
  entity_id: light.aqara_ceiling_light
```

**Parameters:**

- `entity_id` (required): Light entity to resume sequence on

---

## 14. Start dynamic scene

Start a dynamic scene on target lights with slow color transitions. Creates ambient lighting by cycling through colors with configurable timing and distribution across multiple lights. Works with any RGB light entity, not just Aqara devices.

**Service:** `aqara_advanced_lighting.start_dynamic_scene`

**Example (using preset):**

```yaml
service: aqara_advanced_lighting.start_dynamic_scene
target:
  entity_id:
    - light.living_room
    - light.bedroom
data:
  preset: "sunset_glow"
```

**Example (custom scene):**

```yaml
service: aqara_advanced_lighting.start_dynamic_scene
target:
  entity_id:
    - light.living_room
    - light.bedroom
data:
  color_1:
    x: 0.68
    y: 0.32
    brightness_pct: 80
  color_2:
    x: 0.15
    y: 0.06
    brightness_pct: 60
  transition_time: 60
  hold_time: 10
  distribution_mode: "shuffle_rotate"
  loop_mode: "continuous"
```

**Parameters:**

- `entity_id` (required): Light entity or entities to control
- `preset` (optional): Use a built-in or custom preset name (case-insensitive). When preset is selected, manual color and timing parameters are ignored
- `color_1` through `color_8` (required if no preset): Scene colors as objects with `x`, `y` (CIE coordinates) and `brightness_pct` (1-100%)
- `transition_time` (optional): Time in seconds for color transitions (30-3600, default: 30)
- `hold_time` (optional): Time in seconds to hold each color before transitioning (0-3600, default: 10)
- `distribution_mode` (optional): How colors are assigned across lights (default: "shuffle_rotate")
  - `"shuffle_rotate"`: Each light gets a different color, then colors rotate through all lights
  - `"synchronized"`: All lights transition through the same colors together
  - `"random"`: Each light picks random colors from the palette
- `offset_delay` (optional): Delay in seconds between each light's transition for wave effects (0-10, default: 0)
- `random_order` (optional): Randomize the order in which lights transition (default: false)
- `loop_mode` (optional): How the scene should loop (default: "continuous")
  - `"once"`: Run scene one time
  - `"count"`: Loop X times (requires loop_count)
  - `"continuous"`: Loop indefinitely until stopped
- `loop_count` (optional): Number of times to loop (1-1000, required when loop_mode is "count")
- `end_behavior` (optional): What to do when scene completes (default: "restore")
  - `"restore"`: Restore lights to their pre-scene state
  - `"maintain"`: Keep lights at their last color
- `static` (optional): Apply colors once without starting transitions (default: false)
- `scene_name` (optional, advanced): Display name for tracking the running scene

**Audio-reactive parameters** (replaces fixed transition/hold timing with live audio):

- `audio_entity` (optional): Binary sensor from the ESPHome audio-reactive component. When set, scene timing is driven by audio events. The integration auto-discovers companion sensors (bass energy, amplitude, BPM) on the same device
- `audio_sensitivity` (optional): How responsive to sound (1-100, default: 50). Higher values react to quieter sounds
- `audio_color_advance` (optional): How colors advance -- `on_onset` (default), `continuous`, `beat_predictive`, `intensity_breathing`, or `onset_flash`
- `audio_detection_mode` (optional): Detection algorithm -- `spectral_flux` (default), `bass_energy`, or `complex_domain`
- `audio_transition_speed` (optional): Speed of color transitions on beat (1-100, default: 50). 1 = slow fade, 100 = instant snap
- `audio_brightness_curve` (optional): How energy maps to brightness -- `linear` (default), `logarithmic`, `exponential`, or `null` to disable
- `audio_brightness_min` (optional): Minimum brightness when audio is quiet (1-100%, default: 30)
- `audio_brightness_max` (optional): Maximum brightness when audio is loud (1-100%, default: 100)
- `audio_frequency_zone` (optional): Auto-distribute lights across bass/mid/high frequency bands (default: false, requires 3+ lights)
- `audio_silence_behavior` (optional): Behavior during silence -- `slow_cycle` (default), `hold`, `decay_min`, or `decay_mid`
- `audio_color_by_frequency` (optional): Map spectral centroid to palette position (default: false)
- `audio_rolloff_brightness` (optional): Scale brightness based on spectral rolloff (default: false)
- `audio_prediction_aggressiveness` (optional): How aggressively to predict beats, 1-100 (default: 50, beat_predictive mode only)
- `audio_latency_compensation_ms` (optional): Milliseconds to send commands early, 0-500 (default: 150, beat_predictive mode only)

See [Audio-reactive lighting setup](audio-reactive-setup.md) for hardware setup and detailed parameter descriptions.

---

## 15. Stop dynamic scene

Stop running dynamic scene(s) on the target lights.

**Service:** `aqara_advanced_lighting.stop_dynamic_scene`

**Example:**

```yaml
service: aqara_advanced_lighting.stop_dynamic_scene
target:
  entity_id: light.living_room
data:
  restore_state: true
```

**Parameters:**

- `entity_id` (required): Light entity or entities to stop scene on
- `restore_state` (optional): Restore lights to their pre-scene state (default: true)

---

## 16. Pause dynamic scene

Pause running dynamic scene(s) on the target lights. Lights hold their current color until resumed.

**Service:** `aqara_advanced_lighting.pause_dynamic_scene`

**Example:**

```yaml
service: aqara_advanced_lighting.pause_dynamic_scene
target:
  entity_id: light.living_room
```

**Parameters:**

- `entity_id` (required): Light entity or entities to pause scene on

---

## 17. Resume dynamic scene

Resume paused dynamic scene(s) on the target lights. The scene continues from where it was paused.

**Service:** `aqara_advanced_lighting.resume_dynamic_scene`

**Example:**

```yaml
service: aqara_advanced_lighting.resume_dynamic_scene
target:
  entity_id: light.living_room
```

**Parameters:**

- `entity_id` (required): Light entity or entities to resume scene on

---

## 18. Set music sync

Control audio-reactive lighting mode on T1 LED Strip. Enables the strip's built-in microphone to react to sound with visual effects.

**Service:** `aqara_advanced_lighting.set_music_sync`

**Example (enable):**

```yaml
service: aqara_advanced_lighting.set_music_sync
target:
  entity_id: light.led_strip
data:
  enabled: true
  sensitivity: "high"
  audio_effect: "rainbow"
```

**Example (disable):**

```yaml
service: aqara_advanced_lighting.set_music_sync
target:
  entity_id: light.led_strip
data:
  enabled: false
```

**Parameters:**

- `entity_id` (required): T1 LED Strip entity
- `enabled` (required): Enable or disable music sync mode
- `sensitivity` (optional): Audio sensitivity level (default: "low")
  - `"low"`: Lower microphone sensitivity
  - `"high"`: Higher microphone sensitivity
- `audio_effect` (optional): Audio-reactive effect type (default: "random")
  - `"random"`: Random reactive effects
  - `"blink"`: Blink effect
  - `"rainbow"`: Rainbow effect
  - `"wave"`: Wave effect

---

## 19. Resume entity control

Resume control of light entities that were paused due to external changes. When you manually change a light that is part of a running dynamic scene, CCT sequence, or segment sequence, the integration pauses control of that individual light. This service resumes control so the light rejoins the running action.

**Service:** `aqara_advanced_lighting.resume_entity_control`

**Example:**

```yaml
service: aqara_advanced_lighting.resume_entity_control
data:
  entity_id:
    - light.living_room
```

**Parameters:**

- `entity_id` (required): Light entity or entities to resume control for

---

## 20. Start circadian mode

Start a passive circadian overlay on target lights. Supports two modes:

- **Solar mode** (default): Automatically applies sun-appropriate color temperature and brightness when a light turns on, based on the sun's elevation angle. This is a passive overlay — it applies values on turn-on events and polls periodically, without running a continuous sequence.
- **Schedule mode**: Runs a continuous time-of-day schedule through the CCT sequence manager, interpolating between time-based steps on a 24-hour cycle. Schedule presets (Circadian, Warm Day, Productive Day) use this mode.

**Service:** `aqara_advanced_lighting.start_circadian_mode`

**Example (using a preset):**

```yaml
service: aqara_advanced_lighting.start_circadian_mode
target:
  entity_id: light.bedroom_ceiling
data:
  preset: "circadian"
```

**Example (custom solar steps):**

```yaml
service: aqara_advanced_lighting.start_circadian_mode
target:
  entity_id:
    - light.living_room
    - light.kitchen
data:
  solar_steps:
    - sun_elevation: -6
      color_temp: 2700
      brightness: 80
    - sun_elevation: 10
      color_temp: 4000
      brightness: 200
    - sun_elevation: 45
      color_temp: 5500
      brightness: 255
```

**Example (schedule preset with auto-resume):**

Schedule mode presets run a continuous time-of-day schedule. The built-in schedule presets are Circadian Rhythm, Warm Day, and Productive Day — all three use sun-relative times that adapt to seasonal changes:

```yaml
service: aqara_advanced_lighting.start_circadian_mode
target:
  entity_id:
    - light.living_room
    - light.kitchen
data:
  preset: "circadian"
```

You can also create custom schedule presets in the [CCT sequence editor](visual-editors.md#schedule-mode) (using schedule mode) and use them by name:

```yaml
service: aqara_advanced_lighting.start_circadian_mode
target:
  entity_id: light.bedroom_ceiling
data:
  preset: "my custom schedule"
```

**Parameters:**

- `entity_id` (required): Light entity or entities to apply circadian mode to
- `preset` (optional): Use a built-in preset ("circadian", "solar_warm", "solar_productive") -- dropdown selector. You can also type the name of a custom CCT sequence preset (case-insensitive). Schedule-mode presets (Circadian Rhythm, Warm Day, Productive Day) are routed through the CCT sequence manager and run continuously, interpolating between time-based steps. Solar-mode presets and custom solar presets use the passive overlay. When preset is selected, manual step parameters are ignored
- `solar_steps` (optional): Custom solar elevation steps for solar mode. Same format as the [start CCT sequence](#6-start-cct-sequence) solar_steps parameter. Requires at least 2 steps

---

## 21. Stop circadian mode

Stop the passive circadian overlay on target lights.

**Service:** `aqara_advanced_lighting.stop_circadian_mode`

**Example:**

```yaml
service: aqara_advanced_lighting.stop_circadian_mode
target:
  entity_id: light.bedroom_ceiling
```

**Parameters:**

- `entity_id` (required): Light entity or entities to stop circadian mode for

---

## Working with light groups

All services support Home Assistant light groups. When you target a light group, the integration automatically:

- Detects the group and expands it to individual light entities
- Removes any duplicate entities
- Routes each entity to the correct backend (Z2M or ZHA) automatically
- Applies the effect/pattern to all lights simultaneously

**Multi-backend and multi-instance support:**
Light groups can contain entities from different backends and multiple Zigbee2MQTT instances. The integration automatically:

- Identifies which backend and instance owns each entity
- Routes service calls to the appropriate backend
- Processes all entities in parallel for synchronized effects

**Example -- applying an effect to a group:**

```yaml
service: aqara_advanced_lighting.set_dynamic_effect
target:
  entity_id: light.living_room_group  # Can span Z2M instances and ZHA
data:
  preset: "sunset"
```

**Example -- mixed backend group:**

```yaml
# light.whole_house_group contains:
#   - light.living_room (Zigbee2MQTT)
#   - light.bedroom (Zigbee2MQTT)
#   - light.kitchen (ZHA)
#   - light.garage (zigbee2mqtt_garage instance)

service: aqara_advanced_lighting.set_dynamic_effect
target:
  entity_id: light.whole_house_group
data:
  effect: "breathing"
  speed: 50
  color_1: [255, 100, 0]
  # All lights receive the effect, routed to their respective backends
```

## Custom icons for presets

You can use custom icons with your user presets using the [Custom Icons integration](https://github.com/thomasloven/hass-custom_icons).

**Using custom icons:**

1. Install and configure the Custom Icons integration
2. When creating or editing a preset, set the icon field to your custom icon identifier (e.g., `local:my_preset_icon`)
3. Standard MDI icons use the format `mdi:icon-name`, while custom icons use `local:icon-name`

---

**Next**: [Automations](automations.md) | [REST API](rest-api.md)
