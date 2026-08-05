# Changelog

All notable changes to the Aqara Advanced Lighting integration will be documented in this file.

## [1.3.2] - 2026-08-05

### Home Assistant 2026.8 compatibility

Home Assistant 2026.8 restricts every device registry entry to a single config entry. Integrations can no longer attach themselves to another integration's device, which changes how this integration appears alongside your lights.

**What you will see:** each Aqara light now has two device pages — the one owned by Zigbee2MQTT (or ZHA) carrying the light entity, and one owned by Aqara Advanced Lighting carrying this integration's device triggers and conditions. Home Assistant's "Linked Devices" element on each device page cross-links the two. Existing automations continue to work; Home Assistant resolves references to the old combined device across both.

Two consequences are inherent to the Home Assistant change and cannot be worked around by this integration: areas must be assigned to each device separately, and when building a new device automation you must pick the Aqara Advanced Lighting device to reach our triggers and conditions.

### Fixed

  - Devices were deleted and re-created on every setup under 2026.8. Setup pruned any device whose only owning config entry was ours — which, once devices are single-entry, is all of them. This lost area assignments and custom names, regenerated device IDs, and detached each device from the record Home Assistant uses to keep existing automations resolving. The one-time v1.2 to v1.3 cleanup is unaffected and still runs.
  - Device triggers and conditions stopped resolving for Zigbee2MQTT users on 2026.8. Our device identifier was dropped during the registry migration, leaving triggers and conditions with no device to match. Devices are now registered with both their Aqara and Zigbee2MQTT identifiers, which also restores the "Linked Devices" cross-link.

### Other 2026.8 compatibility

  - ZHA quirk registration now imports `CustomCluster` and `QuirkBuilder` from `zhaquirks` rather than the deprecated `zigpy.quirks.v2` paths, which warn on the zha-quirks 2.2 shipped with 2026.8. Same classes, no behaviour change.
  - Stale device cleanup and ZHA device lookups use the single-config-entry registry APIs on 2026.8+.
  - Device pages now show the bulb's own firmware version. Devices separated by the 2026.8 migration kept a copy of the Zigbee2MQTT or ZHA device's firmware string, which never updated; that value is now replaced with ours, or cleared when the bulb does not report one.

Pre-2026.8 cores keep the previous merged-device behaviour; the integration detects which model the running core uses.

## [1.3.0] - 2026-04-27

### What's New

Version 1.3.0 introduces an updated dashboard card, preset favorites custom sorting, drag and drop color swatches in effect and segments editors, and audio-reactive effects for Aqara devices, allowing T1M and T1 Strip lights to run their native device effects speed modulated live by music.

It also unifies the audio parameter model across scenes and effects for a consistent editing experience, and introduces a central engine registry that eliminates orphaned audio engines. Integration-side support for the ESPHome Audio Reactive v0.4.2 pro DSP tier adds per-musical-band sensors and a beat-event binary sensor.

The BTrack beat tracker has been rewritten from scratch in the firmware (esphome-audio-reactive v0.4.2); existing v1.2.x scenes using `beat_predictive` color-advance now lock onto a wider range of music tempos than they did under v1.2.0.

### Aqara Preset Favorites Card v2

**Breaking changes:** None. Existing card configs continue to work; the deprecated `compact: true` field migrates to `layout: 'compact-grid'` automatically.

  - Per-card preset curation — the card editor now has a curation list (drag-reorder + checkboxes) that lets each card show a curated subset of favorites in a custom order. Leave it untouched to keep the global favorites order, as before.
  - Five layouts — grid (default), compact grid, list, hero (first preset large + horizontal strip), and carousel (horizontal scroll-snap).
  - Inline brightness slider — optional per-card slider above or below the preset display. Slider value applies to effects, segment patterns, segment sequences, and dynamic scenes (CCT sequences carry their own per-step brightness and are excluded by design). For user effects with a saved `effect_brightness`, the per-preset value still wins over the slider.
  - Drag-reorder for the panel's favorites section — new "Custom" sort option (the new default for favorites) shows drag handles on hover. Reordering writes back to the user-preferences endpoint and persists across reloads.

**Under the hood:**

  - Card and panel favorites now share preset resolution, compatibility filtering, activation, and icon-rendering modules in `src/preset-runtime/`. The card lost roughly 600 lines of duplicated logic in the process.
  - Card running-state replaced 5-second polling with a WebSocket event subscription on a new `aqara_advanced_lighting_operations_changed` HA event. Active-state updates land in milliseconds instead of seconds.
  - Shared API client in `src/data-client/aqara-api.ts` consolidates the card's static-data cache with `bypassCache: true` invalidation after mutations, so saved preset edits surface immediately.
  - Card source split into focused modules: editor element, config + migration shim, running-ops subscription wrapper.
  - 96 new frontend unit tests (Vitest + happy-dom) cover the extracted modules; the existing 712 pytest backend suite continues to pass.

**Migration:** Existing users with `'date-old'` saved as their favorites sort preference auto-migrate to the new `'custom'` value on first frontend load. Identical underlying behavior; the rename unlocks drag handles and gives a clearer dropdown label.

### Audio-Reactive Effects

T1M and T1 Strip lights can now run their built-in color effects (rainbow, flow, breathing, and more) with speed driven live by an ESPHome audio sensor.

  - Speed modulation channel — amplitude maps to effect speed (`volume` mode)
  - Configurable min/max ranges for modulation
  - Silence behavior: hold last state  or decay toward minimum/mid point
  - Deadband filtering and rate limiting prevent flicker during quiet passages
  - Waveform badge on preset icons when audio-reactive is enabled
  - Live sensitivity slider in running-operation cards
  - Effect audio reactive override panel with per-entity sensor and sensitivity controls
  - 8 new audio-reactive effects presets for T1M/T1 Strip

### Audio Engine Reliability

  - Central `AudioEngineRegistry` tracks all active engines and resolves conflicts before starting new ones, eliminating the orphaned-engine bug where two effects on different lights sharing the same sensor would silently strand the first engine
  - `AudioEngine` shared class now powers both scenes and effects, replacing ~430 lines of inline subscription/queue/silence code in the scene manager
  - Sensor unavailability warning in running-operation cards when the audio entity goes offline

### Pro-tier DSP Integration (ESPHome Audio Reactive v0.4.2)

  - Auto-discovery of pro-tier companion sensors on any ESPHome audio device: `sub_bass_energy`, `low_mid_energy`, `upper_mid_energy`, `air_energy`, `beat_event` binary sensor, `calibration_stale` binary sensor, and the optional `fft_task_cycle_mean_us` / `fft_task_cycle_peak_us` diagnostic sensors. Basic-tier devices continue to work unchanged. The pro-tier sensor entities are exposed in HA for use in custom automations.
  - Calibration-stale warning logged once per device when a pro-tier audio device transitions its `calibration_stale` binary sensor to on, prompting the user to re-run quiet-room and music-level calibration after upgrading from v0.3.x firmware.

### Deferred to a future release

The following pro-tier features were planned for v1.3.0 but are hidden from the user-facing selectors while their upstream firmware DSP is stabilised. Existing scene/effect configs storing these values continue to load and run; only new selection from the UI is gated. They will return in v1.4.x or v1.5.0.

  - `audio_speed_mode` options: `tempo` and `combined` (BPM-driven and BPM+amplitude-driven effect speed). The `volume` mode remains as the production speed-modulation channel.
  - `audio_color_advance` options: `bass_kick` and `freq_to_hue`. The five other color-advance modes — `on_onset`, `continuous`, `beat_predictive`, `intensity_breathing`, `onset_flash` — remain available.

### Improvements

  - Stale devices automatically removed from the HA device registry when Z2M drops them from its device list or ZHA no longer reports them at startup
  - Repair issues raised in Settings → System → Repairs when the configured backend is unreachable (Z2M: bridge not responding after 2 minutes; ZHA: integration not installed); auto-clear when resolved
  - Auto-populate audio sensor in both scene editor and effect editor when the default sensor preference is set
  - Activation overrides panel reordered: all toggles at top, parameters below
  - Panel section descriptions updated throughout
  - EMA filter extracted to shared `EMAFilter` class; alpha and decay constants centralised in `const.py`
  - Implement spectral features, beat-phase prediction
  - Implement decay_min/decay_mid silence behaviors for audio scenes
  - Drag-and-drop reordering for effect editor color swatches
  - Drag-and-drop reordering for segment-selector gradient/blocks swatches
  - Default audio sensor selector moved to Device Config tab for easier discovery
  - `audio_silence_behavior` enum replaces the old boolean toggle: `hold`, `slow_cycle`, `decay_min`, `decay_mid`
  - `audio_brightness_curve` (linear/logarithmic/exponential) with configurable min/max replaces the boolean brightness-response toggle
  - Brightness override in the Activate tab now applies to segment sequences (built-in and user presets); dispatched once per entity at sequence start via `light.turn_on` so both T1M and T1 Strip honor it
  - Drag and drop sorting for favorite presets in frontend panel

### Fixes

  - Preserve original light state when switching between dynamic scene presets — preset B no longer restores to preset A's captured state baseline
  - On-device audio modes (T1 Strip music sync, generic on-device) now correctly cleaned up when a scene is detached, not left running
  - Stop orphaned audio engine and modulator when a new effect replaces a running audio-reactive effect
  - Audio modulator brightness writes now tagged with integration context, eliminating false pause-detection log spam
  - Apply audio waveform badge to scene presets with custom icons
  - Prevent false external change detection during scene transitions
  - Add missing audio fields to dynamic scene preset store whitelist
  - Dynamic scene preview audio
  - Add ESPHome name-derived unique_id aliases for companion sensor discovery
  - Migrate ha-textfield to ha-input for HA 2026.5+ compatibility
  - Dashboard Card now propagates user audio-override preferences to activation, so built-in audio-reactive scenes and effects activate correctly from the dashboard card. Previously the card silently dropped the user's audio sensor entity.
  - Effect favorite icons (built-in and user) now show the audio-reactive waveform badge correctly. The badge previously used `audio_entity` as the indicator, which missed presets relying on the user-prefs audio entity. The corrected indicator is `audio_speed_mode` (built-in) and `audio_config.audio_speed_mode` (user).
  - User dynamic scenes with both an uploaded image thumbnail and a leftover MDI icon now show the thumbnail (the deliberate user choice; the icon is often a default left over from preset creation).
  - Dynamic scenes activated from the dashboard card now highlight as active and are stoppable from the card. Previously the card only matched single-entity-id operations; dynamic scenes use a multi-entity-id shape.

