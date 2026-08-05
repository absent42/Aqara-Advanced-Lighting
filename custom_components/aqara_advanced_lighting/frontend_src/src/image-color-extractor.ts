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
  colors: DynamicSceneColor[];
  thumbnailId?: string;
}

@customElement('image-color-extractor')
export class ImageColorExtractor extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property({ type: Object }) public translations: Translations = {};

  @property({ type: String }) public mode: 'upload' | 'url' = 'upload';
  @state() private _url = '';
  @state() private _saveThumbnail = true;
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
        <!-- Upload mode -->
        ${this.mode === 'upload' ? html`
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
          <!-- URL mode -->
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
        <div class="option-row">
          <label class="option-toggle">
            <ha-switch
              .checked=${this._extractBrightness}
              @change=${this._handleBrightnessToggle}
            ></ha-switch>
            <span>${this._localize('image_extractor.extract_brightness')}</span>
          </label>
        </div>
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
    if (this.mode === 'upload') return !!this._previewSrc;
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

  public async extract(): Promise<void> {
    if (this.extracting) return;

    this.extracting = true;
    this._error = '';

    try {
      let response: Response;

      if (this.mode === 'upload') {
        if (!this._selectedFile) {
          this._error = this._localize('image_extractor.error_no_file') || 'No file selected';
          return;
        }

        const formData = new FormData();
        formData.append('file', this._selectedFile);
        formData.append('num_colors', '8');
        formData.append('save_thumbnail', this._saveThumbnail ? 'true' : 'false');
        formData.append('extract_brightness', this._extractBrightness ? 'true' : 'false');

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
            num_colors: 8,
            save_thumbnail: this._saveThumbnail,
            extract_brightness: this._extractBrightness,
          }),
        });
      }

      if (!response.ok) {
        const errorText = await response.text();
        this._error = errorText || (this._localize('image_extractor.error_server') || 'Error {status}').replace('{status}', String(response.status));
        return;
      }

      const result = await response.json();
      const colors: DynamicSceneColor[] = result.colors.map((c: any) => ({
        x: c.x,
        y: c.y,
        brightness_pct: c.brightness_pct,
      }));

      const detail: ColorsExtractedDetail = { colors };
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
