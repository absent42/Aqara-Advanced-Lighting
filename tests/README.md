# Aqara Advanced Lighting tests

## Test structure

```
tests/
├── __init__.py                            # Test package initialization
├── conftest.py                            # Shared fixtures and configuration
├── test_audio_activation_patterns.py      # Engine activation lifecycle and orphan prevention
├── test_audio_curves.py                   # Response curve functions and EMA filter
├── test_audio_discovery.py                # Audio tier detection and companion sensor discovery
├── test_audio_effect_builtin_presets.py   # Built-in audio-reactive effect preset definitions and entity resolution
├── test_audio_effect_config.py            # AudioEffectConfig dataclass validation and serialization
├── test_audio_effect_constants.py         # Audio effect constant values and defaults
├── test_audio_effect_modulator.py         # ModulationChannel per-mode processing and silence behavior
├── test_audio_effect_presets.py           # Audio config storage in effect presets
├── test_audio_effect_service.py           # Audio parameter wiring in set_dynamic_effect service
├── test_audio_engine.py                   # Shared AudioEngine class (config, claims, warnings)
├── test_audio_engine_registry.py          # AudioEngineRegistry lifecycle and conflict resolution
├── test_audio_mode_handlers.py            # Audio-reactive v2 model fields and mode handlers
├── test_audio_mode_registry_api.py        # serialise_mode_registry and audio_mode_registry REST endpoint
├── test_audio_on_device.py                # Generic on-device audio opt-in
├── test_audio_preset_fallback.py          # Default audio entity fallback for audio-reactive presets
├── test_audio_reactive_presets.py         # Audio-reactive preset definitions validation
├── test_audio_rich_tier.py                # Rich (pro) tier audio-reactive scenes end-to-end
├── test_audio_scene.py                    # Audio-reactive dynamic scene model validation
├── test_audio_scene_consumer.py           # DynamicSceneAudioConsumer and engine config mapping
├── test_backend_speed_write.py            # Backend speed-only write without effect restart
├── test_capability_adaptation.py          # Dynamic scene capability adaptation
├── test_capability_profile.py             # Light capability detection and color temp conversion
├── test_circadian_manager.py              # Circadian overlay manager
├── test_config_flow.py                    # Config flow setup and reconfiguration
├── test_device_merging.py                 # Our device beside the Z2M device in the registry
├── test_device_trigger.py                 # Device automation triggers
├── test_entity_controller.py              # Entity override detection, drift, pause/resume
├── test_init.py                           # Integration setup, unload, device migration, and ZHA repair issues
├── test_mqtt_backend.py                   # MQTTBackend stale device removal and Z2M repair timer
├── test_quirks.py                         # ZHA quirk precedence over the zha-quirks built-ins
├── test_schedule_cct.py                   # Schedule mode CCT sequences (clock/sunrise/sunset)
├── test_segment_sequence_brightness.py    # Brightness override for start_segment_sequence (T1M and T1 Strip)
├── test_segment_utils.py                  # Segment parsing and color generation
├── test_service_schemas.py                # Step field validation for start_segment_sequence and start_cct_sequence
├── test_solar_cct.py                      # Solar mode CCT sequences (elevation-based)
├── test_sun_utils.py                      # Solar elevation interpolation
├── test_zha_backend.py                    # ZHABackend stale device removal
├── test_zha_quirk_check.py                # ZHA devices resolved without the integration's quirk
└── README.md                              # This file
```

