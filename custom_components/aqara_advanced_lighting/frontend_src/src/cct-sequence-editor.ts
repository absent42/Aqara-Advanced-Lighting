import { LitElement, html, css, PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { HomeAssistant, CCTSequenceStep, ScheduleStep, UserCCTSequencePreset, DeviceContext, CCTEditorDraft, Translations } from './types';
import { ReorderableStepsMixin, reorderableStepStyles } from './reorderable-steps-mixin';
import { editorFormStyles, localize, loopModeOptions, endBehaviorOptions, renderInput } from './editor-constants';

interface EditableStep extends CCTSequenceStep {
  id: string;
}

interface EditableSolarStep {
  id: string;
  sun_elevation: number;
  color_temp: number;
  brightness: number;
  phase: 'rising' | 'setting' | 'any';
}

interface EditableScheduleStep {
  id: string;
  time: string;
  color_temp: number;
  brightness: number;
  label: string;
}

@customElement('cct-sequence-editor')
export class CCTSequenceEditor extends ReorderableStepsMixin(LitElement) {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property({ type: Object }) public preset?: UserCCTSequencePreset;
  @property({ type: Object }) public translations: Translations = {};
  @property({ type: Boolean }) public editMode = false;
  @property({ type: Boolean }) public hasSelectedEntities = false;
  @property({ type: Boolean }) public isCompatible = true;
  @property({ type: Array }) public selectedEntities: string[] = [];
  @property({ type: Boolean }) public previewActive = false;
  @property({ type: Object }) public deviceContext?: DeviceContext;
  @property({ type: Object }) public draft?: CCTEditorDraft;

  @state() private _name = '';
  @state() private _icon = '';
  @state() protected _steps: EditableStep[] = [];
  @state() private _loopMode = 'once';
  @state() private _loopCount = 3;
  @state() private _endBehavior = 'maintain';
  @state() private _skipFirstInLoop = false;
  @state() private _mode: 'standard' | 'solar' | 'schedule' = 'standard';
  @state() private _autoResumeDelay = 0;
  @state() private _solarSteps: EditableSolarStep[] = [];
  @state() private _scheduleSteps: EditableScheduleStep[] = [];
  @state() private _saving = false;
  @state() private _previewing = false;
  @state() private _hasUserInteraction = false;

  private _cachedLoopModeOptions: { value: string; label: string }[] = [];
  private _cachedEndBehaviorOptions: { value: string; label: string }[] = [];
  private _cachedModeOptions: { value: string; label: string }[] = [];
  private _cachedPhaseOptions: { value: string; label: string }[] = [];

  protected willUpdate(changedProps: PropertyValues): void {
    if (changedProps.has('translations')) {
      const loc = (k: string) => this._localize(k);
      this._cachedLoopModeOptions = loopModeOptions(loc);
      this._cachedEndBehaviorOptions = endBehaviorOptions(loc);
      this._cachedModeOptions = [
        { value: 'standard', label: loc('editors.mode_standard') },
        { value: 'schedule', label: loc('editors.mode_schedule') },
        { value: 'solar', label: loc('editors.mode_solar_advanced') },
      ];
      this._cachedPhaseOptions = [
        { value: 'rising', label: loc('options.phase_rising') },
        { value: 'setting', label: loc('options.phase_setting') },
        { value: 'any', label: loc('options.phase_any') },
      ];
    }
  }

  private get _loopModeOptions() { return this._cachedLoopModeOptions; }
  private get _endBehaviorOptions() { return this._cachedEndBehaviorOptions; }
  private get _modeOptions() { return this._cachedModeOptions; }
  private get _phaseOptions() { return this._cachedPhaseOptions; }

  static styles = [reorderableStepStyles, editorFormStyles, css`
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

    .step-fields {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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

    .form-hint {
      font-size: var(--ha-font-size-s, 12px);
      color: var(--secondary-text-color);
      margin-top: -4px;
    }

    .timeline-preview {
      margin-bottom: 16px;
    }

    .timeline-bar-container {
      position: relative;
      padding-left: 28px;
    }

    .timeline-bar {
      position: relative;
      height: 24px;
      border-radius: 4px;
      border: 1px solid var(--divider-color);
    }

    .timeline-ct {
      border-radius: 4px 4px 0 0;
    }

    .timeline-br {
      border-radius: 0 0 4px 4px;
      height: 12px;
      border-top: none;
    }

    .timeline-track-labels {
      position: absolute;
      left: 0;
      top: 0;
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .timeline-track-label {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
    }

    .timeline-track-label:first-child {
      height: 24px;
    }

    .timeline-track-label:last-child {
      height: 12px;
    }

    .track-icon {
      --mdc-icon-size: 14px;
      color: var(--secondary-text-color);
    }

    .timeline-marker {
      position: absolute;
      top: 0;
      height: 100%;
      z-index: 2;
      pointer-events: none;
    }

    .timeline-marker .marker-line {
      position: absolute;
      top: 0;
      left: 0;
      width: 1px;
      height: 100%;
      background: var(--primary-text-color);
      opacity: 0.4;
    }

    .timeline-marker .marker-icon {
      position: absolute;
      top: -20px;
      left: -10px;
      --mdc-icon-size: 16px;
      color: var(--secondary-text-color);
    }

    .timeline-step-dot {
      position: absolute;
      top: 50%;
      width: 8px;
      height: 8px;
      background: var(--primary-text-color);
      border: 2px solid var(--card-background-color);
      border-radius: 50%;
      transform: translate(-50%, -50%);
      z-index: 3;
    }

    .timeline-br .timeline-step-dot {
      width: 6px;
      height: 6px;
    }

    .timeline-hours {
      position: relative;
      height: 18px;
      margin-top: 2px;
    }

    .timeline-hours .timeline-hour {
      position: absolute;
      transform: translateX(-50%);
      font-size: 10px;
      color: var(--secondary-text-color);
    }

    .timeline-labels {
      position: relative;
      height: 18px;
      margin-top: 2px;
      margin-left: 28px;
    }

    .timeline-labels .timeline-label {
      position: absolute;
      transform: translateX(-50%);
      font-size: 10px;
      color: var(--primary-text-color);
      white-space: nowrap;
    }

    .timeline-label .short-label {
      display: none;
    }

    @media (max-width: 600px) {
      .timeline-label .full-label {
        display: none;
      }
      .timeline-label .short-label {
        display: inline;
      }
    }
  `];

  connectedCallback(): void {
    super.connectedCallback();
    if (this._steps.length === 0 && !this.preset && this._mode === 'standard') {
      this._addDefaultStep();
    }
    if (this._solarSteps.length === 0 && !this.preset && this._mode === 'solar') {
      this._addDefaultSolarSteps();
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

  private _loadPreset(preset: UserCCTSequencePreset): void {
    this._name = preset.name;
    this._icon = preset.icon || '';
    this._loopMode = preset.loop_mode;
    this._loopCount = preset.loop_count || 3;
    this._endBehavior = preset.end_behavior;
    this._skipFirstInLoop = preset.skip_first_in_loop || false;

    if (preset.mode === 'schedule' && preset.schedule_steps) {
      this._mode = 'schedule';
      this._autoResumeDelay = preset.auto_resume_delay || 0;
      this._scheduleSteps = preset.schedule_steps.map((step, index) => ({
        ...step,
        brightness: Math.round(step.brightness / 2.55),
        id: `sched-${index}-${Date.now()}`,
      }));
      this._loopMode = 'continuous';
      this._endBehavior = 'maintain';
    } else if (preset.mode === 'solar' && preset.solar_steps) {
      this._mode = 'solar';
      this._autoResumeDelay = preset.auto_resume_delay || 0;
      this._solarSteps = preset.solar_steps.map((step, index) => ({
        ...step,
        brightness: Math.round(step.brightness / 2.55),
        id: `solar-${index}-${Date.now()}`,
      }));
      this._loopMode = 'continuous';
      this._endBehavior = 'maintain';
    } else {
      this._mode = 'standard';
      this._steps = preset.steps.map((step, index) => ({
        ...step,
        id: `step-${index}-${Date.now()}`,
      }));
    }
  }

  public getDraftState(): CCTEditorDraft {
    return {
      name: this._name,
      icon: this._icon,
      steps: this._steps.map(s => ({
        color_temp: s.color_temp,
        brightness: s.brightness,
        transition: s.transition,
        hold: s.hold,
      })),
      loopMode: this._loopMode,
      loopCount: this._loopCount,
      endBehavior: this._endBehavior,
      skipFirstInLoop: this._skipFirstInLoop,
      hasUserInteraction: this._hasUserInteraction,
      mode: this._mode,
      solarSteps: this._solarSteps.map(({ id, ...step }) => step),
      scheduleSteps: this._scheduleSteps.map(({ id, ...step }) => step),
      autoResumeDelay: this._autoResumeDelay,
    };
  }

  public resetToDefaults(): void {
    this._name = '';
    this._icon = '';
    this._mode = 'standard';
    this._loopMode = 'once';
    this._loopCount = 3;
    this._endBehavior = 'maintain';
    this._skipFirstInLoop = false;
    this._autoResumeDelay = 0;
    this._hasUserInteraction = false;
    this._solarSteps = [];
    this._scheduleSteps = [];
    this._addDefaultStep();
  }

  private _restoreDraft(draft: CCTEditorDraft): void {
    this._name = draft.name;
    this._icon = draft.icon;
    this._mode = draft.mode || 'standard';
    this._loopMode = draft.loopMode;
    this._loopCount = draft.loopCount;
    this._endBehavior = draft.endBehavior;
    this._skipFirstInLoop = draft.skipFirstInLoop;
    this._steps = draft.steps.map((step, index) => ({
      ...step,
      id: `step-${index}-${Date.now()}`,
    }));
    this._solarSteps = (draft.solarSteps || []).map((step, index) => ({
      ...step,
      id: `solar-${index}-${Date.now()}`,
    }));
    this._scheduleSteps = (draft.scheduleSteps || []).map((step: ScheduleStep, index: number) => ({
      ...step,
      id: `sched-${index}-${Date.now()}`,
    }));
    this._autoResumeDelay = draft.autoResumeDelay || 0;
    this._hasUserInteraction = draft.hasUserInteraction ?? false;
  }

  private _addDefaultStep(): void {
    this._steps = [
      {
        id: `step-0-${Date.now()}`,
        color_temp: 4000,
        brightness: 50,
        transition: 15,
        hold: 60,
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

  private _handleAutoResumeDelayChange(e: CustomEvent): void {
    this._autoResumeDelay = Number(e.detail.value) || 0;
    this._hasUserInteraction = true;
  }

  private _handleSkipFirstInLoopChange(e: Event): void {
    this._skipFirstInLoop = (e.target as HTMLInputElement).checked;
    this._hasUserInteraction = true;
  }

  private _hasIncompatibleEndpoints(): boolean {
    // Check if any selected entities lack color temperature support (required for CCT sequences)
    // This catches T1M RGB ring endpoints and any other RGB-only lights
    if (!this.hass || !this.selectedEntities.length) return false;

    for (const entityId of this.selectedEntities) {
      const entity = this.hass.states[entityId];
      if (!entity) continue;

      // Check supported_color_modes attribute - CCT sequences require color_temp support
      const supportedColorModes = entity.attributes.supported_color_modes as string[] | undefined;

      // If entity doesn't support color_temp mode, it cannot run CCT sequences
      if (!supportedColorModes || !supportedColorModes.includes('color_temp')) {
        return true;
      }
    }
    return false;
  }

  private _handleStepFieldChange(stepId: string, field: keyof CCTSequenceStep, e: CustomEvent): void {
    this._steps = this._steps.map((step) =>
      step.id === stepId ? { ...step, [field]: e.detail.value } : step
    );
    this._hasUserInteraction = true;
  }

  private _handleStepColorTempChange(stepId: string, e: CustomEvent): void {
    const kelvin = Math.round(e.detail.value / 100) * 100;
    this._steps = this._steps.map((step) =>
      step.id === stepId ? { ...step, color_temp: kelvin } : step
    );
    this._hasUserInteraction = true;
  }

  private _addStep(): void {
    if (this._steps.length >= 20) return;

    const previousStep = this._steps[this._steps.length - 1];

    const newStep: EditableStep = {
      id: this._generateStepId(),
      color_temp: previousStep?.color_temp ?? 4000,
      brightness: previousStep?.brightness ?? 50,
      transition: previousStep?.transition ?? 15,
      hold: previousStep?.hold ?? 60,
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
    };

    const index = this._steps.findIndex((s) => s.id === step.id);
    const newSteps = [...this._steps];
    newSteps.splice(index + 1, 0, newStep);
    this._steps = newSteps;
    this._hasUserInteraction = true;
  }

  private _getPresetData(): Record<string, unknown> {
    const data: Record<string, unknown> = {
      name: this._name,
      icon: this._icon || undefined,
    };

    if (this._mode === 'schedule') {
      data.mode = 'schedule';
      data.schedule_steps = this._scheduleSteps.map(({ id, ...step }) => ({
        ...step,
        brightness: Math.round(step.brightness * 2.55),
      }));
      data.loop_mode = 'continuous';
      data.end_behavior = 'maintain';
      if (this._autoResumeDelay > 0) {
        data.auto_resume_delay = this._autoResumeDelay;
      }
    } else if (this._mode === 'solar') {
      data.mode = 'solar';
      data.solar_steps = this._solarSteps.map(({ id, ...step }) => ({
        ...step,
        brightness: Math.round(step.brightness * 2.55),
      }));
      data.loop_mode = 'continuous';
      data.end_behavior = 'maintain';
      if (this._autoResumeDelay > 0) {
        data.auto_resume_delay = this._autoResumeDelay;
      }
    } else {
      const steps = this._steps.map(({ id, ...step }) => step);
      data.steps = steps;
      data.loop_mode = this._loopMode;
      data.end_behavior = this._endBehavior;
      data.skip_first_in_loop = this._skipFirstInLoop;

      if (this._loopMode === 'count') {
        data.loop_count = this._loopCount;
      }
    }

    return data;
  }

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
    const hasSteps = this._mode === 'standard' ? this._steps.length > 0 : this._mode === 'schedule' ? this._scheduleSteps.length > 0 : this._solarSteps.length > 0;
    if (!this._name.trim() || !hasSteps) return;

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
    this.dispatchEvent(
      new CustomEvent('cancel', {
        bubbles: true,
        composed: true,
      })
    );
  }

  private _handleModeChange(e: CustomEvent): void {
    const newMode = (e.detail.value || 'standard') as 'standard' | 'solar' | 'schedule';
    if (newMode === this._mode) return;
    this._mode = newMode;
    if (newMode === 'solar') {
      this._loopMode = 'continuous';
      this._endBehavior = 'maintain';
      if (this._solarSteps.length === 0) {
        this._addDefaultSolarSteps();
      }
    } else if (newMode === 'schedule') {
      this._loopMode = 'continuous';
      this._endBehavior = 'maintain';
      if (this._scheduleSteps.length === 0) {
        this._addDefaultScheduleSteps();
      }
    }
    this._hasUserInteraction = true;
  }

  private _addDefaultSolarSteps(): void {
    this._solarSteps = [
      { id: `solar-0-${Date.now()}`, sun_elevation: 0, color_temp: 4600, brightness: 80, phase: 'rising' },
      { id: `solar-1-${Date.now()}`, sun_elevation: 0, color_temp: 2700, brightness: 40, phase: 'setting' },
    ];
  }

  private _addSolarStep(): void {
    if (this._solarSteps.length >= 20) return;
    const previousStep = this._solarSteps[this._solarSteps.length - 1];
    const newStep: EditableSolarStep = {
      id: `solar-${this._solarSteps.length}-${Date.now()}`,
      sun_elevation: previousStep?.sun_elevation ?? 45,
      color_temp: previousStep?.color_temp ?? 4000,
      brightness: previousStep?.brightness ?? 50,
      phase: previousStep?.phase ?? 'any',
    };
    this._solarSteps = [...this._solarSteps, newStep];
    this._hasUserInteraction = true;
  }

  private _removeSolarStep(stepId: string): void {
    if (this._solarSteps.length <= 1) return;
    this._solarSteps = this._solarSteps.filter(s => s.id !== stepId);
    this._hasUserInteraction = true;
  }

  private _handleSolarStepFieldChange(stepId: string, field: keyof Omit<EditableSolarStep, 'id'>, e: CustomEvent): void {
    this._solarSteps = this._solarSteps.map(step =>
      step.id === stepId ? { ...step, [field]: e.detail.value } : step
    );
    this._hasUserInteraction = true;
  }

  private _handleSolarStepColorTempChange(stepId: string, e: CustomEvent): void {
    const kelvin = Math.round(e.detail.value / 100) * 100;
    this._solarSteps = this._solarSteps.map(step =>
      step.id === stepId ? { ...step, color_temp: kelvin } : step
    );
    this._hasUserInteraction = true;
  }

  protected override _onDragHandlePointerDown(e: PointerEvent, index: number): void {
    // Mixin checks _steps.length which is only the standard steps array.
    // Temporarily set _steps to the active array so the length guard passes.
    const activeSteps = this._mode === 'solar' ? this._solarSteps
      : this._mode === 'schedule' ? this._scheduleSteps
      : this._steps;
    const saved = this._steps;
    this._steps = activeSteps as any;
    super._onDragHandlePointerDown(e, index);
    this._steps = saved;
  }

  protected override _reorderStep(fromIndex: number, toIndex: number): void {
    if (this._mode === 'solar') {
      const newSteps = [...this._solarSteps];
      const [moved] = newSteps.splice(fromIndex, 1);
      const insertAt = fromIndex < toIndex ? toIndex - 1 : toIndex;
      newSteps.splice(insertAt, 0, moved!);
      this._solarSteps = newSteps;
      this._hasUserInteraction = true;
    } else if (this._mode === 'schedule') {
      const newSteps = [...this._scheduleSteps];
      const [moved] = newSteps.splice(fromIndex, 1);
      const insertAt = fromIndex < toIndex ? toIndex - 1 : toIndex;
      newSteps.splice(insertAt, 0, moved!);
      this._scheduleSteps = newSteps;
      this._hasUserInteraction = true;
    } else {
      super._reorderStep(fromIndex, toIndex);
    }
  }

  private _moveSolarStepUp(index: number): void {
    if (index <= 0) return;
    const newSteps = [...this._solarSteps];
    const temp = newSteps[index - 1]!;
    newSteps[index - 1] = newSteps[index]!;
    newSteps[index] = temp;
    this._solarSteps = newSteps;
    this._hasUserInteraction = true;
  }

  private _moveSolarStepDown(index: number): void {
    if (index >= this._solarSteps.length - 1) return;
    const newSteps = [...this._solarSteps];
    const temp = newSteps[index]!;
    newSteps[index] = newSteps[index + 1]!;
    newSteps[index + 1] = temp;
    this._solarSteps = newSteps;
    this._hasUserInteraction = true;
  }

  private _duplicateSolarStep(step: EditableSolarStep): void {
    if (this._solarSteps.length >= 20) return;
    const newStep: EditableSolarStep = {
      ...step,
      id: `solar-${this._solarSteps.length}-${Date.now()}`,
    };
    const index = this._solarSteps.findIndex(s => s.id === step.id);
    const newSteps = [...this._solarSteps];
    newSteps.splice(index + 1, 0, newStep);
    this._solarSteps = newSteps;
    this._hasUserInteraction = true;
  }

  private _addDefaultScheduleSteps(): void {
    this._scheduleSteps = [
      { id: `sched-0-${Date.now()}`, time: 'sunrise-30', color_temp: 2700, brightness: 40, label: 'Dawn' },
      { id: `sched-1-${Date.now()}`, time: 'sunrise+30', color_temp: 3500, brightness: 70, label: 'Morning' },
      { id: `sched-2-${Date.now()}`, time: '12:00', color_temp: 5500, brightness: 100, label: 'Midday' },
      { id: `sched-3-${Date.now()}`, time: 'sunset-120', color_temp: 4500, brightness: 90, label: 'Afternoon' },
      { id: `sched-4-${Date.now()}`, time: 'sunset+0', color_temp: 3000, brightness: 60, label: 'Evening' },
      { id: `sched-5-${Date.now()}`, time: 'sunset+90', color_temp: 2700, brightness: 40, label: 'Night' },
    ];
  }

  private _addScheduleStep(): void {
    if (this._scheduleSteps.length >= 20) return;
    const last = this._scheduleSteps[this._scheduleSteps.length - 1];
    this._scheduleSteps = [
      ...this._scheduleSteps,
      {
        id: `sched-${this._scheduleSteps.length}-${Date.now()}`,
        time: '12:00',
        color_temp: last?.color_temp ?? 4000,
        brightness: last?.brightness ?? 70,
        label: '',
      },
    ];
    this._hasUserInteraction = true;
  }

  private _removeScheduleStep(stepId: string): void {
    if (this._scheduleSteps.length <= 2) return;
    this._scheduleSteps = this._scheduleSteps.filter(s => s.id !== stepId);
    this._hasUserInteraction = true;
  }

  private _duplicateScheduleStep(step: EditableScheduleStep): void {
    if (this._scheduleSteps.length >= 20) return;
    const index = this._scheduleSteps.findIndex(s => s.id === step.id);
    const newStep: EditableScheduleStep = {
      ...step,
      id: `sched-${this._scheduleSteps.length}-${Date.now()}`,
    };
    const updated = [...this._scheduleSteps];
    updated.splice(index + 1, 0, newStep);
    this._scheduleSteps = updated;
    this._hasUserInteraction = true;
  }

  private _moveScheduleStepUp(index: number): void {
    if (index <= 0) return;
    const updated = [...this._scheduleSteps];
    [updated[index - 1], updated[index]] = [updated[index]!, updated[index - 1]!];
    this._scheduleSteps = updated;
    this._hasUserInteraction = true;
  }

  private _moveScheduleStepDown(index: number): void {
    if (index >= this._scheduleSteps.length - 1) return;
    const updated = [...this._scheduleSteps];
    [updated[index], updated[index + 1]] = [updated[index + 1]!, updated[index]!];
    this._scheduleSteps = updated;
    this._hasUserInteraction = true;
  }

  private _handleScheduleStepColorTempChange(stepId: string, e: CustomEvent): void {
    const value = Math.round(Number(e.detail.value) / 100) * 100;
    this._scheduleSteps = this._scheduleSteps.map(s =>
      s.id === stepId ? { ...s, color_temp: value } : s,
    );
    this._hasUserInteraction = true;
  }

  /**
   * Map a color temperature (2700-6500K) to a CSS color for timeline display.
   * Warm temps get amber hues, cool temps get near-white with a slight cool tint.
   */
  private _colorTempToCSS(kelvin: number): string {
    const t = Math.max(0, Math.min(1, (kelvin - 2700) / (6500 - 2700)));
    // Warm amber (2700K: 255,147,41) -> near-white with slight cool tint (6500K: 235,240,255)
    const r = Math.round(255 - t * 20);
    const g = Math.round(147 + t * 93);
    const b = Math.round(41 + t * 214);
    return `rgb(${r}, ${g}, ${b})`;
  }

  /**
   * Get sunrise/sunset times in minutes from midnight from the sun.sun entity.
   * Falls back to 7:00 / 19:00 if the entity is unavailable.
   */
  private _getSunTimes(): { sunrise: number; sunset: number } {
    const fallback = { sunrise: 420, sunset: 1140 };
    const sunState = this.hass?.states?.['sun.sun'];
    if (!sunState) return fallback;

    const rising = sunState.attributes.next_rising as string | undefined;
    const setting = sunState.attributes.next_setting as string | undefined;
    if (!rising || !setting) return fallback;

    const parseToMinutes = (iso: string): number | null => {
      const d = new Date(iso);
      if (isNaN(d.getTime())) return null;
      return d.getHours() * 60 + d.getMinutes();
    };

    return {
      sunrise: parseToMinutes(rising) ?? fallback.sunrise,
      sunset: parseToMinutes(setting) ?? fallback.sunset,
    };
  }

  /**
   * Resolve a schedule time string to minutes from midnight.
   * Uses real sunrise/sunset from sun.sun entity when available.
   */
  private _resolveTimeMinutes(time: string): number | null {
    const fixedMatch = time.match(/^([01]\d|2[0-3]):([0-5]\d)$/);
    if (fixedMatch) {
      return parseInt(fixedMatch[1]!, 10) * 60 + parseInt(fixedMatch[2]!, 10);
    }
    const relMatch = time.match(/^(sunrise|sunset)([+-]\d{1,3})$/);
    if (relMatch) {
      const sun = this._getSunTimes();
      const base = relMatch[1] === 'sunrise' ? sun.sunrise : sun.sunset;
      return base + parseInt(relMatch[2]!, 10);
    }
    return null;
  }

  /**
   * Shared dual-track timeline renderer used by both schedule and solar modes.
   */
  private _renderDualTrackBar(config: {
    points: Array<{ pct: number; color_temp: number; brightness: number; tooltip: string; label: string; shortLabel?: string }>;
    markers?: Array<{ pct: number; icon: string; title: string }>;
    axisLabels: Array<{ pct: number; text: string }>;
    wrapGradient: boolean;
  }) {
    const { points, markers, axisLabels, wrapGradient } = config;

    // Build color temp gradient
    const ctStops: string[] = [];
    const brStops: string[] = [];
    for (const pt of points) {
      ctStops.push(`${this._colorTempToCSS(pt.color_temp)} ${pt.pct.toFixed(1)}%`);
      const bv = Math.round(pt.brightness * 2.55);
      brStops.push(`rgb(${bv}, ${bv}, ${bv}) ${pt.pct.toFixed(1)}%`);
    }
    if (wrapGradient) {
      ctStops.push(`${this._colorTempToCSS(points[0]!.color_temp)} 100%`);
      const bv0 = Math.round(points[0]!.brightness * 2.55);
      brStops.push(`rgb(${bv0}, ${bv0}, ${bv0}) 100%`);
    }

    const ctGradient = `linear-gradient(to right, ${ctStops.join(', ')})`;
    const brGradient = `linear-gradient(to right, ${brStops.join(', ')})`;

    return html`
      <div class="timeline-preview">
        <div class="timeline-bar-container">
          <div class="timeline-bar timeline-ct" style="background: ${ctGradient}">
            ${(markers || []).map(m => html`
              <div class="timeline-marker" style="left: ${m.pct}%" title="${m.title}">
                <div class="marker-line"></div>
                <ha-icon icon="${m.icon}" class="marker-icon"></ha-icon>
              </div>
            `)}
            ${points.map(pt => html`
              <div class="timeline-step-dot" style="left: ${pt.pct}%"
                   title="${pt.tooltip}">
              </div>
            `)}
          </div>
          <div class="timeline-bar timeline-br" style="background: ${brGradient}"></div>
          <div class="timeline-track-labels">
            <span class="timeline-track-label">
              <ha-icon icon="mdi:thermometer" class="track-icon"></ha-icon>
            </span>
            <span class="timeline-track-label">
              <ha-icon icon="mdi:brightness-6" class="track-icon"></ha-icon>
            </span>
          </div>
          <div class="timeline-hours">
            ${axisLabels.map(a => html`
              <span class="timeline-hour" style="left: ${a.pct}%">${a.text}</span>
            `)}
          </div>
        </div>
        <div class="timeline-labels">
          ${points.filter(pt => pt.label).map(pt => html`
            <span class="timeline-label" style="left: ${pt.pct}%">
              <span class="full-label">${pt.label}</span>
              <span class="short-label">${pt.shortLabel ?? pt.label}</span>
            </span>
          `)}
        </div>
      </div>
    `;
  }

  private _renderTimelinePreview() {
    if (this._mode === 'schedule') {
      return this._renderScheduleTimeline();
    }
    if (this._mode === 'solar') {
      return this._renderSolarTimeline();
    }
    return html``;
  }

  private _renderScheduleTimeline() {
    if (this._scheduleSteps.length < 2) return html``;

    const resolved = this._scheduleSteps
      .map(step => ({
        minutes: this._resolveTimeMinutes(step.time),
        color_temp: step.color_temp,
        brightness: step.brightness,
        label: step.label,
      }))
      .filter(s => s.minutes !== null)
      .sort((a, b) => a.minutes! - b.minutes!) as Array<{
        minutes: number; color_temp: number; brightness: number; label: string;
      }>;

    if (resolved.length < 2) return html``;

    const points = resolved.map(s => ({
      pct: (s.minutes / 1440) * 100,
      color_temp: s.color_temp,
      brightness: s.brightness,
      tooltip: `${s.label || ''} (${Math.floor(s.minutes / 60)}:${String(s.minutes % 60).padStart(2, '0')})`.trim(),
      label: s.label,
      shortLabel: s.label ? s.label[0] : '',
    }));

    const sun = this._getSunTimes();
    const markers = [
      { pct: (sun.sunrise / 1440) * 100, icon: 'mdi:weather-sunset-up', title: this._localize('editors.timeline_sunrise') },
      { pct: (sun.sunset / 1440) * 100, icon: 'mdi:weather-sunset-down', title: this._localize('editors.timeline_sunset') },
    ];

    const axisLabels = [0, 3, 6, 9, 12, 15, 18, 21].map(h => ({
      pct: (h / 24) * 100,
      text: String(h).padStart(2, '0'),
    }));

    return this._renderDualTrackBar({ points, markers, axisLabels, wrapGradient: true });
  }

  /**
   * Estimate today's peak sun elevation using the current elevation and time.
   * Uses the sinusoidal approximation: elev(t) = maxElev * sin(pi * (t - sunrise) / dayLength).
   */
  private _estimateMaxElevation(): number {
    const defaultMax = 55;
    const sunState = this.hass?.states?.['sun.sun'];
    if (!sunState) return defaultMax;

    const currentElev = sunState.attributes.elevation as number | undefined;
    if (currentElev == null || currentElev <= 0) return defaultMax;

    const sun = this._getSunTimes();
    const dayLength = sun.sunset - sun.sunrise;
    if (dayLength <= 0) return defaultMax;

    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const progress = (nowMinutes - sun.sunrise) / dayLength;
    if (progress <= 0.05 || progress >= 0.95) return defaultMax;

    const sinValue = Math.sin(Math.PI * progress);
    if (sinValue < 0.1) return defaultMax;

    const maxElev = currentElev / sinValue;
    return Math.max(30, Math.min(90, maxElev));
  }

  /**
   * Map a sun elevation + phase to approximate minutes from midnight.
   * Rising: morning side of the arc. Setting: afternoon side.
   */
  private _elevationToMinutes(
    elevation: number, phase: string, maxElev: number, sunrise: number, sunset: number,
  ): number {
    const dayLength = sunset - sunrise;
    const noon = sunrise + dayLength / 2;

    if (elevation <= 0) {
      // Below horizon: place just outside sunrise/sunset
      const offset = Math.abs(elevation) * 2;
      return phase === 'setting' ? sunset + offset : sunrise - offset;
    }

    const ratio = Math.min(elevation / maxElev, 1);
    const angle = Math.asin(ratio); // 0 to pi/2
    const dayFraction = angle / Math.PI; // 0 to 0.5
    const minutesFromEdge = dayLength * dayFraction;

    if (phase === 'setting') {
      return sunset - minutesFromEdge;
    }
    if (phase === 'rising') {
      return sunrise + minutesFromEdge;
    }
    // "any" phase: place at the side closest to noon for visual clarity
    const risingTime = sunrise + minutesFromEdge;
    const settingTime = sunset - minutesFromEdge;
    return Math.abs(risingTime - noon) < Math.abs(settingTime - noon) ? risingTime : settingTime;
  }

  private _renderSolarTimeline() {
    if (this._solarSteps.length === 0) return html``;

    const sun = this._getSunTimes();
    const maxElev = this._estimateMaxElevation();

    // Map each step to a time position on the 24h timeline
    const mapped = this._solarSteps.map(s => ({
      minutes: this._elevationToMinutes(s.sun_elevation, s.phase, maxElev, sun.sunrise, sun.sunset),
      color_temp: s.color_temp,
      brightness: s.brightness,
      elevation: s.sun_elevation,
      phase: s.phase,
    }));
    mapped.sort((a, b) => a.minutes - b.minutes);

    const points = mapped.map(s => ({
      pct: (Math.max(0, Math.min(1440, s.minutes)) / 1440) * 100,
      color_temp: s.color_temp,
      brightness: s.brightness,
      tooltip: `${s.elevation}\u00B0 ${s.phase} (~${Math.floor(Math.max(0, s.minutes) / 60)}:${String(Math.floor(Math.max(0, s.minutes) % 60)).padStart(2, '0')})`,
      label: `${s.elevation}\u00B0`,
    }));

    const markers = [
      { pct: (sun.sunrise / 1440) * 100, icon: 'mdi:weather-sunset-up', title: this._localize('editors.timeline_sunrise') },
      { pct: (sun.sunset / 1440) * 100, icon: 'mdi:weather-sunset-down', title: this._localize('editors.timeline_sunset') },
    ];

    const axisLabels = [0, 3, 6, 9, 12, 15, 18, 21].map(h => ({
      pct: (h / 24) * 100,
      text: String(h).padStart(2, '0'),
    }));

    return this._renderDualTrackBar({ points, markers, axisLabels, wrapGradient: false });
  }

  private _renderScheduleStep(step: EditableScheduleStep, index: number) {
    return html`
      <div class="step-item">
        <div class="step-header">
          ${this._renderDragHandle(index)}
          <span class="step-number">${step.label || this._localize('editors.step_label', { number: String(index + 1) })}</span>
          <div class="step-actions">
            <ha-icon-button
              @click=${() => this._moveScheduleStepUp(index)}
              .disabled=${index === 0}
              title="${this._localize('tooltips.step_move_up')}"
            >
              <ha-icon icon="mdi:arrow-up"></ha-icon>
            </ha-icon-button>
            <ha-icon-button
              @click=${() => this._moveScheduleStepDown(index)}
              .disabled=${index === this._scheduleSteps.length - 1}
              title="${this._localize('tooltips.step_move_down')}"
            >
              <ha-icon icon="mdi:arrow-down"></ha-icon>
            </ha-icon-button>
            <ha-icon-button
              @click=${() => this._duplicateScheduleStep(step)}
              .disabled=${this._scheduleSteps.length >= 20}
              title="${this._localize('tooltips.step_duplicate')}"
            >
              <ha-icon icon="mdi:content-copy"></ha-icon>
            </ha-icon-button>
            <ha-icon-button
              class="step-delete"
              @click=${() => this._removeScheduleStep(step.id)}
              .disabled=${this._scheduleSteps.length <= 2}
              title="${this._localize('tooltips.step_remove')}"
            >
              <ha-icon icon="mdi:delete"></ha-icon>
            </ha-icon-button>
          </div>
        </div>
        <div class="step-fields">
          <div class="step-field">
            <span class="step-field-label">${this._localize('editors.schedule_label')}</span>
            ${renderInput({
              value: step.label,
              onChange: (e: Event) => {
                const target = e.target as HTMLInputElement;
                this._scheduleSteps = this._scheduleSteps.map(s =>
                  s.id === step.id ? { ...s, label: target.value } : s,
                );
                this._hasUserInteraction = true;
              },
            })}
          </div>
          <div class="step-field">
            <span class="step-field-label">${this._localize('editors.schedule_time')}</span>
            ${renderInput({
              value: step.time,
              hint: this._localize('editors.schedule_time_hint'),
              onChange: (e: Event) => {
                const target = e.target as HTMLInputElement;
                this._scheduleSteps = this._scheduleSteps.map(s =>
                  s.id === step.id ? { ...s, time: target.value.trim() } : s,
                );
                this._hasUserInteraction = true;
              },
            })}
          </div>
          <div class="step-field">
            <span class="step-field-label">${this._localize('editors.color_temperature_label', { value: step.color_temp.toString() })}</span>
            <ha-selector
              .hass=${this.hass}
              .selector=${{
                color_temp: {
                  unit: 'kelvin',
                  min: 2700,
                  max: 6500,
                },
              }}
              .value=${step.color_temp}
              @value-changed=${(e: CustomEvent) => this._handleScheduleStepColorTempChange(step.id, e)}
            ></ha-selector>
          </div>
          <div class="step-field">
            <span class="step-field-label">${this._localize('editors.brightness_percent_label')}</span>
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
              .value=${step.brightness}
              @value-changed=${(e: CustomEvent) => {
                this._scheduleSteps = this._scheduleSteps.map(s =>
                  s.id === step.id ? { ...s, brightness: e.detail.value } : s,
                );
                this._hasUserInteraction = true;
              }}
            ></ha-selector>
          </div>
        </div>
      </div>
    `;
  }

  private _renderSolarStep(step: EditableSolarStep, index: number) {
    return html`
      <div class="step-item">
        <div class="step-header">
          ${this._renderDragHandle(index)}
          <span class="step-number">Step ${index + 1}</span>
          <div class="step-actions">
            <ha-icon-button
              @click=${() => this._moveSolarStepUp(index)}
              .disabled=${index === 0}
              title="${this._localize('tooltips.step_move_up')}"
            >
              <ha-icon icon="mdi:arrow-up"></ha-icon>
            </ha-icon-button>
            <ha-icon-button
              @click=${() => this._moveSolarStepDown(index)}
              .disabled=${index === this._solarSteps.length - 1}
              title="${this._localize('tooltips.step_move_down')}"
            >
              <ha-icon icon="mdi:arrow-down"></ha-icon>
            </ha-icon-button>
            <ha-icon-button
              @click=${() => this._duplicateSolarStep(step)}
              .disabled=${this._solarSteps.length >= 20}
              title="${this._localize('tooltips.step_duplicate')}"
            >
              <ha-icon icon="mdi:content-copy"></ha-icon>
            </ha-icon-button>
            <ha-icon-button
              class="step-delete"
              @click=${() => this._removeSolarStep(step.id)}
              .disabled=${this._solarSteps.length <= 1}
              title="${this._localize('tooltips.step_remove')}"
            >
              <ha-icon icon="mdi:delete"></ha-icon>
            </ha-icon-button>
          </div>
        </div>
        <div class="step-fields">
          <div class="step-field">
            <span class="step-field-label">${this._localize('editors.sun_elevation_label', { value: step.sun_elevation.toString() })}</span>
            <ha-selector
              .hass=${this.hass}
              .selector=${{
                number: {
                  min: -10,
                  max: 90,
                  step: 1,
                  mode: 'slider',
                  unit_of_measurement: '\u00B0',
                },
              }}
              .value=${step.sun_elevation}
              @value-changed=${(e: CustomEvent) => this._handleSolarStepFieldChange(step.id, 'sun_elevation', e)}
            ></ha-selector>
          </div>
          <div class="step-field">
            <span class="step-field-label">${this._localize('editors.phase_label')}</span>
            <ha-selector
              .hass=${this.hass}
              .selector=${{
                select: {
                  options: this._phaseOptions,
                  mode: 'dropdown',
                },
              }}
              .value=${step.phase}
              @value-changed=${(e: CustomEvent) => this._handleSolarStepFieldChange(step.id, 'phase', e)}
            ></ha-selector>
          </div>
          <div class="step-field">
            <span class="step-field-label">${this._localize('editors.color_temperature_label', { value: step.color_temp.toString() })}</span>
            <ha-selector
              .hass=${this.hass}
              .selector=${{
                color_temp: {
                  unit: 'kelvin',
                  min: 2700,
                  max: 6500,
                },
              }}
              .value=${step.color_temp}
              @value-changed=${(e: CustomEvent) => this._handleSolarStepColorTempChange(step.id, e)}
            ></ha-selector>
          </div>
          <div class="step-field">
            <span class="step-field-label">${this._localize('editors.brightness_percent_label')}</span>
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
              .value=${step.brightness}
              @value-changed=${(e: CustomEvent) => this._handleSolarStepFieldChange(step.id, 'brightness', e)}
            ></ha-selector>
          </div>
        </div>
      </div>
    `;
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
        <div class="step-fields">
          <div class="step-field">
            <span class="step-field-label">${this._localize('editors.color_temperature_label', { value: step.color_temp.toString() })}</span>
            <ha-selector
              .hass=${this.hass}
              .selector=${{
                color_temp: {
                  unit: 'kelvin',
                  min: 2700,
                  max: 6500,
                },
              }}
              .value=${step.color_temp}
              @value-changed=${(e: CustomEvent) => this._handleStepColorTempChange(step.id, e)}
            ></ha-selector>
          </div>
          <div class="step-field">
            <span class="step-field-label">${this._localize('editors.brightness_percent_label')}</span>
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
              .value=${step.brightness}
              @value-changed=${(e: CustomEvent) => this._handleStepFieldChange(step.id, 'brightness', e)}
            ></ha-selector>
          </div>
          <div class="step-field">
            <span class="step-field-label">${this._localize('editors.transition_time_label')}</span>
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
              .value=${step.transition}
              @value-changed=${(e: CustomEvent) => this._handleStepFieldChange(step.id, 'transition', e)}
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

  private _hasAnySteps(): boolean {
    if (this._mode === 'standard') return this._steps.length > 0;
    if (this._mode === 'schedule') return this._scheduleSteps.length > 0;
    return this._solarSteps.length > 0;
  }

  private _localize(key: string, replacements?: Record<string, string>): string {
    return localize(this.translations, key, replacements);
  }

  protected render() {
    return html`
      <div class="editor-content">
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

        <div class="form-row-pair">
          <div class="form-field">
            <span class="form-label">${this._localize('editors.mode_label')}</span>
            <ha-selector
              .hass=${this.hass}
              .selector=${{
                select: {
                  options: this._modeOptions,
                  mode: 'dropdown',
                },
              }}
              .value=${this._mode}
              @value-changed=${this._handleModeChange}
            ></ha-selector>
            <span class="form-hint">${this._localize('editors.adaptive_mode_hint')}</span>
          </div>
          <div class="form-field">
            <span class="form-label">${this._localize('editors.auto_resume_delay_label')}</span>
            <ha-selector
              .hass=${this.hass}
              .selector=${{
                number: {
                  min: 0,
                  max: 3600,
                  step: 1,
                  unit_of_measurement: 's',
                  mode: 'box',
                },
              }}
              .value=${this._autoResumeDelay}
              .disabled=${this._mode === 'standard'}
              @value-changed=${this._handleAutoResumeDelayChange}
            ></ha-selector>
            <span class="form-hint">${this._localize('editors.auto_resume_delay_hint')}</span>
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
                .value=${this._mode !== 'standard' ? 'continuous' : this._loopMode}
                .disabled=${this._mode !== 'standard'}
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
                .value=${this._mode !== 'standard' ? 'maintain' : this._endBehavior}
                .disabled=${this._mode !== 'standard'}
                @value-changed=${this._handleEndBehaviorChange}
              ></ha-selector>
            </div>
          </div>

          ${this._mode === 'standard' && this._loopMode === 'count'
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
              <span class="toggle-label">${this._localize('editors.skip_first_step_label')}</span>
              <ha-switch
                .checked=${this._skipFirstInLoop}
                .disabled=${this._mode !== 'standard'}
                @change=${this._handleSkipFirstInLoopChange}
              ></ha-switch>
            </div>
          </div>

          ${this._mode === 'standard' ? html`
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
          ` : this._mode === 'schedule' ? html`
          ${this._renderTimelinePreview()}
          <div class="form-section">
            <span class="form-label">${this._localize('editors.schedule_steps_label')}</span>
            <div class="step-list">
              ${this._scheduleSteps.length === 0
                ? html`
                    <div class="empty-steps">
                      ${this._localize('editors.no_steps_message')}
                    </div>
                  `
                : this._scheduleSteps.map((step, index) => html`
                    ${this._renderDropIndicator(index)}
                    ${this._renderScheduleStep(step, index)}
                  `)}
              ${this._renderDropIndicator(this._scheduleSteps.length)}

              <button
                class="add-step-btn ${this._scheduleSteps.length >= 20 ? 'disabled' : ''}"
                @click=${this._addScheduleStep}
                ?disabled=${this._scheduleSteps.length >= 20}
              >
                <ha-icon icon="mdi:plus"></ha-icon>
                ${this._localize('editors.add_step_button')}
              </button>
            </div>
          </div>
          ` : html`
          ${this._renderTimelinePreview()}
          <div class="form-section">
            <span class="form-label">${this._localize('editors.solar_steps_label')}</span>
            <div class="step-list">
              ${this._solarSteps.length === 0
                ? html`
                    <div class="empty-steps">
                      ${this._localize('editors.no_steps_message')}
                    </div>
                  `
                : this._solarSteps.map((step, index) => html`
                    ${this._renderDropIndicator(index)}
                    ${this._renderSolarStep(step, index)}
                  `)}
              ${this._renderDropIndicator(this._solarSteps.length)}

              <button
                class="add-step-btn ${this._solarSteps.length >= 20 ? 'disabled' : ''}"
                @click=${this._addSolarStep}
                ?disabled=${this._solarSteps.length >= 20}
              >
                <ha-icon icon="mdi:plus"></ha-icon>
                ${this._localize('editors.add_step_button')}
              </button>
            </div>
          </div>
          `}

        ${this._hasIncompatibleEndpoints()
          ? html`
              <div class="error-warning">
                <ha-icon icon="mdi:alert-circle"></ha-icon>
                <span>${this._localize('editors.incompatible_cct_endpoints')}</span>
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
                  .disabled=${this._previewing || !this._hasAnySteps() || !this.hasSelectedEntities || !this.isCompatible || this._hasIncompatibleEndpoints()}
                  title=${!this.hasSelectedEntities ? this._localize('editors.tooltip_select_lights_first') : !this.isCompatible ? this._localize('editors.tooltip_light_not_compatible') : this._hasIncompatibleEndpoints() ? this._localize('editors.tooltip_light_no_cct') : ''}
                >
                  <ha-icon icon="mdi:play"></ha-icon>
                  <span class="btn-text">${this._localize('editors.preview_button')}</span>
                </ha-button>
              `}
          <ha-button
            @click=${this._save}
            .disabled=${!this._name.trim() || !this._hasAnySteps() || this._saving}
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
    'cct-sequence-editor': CCTSequenceEditor;
  }
}
