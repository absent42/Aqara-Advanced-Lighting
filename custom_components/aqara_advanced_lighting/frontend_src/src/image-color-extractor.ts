/**
 * Image Color Extractor Component
 * Provides UI for uploading an image or entering a URL, extracting dominant colors,
 * and optionally saving a thumbnail for the preset.
 */

import { LitElement, html, css, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { HomeAssistant, DynamicSceneColor, Translations } from './types';
import { localize, renderInput } from './editor-constants';

const API_BASE = '/api/aqara_advanced_lighting';

export interface ColorsExtractedDetail {
  /** Null entries appear only in projection mode, for near-black columns. */
  colors: (DynamicSceneColor | null)[];
  thumbnailId?: string;
  mode: 'palette' | 'projection';
}

@customElement('image-color-extractor')
export class ImageColorExtractor extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property({ type: Object }) public translations: Translations = {};

  /**
   * Input method: pick a local file, or fetch a remote URL. This selects which
   * request the component sends. Not to be confused with `extractionMode`,
   * which is what the server does with the image once it has it, and which is
   * the value sent as the request's `mode` field.
   */
  @property({ type: String }) public source: 'upload' | 'url' = 'upload';
  /** Colour-slot capacity of the target array. Drives num_colors. */
  @property({ type: Number }) public maxColors = 8;
  /** 'palette' quantises dominant colours; 'projection' samples across segments. */
  @property({ type: String }) public extractionMode: 'palette' | 'projection' = 'palette';
  /** Strip segment count, used only in projection mode. */
  @property({ type: Number }) public segments = 0;
  /**
   * Whether to offer the brightness toggle. False for panels with no
   * per-colour brightness (segment patterns and sequences).
   */
  @property({ type: Boolean }) public showBrightness = true;
  @state() private _url = '';
  @state() private _saveThumbnail = true;
  /**
   * Projection only: leave near-black columns unlit. On by default, matching
   * the server default. Turning it off fills every segment, at the cost of
   * dark regions rendering at full output -- see _extract_projection.
   */
  @state() private _skipDark = true;
  @state() private _extractBrightness = false;
  @state() public extracting = false;
  @state() private _error = '';
  @state() private _previewSrc = '';

  private _selectedFile?: File;

  private _localize(key: string): string {
    return localize(this.translations, key);
  }

  protected render(): TemplateResult {
    return html`
      <div class="extractor-container">
        <!-- Upload source -->
        ${this.source === 'upload' ? html`
          <div
            class="drop-zone ${this._previewSrc ? 'has-preview' : ''}"
            @click=${this._triggerFileInput}
            @dragover=${this._handleDragOver}
            @dragleave=${this._handleDragLeave}
            @drop=${this._handleDrop}
          >
            ${this._previewSrc ? html`
              <img class="preview-image" src="${this._previewSrc}" alt="Preview" />
              <div class="preview-overlay">
                <ha-icon icon="mdi:swap-horizontal"></ha-icon>
                <span>${this._localize('image_extractor.change_image')}</span>
              </div>
            ` : html`
              <ha-icon icon="mdi:image-plus" class="drop-icon"></ha-icon>
              <span class="drop-text">
                ${this._localize('image_extractor.drop_hint')}
              </span>
            `}
          </div>
          <input
            type="file"
            accept="image/*"
            style="display:none"
            @change=${this._handleFileSelected}
          />
        ` : html`
          <!-- URL source -->
          <div class="url-input-row">
            ${renderInput({
              value: this._url,
              label: this._localize('image_extractor.url_label'),
              onInput: this._handleUrlInput,
              style: 'flex:1',
            })}
          </div>
        `}

        <!-- Options -->
        ${this.showBrightness ? html`
        <div class="option-row">
          <label class="option-toggle">
            <ha-switch
              .checked=${this._extractBrightness}
              @change=${this._handleBrightnessToggle}
            ></ha-switch>
            <span>${this._localize('image_extractor.extract_brightness')}</span>
          </label>
        </div>
        ` : ''}
        ${this.extractionMode === 'projection' ? html`
        <div class="option-row">
          <label class="option-toggle">
            <ha-switch
              .checked=${this._skipDark}
              @change=${this._handleSkipDarkToggle}
            ></ha-switch>
            <span>${this._localize('image_extractor.skip_dark')}</span>
          </label>
        </div>
        <div class="option-hint">${this._localize('image_extractor.skip_dark_hint')}</div>
        ` : ''}
        <div class="option-row">
          <label class="option-toggle">
            <ha-switch
              .checked=${this._saveThumbnail}
              @change=${this._handleThumbnailToggle}
            ></ha-switch>
            <span>${this._localize('image_extractor.save_thumbnail')}</span>
          </label>
        </div>

        <!-- Error display -->
        ${this._error ? html`
          <div class="error-message">${this._error}</div>
        ` : ''}

      </div>
    `;
  }

  public hasInput(): boolean {
    if (this.source === 'upload') return !!this._previewSrc;
    return !!this._url.trim();
  }

  private _triggerFileInput(): void {
    const input = this.shadowRoot!.querySelector('input[type="file"]') as HTMLInputElement | null;
    input?.click();
  }

  private _handleDragOver(e: DragEvent): void {
    e.preventDefault();
    e.stopPropagation();
    (e.currentTarget as HTMLElement).classList.add('dragover');
  }

  private _handleDragLeave(e: DragEvent): void {
    e.preventDefault();
    e.stopPropagation();
    (e.currentTarget as HTMLElement).classList.remove('dragover');
  }

  private _handleDrop(e: DragEvent): void {
    e.preventDefault();
    e.stopPropagation();
    (e.currentTarget as HTMLElement).classList.remove('dragover');

    const file = e.dataTransfer?.files?.[0];
    if (file && file.type.startsWith('image/')) {
      this._setFilePreview(file);
    }
  }

  private _handleFileSelected(e: Event): void {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this._setFilePreview(file);
    }
  }

  private _setFilePreview(file: File): void {
    this._selectedFile = file;

    const reader = new FileReader();
    reader.onload = () => {
      this._previewSrc = reader.result as string;
      this._error = '';
    };
    reader.readAsDataURL(file);
  }

  private _handleUrlInput(e: Event): void {
    this._url = (e.target as HTMLInputElement).value;
    this._error = '';
  }

  private _handleBrightnessToggle(e: Event): void {
    this._extractBrightness = (e.target as HTMLInputElement).checked;
  }

  private _handleThumbnailToggle(e: Event): void {
    this._saveThumbnail = (e.target as HTMLInputElement).checked;
  }

  private _handleSkipDarkToggle(e: Event): void {
    this._skipDark = (e.target as HTMLInputElement).checked;
  }

  public async extract(): Promise<void> {
    if (this.extracting) return;

    this.extracting = true;
    this._error = '';

    try {
      let response: Response;

      if (this.source === 'upload') {
        if (!this._selectedFile) {
          this._error = this._localize('image_extractor.error_no_file') || 'No file selected';
          return;
        }

        const formData = new FormData();
        formData.append('file', this._selectedFile);
        formData.append('num_colors', String(this.maxColors));
        formData.append('save_thumbnail', this._saveThumbnail ? 'true' : 'false');
        formData.append(
          'extract_brightness',
          this.showBrightness && this._extractBrightness ? 'true' : 'false',
        );
        formData.append('mode', this.extractionMode);
        formData.append('segments', String(this.segments));
        formData.append('skip_dark', this._skipDark ? 'true' : 'false');

        response = await this.hass.fetchWithAuth(`${API_BASE}/extract_colors`, {
          method: 'POST',
          body: formData,
        });
      } else {
        response = await this.hass.fetchWithAuth(`${API_BASE}/extract_colors`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: this._url.trim(),
            num_colors: this.maxColors,
            save_thumbnail: this._saveThumbnail,
            extract_brightness: this.showBrightness && this._extractBrightness,
            mode: this.extractionMode,
            segments: this.segments,
            skip_dark: this._skipDark,
          }),
        });
      }

      if (!response.ok) {
        const errorText = await response.text();
        this._error = errorText || (this._localize('image_extractor.error_server') || 'Error {status}').replace('{status}', String(response.status));
        return;
      }

      const result = await response.json();
      const colors: (DynamicSceneColor | null)[] = result.colors.map((c: any) =>
        c === null ? null : { x: c.x, y: c.y, brightness_pct: c.brightness_pct },
      );

      const detail: ColorsExtractedDetail = { colors, mode: this.extractionMode };
      if (result.thumbnail_id) {
        detail.thumbnailId = result.thumbnail_id;
      }

      this.dispatchEvent(new CustomEvent('colors-extracted', {
        detail,
        bubbles: true,
        composed: true,
      }));

    } catch (ex: any) {
      this._error = ex.message || this._localize('image_extractor.error_failed') || 'Extraction failed';
    } finally {
      this.extracting = false;
    }
  }

  public cancel(): void {
    this.dispatchEvent(new CustomEvent('extractor-cancelled', {
      bubbles: true,
      composed: true,
    }));
  }

  static styles = css`
    :host {
      display: block;
    }

    .extractor-container {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .drop-zone {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8px;
      min-height: 120px;
      border: 2px dashed var(--divider-color, #ddd);
      border-radius: 8px;
      cursor: pointer;
      transition: border-color 0.2s, background 0.2s;
      overflow: hidden;
    }

    .drop-zone:hover,
    .drop-zone.dragover {
      border-color: var(--primary-color);
      background: rgba(var(--rgb-primary-color, 33,150,243), 0.05);
    }

    .drop-zone.has-preview {
      border-style: solid;
      min-height: 150px;
    }

    .preview-image {
      width: 100%;
      height: 150px;
      object-fit: cover;
      display: block;
    }

    .preview-overlay {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 4px;
      background: rgba(var(--rgb-primary-text-color, 0, 0, 0), 0.5);
      color: var(--text-primary-color);
      opacity: 0;
      transition: opacity 0.2s;
      font-size: 13px;
    }

    .drop-zone:hover .preview-overlay {
      opacity: 1;
    }

    .drop-icon {
      --mdc-icon-size: 36px;
      color: var(--secondary-text-color);
    }

    .drop-text {
      color: var(--secondary-text-color);
      font-size: 13px;
    }

    .url-input-row {
      display: flex;
    }

    .url-input-row ha-input {
      width: 100%;
    }

    .option-row {
      display: flex;
      align-items: center;
    }

    .option-hint {
      font-size: 12px;
      color: var(--secondary-text-color);
      margin-top: -8px;
    }

    .option-toggle {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: var(--primary-text-color);
      cursor: pointer;
    }

    .error-message {
      color: var(--error-color, #db4437);
      font-size: 12px;
      padding: 4px 8px;
      background: rgba(var(--rgb-error-color, 219,68,55), 0.1);
      border-radius: 4px;
    }

  `;
}