The Python suite contains roughly 768 tests across 40 files. The frontend has its own Vitest suite (121 tests) under `custom_components/aqara_advanced_lighting/frontend_src/`; see [the frontend README](../custom_components/aqara_advanced_lighting/frontend_src/README.md#testing) for details.

## Running tests

The `pytest-homeassistant-custom-component` plugin auto-loads via entrypoints and imports Unix-only modules (`fcntl`, `resource`), so it fails on Windows. Use this command to bypass it:

```bash
PYTEST_DISABLE_PLUGIN_AUTOLOAD=1 python -m pytest -p asyncio --override-ini="asyncio_mode=auto" --noconftest tests/ -v
```

- **Single file**: append the file path, e.g. `... tests/test_entity_controller.py -v`
- **Filter by name**: add `-k "test_name_pattern"`
- **Stop on first failure**: add `-x`

### Install test dependencies

```bash
pip install -r requirements_test.txt
```

### Run with coverage report

```bash
pytest --cov=custom_components.aqara_advanced_lighting --cov-report=term-missing
```

## Shared fixtures (conftest.py)

| Fixture | Purpose |
|---------|---------|
| `auto_enable_custom_integrations` | Automatically enables custom integrations for all tests |
| `mock_mqtt_client` | Mocks `homeassistant.components.mqtt.async_subscribe` |
| `mock_setup_entry` | Mocks `async_setup_entry` to return True |
| `mock_z2m_validation` | Mocks Z2M base topic validation to always succeed |

## Test coverage by file

### test_audio_activation_patterns.py (11 tests)

Audio engine activation lifecycle and orphan prevention via `AudioEngineRegistry`.

- **Effect activation** (6): same entity/same sensor replaces running engine; different entity on same sensor stops first engine; different sensors coexist; effect and scene on same sensor coexist (cross-type); stop removes engine from registry; rapid start/stop leaves registry empty
- **Scene activation** (2): second scene on same sensor stops first; scenes on different sensors coexist
- **Edge cases** (3): graceful handling of `engine.stop()` exceptions; `stop_all()` cleans up on integration unload; double-registering the same engine does not duplicate it

### test_audio_curves.py (17 tests)

Response curve functions and EMA filter used by the audio-reactive subsystem.

- **`apply_response_curve`** (9): linear passthrough; logarithmic and exponential boundary values; mid-point compression/suppression; formula correctness; input clamping; unknown curve falls back to linear
- **`map_to_range`** (4): full and partial range scaling; int rounding; output clamping
- **`EMAFilter`** (4): initial value; convergence on constant input; smoothing factor; reset

### test_audio_effect_builtin_presets.py (144 tests)

Built-in audio-reactive effect preset definitions and entity resolution for T1M and T1 Strip lights.

- **Preset constants** (1): 8 preset ID constants follow the `<device>_<name>` naming pattern with correct string values
- **Structural validation** (42): all 8 presets registered in `EFFECT_PRESETS`; required base fields present (parametrized × 8); valid effect type per device family (× 4 T1M, × 4 T1 Strip); correct `device_types` lists (× 8); colors 1–8 per preset with valid 0–255 RGB range (× 8); speed in 1–100 range (× 8); distinct effect type within each device group
- **Audio config validation** (96): required audio fields present (× 8); valid `audio_detection_mode` and `audio_silence_behavior` constants (× 8 each); sensitivity in 1–100 (× 8); at least one of `speed_mode`/`brightness_mode` non-None (× 8); valid mode constant if set (× 8 each); valid min–max range when mode set (× 8 each); valid response curve if set (× 8 each); no hardcoded `audio_entity` (× 8)
- **`_resolve_preset_audio_entity`** (5): non-audio preset returns `None`; user pref entity used when no call entity; call entity overrides user pref; no entity when no prefs store; empty string in prefs treated as not configured

### test_audio_effect_config.py (22 tests)

`AudioEffectConfig` dataclass validation, defaults, and dict serialization.

- **Defaults** (3): minimal creation; speed defaults; brightness defaults
- **Validation** (9): invalid speed/brightness mode rejected; invalid response curve rejected; invalid silence behavior rejected; sensitivity clamped high and low; speed/brightness min/max clamped; min > max raises; at-least-one-mode required when `audio_entity` set
- **Immutability** (1): frozen dataclass raises on mutation
- **Serialization** (3): `to_dict` round-trip; `from_dict` round-trip; `from_dict` with defaults
- **`DynamicEffect` integration** (5): no audio config by default; with audio config; backwards compatible creation; `to_mqtt_payload` unaffected

### test_audio_effect_constants.py (7 tests)

Validates audio-reactive effect constant definitions in `const.py`.

- Audio effect mode values (`on_onset`, `continuous`, `intensity_breathing`, `onset_flash`)
- Response curve values (`linear`, `logarithmic`, `exponential`)
- Silence behavior values (`hold`, `slow_cycle`, `decay_min`, `decay_mid`)
- Rate limits, deadbands, defaults, and silence decay duration

### test_audio_effect_modulator.py (14 tests)

`ModulationChannel` per-mode processing, deadband filtering, curves, and silence decay.

- **Mode behavior** (6): continuous energy mapping; deadband filters continuous; on-onset spike; on-onset bypasses deadband; intensity-breathing smoothing; onset-flash combines envelope and spike
- **Response curves** (2): logarithmic and exponential curve application
- **Disabled channel** (1): returns `None` when mode is `None`
- **Onset decay** (2): decay tick reduces on-onset value; decay only applies to `on_onset` mode
- **Silence decay** (3): `hold` returns last value; `decay_min` returns range min; `decay_mid` returns midpoint

### test_audio_effect_presets.py (4 tests)

Audio config storage and backwards compatibility in effect preset serialization.

- `audio_config` present in allowed preset fields
- `audio_config` serializes to dict in preset store
- `audio_config` round-trips through preset store
- Preset dict without `audio_config` produces `None` (backwards compatible)

### test_audio_effect_service.py (3 tests)

Audio parameter wiring in the `set_dynamic_effect` service.

- T2 model is in the exclusion set (rejected for audio-reactive effects)
- `AudioEffectConfig` correctly constructed from service data
- Preset `audio_config` can be overridden at activation time

### test_audio_engine.py (8 tests)

Shared `AudioEngine` class: configuration, claim logic, and missing-sensor warnings.

- **Config** (2): requires `audio_entity`; subscription flags passed through
- **Claim logic** (3): claim key includes consumer type; same-type engines conflict (two scenes, same sensor); cross-type coexists (scene + effect, same sensor)
- **Warnings** (3): warns on missing spectral sensors; warns on missing beat-tracking sensors; no warning when requested sensors are present

### test_audio_engine_registry.py (12 tests)

`AudioEngineRegistry` central tracking, conflict resolution, and cleanup.

- Register and lookup by engine id
- Unregister removes engine
- Multiple engines on same sensor tracked separately
- Different sensors and cross-types isolated from each other
- `stop_engines_for_sensor`: stops conflicting engines before new one starts; excludes the new engine itself
- Unregister is idempotent
- `all_active_engines` listing
- `stop_all` cleans up on shutdown
- Double-register does not duplicate; exception during `stop()` handled gracefully

### test_audio_discovery.py (12 tests)

Audio tier detection and device-registry sibling discovery.

- **T1 strip parameter mapping** (6): on_onset/continuous/beat_predictive/intensity_breathing/onset_flash mode mapping to blink/wave hardware effects; sensitivity cutoff at 50 → low/high
- **Companion sensor discovery** (6): discovers all sibling sensors by unique_id suffix (bass_energy, amplitude, bpm, onset_detected, silence, sensitivity, squelch, detection_mode); graceful handling of missing optional entities, no device, no siblings; binary_sensor and select type discovery

### test_audio_mode_handlers.py

Audio-reactive v2 model fields and mode handler behavior, including the pro-tier `bass_kick` and `freq_to_hue` color-advance modes added in v1.3.0.

- **DynamicScene audio fields**: defaults for detection_mode, frequency_zone, silence_degradation, prediction_aggressiveness; on_onset and beat_predictive color advance modes; bass_energy detection mode; invalid detection mode clamped to default; prediction_aggressiveness clamped 1–100; latency_compensation_ms clamped 0–500
- **OnsetHandler**: onset advances colors; brightness response modulation with floor at 0.3; no-op when brightness response disabled
- **ContinuousHandler**: energy maps palette index; brightness modulation; empty colors safety
- **IntensityBreathingHandler**: envelope tracks energy approaching 1.0; envelope decays during silence
- **OnsetFlashHandler**: onset sets brightness to 1.0; flash decays over energy updates
- **BeatPredictiveHandler**: initial reactive state; lazy `configure` from manager scene state on first event; state transitions reactive → tracking → predictive; tracking drops to reactive on low confidence; reactive mode advances colors; predictive mode does not advance on onset; cleanup cancels pending handles
- **Pro-tier modes** (v1.3.0): `BassKickHandler` cubic-decay envelope on sub_bass spikes with basic-tier fallback to `bass_energy`; `FreqToHueHandler` log-scaled spectral-centroid → hue mapping with EMA smoothing and silence gating
- **Mode dispatcher**: `MODE_REGISTRY` and `create_handler()` factory cover every mode constant; dispatcher-consistency test guards against drift

### test_audio_mode_registry_api.py

`serialise_mode_registry` output and the `/api/aqara_advanced_lighting/audio_mode_registry` REST endpoint (added in v1.3.0).

- One serialised entry per `MODE_REGISTRY` key, with `constant`, `requires_pro`, and `display_label` fields
- `bass_kick` and `freq_to_hue` correctly marked `requires_pro: true`
- `on_onset` and other basic-tier modes marked `requires_pro: false`
- Output ordering matches Python registry insertion order (frontend relies on this for UI ordering)
- Set of serialised constants matches `MODE_REGISTRY.keys()` exactly

### test_audio_on_device.py (5 tests)

Generic on-device audio opt-in for third-party lights.

- On-device audio config constants exist
- Entity audio config round-trips through JSON serialization
- `_get_entity_audio_config` reads from UserPreferencesStore global preferences
- Returns empty dict when no config or no store available

### test_audio_rich_tier.py

End-to-end tests for rich (pro) tier audio-reactive scenes.

- Companion discovery maps all sensor roles (bass / mid / high energy, amplitude, bpm, onset, silence, sensitivity, squelch, detection_mode)
- Pro-tier (ESPHome Audio Reactive v0.4.0) sensors discovered: `sub_bass_energy`, `low_mid_energy`, `upper_mid_energy`, `air_energy`, `beat_event` binary sensor, `calibration_stale` binary sensor
- Rich scene model accepts `binary_sensor` as audio entity
- Continuous mode with rich tier is valid

### test_audio_preset_fallback.py (4 tests)

Default audio entity fallback for audio-reactive presets.

- Non-audio presets do not receive a fallback entity
- Audio presets without audio_entity get the user's default
- Audio presets with explicit audio_entity preserve it
- Audio presets get None when no default is configured

### test_audio_reactive_presets.py (112 tests)

Audio-reactive dynamic scene preset definitions validation.

- All 12 audio-reactive presets exist in DYNAMIC_SCENE_PRESETS
- Required fields present on each preset (parametrized × 12)
- Valid audio_color_advance, audio_detection_mode, distribution_mode constants (parametrized × 12 each)
- Transition time within MIN/MAX constants (parametrized × 12)
- Sensitivity and transition speed within 1–100 range (parametrized × 12 each)
- Colors have valid CIE xy (0.0–1.0) and brightness (1–100), 1–8 per preset (parametrized × 12)
- No hardcoded audio_entity in built-in presets (parametrized × 12)
- Exactly 12 audio-reactive presets total
- Full coverage of all 5 audio modes and all 3 detection modes

### test_audio_scene.py (3 tests)

Audio-reactive dynamic scene model validation.

- DynamicScene accepts and validates audio fields (entity, sensitivity, color_advance, transition_speed, brightness_response)
- DynamicScene without audio fields retains default values
- Invalid audio_color_advance raises ValueError

### test_config_flow.py (10 tests)

Config flow setup and reconfiguration.

- User flow with custom and default Z2M base topics
- MQTT not loaded error handling
- Single and multiple instance enforcement
- Reconfigure flow: update topic, preserve defaults, MQTT validation, empty topic fallback, duplicate topic prevention

### test_init.py (13 tests)

Integration initialization, setup, unload, device migration, and ZHA repair issues.

- Successful setup with MQTT, backend, state manager, and sequence managers
- Setup failure when MQTT unavailable (with retry)
- Config entry unload and reload
- v1.3 device migration: removes sole-config-entry devices, removes partial-merge devices, full clean re-merge
- ZHA repair issue created on `ImportError` (ZHA not installed), cleared on successful setup
- ValueError (ZHA gateway not ready) raises `ConfigEntryNotReady` without creating a repair issue
- ZHA backend: a device ZHA resolved with the built-in quirk triggers one ZHA reload and a retry, and the log names the device
- ZHA backend: a loaded ZHA whose devices already carry our cluster is not reloaded
- ZHA backend: after the one reload, setup proceeds and warns about devices still without the quirk

### test_segment_sequence_brightness.py

Brightness-override behavior added to the `start_segment_sequence` service in v1.3.0.

- **Schema**: brightness in `[1, 100]` accepted; out-of-range values rejected
- **Dispatch**: when brightness is supplied, `light.turn_on` is dispatched once per accepted entity (with the percent → device-converted value) before the segment manager starts the synchronized group
- **No-op path**: when brightness is omitted, no `light.turn_on` brightness write occurs
- **Coverage**: T1M (20-segment and 26-segment) and T1 Strip models honor the override

### test_quirks.py (12 tests)

ZHA quirk precedence. ZHA applies the most recently registered quirk for a model, and zha-quirks ships its own T1M and T1 Strip quirks without the effect and segment attributes. Each check runs the production order (integration quirks registered, then `zhaquirks.setup()`) in a fresh interpreter, because zha-quirks registers its quirks as an import side effect that a process runs once.

- Integration quirk resolves for the T1M, T1 Strip and T2 bulb even when ZHA loads its quirks later (3)
- Every attribute the ZHA backend writes resolves on the applied cluster (3)
- Each backend attribute declares the Aqara manufacturer code (3)
- Looking an attribute up with the Aqara manufacturer code emits no deprecation warning (3)

### test_segment_utils.py (18 tests)

Segment range parsing and color generation for LED strips.

- Single, comma-separated, range, and mixed segment specifications
- Special keywords: `odd`, `even`, `first-half`, `last-half`, `first-third`, `last-third`, `all`
- Invalid range and segment rejection
- Gradient color generation (2 and 3+ colors)
- Block color generation (repeat and expand modes)
- Segment color expansion

### test_capability_profile.py (16 tests)

Light capability detection and color temperature conversion.

- Capability detection: full color (XY, HS, RGB, RGBW, RGBWW), CCT-only, brightness-only, on/off-only
- XY to color temp adaptation (warm and cool)
- Color temp clamping (within range, below min, above max)
- Singularity guard for edge-case XY values
- Clamping applied during CCT step transitions
- Missing color modes default behavior

### test_audio_scene_consumer.py (22 tests)

`DynamicSceneAudioConsumer` event routing and `build_scene_engine_config` subscription flag mapping.

- **`build_scene_engine_config`** (8): onset mode subscribes onset; continuous mode subscribes energy; beat_predictive subscribes BPM; brightness curve subscribes energy; frequency zone subscribes bands; sensitivity and detection_mode passed through; silence always subscribed; centroid and rolloff always subscribed
- **Consumer event routing** (12): onset, energy, centroid, rolloff, and BPM events dispatched to handler; onset triggers `apply`; energy rate-limited; silence enter/exit delegated; unavailability sets stop event; sensor recovery clears waiting flag; frequency zone updates light indices
- **Cross-module consistency** (2): EMA alpha identical between modulator and mode handlers; flash decay identical between modulator and mode handlers

### test_backend_speed_write.py (3 tests)

`async_write_effect_speed` in MQTT and ZHA backends for live speed adjustment without restarting the effect.

- MQTT: payload contains only `effect_speed` (no other effect keys)
- MQTT: speed value clamped to 1–100
- ZHA: correct attribute ID used for speed write

### test_capability_adaptation.py (3 tests)

Dynamic scene capability adaptation per light type.

- CCT-only lights receive `color_temp_kelvin` instead of `xy_color`
- Brightness-only lights skip color in service calls
- Full-color lights receive `xy_color` unchanged

### test_sun_utils.py (6 tests)

Solar elevation-based lighting interpolation.

- Interpolation at exact steps and midpoints (rising phase)
- Setting phase uses separate step definitions
- Below/above elevation boundary hold behavior
- Symmetric "any" phase for both rising and setting

### test_solar_cct.py (5 tests)

Solar mode for CCT sequences (elevation-based color and brightness).

- CCTSequence accepts `mode="solar"` with `solar_steps`
- Default mode is "standard" for backwards compatibility
- Solar mode requires `solar_steps` (ValueError without)
- Solar mode bypasses standard step/loop validation
- Standard mode validation still enforced

### test_schedule_cct.py (23 tests)

Schedule mode for CCT sequences (fixed clock times and sunrise/sunset offsets).

- **ScheduleStep model** (8): fixed time (HH:MM), sunrise/sunset-relative times with zero offset, validation (format, color temp range, brightness range, empty labels)
- **resolve_step_time** (3): fixed times, sunrise-relative, sunset-relative
- **interpolate_schedule_values** (5): midpoint interpolation, step boundaries, midnight wrapping, relative time resolution, minimum step count
- **CCTSequence model** (3): schedule mode acceptance, requires `schedule_steps`, enforces `end_behavior="maintain"`
- **Built-in presets** (4): build_schedule_sequence, Circadian Rhythm, Warm Day, Productive Day all use schedule mode

### test_circadian_manager.py (7 tests)

Circadian overlay manager for continuous solar lighting.

- Start registers state change listener, stop unsubscribes
- Stop nonexistent overlay returns False
- Active entity tracking and stop-all
- Returns interpolated values from current sun state
- Starting on existing entity replaces the overlay

### test_entity_controller.py (49 tests)

Entity override detection, drift tracking, and external change handling.

- **Attribute detection** (8): brightness, color temp, XY color changes; combined changes; no-change; drift tolerance for brightness and color temp
- **Override management** (8): initialization, default/paused states, clearing, pause modes (pause_all vs pause_changed), solar vs standard CCT behavior, attribute merging across pauses
- **Service call detection** (9): brightness keys, step keys, color temp, RGB, combined, effects, bare turn_on, transition-only, flash
- **Dedup and cleanup** (2): service pause times cleared on clear and cleanup
- **Bare turn-on and resume** (8): default behavior, preference reading, solar force-apply on turn-on, skip non-solar, resume solar/scene/partial-override force-apply, non-solar CCT no force-apply
- **Drift detection** (9): no change, within/exceeds brightness threshold, within/exceeds color temp threshold, both exceeding, None value handling for brightness-only and color-temp-only
- **Preference and public API** (4): detect_non_ha_changes default and preference, disabled by ignore_external_changes, public pause_entity delegation
- **Context-based detection** (1): controller initialization

### test_device_merging.py (2 tests)

Since Home Assistant 2026.8 our device sits beside the Zigbee2MQTT device rather than merging into it. These tests pin the registry behaviour the MQTT backend relies on.

- Registering after Z2M creates our own device carrying both identifiers and leaves Z2M's untouched
- Registering before Z2M is not absorbed when Z2M registers later

### test_device_trigger.py (22 tests)

Device automation triggers for sequences and effects.

- **get_entity_ids_for_device** (6): mapped entities, nonexistent device, no domain identifier, unloaded entry, unknown IEEE, multiple entities
- **async_get_triggers** (3): all 22 trigger types returned, nonexistent device, wrong domain device
- **async_attach_trigger** (4): no entities returns no-op, single/multiple entity mapping, effect triggers omit sequence_type filter
- **TRIGGER_SCHEMA** (2): accepts known types, rejects unknown
- **Trigger event map** (5): completeness, CCT/segment sequence type filters, effect no-filter, 22 total trigger types
- **Merged devices** (2): triggers and entity resolution work on merged devices

### test_mqtt_backend.py (8 tests)

`MQTTBackend` stale device removal and Z2M bridge repair timer.

- **Stale device removal** (2): stale device removed from registry and runtime data when missing from bridge/devices message; devices present in both messages are unchanged
- **Repair timer** (4): repair issue created after 120s with no bridge response; no issue created when bridge responds before timer fires; issue clears when bridge finally responds; timer cancelled on integration unload
- **Via link** (2): a stale MQTT config entry (ignored or disabled) listed before the real one does not hide the Zigbee2MQTT device; the "Connected via" link still resolves

### test_zha_backend.py (4 tests)

`ZHABackend` stale device removal at startup.

- Stale device fully removed from registry and runtime data when absent from ZHA scan
- Device present in ZHA scan remains registered and in runtime data
- A stale ZHA config entry (ignored or disabled) listed before the loaded one does not hide the device: the light still maps and the via link resolves (2)

## Test requirements

### test_zha_quirk_check.py (4 tests)

`find_devices_without_aqara_quirk` lists supported ZHA devices whose endpoint 1 lacks the integration's 0xFCC0 cluster; `async_setup_entry` reloads ZHA once per run for them.

- A device carrying zha-quirks' built-in cluster is listed
- A device carrying the integration's cluster is not listed
- A device with no 0xFCC0 cluster on endpoint 1 is listed
- Unsupported models are ignored

### Dependencies

- `pytest` - test framework
- `pytest-homeassistant-custom-component` - Home Assistant test utilities
- `pytest-asyncio` - async test support
- `pytest-cov` - coverage reporting

### Environment

Tests use the `pytest-homeassistant-custom-component` plugin which provides:
- Mock Home Assistant core
- Mock config entries
- MQTT mocking utilities
- Common test fixtures

## Writing new tests

### Test file naming

- Test files must start with `test_`
- Test functions must start with `test_`
- Use descriptive names: `test_user_flow_mqtt_not_loaded`

### Using fixtures

Common fixtures are defined in `conftest.py`:

```python
from pytest_homeassistant_custom_component.common import MockConfigEntry

async def test_my_feature(hass: HomeAssistant, mock_config_entry: MockConfigEntry):
    """Test my feature."""
    mock_config_entry.add_to_hass(hass)
    # Test implementation
```

### Async tests

All tests interacting with Home Assistant must be async:

```python
async def test_async_feature(hass: HomeAssistant):
    """Test async feature."""
    result = await some_async_function()
    assert result is True
```

## Debugging tests

### Run single test

```bash
pytest tests/test_config_flow.py::test_user_flow_success -v
```

### Show print statements

```bash
pytest -s
```

### Traceback options

```bash
pytest --tb=short  # Short traceback
pytest --tb=long   # Long traceback
pytest --tb=line   # One line per failure
```
