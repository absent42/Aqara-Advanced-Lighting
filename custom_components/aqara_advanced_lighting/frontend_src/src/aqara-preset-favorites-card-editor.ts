/**
 * Aqara Preset Favorites — Lovelace card editor element.
 *
 * The custom element returned by `AqaraPresetFavoritesCard.getConfigElement()`.
 * Lives in its own file so the main card stays focused on render/lifecycle
 * concerns and so Phase 2 additions (curation, layout, brightness override)
 * can extend the editor without bloating the card module.
 */

import { LitElement, html, css, type PropertyValues, type TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';

import type { HomeAssistant } from './types';
import { type AqaraFavoritesCardConfig, type CardLayout, setCardLayout } from './card-config';
import { PANEL_TRANSLATIONS } from './panel-translations';
import { renderInput } from './editor-constants';
import { getPresets, getUserPresets, getUserPreferences, getSupportedEntities } from './data-client/aqara-api';
import { resolveFavorites, type ResolvedFavorite } from './preset-runtime/preset-resolver';
import { renderPresetIcon } from './preset-runtime/preset-icon';

@customElement('aqara-preset-favorites-card-editor')
export class AqaraPresetFavoritesCardEditor extends LitElement {
  @property({ attribute: false }) public hass?: HomeAssistant;
  @state() private _config?: AqaraFavoritesCardConfig;
  @state() private _allFavorites: ResolvedFavorite[] = [];
  @state() private _loaded = false;
  @state() private _curationDrag: { fromIdx: number; toIdx: number } | null = null;

  private _loadToken = 0;
  private _t = PANEL_TRANSLATIONS.card;

  public setConfig(config: AqaraFavoritesCardConfig): void {
    this._config = { ...config };
  }

  protected willUpdate(changed: PropertyValues): void {
    super.willUpdate(changed);
    if (!this._loaded && changed.has('hass') && this.hass) {
      this._loaded = true;
      this._loadFavorites();
    } else if (this._loaded && changed.has('_config')) {
      // Configured entities may have changed - re-resolve compatibility so
      // the curation list reflects only presets compatible with the new set.
      this._loadFavorites();
    }
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    // Bump the token so any in-flight load resolution is ignored.
    this._loadToken++;
    // Clean up any stray pointer listeners (defensive).
    window.removeEventListener('pointermove', this._onCurationDragMove);
    window.removeEventListener('pointerup', this._onCurationDragEnd);
    window.removeEventListener('pointercancel', this._onCurationDragEnd);
    this._curationDrag = null;
  }

  private async _loadFavorites(): Promise<void> {
    if (!this.hass) return;
    const token = ++this._loadToken;
    try {
      // The editor is opened on-demand and freshness matters: a user might
      // mutate favorites in the panel and immediately open this editor. Bypass
      // the cache for user-scoped data so the editor never shows stale state.
      // Static caches (presets, supported entities) are kept warm.
      const [presets, userPresets, prefs, supportedEntities] = await Promise.all([
        getPresets(this.hass),
        getUserPresets(this.hass, { bypassCache: true }),
        getUserPreferences(this.hass, { bypassCache: true }),
        getSupportedEntities(this.hass),
      ]);
      if (token !== this._loadToken) return;

      // Resolve the configured entity IDs (supports both the legacy single
      // `entity` and the new `entities` array) to their device types.
      const entityIds: string[] =
        this._config?.entities ?? (this._config?.entity ? [this._config.entity] : []);

      const entityMap = new Map<string, string>();
      for (const e of supportedEntities.entities || []) {
        entityMap.set(e.entity_id, e.device_type);
      }
      const deviceTypes = Array.from(new Set(
        entityIds
          .map(id => entityMap.get(id))
          .filter((d): d is string => !!d),
      ));

      // When no entities are configured yet, fall back to skipCompatibility so
      // the user can pick from all favorites before choosing entities.
      const skip = entityIds.length === 0;
      this._allFavorites = resolveFavorites(
        prefs.favorite_presets || [],
        presets,
        userPresets,
        deviceTypes,
        skip ? { skipCompatibility: true } : {},
      );
    } catch (err) {
      console.error('AqaraFavoritesCardEditor: failed to load favorites', err);
    }
  }

  protected render(): TemplateResult {
    if (!this.hass || !this._config) return html``;

    return html`
      <div class="editor">
        <ha-selector
          .hass=${this.hass}
          .label=${this._t.editor.entities_label}
          .selector=${{ entity: { domain: 'light', multiple: true } }}
          .value=${this._config.entities || (this._config.entity ? [this._config.entity] : [])}
          .required=${true}
          @value-changed=${(e: CustomEvent) => {
            const val = e.detail.value as string[];
            // Store as entities array, clear legacy single entity
            this._updateConfig('entities', val?.length ? val : undefined);
            if (this._config!.entity) this._updateConfig('entity', undefined);
          }}
        ></ha-selector>
        ${renderInput({
          label: this._t.editor.title_label,
          value: this._config.title || '',
          onInput: (e: Event) => this._updateConfig('title', (e.target as HTMLInputElement).value),
        })}
        ${(this._config.layout === undefined || this._config.layout === 'grid' || this._config.layout === 'compact-grid')
          ? renderInput({
              label: this._t.editor.columns_label,
              type: 'number',
              min: '0',
              max: '6',
              value: String(this._config.columns || 0),
              onInput: (e: Event) => {
                const val = parseInt((e.target as HTMLInputElement).value, 10);
                this._updateConfig('columns', isNaN(val) || val <= 0 ? undefined : val);
              },
            })
          : ''}
        <ha-selector
          .hass=${this.hass}
          .label=${this._t.editor.layout_label}
          .selector=${{
            select: {
              mode: 'dropdown',
              options: [
                { value: 'grid', label: this._t.editor.layout_grid },
                { value: 'compact-grid', label: this._t.editor.layout_compact_grid },
                { value: 'list', label: this._t.editor.layout_list },
                { value: 'hero', label: this._t.editor.layout_hero },
                { value: 'carousel', label: this._t.editor.layout_carousel },
              ],
            },
          }}
          .value=${this._config.layout || 'grid'}
          @value-changed=${(e: CustomEvent) => this._updateConfig('layout', e.detail.value || undefined)}
        ></ha-selector>
        <ha-formfield .label=${this._t.editor.show_names_label}>
          <ha-switch
            .checked=${this._config.show_names !== false}
            @change=${(e: Event) => this._updateConfig('show_names', (e.target as HTMLInputElement).checked ? undefined : false)}
          ></ha-switch>
        </ha-formfield>
        <ha-formfield .label=${this._t.editor.highlight_user_label}>
          <ha-switch
            .checked=${this._config.highlight_user_presets !== false}
            @change=${(e: Event) => this._updateConfig('highlight_user_presets', (e.target as HTMLInputElement).checked ? undefined : false)}
          ></ha-switch>
        </ha-formfield>
        <ha-formfield .label=${this._t.editor.brightness_override_label}>
          <ha-switch
            .checked=${this._config.brightness_override === true}
            @change=${(e: Event) => this._updateConfig('brightness_override', (e.target as HTMLInputElement).checked || undefined)}
          ></ha-switch>
        </ha-formfield>
        ${this._config.brightness_override
          ? html`
            <ha-selector
              .hass=${this.hass}
              .label=${this._t.editor.brightness_override_position_label}
              .selector=${{
                select: {
                  mode: 'dropdown',
                  options: [
                    { value: 'header', label: this._t.editor.brightness_override_position_header },
                    { value: 'footer', label: this._t.editor.brightness_override_position_footer },
                  ],
                },
              }}
              .value=${this._config.brightness_override_position || 'header'}
              @value-changed=${(e: CustomEvent) => this._updateConfig('brightness_override_position', e.detail.value || undefined)}
            ></ha-selector>
          `
          : ''}
        ${this._allFavorites.length > 0
          ? html`
            <div class="curation-section">
              <span class="curation-label">${this._t.editor.preset_ids_label}</span>
              <span class="curation-help">${this._t.editor.preset_ids_help}</span>
              <div class="curation-list">
                ${this._renderCurationList()}
              </div>
              ${this._config.preset_ids
                ? html`
                  <ha-button
                    @click=${() => this._updateConfig('preset_ids', undefined)}
                  >${this._t.editor.reset_to_global_button}</ha-button>
                `
                : ''}
            </div>
          `
          : ''}
      </div>
    `;
  }

  private _renderCurationList(): TemplateResult {
    const presetIds = this._config?.preset_ids;
    const checked = new Set(presetIds || []);

    // Display order: items in preset_ids first (in their array order), then unchecked favorites.
    const orderedRefs: ResolvedFavorite[] = [];
    if (presetIds) {
      for (const id of presetIds) {
        const found = this._allFavorites.find(f => f.ref.id === id);
        if (found) orderedRefs.push(found);
      }
    }
    for (const fav of this._allFavorites) {
      if (!checked.has(fav.ref.id)) orderedRefs.push(fav);
    }

    const drag = this._curationDrag;
    const dropIdx = drag ? drag.toIdx : -1;

    return html`${repeat(
      orderedRefs,
      (fav) => fav.ref.id,
      (fav, idx) => {
        const isChecked = checked.has(fav.ref.id);
        const classes = ['curation-row'];
        if (drag?.fromIdx === idx) classes.push('dragging');
        if (idx === dropIdx && drag?.fromIdx !== idx) classes.push('drop-target');
        const handleClasses = ['curation-drag-handle'];
        if (!isChecked) handleClasses.push('disabled');
        return html`
          <div class=${classes.join(' ')} data-id=${fav.ref.id} data-idx=${idx}>
            <div
              class=${handleClasses.join(' ')}
              @pointerdown=${isChecked
                ? (e: PointerEvent) => this._onCurationDragStart(e, idx)
                : undefined}
            >
              <ha-icon icon="mdi:drag"></ha-icon>
            </div>
            <ha-checkbox
              .checked=${isChecked}
              @change=${(e: Event) => this._onCurationCheck(fav.ref.id, (e.target as HTMLInputElement).checked)}
            ></ha-checkbox>
            <div class="curation-icon">${renderPresetIcon(fav.ref, fav.preset, fav.isUser, { showAudioBadge: false })}</div>
            <span class="curation-name">${fav.preset.name}</span>
          </div>
        `;
      },
    )}`;
  }

  private _onCurationCheck(id: string, checked: boolean): void {
    const current = this._config?.preset_ids ? [...this._config.preset_ids] : [];
    if (checked && !current.includes(id)) {
      current.push(id);
    } else if (!checked) {
      const i = current.indexOf(id);
      if (i >= 0) current.splice(i, 1);
    }
    this._updateConfig('preset_ids', current.length > 0 ? current : undefined);
  }

  private _onCurationDragStart = (e: PointerEvent, fromIdx: number): void => {
    e.preventDefault();
    e.stopPropagation();
    this._curationDrag = { fromIdx, toIdx: fromIdx };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    window.addEventListener('pointermove', this._onCurationDragMove);
    window.addEventListener('pointerup', this._onCurationDragEnd);
    window.addEventListener('pointercancel', this._onCurationDragEnd);
  };

  private _onCurationDragMove = (e: PointerEvent): void => {
    if (!this._curationDrag) return;
    const rows = this.shadowRoot!.querySelectorAll('.curation-row');
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i] as HTMLElement;
      const rect = r.getBoundingClientRect();
      if (e.clientY >= rect.top && e.clientY <= rect.bottom) {
        this._curationDrag = { ...this._curationDrag, toIdx: i };
        break;
      }
    }
  };

  private _onCurationDragEnd = (): void => {
    window.removeEventListener('pointermove', this._onCurationDragMove);
    window.removeEventListener('pointerup', this._onCurationDragEnd);
    window.removeEventListener('pointercancel', this._onCurationDragEnd);
    const drag = this._curationDrag;
    this._curationDrag = null;
    if (!drag || drag.fromIdx === drag.toIdx) return;

    // Build the visual order before the drag: checked rows first (in preset_ids order), then unchecked.
    const presetIds = this._config?.preset_ids ? [...this._config.preset_ids] : [];
    const checked = new Set(presetIds);
    const visual: ResolvedFavorite[] = [];
    if (this._config?.preset_ids) {
      for (const id of this._config.preset_ids) {
        const found = this._allFavorites.find(f => f.ref.id === id);
        if (found) visual.push(found);
      }
    }
    for (const fav of this._allFavorites) {
      if (!checked.has(fav.ref.id)) visual.push(fav);
    }

    // Apply the reorder.
    const [moved] = visual.splice(drag.fromIdx, 1);
    if (!moved) return;
    visual.splice(drag.toIdx, 0, moved);

    // Extract checked rows in the new visual order.
    const newPresetIds = visual.filter(f => checked.has(f.ref.id)).map(f => f.ref.id);
    this._updateConfig('preset_ids', newPresetIds.length > 0 ? newPresetIds : undefined);
  };

  private _updateConfig(key: string, value: unknown): void {
    if (!this._config) return;
    if (key === 'layout') {
      this._config = setCardLayout(this._config, value as CardLayout | undefined);
      this.dispatchEvent(
        new CustomEvent('config-changed', { detail: { config: this._config } })
      );
      return;
    }
    const newConfig = { ...this._config, [key]: value };
    // Remove undefined keys (but keep empty string for title — means "no title")
    if (value === undefined || (value === '' && key !== 'title')) {
      delete (newConfig as Record<string, unknown>)[key];
    }
    this._config = newConfig;
    this.dispatchEvent(
      new CustomEvent('config-changed', { detail: { config: newConfig } })
    );
  }

  static styles = css`
    .editor {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 16px;
    }
    .curation-section {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .curation-label {
      font-weight: 500;
    }
    .curation-help {
      font-size: 12px;
      color: var(--secondary-text-color);
    }
    .curation-list {
      display: flex;
      flex-direction: column;
      gap: 2px;
      max-height: 360px;
      overflow-y: auto;
      border: 1px solid var(--divider-color);
      border-radius: 6px;
      padding: 4px;
    }
    .curation-row {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 4px 6px;
      border-radius: 4px;
    }
    .curation-row:hover {
      background: var(--secondary-background-color);
    }
    .curation-row.dragging {
      opacity: 0.4;
    }
    .curation-row.drop-target {
      border-top: 3px solid var(--primary-color);
      /* Absorb the border so the row's visual height stays stable. */
      margin-top: -3px;
    }
    .curation-drag-handle {
      cursor: grab;
      padding: 4px;
      touch-action: none;
      user-select: none;
      color: var(--secondary-text-color);
    }
    .curation-drag-handle:active {
      cursor: grabbing;
    }
    .curation-drag-handle.disabled {
      cursor: default;
      opacity: 0.25;
      pointer-events: none;
    }
    .curation-icon {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .curation-icon ha-icon,
    .curation-icon img,
    .curation-icon svg {
      width: 100%;
      height: 100%;
      --mdc-icon-size: 32px;
      object-fit: contain;
      border-radius: 50%;
    }
    .curation-name {
      flex: 1;
    }
  `;
}
