# Visual editors

[Back to README](../README.md) | [Frontend panel](frontend-panel.md) | [Services reference](services.md)

Create custom effects and patterns with interactive builders accessible from the frontend panel.

## Dynamic scene editor

![Aqara Advanced Lighting Dynamic Scenes](https://raw.githubusercontent.com/absent42/Aqara-Advanced-Lighting/refs/heads/main/images/scenes.png "Aqara Advanced Lighting Dynamic Scenes")

- Create ambient active lighting scenes that work across multiple lights
- Give each scene a name and optional icon for easy identification
- Add up to 8 colors using XY color pickers with per-color brightness (1-100%)
  - Reorder colors with drag-and-drop to control the color sequence
- **Image color extraction**: Create color palettes from uploaded images or image URLs
  - Upload an image file or paste a URL to automatically extract dominant colors
  - Uses k-means clustering to find up to 8 distinct colors from the image
  - Extracted colors are converted to CIE XY color space with brightness values
  - Optionally save the image as a preset thumbnail
  - Supports JPEG, PNG, and other common image formats (max 10 MB)
- Configure transition time (30-3600 seconds) for smooth color changes
- Set hold time (0-3600 seconds) to pause at each color
- Choose color assignment mode:
  - **Shuffle and rotate**: Each light gets a different color from the palette, then colors smoothly rotate through all lights along the color wheel
  - **Synchronized**: All lights transition through the same colors together
  - **Random**: Each light picks random colors from the palette
- Add ripple effect (0-120 seconds) to stagger light transitions and create wave effects across lights
- Randomize light order for varied patterns
- Configure loop settings (once, count, or continuous; specify loop count 1-100 for count mode)
- End behavior: restore to previous state or maintain last color
- Static mode option to apply colors once without transitions (available via services)
- Works with any RGB light entity (not limited to Aqara devices)
- Preview the scene before saving to see how it looks on your lights
- Save scenes as custom presets with color history for quick reuse

### Audio-reactive options

The dynamic scene editor includes an **Audio reactive** section that replaces fixed transition and hold timing with live audio-driven updates. Toggle **Enable audio** to expand the audio controls:

- **Audio preset**: Select a pre-configured audio profile (Beat, Ambient, Concert, Chill, Club) that auto-fills all parameters. Changing any individual parameter switches to Custom
- **Audio sensor entity**: Select the `binary_sensor` entity from your ESPHome audio-reactive device
- **Detection mode**: Algorithm for detecting musical events
  - Spectral flux (all genres)
  - Bass energy (rhythmic music)
  - Complex domain (phase + magnitude)
- **Color advance**: How scene colors change in response to audio
  - Color cycle — advance to next color on each onset
  - Continuous — smoothly blend based on audio intensity
  - Beat predictive — anticipate beats for tighter sync
  - Intensity breathing — pulse brightness with intensity
  - Brightness flash — flash brightness on each onset
- **Sensitivity** (1–100%): How responsive to sound. Higher values react to quieter sounds
- **Transition speed** (1–100%): How fast lights fade between colors. Disabled for Continuous and Intensity breathing modes
- **Prediction aggressiveness** (1–100%): How far ahead to predict beats. Only available in Beat predictive mode
- **Latency compensation** (0–500 ms): Offset for network and hardware delay. Only available in Beat predictive mode
- **Brightness response** dropdown: Modulate brightness with audio intensity (Linear, Logarithmic, Exponential, or Disabled). Available for Color cycle, Continuous, and Beat predictive modes
  - **Brightness min** (1–100%): Minimum brightness when audio is quiet
  - **Brightness max** (1–100%): Maximum brightness when audio is loud
- **Silence behavior**: What happens during silence (Hold last color, Slow cycle, Decay to min, Decay to mid)
- **Frequency zone distribution** toggle: Assign different lights to different frequency bands (requires 3+ lights)
- **Color by frequency** toggle: Map spectral centroid to palette position (low frequency = warm colors, high = cool)
- **Rolloff brightness** toggle: Scale brightness by timbral brightness

See [Audio-reactive lighting setup](audio-reactive-setup.md) for hardware setup, calibration, and detailed parameter descriptions.

## Effect editor

![Aqara Advanced Lighting Effects Editor](https://raw.githubusercontent.com/absent42/Aqara-Advanced-Lighting/refs/heads/main/images/effects.png "Aqara Advanced Lighting Effects Editor")

- Give each effect a name and optional icon for easy identification
- Select the target device type to see available effects:
  - **T2 Bulb**: Breathing, candlelight, fading, flash
  - **T1 / T1M**: Flow 1, flow 2, fading, hopping, breathing, rolling
  - **T1 Strip**: Breathing, rainbow 1, chasing, flash, hopping, rainbow 2, flicker, dash
- Add up to 8 colors using color pickers with color history for quick reuse
- Adjust speed (1-100) with a slider, and set initial brightness (1-100%)
- For T1 Strip: specify which segments to light using the segment selector
- Preview the effect before saving to see how it looks on your lights
- Save as custom preset for reuse

### Audio-reactive options

The effect editor includes an **Audio reactive** section for T1M and T1 Strip devices that modulates the effect's speed based on live audio data. Toggle **Audio reactive** to expand the controls:

- **Audio sensor entity**: Select the `binary_sensor` or `sensor` entity from your ESPHome audio-reactive device
- **Sensitivity** (1–100): Beat detection sensitivity on the ESP32 device
- **Silence behavior**: What happens when music stops
  - Hold last values
  - Decay to minimum
  - Decay to midpoint
- **Speed modulation**: Controls how audio drives the effect speed
  - **Mode**: Volume, Tempo, or Combined (defaults to Volume)
    - Volume: Louder music drives faster speed, mapped directly to the speed range
    - Tempo: Detected BPM drives speed, stable and musically grounded
    - Combined: Tempo sets the baseline, volume modulates around it
  - **Range min** (1–99): Minimum speed in the modulation range
  - **Range max** (2–100): Maximum speed in the modulation range

Note: Only speed modulation is supported for hardware effects. Brightness cannot be modulated in real time because the T1M restarts the effect on every brightness change.

Audio-reactive effects are not available for T2 bulbs. See [Audio-reactive lighting setup](audio-reactive-setup.md) for hardware setup and calibration.

## Segment pattern editor

![Aqara Advanced Lighting Pattern Editor](https://raw.githubusercontent.com/absent42/Aqara-Advanced-Lighting/refs/heads/main/images/pattern.png "Aqara Advanced Lighting Pattern Editor")

- Give each pattern a name and optional icon for easy identification
- Select the target device type (T1, T1M, or T1 Strip) to set the segment count
- Visual segment selector shows all available segments (count adjusts dynamically based on device type and strip length)
- Three color modes with distinct workflows:
  - **Individual**: Select segments and assign colors from a palette of up to 6 colors by clicking on them
  - **Gradient**: Define 2-6 color stops and generate smooth transitions across selected segments
  - **Blocks**: Create solid color block patterns with 1-6 colors that fill segments evenly
- Gradient and block options:
  - Interpolation modes control how colors blend between stops:
    - **Shortest path** (default): Transitions through the nearest hue on the color wheel (e.g., red to blue goes through purple)
    - **Longest path**: Transitions the long way around the color wheel, visiting all intermediate hues (e.g., red to blue goes through yellow, green, cyan)
    - **RGB**: Direct linear interpolation in RGB color space, ignoring the hue wheel
  - Wave easing applies a sinusoidal curve to the gradient distribution, creating smooth oscillating color transitions instead of a linear blend. Configurable from 1 to 5 cycles across the gradient
  - Mirror, repeat (1-10 tiles), and reverse options
  - Blocks mode includes an expand blocks toggle to stretch colors across segments
- Option to turn off unspecified segments
- Use the zone dropdown to quickly select saved segment zones or built-in presets (All, First Half, Second Half, Odd, Even)
- Preview the pattern before saving to see how it looks on your lights
- Save patterns as custom presets

## CCT sequence editor

![Aqara Advanced Lighting CCT Sequencer](https://raw.githubusercontent.com/absent42/Aqara-Advanced-Lighting/refs/heads/main/images/cct.png "Aqara Advanced Lighting CCT Sequencer")

- Give each sequence a name and optional icon for easy identification
- Select a **mode** to control how the sequence runs:
  - **Standard**: Timed step-by-step sequences with manual transition and hold timing
  - **Schedule**: Time-based adaptation using wall-clock or sunrise/sunset-relative times
  - **Solar**: Sun elevation-based adaptation that tracks the sun's position in the sky
- Works with any CCT light entity (not limited to Aqara Zigbee devices)
- Validates that selected entities support color temperature mode and warns about incompatible lights
- Save sequences as custom presets

### Standard mode

Step-by-step mode with manual timing control:

- Build multi-step sequences (up to 20 steps)
- Set color temperature (2000-6500K) and brightness (1-100%) per step. Each light is limited to the color temperature range it reports; values outside it are clamped, and the editor names any selected light this applies to
- Reorder steps with drag-and-drop, or use the step controls to move, duplicate, and delete steps
- Each step has two timing phases:
  - **Transition time**: How long the light takes to fade from its current state to this step's color temperature and brightness (0-3600 seconds). The light smoothly interpolates between values during this period
  - **Hold time**: How long the light stays at this step's settings after the transition completes before moving to the next step (0-43200 seconds)
- Choose loop mode: once, count (1-100 loops), or continuous
- Set end behavior: maintain last state, turn off, or restore to previous state
- Visual timeline shows sequence flow
- Preview the sequence before saving to see how it runs on your lights

### Schedule mode

Automatically adjust color temperature and brightness based on the time of day. Instead of manually triggering sequences, the integration continuously adapts your lights to match a schedule you define. These sequences run continuously in the background and persist Home Assistant restarts.

- Add 2-20 schedule steps, each with:
  - **Time**: A fixed time (e.g., `12:00`) or a sun-relative offset (e.g., `sunrise+30`, `sunset-60`). Sun-relative times are resolved dynamically using your Home Assistant location, so the schedule adapts to seasonal changes automatically
  - **Color temperature**: Target color temperature (2000-6500K). Each light is limited to the color temperature range it reports; values outside it are clamped
  - **Brightness**: Target brightness (1-100%)
  - **Label** (optional): A friendly name for the step (e.g., "Morning", "Midday", "Evening") shown in the active presets display
- The integration reads the current sun elevation from Home Assistant's `sun.sun` entity and adapts the sunrise and sunset timnes throughout the year
- The integration interpolates smoothly between steps on a 24-hour cycle, so your lights transition gradually rather than jumping between values
- Loop mode and end behavior are locked to continuous/maintain since schedule mode runs indefinitely
- When a light turns on, the current schedule values are applied immediately without waiting for the next poll cycle
- Preview is not available for schedule mode since it runs continuously in the background
- **Auto-resume delay**: Optionally set a delay (in seconds) before the schedule automatically resumes after you manually change a light. Set to 0 for manual-only resume

**Built-in schedule presets:**

- **Circadian**: Full circadian rhythm adaptation from dawn to night. Uses sun-relative times (sunrise-30 through sunset+90) with color temperatures ranging from 2700K to 5500K
- **Warm day**: Warm-toned schedule for comfortable ambiance with lower peak brightness and evening warmth emphasis
- **Productive day**: Cool, bright schedule optimized for focus and productivity with higher color temperatures throughout the day

### Solar mode

Automatically adjust color temperature and brightness based on the sun's elevation angle. These sequences run continuously in the background and persist Home Assistant restarts.

- Add 2-20 solar steps, each with:
  - **Sun elevation**: The sun's angle above or below the horizon (-90 to 90 degrees). Negative values represent below the horizon (e.g., -6 to 0 degrees is twilight), 0 degrees is the horizon, and positive values are above (e.g., 45+ degrees is high midday sun)
  - **Phase**: When this step applies based on the sun's direction:
    - **Rising**: Only when the sun is ascending (morning)
    - **Setting**: Only when the sun is descending (evening)
    - **Any**: Applies in both directions
  - **Color temperature**: Target color temperature (2000-6500K). Each light is limited to the color temperature range it reports; values outside it are clamped
  - **Brightness**: Target brightness (1-100%)
- The integration reads the current sun elevation from Home Assistant's `sun.sun` entity and interpolates between the two nearest steps
- Using separate rising and setting phases lets you define different lighting for morning vs. evening at the same sun elevation (e.g., brighter in the morning, dimmer in the evening)
- Loop mode and end behavior are locked to continuous/maintain since solar mode runs indefinitely
- When a light turns on, the current solar values are applied immediately
- Preview is not available for solar mode since it runs continuously in the background
- **Auto-resume delay**: Same as schedule mode -- optionally auto-resume after manual changes

### Adaptive mode behavior

Schedule and solar modes share these behaviors:

- **Background polling**: The integration checks the current time or sun position every 60 seconds and updates your lights
- **Per-attribute override detection**: If you manually change brightness, only brightness pauses while color temperature keeps adapting (or vice versa). See [change detection](frontend-panel.md#change-detection) for configuration
- **Persistence**: Running schedule and solar sequences survive Home Assistant restarts and resume automatically
- **Turn-on awareness**: When a light turns on, the integration immediately applies the current adaptive values without waiting for the next poll

## RGB segment sequence editor

![Aqara Advanced Lighting Segment Sequencer](https://raw.githubusercontent.com/absent42/Aqara-Advanced-Lighting/refs/heads/main/images/segments.png "Aqara Advanced Lighting Segment Sequencer")

- Give each sequence a name and optional icon for easy identification
- Select the target device type (T1, T1M, or T1 Strip)
- Create animated segment patterns (up to 20 steps)
- Each step has its own segment pattern using any of the three color modes (individual, gradient, or blocks) with the full set of pattern options
- Reorder steps with drag-and-drop, or use the step controls to move, duplicate, and delete steps
- Select an activation pattern to control how segments light up during each step:
  - **All**: All segments light up simultaneously
  - **Sequential forward**: Segments light up one by one from first to last
  - **Sequential reverse**: Segments light up one by one from last to first
  - **Random**: Segments light up in random order
  - **Ping pong**: Segments light up forward then reverse
  - **Center out**: Segments light up from the center outward
  - **Edges in**: Segments light up from both edges toward the center
  - **Paired**: Segments light up in mirrored pairs from the edges inward
- Each step has two timing phases:
  - **Duration**: How long the activation pattern takes to complete (0-3600 seconds). During this period, segments light up according to the selected activation pattern (e.g., one by one for sequential, all at once for simultaneous)
  - **Hold time**: How long the completed pattern stays visible before the next step begins (0-43200 seconds)
- Choose loop mode: once, count (1-100 loops), or continuous
- Set end behavior: maintain last state, turn off, or restore to previous state
- Option to clear segments before starting
- Skip first step option for continuous loops (useful when the first step is an initialization pattern)
- Preview the sequence before saving to see how it runs on your lights
- Save sequences as custom presets

## Common editor features

All editors share a set of common features:

- **Name and icon**: Every editor has a name field and an optional icon selector for identifying presets. Leave the icon field blank to use an automatically generated icon, or pick one from Home Assistant's built-in icon library
- **Draft preservation**: Unsaved changes are preserved if you navigate away from the editor, so you can return without losing work
- **Preview**: All editors support previewing on your lights before saving, so you can see the result in real time
- **Presets**: Save your work as reusable presets that appear in the preset library. Existing presets can be loaded and edited
- **Unsaved changes indicator**: The editor shows when you have unsaved modifications
- **Color history**: Editors that use color pickers remember recently used colors for quick reuse across sessions

---

**Next**: [Device configuration](device-configuration.md) | [Services reference](services.md)
