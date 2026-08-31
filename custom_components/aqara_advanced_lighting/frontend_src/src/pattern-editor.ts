import { LitElement, html, css, PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { HomeAssistant, RGBColor, XYColor, SegmentColorEntry, UserSegmentPatternPreset, DeviceContext, PatternEditorDraft, Translations } from './types';
import { xyToRgb, rgbToXy } from './color-utils';
import { colorPickerStyles } from './styles/color-picker';
import { DEVICE_LABELS, DEFAULT_PALETTE, editorFormStyles, localize } from './editor-constants';
import { adoptThumbnail, discardUnsaved } from './thumbnail-lifecycle';

// Segment counts per device type
const SEGMENT_COUNTS: Record<string, number> = {
  t1: 20,
  t1m: 26,
  t1_strip: 50, // 10 meters x 5 segments per meter (max)
};

@customElement('pattern-editor')
export class PatternEditor extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property({ type: Object }) public preset?: UserSegmentPatternPreset;
  @property({ type: Object }) public translations: Translations = {};
  @property({ type: Boolean }) public editMode = false;
  @property({ type: Boolean }) public hasSelectedEntities = false;
  @property({ type: Boolean }) public isCompatible = true;
  @property({ type: Number }) public stripSegmentCount = 10; // Default 2 meters (out-of-box T1 Strip length)
  @property({ type: Object }) public deviceContext?: DeviceContext;
  @property({ type: Array }) public colorHistory: XYColor[] = [];
  @property({ type: Boolean }) public previewActive = false;
  @property({ type: Object }) public draft?: PatternEditorDraft;

  @state() private _name = '';
  @state() private _icon = '';
  @state() private _deviceType = 't1m';
  @state() private _segments: Map<number, XYColor> = new Map();
  @state() private _selectedSegments: Set<number> = new Set();
  @state() private _saving = false;
  @state() private _previewing = false;

  // Note: Pattern mode, clear mode, select mode, and palette selection
  // are now managed by the segment-selector component

  // Color palette for Individual mode (6 colors)
  @state() private _colorPalette: XYColor[] = [...DEFAULT_PALETTE];

  // Gradient colors (2-6) in XY space
  @state() private _gradientColors: XYColor[] = [
    { x: 0.6800, y: 0.3100 },  // Red
    { x: 0.1500, y: 0.0600 },  // Blue
  ];

  // Block colors (1-6) in XY space
  @state() private _blockColors: XYColor[] = [
    { x: 0.6800, y: 0.3100 },  // Red
    { x: 0.1700, y: 0.7000 },  // Green
  ];
  @state() private _expandBlocks = false;
  @state() private _gradientMirror = false;
  @state() private _gradientRepeat = 1;
  @state() private _gradientReverse = false;
  @state() private _gradientInterpolation = 'shortest';
  @state() private _gradientWave = false;
  @state() private _gradientWaveCycles = 1;
  @state() private _turnOffUnspecified = true;
  @state() private _hasUserInteraction = false;
  @state() private _thumbnail?: string;

  static styles = [
    colorPickerStyles,
    editorFormStyles,
    css`
    /* Sub-tabs for pattern modes */
    .mode-tabs {
      display: flex;
      gap: 4px;
      margin-bottom: 16px;
      border-bottom: 2px solid var(--divider-color);
    }

    .mode-tab {
      padding: 8px 16px;
      border: none;
      background: transparent;
      cursor: pointer;
      font-size: 13px;
      font-weight: 500;
      color: var(--secondary-text-color);
      border-bottom: 2px solid transparent;
      margin-bottom: -2px;
      transition: all 0.2s ease;
    }

    .mode-tab:hover {
      color: var(--primary-text-color);
      background: var(--secondary-background-color);
    }

    .mode-tab.active {
      color: var(--primary-color);
      border-bottom-color: var(--primary-color);
    }

    /* Color picker, palette, color-array, color-item, color-swatch,
       color-picker-modal, color-remove, add-color-btn styles
       are inherited from colorPickerStyles (styles.ts) */

    .palette-label {
      font-size: 13px;
      color: var(--secondary-text-color);
      margin-right: 8px;
    }

    /* Use color-picker-grid as alias for color-array in gradient/blocks modes */
    .color-array {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      align-items: center;
    }

    /* Options row */
    .options-row {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-top: 12px;
      flex-wrap: wrap;
    }

    .option-item {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .option-label {
      font-size: 13px;
      color: var(--secondary-text-color);
    }

    /* Mode description */
    .mode-description {
      font-size: 13px;
      color: var(--secondary-text-color);
      margin-bottom: 16px;
      padding: 8px 12px;
      background: var(--secondary-background-color);
      border-radius: 4px;
    }

    /* Clear mode toggle button */
    .clear-mode-toggle.active {
      color: var(--error-color);
    }

    /* Select mode toggle button */
    .select-mode-toggle.active {
      color: var(--info-color, #2196f3);
    }

    /* Generated pattern actions */
    .generated-actions {
      display: flex;
      gap: 8px;
      margin-top: 16px;
      flex-wrap: wrap;
    }

    /* Mode content container */
    .mode-content {
      background: var(--card-background-color);
      border-radius: 8px;
      padding: 16px;
    }

    @media (max-width: 600px) {
      .mode-tabs {
        overflow-x: auto;
      }

      .color-palette {
        justify-content: center;
      }
    }

    .form-hint {
      font-size: var(--ha-font-size-s, 12px);
      color: var(--secondary-text-color);
      margin-top: -4px;
    }
  `];

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

    // When stripSegmentCount changes and device type is t1_strip, clean up segments beyond the new count
    if (changedProps.has('stripSegmentCount') && this._deviceType === 't1_strip') {
      const maxSegments = this._getMaxSegments();
      let needsUpdate = false;
      const newSegments = new Map<number, XYColor>();
      for (const [seg, color] of this._segments) {
        if (seg < maxSegments) {
          newSegments.set(seg, color);
        } else {
          needsUpdate = true;
        }
      }
      if (needsUpdate) {
        this._segments = newSegments;
        // Also clear selected segments that are beyond the new count
        const newSelection = new Set<number>();
        for (const seg of this._selectedSegments) {
          if (seg < maxSegments) {
            newSelection.add(seg);
          }
        }
        this._selectedSegments = newSelection;
      }
    }
  }

  private _getMaxSegments(): number {
    if (this._deviceType === 't1_strip') {
      return this.stripSegmentCount;
    }
    return SEGMENT_COUNTS[this._deviceType] || 26;
  }

  private _loadPreset(preset: UserSegmentPatternPreset): void {
    this._name = preset.name;
    this._icon = preset.icon || '';
    this._deviceType = preset.device_type || 't1m';
    this._thumbnail = preset.thumbnail;
    this._segments = new Map();
    this._selectedSegments = new Set();

    for (const entry of preset.segments) {
      // Convert from 1-based backend indexing to 0-based internal indexing
      const segNum = typeof entry.segment === 'string' ? parseInt(entry.segment, 10) : entry.segment;
      // Handle both XY (new) and RGB (legacy) color formats
      const color = entry.color as XYColor | RGBColor;
      if ('x' in color && 'y' in color) {
        // Already XY format
        this._segments.set(segNum - 1, { x: color.x, y: color.y });
      } else if ('r' in color && 'g' in color && 'b' in color) {
        // Legacy RGB format - convert to XY
        this._segments.set(segNum - 1, rgbToXy(color.r, color.g, color.b));
      }
    }
  }

  public getDraftState(): PatternEditorDraft {
    return {
      name: this._name,
      icon: this._icon,
      deviceType: this._deviceType,
      segments: Array.from(this._segments.entries()),
      colorPalette: [...this._colorPalette],
      gradientColors: [...this._gradientColors],
      blockColors: [...this._blockColors],
      expandBlocks: this._expandBlocks,
      gradientMirror: this._gradientMirror,
      gradientRepeat: this._gradientRepeat,
      gradientReverse: this._gradientReverse,
      gradientInterpolation: this._gradientInterpolation,
      gradientWave: this._gradientWave,
      gradientWaveCycles: this._gradientWaveCycles,
      turnOffUnspecified: this._turnOffUnspecified,
      hasUserInteraction: this._hasUserInteraction,
      thumbnail: this._thumbnail,
    };
  }

  public resetToDefaults(): void {
    this._name = '';
    this._icon = '';
    this._deviceType = 't1m';
    this._segments = new Map();
    this._selectedSegments = new Set();
    this._colorPalette = [...DEFAULT_PALETTE];
    this._gradientColors = [
      { x: 0.6800, y: 0.3100 },
      { x: 0.1500, y: 0.0600 },
    ];
    this._blockColors = [
      { x: 0.6800, y: 0.3100 },
      { x: 0.1700, y: 0.7000 },
    ];
    this._expandBlocks = false;
    this._gradientMirror = false;
    this._gradientRepeat = 1;
    this._gradientReverse = false;
    this._gradientInterpolation = 'shortest';
    this._gradientWave = false;
    this._gradientWaveCycles = 1;
    this._turnOffUnspecified = true;
    this._hasUserInteraction = false;
    this._thumbnail = undefined;
  }

  private _restoreDraft(draft: PatternEditorDraft): void {
    this._name = draft.name;
    this._icon = draft.icon;
    this._deviceType = draft.deviceType;
    this._segments = new Map(draft.segments);
    this._colorPalette = [...draft.colorPalette];
    this._gradientColors = [...draft.gradientColors];
    this._blockColors = [...draft.blockColors];
    this._expandBlocks = draft.expandBlocks;
    this._gradientMirror = draft.gradientMirror;
    this._gradientRepeat = draft.gradientRepeat;
    this._gradientReverse = draft.gradientReverse;
    this._gradientInterpolation = draft.gradientInterpolation;
    this._gradientWave = draft.gradientWave;
    this._gradientWaveCycles = draft.gradientWaveCycles;
    this._turnOffUnspecified = draft.turnOffUnspecified;
    this._hasUserInteraction = draft.hasUserInteraction ?? false;
    this._thumbnail = draft.thumbnail;
  }

  private _handleExtractedThumbnail(e: CustomEvent<{ thumbnailId: string }>): void {
    this._thumbnail = adoptThumbnail(
      this.hass, this._thumbnail, e.detail.thumbnailId, this.preset?.thumbnail,
    );
    this._hasUserInteraction = true;
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
    // Clear segments that exceed new device segment count
    const maxSegments = this._getMaxSegments();
    const newSegments = new Map<number, XYColor>();
    for (const [seg, color] of this._segments) {
      if (seg < maxSegments) {
        newSegments.set(seg, color);
      }
    }
    this._segments = newSegments;
    this._selectedSegments = new Set();
  }

  private _handleColorValueChange(e: CustomEvent): void {
    // Handle color-value-changed event from segment-selector
    const { value } = e.detail;
    if (value instanceof Map) {
      this._segments = value;
      this._hasUserInteraction = true;
    }
  }

  private _handleGradientColorsChange(e: CustomEvent): void {
    // Handle gradient-colors-changed event from segment-selector
    const { colors } = e.detail;
    if (Array.isArray(colors)) {
      this._gradientColors = colors;
      this._hasUserInteraction = true;
    }
  }

  private _handleBlockColorsChange(e: CustomEvent): void {
    // Handle block-colors-changed event from segment-selector
    const { colors } = e.detail;
    if (Array.isArray(colors)) {
      this._blockColors = colors;
      this._hasUserInteraction = true;
    }
  }

  private _handleColorPaletteChange(e: CustomEvent): void {
    // Handle color-palette-changed event from segment-selector
    const { colors } = e.detail;
    if (Array.isArray(colors)) {
      this._colorPalette = colors;
      this._hasUserInteraction = true;
    }
  }

  private _handleTurnOffUnspecifiedChange(e: CustomEvent): void {
    this._turnOffUnspecified = e.detail.value;
    this._hasUserInteraction = true;
  }

  // Note: All pattern generation, color management, selection, and UI rendering
  // are now handled by the segment-selector component in color mode.
  // Methods that were removed:
  // - Pattern generation: _generateGradientPattern, _generateBlocksPattern, _interpolateHue
  // - Color management: _addGradientColor, _removeGradientColor, _addBlockColor, _removeBlockColor
  // - Selection: _selectAll, _clearAll, _clearSelected, _applyToSelected
  // - Pattern application: _applyToGrid, _applyToSelectedSegments
  // - Color picker: _openPaletteColorPicker, _openGradientColorPicker, _openBlockColorPicker,
  //   _handleColorPickerChange, _confirmColorPicker, _closeColorPicker
  // - Other: _handleExpandBlocksChange, _colorToHex


  // Get the current pattern data (always returns what's in the grid)
  private _getCurrentPattern(): Map<number, XYColor> {
    // Always return the segments grid - this is what's displayed and should be previewed/saved
    return this._segments;
  }

  private _getPresetData(): Record<string, unknown> {
    const pattern = this._getCurrentPattern();
    const segments: SegmentColorEntry[] = [];
    for (const [segment, xyColor] of pattern) {
      // Convert from 0-based internal indexing to 1-based backend indexing
      // Convert XY to RGB for backend (segment patterns need RGB for MQTT)
      const rgb = xyToRgb(xyColor.x, xyColor.y, 255);
      segments.push({ segment: segment + 1, color: { r: rgb.r, g: rgb.g, b: rgb.b } });
    }

    return {
      name: this._name,
      icon: this._icon || undefined,
      device_type: this._deviceType,
      segments,
      turn_off_unspecified: this._turnOffUnspecified,
      thumbnail: this._thumbnail || undefined,
    };
  }

  private async _preview(): Promise<void> {
    if (!this.hass || this._previewing) return;

    const pattern = this._getCurrentPattern();
    if (pattern.size === 0) return;

    this._previewing = true;
    try {
      // All modes now use the same preview event with generated pattern data
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

  private async _save(): Promise<void> {
    if (!this._name.trim()) return;

    const pattern = this._getCurrentPattern();
    if (pattern.size === 0) return;

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

  private _stopPreview(): void {
    this.dispatchEvent(
      new CustomEvent('stop-preview', {
        bubbles: true,
        composed: true,
      })
    );
  }

  private _canPreview(): boolean {
    const pattern = this._getCurrentPattern();
    return pattern.size > 0;
  }

  private _canSave(): boolean {
    if (!this._name.trim()) return false;
    const pattern = this._getCurrentPattern();
    return pattern.size > 0;
  }

  // Note: Grid rendering and pattern mode UI are now handled by the segment-selector component in color mode
  // The component provides all the functionality that was previously in these methods:
  // - _renderSegmentGrid() - segment grid with color display
  // - _renderIndividualMode() - color palette selection
  // - _renderGradientMode() - gradient color configuration
  // - _renderBlocksMode() - blocks color configuration

  private _localize(key: string, replacements?: Record<string, string>): string {
    return localize(this.translations, key, replacements);
  }

  protected render() {
    // Create device options with dynamic T1 Strip label based on detected segment count
    const deviceOptions = Object.entries(DEVICE_LABELS).map(([value, label]) => ({
      value,
      label: value === 't1_strip' ? `T1 Strip (${this.stripSegmentCount} segments)` : label,
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

        <div class="form-section">
          <span class="form-label">${this._localize('editors.segment_grid_label')}</span>
          <segment-selector
            .hass=${this.hass}
            .mode=${'color'}
            .maxSegments=${this._getMaxSegments()}
            .colorValue=${this._segments}
            .colorPalette=${this._colorPalette}
            .gradientColors=${this._gradientColors}
            .blockColors=${this._blockColors}
            .expandBlocks=${this._expandBlocks}
            .gradientMirror=${this._gradientMirror}
            .gradientRepeat=${this._gradientRepeat}
            .gradientReverse=${this._gradientReverse}
            .gradientInterpolation=${this._gradientInterpolation}
            .gradientWave=${this._gradientWave}
            .gradientWaveCycles=${this._gradientWaveCycles}
            .translations=${this.translations}
            .colorHistory=${this.colorHistory}
            .zones=${this.deviceContext?.zones || []}
            .turnOffUnspecified=${this._turnOffUnspecified}
            .enableImageExtraction=${true}
            @extracted-thumbnail=${this._handleExtractedThumbnail}
            @color-value-changed=${this._handleColorValueChange}
            @color-palette-changed=${this._handleColorPaletteChange}
            @gradient-colors-changed=${this._handleGradientColorsChange}
            @block-colors-changed=${this._handleBlockColorsChange}
            @turn-off-unspecified-changed=${this._handleTurnOffUnspecifiedChange}
          ></segment-selector>
        </div>

        ${!this.hasSelectedEntities
          ? html`
              <div class="preview-warning">
                <ha-icon icon="mdi:information"></ha-icon>
                <span>${this._localize('editors.select_lights_for_preview_patterns')}</span>
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
                  .disabled=${!this._canPreview() || this._previewing || !this.hasSelectedEntities || !this.isCompatible}
                  title=${!this.hasSelectedEntities ? this._localize('editors.tooltip_select_lights_first') : !this.isCompatible ? this._localize('editors.tooltip_light_not_compatible') : ''}
                >
                  <ha-icon icon="mdi:play"></ha-icon>
                  <span class="btn-text">${this._localize('editors.preview_button')}</span>
                </ha-button>
              `}
          <ha-button
            @click=${this._save}
            .disabled=${!this._canSave() || this._saving}
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
    'pattern-editor': PatternEditor;
  }
}
