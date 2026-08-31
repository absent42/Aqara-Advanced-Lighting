import { LitElement, html, css, PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { HomeAssistant, SegmentSequenceStep, XYColor, UserSegmentSequencePreset, DeviceContext, SegmentSequenceEditorDraft, Translations } from './types';
import { xyToRgb, rgbToXy } from './color-utils';
import { colorPickerStyles } from './styles/color-picker';
import { ReorderableStepsMixin, reorderableStepStyles } from './reorderable-steps-mixin';
import { DEVICE_LABELS, DEFAULT_PALETTE, DEFAULT_GRADIENT_COLORS, DEFAULT_BLOCK_COLORS, editorFormStyles, localize, loopModeOptions, endBehaviorOptions } from './editor-constants';
import { adoptThumbnail, discardUnsaved } from './thumbnail-lifecycle';

interface EditableStep extends SegmentSequenceStep {
  id: string;
  // Color management for segment-selector component
  coloredSegments: Map<number, XYColor>;  // The actual colored segments
  colorPalette: XYColor[];  // Palette for individual mode
  gradientColors: XYColor[];  // Colors for gradient mode
  blockColors: XYColor[];  // Colors for blocks mode
  expandBlocks: boolean;  // Block expansion toggle
  patternMode: string;  // 'individual' | 'gradient' | 'blocks'
  gradientMirror: boolean;
  gradientRepeat: number;
  gradientReverse: boolean;
  gradientInterpolation: string;
  gradientWave: boolean;
  gradientWaveCycles: number;
  turnOffUnspecified: boolean;
}

@customElement('segment-sequence-editor')
export class SegmentSequenceEditor extends ReorderableStepsMixin(LitElement) {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property({ type: Object }) public preset?: UserSegmentSequencePreset;
  @property({ type: Object }) public translations: Translations = {};
  @property({ type: Boolean }) public editMode = false;
  @property({ type: Boolean }) public hasSelectedEntities = false;
  @property({ type: Boolean }) public isCompatible = true;
  @property({ type: Boolean }) public previewActive = false;
  @property({ type: Number }) public stripSegmentCount = 10; // Default 2 meters (out-of-box T1 Strip length)
  @property({ type: Object }) public deviceContext?: DeviceContext;
  @property({ type: Array }) public colorHistory: XYColor[] = [];
  @property({ type: Object }) public draft?: SegmentSequenceEditorDraft;

  @state() private _name = '';
  @state() private _icon = '';
  @state() private _deviceType = 't1m';
  @state() protected _steps: EditableStep[] = [];
  @state() private _loopMode = 'once';
  @state() private _loopCount = 3;
  @state() private _endBehavior = 'maintain';
  @state() private _clearSegments = false;
  @state() private _skipFirstInLoop = false;
  @state() private _saving = false;
  @state() private _previewing = false;
  @state() private _hasUserInteraction = false;
  @state() private _thumbnail?: string;

  // Note: Color picker modal is now handled by segment-selector component
  // No need for local color picker state

  private _cachedLoopModeOptions: { value: string; label: string }[] = [];
  private _cachedEndBehaviorOptions: { value: string; label: string }[] = [];
  private _cachedActivationPatternOptions: { value: string; label: string }[] = [];

  protected willUpdate(changedProps: PropertyValues): void {
    if (changedProps.has('translations')) {
      const loc = (k: string) => this._localize(k);
      this._cachedLoopModeOptions = loopModeOptions(loc);
      this._cachedEndBehaviorOptions = endBehaviorOptions(loc);
      this._cachedActivationPatternOptions = [
        { value: 'all', label: loc('options.activation_all') },
        { value: 'sequential_forward', label: loc('options.activation_sequential_forward') },
        { value: 'sequential_reverse', label: loc('options.activation_sequential_reverse') },
        { value: 'random', label: loc('options.activation_random') },
        { value: 'ping_pong', label: loc('options.activation_ping_pong') },
        { value: 'center_out', label: loc('options.activation_center_out') },
        { value: 'edges_in', label: loc('options.activation_edges_in') },
        { value: 'paired', label: loc('options.activation_paired') },
      ];
    }
  }

  private get _loopModeOptions() { return this._cachedLoopModeOptions; }
  private get _endBehaviorOptions() { return this._cachedEndBehaviorOptions; }
  private get _activationPatternOptions() { return this._cachedActivationPatternOptions; }

  static styles = [
    colorPickerStyles,
    reorderableStepStyles,
    editorFormStyles,
    css`
    .form-section.toggle-row {
      flex-direction: row;
      gap: 24px;
      flex-wrap: wrap;
    }

    .toggle-item {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .toggle-label {
      font-size: 14px;
      color: var(--secondary-text-color);
    }

    .step-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .step-item {
      background: var(--card-background-color);
      border: 1px solid var(--divider-color);
      border-radius: 8px;
      padding: 16px;
    }

    .step-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
    }

    .step-number {
      flex: 1;
      font-weight: 600;
      font-size: 14px;
      color: var(--primary-color);
    }

    .step-actions {
      display: flex;
      gap: 4px;
    }

    .step-actions ha-icon-button {
      --ha-icon-button-size: 32px;
      --mdc-icon-button-size: 32px;
      --mdc-icon-size: 18px;
    }

    .step-actions .step-delete {
      color: var(--secondary-text-color);
      transition: color 0.2s ease;
    }

    .step-actions .step-delete:hover:not([disabled]) {
      color: var(--error-color);
    }

    .step-segment-selector {
      width: 100%;
      margin-bottom: 16px;
    }

    .step-fields {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 12px;
    }

    .step-field {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .step-field-label {
      font-size: 12px;
      color: var(--secondary-text-color);
    }

    .step-field.full-width {
      grid-column: 1 / -1;
    }

    /* Color picker styles (color-picker-grid, color-item, color-swatch,
       color-picker-modal, color-remove, add-color-btn) are inherited
       from colorPickerStyles (styles.ts) */

    .add-step-btn {
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

    .add-step-btn:hover {
      border-color: var(--primary-color);
      color: var(--primary-color);
      background: var(--secondary-background-color);
    }

    .add-step-btn.disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .error-warning {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      background: var(--secondary-background-color);
      color: var(--secondary-text-color);
      border: 1px solid var(--divider-color);
      border-left: 4px solid var(--error-color, #db4437);
      border-radius: 4px;
      font-size: 13px;
    }

    .error-warning ha-icon {
      flex-shrink: 0;
      --mdc-icon-size: 18px;
    }

    .empty-steps {
      text-align: center;
      padding: 40px 20px;
      color: var(--secondary-text-color);
      background: var(--card-background-color);
      border-radius: 8px;
      border: 2px dashed var(--divider-color);
    }

    @media (max-width: 600px) {
      .step-fields {
        grid-template-columns: 1fr;
      }
    }

    .form-hint {
      font-size: var(--ha-font-size-s, 12px);
      color: var(--secondary-text-color);
      margin-top: -4px;
    }
  `];

  connectedCallback(): void {
    super.connectedCallback();
    if (this._steps.length === 0 && !this.preset) {
      this._addDefaultStep();
    }
  }

  protected updated(changedProps: PropertyValues): void {
    super.updated(changedProps);

    // Draft takes priority over preset (contains user's unsaved edits)
    if (changedProps.has('draft') && this.draft) {
      this._restoreDraft(this.draft);
    } else if (changedProps.has('preset')) {
      if (this.preset) {
        this._hasUserInteraction = true;
        this._loadPreset(this.preset);
      } else {
        this._hasUserInteraction = false;
      }
    }

    // Auto-set device type from context when no user interaction has occurred
    if (
      changedProps.has('deviceContext') &&
      !this._hasUserInteraction &&
      this.deviceContext?.deviceType
    ) {
      this._deviceType = this.deviceContext.deviceType;
    }
  }

  /**
   * Get the current segment count based on device type.
   * T1: 20 segments (fixed)
   * T1M: 26 segments (fixed)
   * T1 Strip: Dynamic based on stripSegmentCount from parent (defaults to 10)
   */
  private _getCurrentSegmentCount(): number {
    switch (this._deviceType) {
      case 't1':
        return 20;
      case 't1m':
        return 26;
      case 't1_strip':
        return this.stripSegmentCount; // Use value from parent (dynamic or default 10)
      default:
        return 26;
    }
  }

  private _loadPreset(preset: UserSegmentSequencePreset): void {
    this._name = preset.name;
    this._icon = preset.icon || '';
    this._thumbnail = preset.thumbnail;
    this._deviceType = preset.device_type || 't1m';
    this._loopMode = preset.loop_mode;
    this._loopCount = preset.loop_count || 3;
    this._endBehavior = preset.end_behavior;
    this._clearSegments = preset.clear_segments || false;
    this._skipFirstInLoop = preset.skip_first_in_loop || false;
    this._steps = preset.steps.map((step, index) => {
      // Convert RGB arrays from preset to XY colors for colored segments
      const xyColors = step.colors.map((c) => {
        const rgb = { r: c[0] ?? 0, g: c[1] ?? 0, b: c[2] ?? 0 };
        return rgbToXy(rgb.r, rgb.g, rgb.b);
      });

      // Determine pattern mode from step.mode (map backend modes to frontend pattern modes)
      let patternMode = 'individual';  // default
      if (step.mode === 'gradient') {
        patternMode = 'gradient';
      } else if (step.mode === 'blocks_expand' || step.mode === 'blocks_repeat') {
        patternMode = 'blocks';
      } else if (step.mode === 'individual') {
        patternMode = 'individual';
      }

      // Populate coloredSegments from preset data (similar to pattern-editor)
      // Skip black (0,0,0) entries -- these represent "off/unspecified" segments
      // that were added during save to turn off segments on the hardware.
      // rgbToXy(0,0,0) returns the D65 white point, so loading them would
      // incorrectly show those segments as white in the editor.
      const coloredSegments = new Map<number, XYColor>();
      if (step.segment_colors && Array.isArray(step.segment_colors)) {
        for (const entry of step.segment_colors) {
          const segNum = typeof entry.segment === 'number' ? entry.segment : parseInt(entry.segment, 10);
          const color = entry.color;
          if ('r' in color && 'g' in color && 'b' in color) {
            if (color.r === 0 && color.g === 0 && color.b === 0) continue;
            coloredSegments.set(segNum - 1, rgbToXy(color.r, color.g, color.b));
          }
        }
      }

      return {
        ...step,
        id: `step-${index}-${Date.now()}`,
        coloredSegments,  // Now properly populated from preset data
        colorPalette: [...DEFAULT_PALETTE],
        gradientColors: xyColors.length >= 2 ? xyColors : [...DEFAULT_GRADIENT_COLORS],
        blockColors: xyColors.length >= 1 ? xyColors : [...DEFAULT_BLOCK_COLORS],
        expandBlocks: step.mode === 'blocks_expand',
        patternMode,
        gradientMirror: false,
        gradientRepeat: 1,
        gradientReverse: false,
        gradientInterpolation: 'shortest',
        gradientWave: false,
        gradientWaveCycles: 1,
        turnOffUnspecified: true,
      };
    });
  }

  public getDraftState(): SegmentSequenceEditorDraft {
    return {
      name: this._name,
      icon: this._icon,
      deviceType: this._deviceType,
      steps: this._steps.map(s => ({
        id: s.id,
        duration: s.duration,
        hold: s.hold,
        activation_pattern: s.activation_pattern,
        transition: s.transition,
        coloredSegments: Array.from(s.coloredSegments.entries()),
        colorPalette: [...s.colorPalette],
        gradientColors: [...s.gradientColors],
        blockColors: [...s.blockColors],
        expandBlocks: s.expandBlocks,
        patternMode: s.patternMode,
        gradientMirror: s.gradientMirror,
        gradientRepeat: s.gradientRepeat,
        gradientReverse: s.gradientReverse,
        gradientInterpolation: s.gradientInterpolation,
        gradientWave: s.gradientWave,
        gradientWaveCycles: s.gradientWaveCycles,
        turnOffUnspecified: s.turnOffUnspecified,
      })),
      loopMode: this._loopMode,
      loopCount: this._loopCount,
      endBehavior: this._endBehavior,
      clearSegments: this._clearSegments,
      skipFirstInLoop: this._skipFirstInLoop,
      hasUserInteraction: this._hasUserInteraction,
      thumbnail: this._thumbnail,
    };
  }

  public resetToDefaults(): void {
    // Drop any thumbnail extracted but never persisted. The DELETE endpoint is
    // idempotent and only evicts in-memory pending entries, so it is safe when
    // _cancel() has already discarded the same id on the way here.
    discardUnsaved(this.hass, this._thumbnail, this.preset?.thumbnail);
    this._name = '';
    this._icon = '';
    this._deviceType = 't1m';
    this._loopMode = 'once';
    this._loopCount = 3;
    this._endBehavior = 'maintain';
    this._clearSegments = false;
    this._skipFirstInLoop = false;
    this._hasUserInteraction = false;
    this._thumbnail = undefined;
    this._addDefaultStep();
  }

  private _restoreDraft(draft: SegmentSequenceEditorDraft): void {
    this._name = draft.name;
    this._icon = draft.icon;
    this._deviceType = draft.deviceType;
    this._loopMode = draft.loopMode;
    this._loopCount = draft.loopCount;
    this._endBehavior = draft.endBehavior;
    this._clearSegments = draft.clearSegments;
    this._skipFirstInLoop = draft.skipFirstInLoop;
    this._steps = draft.steps.map(s => ({
      // Provide default values for SegmentSequenceStep legacy fields
      segments: 'all',
      colors: [[255, 0, 0]],
      mode: s.patternMode === 'gradient' ? 'gradient' : s.expandBlocks ? 'blocks_expand' : 'blocks_repeat',
      duration: s.duration,
      hold: s.hold,
      activation_pattern: s.activation_pattern,
      transition: s.transition,
      // Restore editor-specific fields
      id: s.id,
      coloredSegments: new Map(s.coloredSegments),
      colorPalette: [...s.colorPalette],
      gradientColors: [...s.gradientColors],
      blockColors: [...s.blockColors],
      expandBlocks: s.expandBlocks,
      patternMode: s.patternMode,
      gradientMirror: s.gradientMirror,
      gradientRepeat: s.gradientRepeat,
      gradientReverse: s.gradientReverse,
      gradientInterpolation: s.gradientInterpolation,
      gradientWave: s.gradientWave,
      gradientWaveCycles: s.gradientWaveCycles,
      turnOffUnspecified: s.turnOffUnspecified,
    }));
    this._hasUserInteraction = draft.hasUserInteraction ?? false;
    this._thumbnail = draft.thumbnail;
  }

  private _handleExtractedThumbnail(e: CustomEvent<{ thumbnailId: string }>): void {
    this._thumbnail = adoptThumbnail(
      this.hass, this._thumbnail, e.detail.thumbnailId, this.preset?.thumbnail,
    );
    this._hasUserInteraction = true;
  }

  private _addDefaultStep(): void {
    this._steps = [
      {
        id: `step-0-${Date.now()}`,
        segments: 'all',  // Default to all segments
        colors: [[255, 0, 0]],
        mode: 'blocks_expand',  // Backend still uses mode field
        duration: 15,
        hold: 60,
        activation_pattern: 'all',
        // New segment-selector fields
        coloredSegments: new Map(),
        colorPalette: [...DEFAULT_PALETTE],
        gradientColors: [...DEFAULT_GRADIENT_COLORS],
        blockColors: [...DEFAULT_BLOCK_COLORS],
        expandBlocks: false,
        patternMode: 'individual',
        gradientMirror: false,
        gradientRepeat: 1,
        gradientReverse: false,
        gradientInterpolation: 'shortest',
        gradientWave: false,
        gradientWaveCycles: 1,
        turnOffUnspecified: true,
      },
    ];
  }

  private _generateStepId(): string {
    return `step-${this._steps.length}-${Date.now()}`;
  }

  private _handleNameChange(e: CustomEvent): void {
    this._name = e.detail.value || '';
    this._hasUserInteraction = true;
  }

  private _handleIconChange(e: CustomEvent): void {
    this._icon = e.detail.value || '';
    this._hasUserInteraction = true;
  }

  private _handleDeviceTypeChange(e: CustomEvent): void {
    this._deviceType = e.detail.value || 't1m';
    this._hasUserInteraction = true;
  }

  private _handleLoopModeChange(e: CustomEvent): void {
    this._loopMode = e.detail.value || 'once';
    this._hasUserInteraction = true;
  }

  private _handleLoopCountChange(e: CustomEvent): void {
    this._loopCount = e.detail.value ?? 3;
    this._hasUserInteraction = true;
  }

  private _handleEndBehaviorChange(e: CustomEvent): void {
    this._endBehavior = e.detail.value || 'maintain';
    this._hasUserInteraction = true;
  }

  private _handleClearSegmentsChange(e: Event): void {
    this._clearSegments = (e.target as HTMLInputElement).checked;
    this._hasUserInteraction = true;
  }

  private _handleSkipFirstInLoopChange(e: Event): void {
    this._skipFirstInLoop = (e.target as HTMLInputElement).checked;
    this._hasUserInteraction = true;
  }

  private _hasInvalidGradientSteps(): boolean {
    // Check if any steps use gradient mode with less than 2 colors
    return this._steps.some((step) => step.patternMode === 'gradient' && step.gradientColors.length < 2);
  }

  private _handleStepFieldChange(stepId: string, field: string, e: CustomEvent): void {
    this._steps = this._steps.map((step) =>
      step.id === stepId ? { ...step, [field]: e.detail.value } : step
    );
    this._hasUserInteraction = true;
  }

  // Note: Color picker and color management methods removed - now handled by segment-selector component

  private _handleStepColorValueChange(stepId: string, e: CustomEvent): void {
    // Handle color-value-changed event from segment-selector (individual mode)
    const { value } = e.detail;

    this._steps = this._steps.map((step) => {
      if (step.id !== stepId) return step;

      if (value instanceof Map) {
        // Build segments string from Map keys (sorted)
        const segmentNumbers = Array.from(value.keys()).sort((a, b) => a - b);

        // Convert from 0-based internal indexing to 1-based backend indexing
        // If no segments are colored, default to 'all' to avoid backend parsing errors
        const segmentsValue = segmentNumbers.length > 0
          ? segmentNumbers.map(n => n + 1).join(',')
          : 'all';

        // Update step with grid data
        // Note: We don't update the colors array here because segment_colors
        // will be sent to the backend directly from the grid data.
        // The old colors array would contain one color per segment, which is
        // incorrect for blocks/gradient patterns and can cause issues if the
        // backend falls back to legacy mode.
        return {
          ...step,
          coloredSegments: value,
          segments: segmentsValue,
        };
      }

      return step;
    });
    this._hasUserInteraction = true;
  }

  private _handleStepGradientColorsChange(stepId: string, e: CustomEvent): void {
    const { colors } = e.detail;
    if (!Array.isArray(colors)) return;

    this._steps = this._steps.map((step) =>
      step.id === stepId ? { ...step, gradientColors: colors } : step
    );
    this._hasUserInteraction = true;
  }

  private _handleStepBlockColorsChange(stepId: string, e: CustomEvent): void {
    const { colors } = e.detail;
    if (!Array.isArray(colors)) return;

    this._steps = this._steps.map((step) =>
      step.id === stepId ? { ...step, blockColors: colors } : step
    );
    this._hasUserInteraction = true;
  }

  private _handleStepColorPaletteChange(stepId: string, e: CustomEvent): void {
    const { colors } = e.detail;
    if (!Array.isArray(colors)) return;

    this._steps = this._steps.map((step) =>
      step.id === stepId ? { ...step, colorPalette: colors } : step
    );
    this._hasUserInteraction = true;
  }

  private _handleStepTurnOffUnspecifiedChange(stepId: string, e: CustomEvent): void {
    this._steps = this._steps.map((step) =>
      step.id === stepId ? { ...step, turnOffUnspecified: e.detail.value } : step
    );
    this._hasUserInteraction = true;
  }

  private _addStep(): void {
    if (this._steps.length >= 20) return;

    // Get previous step to copy its settings
    const previousStep = this._steps[this._steps.length - 1];

    const newStep: EditableStep = {
      id: this._generateStepId(),
      segments: previousStep?.segments || 'all',  // Copy segments from previous step
      colors: previousStep?.colors?.map((c) => Array.isArray(c) ? [...c] : c) || [[255, 0, 0]],
      mode: previousStep?.mode || 'blocks_expand',
      duration: previousStep?.duration ?? 15,
      hold: previousStep?.hold ?? 60,
      activation_pattern: previousStep?.activation_pattern ?? 'all',
      // Copy segment-selector fields from previous step
      coloredSegments: previousStep ? new Map(previousStep.coloredSegments) : new Map(),
      colorPalette: previousStep ? previousStep.colorPalette.map((c) => ({ ...c })) : [...DEFAULT_PALETTE],
      gradientColors: previousStep ? previousStep.gradientColors.map((c) => ({ ...c })) : [...DEFAULT_GRADIENT_COLORS],
      blockColors: previousStep ? previousStep.blockColors.map((c) => ({ ...c })) : [...DEFAULT_BLOCK_COLORS],
      expandBlocks: previousStep?.expandBlocks || false,
      patternMode: previousStep?.patternMode || 'individual',
      gradientMirror: previousStep?.gradientMirror || false,
      gradientRepeat: previousStep?.gradientRepeat || 1,
      gradientReverse: previousStep?.gradientReverse || false,
      gradientInterpolation: previousStep?.gradientInterpolation || 'shortest',
      gradientWave: previousStep?.gradientWave || false,
      gradientWaveCycles: previousStep?.gradientWaveCycles || 1,
      turnOffUnspecified: previousStep?.turnOffUnspecified ?? true,
    };

    this._steps = [...this._steps, newStep];
    this._hasUserInteraction = true;
  }

  private _removeStep(stepId: string): void {
    if (this._steps.length <= 1) return;
    this._steps = this._steps.filter((s) => s.id !== stepId);
    this._hasUserInteraction = true;
  }

  private _moveStepUp(index: number): void {
    if (index <= 0) return;
    const newSteps = [...this._steps];
    const temp = newSteps[index - 1]!;
    newSteps[index - 1] = newSteps[index]!;
    newSteps[index] = temp;
    this._steps = newSteps;
    this._hasUserInteraction = true;
  }

  private _moveStepDown(index: number): void {
    if (index >= this._steps.length - 1) return;
    const newSteps = [...this._steps];
    const temp = newSteps[index]!;
    newSteps[index] = newSteps[index + 1]!;
    newSteps[index + 1] = temp;
    this._steps = newSteps;
    this._hasUserInteraction = true;
  }

  private _duplicateStep(step: EditableStep): void {
    if (this._steps.length >= 20) return;

    const newStep: EditableStep = {
      ...step,
      id: this._generateStepId(),
      colors: step.colors?.map((c) => Array.isArray(c) ? [...c] : c) || [[255, 0, 0]],
      // Deep copy Map and arrays for new step
      coloredSegments: new Map(step.coloredSegments),
      colorPalette: step.colorPalette.map((c) => ({ ...c })),
      gradientColors: step.gradientColors.map((c) => ({ ...c })),
      blockColors: step.blockColors.map((c) => ({ ...c })),
    };

    const index = this._steps.findIndex((s) => s.id === step.id);
    const newSteps = [...this._steps];
    newSteps.splice(index + 1, 0, newStep);
    this._steps = newSteps;
    this._hasUserInteraction = true;
  }


  private _getPresetData(): Record<string, unknown> {
    const maxSegments = this._getCurrentSegmentCount();

    const steps = this._steps.map(({
      id,
      coloredSegments,
      colorPalette,
      gradientColors,
      blockColors,
      expandBlocks,
      patternMode,
      gradientMirror,
      gradientRepeat,
      gradientReverse,
      gradientInterpolation,
      gradientWave,
      gradientWaveCycles,
      turnOffUnspecified,
      ...step
    }) => {
      // Generate segment_colors from the grid (like pattern editor)
      // Convert from 0-based internal indexing to 1-based backend indexing
      const segment_colors: Array<{segment: number, color: {r: number, g: number, b: number}}> = [];
      const specifiedSegments = new Set<number>();

      for (const [segment, xyColor] of coloredSegments) {
        const rgb = xyToRgb(xyColor.x, xyColor.y, 255);
        segment_colors.push({ segment: segment + 1, color: { r: rgb.r, g: rgb.g, b: rgb.b } });
        specifiedSegments.add(segment + 1);
      }

      // Turn off unspecified segments by setting them to black (if enabled)
      if (turnOffUnspecified) {
        for (let seg = 1; seg <= maxSegments; seg++) {
          if (!specifiedSegments.has(seg)) {
            segment_colors.push({ segment: seg, color: { r: 0, g: 0, b: 0 } });
          }
        }
      }

      return {
        ...step,
        segment_colors,  // Send actual colored segments from grid
      };
    });

    const data: Record<string, unknown> = {
      name: this._name,
      icon: this._icon || undefined,
      device_type: this._deviceType,
      steps,
      loop_mode: this._loopMode,
      end_behavior: this._endBehavior,
      clear_segments: this._clearSegments,
      skip_first_in_loop: this._skipFirstInLoop,
      thumbnail: this._thumbnail || undefined,
    };

    if (this._loopMode === 'count') {
      data.loop_count = this._loopCount;
    }

    return data;
  }

  // Note: _colorToHex removed - no longer needed with segment-selector

  private async _preview(): Promise<void> {
    if (!this.hass || this._previewing) return;

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
    if (!this._name.trim() || this._steps.length === 0) return;

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

  private _renderStep(step: EditableStep, index: number) {
    return html`
      <div class="step-item">
        <div class="step-header">
          ${this._renderDragHandle(index)}
          <span class="step-number">Step ${index + 1}</span>
          <div class="step-actions">
            <ha-icon-button
              @click=${() => this._moveStepUp(index)}
              .disabled=${index === 0}
              title="${this._localize('tooltips.step_move_up')}"
            >
              <ha-icon icon="mdi:arrow-up"></ha-icon>
            </ha-icon-button>
            <ha-icon-button
              @click=${() => this._moveStepDown(index)}
              .disabled=${index === this._steps.length - 1}
              title="${this._localize('tooltips.step_move_down')}"
            >
              <ha-icon icon="mdi:arrow-down"></ha-icon>
            </ha-icon-button>
            <ha-icon-button
              @click=${() => this._duplicateStep(step)}
              .disabled=${this._steps.length >= 20}
              title="${this._localize('tooltips.step_duplicate')}"
            >
              <ha-icon icon="mdi:content-copy"></ha-icon>
            </ha-icon-button>
            <ha-icon-button
              class="step-delete"
              @click=${() => this._removeStep(step.id)}
              .disabled=${this._steps.length <= 1}
              title="${this._localize('tooltips.step_remove')}"
            >
              <ha-icon icon="mdi:delete"></ha-icon>
            </ha-icon-button>
          </div>
        </div>
        <div class="step-segment-selector">
          <segment-selector
            .hass=${this.hass}
            .mode=${'color'}
            .maxSegments=${this._getCurrentSegmentCount()}
            .colorValue=${step.coloredSegments}
            .colorPalette=${step.colorPalette}
            .gradientColors=${step.gradientColors}
            .blockColors=${step.blockColors}
            .expandBlocks=${step.expandBlocks}
            .gradientMirror=${step.gradientMirror}
            .gradientRepeat=${step.gradientRepeat}
            .gradientReverse=${step.gradientReverse}
            .gradientInterpolation=${step.gradientInterpolation}
            .gradientWave=${step.gradientWave}
            .gradientWaveCycles=${step.gradientWaveCycles}
            .initialPatternMode=${step.patternMode}
            .label=${this._localize('editors.segment_grid_label')}
            .translations=${this.translations}
            .colorHistory=${this.colorHistory}
            .zones=${this.deviceContext?.zones || []}
            .turnOffUnspecified=${step.turnOffUnspecified}
            .enableImageExtraction=${true}
            @extracted-thumbnail=${this._handleExtractedThumbnail}
            @color-value-changed=${(e: CustomEvent) => this._handleStepColorValueChange(step.id, e)}
            @color-palette-changed=${(e: CustomEvent) => this._handleStepColorPaletteChange(step.id, e)}
            @gradient-colors-changed=${(e: CustomEvent) => this._handleStepGradientColorsChange(step.id, e)}
            @block-colors-changed=${(e: CustomEvent) => this._handleStepBlockColorsChange(step.id, e)}
            @turn-off-unspecified-changed=${(e: CustomEvent) => this._handleStepTurnOffUnspecifiedChange(step.id, e)}
          ></segment-selector>
        </div>
        <div class="step-fields">
          <div class="step-field">
            <span class="step-field-label">${this._localize('editors.activation_pattern_label')}</span>
            <ha-selector
              .hass=${this.hass}
              .selector=${{
                select: {
                  options: this._activationPatternOptions,
                  mode: 'dropdown',
                },
              }}
              .value=${step.activation_pattern}
              @value-changed=${(e: CustomEvent) => this._handleStepFieldChange(step.id, 'activation_pattern', e)}
            ></ha-selector>
          </div>
          <div class="step-field">
            <span class="step-field-label">${this._localize('editors.duration_label')}</span>
            <ha-selector
              .hass=${this.hass}
              .selector=${{
                number: {
                  min: 0,
                  max: 3600,
                  step: 0.5,
                  mode: 'box',
                  unit_of_measurement: 's',
                },
              }}
              .value=${step.duration}
              @value-changed=${(e: CustomEvent) => this._handleStepFieldChange(step.id, 'duration', e)}
            ></ha-selector>
          </div>
          <div class="step-field">
            <span class="step-field-label">${this._localize('editors.hold_time_label')}</span>
            <ha-selector
              .hass=${this.hass}
              .selector=${{
                number: {
                  min: 0,
                  max: 43200,
                  step: 1,
                  mode: 'box',
                  unit_of_measurement: 's',
                },
              }}
              .value=${step.hold}
              @value-changed=${(e: CustomEvent) => this._handleStepFieldChange(step.id, 'hold', e)}
            ></ha-selector>
          </div>
        </div>
      </div>
    `;
  }

  private _localize(key: string, replacements?: Record<string, string>): string {
    return localize(this.translations, key, replacements);
  }

  protected render() {
    const deviceOptions = Object.entries(DEVICE_LABELS).map(([value, label]) => ({
      value,
      label,
    }));

    return html`
      <div class="editor-content">
        <div class="form-row-triple">
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
          <div class="form-field">
            <span class="form-label">${this._localize('editors.device_type_label')}</span>
            <ha-selector
              .hass=${this.hass}
              .selector=${{
                select: {
                  options: deviceOptions,
                  mode: 'dropdown',
                },
              }}
              .value=${this._deviceType}
              @value-changed=${this._handleDeviceTypeChange}
            ></ha-selector>
          </div>
        </div>

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
              @value-changed=${this._handleEndBehaviorChange}
            ></ha-selector>
          </div>
        </div>

        ${this._loopMode === 'count'
          ? html`
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
                    @value-changed=${this._handleLoopCountChange}
                  ></ha-selector>
                </div>
              </div>
            `
          : ''}

        <div class="form-section toggle-row">
          <div class="toggle-item">
            <span class="toggle-label">${this._localize('editors.clear_segments_label')}</span>
            <ha-switch
              .checked=${this._clearSegments}
              @change=${this._handleClearSegmentsChange}
            ></ha-switch>
          </div>
          <div class="toggle-item">
            <span class="toggle-label">${this._localize('editors.skip_first_step_label')}</span>
            <ha-switch
              .checked=${this._skipFirstInLoop}
              @change=${this._handleSkipFirstInLoopChange}
            ></ha-switch>
          </div>
        </div>

        <div class="form-section">
          <span class="form-label">${this._localize('editors.steps_label')}</span>
          <div class="step-list">
            ${this._steps.length === 0
              ? html`
                  <div class="empty-steps">
                    ${this._localize('editors.no_steps_message')}
                  </div>
                `
              : this._steps.map((step, index) => html`
                  ${this._renderDropIndicator(index)}
                  ${this._renderStep(step, index)}
                `)}
            ${this._renderDropIndicator(this._steps.length)}

            <button
              class="add-step-btn ${this._steps.length >= 20 ? 'disabled' : ''}"
              @click=${this._addStep}
              ?disabled=${this._steps.length >= 20}
            >
              <ha-icon icon="mdi:plus"></ha-icon>
              ${this._localize('editors.add_step_button')}
            </button>
          </div>
        </div>

        ${this._hasInvalidGradientSteps()
          ? html`
              <div class="error-warning">
                <ha-icon icon="mdi:alert-circle"></ha-icon>
                <span>${this._localize('editors.gradient_min_colors_error')}</span>
              </div>
            `
          : ''}

        ${!this.hasSelectedEntities
          ? html`
              <div class="preview-warning">
                <ha-icon icon="mdi:information"></ha-icon>
                <span>${this._localize('editors.select_lights_for_preview_sequences')}</span>
              </div>
            `
          : ''}

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
          ${this.previewActive
            ? html`
                <ha-button @click=${this._stopPreview}>
                  <ha-icon icon="mdi:stop"></ha-icon>
                  <span class="btn-text">${this._localize('editors.stop_button')}</span>
                </ha-button>
              `
            : html`
                <ha-button
                  @click=${this._preview}
                  .disabled=${this._previewing || this._steps.length === 0 || !this.hasSelectedEntities || !this.isCompatible || this._hasInvalidGradientSteps()}
                  title=${!this.hasSelectedEntities ? this._localize('editors.tooltip_select_lights_first') : !this.isCompatible ? this._localize('editors.tooltip_light_not_compatible') : this._hasInvalidGradientSteps() ? this._localize('editors.tooltip_fix_gradient_errors') : ''}
                >
                  <ha-icon icon="mdi:play"></ha-icon>
                  <span class="btn-text">${this._localize('editors.preview_button')}</span>
                </ha-button>
              `}
          <ha-button
            @click=${this._save}
            .disabled=${!this._name.trim() || this._steps.length === 0 || this._saving || this._hasInvalidGradientSteps()}
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
    'segment-sequence-editor': SegmentSequenceEditor;
  }
}
