/**
 * <aqara-running-operations> — self-contained display for active effects,
 * sequences, scenes, music sync, and circadian operations.
 *
 * Receives data from the parent panel; fires `operations-changed` after any
 * service call so the parent can re-fetch.
 */
import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { localize } from './editor-constants';
import { getEntityFriendlyName, getEntityDeviceName } from './entity-utils';
import type { HomeAssistant, RunningOperation, Translations } from './types';

@customElement('aqara-running-operations')
export class AqaraRunningOperations extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) operations: RunningOperation[] = [];
  @property({ attribute: false }) presetLookup: Map<string, { name: string; icon: string | null }> = new Map();
  @property({ attribute: false }) translations!: Translations;

  // --- Debounce timers ---
  private _sensitivityDebounceTimer: ReturnType<typeof setTimeout> | null = null;
  private _squelchDebounceTimer: ReturnType<typeof setTimeout> | null = null;
  private _effectSensitivityDebounceTimer: ReturnType<typeof setTimeout> | null = null;

  // --- Localise helper ---
  private _localize(key: string, replacements?: Record<string, string>): string {
    return localize(this.translations, key, replacements);
  }

  private _getEntityName(entityId: string): string {
    return getEntityFriendlyName(this.hass, entityId);
  }

  private _getAudioDeviceName(entityId: string): string {
    return getEntityDeviceName(this.hass, entityId);
  }

  // --- Signal parent ---
  private _fireChanged(): void {
    this.dispatchEvent(new CustomEvent('operations-changed', { bubbles: true, composed: true }));
  }

  // ===================== rendering =====================

  protected render() {
    if (this.operations.length === 0) {
      return html`
        <div class="running-ops-empty">
          ${this._localize('target.no_running_operations')}
        </div>
      `;
    }

    const displayItems = this._buildDisplayOperations(this.operations);

    return html`
      <div class="running-ops-container">
        <div class="running-ops-list">
          ${displayItems.map(item =>
            Array.isArray(item)
              ? (item[0]?.type === 'effect'
                ? this._renderGroupedAudioEffectOp(item)
                : this._renderGroupedSequenceOp(item))
              : this._renderOperationCard(item),
          )}
        </div>
      </div>
    `;
  }

  private _buildDisplayOperations(
    ops: RunningOperation[],
  ): (RunningOperation | RunningOperation[])[] {
    const result: (RunningOperation | RunningOperation[])[] = [];
    const groupIndex = new Map<string, number>();

    for (const op of ops) {
      const isGroupableSeq =
        (op.type === 'cct_sequence' || op.type === 'segment_sequence') &&
        op.preset_id;
      const isAudioEffect =
        op.type === 'effect' && op.audio_entity && op.preset_id;

      if (isGroupableSeq || isAudioEffect) {
        const key = `${op.type}:${op.preset_id}`;
        const idx = groupIndex.get(key);
        if (idx !== undefined) {
          const existing = result[idx];
          if (Array.isArray(existing)) {
            existing.push(op);
          } else {
            result[idx] = [existing as RunningOperation, op];
          }
        } else {
          groupIndex.set(key, result.length);
          result.push(op);
        }
      } else {
        result.push(op);
      }
    }

    return result;
  }

  private _renderOperationCard(op: RunningOperation) {
    switch (op.type) {
      case 'effect':
        return this._renderEffectOp(op);
      case 'cct_sequence':
      case 'segment_sequence':
        return this._renderSequenceOp(op);
      case 'dynamic_scene':
        return this._renderSceneOp(op);
      case 'music_sync':
        return this._renderMusicSyncOp(op);
      case 'circadian':
        return this._renderCircadianOp(op);
      default:
        return '';
    }
  }

  private _renderEffectOp(op: RunningOperation) {
    const entityName = this._getEntityName(op.entity_id!);
    const preset = this._resolvePresetInfo(op.preset_id);
    const typeLabel = this._localize('target.effect_button');

    // Non-audio effect: simple flat card
    if (!op.audio_entity) {
      return html`
        <div class="running-op-card">
          <div class="running-op-info">
            <ha-icon class="running-op-icon" icon="${preset.icon || 'mdi:palette'}"></ha-icon>
            <div class="running-op-details">
              <span class="running-op-name">${preset.name || typeLabel}</span>
              <span class="running-op-entity">
                ${preset.name ? html`<span class="running-op-type">${typeLabel}</span>` : ''}
                <span class="running-op-entity-name">${entityName}</span>
              </span>
            </div>
          </div>
          <div class="running-op-actions">
            <ha-icon-button
              .label=${this._localize('target.stop')}
              @click=${() => this._stopRunningEffect(op.entity_id!)}
            >
              <ha-icon icon="mdi:stop"></ha-icon>
            </ha-icon-button>
          </div>
        </div>
      `;
    }

    // Audio-reactive single-entity effect: expanded card
    return html`
      <div class="running-op-card scene-op-card">
        <div class="running-op-header">
          <div class="running-op-info">
            <ha-icon class="running-op-icon" icon="${preset.icon || 'mdi:palette'}"></ha-icon>
            <div class="running-op-details">
              <span class="running-op-name">${preset.name || typeLabel}</span>
              ${preset.name ? html`<span class="running-op-entity"><span class="running-op-type">${typeLabel}</span></span>` : ''}
              ${this._renderAudioInfoRows(op)}
            </div>
          </div>
          <div class="running-op-actions">
            <ha-icon-button
              .label=${this._localize('target.stop')}
              @click=${() => this._stopRunningEffect(op.entity_id!)}
            >
              <ha-icon icon="mdi:stop"></ha-icon>
            </ha-icon-button>
          </div>
        </div>
        <div class="entity-chip-list">
          <span class="entity-chip">${entityName}</span>
        </div>
      </div>
    `;
  }

  private _renderGroupedAudioEffectOp(ops: RunningOperation[]) {
    const first = ops[0]!;
    const preset = this._resolvePresetInfo(first.preset_id);
    const typeLabel = this._localize('target.effect_button');

    const entityChips = ops.map(op => {
      const name = this._getEntityName(op.entity_id!);
      return html`<span class="entity-chip">${name}</span>`;
    });

    return html`
      <div class="running-op-card scene-op-card">
        <div class="running-op-header">
          <div class="running-op-info">
            <ha-icon class="running-op-icon" icon="${preset.icon || 'mdi:palette'}"></ha-icon>
            <div class="running-op-details">
              <span class="running-op-name">${preset.name || typeLabel}</span>
              ${preset.name ? html`<span class="running-op-entity"><span class="running-op-type">${typeLabel}</span></span>` : ''}
              ${this._renderAudioInfoRows(first)}
            </div>
          </div>
          <div class="running-op-actions">
            <ha-icon-button
              .label=${this._localize('target.stop')}
              @click=${() => this._stopGroupedEffect(ops)}
            >
              <ha-icon icon="mdi:stop"></ha-icon>
            </ha-icon-button>
          </div>
        </div>
        <div class="entity-chip-list">
          ${entityChips}
        </div>
      </div>
    `;
  }

  private _renderAudioInfoRows(op: RunningOperation) {
    return html`
      <span class="running-op-entity">
        <ha-icon icon="mdi:waveform" style="--mdc-icon-size: 14px; vertical-align: middle;"></ha-icon>
        <span class="running-op-type">${this._localize('target.audio_reactive_label') || 'Audio reactive'}</span>
        ${op.audio_entity ? html`<span class="running-op-status">${this._getAudioDeviceName(op.audio_entity)}</span>` : ''}
      </span>
      ${op.audio_sensitivity != null ? html`
        <div class="audio-sensitivity-row">
          <ha-icon icon="mdi:sine-wave" style="--mdc-icon-size: 14px; flex-shrink: 0;"></ha-icon>
          <span class="sensitivity-label">${this._localize('target.sensitivity') || 'Sensitivity'}</span>
          <input type="range" min="1" max="100" .value=${String(op.audio_sensitivity)}
            @input=${(e: Event) => this._debounceEffectAudioSensitivity(op.entity_id!, parseInt((e.target as HTMLInputElement).value))}
          />
          <span class="sensitivity-value">${op.audio_sensitivity}</span>
        </div>
      ` : ''}
      ${op.audio_waiting ? html`
        <span class="running-op-pause-row">
          <span class="running-op-status paused-text">${this._localize('target.audio_sensor_unavailable') || 'Audio sensor unavailable'}</span>
        </span>
      ` : ''}
    `;
  }

  private _renderSequenceOp(op: RunningOperation) {
    const entityName = this._getEntityName(op.entity_id!);
    const preset = this._resolvePresetInfo(op.preset_id);
    const isCCT = op.type === 'cct_sequence';
    const isSolar = isCCT && op.mode === 'solar';
    const isSchedule = isCCT && op.mode === 'schedule';
    const fallbackIcon = isSolar ? 'mdi:white-balance-sunny' : isSchedule ? 'mdi:clock-outline' : isCCT ? 'mdi:thermometer' : 'mdi:led-strip-variant';
    const typeLabel = isSolar
      ? this._localize('target.solar_cct_button')
      : isSchedule
        ? this._localize('target.schedule_cct_button')
        : isCCT
          ? this._localize('target.cct_button')
          : this._localize('target.segment_button');
    const isPaused = op.paused || op.externally_paused;
    const pauseClass = this._getEntityPauseClass(
      op.externally_paused,
      op.override_attributes as {brightness: boolean; color: boolean} | undefined,
    );
    const pauseTitle = this._getEntityPauseTitle(
      op.externally_paused,
      op.override_attributes as {brightness: boolean; color: boolean} | undefined,
      op.auto_resume_remaining,
    );

    return html`
      <div class="running-op-card ${isPaused ? 'op-paused' : ''} ${op.externally_paused ? 'externally-paused' : ''}">
        <div class="running-op-info">
          <ha-icon class="running-op-icon" icon="${preset.icon || fallbackIcon}"></ha-icon>
          <div class="running-op-details">
            <span class="running-op-name">${preset.name || typeLabel}</span>
            <span class="running-op-entity">
              ${preset.name ? html`<span class="running-op-type">${typeLabel}</span>` : ''}
              <span class="entity-chip ${pauseClass}" title="${pauseTitle}">${entityName}</span>
            </span>
            ${op.paused ? html`
              <span class="running-op-pause-row">
                <span class="running-op-status paused-text">${this._localize('target.paused')}</span>
              </span>
            ` : ''}
          </div>
        </div>
        <div class="running-op-actions">
          ${op.externally_paused
            ? html`
                <ha-icon-button
                  .label=${this._localize('target.resume_control')}
                  @click=${() => this._resumeEntityControl(op.entity_id!)}
                >
                  <ha-icon icon="mdi:play-circle-outline"></ha-icon>
                </ha-icon-button>
              `
            : html`
                <ha-icon-button
                  .label=${op.paused ? this._localize('target.resume') : this._localize('target.pause')}
                  @click=${() => this._toggleSequencePause(op)}
                >
                  <ha-icon icon="mdi:${op.paused ? 'play' : 'pause'}"></ha-icon>
                </ha-icon-button>
              `
          }
          <ha-icon-button
            .label=${this._localize('target.stop')}
            @click=${() => this._stopRunningSequence(op)}
          >
            <ha-icon icon="mdi:stop"></ha-icon>
          </ha-icon-button>
        </div>
      </div>
    `;
  }

  private _renderGroupedSequenceOp(ops: RunningOperation[]) {
    const first = ops[0]!;
    const preset = this._resolvePresetInfo(first.preset_id);
    const isCCT = first.type === 'cct_sequence';
    const isSolar = isCCT && first.mode === 'solar';
    const isSchedule = isCCT && first.mode === 'schedule';
    const fallbackIcon = isSolar
      ? 'mdi:white-balance-sunny'
      : isSchedule
        ? 'mdi:clock-outline'
        : isCCT
          ? 'mdi:thermometer'
          : 'mdi:led-strip-variant';
    const typeLabel = isSolar
      ? this._localize('target.solar_cct_button')
      : isSchedule
        ? this._localize('target.schedule_cct_button')
        : isCCT
          ? this._localize('target.cct_button')
          : this._localize('target.segment_button');

    const anyPaused = ops.some(op => op.paused);
    const extPausedOps = ops.filter(op => op.externally_paused);
    const isPaused = anyPaused || extPausedOps.length > 0;

    const entityChips = ops.map(op => {
      const name = this._getEntityName(op.entity_id!);
      const pauseClass = this._getEntityPauseClass(
        op.externally_paused,
        op.override_attributes as {brightness: boolean; color: boolean} | undefined,
      );
      const pauseTitle = this._getEntityPauseTitle(
        op.externally_paused,
        op.override_attributes as {brightness: boolean; color: boolean} | undefined,
        op.auto_resume_remaining,
      );
      return html`<span class="entity-chip ${pauseClass}" title="${pauseTitle}">${name}</span>`;
    });

    return html`
      <div class="running-op-card scene-op-card ${isPaused ? 'op-paused' : ''}">
        <div class="running-op-header">
          <div class="running-op-info">
            <ha-icon class="running-op-icon" icon="${preset.icon || fallbackIcon}"></ha-icon>
            <div class="running-op-details">
              <span class="running-op-name">${preset.name || typeLabel}</span>
              ${preset.name ? html`<span class="running-op-entity"><span class="running-op-type">${typeLabel}</span></span>` : ''}
              ${anyPaused ? html`
                <span class="running-op-pause-row">
                  <span class="running-op-status paused-text">${this._localize('target.paused')}</span>
                </span>
              ` : ''}
            </div>
          </div>
          <div class="running-op-actions">
            ${extPausedOps.length > 0
              ? html`
                  <ha-icon-button
                    .label=${this._localize('target.resume_control')}
                    @click=${() => this._resumeSceneEntities(extPausedOps.map(op => op.entity_id!))}
                  >
                    <ha-icon icon="mdi:play-circle-outline"></ha-icon>
                  </ha-icon-button>
                `
              : ''}
            <ha-icon-button
              .label=${anyPaused ? this._localize('target.resume') : this._localize('target.pause')}
              @click=${() => this._toggleGroupedSequencePause(ops)}
            >
              <ha-icon icon="mdi:${anyPaused ? 'play' : 'pause'}"></ha-icon>
            </ha-icon-button>
            <ha-icon-button
              .label=${this._localize('target.stop')}
              @click=${() => this._stopGroupedSequence(ops)}
            >
              <ha-icon icon="mdi:stop"></ha-icon>
            </ha-icon-button>
          </div>
        </div>
        <div class="entity-chip-list">
          ${entityChips}
        </div>
      </div>
    `;
  }

  private _renderSceneOp(op: RunningOperation) {
    const preset = this._resolvePresetInfo(op.preset_id);
    const extPausedEntities = op.externally_paused_entities || [];
    const overrideMap = op.override_attributes as Record<string, {brightness: boolean; color: boolean}> | undefined;
    const isPaused = op.paused || extPausedEntities.length > 0;

    const entityChips = (op.entity_ids || []).map(id => {
      const name = this._getEntityName(id);
      const cap = op.entity_capabilities?.[id];
      const isSoftwareTransition = cap?.includes('software_transition');
      const isExtPaused = extPausedEntities.includes(id);
      const attrs = isExtPaused && overrideMap ? overrideMap[id] : undefined;
      const pauseClass = this._getEntityPauseClass(isExtPaused, attrs);
      const pauseTitle = this._getEntityPauseTitle(isExtPaused, attrs);
      const badges: unknown[] = [];
      if (cap?.includes('cct_mode')) {
        badges.push(html`<span class="chip-badge">${this._localize('target.capability_cct')}</span>`);
      }
      if (cap?.includes('brightness_only')) {
        badges.push(html`<span class="chip-badge">${this._localize('target.capability_brightness')}</span>`);
      }
      if (cap?.includes('on_off_only')) {
        badges.push(html`<span class="chip-badge">${this._localize('target.capability_on_off')}</span>`);
      }
      if (isSoftwareTransition) {
        badges.push(html`<span class="chip-badge">${this._localize('target.capability_software_transition')}</span>`);
      }
      return html`<span class="entity-chip ${pauseClass} ${badges.length ? 'has-badge' : ''}" title="${pauseTitle}">${name}${badges}</span>`;
    });

    const audioTierLabel = op.audio_tier === 'rich'
      ? (this._localize('target.audio_tier_rich') || 'Beat sync')
      : null;

    return html`
      <div class="running-op-card scene-op-card ${isPaused ? 'op-paused' : ''}">
        <div class="running-op-header">
          <div class="running-op-info">
            <ha-icon class="running-op-icon" icon="${preset.icon || 'mdi:palette-swatch-variant'}"></ha-icon>
            <div class="running-op-details">
              <span class="running-op-name">${preset.name || this._localize('target.scene_button')}</span>
              ${preset.name ? html`<span class="running-op-entity"><span class="running-op-type">${this._localize('target.scene_button')}</span></span>` : ''}
              ${audioTierLabel ? html`
                <span class="running-op-entity">
                  <ha-icon icon="mdi:waveform" style="--mdc-icon-size: 14px; vertical-align: middle;"></ha-icon>
                  <span class="running-op-type">${audioTierLabel}</span>
                  ${op.audio_entity ? html`<span class="running-op-status">${this._getAudioDeviceName(op.audio_entity)}</span>` : ''}
                </span>
              ` : ''}
              ${op.audio_sensitivity != null ? html`
                <div class="audio-sensitivity-row">
                  <ha-icon icon="mdi:sine-wave" style="--mdc-icon-size: 14px; flex-shrink: 0;"></ha-icon>
                  <span class="sensitivity-label">${this._localize('target.sensitivity') || 'Sensitivity'}</span>
                  <input type="range" min="1" max="100" .value=${String(op.audio_sensitivity)}
                    @input=${(e: Event) => this._debounceAudioSensitivity(op.scene_id!, parseInt((e.target as HTMLInputElement).value))}
                  />
                  <span class="sensitivity-value">${op.audio_sensitivity}</span>
                </div>
              ` : ''}
              ${op.audio_squelch != null ? html`
                <div class="audio-sensitivity-row">
                  <ha-icon icon="mdi:volume-off" style="--mdc-icon-size: 14px; flex-shrink: 0;"></ha-icon>
                  <span class="sensitivity-label">${this._localize('target.audio_squelch_label') || 'Noise gate'}</span>
                  <input type="range" min="0" max="100" .value=${String(op.audio_squelch)}
                    @input=${(e: Event) => this._debounceAudioSquelch(op.scene_id!, parseInt((e.target as HTMLInputElement).value))}
                  />
                  <span class="sensitivity-value">${op.audio_squelch}</span>
                </div>
              ` : ''}
              ${op.audio_waiting ? html`
                <span class="running-op-pause-row">
                  <span class="running-op-status paused-text">${this._localize('target.audio_sensor_unavailable') || 'Audio sensor unavailable'}</span>
                </span>
              ` : ''}
              ${op.paused ? html`
                <span class="running-op-pause-row">
                  <span class="running-op-status paused-text">${this._localize('target.paused')}</span>
                </span>
              ` : ''}
            </div>
          </div>
          <div class="running-op-actions">
            ${extPausedEntities.length > 0
              ? html`
                  <ha-icon-button
                    .label=${this._localize('target.resume_control')}
                    @click=${() => this._resumeSceneEntities(extPausedEntities)}
                  >
                    <ha-icon icon="mdi:play-circle-outline"></ha-icon>
                  </ha-icon-button>
                `
              : ''}
            <ha-icon-button
              .label=${op.paused ? this._localize('target.resume') : this._localize('target.pause')}
              @click=${() => this._toggleScenePause(op)}
            >
              <ha-icon icon="mdi:${op.paused ? 'play' : 'pause'}"></ha-icon>
            </ha-icon-button>
            <ha-icon-button
              .label=${this._localize('target.stop')}
              @click=${() => this._stopRunningScene(op)}
            >
              <ha-icon icon="mdi:stop"></ha-icon>
            </ha-icon-button>
          </div>
        </div>
        <div class="entity-chip-list">
          ${entityChips}
        </div>
      </div>
    `;
  }

  private _renderMusicSyncOp(op: RunningOperation) {
    const entityName = this._getEntityName(op.entity_id!);
    return html`
      <div class="running-op-card">
        <div class="running-op-info">
          <ha-icon class="running-op-icon" icon="mdi:music-note"></ha-icon>
          <div class="running-op-details">
            <span class="running-op-name">${this._localize('music_sync.active_label')}</span>
            <span class="running-op-entity">
              <span class="running-op-type">${this._localize('music_sync.title')}</span>
              <span class="running-op-entity-name">${entityName}</span>
            </span>
          </div>
        </div>
        <div class="running-op-actions">
          <ha-icon-button
            .label=${this._localize('target.stop')}
            @click=${() => this._stopMusicSync(op.entity_id!)}
          >
            <ha-icon icon="mdi:stop"></ha-icon>
          </ha-icon-button>
        </div>
      </div>
    `;
  }

  private _renderCircadianOp(op: RunningOperation) {
    const entityName = this._getEntityName(op.entity_id!);
    const preset = this._resolvePresetInfo(op.preset_id);
    return html`
      <div class="running-op-card">
        <div class="running-op-info">
          <ha-icon class="running-op-icon" icon="${preset.icon || 'mdi:white-balance-sunny'}"></ha-icon>
          <div class="running-op-details">
            <span class="running-op-name">${preset.name || this._localize('target.circadian_label')}</span>
            <span class="running-op-entity">
              ${preset.name ? html`<span class="running-op-type">${this._localize('target.circadian_label')}</span>` : ''}
              <span class="running-op-entity-name">${entityName}</span>
              ${op.current_color_temp ? html`<span class="running-op-status">${op.current_color_temp}K</span>` : ''}
            </span>
          </div>
        </div>
        <div class="running-op-actions">
          <ha-icon-button
            .label=${this._localize('target.stop')}
            @click=${() => this._stopCircadian(op.entity_id!)}
          >
            <ha-icon icon="mdi:stop"></ha-icon>
          </ha-icon-button>
        </div>
      </div>
    `;
  }

  // ===================== helpers =====================

  private _resolvePresetInfo(presetId: string | null): { name: string | null; icon: string | null } {
    if (!presetId) return { name: null, icon: null };
    return this.presetLookup.get(presetId) ?? { name: presetId, icon: null };
  }

  private _formatAutoResumeRemaining(seconds: number): string {
    if (seconds >= 60) {
      const mins = Math.ceil(seconds / 60);
      return `${mins}m`;
    }
    return `${seconds}s`;
  }

  private _getEntityPauseClass(extPaused?: boolean, attrs?: {brightness: boolean; color: boolean}): string {
    if (!extPaused) return '';
    if (attrs) {
      if (attrs.brightness && attrs.color) return 'paused-all';
      if (attrs.brightness) return 'paused-brightness';
      if (attrs.color) return 'paused-color';
    }
    return 'paused-all';
  }

  private _getEntityPauseTitle(extPaused?: boolean, attrs?: {brightness: boolean; color: boolean}, autoResume?: number): string {
    if (!extPaused) return '';
    let detail: string;
    if (attrs) {
      if (attrs.brightness && attrs.color) detail = this._localize('target.externally_paused');
      else if (attrs.brightness) detail = this._localize('target.paused_brightness_only');
      else if (attrs.color) detail = this._localize('target.paused_color_only');
      else detail = this._localize('target.externally_paused');
    } else {
      detail = this._localize('target.externally_paused');
    }
    if (autoResume) {
      detail += ` (${this._formatAutoResumeRemaining(autoResume)})`;
    }
    return detail;
  }

  // ===================== audio sensitivity / squelch =====================

  private _debounceAudioSensitivity(sceneId: string, value: number): void {
    if (this._sensitivityDebounceTimer) {
      clearTimeout(this._sensitivityDebounceTimer);
    }
    this._sensitivityDebounceTimer = setTimeout(() => {
      this._updateAudioSensitivity(sceneId, value);
    }, 300);
  }

  private async _updateAudioSensitivity(sceneId: string, sensitivity: number): Promise<void> {
    try {
      await fetch(`/api/aqara_advanced_lighting/scene_audio_sensitivity`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.hass.auth.data.access_token}`,
        },
        body: JSON.stringify({ scene_id: sceneId, sensitivity }),
      });
    } catch (e) {
      console.error('Failed to update audio sensitivity:', e);
    }
  }

  private _debounceAudioSquelch(sceneId: string, value: number): void {
    if (this._squelchDebounceTimer) {
      clearTimeout(this._squelchDebounceTimer);
    }
    this._squelchDebounceTimer = setTimeout(() => {
      this._updateAudioSquelch(sceneId, value);
    }, 300);
  }

  private async _updateAudioSquelch(sceneId: string, squelch: number): Promise<void> {
    try {
      await fetch(`/api/aqara_advanced_lighting/scene_audio_squelch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.hass.auth.data.access_token}`,
        },
        body: JSON.stringify({ scene_id: sceneId, squelch }),
      });
    } catch (e) {
      console.error('Failed to update audio squelch:', e);
    }
  }

  // ===================== effect audio sensitivity =====================

  private _debounceEffectAudioSensitivity(entityId: string, value: number): void {
    if (this._effectSensitivityDebounceTimer) {
      clearTimeout(this._effectSensitivityDebounceTimer);
    }
    this._effectSensitivityDebounceTimer = setTimeout(() => {
      this._updateEffectAudioSensitivity(entityId, value);
    }, 300);
  }

  private async _updateEffectAudioSensitivity(entityId: string, sensitivity: number): Promise<void> {
    try {
      await fetch(`/api/aqara_advanced_lighting/effect_audio_sensitivity`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.hass.auth.data.access_token}`,
        },
        body: JSON.stringify({ entity_id: entityId, sensitivity }),
      });
    } catch (e) {
      console.error('Failed to update effect audio sensitivity:', e);
    }
  }

  // ===================== action handlers =====================

  private async _stopGroupedEffect(ops: RunningOperation[]): Promise<void> {
    await this.hass.callService('aqara_advanced_lighting', 'stop_effect', {
      entity_id: ops.map(op => op.entity_id!),
      restore_state: true,
    });
    this._fireChanged();
  }

  private async _stopRunningEffect(entityId: string): Promise<void> {
    await this.hass.callService('aqara_advanced_lighting', 'stop_effect', {
      entity_id: [entityId],
      restore_state: true,
    });
    this._fireChanged();
  }

  private async _toggleSequencePause(op: RunningOperation): Promise<void> {
    if (!op.entity_id) return;
    const isCCT = op.type === 'cct_sequence';
    const service = op.paused
      ? (isCCT ? 'resume_cct_sequence' : 'resume_segment_sequence')
      : (isCCT ? 'pause_cct_sequence' : 'pause_segment_sequence');
    await this.hass.callService('aqara_advanced_lighting', service, {
      entity_id: [op.entity_id],
    });
    this._fireChanged();
  }

  private async _stopRunningSequence(op: RunningOperation): Promise<void> {
    if (!op.entity_id) return;
    const service = op.type === 'cct_sequence'
      ? 'stop_cct_sequence'
      : 'stop_segment_sequence';
    await this.hass.callService('aqara_advanced_lighting', service, {
      entity_id: [op.entity_id],
    });
    this._fireChanged();
  }

  private async _toggleGroupedSequencePause(ops: RunningOperation[]): Promise<void> {
    const isCCT = ops[0]!.type === 'cct_sequence';
    const anyPaused = ops.some(op => op.paused);
    const service = anyPaused
      ? (isCCT ? 'resume_cct_sequence' : 'resume_segment_sequence')
      : (isCCT ? 'pause_cct_sequence' : 'pause_segment_sequence');
    await this.hass.callService('aqara_advanced_lighting', service, {
      entity_id: ops.map(op => op.entity_id!),
    });
    this._fireChanged();
  }

  private async _stopGroupedSequence(ops: RunningOperation[]): Promise<void> {
    const service = ops[0]!.type === 'cct_sequence'
      ? 'stop_cct_sequence'
      : 'stop_segment_sequence';
    await this.hass.callService('aqara_advanced_lighting', service, {
      entity_id: ops.map(op => op.entity_id!),
    });
    this._fireChanged();
  }

  private async _toggleScenePause(op: RunningOperation): Promise<void> {
    if (!op.entity_ids?.length) return;
    const service = op.paused ? 'resume_dynamic_scene' : 'pause_dynamic_scene';
    await this.hass.callService('aqara_advanced_lighting', service, {
      entity_id: op.entity_ids,
    });
    this._fireChanged();
  }

  private async _stopRunningScene(op: RunningOperation): Promise<void> {
    if (!op.entity_ids?.length) return;
    await this.hass.callService('aqara_advanced_lighting', 'stop_dynamic_scene', {
      entity_id: op.entity_ids,
    });
    this._fireChanged();
  }

  private async _resumeEntityControl(entityId: string): Promise<void> {
    await this.hass.callService('aqara_advanced_lighting', 'resume_entity_control', {
      entity_id: [entityId],
    });
    this._fireChanged();
  }

  private async _resumeSceneEntities(entityIds: string[]): Promise<void> {
    await this.hass.callService('aqara_advanced_lighting', 'resume_entity_control', {
      entity_id: entityIds,
    });
    this._fireChanged();
  }

  private async _stopMusicSync(entityId: string): Promise<void> {
    await this.hass.callService('aqara_advanced_lighting', 'set_music_sync', {
      entity_id: [entityId],
      enabled: false,
    });
    this._fireChanged();
  }

  private async _stopCircadian(entityId: string): Promise<void> {
    await this.hass.callService('aqara_advanced_lighting', 'stop_circadian_mode', {
      entity_id: [entityId],
    });
    this._fireChanged();
  }

  // ===================== styles =====================

  static styles = css`
    :host {
      display: block;
    }

    .running-ops-container {
      width: 100%;
    }

    .running-ops-empty {
      text-align: center;
      color: var(--secondary-text-color);
      padding: 12px 0;
      font-size: var(--ha-font-size-m, 14px);
    }

    .running-ops-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 8px;
    }

    .running-op-card {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 12px;
      background: var(--card-background-color, var(--ha-card-background, #fff));
      border: 1px solid var(--divider-color, #e0e0e0);
      border-left: 3px solid var(--primary-color);
      border-radius: var(--ha-card-border-radius, 12px);
      gap: 8px;
    }

    .running-op-card.scene-op-card {
      flex-direction: column;
      align-items: stretch;
      gap: 0;
    }

    .running-op-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      min-width: 0;
      overflow: hidden;
    }

    .running-op-card.op-paused {
      border-left-color: var(--disabled-text-color, #999);
      border-left-style: dashed;
    }

    .running-op-card.externally-paused {
      border-color: var(--warning-color, #ff9800);
      border-left-width: 3px;
      border-left-style: dashed;
    }

    .running-op-info {
      display: flex;
      align-items: center;
      gap: 12px;
      flex: 1;
      min-width: 0;
      overflow: hidden;
    }

    .running-op-icon {
      color: var(--primary-color);
      flex-shrink: 0;
      --mdc-icon-size: 20px;
      background: rgba(var(--rgb-primary-color), 0.1);
      border-radius: 50%;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .op-paused .running-op-icon {
      color: var(--disabled-text-color, #999);
      background: rgba(var(--rgb-disabled-color, 158, 158, 158), 0.1);
    }

    .running-op-details {
      display: flex;
      flex-direction: column;
      min-width: 0;
      overflow: hidden;
    }

    .audio-sensitivity-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 4px;
      min-width: 0;
    }

    .audio-sensitivity-row input[type="range"] {
      flex: 1;
      min-width: 0;
      accent-color: var(--primary-color);
    }

    .audio-sensitivity-row .sensitivity-label {
      font-size: 12px;
      white-space: nowrap;
      flex-shrink: 0;
    }

    .audio-sensitivity-row .sensitivity-value {
      font-size: 12px;
      min-width: 24px;
      text-align: right;
      flex-shrink: 0;
    }

    .running-op-name {
      font-size: var(--ha-font-size-m, 14px);
      font-weight: var(--ha-font-weight-medium, 500);
      color: var(--primary-text-color);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .running-op-type {
      font-size: var(--ha-font-size-xs, 11px);
      font-weight: var(--ha-font-weight-medium, 500);
      color: var(--secondary-text-color);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .running-op-entity {
      font-size: var(--ha-font-size-s, 12px);
      color: var(--secondary-text-color);
      display: flex;
      align-items: center;
      gap: 6px;
      min-width: 0;
    }

    .running-op-entity-name {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      min-width: 0;
    }

    .entity-chip-list {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      padding: 4px 0 4px 44px;
    }

    .entity-chip {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: var(--ha-font-size-s, 12px);
      color: var(--primary-text-color);
      background: var(--secondary-background-color);
      padding: 2px 8px;
      border-radius: 12px;
      white-space: nowrap;
      transition: background-color 0.3s ease, color 0.3s ease;
    }

    .entity-chip.paused-color {
      background: #d97706;
      color: #fff;
      cursor: help;
    }

    .entity-chip.paused-brightness {
      background: #3b82f6;
      color: #fff;
      cursor: help;
    }

    .entity-chip.paused-all {
      background: #dc2626;
      color: #fff;
      cursor: help;
    }

    .chip-badge {
      font-size: 10px;
      padding: 0 5px;
      border-radius: 8px;
      background: rgba(var(--rgb-primary-color), 0.12);
      color: var(--primary-color);
    }

    .entity-chip.paused-color .chip-badge,
    .entity-chip.paused-brightness .chip-badge,
    .entity-chip.paused-all .chip-badge {
      background: rgba(255, 255, 255, 0.25);
      color: #fff;
    }

    .running-op-status {
      font-weight: var(--ha-font-weight-medium, 500);
    }

    .running-op-status.paused-text {
      color: var(--disabled-text-color, #999);
    }

    .running-op-status.externally-paused-text {
      color: var(--warning-color, #ff9800);
    }

    .running-op-bpm {
      font-size: var(--ha-font-size-xs, 11px);
      font-weight: var(--ha-font-weight-medium, 500);
      color: var(--secondary-text-color);
      margin-left: 6px;
    }

    .running-op-pause-row {
      font-size: var(--ha-font-size-s, 12px);
      display: flex;
      align-items: center;
      gap: 6px;
      flex-wrap: wrap;
    }

    .running-op-actions {
      display: flex;
      align-items: center;
      gap: 0;
      flex-shrink: 0;
    }

    .running-op-actions ha-icon-button {
      --ha-icon-button-size: 36px;
      --mdc-icon-size: 20px;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'aqara-running-operations': AqaraRunningOperations;
  }
}
