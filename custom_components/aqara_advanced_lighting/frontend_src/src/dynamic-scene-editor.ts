/**
 * Dynamic Scene Editor Component
 * Creates and edits dynamic scene presets with slow color transitions across lights.
 */

import { LitElement, html, css, PropertyValues, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { HomeAssistant, XYColor, UserDynamicScenePreset, DynamicSceneEditorDraft, DynamicSceneColor, Translations } from './types';
import { xyToHex, getAnalogousColor } from './color-utils';
import { colorPickerStyles } from './styles/color-picker';
import { addColorToHistory } from './color-history';
import { ReorderableStepsMixin, reorderableStepStyles, ReorderableStepItem } from './reorderable-steps-mixin';
import { editorFormStyles, localize, loopModeOptions, endBehaviorOptions, dialogActions } from './editor-constants';
import './xy-color-picker';
import './color-history-swatches';
import './image-color-extractor';
import type { ColorsExtractedDetail } from './image-color-extractor';
import { adoptThumbnail, discardUnsaved } from './thumbnail-lifecycle';
import {
  AudioModeEntry,
  audioDeviceTier,
  buildAudioModeOptions,
  fetchAudioModeRegistry,
  isAudioModeHidden,
} from './audio-mode-registry';

// Editable color slot with unique ID for drag/drop
interface EditableColor extends DynamicSceneColor, ReorderableStepItem {}

@customElement('dynamic-scene-editor')
export class DynamicSceneEditor extends ReorderableStepsMixin(LitElement) {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property({ type: Object }) public preset?: UserDynamicScenePreset;
  @property({ type: Object }) public translations: Translations = {};
  @property({ type: Boolean }) public editMode = false;
  @property({ type: Boolean }) public hasSelectedEntities = false;
  @property({ type: Boolean }) public isCompatible = true;
  @property({ type: Array }) public selectedEntities: string[] = [];
  @property({ type: Boolean }) public previewActive = false;
  @property({ type: Array }) public colorHistory: XYColor[] = [];
  @property({ type: String }) public defaultAudioEntity = '';
  @property({ type: Object }) public draft?: DynamicSceneEditorDraft;

  @state() private _name = '';
  @state() private _icon = '';
  // Note: _steps is used by ReorderableStepsMixin, but we also expose as _colors for clarity
  @state() protected _steps: EditableColor[] = [];
  @state() private _transitionTime = 600;  // seconds (default 10 minutes)
  @state() private _holdTime = 0;  // seconds
  @state() private _distributionMode = 'shuffle_rotate';
  @state() private _offsetDelay = 0;
  @state() private _randomOrder = false;
  @state() private _loopMode = 'continuous';
  @state() private _loopCount = 3;
  @state() private _endBehavior = 'restore';
  @state() private _saving = false;
  @state() private _previewing = false;
  @state() private _hasUserInteraction = false;
  @state() private _editingColorIndex: number | null = null;
  @state() private _editingColor: XYColor | null = null;
  @state() private _showExtractor = false;
  @state() private _extractorSource: 'upload' | 'url' = 'upload';
  @state() private _thumbnail?: string;
  @state() private _audioEnabled = false;
  @state() private _audioEntity = '';
  @state() private _audioSensitivity = 50;
  @state() private _audioBrightnessCurve: 'linear' | 'logarithmic' | 'exponential' | null = 'linear';
  @state() private _audioBrightnessMin = 30;
  @state() private _audioBrightnessMax = 100;
  @state() private _audioColorAdvance: 'on_onset' | 'continuous' | 'beat_predictive' | 'intensity_breathing' | 'onset_flash' = 'on_onset';
  @state() private _audioTransitionSpeed = 50;
  @state() private _audioDetectionMode: 'spectral_flux' | 'bass_energy' | 'complex_domain' = 'spectral_flux';
  @state() private _audioFrequencyZone = false;
  @state() private _audioSilenceBehavior: 'hold' | 'slow_cycle' | 'decay_min' | 'decay_mid' = 'slow_cycle';
  @state() private _audioPredictionAggressiveness = 50;
  @state() private _audioLatencyCompensationMs = 150;
  @state() private _audioColorByFrequency = false;
  @state() private _audioRolloffBrightness = false;

  // Audio preset definitions (UI-only, not stored in model)
  private static readonly AUDIO_PRESETS: Record<string, {
    color_advance: string; detection_mode: string; sensitivity: number;
    transition_speed: number; brightness_curve: string | null; brightness_min: number; brightness_max: number; frequency_zone: boolean;
    color_by_frequency: boolean; rolloff_brightness: boolean; silence_behavior: string;
    prediction_aggressiveness: number; latency_compensation_ms: number;
    requires_pro: boolean;
  }> = {
    beat: {
      color_advance: 'on_onset', detection_mode: 'spectral_flux', sensitivity: 60,
      transition_speed: 80, brightness_curve: 'linear', brightness_min: 30, brightness_max: 100, frequency_zone: false,
      color_by_frequency: false, rolloff_brightness: false, silence_behavior: 'slow_cycle',
      prediction_aggressiveness: 50, latency_compensation_ms: 150,
      requires_pro: false,
    },
    ambient: {
      color_advance: 'intensity_breathing', detection_mode: 'spectral_flux', sensitivity: 50,
      transition_speed: 20, brightness_curve: 'logarithmic', brightness_min: 20, brightness_max: 80, frequency_zone: false,
      color_by_frequency: false, rolloff_brightness: true, silence_behavior: 'slow_cycle',
      prediction_aggressiveness: 50, latency_compensation_ms: 150,
      requires_pro: false,
    },
    concert: {
      color_advance: 'beat_predictive', detection_mode: 'complex_domain', sensitivity: 50,
      transition_speed: 50, brightness_curve: 'linear', brightness_min: 30, brightness_max: 100, frequency_zone: true,
      color_by_frequency: true, rolloff_brightness: false, silence_behavior: 'slow_cycle',
      prediction_aggressiveness: 70, latency_compensation_ms: 150,
      requires_pro: false,
    },
    chill: {
      color_advance: 'continuous', detection_mode: 'spectral_flux', sensitivity: 40,
      transition_speed: 30, brightness_curve: 'logarithmic', brightness_min: 20, brightness_max: 80, frequency_zone: false,
      color_by_frequency: false, rolloff_brightness: false, silence_behavior: 'slow_cycle',
      prediction_aggressiveness: 50, latency_compensation_ms: 150,
      requires_pro: false,
    },
    club: {
      color_advance: 'onset_flash', detection_mode: 'bass_energy', sensitivity: 70,
      transition_speed: 95, brightness_curve: 'exponential', brightness_min: 10, brightness_max: 100, frequency_zone: false,
      color_by_frequency: false, rolloff_brightness: false, silence_behavior: 'hold',
      prediction_aggressiveness: 50, latency_compensation_ms: 150,
      requires_pro: false,
    },
    kick: {
      color_advance: 'bass_kick', detection_mode: 'bass_energy', sensitivity: 75,
      transition_speed: 90, brightness_curve: null, brightness_min: 30, brightness_max: 100, frequency_zone: false,
      color_by_frequency: false, rolloff_brightness: false, silence_behavior: 'decay_min',
      prediction_aggressiveness: 50, latency_compensation_ms: 150,
      requires_pro: true,
    },
    spectrum: {
      color_advance: 'freq_to_hue', detection_mode: 'spectral_flux', sensitivity: 50,
      transition_speed: 30, brightness_curve: 'logarithmic', brightness_min: 25, brightness_max: 90, frequency_zone: false,
      color_by_frequency: false, rolloff_brightness: false, silence_behavior: 'hold',
      prediction_aggressiveness: 50, latency_compensation_ms: 150,
      requires_pro: true,
    },
  };

  private get _currentAudioPreset(): string {
    for (const [name, p] of Object.entries(DynamicSceneEditor.AUDIO_PRESETS)) {
      if (this._audioColorAdvance === p.color_advance &&
          this._audioDetectionMode === p.detection_mode &&
          this._audioSensitivity === p.sensitivity &&
          this._audioTransitionSpeed === p.transition_speed &&
          this._audioBrightnessCurve === p.brightness_curve &&
          this._audioBrightnessMin === p.brightness_min &&
          this._audioBrightnessMax === p.brightness_max &&
          this._audioFrequencyZone === p.frequency_zone &&
          this._audioColorByFrequency === p.color_by_frequency &&
          this._audioRolloffBrightness === p.rolloff_brightness &&
          this._audioSilenceBehavior === p.silence_behavior &&
          this._audioPredictionAggressiveness === p.prediction_aggressiveness &&
          this._audioLatencyCompensationMs === p.latency_compensation_ms) {
        return name;
      }
    }
    return 'custom';
  }

  private get _audioPresetOptions() {
    const tier = audioDeviceTier(this.hass, this._audioEntity);
    const proBadge = this._localize('dynamic_scene.audio_mode_pro_badge') || 'pro';
    const options = Object.entries(DynamicSceneEditor.AUDIO_PRESETS)
      // Skip presets whose color_advance value is currently hidden in the
      // mode registry — surfacing them as preset choices would let the user
      // pick a preset that locks them into a mode they can't otherwise
      // select. See audio_mode_handlers.py MODE_REGISTRY hidden flag.
      .filter(([_, p]) => !isAudioModeHidden(this._audioModeRegistry, p.color_advance))
      .map(([name, p]) => {
        const baseLabel = this._localize(`dynamic_scene.audio_preset_${name}`) || name;
        const needsBadge = p.requires_pro && tier !== 'pro';
        return { value: name, label: needsBadge ? `${baseLabel} (${proBadge})` : baseLabel };
      });
    options.push({ value: 'custom', label: this._localize('dynamic_scene.audio_preset_custom') || 'Custom' });
    return options;
  }

  // Alias for cleaner code
  private get _colors(): EditableColor[] {
    return this._steps;
  }

  private set _colors(value: EditableColor[]) {
    this._steps = value;
  }

  private _cachedLoopModeOptions: { value: string; label: string }[] = [];
  private _cachedEndBehaviorOptions: { value: string; label: string }[] = [];
  /**
   * Mode registry fetched from the backend via
   * /api/aqara_advanced_lighting/audio_mode_registry. `null` before the fetch
   * completes; the template renders an empty dropdown in that tiny window.
   *
   * Each entry: { constant: string, requires_pro: boolean, display_label: string }.
   * Backend is the single source of truth — do NOT add modes here.
   * To add a new mode: add it to MODE_REGISTRY in audio_mode_handlers.py and
   * add translation keys in panel.en.json (audio_mode_<constant>,
   * audio_mode_<constant>_desc).
   */
  @state() private _audioModeRegistry: AudioModeEntry[] | null = null;
  private _cachedAudioDetectionModeOptions: { value: string; label: string }[] = [];
  private _cachedDistributionModeOptions: { value: string; label: string }[] = [];

  protected willUpdate(changedProps: PropertyValues): void {
    if (changedProps.has('translations')) {
      const loc = (k: string) => this._localize(k);
      this._cachedLoopModeOptions = loopModeOptions(loc);
      this._cachedEndBehaviorOptions = endBehaviorOptions(loc, 'dynamic_scene.end_behavior_restore');
      this._cachedAudioDetectionModeOptions = [
        { value: 'spectral_flux', label: loc('dynamic_scene.audio_detection_spectral_flux') || 'Spectral flux (all genres)' },
        { value: 'bass_energy', label: loc('dynamic_scene.audio_detection_bass_energy') || 'Bass energy (rhythmic music)' },
        { value: 'complex_domain', label: loc('dynamic_scene.audio_detection_complex_domain') || 'Complex domain (phase + magnitude)' },
      ];
      this._cachedDistributionModeOptions = [
        { value: 'shuffle_rotate', label: loc('dynamic_scene.distribution_shuffle_rotate') || 'Shuffle and rotate' },
        { value: 'synchronized', label: loc('dynamic_scene.distribution_synchronized') || 'Synchronized' },
        { value: 'random', label: loc('dynamic_scene.distribution_random') || 'Random' },
      ];
    }
  }

  private get _loopModeOptions() { return this._cachedLoopModeOptions; }
  private get _endBehaviorOptions() { return this._cachedEndBehaviorOptions; }
  private get _audioColorAdvanceOptions(): Array<{ value: string; label: string }> {
    return buildAudioModeOptions(
      this._audioModeRegistry,
      audioDeviceTier(this.hass, this._audioEntity),
      (key) => this._localize(key),
    );
  }
  private get _audioDetectionModeOptions() { return this._cachedAudioDetectionModeOptions; }
  private get _distributionModeOptions() { return this._cachedDistributionModeOptions; }

  static styles = [
    colorPickerStyles,
    reorderableStepStyles,
    editorFormStyles,
    css`
    .boolean-left ha-selector {
      display: flex;
      justify-content: flex-start;
    }

    /* Color slots section */
    .color-slots-container {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .color-slot {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: var(--card-background-color);
      border: 1px solid var(--divider-color);
      border-radius: 8px;
    }

    .color-slot.dragging {
      opacity: 0.4;
    }

    .color-preview {
      width: 48px;
      height: 48px;
      border-radius: 8px;
      cursor: pointer;
      border: 2px solid var(--divider-color);
      flex-shrink: 0;
    }

    .color-slot-number {
      font-size: 14px;
      font-weight: 600;
      color: var(--primary-color);
      min-width: 20px;
      flex-shrink: 0;
    }

    .brightness-control {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 0;
      overflow: hidden;
    }

    .brightness-control ha-selector {
      flex: 1;
      min-width: 80px;
    }

    .brightness-value {
      font-size: 13px;
      color: var(--secondary-text-color);
      min-width: 40px;
      text-align: right;
    }

    .color-slot-actions {
      display: flex;
      gap: 4px;
    }

    .color-slot-actions ha-icon-button {
      --ha-icon-button-size: 32px;
      --mdc-icon-button-size: 32px;
      --mdc-icon-size: 18px;
    }

    .add-color-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 12px;
      border: 2px dashed var(--divider-color);
      border-radius: 8px;
      cursor: pointer;
      color: var(--secondary-text-color);
      transition: all 0.2s ease;
      background: transparent;
    }

    .add-color-btn:hover {
      border-color: var(--primary-color);
      color: var(--primary-color);
      background: var(--secondary-background-color);
    }

    .add-color-btn.disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .color-action-buttons {
      display: flex;
      gap: 8px;
    }

    .color-action-buttons .add-color-btn {
      flex: 1;
    }

    .extract-btn {
      border-style: dashed;
    }

    /* Timing sliders */
    .timing-section {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .timing-field {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .timing-label {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .timing-value {
      font-size: 13px;
      font-weight: 500;
      color: var(--primary-color);
    }

    /* Distribution section */
    .distribution-section {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .toggle-field {
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding-top: 4px;
    }

    .toggle-label {
      font-size: 12px;
      color: var(--secondary-text-color);
    }

    @media (max-width: 600px) {
      .timing-section {
        grid-template-columns: 1fr;
      }

      .color-slots-container {
        gap: 8px;
      }

      .color-slot {
        gap: 8px;
        padding: 8px;
      }

      .color-preview {
        width: 40px;
        height: 40px;
      }

      .color-slot-number {
        min-width: 16px;
        font-size: 13px;
      }

      .brightness-control {
        gap: 4px;
      }

      .brightness-control ha-selector {
        min-width: 60px;
      }

      .color-slot-actions ha-icon-button {
        --ha-icon-button-size: 28px;
        --mdc-icon-button-size: 28px;
        --mdc-icon-size: 16px;
      }
    }
  `];

  connectedCallback(): void {
    super.connectedCallback();
    if (this._colors.length === 0 && !this.preset) {
      this._addDefaultColors();
    }
    void this._fetchAudioModeRegistry();
  }

  /**
   * Fetch the audio mode registry from the backend. Runs once per component
   * mount. The response is stable per HA-process lifetime — registry contents
   * only change on integration reload — so re-fetching per editor open is
   * safe but unnecessary; once per mount is sufficient.
   *
   * Delegates to the shared helper so AqaraPanel and this component can't
   * drift. See audio-mode-registry.ts for the fetch implementation.
   */
  private async _fetchAudioModeRegistry(): Promise<void> {
    const modes = await fetchAudioModeRegistry(this.hass);
    if (modes !== null) {
      this._audioModeRegistry = modes;
      this.requestUpdate();
    }
  }

  protected updated(changedProps: PropertyValues): void {
    super.updated(changedProps);

    // Draft takes priority over preset (contains user's unsaved edits)
    if (changedProps.has('draft') && this.draft) {
      this._restoreDraft(this.draft);
    } else if (changedProps.has('preset') && this.preset) {
      this._hasUserInteraction = true;
      this._loadPreset(this.preset);
    }
  }

  private _loadPreset(preset: UserDynamicScenePreset): void {
    this._name = preset.name;
    this._icon = preset.icon || '';
    this._thumbnail = preset.thumbnail;
    this._transitionTime = preset.transition_time;
    this._holdTime = preset.hold_time;
    this._distributionMode = preset.distribution_mode;
    this._offsetDelay = preset.offset_delay;
    this._randomOrder = preset.random_order;
    this._loopMode = preset.loop_mode;
    this._loopCount = preset.loop_count || 3;
    this._endBehavior = preset.end_behavior;
    this._audioEnabled = !!(preset.audio_entity || preset.audio_color_advance);
    this._audioEntity = preset.audio_entity || '';
    this._audioSensitivity = preset.audio_sensitivity ?? 50;
    this._audioBrightnessCurve = (preset.audio_brightness_curve !== undefined ? preset.audio_brightness_curve : 'linear') as typeof this._audioBrightnessCurve;
    this._audioBrightnessMin = preset.audio_brightness_min ?? 30;
    this._audioBrightnessMax = preset.audio_brightness_max ?? 100;
    this._audioColorAdvance = preset.audio_color_advance ?? 'on_onset';
    this._audioTransitionSpeed = preset.audio_transition_speed ?? 50;
    this._audioDetectionMode = preset.audio_detection_mode ?? 'spectral_flux';
    this._audioFrequencyZone = preset.audio_frequency_zone ?? false;
    this._audioSilenceBehavior = (preset.audio_silence_behavior ?? 'slow_cycle') as typeof this._audioSilenceBehavior;
    this._audioPredictionAggressiveness = preset.audio_prediction_aggressiveness ?? 50;
    this._audioLatencyCompensationMs = preset.audio_latency_compensation_ms ?? 150;
    this._audioColorByFrequency = preset.audio_color_by_frequency ?? false;
    this._audioRolloffBrightness = preset.audio_rolloff_brightness ?? false;
    this._colors = preset.colors.map((color, index) => ({
      ...color,
      id: `color-${index}-${Date.now()}`,
    }));
  }

  public getDraftState(): DynamicSceneEditorDraft {
    return {
      name: this._name,
      icon: this._icon,
      thumbnail: this._thumbnail,
      colors: this._colors.map(c => ({
        x: c.x,
        y: c.y,
        brightness_pct: c.brightness_pct,
      })),
      transitionTime: this._transitionTime,
      holdTime: this._holdTime,
      distributionMode: this._distributionMode,
      offsetDelay: this._offsetDelay,
      randomOrder: this._randomOrder,
      loopMode: this._loopMode,
      loopCount: this._loopCount,
      endBehavior: this._endBehavior,
      hasUserInteraction: this._hasUserInteraction,
      audioEnabled: this._audioEnabled,
      audioEntity: this._audioEntity,
      audioSensitivity: this._audioSensitivity,
      audioBrightnessCurve: this._audioBrightnessCurve,
      audioBrightnessMin: this._audioBrightnessMin,
      audioBrightnessMax: this._audioBrightnessMax,
      audioColorAdvance: this._audioColorAdvance,
      audioTransitionSpeed: this._audioTransitionSpeed,
      audioDetectionMode: this._audioDetectionMode,
      audioFrequencyZone: this._audioFrequencyZone,
      audioSilenceBehavior: this._audioSilenceBehavior,
      audioPredictionAggressiveness: this._audioPredictionAggressiveness,
      audioLatencyCompensationMs: this._audioLatencyCompensationMs,
      audioColorByFrequency: this._audioColorByFrequency,
      audioRolloffBrightness: this._audioRolloffBrightness,
    };
  }

  public resetToDefaults(): void {
    // Drop any thumbnail extracted but never persisted. The DELETE endpoint is
    // idempotent and only evicts in-memory pending entries, so it is safe when
    // _cancel() has already discarded the same id on the way here.
    discardUnsaved(this.hass, this._thumbnail, this.preset?.thumbnail);
    this._name = '';
    this._icon = '';
    this._thumbnail = undefined;
    this._transitionTime = 120;
    this._holdTime = 0;
    this._distributionMode = 'shuffle_rotate';
    this._offsetDelay = 0;
    this._randomOrder = false;
    this._loopMode = 'continuous';
    this._loopCount = 3;
    this._endBehavior = 'restore';
    this._hasUserInteraction = false;
    this._audioEnabled = false;
    this._audioEntity = '';
    this._audioSensitivity = 50;
    this._audioBrightnessCurve = 'linear';
    this._audioBrightnessMin = 30;
    this._audioBrightnessMax = 100;
    this._audioColorAdvance = 'on_onset';
    this._audioTransitionSpeed = 50;
    this._audioDetectionMode = 'spectral_flux';
    this._audioFrequencyZone = false;
    this._audioSilenceBehavior = 'slow_cycle';
    this._audioPredictionAggressiveness = 50;
    this._audioLatencyCompensationMs = 150;
    this._audioColorByFrequency = false;
    this._audioRolloffBrightness = false;
    this._addDefaultColors();
  }

  private _restoreDraft(draft: DynamicSceneEditorDraft): void {
    this._name = draft.name;
    this._icon = draft.icon;
    this._thumbnail = draft.thumbnail;
    this._transitionTime = draft.transitionTime;
    this._holdTime = draft.holdTime;
    this._distributionMode = draft.distributionMode;
    this._offsetDelay = draft.offsetDelay;
    this._randomOrder = draft.randomOrder;
    this._loopMode = draft.loopMode;
    this._loopCount = draft.loopCount;
    this._endBehavior = draft.endBehavior;
    this._hasUserInteraction = draft.hasUserInteraction ?? false;
    this._audioEnabled = draft.audioEnabled ?? false;
    this._audioEntity = draft.audioEntity ?? '';
    this._audioSensitivity = draft.audioSensitivity ?? 50;
    this._audioBrightnessCurve = (draft.audioBrightnessCurve !== undefined ? draft.audioBrightnessCurve : 'linear') as typeof this._audioBrightnessCurve;
    this._audioBrightnessMin = draft.audioBrightnessMin ?? 30;
    this._audioBrightnessMax = draft.audioBrightnessMax ?? 100;
    this._audioColorAdvance = draft.audioColorAdvance ?? 'on_onset';
    this._audioTransitionSpeed = draft.audioTransitionSpeed ?? 50;
    this._audioDetectionMode = draft.audioDetectionMode ?? 'spectral_flux';
    this._audioFrequencyZone = draft.audioFrequencyZone ?? false;
    this._audioSilenceBehavior = (draft.audioSilenceBehavior ?? 'slow_cycle') as typeof this._audioSilenceBehavior;
    this._audioPredictionAggressiveness = draft.audioPredictionAggressiveness ?? 50;
    this._audioLatencyCompensationMs = draft.audioLatencyCompensationMs ?? 150;
    this._audioColorByFrequency = draft.audioColorByFrequency ?? false;
    this._audioRolloffBrightness = draft.audioRolloffBrightness ?? false;
    this._colors = draft.colors.map((color, index) => ({
      ...color,
      id: `color-${index}-${Date.now()}`,
    }));
  }

  private _addDefaultColors(): void {
    // Start with two complementary colors (warm orange and cool blue)
    this._colors = [
      { id: `color-0-${Date.now()}`, x: 0.5500, y: 0.4100, brightness_pct: 100 },  // Warm orange
      { id: `color-1-${Date.now() + 1}`, x: 0.1500, y: 0.0600, brightness_pct: 100 },  // Cool blue
    ];
  }

  private _colorIdCounter = 0;

  private _generateColorId(): string {
    return `color-${++this._colorIdCounter}-${Date.now()}`;
  }

  private _handleNameChange(e: CustomEvent): void {
    this._name = e.detail.value || '';
    this._hasUserInteraction = true;
  }

  private _handleIconChange(e: CustomEvent): void {
    this._icon = e.detail.value || '';
    this._hasUserInteraction = true;
  }

  private _handleTransitionTimeChange(e: CustomEvent): void {
    this._transitionTime = e.detail.value ?? 120;
    this._hasUserInteraction = true;
  }

  private _handleHoldTimeChange(e: CustomEvent): void {
    this._holdTime = e.detail.value ?? 0;
    this._hasUserInteraction = true;
  }

  private _handleDistributionModeChange(e: CustomEvent): void {
    this._distributionMode = e.detail.value || 'shuffle_rotate';
    this._hasUserInteraction = true;
  }

  private _handleOffsetDelayChange(e: CustomEvent): void {
    this._offsetDelay = e.detail.value ?? 0;
    this._hasUserInteraction = true;
  }

  private _handleRandomOrderChange(e: CustomEvent): void {
    this._randomOrder = e.detail.value ?? false;
    this._hasUserInteraction = true;
  }

  private _handleLoopModeChange(e: CustomEvent): void {
    this._loopMode = e.detail.value || 'continuous';
    this._hasUserInteraction = true;
  }

  private _handleLoopCountChange(e: CustomEvent): void {
    this._loopCount = e.detail.value ?? 3;
    this._hasUserInteraction = true;
  }

  private _handleEndBehaviorChange(e: CustomEvent): void {
    this._endBehavior = e.detail.value || 'restore';
    this._hasUserInteraction = true;
  }

  private _handleAudioEnabledChange(e: CustomEvent): void {
    this._audioEnabled = e.detail.value ?? false;
    if (this._audioEnabled && !this._audioEntity && this.defaultAudioEntity) {
      this._audioEntity = this.defaultAudioEntity;
    }
    this._hasUserInteraction = true;
  }

  private _handleAudioEntityChange(e: CustomEvent): void {
    this._audioEntity = e.detail.value || '';
    this._hasUserInteraction = true;
  }

  private _handleAudioSensitivityChange(e: CustomEvent): void {
    this._audioSensitivity = e.detail.value ?? 50;
    this._hasUserInteraction = true;
  }

  private _handleAudioBrightnessCurveChange(e: CustomEvent): void {
    const val = e.detail.value;
    this._audioBrightnessCurve = val === 'disabled' ? null : ((val || 'linear') as 'linear' | 'logarithmic' | 'exponential');
    this._hasUserInteraction = true;
  }

  private _handleAudioBrightnessMinChange(e: CustomEvent): void {
    this._audioBrightnessMin = e.detail.value ?? 30;
    this._hasUserInteraction = true;
  }

  private _handleAudioBrightnessMaxChange(e: CustomEvent): void {
    this._audioBrightnessMax = e.detail.value ?? 100;
    this._hasUserInteraction = true;
  }

  private _handleAudioColorAdvanceChange(e: CustomEvent): void {
    this._audioColorAdvance = e.detail.value || 'on_onset';
    this._hasUserInteraction = true;
  }

  private _handleAudioPresetChange(e: CustomEvent): void {
    const preset = e.detail.value;
    if (preset === 'custom') return;
    const p = DynamicSceneEditor.AUDIO_PRESETS[preset];
    if (!p) return;
    this._audioColorAdvance = p.color_advance as any;
    this._audioDetectionMode = p.detection_mode as any;
    this._audioSensitivity = p.sensitivity;
    this._audioTransitionSpeed = p.transition_speed;
    this._audioBrightnessCurve = p.brightness_curve as typeof this._audioBrightnessCurve;
    this._audioBrightnessMin = p.brightness_min;
    this._audioBrightnessMax = p.brightness_max;
    this._audioFrequencyZone = p.frequency_zone;
    this._audioColorByFrequency = p.color_by_frequency;
    this._audioRolloffBrightness = p.rolloff_brightness;
    this._audioSilenceBehavior = p.silence_behavior as typeof this._audioSilenceBehavior;
    this._audioPredictionAggressiveness = p.prediction_aggressiveness;
    this._audioLatencyCompensationMs = p.latency_compensation_ms;
    this._hasUserInteraction = true;
  }

  private _handleAudioDetectionModeChange(e: CustomEvent): void {
    this._audioDetectionMode = e.detail.value || 'spectral_flux';
    this._hasUserInteraction = true;
  }

  private _handleAudioFrequencyZoneChange(e: CustomEvent): void {
    this._audioFrequencyZone = e.detail.value ?? false;
    this._hasUserInteraction = true;
  }

  private _handleAudioSilenceBehaviorChange(e: CustomEvent): void {
    this._audioSilenceBehavior = e.detail.value || 'slow_cycle';
    this._hasUserInteraction = true;
  }

  private _handleAudioPredictionAggressivenessChange(e: CustomEvent): void {
    this._audioPredictionAggressiveness = e.detail.value ?? 50;
    this._hasUserInteraction = true;
  }

  private _handleAudioLatencyCompensationChange(e: CustomEvent): void {
    this._audioLatencyCompensationMs = e.detail.value ?? 150;
    this._hasUserInteraction = true;
  }

  private _handleAudioColorByFrequencyChange(e: CustomEvent): void {
    this._audioColorByFrequency = e.detail.value ?? false;
    this._hasUserInteraction = true;
  }

  private _handleAudioRolloffBrightnessChange(e: CustomEvent): void {
    this._audioRolloffBrightness = e.detail.value ?? false;
    this._hasUserInteraction = true;
  }

  private _handleAudioTransitionSpeedChange(e: CustomEvent): void {
    this._audioTransitionSpeed = e.detail.value ?? 50;
    this._hasUserInteraction = true;
  }

  private _handleColorBrightnessChange(colorId: string, e: CustomEvent): void {
    const brightness = e.detail.value ?? 100;
    this._colors = this._colors.map(c =>
      c.id === colorId ? { ...c, brightness_pct: brightness } : c
    );
    this._hasUserInteraction = true;
  }

  private _openColorPicker(index: number): void {
    const color = this._colors[index];
    if (!color) return;
    this._editingColorIndex = index;
    this._editingColor = { x: color.x, y: color.y };
  }

  private _handleColorPickerChange(e: CustomEvent): void {
    this._editingColor = e.detail.color;
  }

  private _confirmColorPicker(): void {
    if (this._editingColorIndex !== null && this._editingColor !== null) {
      // Update color history and notify parent
      const newHistory = addColorToHistory(this.colorHistory, this._editingColor);
      this.dispatchEvent(new CustomEvent('color-history-changed', {
        detail: { colorHistory: newHistory },
        bubbles: true,
        composed: true,
      }));

      // Update the color in the list
      this._colors = this._colors.map((c, i) =>
        i === this._editingColorIndex
          ? { ...c, x: this._editingColor!.x, y: this._editingColor!.y }
          : c
      );
      this._hasUserInteraction = true;
    }
    this._closeColorPicker();
  }

  private _handleHistoryColorSelected(e: CustomEvent): void {
    const color = e.detail.color as XYColor;
    this._editingColor = { x: color.x, y: color.y };
  }

  private _closeColorPicker(): void {
    this._editingColorIndex = null;
    this._editingColor = null;
  }

  private _addColor(): void {
    if (this._colors.length >= 8) return;

    // Get the last color and calculate an analogous color (30 degree hue shift)
    const lastColor = this._colors[this._colors.length - 1];
    const baseColor = lastColor
      ? { x: lastColor.x, y: lastColor.y }
      : { x: 0.6800, y: 0.3100 };  // Default to red
    const newColor = getAnalogousColor(baseColor);

    this._colors = [...this._colors, {
      id: this._generateColorId(),
      x: newColor.x,
      y: newColor.y,
      brightness_pct: lastColor?.brightness_pct ?? 100,
    }];
    this._hasUserInteraction = true;
  }

  private _handleColorsExtracted(e: CustomEvent<ColorsExtractedDetail>): void {
    const { colors, thumbnailId } = e.detail;

    // Replace all color slots with extracted colors
    this._colors = colors
      .filter((c): c is DynamicSceneColor => c !== null)
      .map(c => ({
        id: this._generateColorId(),
        x: c.x,
        y: c.y,
        brightness_pct: c.brightness_pct,
      }));

    this._thumbnail = adoptThumbnail(
      this.hass, this._thumbnail, thumbnailId, this.preset?.thumbnail,
    );

    this._showExtractor = false;
    this._hasUserInteraction = true;
  }

  private _removeColor(colorId: string): void {
    if (this._colors.length <= 1) return;
    this._colors = this._colors.filter(c => c.id !== colorId);
    this._hasUserInteraction = true;
  }

  private _getPresetData(): Record<string, unknown> {
    const data: Record<string, unknown> = {
      name: this._name,
      icon: this._icon || undefined,
      thumbnail: this._thumbnail || undefined,
      colors: this._colors.map(c => ({
        x: c.x,
        y: c.y,
        brightness_pct: c.brightness_pct,
      })),
      transition_time: this._transitionTime,
      hold_time: this._holdTime,
      distribution_mode: this._distributionMode,
      offset_delay: this._offsetDelay,
      random_order: this._randomOrder,
      loop_mode: this._loopMode,
      end_behavior: this._endBehavior,
    };

    if (this._loopMode === 'count') {
      data.loop_count = this._loopCount;
    }

    // Include audio fields only when audio is enabled and an entity is selected
    if (this._audioEnabled && this._audioEntity) {
      data.audio_entity = this._audioEntity;
      data.audio_sensitivity = this._audioSensitivity;
      data.audio_brightness_curve = this._audioBrightnessCurve;
      data.audio_brightness_min = this._audioBrightnessMin;
      data.audio_brightness_max = this._audioBrightnessMax;
      data.audio_color_advance = this._audioColorAdvance;
      data.audio_transition_speed = this._audioTransitionSpeed;
      data.audio_detection_mode = this._audioDetectionMode;
      data.audio_frequency_zone = this._audioFrequencyZone;
      data.audio_silence_behavior = this._audioSilenceBehavior;
      data.audio_prediction_aggressiveness = this._audioPredictionAggressiveness;
      data.audio_latency_compensation_ms = this._audioLatencyCompensationMs;
      data.audio_color_by_frequency = this._audioColorByFrequency;
      data.audio_rolloff_brightness = this._audioRolloffBrightness;
    }

    return data;
  }

  private async _preview(): Promise<void> {
    if (!this.hass || this._previewing || this._colors.length === 0) return;

    this._previewing = true;
    try {
      this.dispatchEvent(
        new CustomEvent('preview', {
          detail: this._getPresetData(),
          bubbles: true,
          composed: true,
        })
      );
    } finally {
      this._previewing = false;
    }
  }

  private _stopPreview(): void {
    this.dispatchEvent(
      new CustomEvent('stop-preview', {
        bubbles: true,
        composed: true,
      })
    );
  }

  private async _save(): Promise<void> {
    if (!this._name.trim() || this._colors.length === 0) return;

    this._saving = true;
    try {
      this.dispatchEvent(
        new CustomEvent('save', {
          detail: this._getPresetData(),
          bubbles: true,
          composed: true,
        })
      );
    } finally {
      this._saving = false;
    }
  }

  private _cancel(): void {
    this._hasUserInteraction = false;

    // Clean up unsaved thumbnail (one that was extracted but not yet persisted to a preset)
    discardUnsaved(this.hass, this._thumbnail, this.preset?.thumbnail);

    this.dispatchEvent(
      new CustomEvent('cancel', {
        bubbles: true,
        composed: true,
      })
    );
  }

  /**
   * Format time value for display (converts seconds to human-readable format)
   */
  private _formatTime(seconds: number): string {
    if (seconds < 60) {
      return `${seconds}s`;
    } else if (seconds < 3600) {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const mins = Math.floor((seconds % 3600) / 60);
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
  }

  private _renderColorSlot(color: EditableColor, index: number): TemplateResult {
    const hexColor = xyToHex({ x: color.x, y: color.y }, 255);

    return html`
      <div class="color-slot step-item">
        ${this._renderDragHandle(index)}
        <span class="color-slot-number">${index + 1}</span>
        <div
          class="color-preview"
          role="button"
          tabindex="0"
          style="background-color: ${hexColor}"
          @click=${() => this._openColorPicker(index)}
          @keydown=${(e: KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this._openColorPicker(index); } }}
          title="${this._localize('tooltips.color_edit')}"
          aria-label="${this._localize('editors.color_label') || 'Color'} ${index + 1}: ${hexColor}"
        ></div>
        <div class="brightness-control">
          <ha-selector
            .hass=${this.hass}
            .selector=${{
              number: {
                min: 1,
                max: 100,
                mode: 'slider',
                unit_of_measurement: '%',
              },
            }}
            .value=${color.brightness_pct}
            @value-changed=${(e: CustomEvent) => this._handleColorBrightnessChange(color.id, e)}
          ></ha-selector>
        </div>
        <div class="color-slot-actions">
          ${this._colors.length > 1 ? html`
            <ha-icon-button
              @click=${() => this._removeColor(color.id)}
              title="${this._localize('tooltips.color_remove')}"
            >
              <ha-icon icon="mdi:close"></ha-icon>
            </ha-icon-button>
          ` : ''}
        </div>
      </div>
    `;
  }

  private _localize(key: string, replacements?: Record<string, string>): string {
    return localize(this.translations, key, replacements);
  }

  protected render() {
    return html`
      <div class="editor-content">
        <!-- Header: Name and Icon -->
        <div class="form-row-pair">
          <div class="form-field">
            <span class="form-label">${this._localize('editors.name_label')}</span>
            <ha-selector
              .hass=${this.hass}
              .selector=${{ text: {} }}
              .value=${this._name}
              @value-changed=${this._handleNameChange}
            ></ha-selector>
          </div>
          <div class="form-field">
            <span class="form-label">${this._localize('editors.icon_label')}</span>
            <div class="icon-field-row">
              <ha-selector
                .hass=${this.hass}
                .selector=${{ icon: {} }}
                .value=${this._icon}
                @value-changed=${this._handleIconChange}
              ></ha-selector>
              ${this._icon ? html`
                <ha-icon-button
                  class="icon-clear-btn"
                  @click=${() => { this._icon = ''; this._hasUserInteraction = true; }}
                  title=${this._localize('editors.icon_clear_tooltip')}
                >
                  <ha-icon icon="mdi:close"></ha-icon>
                </ha-icon-button>
              ` : ''}
            </div>
            <span class="form-hint">${this._localize('editors.icon_auto_hint')}</span>
          </div>
        </div>

        <!-- Colors Section (1-8 reorderable) -->
        <div class="form-section">
          <span class="form-label">${this._localize('editors.colors_brightness_label') || 'Colors and brightness (1-8)'}</span>
          <div class="color-slots-container step-list">
            ${this._colors.map((color, index) => html`
              ${this._renderDropIndicator(index)}
              ${this._renderColorSlot(color, index)}
            `)}
            ${this._renderDropIndicator(this._colors.length)}

            <div class="color-action-buttons">
              <button
                class="add-color-btn ${this._colors.length >= 8 ? 'disabled' : ''}"
                @click=${this._addColor}
                ?disabled=${this._colors.length >= 8}
              >
                <ha-icon icon="mdi:plus"></ha-icon>
                ${this._localize('dynamic_scene.add_color_button') || 'Add color'}
              </button>
              <button
                class="add-color-btn extract-btn"
                @click=${() => { this._showExtractor = true; }}
              >
                <ha-icon icon="mdi:image-search-outline"></ha-icon>
                ${this._localize('image_extractor.button_label') || 'Extract from image'}
              </button>
            </div>
          </div>
        </div>

        <!-- Image Color Extractor Dialog -->
        <ha-dialog
          class="extractor-dialog"
          .open=${this._showExtractor}
          @closed=${() => { this._showExtractor = false; }}
          .headerTitle=${this._localize('image_extractor.button_label') || 'Extract from image'}
        >
          <span slot="headerNavigationIcon"></span>
          <div slot="headerActionItems" class="extractor-mode-toggle">
            <button
              class="mode-btn ${this._extractorSource === 'upload' ? 'active' : ''}"
              @click=${() => { this._extractorSource = 'upload'; }}
            >
              <ha-icon icon="mdi:upload"></ha-icon>
              ${this._localize('image_extractor.upload_tab')}
            </button>
            <button
              class="mode-btn ${this._extractorSource === 'url' ? 'active' : ''}"
              @click=${() => { this._extractorSource = 'url'; }}
            >
              <ha-icon icon="mdi:link"></ha-icon>
              ${this._localize('image_extractor.url_tab')}
            </button>
          </div>
          <image-color-extractor
            .hass=${this.hass}
            .translations=${this.translations}
            .source=${this._extractorSource}
            @colors-extracted=${this._handleColorsExtracted}
            @extractor-cancelled=${() => { this._showExtractor = false; }}
          ></image-color-extractor>
          ${dialogActions(
            this._localize('image_extractor.cancel_button'),
            this._localize('image_extractor.extract_button'),
            () => { this._showExtractor = false; },
            () => { (this.shadowRoot!.querySelector('image-color-extractor') as any)?.extract(); },
            'mdi:palette-swatch',
          )}
        </ha-dialog>

        <!-- Timing Section -->
        <div class="form-section">
          <span class="form-label">${this._localize('dynamic_scene.timing_label') || 'Timing'}</span>
          <div class="timing-section">
            <div class="timing-field">
              <div class="timing-label">
                <span class="form-label">${this._localize('editors.transition_time_label')}</span>
                <span class="timing-value">${this._formatTime(this._transitionTime)}</span>
              </div>
              <ha-selector
                .hass=${this.hass}
                .selector=${{
                  number: {
                    min: 30,
                    max: 3600,
                    step: 5,
                    mode: 'slider',
                    unit_of_measurement: 's',
                  },
                }}
                .value=${this._transitionTime}
                .disabled=${this._audioEnabled}
                @value-changed=${this._handleTransitionTimeChange}
              ></ha-selector>
            </div>
            <div class="timing-field">
              <div class="timing-label">
                <span class="form-label">${this._localize('editors.hold_time_label')}</span>
                <span class="timing-value">${this._formatTime(this._holdTime)}</span>
              </div>
              <ha-selector
                .hass=${this.hass}
                .selector=${{
                  number: {
                    min: 0,
                    max: 3600,
                    step: 5,
                    mode: 'slider',
                    unit_of_measurement: 's',
                  },
                }}
                .value=${this._holdTime}
                .disabled=${this._audioEnabled}
                @value-changed=${this._handleHoldTimeChange}
              ></ha-selector>
            </div>
          </div>
        </div>

        <!-- Color Assignment + Randomize Light Order -->
        <div class="form-row-pair">
          <div class="form-section">
            <span class="form-label">${this._localize('dynamic_scene.distribution_mode_label') || 'Color assignment'}</span>
            <ha-selector
              .hass=${this.hass}
              .selector=${{
                select: {
                  options: this._distributionModeOptions,
                  mode: 'dropdown',
                },
              }}
              .value=${this._distributionMode}
              @value-changed=${this._handleDistributionModeChange}
            ></ha-selector>
          </div>
          <div class="form-section boolean-left">
            <span class="form-label">${this._localize('dynamic_scene.random_order_label') || 'Randomize light order'}</span>
            <ha-selector
              .hass=${this.hass}
              .selector=${{ boolean: {} }}
              .value=${this._randomOrder}
              @value-changed=${this._handleRandomOrderChange}
            ></ha-selector>
          </div>
        </div>

        <!-- Ripple Effect + Maximum Scene Brightness -->
        <div class="form-row-pair">
          <div class="form-section">
            <span class="form-label">${this._localize('dynamic_scene.ripple_effect_label') || 'Ripple effect'}</span>
            <ha-selector
              .hass=${this.hass}
              .selector=${{
                number: {
                  min: 0,
                  max: 120,
                  step: 1,
                  mode: 'slider',
                  unit_of_measurement: 's',
                },
              }}
              .value=${this._offsetDelay}
              @value-changed=${this._handleOffsetDelayChange}
            ></ha-selector>
          </div>
        </div>

        <!-- Loop Behavior -->
        <div class="form-row-pair">
          <div class="form-field">
            <span class="form-label">${this._localize('editors.loop_mode_label')}</span>
            <ha-selector
              .hass=${this.hass}
              .selector=${{
                select: {
                  options: this._loopModeOptions,
                  mode: 'dropdown',
                },
              }}
              .value=${this._loopMode}
              .disabled=${this._audioEnabled}
              @value-changed=${this._handleLoopModeChange}
            ></ha-selector>
          </div>
          <div class="form-field">
            <span class="form-label">${this._localize('editors.end_behavior_label')}</span>
            <ha-selector
              .hass=${this.hass}
              .selector=${{
                select: {
                  options: this._endBehaviorOptions,
                  mode: 'dropdown',
                },
              }}
              .value=${this._endBehavior}
              .disabled=${this._audioEnabled}
              @value-changed=${this._handleEndBehaviorChange}
            ></ha-selector>
          </div>
        </div>

        ${this._loopMode === 'count' ? html`
          <div class="form-row">
            <span class="form-label">${this._localize('editors.loop_count_label')}</span>
            <div class="form-input">
              <ha-selector
                .hass=${this.hass}
                .selector=${{
                  number: {
                    min: 1,
                    max: 100,
                    mode: 'box',
                  },
                }}
                .value=${this._loopCount}
                .disabled=${this._audioEnabled}
                @value-changed=${this._handleLoopCountChange}
              ></ha-selector>
            </div>
          </div>
        ` : ''}

        <!-- Audio Reactive Section -->
        <div class="form-section">
          <div class="form-row-pair">
            <div class="form-section boolean-left">
              <span class="form-label">${this._localize('dynamic_scene.audio_reactive_label') || 'Audio reactive'}</span>
              <ha-selector
                .hass=${this.hass}
                .selector=${{ boolean: {} }}
                .value=${this._audioEnabled}
                @value-changed=${this._handleAudioEnabledChange}
              ></ha-selector>
            </div>
          </div>

          ${this._audioEnabled ? html`
            <!-- Row 1: Audio preset + Entity selector -->
            <div class="form-row-pair">
              <div class="form-field">
                <span class="form-label">${this._localize('dynamic_scene.audio_preset_label') || 'Audio preset'}</span>
                <ha-selector
                  .hass=${this.hass}
                  .selector=${{
                    select: {
                      options: this._audioPresetOptions,
                      mode: 'dropdown',
                    },
                  }}
                  .value=${this._currentAudioPreset}
                  @value-changed=${this._handleAudioPresetChange}
                ></ha-selector>
              </div>
              <div class="form-field">
                <span class="form-label">${this._localize('dynamic_scene.audio_entity_label') || 'Audio sensor entity'}</span>
                <ha-selector
                  .hass=${this.hass}
                  .selector=${{
                    entity: {
                      domain: 'binary_sensor',
                    },
                  }}
                  .value=${this._audioEntity}
                  @value-changed=${this._handleAudioEntityChange}
                ></ha-selector>
              </div>
            </div>

            <!-- Row 2: Detection mode + Color advance -->
            <div class="form-row-pair">
              <div class="form-field">
                <span class="form-label">${this._localize('dynamic_scene.audio_detection_mode_label') || 'Detection mode'}</span>
                <ha-selector
                  .hass=${this.hass}
                  .selector=${{
                    select: {
                      options: this._audioDetectionModeOptions,
                      mode: 'dropdown',
                    },
                  }}
                  .value=${this._audioDetectionMode}
                  @value-changed=${this._handleAudioDetectionModeChange}
                ></ha-selector>
              </div>
              <div class="form-field">
                <span class="form-label">${this._localize('dynamic_scene.audio_color_advance_label') || 'Color advance'}</span>
                <ha-selector
                  .hass=${this.hass}
                  .selector=${{
                    select: {
                      options: this._audioColorAdvanceOptions,
                      mode: 'dropdown',
                    },
                  }}
                  .value=${this._audioColorAdvance}
                  @value-changed=${this._handleAudioColorAdvanceChange}
                ></ha-selector>
                <!--
                  v1.3.0: pro-tier mode tooltip removed because no currently-
                  visible mode has requires_pro=True (bass_kick and
                  freq_to_hue are hidden via MODE_REGISTRY's hidden flag).
                  Restore this block when the hidden modes are re-enabled —
                  see docs/plans/2026-04-27-descope-pro-dsp-features-for-v1.3.0.md.
                -->
              </div>
            </div>

            <!-- Row 3: Sensitivity + Transition speed -->
            <div class="timing-section">
              <div class="timing-field">
                <div class="timing-label">
                  <span class="form-label">${this._localize('dynamic_scene.audio_sensitivity_label') || 'Sensitivity'}</span>
                  <span class="timing-value">${this._audioSensitivity}%</span>
                </div>
                <ha-selector
                  .hass=${this.hass}
                  .selector=${{
                    number: {
                      min: 1,
                      max: 100,
                      mode: 'slider',
                      unit_of_measurement: '%',
                    },
                  }}
                  .value=${this._audioSensitivity}
                  @value-changed=${this._handleAudioSensitivityChange}
                ></ha-selector>
              </div>
              <div class="timing-field">
                <div class="timing-label">
                  <span class="form-label">${this._localize('dynamic_scene.audio_transition_speed_label') || 'Transition speed'}</span>
                  <span class="timing-value">${this._audioTransitionSpeed}%</span>
                </div>
                <ha-selector
                  .hass=${this.hass}
                  .disabled=${!(this._audioColorAdvance === 'on_onset' || this._audioColorAdvance === 'beat_predictive' || this._audioColorAdvance === 'onset_flash')}
                  .selector=${{
                    number: {
                      min: 1,
                      max: 100,
                      mode: 'slider',
                      unit_of_measurement: '%',
                    },
                  }}
                  .value=${this._audioTransitionSpeed}
                  @value-changed=${this._handleAudioTransitionSpeedChange}
                ></ha-selector>
              </div>
            </div>

            <!-- Row 4: Prediction aggressiveness + Latency compensation -->
            <div class="timing-section">
              <div class="timing-field">
                <div class="timing-label">
                  <span class="form-label">${this._localize('dynamic_scene.audio_prediction_aggressiveness_label') || 'Prediction aggressiveness'}</span>
                  <span class="timing-value">${this._audioPredictionAggressiveness}%</span>
                </div>
                <ha-selector
                  .hass=${this.hass}
                  .disabled=${this._audioColorAdvance !== 'beat_predictive'}
                  .selector=${{
                    number: {
                      min: 1,
                      max: 100,
                      mode: 'slider',
                      unit_of_measurement: '%',
                    },
                  }}
                  .value=${this._audioPredictionAggressiveness}
                  @value-changed=${this._handleAudioPredictionAggressivenessChange}
                ></ha-selector>
              </div>
              <div class="timing-field">
                <div class="timing-label">
                  <span class="form-label">${this._localize('dynamic_scene.audio_latency_compensation_label') || 'Latency compensation'}</span>
                  <span class="timing-value">${this._audioLatencyCompensationMs}ms</span>
                </div>
                <ha-selector
                  .hass=${this.hass}
                  .disabled=${this._audioColorAdvance !== 'beat_predictive'}
                  .selector=${{
                    number: {
                      min: 0,
                      max: 500,
                      mode: 'slider',
                      unit_of_measurement: 'ms',
                    },
                  }}
                  .value=${this._audioLatencyCompensationMs}
                  @value-changed=${this._handleAudioLatencyCompensationChange}
                ></ha-selector>
              </div>
            </div>

            <!-- Dropdowns: brightness curve and silence behavior -->
            <div class="audio-dropdowns-grid">
              <div class="form-section">
                <span class="form-label">${this._localize('dynamic_scene.audio_brightness_curve_label') || 'Brightness curve'}</span>
                <ha-selector
                  .hass=${this.hass}
                  .disabled=${!(this._audioColorAdvance === 'on_onset' || this._audioColorAdvance === 'continuous' || this._audioColorAdvance === 'beat_predictive')}
                  .selector=${{ select: { options: [
                    { value: 'disabled', label: this._localize('dynamic_scene.audio_brightness_curve_disabled') || 'Disabled' },
                    { value: 'linear', label: this._localize('dynamic_scene.audio_brightness_curve_linear') || 'Linear' },
                    { value: 'logarithmic', label: this._localize('dynamic_scene.audio_brightness_curve_logarithmic') || 'Logarithmic' },
                    { value: 'exponential', label: this._localize('dynamic_scene.audio_brightness_curve_exponential') || 'Exponential' },
                  ], mode: 'dropdown' } }}
                  .value=${this._audioBrightnessCurve ?? 'disabled'}
                  @value-changed=${this._handleAudioBrightnessCurveChange}
                ></ha-selector>
              </div>
              <div class="form-section">
                <span class="form-label">${this._localize('dynamic_scene.audio_silence_behavior_label') || 'Silence behavior'}</span>
                <ha-selector
                  .hass=${this.hass}
                  .selector=${{ select: { options: [
                    { value: 'hold', label: this._localize('dynamic_scene.audio_silence_hold') || 'Hold last color' },
                    { value: 'slow_cycle', label: this._localize('dynamic_scene.audio_silence_slow_cycle') || 'Slow cycle' },
                    { value: 'decay_min', label: this._localize('dynamic_scene.audio_silence_decay_min') || 'Decay to min' },
                    { value: 'decay_mid', label: this._localize('dynamic_scene.audio_silence_decay_mid') || 'Decay to mid' },
                  ], mode: 'dropdown' } }}
                  .value=${this._audioSilenceBehavior}
                  @value-changed=${this._handleAudioSilenceBehaviorChange}
                ></ha-selector>
              </div>
            </div>

            ${this._audioBrightnessCurve ? html`
            <div class="audio-sliders-row">
              <div class="form-section">
                <span class="form-label">${this._localize('dynamic_scene.audio_brightness_min_label') || 'Brightness min'}</span>
                <ha-selector
                  .hass=${this.hass}
                  .selector=${{ number: { min: 0, max: 100, mode: 'slider', unit_of_measurement: '%' } }}
                  .value=${this._audioBrightnessMin}
                  @value-changed=${this._handleAudioBrightnessMinChange}
                ></ha-selector>
              </div>
              <div class="form-section">
                <span class="form-label">${this._localize('dynamic_scene.audio_brightness_max_label') || 'Brightness max'}</span>
                <ha-selector
                  .hass=${this.hass}
                  .selector=${{ number: { min: 0, max: 100, mode: 'slider', unit_of_measurement: '%' } }}
                  .value=${this._audioBrightnessMax}
                  @value-changed=${this._handleAudioBrightnessMaxChange}
                ></ha-selector>
              </div>
            </div>
            ` : ''}

            <!-- Toggles: 3-per-row desktop, 2-per-row mobile -->
            <div class="audio-toggles-grid">
              <div class="form-section boolean-left">
                <span class="form-label">${this._localize('dynamic_scene.audio_frequency_zone_label') || 'Frequency zone'}</span>
                <ha-selector
                  .hass=${this.hass}
                  .selector=${{ boolean: {} }}
                  .value=${this._audioFrequencyZone}
                  @value-changed=${this._handleAudioFrequencyZoneChange}
                ></ha-selector>
              </div>
              <div class="form-section boolean-left">
                <span class="form-label">${this._localize('dynamic_scene.audio_color_by_frequency_label') || 'Color by frequency'}</span>
                <ha-selector
                  .hass=${this.hass}
                  .selector=${{ boolean: {} }}
                  .value=${this._audioColorByFrequency}
                  @value-changed=${this._handleAudioColorByFrequencyChange}
                ></ha-selector>
              </div>
              <div class="form-section boolean-left">
                <span class="form-label">${this._localize('dynamic_scene.audio_rolloff_brightness_label') || 'Rolloff brightness'}</span>
                <ha-selector
                  .hass=${this.hass}
                  .selector=${{ boolean: {} }}
                  .value=${this._audioRolloffBrightness}
                  @value-changed=${this._handleAudioRolloffBrightnessChange}
                ></ha-selector>
              </div>
            </div>

            <div class="preview-warning">
              <ha-icon icon="mdi:information-outline"></ha-icon>
              <span>${this._localize('dynamic_scene.audio_overrides_timing_note') || 'When audio reactive is enabled, transition time and hold time are controlled by the audio signal.'}</span>
            </div>
          ` : ''}
        </div>

        <!-- Color Picker Modal -->
        <ha-dialog
          .open=${this._editingColorIndex !== null && this._editingColor !== null}
          @closed=${this._closeColorPicker}
          .headerTitle=${this._localize('editors.color_picker_title')}
        >
          <span slot="headerNavigationIcon"></span>
          ${this._editingColor ? html`
            <div
              slot="headerActionItems"
              class="color-picker-modal-preview"
              style="background-color: ${xyToHex(this._editingColor, 255)}"
            ></div>
          ` : ''}
          ${this._editingColor ? html`
            <xy-color-picker
              .color=${this._editingColor}
              .size=${220}
              .showRgbInputs=${true}
              .translations=${this.translations}
              @color-changed=${this._handleColorPickerChange}
            ></xy-color-picker>
            <color-history-swatches
              .colorHistory=${this.colorHistory}
              .translations=${this.translations}
              @color-selected=${this._handleHistoryColorSelected}
            ></color-history-swatches>
          ` : ''}
          ${dialogActions(
            this._localize('editors.cancel_button'),
            this._localize('editors.apply_button'),
            () => this._closeColorPicker(),
            () => this._confirmColorPicker(),
            'mdi:check',
          )}
        </ha-dialog>

        <!-- Preview Warning -->
        ${!this.hasSelectedEntities ? html`
          <div class="preview-warning">
            <ha-icon icon="mdi:information"></ha-icon>
            <span>${this._localize('dynamic_scene.select_lights_for_preview') || 'Select light entities in the Activate tab to preview dynamic scenes on your devices.'}</span>
          </div>
        ` : ''}

        <!-- Form Actions -->
        <div class="form-actions">
          <div class="form-actions-left">
            <ha-button @click=${this._cancel}>${this._localize('editors.cancel_button')}</ha-button>
            ${this._hasUserInteraction ? html`
              <span class="unsaved-indicator">
                <span class="unsaved-dot"></span>
                ${this._localize('editors.unsaved_changes')}
              </span>
            ` : ''}
          </div>
          ${this.previewActive ? html`
            <ha-button @click=${this._stopPreview}>
              <ha-icon icon="mdi:stop"></ha-icon>
              <span class="btn-text">${this._localize('editors.stop_button')}</span>
            </ha-button>
          ` : html`
            <ha-button
              @click=${this._preview}
              .disabled=${this._previewing || this._colors.length === 0 || !this.hasSelectedEntities || !this.isCompatible}
              title=${!this.hasSelectedEntities ? this._localize('editors.tooltip_select_lights_first') : !this.isCompatible ? this._localize('editors.tooltip_light_not_compatible') : ''}
            >
              <ha-icon icon="mdi:play"></ha-icon>
              <span class="btn-text">${this._localize('editors.preview_button')}</span>
            </ha-button>
          `}
          <ha-button
            @click=${this._save}
            .disabled=${!this._name.trim() || this._colors.length === 0 || this._saving}
          >
            <ha-icon icon="mdi:content-save"></ha-icon>
            <span class="btn-text">${this.editMode ? this._localize('editors.update_button') : this._localize('editors.save_button')}</span>
          </ha-button>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'dynamic-scene-editor': DynamicSceneEditor;
  }
}
