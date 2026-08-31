/**
 * Image Extract Button
 *
 * Trigger button plus its own extraction dialog. One instance is placed beside
 * each colour array that supports extraction, so placement alone determines
 * where extracted colours land -- no target-cursor state is needed in hosts
 * that own several arrays (the pattern mode tabs, the sequence steps).
 */

import { LitElement, html, css, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { HomeAssistant, Translations } from './types';
import { localize, dialogActions } from './editor-constants';
import './image-color-extractor';
import type { ColorsExtractedDetail } from './image-color-extractor';

@customElement('image-extract-button')
export class ImageExtractButton extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property({ type: Object }) public translations: Translations = {};

  /** Colour-slot capacity of the target array. */
  @property({ type: Number }) public maxColors = 8;
  /** Strip segment count. Zero hides the projection option entirely. */
  @property({ type: Number }) public segments = 0;
  /** Whether projection is meaningful for this target. */
  @property({ type: Boolean }) public allowProjection = false;
  /** Whether the target has any brightness concept. */
  @property({ type: Boolean }) public showBrightness = true;
  /** Render as a bare icon tile, to sit in segment-selector's colour rows. */
  @property({ type: Boolean }) public compact = false;

  @state() private _open = false;
  @state() private _source: 'upload' | 'url' = 'upload';
  @state() private _mode: 'palette' | 'projection' = 'palette';

  private _localize(key: string): string {
    return localize(this.translations, key);
  }

  private get _projectionAvailable(): boolean {
    return this.allowProjection && this.segments > 0;
  }

  protected render(): TemplateResult {
    return html`
      ${this.compact
        ? html`
            <div
              class="compact-trigger"
              title=${this._localize('image_extractor.button_label') || 'Extract from image'}
              @click=${this._openDialog}
            >
              <ha-icon icon="mdi:image-search-outline"></ha-icon>
            </div>
          `
        : html`
            <button class="add-color-btn extract-btn" @click=${this._openDialog}>
              <ha-icon icon="mdi:image-search-outline"></ha-icon>
              ${this._localize('image_extractor.button_label') || 'Extract from image'}
            </button>
          `}

      <ha-dialog
        class="extractor-dialog"
        .open=${this._open}
        @closed=${this._closeDialog}
        .headerTitle=${this._localize('image_extractor.button_label') || 'Extract from image'}
      >
        <span slot="headerNavigationIcon"></span>
        <div slot="headerActionItems" class="extractor-mode-toggle">
          <button
            class="mode-btn ${this._source === 'upload' ? 'active' : ''}"
            @click=${() => { this._source = 'upload'; }}
          >
            <ha-icon icon="mdi:upload"></ha-icon>
            ${this._localize('image_extractor.upload_tab')}
          </button>
          <button
            class="mode-btn ${this._source === 'url' ? 'active' : ''}"
            @click=${() => { this._source = 'url'; }}
          >
            <ha-icon icon="mdi:link"></ha-icon>
            ${this._localize('image_extractor.url_tab')}
          </button>
        </div>

        ${this._projectionAvailable ? html`
          <div class="extraction-mode-row">
            <button
              class="mode-btn ${this._mode === 'palette' ? 'active' : ''}"
              @click=${() => { this._mode = 'palette'; }}
            >
              ${this._localize('image_extractor.mode_palette')}
            </button>
            <button
              class="mode-btn ${this._mode === 'projection' ? 'active' : ''}"
              @click=${() => { this._mode = 'projection'; }}
            >
              ${this._localize('image_extractor.mode_projection')}
            </button>
            <div class="mode-hint">
              ${this._mode === 'projection'
                ? this._localize('image_extractor.mode_projection_hint')
                : this._localize('image_extractor.mode_palette_hint')}
            </div>
          </div>
        ` : ''}

        <image-color-extractor
          .hass=${this.hass}
          .translations=${this.translations}
          .source=${this._source}
          .maxColors=${this.maxColors}
          .extractionMode=${this._projectionAvailable ? this._mode : 'palette'}
          .segments=${this.segments}
          .showBrightness=${this.showBrightness}
          @colors-extracted=${this._handleExtracted}
          @extractor-cancelled=${this._closeDialog}
        ></image-color-extractor>

        ${dialogActions(
          this._localize('image_extractor.cancel_button'),
          this._localize('image_extractor.extract_button'),
          this._closeDialog,
          () => {
            (this.shadowRoot!.querySelector('image-color-extractor') as any)?.extract();
          },
          'mdi:palette-swatch',
        )}
      </ha-dialog>
    `;
  }

  private _openDialog = (): void => { this._open = true; };
  private _closeDialog = (): void => { this._open = false; };

  private _handleExtracted(e: CustomEvent<ColorsExtractedDetail>): void {
    // Stop the inner event so hosts see exactly one, from this element.
    e.stopPropagation();
    this._open = false;
    this.dispatchEvent(new CustomEvent<ColorsExtractedDetail>('colors-extracted', {
      detail: e.detail,
      bubbles: true,
      composed: true,
    }));
  }

  static styles = css`
    :host { display: contents; }

    /*
     * With display:contents the host generates no box, so this dialog is lifted
     * into the host container's own flex/grid flow. ha-dialog has no :host
     * display rule of its own, so while closed it would still sit there as an
     * empty flex item and consume one gap slot in the colour row. Taking it out
     * of flow costs nothing when open: wa-dialog opens the native dialog with
     * showModal(), which renders in the browser top layer, independent of where
     * this box would have sat.
     */
    .extractor-dialog {
      position: absolute;
    }

    /*
     * Hosts fade their colour tiles while a drag is in progress. They cannot
     * fade this element directly: opacity is not inherited, and it acts on a
     * box, which :host { display: contents } never generates. Custom properties
     * do cross the shadow boundary, so a host opts in by setting
     * --aqara-extract-trigger-opacity in its own .is-dragging rule. Do not
     * "simplify" this to a plain opacity -- that would be unreachable from the
     * host and the trigger would stay bright among faded tiles.
     */
    .add-color-btn.extract-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;
      opacity: var(--aqara-extract-trigger-opacity, 1);
    }

    /*
     * Sized to match the tiles this sits among in segment-selector's colour
     * rows: .color-swatch and .add-color-icon are both a 48x48 content box with
     * an 8px radius and a 2px border. The host is display:contents, so it has no
     * box for those host rules to size, and shadow encapsulation stops them
     * reaching this element -- the geometry has to be restated here. Solid
     * border rather than the add-tile's dashed one, since this is a different
     * action.
     */
    .compact-trigger {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      width: 48px;
      height: 48px;
      border: 2px solid var(--divider-color);
      border-radius: 8px;
      cursor: pointer;
      color: var(--secondary-text-color);
      transition: all 0.2s ease;
      /* Host-driven drag fade -- see the note on .extract-btn above. */
      opacity: var(--aqara-extract-trigger-opacity, 1);
      /*
       * Vertical alignment against the colour stacks this sits beside. Those
       * are column stacks -- a drag handle and/or an edit/remove button around
       * the 48px tile -- while this trigger is the bare tile, so a row set to
       * align-items: center lines up the stack's midpoint with this tile's
       * midpoint and the tiles themselves end up offset. The host knows the
       * heights its own stacks use, so it declares the space to reserve above
       * and below; flexbox centres the margin box, which puts the tile back on
       * the swatches' centre line. Margins rather than padding: padding would
       * sit inside the border and enlarge the visible tile.
       *
       * Custom properties are the only route here, the same as the opacity
       * contract above -- the element is display: contents, so the host has no
       * box of this element's to add margin to. Names are a contract shared
       * with segment-selector.ts and effect-editor.ts; a mismatch fails
       * silently, leaving the trigger at its default zero spacing.
       */
      margin-top: var(--aqara-extract-trigger-space-top, 0px);
      margin-bottom: var(--aqara-extract-trigger-space-bottom, 0px);
    }

    .compact-trigger:hover {
      border-color: var(--primary-color);
      color: var(--primary-color);
      transform: scale(1.05);
    }

    .extractor-mode-toggle { display: flex; gap: 4px; }

    .extraction-mode-row {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
      margin-bottom: 12px;
    }

    .mode-btn {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 6px 10px;
      border: 1px solid var(--divider-color);
      border-radius: 6px;
      background: none;
      color: var(--secondary-text-color);
      cursor: pointer;
      font-size: 13px;
    }

    .mode-btn.active {
      color: var(--primary-color);
      border-color: var(--primary-color);
      background: var(--secondary-background-color);
    }

    .mode-hint {
      flex: 1 1 100%;
      font-size: 12px;
      color: var(--secondary-text-color);
    }
  `;
}