### Code Quality

  - Shared `AudioEngine` class used by both `DynamicSceneManager` and `AudioEffectModulator`
  - `AudioEngineRegistry` singleton initialized in `async_setup()`
  - `AudioEffectConfig` dataclass with full preset storage support
  - `audio_curves.py`: response curve functions and `EMAFilter` class
  - `async_write_effect_speed()` in both MQTT and ZHA backends for live speed adjustment without effect restart
  - `BeatPredictiveHandler` constructor unified to `(manager)` — the previous `(manager, hass)` signature was redundant; scene configuration now resolves lazily on the first event instead of via a separate `configure()` call. Public `configure()` retained as a deprecation shim.
  - `MODE_REGISTRY` in `audio_mode_handlers.py` becomes the single source of truth for scene-side mode → handler mapping; `create_handler()` factory replaces the scene manager's former `match`/`case` dispatcher. A new dispatcher-consistency test guards against drift.
  - `services.yaml` enum for `audio_detection_mode` now includes `complex_domain` (previously missing — firmware has always supported it).
  - 45 new tests covering engine activation, conflict resolution, consumer routing, and config mapping; +20 additional tests for the pro-tier mode handlers, dispatcher, and lazy-init path (619 tests total).
  - Removed legacy preset-storage migration code introduced around 2026-02 (past the 3-month retention window):
    - RGB-to-XY color format migration for effect and segment-sequence presets (`_migrate_rgb_colors_to_xy`, `_migrate_effect_preset`, `_migrate_segment_sequence_preset`)
    - `loop_mode: "loop"` → `"count"` rename migration (`_migrate_loop_mode`)
    - Associated `MIGRATION_FLAG_KEY` and `LOOP_MODE_MIGRATION_FLAG` constants and their call sites in `PresetStore.async_load()`
    - Orphaned `XYColor.from_rgb()` classmethod in `models.py` (no remaining callers)
    - Net: −157 lines across `preset_store.py` and `models.py`. `_validate_preset_structure()` continues to enforce XY color format on import; JSON schemas continue to enforce `loop_mode ∈ {once, count, continuous}` at service invocation.

---

## [1.2.0] - 2026-03-24

### Breaking Changes

- **Minimum Home Assistant version raised to 2026.3.0** — Removes legacy backwards compatibility for pre-WebAwesome components, and adds Python 3.1.4 optimisations.

### What's New

Version 1.2.0 introduces audio-reactive lighting for dynamic scenes, a Lovelace preset favorites card, the ability to hide build-in presets, and a major codebase refactor for maintainability. It also adds CCT slider support in the color picker, allows CCT-only lights in dynamic scenes, and selected Favorite lights now presist across reloads and devices.

### **Audio-Reactive Lighting**

**Dynamic scene changes can now be synced to music through an ESPHome audio sensor**

This new feature works in tandem with an ESPHome device flashed with [custom firmware](https://github.com/absent42/esphome-audio-reactive) that analyses environmental sound and outputs a variety of sensors such as beat detection and amplitude to Home Assistant, which this new feature then translates into music reactive dynamic scenes. It can work with any pre-existing dynamic scene preset by overriding the transition and hold time settings.

Initial firmware builds for 4 cheap off-the-shelf ESP32 devices are included, the M5Stack Atom Echo ($13/£13), M5Stack Atom Echo S3R ($15/£15), Waveshare ESP32-S3 Audio Board ($18/£18), and M5StickC Plus2 ($20/£20). These can be flashed with the custom firmware using a simple [web installer](https://absent42.github.io/esphome-audio-reactive/), no specialist ESP32 knowledge is needed. The firmware can also be adapted to any ESP32 device with a microphone.

For more detailed information on how this feature works please see the dedicated [documentation page](https://github.com/absent42/Aqara-Advanced-Lighting/blob/main/docs/audio-reactive-setup.md).

  - Audio-reactive lighting mode with ESP32-based on-device audio analysis
  - New ESPHome sensor integration
  - Responsive audio overrides
  - On-device audio mode opt-in for T1 Strip non-Aqara devices with built-in music sync functions
  - 12 new audio-reative presets

### **Preset Favorites Lovelace Card**

**A new dashboard card for quick access to your favorite presets**

  - Aqara Preset Favorites card for Lovelace dashboards
  - Active preset highlighting with toggle behavior

### **Hide and restore built-in presets**

  - Hide/restore built-in presets you don't use

### **Dynamic Scenes & Color Picker**

  - CCT-only lights now supported in dynamic scenes via XY-to-CCT conversion
  - CCT slider added to the color picker panel

### Improvements

  - Favorite light and entity selection added to user persistent storage
  - Replace externally paused text with color-coded entity chips
  - More ZHA attributes exposed for native HA controls
  - Pause solar/schedule sequences on new preset activation instead of stopping
  - Unify auto-generated icons to circular style

### Fixes
- Eliminate forced reflow during drag in transition curve graph
- RGB input fields snap back
- Off-state restoration for stopping presets on lights with segments
- Align solar/schedule CCT timeline labels with bar markers
- Solar/schedule sequence restarts for lights in on-state during HA reboot

### Code Quality

  - Split `services.py` into `services/` package
  - Split `styles.ts` into `styles/` directory
  - Extracted `PreferencesController`, `<aqara-config-tab>`, `<aqara-running-operations>`, and utility modules from the main panel
  - Consolidated duplicated frontend and backend logic and constants

---

## [1.1.0] - 2026-03-09

### What's New


Version 1.1.0 adds solar and schedule-based adaptive circadian CCT sequences, capability-aware light adaptation for any Home Assistant light, and a new more comprehensive override detection system.

### Features

#### **Schedule Mode for Adaptive CCT Sequences**

**Time-of-day schedule mode as an intuitive alternative to sun-elevation solar mode**

  - Schedule steps use fixed times (12:00) or sun-relative times (sunrise+30, sunset-60)
  - Solar timeline maps elevation to time using sinusoidal sun trajectory with real sunrise/sunset positions
  - Automatic interpolation between steps on a 24-hour cycle
  - Dual-track timeline preview showing color temperature and brightness with step markers
  - New backend services `start_circadian_mode` and `stop_circadian_mode`
  - Active circadian sequences persist across Home Assistant restarts

#### **Capability-Aware Light Adaptation**

**Imporved support for non-Aqara lights in dynamic scenes and CCT sequences**

  - Capability profiles classify lights as full-color, CCT-only, brightness-only, or on/off-only
  - Service calls adapted at runtime using XY-to-CCT conversion and color temp clamping
  - Software transition opt-in for non-Aqara lights via device config panel
  - Entity chips with capability badges on running scene cards

#### **Override Detection System**

**Context-based override detection with per-attribute control for solar and schedule sequences**

  - Service call listener detects overrides from EVENT_CALL_SERVICE data before state changes arrive
  - Context-only detection replaces grace window system -- integration commands tagged via Context(parent_id)
  - Per-attribute change detection with hardware drift tolerance (brightness delta <= 5, color_temp delta <= 50K)
  - Non-HA drift detection compares entity state against last-applied values with wider thresholds
  - Bare turn-on adaptation -- parameterized turn-on calls from off state override specified attributes while solar/schedule values fill the rest
  - Per-attribute pause indicators in frontend for all card types
  - Override detection controls split into a separate collapsible section in settings

#### **Solar CCT Persistence**

**Solar and schedule sequences now persist across Home Assistant restarts**

  - Running sequences preserved on shutdown and restored on startup after entities are registered
  - Per-instance storage for sequence state

### Improvements

  - Proactive adaptation: immediate value application on resume and turn-on
  - Schedule/Solar off/on resilience: skip updates while lights are off, force-apply on turn-on
  - Per-preset auto-resume delay (moved from global to per-preset)
  - Turn off light end behavior for dynamic scenes
  - Skip first step in loop for CCT sequences
  - Added Power Nap CCT sequence preset
  - Selective user preset exports
### Bug Fixes

  - Loop N Times count field in Scenes tab
  - Signed URL preset export with selective filtering
  - Preset export using signed URL WebSocket command
  - Auth errors on API calls
  - Active presets panel not updating after activation
  - last-half, first-third, last-third keywords to parse_segment_range
  - Segment patterns not restoring off state when stopped
  - Color restore when activating from an off state

### Code Quality

  - Added entity controller test infrastructure
  - Added OverrideAttributes IntFlag and override control mode constant
  - 60+ new tests covering schedule mode, capability detection, override detection, and adaptation

---

## [1.0.0] - 2026-02-28

### What's New

Version 1.0.0 is the first stable release. It includes full Home Assistant 2026.3 compatibility, security hardening across all API and MQTT inputs, a major UI overhaul migrating to native HA components, comprehensive accessibility support, expanded diagnostics, and significant backend refactoring.

### Improvements

#### **Restore State End Behavior for Sequences**

**CCT and segment sequences can now restore lights to their pre-sequence state**

  - New "restore state" end behavior option for both CCT and segment sequences
  - Captures light state before sequence starts and restores it when the sequence completes
  - State capture and restore also now works with cancel and stop-preview across all editors

#### **Expanded Diagnostics**

**Complete diagnostic coverage across all integration subsystems**

  - Added diagnostics for segment sequences, music sync, entity controller, and all stores
  - Provides full visibility for troubleshooting via the HA diagnostics panel

### Home Assistant 2026.3 Compatibility

#### **Component Migration**

  - Migrated all MWC (Material Web Components) to native HA components
  - Replaced `mwc-button` with `ha-button` across all toolbar actions
  - Migrated `ha-dialog` to 2026.3 API with backwards compatibility for 2026.2
  - Replaced custom form controls (sliders, selectors, inputs) with HA native components
  - Added `--mdc-icon-button-size` fallback for `ha-icon-button` on HA 2026.2
  - Added brand icons and logos for HA 2026.3 brand registry

#### **Theme and CSS Updates**

  - Replaced all dead MWC CSS variables with HA 2026.x equivalents
  - Replaced hardcoded colors with HA theme variables
  - Converted custom modals to `ha-dialog`
  - Applied HA card `border-radius` variable for consistent card styling
  - Removed dead preset tab CSS

#### **API Updates**

  - Replaced deprecated mired color temperature attributes with kelvin for HA 2026.3
  - Use HA managed web session for image downloads

### Security

#### **API and Input Hardening**

  - Fixed SSRF vulnerability in `ColorExtractView` image URL fetch
  - Hardened all API endpoints and MQTT input handling with validation
  - Added input validation and storage limits across API and backend

### UI/UX Improvements

#### **Redesigned Interface**

  - Redesigned instance cards with polished editor UI
  - Redesigned active preset cards with accent border, type labels, and icon treatment
  - Shortened sort dropdown labels and reduced dropdown width
  - Hidden zone button labels on mobile for cleaner layout
  - Improved mobile layout and touch support
  - Replace add-favorites button with save bar

#### **Accessibility**

  - Added ARIA attributes across all frontend components for screen reader support

### Bug Fixes

  - Fixed CCT sequence not affecting lights in RGB mode
  - Fixed CCT editor loop count field not showing when loop mode is count
  - Fixed zone selector event leak and unsaved indicator text wrapping
  - Fixed `start_dynamic_scene` service not finding built-in presets
  - Fixed `loop_mode` value mismatch between frontend editors and backend schema
  - Fix false external-pause triggers during long transitions and holds

### Code Quality and Refactoring

#### **Backend Refactoring**

  - Extracted `BaseStore` to consolidate shared storage infrastructure
  - Extracted `BaseSequenceManager` to eliminate duplicate sequence lifecycle code
  - Consolidated duplicate CCT transition and light control into `transition_utils`
  - Refactored `services.py`: extracted schema helpers, cached segment count, deduplicated lookups
  - Consolidated duplicate RGB-to-XY conversion into single source
  - Removed unused gamut clamping functions and empty `EFFECT_ICON_MAP`
  - Removed dead code and deduplicated shared logic

#### **Frontend Refactoring**

  - Extracted shared editor constants, localization, and form CSS into `editor-constants.ts`
  - Added frontend performance optimizations and type safety improvements
  - Removed duplicate color picker CSS from panel styles

### Breaking Changes

None. This release is fully backward compatible with v0.13.x. All existing presets, favorites, and configurations are preserved.

### Compatibility

  - Home Assistant 2026.2 and 2026.3 supported
  - All existing presets, favorites, and configurations preserved
  - No configuration changes required

---

## [0.13.1] - 2026-02-21

### What's New

Version 0.13.1 adds software-interpolated transitions for T1-family devices, optimizes effect attribute write order per device type, and reduces activation timing delays.

### New Features

#### **Software-Interpolated Transitions for T1-Family Devices**

**Smooth CCT and color transitions on T1M and T1 Strip**

T1M and T1 Strip devices don't fully support hardware transitions (T1M has a fixed ~2s transition that ignores requested duration; T1 Strip supports brightness transitions but not color temperature). This release adds software interpolation to simulate smoother longer transitions on these devices.

  - Cubic easing (`ease_in_out_cubic`) for natural-looking transitions
  - Per-device step intervals: T1M minimum 2.0s (hardware smooths between steps), T1 Strip minimum 0.5s
  - Adaptive interval scaling: shorter intervals for quick transitions, longer for extended sequences
  - Interruptible at any sub-step via stop events
  - CCT transitions in both MQTT and ZHA backends
  - XY color transitions in both MQTT and ZHA backends
  - Shared `transition_utils.py` module used by both backends and the scene manager
  - Falls back to direct application if entity is unavailable

### Improvements

#### **Device-Specific Effect Attribute Write Order**

**Optimized MQTT payload and ZCL write order per device type**

  - T2 bulbs: effect type and speed are written before colors (writing speed restarts the effect with default colors, so colors must come last)
  - T1M and T1 Strip: effect type is written first, then colors and speed together (speed is a live adjustment on T1-family, so colors before speed gives faster visual rendering)
  - ZHA backend combines related attributes into single ZCL frames to reduce Zigbee round-trips
  - `DynamicEffect.to_mqtt_payload()` now accepts `device_model` parameter for per-device ordering

#### **Reduced Activation Timing Delays**

  - Light turn-on delay reduced from 0.5s to 0.25s (blocking service call already confirms dispatch)
  - T1 Strip brightness pre-set delay reduced from 0.1s to 0.05s for segment patterns, gradients, and blocks
  - Removed unnecessary `GROUP_SYNC_DELAY` constant
  - Removed inter-group delay between ZHA segment color writes

### Breaking Changes

None. This release is fully backward compatible with v0.13.0.

### Compatibility

- All existing presets, favorites, and configurations preserved
- No configuration changes required
- All previous features and APIs unchanged

---

## [0.13.0] - 2026-02-15

### What's New

Version 0.13.0 adds ZHA backend support as an alternative to Zigbee2MQTT, an image color extractor for dynamic scene presets, T1 Strip audio sync controls, dynamic scene color assignment overrides, and an ignore external changes toggle.

### New Features

#### **ZHA Backend Support**

**Full ZHA integration alongside Zigbee2MQTT**

Use Aqara advanced lighting features through the ZHA integration without requiring Zigbee2MQTT

  - Custom zigpy quirks for each supported device type (T2 bulbs, T1M, T1 Strip)
  - Direct Zigbee cluster attribute writes for effects, segment patterns, and segment sequences
  - Config flow support for quirked ZHA devices
  - ZHA installation instructions added to README

#### **Image Color Extractor**

**Extract colors from images for dynamic scene presets**

  - Upload or link an image to automatically extract a color palette
  - Extracted colors populate directly into the dynamic scene editor

#### **T1 Strip Audio Sync**

**Frontend controls for T1 Strip music synchronization mode**

  - Audio sync toggle, sensitivity, and effect controls in the panel
  - 2 device triggers: music sync enabled, music sync disabled (with sensitivity and audio effect in event data)
  - 1 device condition: music sync is active

#### **Dynamic Scene Color Assignment Override**

**Override color-to-light assignment when activating scenes**

  - Manually assign scene color distribution
  - Brightness activation override for per-scene control

#### **Ignore External Changes Toggle**

**Prevent external changes from pausing running operations**

  - Toggle to ignore external state changes on entities running sequences or scenes
  - Prevents false external pause detection from other automations or manual adjustments

### Improvements

#### **Device Registry Merging**

**Aqara Advanced Lighting devices now share the existing MQTT/ZHA device instead of creating duplicates**

  - The integration now merges into the existing MQTT or ZHA device in the Home Assistant device registry rather than creating a separate device for each light
  - For Z2M: uses shared MQTT identifiers so Home Assistant recognizes both integrations belong to the same physical device
  - For ZHA: uses Zigbee IEEE connection matching for automatic device merging
  - Users see one device per physical light with both integrations listed
  - Old standalone devices from previous versions are automatically removed on upgrade
  - Installing the integration does not affect existing MQTT/ZHA device setups
  - See [Breaking Changes](#breaking-changes) for upgrade notes on device automations

#### **Unified State Restoration**

**Shared StateManager helper for all operation types**

  - Consolidated state restoration logic into a shared StateManager helper
  - Consistent save/restore behavior across effects, sequences, and scenes
  - Cleaner codebase with reduced duplication

### Bug Fixes

- **Fixed auto-fill for new sequence steps** - New CCT and segment sequence steps now auto-fill with the previous step's settings instead of defaults
- **Fixed false external pause detection** - Operations no longer incorrectly detect external changes and pause themselves
- **Fixed deprecated `color_temp` usage** - State restore service calls now use the correct color temperature attribute
- **Fixed tab compatibility detection** - Frontend now uses `device_type` from the backend API for reliable tab compatibility checks
- **Fixed device type dropdown** - Device type dropdown now correctly updates when changing the selected entity
- **Fixed brightness override persistence** - Brightness override setting is now properly stored in user preferences
- **Fixed effects and patterns stopping sequences** - Effects and patterns now call `stop_all_for_entity` to fully stop running sequences instead of pausing and resuming them

### Breaking Changes

#### **Device Automation Re-selection**

**Device triggers and conditions require re-selection after upgrading**

  - The old standalone Aqara Advanced Lighting device is removed during upgrade and replaced by the merged MQTT/ZHA device (see [Improvements](#improvements))
  - **Action required:** If you have device automations (triggers or conditions) targeting the old standalone Aqara Advanced Lighting device, you will need to re-select the device in those automations after upgrading

### Compatibility

- All existing presets, favorites, and configurations preserved
- No configuration changes required
- All previous features and APIs unchanged
- ZHA support works alongside existing Zigbee2MQTT setups
- Device automations using triggers or conditions need device re-selection (see breaking changes above)

---

## [0.12.0] - 2026-02-08

### What's New

Version 0.12.0 introduces Dynamic Scenes for ambient lighting across multiple lights, Device Conditions for advanced automations, Active Presets monitoring, Activation Overrides for quick preset customization, and Favorite Presets for easy access to your most-used configurations.

### New Features

#### **Dynamic Scenes**

**Ambient lighting scenes across multiple lights**

Aimed primarily at T2 bulbs, create color transitions that work with any RGB light entity including non-Aqara devices

  - Up to 8 colors with XY color pickers and per-color brightness control (1-100%)
  - Transition time (30-3600 seconds) for smooth color changes
  - Hold time (0-3600 seconds) to pause at each color
  - Three distribution modes:
    - Shuffle and rotate - Each light gets a different color, then colors rotate smoothly through all lights along the color wheel
    - Synchronized - All lights transition through the same colors together
    - Random - Each light picks random colors from the palette
  - Transition stagger (0-10 seconds) to create wave effects across lights
  - Loop modes: once, count (1-1000), or continuous
  - End behavior: restore to previous state or maintain last color
  - Static mode option to apply colors once without transitions
  - Works with any RGB light entity, not limited to Aqara devices

**58 built-in dynamic scene presets** - Nature themes, relaxation themes, vibrant & cosmic, seasonal, and many more

**Dynamic scene editor** - Visual editor in the Scenes tab for creating custom dynamic scenes

  - XY color pickers with per-color brightness
  - Loop and end behavior configuration
  - Save as custom presets
  - Icon generation for gradient thumbnails

**Dynamic scene services** - Backend actions, triggers and conditions for scene automations
  - `start_dynamic_scene` - Start a dynamic scene with preset or manual configuration
  - `stop_dynamic_scene` - Stop running scene(s) with optional state restoration
  - `pause_dynamic_scene` - Pause a running scene
  - `resume_dynamic_scene` - Resume a paused scene
  
**Dynamic scene triggers** - 6 device triggers for scene lifecycle events
  - Scene started, stopped, paused, resumed
  - Loop completed, finished

**REST API support** - Trigger dynamic scene presets via REST API endpoint

#### **Device Conditions**

**7 device conditions for automations** - Check current state of lights in automation conditions

  - CCT sequence is running / paused
  - Segment sequence is running / paused
  - Dynamic effect is active
  - Dynamic scene is running / paused

**Preset filter support** - Optional filter to check for specific preset by name

  - Allows precise condition matching for specific effects, sequences, or scenes
  - Example: "Only turn on fan if goodnight sequence is running"

#### **Active Presets Monitoring**

**Running presets display** - Real-time monitoring of all active operations

  - Shows all running effects, sequences, and scenes
  - Operation cards display preset icon, name, and target entity
  - Control buttons: stop, pause, resume for each operation
  - Multi-entity support with auto-refresh when operations change
  - Replaces the previous Quick Actions section

#### **Activation Overrides**

**Custom brightness override** - Override preset brightness when activating (1-100%)

  - Toggle to enable/disable
  - Slider for brightness adjustment
  - Applies to all preset types

**Static scene mode** - For dynamic scenes only

  - Apply scene colors once without starting transitions
  - Colors distributed according to scene's distribution mode
  - Lights remain at assigned colors without cycling

#### **Favorite Presets**

**Star your favorite presets** - Quick access to most-used presets

  - Mark any preset as favorite with star icon
  - Favorites appear in dedicated section for quick activation
  - Device-type-level filtering - only show presets compatible with selected lights
  - Sorting options: alphabetical or by date

#### **Preset Management Improvements**

**Dynamic preset population** - Service action dropdowns now populated with current presets

  - Always shows up-to-date preset lists
  - Includes both built-in and user-created presets

### Improvements

#### Frontend Enhancements

**Setup status indicator** - Shows when integration is still initializing
  - Prevents confusion during initial setup
  - Clear feedback when backend is not ready

**Include-all-lights toggle** - Light selection control
  - Option to include non-Aqara RGB/CCT lights for dynamic scenes and CCT sequences
  - Improved generic light compatibility

**Entity conflict resolution** - Cross-type conflict detection and handling
  - Prevents conflicts between different operation types
  - External change detection pauses affected entities
  - Entities can rejoin operations after manual changes

**Touch device improvements**
  - Removed click-to-activate from My Presets tab
  - Better touch target sizing
  - Improved gesture support

### Bug Fixes

- **Fixed entity conflict resolution** - Proper handling of conflicts between operation types
- **Fixed state restoration** - Correct restoration of light states after effects/scenes
- **Fixed Circadian Rhythm preset** - Corrected timing and color temperature values
- **Fixed falsy value handling** - Editor change handlers now use nullish coalescing (??) instead of logical OR (||)
- **Fixed device automation translation format** - Proper translation for extra fields in device triggers/conditions
- **Fixed editor cancel button** - Reset editor to default state when cancel is clicked
-  **Fixed segment zone panel** - Hide segment zone config when no compatible device selected

### Breaking Changes

None. This release is fully backward compatible with v0.11.0.

- All existing presets and configurations preserved
- No configuration changes required
- All previous features and APIs unchanged

### Compatibility

- Fully backward compatible with v0.11.0
- All existing features and APIs unchanged
- No configuration changes required
- All presets and favorites preserved
- Dynamic scenes are an additive feature - existing functionality unchanged

---

## [0.11.0] - 2026-02-02

### What's New

Version 0.11.0 introduces segment zone naming, a REST API trigger endpoint for external integrations, drag-and-drop step reordering in sequence editors, per-user preferences with server-side storage, and editor state preservation across tab switches.

### New Features

#### Segment Zone Naming

- **Per-device segment zone naming** - Assign custom names to segment zones on each device with a visual grid editor for intuitive zone configuration

#### State preservation across tab switching

- **Editor state preservation** - Editor state is preserved across tab switches with in-memory draft caching, so you don't lose work when switching tabs

#### User Preferences

- **Per-user preferences with server-side storage** - User preferences are stored on the server, persisting across browsers and devices
- **Collapsed section persistence** - Collapsed/expanded state of panel sections is saved to user preferences and restored on load

#### REST API Trigger Endpoint

- **External preset activation** - New REST API endpoint allows triggering presets from external systems, scripts, or third-party integrations without going through the HA UI

#### Sequence Editor Improvements

- **Drag-and-drop step reordering** - Reorder steps in CCT and segment sequence editors by dragging them into position

### Improvements

- **Device trigger diagnostics** - Device trigger readiness information added to diagnostics output

### Bug Fixes

- **Fixed preset colors not applied** when editing or duplicating segment sequences
- **Fixed effect selector** rendering issue
- **Fixed endpoint authentication** for API requests

### Breaking Changes

None. This release is fully backward compatible with v0.10.0.

- All existing presets and configurations preserved
- No configuration changes required

### Compatibility

- Fully backward compatible with v0.10.0
- All existing features and APIs unchanged
- No configuration changes required
- All presets and favorites preserved

---

## [0.10.0] - 2026-01-31

### What's New

Version 0.10.0 adds device triggers for Home Assistant automations, preset management improvements including duplicate and edit, dynamic SVG preview thumbnails, recent color history in color pickers, and improved device type handling for T1M.

### New Features

#### Device Triggers and Registry

- **Device triggers for HA automations** - Aqara lighting devices now appear in the Home Assistant automation UI device trigger selector, enabling native trigger-based automations
- **Device registry registration** - Devices are registered in the HA device registry with sequence event metadata for better integration visibility

#### Preset Management

- **Preset duplicate and edit** - Duplicate existing presets and edit saved presets directly, streamlining preset workflow
- **Dynamic SVG preset preview thumbnails** - Presets now display dynamically generated SVG thumbnail previews showing the actual color pattern

#### Activate Tab

- **Cross-tab device context** - Selected device on the Activate tab now carries over to editor tabs, reducing repetitive device selection
- **Device type sections with sorting** - Activate tab is split by device type (T1, T1M, T2) with per-section sorting for easier navigation

#### Color Picker

- **Recent colors history** - Color picker modals now remember recently used colors for quick reuse

#### Effects panel

- **New effect icons** - Updated icons for dynamic effects

### Improvements

- **T1M endpoint capability filtering** - Features are now filtered based on T1M endpoint capabilities, preventing unsupported operations
- **O(1) device name lookups** - Added `devices_by_name` index for faster friendly-name resolution
- **Segment pattern preset scaling** - Pattern presets now automatically scale to fit the device segment count
- **Increased max hold time** - Sequence preset hold time limit raised to 12 hours

### Bug Fixes

- **Fixed segment sequence pattern mode** - Pattern mode now loads correctly when opening saved presets
- **Fixed brightness conversion** - Corrected brightness value conversion when activating user presets
- **Fixed unspecified segment colors** - Segments without explicit colors no longer turn white when editing saved presets
- **Removed unused styles** - Cleaned up unused preset category and subcategory CSS

### Breaking Changes

None. This release is fully backward compatible with v0.9.0.

- All existing presets and configurations preserved
- No configuration changes required

### Compatibility

- Fully backward compatible with v0.9.0
- All existing features and APIs unchanged
- No configuration changes required
- All presets and favorites preserved

---

## [0.9.0] - 2026-01-28

### What's New

Version 0.9.0 introduces advanced gradient creation tools, improved color accuracy across the frontend, and a major code modernization converting the segment selector component to TypeScript.

### New Features

#### Advanced Gradient Creation

Five new gradient options in the segment selector's gradient mode:

- **Reverse direction** - Flip the gradient direction with a single toggle
- **Mirror gradient** - Create symmetric patterns (A-B-C-B-A) from your color stops, with correct handling for both odd and even segment counts
- **Interpolation mode selector** - Choose between three color blending methods:
  - Shortest hue path (default) - Interpolates through the shortest arc on the color wheel
  - Longest hue path - Takes the long way around for more colorful transitions
  - Linear RGB - Blends directly in RGB space for different visual results
- **Repeating gradient** - Tile the gradient pattern across segments (1-10 repeats)
- **Wave easing** - Apply sinusoidal easing to color transitions with configurable cycle count (1-5 cycles), creating smooth oscillating patterns

All gradient options work with both "Apply to Grid" and "Apply to Selected" actions, and persist per-step in segment sequence editor.

### Improvements

#### Color Accuracy

- **Improved XY-to-RGB conversion** - Added max-component normalization to the sRGB D65 transformation, fixing washed-out blues and improving color fidelity across the entire color wheel
- **Consistent color conversion** - All frontend components now use shared color utility functions from `color-utils.ts`, eliminating duplicate inline implementations with slightly different behavior

#### Frontend Architecture

- **TypeScript conversion of segment selector** - Converted the standalone `segment-selector.js` to a fully typed TypeScript component bundled into the main panel
  - Replaced inline color utility functions with imports from shared `color-utils.ts`
  - Added proper TypeScript interfaces for translations, modes, and color types
  - Eliminated the separate `/api/aqara_advanced_lighting/segment-selector.js` endpoint
  - Single bundled output reduces HTTP requests and simplifies deployment
- **Parent component updates** - Pattern editor and segment sequence editor updated with property bindings for all gradient options

### Technical Changes

#### New Files

- `frontend_src/src/segment-selector.ts` - TypeScript conversion of segment selector component

#### Removed Files

- `frontend/segment-selector.js` - Replaced by bundled TypeScript version

#### Updated Files

- **Frontend**
  - `index.ts` - Changed from dynamic runtime import to static import for segment selector
  - `pattern-editor.ts` - Added state properties and bindings for gradient options
  - `segment-sequence-editor.ts` - Extended EditableStep interface with gradient fields, added bindings
  - `translations/panel.en.json` - Added 9 translation keys for gradient features
  - `aqara_panel.js` - Rebuilt bundle including segment selector component

- **Backend**
  - `panel.py` - Removed `SegmentSelectorJavaScriptView` class and HTTP endpoint registration

### Breaking Changes

None. This release is fully backward compatible with v0.8.2.

- All existing presets and configurations preserved
- Gradient features are additive and optional
- No configuration changes required

### Compatibility

- Fully backward compatible with v0.8.2
- All existing presets and configurations preserved
- No configuration changes required

### Upgrade from v0.8.2

1. Update the integration through HACS
2. Restart Home Assistant
3. Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)

## [0.8.2] - 2026-01-28

### Improvements

#### Config Flow Cleanup

- **Removed friendly name field from config flow**
  - Config entry titles are now auto-generated as "Aqara Lighting ({base_topic})"
  - Follows Home Assistant guidelines: non-helper integrations should not allow custom names in config flows
  - Existing config entries retain their current titles
  - Reconfiguring an entry updates the title to the new auto-generated format

#### Entity Mapping Reliability

- **Strengthened entity mapping Strategy 4 (entity ID pattern matching)**
  - Strategy 4 now only matches entities from the MQTT platform
  - Prevents false-positive matches against non-MQTT entities with similar names
  - Mapping method tracked per entity for diagnostics transparency

#### Enhanced Diagnostics

- **Entity mapping methods exposed in diagnostics output**
  - Each mapped entity now shows which matching strategy was used
  - Helps troubleshoot mapping issues across multi-instance setups
  - Uses public accessor method for CCT sequence manager active sequences

#### Code Quality

- **Timezone-aware datetimes in state manager**
  - Replaced `datetime.now()` with `dt_util.utcnow()` for Home Assistant compliance
  - Prevents timezone-related issues in state expiry calculations
- **Improved test coverage**
  - Config flow tests rewritten with correct mocks and assertions
  - Init tests rewritten to mock actual integration components
  - Added Z2M validation mock fixture for config flow tests
  - New tests for duplicate entry prevention and multi-instance topic validation

### Documentation

- **README updated** to reflect config flow changes
  - Removed friendly name references from setup and reconfiguration sections
  - Updated multi-instance instructions

### Breaking Changes

None. This release is fully backward compatible with v0.8.0.

- Existing config entries retain their current titles
- Stale `friendly_name` data in config entry is harmless and ignored
- Only reconfiguring an entry changes the title to the auto-generated format

### Compatibility

- Fully backward compatible with v0.8.0
- All existing presets and configurations preserved
- No configuration changes required

### Upgrade from v0.8.0

1. Update the integration through HACS
2. Restart Home Assistant
3. Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)

## [0.8.1] - 2026-01-21

### What's New

Version 0.8.1 introduces support for multiple Zigbee2MQTT instances, allowing control of Aqara lights across multiple Z2M coordinators from a single integration. Perfect for complex smart home setups with distributed Zigbee networks.

### New Features

#### Multiple Zigbee2MQTT Instance Support

- **Multi-Instance Architecture**
  - Connect to multiple Zigbee2MQTT instances simultaneously
  - Each instance identified by unique MQTT base topic
  - Independent configuration per instance
  - Automatic entity-to-instance routing for service calls
  - Per-instance MQTT clients and state managers

- **Enhanced Config Flow**
  - Automatic Z2M instance validation during setup
  - Auto-generated titles based on Z2M base topic
  - Subscribes to bridge/state topic to confirm Z2M is running
  - 5-second validation timeout with clear error messages
  - Duplicate prevention for same base topic
  - Reconfigure flow updates title when base topic changes

- **Intelligent Entity Routing**
  - Service calls automatically routed to correct Z2M instance
  - Fast O(1) entity lookup using routing map
  - Entity-to-instance mapping built during device discovery
  - Fallback search across all instances if needed
  - Routing map cached and updated automatically

#### Supported Entities API

- **New API Endpoint**: `/api/aqara_advanced_lighting/supported_entities`
  - Returns all supported entities across all Z2M instances
  - Includes device type, model ID, and Z2M friendly name
  - Instance summary with device counts by type (T2 RGB, T2 CCT, T1M, T1 Strip)
  - List of devices per instance

- **Backend-Driven Entity Detection**
  - Frontend uses authoritative backend data for device type detection
  - Entity selector shows only supported Aqara devices from all instances
  - Replaces frontend-only heuristic detection
  - More accurate device type identification
  - Better compatibility validation

### Improvements

#### Error Messages

- **Instance-Aware Error Reporting**
  - Errors report which Z2M instance has the issue
  - Lists all configured instances when entity not found
  - New translation key: `entity_not_found_in_any_instance`
  - Helpful context for troubleshooting multi-instance setups
  - Clear guidance on which instance to check

#### Service Validation

- **Multi-Instance Entity Validation**
  - Validates entities exist in configured instances before processing
  - Searches across all instances to find entity
  - Provides specific error when entity not found in any instance
  - Lists available instances for reference

#### Logging Enhancements

- **Instance-Specific Logging**
  - Setup logs include entry ID and Z2M base topic
  - Mapping logs show which instance owns each entity
  - Warning logs for Z2M devices without matching HA entities
  - Debug logs show all light entities in HA
  - Final entity-to-Z2M mapping displayed for verification

#### Sequence Synchronization

- **Group Synchronization for Sequences**
  - CCT and RGB segment sequences now support synchronized playback across multiple lights
  - Uses asyncio barriers to coordinate step timing between entities
  - All lights in a group transition steps together with perfect timing
  - Ideal for synchronized animations and effects across multiple fixtures
  - Automatic cleanup when sequences stop or entities are removed

#### Frontend Updates

- **Entity Selector Improvements**
  - Entity selector pre-filtered to supported Aqara entities
  - Shows entities from all configured Z2M instances
  - Entity list updates when new instances added
  - Changed from target selector to entity selector with multiple support
  - Better user experience with only relevant entities

### Bug Fixes

#### Firefox Compatibility

- **TouchEvent Detection Fix**
  - Fixed touch event detection in xy-color-picker for Firefox compatibility
  - Changed from `instanceof TouchEvent` to `'touches' in e` check
  - Resolves issues with color picker not working on Firefox mobile/desktop
  - Improves cross-browser compatibility for touch interactions

### Technical Changes

#### Architecture Updates

- **Multi-Instance Data Structure**
  - Restructured `hass.data[DOMAIN]` with `entries` dict and `entity_routing` map
  - Per-entry storage for mqtt_client, state_manager, sequence managers
  - Shared preset_store and favorites_store across all instances
  - Entity routing map for fast instance lookup

- **Service Routing Functions**
  - `_get_instance_for_entity()` - Find instance owning an entity
  - `_get_mqtt_client_for_entity()` - Get MQTT client for entity
  - `_get_instance_components_for_entity()` - Get all components for entity
  - `_get_any_instance()` - Get any instance for backward compatibility
  - Updated all service handlers to use instance routing

#### Updated Files

- **Backend**
  - `__init__.py` - Multi-instance data structure, per-entry setup and teardown
  - `config_flow.py` - Z2M validation, auto-generated titles, duplicate prevention, unique IDs
  - `services.py` - Entity routing functions and instance-aware service handlers
  - `mqtt_client.py` - Entity routing map updates during discovery, enhanced logging
  - `panel.py` - New SupportedEntitiesView with device type categorization
  - `cct_sequence_manager.py` - Group synchronization support with barriers
  - `segment_sequence_manager.py` - Group synchronization support with barriers
  - `translations/en.json` - New translations for multi-instance scenarios

- **Frontend**
  - `aqara-panel.ts` - Supported entities API integration, backend-driven filtering
  - `xy-color-picker.ts` - Firefox touch event compatibility fix
  - `styles.ts` - Minor styling adjustments
  - `aqara_panel.js` - Compiled frontend bundle
  - `segment-selector.js` - Compiled component

### Breaking Changes

None. This release is fully backward compatible with v0.7.0.

- Single-instance setups continue to work without changes
- Existing config entries automatically migrated to new data structure
- All services, presets, and favorites preserved
- No manual configuration needed

### Compatibility

- Fully backward compatible with v0.7.0
- All existing presets and configurations preserved
- No configuration changes required for single-instance users
- Multi-instance features are optional and additive

### Upgrade from v0.7.0

1. Update the integration through HACS
2. Restart Home Assistant
3. Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)
4. Existing configuration automatically migrated
5. To add additional Z2M instances: Settings > Devices & Services > Add Integration > Aqara Advanced Lighting

### Use Cases

- Multiple Zigbee coordinators in different locations (upstairs/downstairs, home/garage)
- Separate Z2M instances for different device types or zones
- Complex smart home setups with distributed Zigbee networks
- Zone-based lighting control across multiple coordinators

## [0.7.0] - 2026-01-18

### What's New

Version 0.7.0 introduces enhanced color accuracy with a new XY-based color picker, visual segment pattern edtior for segment sequences, visual segment selection for T1 Strip effects, and improved segment sequence capabilities. This release focuses on user experience improvements and color fidelity.

### New Features

#### Segment Selector Component

- **Visual Segment Selection** for segment sequences
  - Interactive visual representation of all available segments
  - Click or tap segments to select/deselect
  - Visual feedback showing selected segments
  - Automatic segment count detection based on device type
  - Support for T1M (20 or 26 segments) and T1 Strip (variable length)
  - Clear selected segments button for quick reset
  - Compact display optimized for mobile and desktop

#### XY Color Picker Component

- **Replaced HS Color Picker** with more accurate XY-based circular color wheel
  - Uses CIE 1931 XY color space for device-independent color representation
  - Improved color accuracy and consistency across devices
  - RGB input fields for precise color specification
  - Visual feedback when RGB-to-XY conversion adjusts values
  - Touch-friendly interface with draggable marker
  - Responsive design adapts to different screen sizes

#### Enhanced Segment Sequences

- **Direct Segment Color Assignment** in RGB segment sequences
  - New `segment_colors` field for explicit segment-to-color mapping
  - Simplifies sequence creation with direct control
  - Backward compatible with existing mode/colors/gradient approach
  - More flexible than pattern modes for complex animations
  - Backend validation ensures data integrity

### Improvements

#### Frontend Enhancements

- **Color Picker UX**
  - Replaced all HS color pickers with XY color pickers throughout panel
  - Consistent color behavior across effects, patterns, and sequences
  - RGB input fields provide precise numerical color control
  - Visual marker shows exact selected color on wheel
  - Improved accessibility with clear visual indicators

- **Pattern Editor**
  - New segment selector replaces text input for segment ranges
  - Visual representation makes it easier to design patterns
  - See exactly which segments will be affected before applying
  - Cleaner interface with reduced clutter

- **Segment Sequence Editor**
  - Segment selector integrated for each sequence step
  - Visual feedback for segment assignments
  - Easier to create complex multi-step sequences
  - Improved step management UI

#### Code Quality

- **Frontend Refactoring**
  - Removed deprecated hs-color-picker.ts component
  - Added xy-color-picker.ts with better performance
  - Added reusable segment-selector.js component
  - Cleaner code structure with better separation of concerns
  - Reduced duplication across editor components
  - Improved type safety with TypeScript

- **Backend Improvements**
  - Enhanced SegmentSequenceStep model to support direct segment colors
  - Backward compatible validation for legacy sequence formats
  - Improved error messaging for validation failures
  - Better code organization in segment sequence manager

### Technical Changes

#### New Files

- `frontend_src/src/xy-color-picker.ts` - XY-based circular color wheel component
- `frontend/segment-selector.js` - Visual segment selection component (compiled)

#### Removed Files

- `frontend_src/src/hs-color-picker.ts` - Replaced by XY color picker

#### Updated Files

- **Frontend**
  - `aqara-panel.ts` - Integrated XY color picker and segment selector
  - `effect-editor.ts` - Updated to use XY color picker
  - `pattern-editor.ts` - Updated to use segment selector and XY color picker
  - `segment-sequence-editor.ts` - Updated to use segment selector and XY color picker
  - `styles.ts` - Updated styles for new components
  - `types.ts` - Added XYColor type definitions
  - `index.ts` - Registered new XY color picker component

- **Backend**
  - `models.py` - Enhanced SegmentSequenceStep with segment_colors field
  - `panel.py` - Added segment selector JavaScript endpoint
  - `services.py` - Updated to handle new segment sequence format
  - `segment_sequence_manager.py` - Enhanced step execution for direct segment colors
  - `const.py` - Updated constants for new features

### Breaking Changes

None. This release is fully backward compatible with v0.6.2.

- Existing sequences using mode/colors/gradient continue to work
- New segment_colors field is optional
- Frontend automatically uses XY color picker without user intervention
- All saved presets remain compatible

### Compatibility

- Fully backward compatible with v0.6.2
- All existing presets and configurations preserved
- No configuration changes required
- Preset backup files are forward-compatible

### Upgrade from v0.6.2

1. Update the integration through HACS
2. Restart Home Assistant
3. Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)
4. All existing presets and configurations are preserved

## [0.6.2] - 2026-01-15

### Bug Fixes

#### Fixed Preset Store Initialization Error

- **Resolved "Preset store not initialized" errors** in panel and services
  - Preset store was being deleted when config entries were removed
  - Integration-level data (preset_store, favorites_store) now persists independently of config entries
  - Panel and services remain functional even without active config entries
  - Added prevention of re-initialization if stores already exist
  - Improved error logging for easier debugging

#### Fixed Service Unload Warnings During Reload

- **Eliminated "Unable to remove unknown service" warnings** during config entry reload
  - Services are now correctly managed as integration-level resources
  - Services persist for the integration's lifetime instead of being unloaded with config entries
  - Fixed lifecycle mismatch where services were registered once but unloaded on each reload
  - All 13 integration services now remain available throughout HA session

### Technical Improvements

- **Integration Resource Management**
  - Clear separation between integration-level and config-entry-level resources
  - Integration-level (persistent): Services, panel, preset store, favorites store
  - Config-entry-level (per-entry): MQTT client, state manager, sequence managers
  - Improved lifecycle management and cleanup procedures
  - Better alignment with Home Assistant integration best practices

## [0.6.1] - 2026-01-14

### What's New

Version 0.6.1 introduces preset backup and restore functionality, enhanced visual styling throughout the panel, and improved user experience with better contrast and color-coded feedback.

### New Features

#### Preset Backup and Restore

- **Export Presets**: Backup all user-created presets to JSON file
  - One-click export from My Presets tab
  - Preserves all effect, pattern, CCT, and segment sequence configurations
  - Portable backup files for saving or sharing

- **Import Presets**: Restore presets from backup files
  - Validates backup structure and version compatibility
  - Progress indicator during import
  - Shows count of successfully restored presets
  - Comprehensive error handling

#### Version Mismatch Detection

- **Frontend-Backend Version Monitoring**
  - Automatic version comparison between components
  - Warning banner when versions don't match
  - Helps troubleshoot cache-related issues after updates
  - Clear instructions to resolve mismatches

### Improvements

#### Visual Enhancements

- **Transition Curve Graph** (Device Config tab)
  - Increased graph size with reduced border padding
  - Better horizontal centering with balanced spacing
  - Improved grid contrast for all themes
  - Dynamic curve coloring based on curvature value (amber/green/blue)
  - Optimized mobile spacing for small screens

- **Color Pickers**
  - RGB value display in all color picker dialogs
  - Real-time color values as you select
  - Monospace font for easy reading

- **Panel Styling**
  - Active tab text uses brand color for better visibility
  - Secondary text color applied to labels for better hierarchy
  - Improved hover effects on Export/Import buttons
  - Better visual consistency across all tabs

- **Favorites Display**
  - Redesigned with button-style layout
  - Icon-based visual design with color-coded state indicators
  - Smooth hover transitions and better touch targets

#### User Experience

- Better contrast and readability throughout
- Graph grid lines optimized for light and dark modes
- Consistent label styling across all tabs
- Improved responsive layout for mobile devices

#### Documentation

- **Comprehensive Update Guide** in README
  - Step-by-step HACS update instructions
  - Version mismatch troubleshooting guide
  - Cache clearing for desktop and mobile platforms
  - Manual update instructions
- Added panel screenshots for all tabs
- Updated integration logo

### Bug Fixes

- Fixed graph container horizontal overflow on mobile
- Resolved canvas padding inconsistencies
- Improved responsive layout for small screens

### Technical Changes

- **Frontend**
  - New backup/restore UI in My Presets tab
  - Enhanced transition-curve-editor with dynamic coloring
  - RGB color display in effect, pattern, and segment editors
  - Updated translations for backup/restore

- **Backend**
  - New `import_presets` and `export_presets` API endpoints
  - Backup file validation with version checking
  - Preset serialization/deserialization support
  - Enhanced error handling

### Compatibility

- Fully backward compatible with v0.6.0
- All existing presets and configurations preserved
- No configuration changes required
- Preset backup files are forward-compatible

### Requirements

- Home Assistant 2025.12.0 or newer
- MQTT integration configured
- Zigbee2MQTT 2.7.2 or newer
- Supported Aqara devices (see README)

## [0.6.0] - 2026-01-12

### What's New

Version 0.6.0 introduces a new device configuration panel alongside documentation improvements and workflow adjustments. This release adds device-specific settings accessible directly from the panel UI.

### New Features

#### Device Configuration Panel

A new Config tab has been added to the sidebar panel, providing direct access to device-specific settings, having the ability to push parameters to multiple devices simultaneously:

- **Transition Curve Editor** (T2 bulbs)
  - Visual curve editor for transition curvature (0.2-6.0 range)
  - Interactive graph showing brightness vs time curve
  - Three curve types: Fast then slow (0.2-1), Linear (1), Slow then fast (1-6)
  - Real-time preview with draggable adjustment
  - Apply button to send settings to device

- **Initial Brightness** (T2 bulbs)
  - Configure startup brightness (0-50%)
  - Direct entity control via slider
  - Immediate feedback and updates

- **Dimming Settings** (All devices)
  - On-to-off duration (0-10 seconds)
  - Off-to-on duration (0-10 seconds)
  - Dimming range minimum (1-99%)
  - Dimming range maximum (2-100%)

- **T1 Strip Length** (T1 Strip only)
  - Configure strip length directly from panel
  - Automatic segment count calculation

- **Smart Device Detection**
  - Config tab only shows settings relevant to selected device type
  - Automatic entity discovery for configuration parameters

#### Version Display

- **Integration Version Info**
  - Backend version displayed in panel footer
  - Frontend version tracking
  - New API endpoint: `/api/aqara_advanced_lighting/version`
  - Helps with troubleshooting and support

#### Localization System

- **Comprehensive Translation Support**
  - Full localization framework for panel UI
  - Translation keys for all user-facing text
  - Placeholder support for dynamic values
  - Foundation for future multi-language support

### Improvements

- **Color Accuracy**: Improved XY to RGB conversion algorithm
  - Better color rendering matching frontend display
  - Normalized color space transformation
  - Vivid colors without washout
  - Proper gamma correction for sRGB

- **Device Compatibility Checks**: Enhanced validation for features
  - Effects tab shows compatibility warnings
  - Patterns tab shows compatibility warnings
  - Only compatible devices receive commands
  - Clear user feedback for device limitations

### Technical Changes

- **New Frontend Components**
  - transition-curve-editor.ts - Visual curve editor for T2 transition settings
  - panel-translations.ts - Centralized translation strings

- **New API Endpoints**
  - GET /api/aqara_advanced_lighting/version - Get integration version

- **Model Updates**
  - Enhanced XYColor.to_rgb() method with improved color conversion
  - Better color space transformation algorithm

### Compatibility

- No breaking changes - fully backward compatible with v0.5.1
- All features and APIs remain unchanged
- No configuration changes required

### Requirements

- Home Assistant 2025.12.0 or newer
- MQTT integration configured
- Zigbee2MQTT 2.7.2 or newer
- Supported Aqara devices (see README for full list)

### Upgrade from v0.5.1

1. Update the integration through HACS
2. Reload the integration or restart Home Assistant to see the new Config tab
3. All existing presets and configurations are preserved

## [0.5.1] - 2026-01-10

### Bug Fixes

- **Panel UI**: Fixed active tab text color contrast issue in light mode - active tabs now use primary text color for better readability
- **Segment Sequences**: Fixed Loop Count field not appearing when "Loop N Times" mode is selected
- **Sequence Editors**: Fixed default time values for initial step (Step 1) to match steps 2-20
  - CCT sequences: Transition 15 seconds, Hold 60 seconds
  - Segment sequences: Duration 15 seconds, Hold 60 seconds
- **Manifest**: Added `http` component to dependencies (required for panel API endpoints)

### Improvements

- **Panel UI**: Desktop layout in Activate tab
- **Segment Sequences**: Moved Loop Count field to appear above toggle switches for better UI flow
- **Effect Editor**: Segment selector help text with additional example ("1,2,3") for individual segment selection

### Documentation

- **CONTRIBUTING.md**: Added comprehensive contributor guidelines
  - Development setup instructions for Python backend and Lit frontend
  - Code standards and best practices aligned with Home Assistant guidelines
  - Pull request process and testing requirements
- **Preset Submissions**: Created preset submission framework
  - Template files for all preset types (effects, patterns, CCT sequences, segment sequences)
  - Quality guidelines and examples
  - Review process documentation
- **README.md**: Added Contributing section with links to guidelines and preset submissions

### Technical Changes

- **Translations**: Migrated from `strings.json` to `translations/en.json` following Home Assistant's translation structure
- **Compatibility**: No breaking changes - fully backward compatible with v0.5.0

## [0.5.0] - 2026-01-09

## What's New

Version 0.5.0 is a major feature release that transforms the Aqara Advanced Lighting integration with powerful visual editors, and a comprehensive preset management system. This release focuses on enhancing the user experience with intuitive creation tools while maintaining full backward compatibility.

### User Preset System

Create, save, and manage your own custom presets for all feature types:

- **Preset Management** - Full CRUD operations for user-created presets
  - Create unlimited custom presets
  - Edit existing presets with full customization
  - Duplicate presets to create variations
  - Delete unwanted presets
  - Search and filter presets by type
- **Supported Preset Types** - Save presets for all features
  - Effect presets (dynamic RGB effects with colors and settings)
  - Segment pattern presets (custom segment color arrangements)
  - CCT sequence presets (multi-step color temperature sequences)
  - RGB segment sequence presets (animated segment patterns)
- **Persistent Storage** - Presets stored across Home Assistant restarts
  - Automatic save on creation/update/delete
  - UUID-based preset IDs for reliable tracking
  - Timestamps for created and modified dates

### Enhanced Panel UI with Visual Editors

The sidebar panel now includes interactive visual editors for creating custom effects, patterns, and sequences:

- **Effect Editor** - Create custom dynamic RGB effects
  - Effect type selector
  - Up to 8 color pickers for effect colors
  - Speed and brightness sliders
  - Segment selector for T1 Strip effects
  - Live preview of effect settings
  - Save as custom preset
- **Segment Pattern Editor** - Design custom segment color patterns
  - Visual segment selector showing all available segments
  - Color picker for each segment or range
  - Gradient and block pattern generators
  - Turn off unspecified segments option
  - Save as custom preset
- **CCT Sequence Editor** - Build multi-step CCT sequences
  - Up to 20 steps with visual timeline
  - Color temperature and brightness sliders for each step
  - Transition and hold duration controls
  - Loop mode and end behavior settings
  - Live step preview
  - Save as custom preset
- **RGB Segment Sequence Editor** - Create animated segment sequences
  - Up to 20 steps with animation patterns
  - Multiple color modes (gradient, blocks, individual)
  - Activation pattern selector with 8 options (all at once, sequential forward/reverse, random, ping pong, centre out, edges in, paired)
  - Duration and hold controls
  - Loop settings with skip first step option
  - Clear segments before starting option
  - Save as custom preset

### API Enhancements

Backend improvements to support new frontend features:

- **Panel API Endpoints** - RESTful API for preset management
  - GET /api/aqara_advanced_lighting/presets - List all presets
  - GET /api/aqara_advanced_lighting/presets/{type}/{id} - Get single preset
  - POST /api/aqara_advanced_lighting/presets/{type} - Create preset
  - PUT /api/aqara_advanced_lighting/presets/{type}/{id} - Update preset
  - DELETE /api/aqara_advanced_lighting/presets/{type}/{id} - Delete preset
  - POST /api/aqara_advanced_lighting/presets/{type}/{id}/duplicate - Duplicate preset
- **Color Format Support** - Services accept both RGB and XY formats
  - Automatic conversion between formats
  - XY format preferred for new presets
  - RGB format maintained for backward compatibility
- **Color Gamut Validation** - Server-side validation of color values
  - Ensures colors are within device gamut
  - Automatic clamping to valid range
- **Z2M Topic Access** - Frontend can read Z2M base topic for light discovery

## Technical Changes

### New Files

- **preset_store.py** - User preset storage and management
  - PresetStore class for CRUD operations
  - Automatic RGB to XY migration
  - Persistent JSON storage
- **Frontend Components** (TypeScript)
  - effect-editor.ts - Effect creation interface
  - pattern-editor.ts - Segment pattern builder
  - cct-sequence-editor.ts - CCT sequence timeline
  - segment-sequence-editor.ts - Segment sequence animator
  - hs-color-picker.ts - Custom HS color picker component
  - color-utils.ts - Color conversion utilities
- **Effect Icons** (SVG) - 13 custom effect icons in frontend/icons/

### Updated Files

- **models.py** - Added XYColor class with RGB↔XY conversion methods
- **const.py** - Added color gamut definitions and preset type constants
- **services.py** - Enhanced color handling to support both RGB and XY formats
- **panel.py** - Added API endpoints for preset management
- **mqtt_client.py** - Color conversion for MQTT payloads
- **__init__.py** - Initialize preset store on integration setup
- **aqara-panel.ts** - Major UI overhaul with editors and preset management
- **styles.ts** - Extensive style updates for new components
- **types.ts** - Added XY color and gamut type definitions

### Code Structure

- Added DATA_PRESET_STORE constant in const.py
- Added PRESET_TYPE_* constants for preset categorization
- Added AQARA_COLOR_GAMUTS mapping models to color gamuts
- Added ATTR_CLEAR_SEGMENTS and ATTR_SKIP_FIRST_IN_LOOP service attributes in const.py
- PresetStore initialized in async_setup() in __init__.py
- Presets stored in .storage/aqara_advanced_lighting.presets
- Panel API uses HomeAssistant's web framework

### RGB Segment Sequence Enhancements

- **Clear Segments Toggle** - Option to clear existing segment patterns before starting sequence
  - Ensures clean slate for new sequences
  - Prevents interference from previous patterns
  - Configurable per sequence via `clear_segments` parameter
- **Skip First in Loop** - Option to skip first step when looping sequences
  - Useful for initialization steps that should only run once
  - First step runs on initial execution, then skipped in subsequent loops
  - Configurable per sequence via `skip_first_in_loop` parameter

## Breaking Changes

None - This release is fully backward compatible with v0.4.1.

- Existing RGB service calls continue to work (automatically converted to XY internally)
- Old RGB presets automatically migrate to XY on first load
- All existing automations and scripts remain compatible
- Panel favorites from v0.4.1 are preserved

## Requirements

- Home Assistant 2025.12.0 or newer
- MQTT integration configured
- Zigbee2MQTT 2.7.2 or newer
- Supported Aqara devices (see README for full list)

## Upgrade from v0.4.1

1. Update the integration through HACS
2. Reload the integration (Settings > Devices & Services > Aqara Advanced Lighting > Three dots > Reload)
3. RGB presets will automatically migrate to XY format
4. No configuration changes required

## [0.4.1] - 2026-01-05

## New Features

### Panel Enhancements
- **Favorite Light Targets** - Save favorite lights for quick access in the panel
  - Favorites are stored per-user in Home Assistant storage
  - Add/remove favorites
  - Favorites persist across browser sessions and restarts
  - Accessible through the favorites store (FavoritesStore class)
- **Light Control Tiles** - Direct light control from the panel
  - Turn lights on/off
  - Brightness slider for quick brightness adjustments
  - Real-time status indicators showing current light state
  - Works with individual lights and light groups

## Technical Changes

### Code Structure
- Added FavoritesStore class in favorites_store.py for persistent favorites storage
- Added DATA_FAVORITES_STORE constant in const.py
- FavoritesStore initialized in async_setup() in __init__.py
- Favorites stored in .storage/aqara_advanced_lighting.favorites_store
- Panel UI updated with favorites and light control components

## Breaking Changes

None - This release is fully backward compatible with v0.4.0.

## [0.4.0] - 2026-01-04

## What's New

Version 0.4.0 introduces frontend enhancement and new RGB segment sequence capabilities.

### Frontend Panel

A new UI panel has been added to the Home Assistant sidebar for easy access to presets:

- **Sidebar Integration** - Access the "Aqara Lighting" panel directly from the Home Assistant sidebar
- **UI Buttons** - Interface for managing lights, effects, and sequences
- **Preset Buttons** - Access to all effect and sequence presets
- **Built with Lit** - Modern, lightweight web component framework for optimal performance
- More features to be added soon

The panel provides a centralized location for controlling Aqara lights without needing to use the Developer Tools or create automations.

### RGB Segment Sequences

Create animated segment patterns with the segment sequence feature:

**Key Features:**
- **Up to 20 Customizable Steps** - Build multi-step sequences
- **Multiple Activation Patterns:**
  - Sequential forward/reverse - Segments activate one by one
  - Random - Segments activate in random order
  - Simultaneous - All segments activate at once
- **Pattern Modes:**
  - Gradient - Smooth color transitions across segments
  - Blocks (repeat/expand) - Evenly spaced color blocks
  - Individual - Custom color per segment
- **Timing Control:**
  - Duration - Time to complete the activation pattern
  - Hold - Time to hold after activation completes
- **Loop Options:**
  - Run once, loop X times, or continuous loop
  - Choose to maintain state or turn off when complete
- **Pause and Resume** - Control sequence playback mid-execution

**Built-in Presets:**
- **Loading bar** - Sequential segment activation creating a loading bar effect
- **Wave** - Smooth color gradient wave flowing back and forth
- **Sparkle** - Random twinkling segments creating a sparkle effect
- and more

**New Services:**
- start_segment_sequence - Start an RGB segment sequence
- stop_segment_sequence - Stop a running sequence
- pause_segment_sequence - Pause a running sequence
- resume_segment_sequence - Resume a paused sequence

### CCT Sequence Enhancements

The existing CCT sequence feature has been enhanced with pause and resume functionality:

**New Services:**
- pause_cct_sequence - Pause a running CCT sequence while maintaining current state
- resume_cct_sequence - Resume a paused CCT sequence from where it was paused

This gives you better control over long-running sequences, allowing you to temporarily pause them without losing progress.

## Breaking Changes

None. This release is fully backward compatible with v0.3.0.

## New Services

### RGB Segment Sequences
- aqara_advanced_lighting.start_segment_sequence
- aqara_advanced_lighting.stop_segment_sequence
- aqara_advanced_lighting.pause_segment_sequence
- aqara_advanced_lighting.resume_segment_sequence

### CCT Sequence Control
- aqara_advanced_lighting.pause_cct_sequence
- aqara_advanced_lighting.resume_cct_sequence

## [0.3.0] - 2026-01-02

## New Features

### CCT Dynamic Sequences
- **Multi-Step CCT Sequences** - Create dynamic color temperature and brightness sequences
  - Up to 20 custom steps per sequence with individual color temperature, brightness, transition time, and hold duration
  - Three loop modes: once, count (repeat X times), continuous
  - Two end behaviors: maintain last state or turn off
  - Service: start_cct_sequence with manual or preset configuration
  - Service: stop_cct_sequence to stop running sequences
  - Service: pause_cct_sequence to pause sequences mid-execution
  - Service: resume_cct_sequence to resume paused sequences
- **CCT Sequence Presets** - Three built-in presets for common scenarios
  - Goodnight: 30-minute gradual dim from 4000K to 2700K, 50% to off
  - Wakeup: 30-minute sunrise simulation from 2700K to 6500K, 0% to 100%
  - Mindful Breathing: Continuous breathing cycle for meditation
- **Interruptible Sequences** - Sequences can be stopped or paused at any point
- **Event System** - Fires Home Assistant events for sequence lifecycle (started, completed, stopped, step changed)

### Effect and Pattern State Restoration
- **Stop Effect Service** - Restore lights to their pre-effect state
  - Service: stop_effect with optional state restoration
  - Automatically captures light state before applying effects or patterns
  - Restores brightness, color (RGB), and color temperature
  - Falls back to warm white if no previous state is saved
  - Works with all dynamic effects and segment patterns
- **Persistent State Storage** - Light states are saved across Home Assistant restarts
  - States stored in .storage/aqara_advanced_lighting.state_manager
  - Automatic expiry of entries older than 24 hours
  - Loaded automatically on integration setup

### Performance Optimization
- **Batch MQTT Publishing** - Synchronized group effects now publish to all devices in parallel
  - Uses asyncio.gather for efficient parallel operations
  - Applies when sync parameter is true and multiple lights are targeted
  - Significantly reduces latency when controlling multiple lights simultaneously
- **LRU Caching** - Device capability lookups are now cached
  - Reduces overhead for repeated device validation
  - Improves service call performance
  - Cache size of 32 devices
- **Parallel Brightness Changes** - Brightness adjustments across multiple entities execute in parallel
  - Uses asyncio.gather for concurrent Home Assistant service calls
  - Faster execution when setting brightness for multiple lights

### Group Synchronization
- **Light Group Support** - All services now support Home Assistant light groups
  - Automatic group detection and entity resolution
  - Groups are expanded to individual light entities
  - Duplicate entities are automatically removed
  - Synchronized effects across all group members
  - Works with all 9 services: set_dynamic_effect, stop_effect, set_segment_pattern, create_gradient, create_blocks, start_cct_sequence, stop_cct_sequence, pause_cct_sequence, resume_cct_sequence

## Technical Changes

### Code Structure
- Added _resolve_entity_ids() helper function in services.py for group entity resolution
- Added async_publish_batch_effects() method in mqtt_client.py for parallel effect publishing
- Added async_publish_batch_segments() method in mqtt_client.py for parallel segment publishing
- Added @lru_cache decorator to get_device_capabilities() in light_capabilities.py
- Added @lru_cache decorator to is_supported_model() in light_capabilities.py
- Added @lru_cache decorator to supports_segment_addressing() in light_capabilities.py
- Added @lru_cache decorator to supports_effect_segments() in light_capabilities.py

### Service Handler Updates
- All 9 service handlers now use _resolve_entity_ids() for group support
- handle_set_dynamic_effect: Uses batch publishing when sync=true and multiple devices
- handle_set_dynamic_effect: Parallel brightness changes using asyncio.gather
- All segment services: Use batch publishing for synchronized group operations

## Breaking Changes

None - This release is fully backward compatible with v0.2.0.

Note: Segment pattern preset values have changed from "t1m_segment_X" to "segment_X". If you have automations or scripts using the old format, update them to the new format.

## Requirements

- Home Assistant 2025.12.0 or newer
- MQTT integration configured
- Zigbee2MQTT 2.7.2 or newer
- Supported Aqara devices:
  - T1 Ceiling Light (ACN031) - 20 segments
  - T1M Ceiling Light (ACN032) - 26 segments
  - T1 LED Strip (ACN132) - Variable (5 segments/meter, 1-10m)
  - T2 RGB Bulb (AGL001/AGL003/AGL005/AGL007)

### Upgrade from v0.2.0

1. Update the integration through HACS
2. Reload the integration (Settings > Devices & Services > Aqara Advanced Lighting > Three dots > Reload)
3. Update any automations/scripts using old segment preset format ("t1m_segment_1" to "segment_1")

## [0.2.0] - 2025-12-31

## New Features

### Aqara App Presets
- **24 Dynamic Effect Presets** - Quick access to Aqara mobile app's preset effects
  - 4 T2 Bulb presets: Candlelight, Breath, Colorful, Security
  - 9 T1M presets: Dinner, Sunset, Autumn, Galaxy, Daydream, Holiday, Party, Meteor, Alert
  - 7 T1 Strip presets: Rainbow, Heartbeat, Gala, Sea of Flowers, Rhythmic, Exciting, Colorful
  - All accessible via dropdown selector in `set_dynamic_effect` service

### Segment Pattern Presets
- **12 T1M/T1 Strip Segment Presets** - Beautiful segment color patterns from the Aqara app
  - Accessible via dropdown selector in `set_segment_pattern` service
  - Compatible with T1M (20 & 26 segment) and T1 Strip devices
  - Automatically scales to device segment count

### T1 Strip Variable Length Support
- **Automatic Length Detection** - Integration now reads T1 Strip's actual length from Z2M
  - Calculates correct segment count (5 segments per meter)
  - Supports strips from 1-10 meters (5-50 segments)
  - Falls back to 10 segments (2 meters) with warning if length unavailable
  - Affects all segment services: `set_segment_pattern`, `create_gradient`, `create_blocks`

### Brightness Control
- **Brightness Parameter** - Added to effect and all segment services (1-255 range)

## Bug Fixes

### T1 Strip Segment Calculations
- Fixed incorrect hardcoded segment count defaults (was 20/100, now reads actual length)
- Fixed brightness not being applied to T1 Strip segment patterns
- Added `_get_actual_segment_count()` helper function for accurate segment count

### Segment Service Improvements
- Made `segment_colors` parameter optional when using presets
- Made `effect` parameter optional when using presets
- Improved validation and error messages for preset compatibility

## Documentation Updates

### README.md
- Added HACS one-click install button
- Added preset documentation
- Updated all service examples with preset usage
- Added T1 Strip variable length documentation
- Updated troubleshooting guide

### Service Definitions
- Updated `services.yaml` with preset selectors
- Improved parameter descriptions
- Added brightness parameter documentation

## Technical Changes

### Code Structure
- Added `EFFECT_PRESETS` dictionary with 24 preset definitions in `const.py`
- Added `SEGMENT_PATTERN_PRESETS` dictionary with 12 preset definitions in `const.py`
- Added preset constants for all 36 presets
- Added `_get_actual_segment_count()` helper function in `services.py`
- Updated all segment services to use helper function for segment count
- Removed unused brightness field from SegmentColor objects (Z2M doesn't use it)
- Added brightness pre-setting for T1 Strip before segment pattern commands

### Service Handler Updates
- `handle_set_dynamic_effect`: Added preset support with device type validation
- `handle_set_segment_pattern`: Added preset support with automatic color generation
- `handle_create_gradient`: Added proper T1 Strip length detection
- `handle_create_blocks`: Added proper T1 Strip length detection
- All segment services: Set T1 Strip brightness before segment commands with 0.1s delay

## Breaking Changes

None - This release is fully backward compatible with v0.1.0.

## Requirements

- Home Assistant 2025.12.0 or newer
- MQTT integration configured
- Zigbee2MQTT 2.7.2 or newer
- Supported Aqara devices:
  - T1 Ceiling Light (ACN031) - 20 segments
  - T1M Ceiling Light (ACN032) - 26 segments
  - T1 LED Strip (ACN132) - Variable (5 segments/meter, 1-10m)
  - T2 RGB Bulb (AGL001/AGL003/AGL005/AGL007)

### New Installation

One click HACS cutton

### Upgrade from v0.1.0

1. Update the integration through HACS
2. Restart Home Assistant
3. No configuration changes required


## [0.1.0] - 2025-12-29

### Added
- Initial release of Aqara Advanced Lighting integration
- Support for Aqara T1M Ceiling Lights (ACN031 20-segment, ACN032 26-segment)
- Support for Aqara T1 LED Strip (ACN132)
- Support for Aqara T2 RGB Bulbs (AGL001, AGL003, AGL005, AGL007)
- Service: `set_dynamic_effect` - Activate dynamic RGB effects with dropdown selector
  - Up to 8 color pickers for effect colors
  - 13 different effects across all device types
  - Speed control (1-100%)
  - Segment selection support for T1 Strip
- Service: `set_segment_pattern` - Set individual segment colors
  - Segment range support ("1-20", "5-10", "odd", "even")
  - Turn off unspecified segments option
- Service: `create_gradient` - Create smooth color gradients
  - Up to 6 color pickers for gradient colors
  - Segment selection support
  - Turn off unspecified segments option
- Service: `create_blocks` - Create evenly spaced color blocks
  - Expand mode for even distribution vs. alternating pattern
  - Segment selection support
  - Turn off unspecified segments option
- Automatic device discovery through Zigbee2MQTT
- Device registration in Home Assistant device registry
- Configuration flow with Z2M base topic configuration
- Reconfiguration flow for updating Z2M base topic
- RGB color picker UI for all color inputs
- Effect dropdown selector showing all available effects
- Turn on option for all services (automatically turn light on before applying effects)
- Flexible segment selection supporting ranges, individual segments, and special selectors

### Features
- Works seamlessly with existing Zigbee2MQTT setup
- No YAML configuration required - fully UI-based setup
- Backend validation ensures only compatible effects are used for each device type
- Supports both individual light entities and light groups
- Filters and only registers supported Aqara light models

### Technical
- Home Assistant 2025.12.0+ compatibility
- MQTT integration dependency
- Zigbee2MQTT 2.7.2+ required
- Quality scale: custom
- Integration type: service
- IoT class: local_push

[0.1.0]: https://github.com/absent42/Aqara-Advanced-Lighting/releases/tag/v0.1.0
[0.2.0]: https://github.com/absent42/Aqara-Advanced-Lighting/releases/tag/v0.2.0
[0.3.0]: https://github.com/absent42/Aqara-Advanced-Lighting/releases/tag/v0.3.0
[0.4.0]: https://github.com/absent42/Aqara-Advanced-Lighting/releases/tag/v0.4.0
[0.4.1]: https://github.com/absent42/Aqara-Advanced-Lighting/releases/tag/v0.4.1
[0.5.0]: https://github.com/absent42/Aqara-Advanced-Lighting/releases/tag/v0.5.0
[0.5.1]: https://github.com/absent42/Aqara-Advanced-Lighting/releases/tag/v0.5.1
[0.6.0]: https://github.com/absent42/Aqara-Advanced-Lighting/releases/tag/v0.6.0
[0.6.1]: https://github.com/absent42/Aqara-Advanced-Lighting/releases/tag/v0.6.1
[0.6.2]: https://github.com/absent42/Aqara-Advanced-Lighting/releases/tag/v0.6.2
[0.7.0]: https://github.com/absent42/Aqara-Advanced-Lighting/releases/tag/v0.7.0
[0.8.1]: https://github.com/absent42/Aqara-Advanced-Lighting/releases/tag/v0.8.1
[0.9.0]: https://github.com/absent42/Aqara-Advanced-Lighting/releases/tag/v0.9.0
[0.10.0]: https://github.com/absent42/Aqara-Advanced-Lighting/releases/tag/v0.10.0
[0.11.0]: https://github.com/absent42/Aqara-Advanced-Lighting/releases/tag/v0.11.0
[0.12.0]: https://github.com/absent42/Aqara-Advanced-Lighting/releases/tag/v0.12.0
[0.13.0]: https://github.com/absent42/Aqara-Advanced-Lighting/releases/tag/v0.13.0
[0.13.1]: https://github.com/absent42/Aqara-Advanced-Lighting/releases/tag/v0.13.1
[1.0.0]: https://github.com/absent42/Aqara-Advanced-Lighting/releases/tag/v1.0.0
[1.1.0]: https://github.com/absent42/Aqara-Advanced-Lighting/releases/tag/v1.1.0
[1.2.0]: https://github.com/absent42/Aqara-Advanced-Lighting/releases/tag/v1.2.0
[1.3.0]: https://github.com/absent42/Aqara-Advanced-Lighting/releases/tag/v1.3.0