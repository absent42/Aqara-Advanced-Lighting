/**
 * <aqara-config-tab> — Device configuration tab extracted from aqara-panel.
 *
 * Manages transition curve, initial brightness, dimming settings,
 * T1 Strip length, segment zones, generic light software transitions,
 * and on-device audio config.
 *
 * Fires events to the parent for state changes:
 *   - 'collapsed-changed'           { sectionId, collapsed }
 *   - 'global-preferences-changed'  partial prefs object
 *   - 'toast'                       { message }
 */
import { LitElement, html, css, PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { baseStyles, sectionStyles, configStyles, sharedFormStyles } from './styles/index';
import { localize, renderInput } from './editor-constants';
import { getEntityFriendlyName, getEntityIcon, getEntityDeviceType } from './entity-utils';
import type { SupportedEntityMap } from './entity-utils';
import { findSiblingNumberEntity, findAllSiblingNumberEntities } from './sibling-entity-finder';
import type { HomeAssistant, Translations, EntityAudioConfig } from './types';
import './segment-selector';
import './transition-curve-editor';

type Z2MInstance = {
  entry_id: string;
  title: string;
  backend_type: string;
  z2m_base_topic: string | null;
  device_counts: { t2_rgb: number; t2_cct: number; t1m: number; t1_strip: number; other: number; total: number };
  devices: string[];
};

@customElement('aqara-config-tab')
export class AqaraConfigTab extends LitElement {
  // --- Properties from parent ---
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) selectedEntities: string[] = [];
  @property({ attribute: false }) supportedEntities: SupportedEntityMap = new Map();
  @property({ attribute: false }) translations!: Translations;
  @property({ attribute: false }) collapsed: Record<string, boolean> = {};
  @property({ attribute: false }) includeAllLights = false;
  @property({ attribute: false }) z2mInstances: Z2MInstance[] = [];
  @property({ attribute: false }) softwareTransitionEntities: string[] = [];
  @property({ attribute: false }) entityAudioConfig: Record<string, EntityAudioConfig> = {};
  @property({ type: String }) audioOverrideEntity = '';

  // --- Internal state (owned by this component) ---
  @state() private _localCurvature = 1.0;
  @state() private _applyingCurvature = false;
  @state() private _curvatureApplied = false;
  @state() private _deviceZones: Map<string, Array<{ name: string; segments: string }>> = new Map();
  @state() private _zoneEditing: Map<string, Array<{ name: string; segments: string }>> = new Map();
  @state() private _zoneSaving = false;
  @state() private _instanceDevicesExpanded: Set<string> = new Set();
  @state() private _audioConfigSelectedEntity = '';

  static styles = [
    baseStyles, sectionStyles, configStyles, sharedFormStyles,
    css`:host { overflow-y: visible; scrollbar-gutter: auto; }`,
  ];

  // --- Localize helper ---
  private _localize(key: string, values?: Record<string, string>): string {
    return localize(this.translations, key, values);
  }

  // --- Entity helpers ---
  private _getEntityFriendlyName(entityId: string): string {
    if (!this.hass) return entityId;
    return getEntityFriendlyName(this.hass, entityId);
  }

  private _getEntityIcon(entityId: string): string {
    if (!this.hass) return 'mdi:lightbulb';
    return getEntityIcon(this.hass, entityId);
  }

  private _getEntityDeviceType(entityId: string): string | null {
    if (!this.hass) return null;
    return getEntityDeviceType(this.hass, entityId, this.supportedEntities, this.includeAllLights);
  }

  // --- Fire events to parent ---
  private _fireCollapsedChanged(sectionId: string, collapsed: boolean): void {
    this.dispatchEvent(new CustomEvent('collapsed-changed', {
      detail: { sectionId, collapsed },
      bubbles: true,
      composed: true,
    }));
  }

  private _fireGlobalPreferencesChanged(prefs: Record<string, unknown>): void {
    this.dispatchEvent(new CustomEvent('global-preferences-changed', {
      detail: prefs,
      bubbles: true,
      composed: true,
    }));
  }

  private _handleAudioOverrideEntityChange(e: CustomEvent): void {
    this.dispatchEvent(new CustomEvent('audio-override-entity-changed', {
      detail: e.detail,
      bubbles: true,
      composed: true,
    }));
  }

  private _showToast(message: string): void {
    this.dispatchEvent(new CustomEvent('toast', {
      detail: { message },
      bubbles: true,
      composed: true,
    }));
  }

  // --- Lifecycle ---
  protected willUpdate(changedProps: PropertyValues): void {
    super.willUpdate(changedProps);

    if (changedProps.has('selectedEntities') || changedProps.has('supportedEntities')) {
      // Reload curvature and zones when entity selection or supported entities change
      this._loadCurvatureFromEntity();
      this._loadZonesForSelectedDevices();
    }
  }

  // --- Expansion panel handler ---
  private _handleExpansionChange(sectionId: string, e: CustomEvent): void {
    const expanded = e.detail.expanded;
    this._fireCollapsedChanged(sectionId, !expanded);
  }

  private _toggleInstanceDevices(entryId: string): void {
    const next = new Set(this._instanceDevicesExpanded);
    if (next.has(entryId)) {
      next.delete(entryId);
    } else {
      next.add(entryId);
    }
    this._instanceDevicesExpanded = next;
  }

  // ===================== Device type helpers =====================

  private _getSelectedDeviceTypes(): string[] {
    if (!this.selectedEntities.length || !this.hass) return [];
    const deviceTypes = new Set<string>();
    for (const entityId of this.selectedEntities) {
      const dt = this._getEntityDeviceType(entityId);
      if (dt) deviceTypes.add(dt);
    }
    return Array.from(deviceTypes);
  }

  private _getT2CompatibleEntities(): string[] {
    if (!this.hass) return [];
    return this.selectedEntities.filter(entityId => {
      const dt = this._getEntityDeviceType(entityId);
      return dt === 't2_bulb' || dt === 't2_cct';
    });
  }

  private _getT1StripCompatibleEntities(): string[] {
    if (!this.hass) return [];
    return this.selectedEntities.filter(entityId => {
      return this._getEntityDeviceType(entityId) === 't1_strip';
    });
  }

  private _getT1StripSegmentCount(): number {
    const defaultSegments = 10;
    if (!this.selectedEntities.length || !this.hass) return defaultSegments;

    for (const entityId of this.selectedEntities) {
      if (this._getEntityDeviceType(entityId) !== 't1_strip') continue;
      const entity = this.hass.states[entityId];
      if (!entity) continue;

      let lengthMeters: number | undefined;

      const attrLength = entity.attributes.length as number | undefined;
      if (attrLength && typeof attrLength === 'number' && attrLength > 0) {
        lengthMeters = attrLength;
      }

      if (lengthMeters === undefined) {
        const baseName = entityId.split('.')[1] || '';
        for (const domain of ['number', 'sensor']) {
          const lengthEntityId = `${domain}.${baseName}_length`;
          const lengthEntity = this.hass.states[lengthEntityId];
          if (lengthEntity && lengthEntity.state && lengthEntity.state !== 'unknown' && lengthEntity.state !== 'unavailable') {
            const parsed = parseFloat(lengthEntity.state);
            if (!isNaN(parsed) && parsed > 0) {
              lengthMeters = parsed;
              break;
            }
          }
        }
      }

      if (lengthMeters !== undefined && lengthMeters > 0) {
        return Math.floor(lengthMeters * 5);
      }
    }

    return defaultSegments;
  }

  // ===================== Sibling entity finders =====================

  private _findSiblingNumberEntity(lightEntityId: string, suffix: string): string | undefined {
    if (!this.hass) return undefined;
    return findSiblingNumberEntity(this.hass, this.supportedEntities, lightEntityId, suffix);
  }

  private _findAllSiblingNumberEntities(lightEntityIds: string[], suffix: string): string[] {
    if (!this.hass) return [];
    return findAllSiblingNumberEntities(this.hass, this.supportedEntities, lightEntityIds, suffix);
  }

  private _findTransitionCurveEntity(): string | undefined {
    const t2Entities = this._getT2CompatibleEntities();
    for (const eid of t2Entities) {
      const found = this._findSiblingNumberEntity(eid, 'transition_curve_curvature');
      if (found) return found;
    }
    return undefined;
  }

  private _findInitialBrightnessEntity(): string | undefined {
    const t2Entities = this._getT2CompatibleEntities();
    for (const eid of t2Entities) {
      const found = this._findSiblingNumberEntity(eid, 'transition_initial_brightness');
      if (found) return found;
    }
    return undefined;
  }

  private _findAllTransitionCurveEntities(): string[] {
    return this._findAllSiblingNumberEntities(this._getT2CompatibleEntities(), 'transition_curve_curvature');
  }

  private _findAllInitialBrightnessEntities(): string[] {
    return this._findAllSiblingNumberEntities(this._getT2CompatibleEntities(), 'transition_initial_brightness');
  }

  private _findAllDimmingEntities(suffix: string): string[] {
    return this._findAllSiblingNumberEntities(this.selectedEntities, suffix);
  }

  private _findDimmingEntity(suffix: string): string | undefined {
    for (const eid of this.selectedEntities) {
      if (!this.hass?.states[eid]) continue;
      const found = this._findSiblingNumberEntity(eid, suffix);
      if (found) return found;
    }
    return undefined;
  }

  private _findOnOffDurationEntity(): string | undefined {
    return this._findDimmingEntity('on_off_duration');
  }

  private _findOffOnDurationEntity(): string | undefined {
    return this._findDimmingEntity('off_on_duration');
  }

  private _findDimmingRangeMinEntity(): string | undefined {
    return this._findDimmingEntity('dimming_range_minimum');
  }

  private _findDimmingRangeMaxEntity(): string | undefined {
    return this._findDimmingEntity('dimming_range_maximum');
  }

  private _findT1StripLengthEntity(): string | undefined {
    const t1StripEntities = this._getT1StripCompatibleEntities();
    for (const eid of t1StripEntities) {
      const found = this._findSiblingNumberEntity(eid, 'length');
      if (found) return found;
    }
    return undefined;
  }

  private _findAllT1StripLengthEntities(): string[] {
    return this._findAllSiblingNumberEntities(this._getT1StripCompatibleEntities(), 'length');
  }

  // ===================== Segment devices =====================

  private _getSelectedSegmentDevices(): Map<string, { device_type: string; segment_count: number; z2m_friendly_name: string; entity_id: string }> {
    const devices = new Map<string, { device_type: string; segment_count: number; z2m_friendly_name: string; entity_id: string }>();
    for (const entityId of this.selectedEntities) {
      const info = this.supportedEntities.get(entityId);
      if (!info?.ieee_address) continue;
      if (info.device_type !== 't1m' && info.device_type !== 't1_strip') continue;
      if (devices.has(info.ieee_address)) continue;
      const segmentCount = info.device_type === 't1_strip'
        ? this._getT1StripSegmentCount()
        : (info.segment_count || 0);
      if (segmentCount === 0) continue;
      devices.set(info.ieee_address, {
        device_type: info.device_type,
        segment_count: segmentCount,
        z2m_friendly_name: info.z2m_friendly_name,
        entity_id: entityId,
      });
    }
    return devices;
  }

  // ===================== Zone methods =====================

  private async _loadZonesForDevice(ieeeAddress: string): Promise<void> {
    if (!this.hass) return;
    try {
      const data = await this.hass.callApi<{ zones?: Record<string, string> }>('GET', `aqara_advanced_lighting/segment_zones/${encodeURIComponent(ieeeAddress)}`);
      const zones: Array<{ name: string; segments: string }> = Object.entries(data.zones || {}).map(
        ([name, segments]) => ({ name, segments: segments as string })
      );
      this._deviceZones = new Map(this._deviceZones).set(ieeeAddress, zones);
      this._zoneEditing = new Map(this._zoneEditing).set(ieeeAddress, zones.map(z => ({ ...z })));
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('Failed to load zones for device:', ieeeAddress, err);
    }
  }

  private async _loadZonesForSelectedDevices(): Promise<void> {
    const devices = this._getSelectedSegmentDevices();
    await Promise.all(
      Array.from(devices.keys()).map(ieee => this._loadZonesForDevice(ieee))
    );
  }

  private _validateSegmentRange(rangeStr: string, maxSegments: number, zoneName: string): string | null {
    const trimmed = rangeStr.trim().toLowerCase();
    const keywords = new Set(['odd', 'even', 'all', 'first-half', 'second-half']);
    if (keywords.has(trimmed)) return null;

    const parts = trimmed.split(',');
    for (const part of parts) {
      const p = part.trim();
      const rangeMatch = p.match(/^(\d+)-(\d+)$/);
      if (rangeMatch) {
        const start = parseInt(rangeMatch[1] ?? '', 10);
        const end = parseInt(rangeMatch[2] ?? '', 10);
        if (isNaN(start) || isNaN(end)) {
          return this._localize('config.zone_invalid_range')
            .replace('{name}', zoneName).replace('{range}', p);
        }
        if (start > maxSegments || end > maxSegments) {
          const exceeding = Math.max(start, end);
          return this._localize('config.zone_out_of_range')
            .replace('{name}', zoneName)
            .replace('{segment}', String(exceeding))
            .replace('{max}', String(maxSegments));
        }
      } else {
        const num = parseInt(p, 10);
        if (isNaN(num)) {
          return this._localize('config.zone_invalid_range')
            .replace('{name}', zoneName).replace('{range}', p);
        }
        if (num > maxSegments) {
          return this._localize('config.zone_out_of_range')
            .replace('{name}', zoneName)
            .replace('{segment}', String(num))
            .replace('{max}', String(maxSegments));
        }
      }
    }
    return null;
  }

  private async _saveZones(ieeeAddress: string, maxSegments: number): Promise<void> {
    const editZones = this._zoneEditing.get(ieeeAddress) || [];
    const zonesPayload: Record<string, string> = {};
    const namesSeen = new Set<string>();

    for (const zone of editZones) {
      const name = zone.name.trim();
      const segments = zone.segments.trim();
      if (!name && !segments) continue;
      if (!name) {
        this._showToast(this._localize('config.zone_name_required'));
        return;
      }
      if (!segments) {
        this._showToast(this._localize('config.zone_segments_required'));
        return;
      }
      const nameLower = name.toLowerCase();
      if (namesSeen.has(nameLower)) {
        this._showToast(this._localize('config.zone_duplicate_name', { name }));
        return;
      }
      namesSeen.add(nameLower);

      const rangeError = this._validateSegmentRange(segments, maxSegments, name);
      if (rangeError) {
        this._showToast(rangeError);
        return;
      }

      zonesPayload[name] = segments;
    }

    this._zoneSaving = true;
    try {
      await this.hass!.callApi('PUT', `aqara_advanced_lighting/segment_zones/${encodeURIComponent(ieeeAddress)}`, { zones: zonesPayload });
      await this._loadZonesForDevice(ieeeAddress);
      this._showToast(this._localize('config.zone_saved'));
    } catch (err: any) {
      this._showToast(err?.body?.message || this._localize('config.zone_save_error'));
    } finally {
      this._zoneSaving = false;
    }
  }

  private _addZoneRow(ieeeAddress: string): void {
    const current = this._zoneEditing.get(ieeeAddress) || [];
    const updated = [...current, { name: '', segments: '' }];
    this._zoneEditing = new Map(this._zoneEditing).set(ieeeAddress, updated);
  }

  private async _removeZoneRow(ieeeAddress: string, index: number): Promise<void> {
    const current = this._zoneEditing.get(ieeeAddress) || [];
    const zone = current[index];

    if (zone) {
      const savedZones = this._deviceZones.get(ieeeAddress) || [];
      const isSaved = savedZones.some(
        z => z.name.toLowerCase() === zone.name.trim().toLowerCase() && zone.name.trim() !== ''
      );
      if (isSaved) {
        try {
          await this.hass!.callApi('DELETE', `aqara_advanced_lighting/segment_zones/${encodeURIComponent(ieeeAddress)}/${encodeURIComponent(zone.name.trim())}`);
          await this._loadZonesForDevice(ieeeAddress);
          return;
        } catch {
          this._showToast(this._localize('config.zone_save_error'));
          return;
        }
      }
    }

    const updated = current.filter((_, i) => i !== index);
    this._zoneEditing = new Map(this._zoneEditing).set(ieeeAddress, updated);
  }

  private _updateZoneField(ieeeAddress: string, index: number, field: 'name' | 'segments', value: string): void {
    const current = this._zoneEditing.get(ieeeAddress) || [];
    const updated = current.map((z, i) => i === index ? { ...z, [field]: value } : z);
    this._zoneEditing = new Map(this._zoneEditing).set(ieeeAddress, updated);
  }

  private _zonesModified(ieeeAddress: string): boolean {
    const saved = this._deviceZones.get(ieeeAddress) || [];
    const editing = this._zoneEditing.get(ieeeAddress) || [];
    if (saved.length !== editing.length) return true;
    return saved.some((z, i) => z.name !== editing[i]?.name || z.segments !== editing[i]?.segments);
  }

  // ===================== Handler methods =====================

  private async _handleDimmingSettingChange(
    e: CustomEvent,
    ...suffixes: string[]
  ): Promise<void> {
    if (!this.hass) return;

    const value = e.detail.value;
    if (typeof value !== 'number') return;

    const entities: string[] = [];
    for (const suffix of suffixes) {
      for (const eid of this._findAllDimmingEntities(suffix)) {
        if (!entities.includes(eid)) entities.push(eid);
      }
    }
    if (!entities.length) return;

    try {
      await Promise.all(
        entities.map(entityId =>
          this.hass!.callService('number', 'set_value', {
            entity_id: entityId,
            value: value,
          })
        )
      );
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to set dimming setting:', err);
    }
  }

  private async _handleDimmingRangeMinChange(e: CustomEvent): Promise<void> {
    const minEntityId = this._findDimmingRangeMinEntity();
    const maxEntityId = this._findDimmingRangeMaxEntity();
    if (!this.hass || !minEntityId) return;

    const newMin = e.detail.value;
    if (typeof newMin !== 'number') return;

    const maxValue = maxEntityId && this.hass.states[maxEntityId]
      ? parseFloat(this.hass.states[maxEntityId].state) || 100
      : 100;

    if (newMin >= maxValue) return;

    await this._handleDimmingSettingChange(e, 'dimming_range_minimum');
  }

  private async _handleDimmingRangeMaxChange(e: CustomEvent): Promise<void> {
    const minEntityId = this._findDimmingRangeMinEntity();
    const maxEntityId = this._findDimmingRangeMaxEntity();
    if (!this.hass || !maxEntityId) return;

    const newMax = e.detail.value;
    if (typeof newMax !== 'number') return;

    const minValue = minEntityId && this.hass.states[minEntityId]
      ? parseFloat(this.hass.states[minEntityId].state) || 1
      : 1;

    if (newMax <= minValue) return;

    await this._handleDimmingSettingChange(e, 'dimming_range_maximum');
  }

  private async _handleOnOffDurationChange(e: CustomEvent): Promise<void> {
    const entity = this._findOnOffDurationEntity();
    if (!this.hass || !entity) return;
    await this._handleDimmingSettingChange(e, 'on_off_duration');
  }

  private async _handleOffOnDurationChange(e: CustomEvent): Promise<void> {
    const entity = this._findOffOnDurationEntity();
    if (!this.hass || !entity) return;
    await this._handleDimmingSettingChange(e, 'off_on_duration');
  }

  private async _handleInitialBrightnessChange(e: CustomEvent): Promise<void> {
    if (!this.hass) return;

    const value = e.detail.value;
    if (typeof value !== 'number') return;

    const brightnessEntities = this._findAllInitialBrightnessEntities();

    if (brightnessEntities.length) {
      try {
        await Promise.all(
          brightnessEntities.map(entityId =>
            this.hass!.callService('number', 'set_value', {
              entity_id: entityId,
              value: value,
            })
          )
        );
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Failed to set initial brightness:', err);
      }
    }
  }

  private async _handleT1StripLengthChange(e: CustomEvent): Promise<void> {
    if (!this.hass) return;

    const value = e.detail.value;
    if (typeof value !== 'number') return;

    const entities = this._findAllT1StripLengthEntities();

    if (entities.length) {
      try {
        await Promise.all(
          entities.map(entityId =>
            this.hass!.callService('number', 'set_value', {
              entity_id: entityId,
              value: value,
            })
          )
        );
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Failed to set T1 Strip length:', err);
      }
    }
  }

  // ===================== Curvature =====================

  private _handleCurvatureInput(e: CustomEvent): void {
    const { curvature } = e.detail;
    if (typeof curvature === 'number') {
      this._localCurvature = curvature;
    }
  }

  private _handleCurvatureNumberChange(e: CustomEvent): void {
    const value = e.detail.value;
    if (typeof value === 'number') {
      const clamped = Math.max(0.2, Math.min(6.0, value));
      this._localCurvature = Math.round(clamped * 100) / 100;
    }
  }

  private _getCurvatureDescription(): string {
    if (this._localCurvature < 0.9) {
      return this._localize('config.curvature_fast_slow');
    } else if (this._localCurvature <= 1.1) {
      return this._localize('config.curvature_linear');
    } else {
      return this._localize('config.curvature_slow_fast');
    }
  }

  private async _applyCurvature(): Promise<void> {
    if (!this.hass) return;

    this._applyingCurvature = true;

    try {
      const entities = this._findAllTransitionCurveEntities();

      if (entities.length) {
        await Promise.all(
          entities.map(entityId =>
            this.hass!.callService('number', 'set_value', {
              entity_id: entityId,
              value: this._localCurvature,
            })
          )
        );
      }

      this._curvatureApplied = true;
      this._showToast(this._localize('config.curvature_applied'));
      setTimeout(() => {
        this._curvatureApplied = false;
      }, 2000);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to set transition curve curvature:', err);
      this._showToast(this._localize('config.curvature_apply_error'));
    } finally {
      this._applyingCurvature = false;
    }
  }

  private _loadCurvatureFromEntity(): void {
    const entityId = this._findTransitionCurveEntity();
    if (this.hass && entityId) {
      const entity = this.hass.states[entityId];
      if (entity) {
        const curvature = parseFloat(entity.state);
        if (!isNaN(curvature) && curvature >= 0.2 && curvature <= 6.0) {
          this._localCurvature = Math.round(curvature * 100) / 100;
          return;
        }
      }
    }
  }

  // ===================== Software transitions & audio config =====================

  private _softwareTransitionEntitiesChanged(e: CustomEvent): void {
    const updated = e.detail.value || [];
    this._fireGlobalPreferencesChanged({ software_transition_entities: updated });
  }

  private _audioConfigEntityChanged(e: CustomEvent): void {
    this._audioConfigSelectedEntity = e.detail.value || '';
  }

  private _updateEntityAudioConfig(field: string, value: string): void {
    const entity = this._audioConfigSelectedEntity;
    if (!entity) return;
    const config = { ...this.entityAudioConfig };
    config[entity] = { ...(config[entity] || {}), [field]: value };
    if (Object.values(config[entity]!).every(v => !v)) {
      delete config[entity];
    }
    this._fireGlobalPreferencesChanged({ entity_audio_config: config });
  }

  private _deleteEntityAudioConfig(entityId: string): void {
    const config = { ...this.entityAudioConfig };
    delete config[entityId];
    if (this._audioConfigSelectedEntity === entityId) {
      this._audioConfigSelectedEntity = '';
    }
    this._fireGlobalPreferencesChanged({ entity_audio_config: config });
  }

  // ===================== Rendering =====================

  protected render() {
    const hasSelection = this.selectedEntities.length > 0;
    const deviceTypes = this._getSelectedDeviceTypes();
    const hasT2Device = deviceTypes.includes('t2_bulb') || deviceTypes.includes('t2_cct');
    const hasT1Strip = deviceTypes.includes('t1_strip');
    const hasSegmentDevice = deviceTypes.includes('t1m') || deviceTypes.includes('t1_strip');

    const transitionCurveEntity = this._findTransitionCurveEntity();
    const initialBrightnessEntity = this._findInitialBrightnessEntity();
    const t1StripLengthEntity = this._findT1StripLengthEntity();
    const onOffDurationEntity = this._findOnOffDurationEntity();
    const offOnDurationEntity = this._findOffOnDurationEntity();
    const dimmingRangeMinEntity = this._findDimmingRangeMinEntity();
    const dimmingRangeMaxEntity = this._findDimmingRangeMaxEntity();

    const initialBrightnessValue = initialBrightnessEntity && this.hass?.states[initialBrightnessEntity]
      ? parseFloat(this.hass.states[initialBrightnessEntity].state) || 0
      : 0;

    const t1StripLengthValue = t1StripLengthEntity && this.hass?.states[t1StripLengthEntity]
      ? parseFloat(this.hass.states[t1StripLengthEntity].state) || 2
      : 2;

    const onOffDurationValue = onOffDurationEntity && this.hass?.states[onOffDurationEntity]
      ? parseFloat(this.hass.states[onOffDurationEntity].state) || 0
      : 0;

    const offOnDurationValue = offOnDurationEntity && this.hass?.states[offOnDurationEntity]
      ? parseFloat(this.hass.states[offOnDurationEntity].state) || 0
      : 0;

    const dimmingRangeMinValue = dimmingRangeMinEntity && this.hass?.states[dimmingRangeMinEntity]
      ? parseFloat(this.hass.states[dimmingRangeMinEntity].state) || 1
      : 1;

    const dimmingRangeMaxValue = dimmingRangeMaxEntity && this.hass?.states[dimmingRangeMaxEntity]
      ? parseFloat(this.hass.states[dimmingRangeMaxEntity].state) || 100
      : 100;

    const hasDimmingEntities = onOffDurationEntity || offOnDurationEntity || dimmingRangeMinEntity || dimmingRangeMaxEntity;

    return html`
      <!-- Zigbee Instances Info Section -->
      <ha-expansion-panel
        outlined
        .expanded=${!this.collapsed['instances']}
        @expanded-changed=${(e: CustomEvent) => this._handleExpansionChange('instances', e)}
      >
        <div slot="header" class="section-header">
          <div>
            <div class="section-title">${this._localize('instances.section_title')}</div>
            <div class="section-subtitle">${(() => {
              const instanceCount = this.z2mInstances.length;
              const deviceCount = this.z2mInstances.reduce((sum, i) => sum + i.device_counts.total, 0);
              const key = instanceCount === 1 && deviceCount === 1 ? 'instances.subtitle_single' : 'instances.subtitle_plural';
              return this._localize(key, { count: String(instanceCount), devices: String(deviceCount) });
            })()}</div>
          </div>
        </div>
        <div class="section-content" style="display: block; padding: 0;">
          ${this.z2mInstances.length === 0
            ? html`
                <div style="padding: 16px; text-align: center; color: var(--secondary-text-color);">
                  <ha-icon icon="mdi:information-outline" style="margin-right: 8px;"></ha-icon>
                  ${this._localize('instances.no_instances')}
                </div>
              `
            : html`
                <div class="instance-grid">
                  ${this.z2mInstances.map(instance => {
                    const isExpanded = this._instanceDevicesExpanded.has(instance.entry_id);
                    const maxVisible = 5;
                    const visibleDevices = isExpanded ? instance.devices : instance.devices.slice(0, maxVisible);
                    const hiddenCount = instance.devices.length - maxVisible;
                    const isZ2M = instance.backend_type === 'z2m';

                    const typeCounts: Array<{ key: string; count: number }> = [];
                    if (instance.device_counts.t2_rgb > 0) typeCounts.push({ key: 't2_rgb', count: instance.device_counts.t2_rgb });
                    if (instance.device_counts.t2_cct > 0) typeCounts.push({ key: 't2_cct', count: instance.device_counts.t2_cct });
                    if (instance.device_counts.t1m > 0) typeCounts.push({ key: 't1m', count: instance.device_counts.t1m });
                    if (instance.device_counts.t1_strip > 0) typeCounts.push({ key: 't1_strip', count: instance.device_counts.t1_strip });
                    if (instance.device_counts.other > 0) typeCounts.push({ key: 'other', count: instance.device_counts.other });

                    return html`
                      <div class="instance-card">
                        <div class="instance-header">
                          <span class="instance-badge ${isZ2M ? 'instance-badge--z2m' : 'instance-badge--zha'}">
                            ${isZ2M ? 'Z2M' : 'ZHA'}
                          </span>
                          <div class="instance-info">
                            <span class="instance-name">${instance.title}</span>
                            ${isZ2M && instance.z2m_base_topic && instance.title !== instance.z2m_base_topic ? html`
                              <span class="instance-topic">${instance.z2m_base_topic}</span>
                            ` : ''}
                          </div>
                        </div>
                        ${typeCounts.length > 0 ? html`
                          <div class="instance-type-chips">
                            ${typeCounts.map(tc => html`
                              <span class="instance-type-chip">${this._localize('instances.' + tc.key)} x${tc.count}</span>
                            `)}
                          </div>
                        ` : ''}
                        ${instance.devices.length > 0 ? html`
                          <div class="instance-device-chips">
                            ${visibleDevices.map(device => html`
                              <span class="instance-device-chip">${device}</span>
                            `)}
                            ${!isExpanded && hiddenCount > 0 ? html`
                              <span
                                class="instance-device-chip instance-device-chip--more"
                                @click=${() => this._toggleInstanceDevices(instance.entry_id)}
                              >
                                ${this._localize('instances.more_devices', { count: String(hiddenCount) })}
                              </span>
                            ` : ''}
                            ${isExpanded && hiddenCount > 0 ? html`
                              <span
                                class="instance-device-chip instance-device-chip--more"
                                @click=${() => this._toggleInstanceDevices(instance.entry_id)}
                              >
                                ${this._localize('instances.show_less')}
                              </span>
                            ` : ''}
                          </div>
                        ` : ''}
                      </div>
                    `;
                  })}
                </div>
              `}
        </div>
      </ha-expansion-panel>

      <!-- Generic Lights Section -->
      <ha-expansion-panel
        outlined
        .expanded=${this.collapsed['generic_lights'] === undefined ? false : !this.collapsed['generic_lights']}
        @expanded-changed=${(e: CustomEvent) => this._handleExpansionChange('generic_lights', e)}
      >
        <div slot="header" class="section-header">
          <div>
            <div class="section-title">${this._localize('config.generic_lights_title')}</div>
            <div class="section-subtitle">${this._localize('config.generic_lights_subtitle')}</div>
          </div>
        </div>
        <div class="section-content" style="display: block; padding: 16px;">
          <p style="margin: 0 0 16px 0; font-size: var(--ha-font-size-s, 12px); color: var(--secondary-text-color);">${this._localize('config.software_transitions_description')}</p>
          <ha-selector
            .hass=${this.hass}
            .selector=${{ entity: { domain: 'light', multiple: true } }}
            .value=${this.softwareTransitionEntities}
            .label=${this._localize('config.software_transitions_label')}
            @value-changed=${this._softwareTransitionEntitiesChanged}
          ></ha-selector>

          <!-- On-device Audio Mode -->
          <div style="margin-top: 24px; border-top: 1px solid var(--divider-color); padding-top: 16px;">
            <p style="margin: 0 0 16px 0; font-size: var(--ha-font-size-s, 12px); color: var(--secondary-text-color);">${this._localize('config.audio_on_device_description')}</p>
            <ha-selector
              .hass=${this.hass}
              .selector=${{ entity: { domain: 'light' } }}
              .value=${this._audioConfigSelectedEntity}
              .label=${this._localize('config.audio_on_device_title') || 'Use on-device audio mode'}
              @value-changed=${this._audioConfigEntityChanged}
            ></ha-selector>

            ${this._audioConfigSelectedEntity ? html`
              <div style="margin-top: 16px; display: flex; flex-direction: column; gap: 16px;">
                ${renderInput({
                  label: this._localize('config.audio_on_service_label') || 'Activate service (e.g., light.turn_on)',
                  value: this.entityAudioConfig[this._audioConfigSelectedEntity]?.audio_on_service || '',
                  onChange: (e: Event) => this._updateEntityAudioConfig('audio_on_service', (e.target as HTMLInputElement).value),
                })}
                ${renderInput({
                  label: this._localize('config.audio_on_service_data_label') || 'Activate data (JSON)',
                  value: this.entityAudioConfig[this._audioConfigSelectedEntity]?.audio_on_service_data || '',
                  onChange: (e: Event) => this._updateEntityAudioConfig('audio_on_service_data', (e.target as HTMLInputElement).value),
                })}
                ${renderInput({
                  label: this._localize('config.audio_off_service_label') || 'Deactivate service',
                  value: this.entityAudioConfig[this._audioConfigSelectedEntity]?.audio_off_service || '',
                  onChange: (e: Event) => this._updateEntityAudioConfig('audio_off_service', (e.target as HTMLInputElement).value),
                })}
                ${renderInput({
                  label: this._localize('config.audio_off_service_data_label') || 'Deactivate data (JSON)',
                  value: this.entityAudioConfig[this._audioConfigSelectedEntity]?.audio_off_service_data || '',
                  onChange: (e: Event) => this._updateEntityAudioConfig('audio_off_service_data', (e.target as HTMLInputElement).value),
                })}
              </div>
            ` : ''}

            ${Object.keys(this.entityAudioConfig).length > 0 ? html`
              <div style="margin-top: 16px; border-top: 1px solid var(--divider-color); padding-top: 12px;">
                <div style="font-size: var(--ha-font-size-s, 12px); color: var(--secondary-text-color); margin-bottom: 8px;">On-device audio enabled lights</div>
                ${Object.keys(this.entityAudioConfig).map(entityId => html`
                  <div style="display: flex; align-items: center; justify-content: space-between; padding: 6px 0;">
                    <span
                      style="cursor: pointer; color: var(--primary-text-color); font-size: 14px;"
                      @click=${() => { this._audioConfigSelectedEntity = entityId; }}
                    >${this._getEntityFriendlyName(entityId)}</span>
                    <ha-icon-button
                      .path=${'M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z'}
                      @click=${() => this._deleteEntityAudioConfig(entityId)}
                    ></ha-icon-button>
                  </div>
                `)}
              </div>
            ` : ''}
          </div>
        </div>
      </ha-expansion-panel>

      <!-- Default Audio Sensor Section -->
      <ha-expansion-panel
        outlined
        .expanded=${this.collapsed['default_audio_sensor'] === undefined ? false : !this.collapsed['default_audio_sensor']}
        @expanded-changed=${(e: CustomEvent) => this._handleExpansionChange('default_audio_sensor', e)}
      >
        <div slot="header" class="section-header">
          <div>
            <div class="section-title">${this._localize('config.default_audio_sensor_title') || 'Default Audio Sensor'}</div>
            <div class="section-subtitle">${this._localize('config.default_audio_sensor_subtitle') || 'Auto-populates audio sensor when creating presets'}</div>
          </div>
        </div>
        <div class="section-content" style="display: block; padding: 16px;">
          <ha-selector
            .hass=${this.hass}
            .selector=${{ entity: { domain: 'binary_sensor' } }}
            .value=${this.audioOverrideEntity}
            @value-changed=${this._handleAudioOverrideEntityChange}
          ></ha-selector>
        </div>
      </ha-expansion-panel>

      ${!hasSelection
        ? html`
            <ha-card class="controls">
              <div class="control-row">
                <div class="control-input">
                  <ha-alert alert-type="info">
                    ${this._localize('config.select_light_message')}
                  </ha-alert>
                </div>
              </div>
            </ha-card>
          `
        : ''}

      ${hasT2Device
        ? html`
            <ha-expansion-panel
              outlined
              .expanded=${true}
            >
              <div slot="header" class="section-header">
                <div>
                  <div class="section-title">${this._localize('config.transition_settings')}</div>
                </div>
              </div>
              <div class="section-content" style="display: block; padding: 0;">
                <div class="transition-settings-grid">
                  <div class="transition-curve-column">
                    <transition-curve-editor
                      .hass=${this.hass}
                      .translations=${this.translations}
                      .curvature=${this._localCurvature}
                      @curvature-input=${this._handleCurvatureInput}
                    ></transition-curve-editor>
                  </div>
                  <div class="initial-brightness-column">
                    <div class="initial-brightness-content">
                      <!-- Curvature controls -->
                      <div class="form-section" style="margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid var(--divider-color);">
                        <div class="curve-control-row">
                          <div class="curve-control-info">
                            <span class="form-label">${this._localize('config.custom_curvature_label')}</span>
                            <div style="font-size: var(--ha-font-size-s, 12px); color: var(--secondary-text-color);">
                              ${this._getCurvatureDescription()}
                            </div>
                          </div>
                          <div class="curve-control-actions">
                            <ha-selector
                              .hass=${this.hass}
                              .selector=${{
                                number: {
                                  min: 0.2,
                                  max: 6,
                                  step: 0.01,
                                  mode: 'box',
                                },
                              }}
                              .value=${this._localCurvature}
                              @value-changed=${this._handleCurvatureNumberChange}
                              style="width: 80px;"
                            ></ha-selector>
                            <ha-button
                              @click=${this._applyCurvature}
                              ?disabled=${!transitionCurveEntity || this._applyingCurvature || this._curvatureApplied}
                            >
                              ${this._curvatureApplied
                                ? html`<ha-svg-icon .path=${'M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z'}></ha-svg-icon> ${this._localize('config.curvature_applied_button')}`
                                : this._applyingCurvature
                                  ? this._localize('config.applying_button')
                                  : this._localize('config.apply_button')}
                            </ha-button>
                          </div>
                        </div>
                        <div class="curve-legend">
                          <span class="legend-item">
                            <span class="legend-dot fast-slow"></span>
                            ${this._localize('config.curve_legend_fast_slow')}
                          </span>
                          <span class="legend-item">
                            <span class="legend-dot linear"></span>
                            ${this._localize('config.curve_legend_linear')}
                          </span>
                          <span class="legend-item">
                            <span class="legend-dot slow-fast"></span>
                            ${this._localize('config.curve_legend_slow_fast')}
                          </span>
                        </div>
                      </div>

                      <!-- Initial Brightness -->
                      <div class="form-section">
                        <span class="form-label">${this._localize('config.initial_brightness_label')}</span>
                        <ha-selector
                          .hass=${this.hass}
                          .selector=${{
                            number: {
                              min: 0,
                              max: 50,
                              step: 1,
                              mode: 'slider',
                              unit_of_measurement: '%',
                            },
                          }}
                          .value=${initialBrightnessValue}
                          @value-changed=${(e: CustomEvent) => this._handleInitialBrightnessChange(e)}
                          ?disabled=${!initialBrightnessEntity}
                        ></ha-selector>
                        ${!initialBrightnessEntity ? html`
                          <div style="margin-top: 8px; font-size: var(--ha-font-size-s, 12px); color: var(--secondary-text-color);">
                            ${this._localize('config.initial_brightness_not_found')}
                          </div>
                        ` : ''}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ha-expansion-panel>
          `
        : ''}

      ${hasSelection
        ? html`
            <ha-expansion-panel
              outlined
              .expanded=${true}
            >
              <div slot="header" class="section-header">
                <div>
                  <div class="section-title">${this._localize('config.dimming_settings_title')}</div>
                </div>
              </div>
              <div class="section-content" style="display: block; padding: 0;">
                <div class="dimming-settings-grid">
                  <div class="dimming-setting-item">
                    <div class="dimming-setting-content">
                      <span class="form-label">${this._localize('config.on_to_off_duration_label')}</span>
                      <ha-selector
                        .hass=${this.hass}
                        .selector=${{
                          number: {
                            min: 0,
                            max: 10,
                            step: 0.1,
                            mode: 'slider',
                            unit_of_measurement: 's',
                          },
                        }}
                        .value=${onOffDurationValue}
                        @value-changed=${(e: CustomEvent) => this._handleOnOffDurationChange(e)}
                        ?disabled=${!onOffDurationEntity}
                      ></ha-selector>
                      ${!onOffDurationEntity ? html`
                        <div class="entity-not-found">${this._localize('config.entity_not_found')}</div>
                      ` : ''}
                    </div>
                  </div>
                  <div class="dimming-setting-item">
                    <div class="dimming-setting-content">
                      <span class="form-label">${this._localize('config.off_to_on_duration_label')}</span>
                      <ha-selector
                        .hass=${this.hass}
                        .selector=${{
                          number: {
                            min: 0,
                            max: 10,
                            step: 0.1,
                            mode: 'slider',
                            unit_of_measurement: 's',
                          },
                        }}
                        .value=${offOnDurationValue}
                        @value-changed=${(e: CustomEvent) => this._handleOffOnDurationChange(e)}
                        ?disabled=${!offOnDurationEntity}
                      ></ha-selector>
                      ${!offOnDurationEntity ? html`
                        <div class="entity-not-found">${this._localize('config.entity_not_found')}</div>
                      ` : ''}
                    </div>
                  </div>
                  <div class="dimming-setting-item">
                    <div class="dimming-setting-content">
                      <span class="form-label">${this._localize('config.dimming_range_min_label')}</span>
                      <ha-selector
                        .hass=${this.hass}
                        .selector=${{
                          number: {
                            min: 1,
                            max: Math.min(99, dimmingRangeMaxValue - 1),
                            step: 1,
                            mode: 'slider',
                            unit_of_measurement: '%',
                          },
                        }}
                        .value=${dimmingRangeMinValue}
                        @value-changed=${(e: CustomEvent) => this._handleDimmingRangeMinChange(e)}
                        ?disabled=${!dimmingRangeMinEntity}
                      ></ha-selector>
                      ${!dimmingRangeMinEntity ? html`
                        <div class="entity-not-found">${this._localize('config.entity_not_found')}</div>
                      ` : ''}
                    </div>
                  </div>
                  <div class="dimming-setting-item">
                    <div class="dimming-setting-content">
                      <span class="form-label">${this._localize('config.dimming_range_max_label')}</span>
                      <ha-selector
                        .hass=${this.hass}
                        .selector=${{
                          number: {
                            min: Math.max(2, dimmingRangeMinValue + 1),
                            max: 100,
                            step: 1,
                            mode: 'slider',
                            unit_of_measurement: '%',
                          },
                        }}
                        .value=${dimmingRangeMaxValue}
                        @value-changed=${(e: CustomEvent) => this._handleDimmingRangeMaxChange(e)}
                        ?disabled=${!dimmingRangeMaxEntity}
                      ></ha-selector>
                      ${!dimmingRangeMaxEntity ? html`
                        <div class="entity-not-found">${this._localize('config.entity_not_found')}</div>
                      ` : ''}
                    </div>
                  </div>
                </div>
                ${!hasDimmingEntities ? html`
                  <div style="padding: 16px; text-align: center; color: var(--secondary-text-color);">
                    <ha-icon icon="mdi:information-outline" style="margin-right: 8px;"></ha-icon>
                    ${this._localize('config.dimming_not_available')}
                  </div>
                ` : ''}
              </div>
            </ha-expansion-panel>
          `
        : ''}

      ${hasT1Strip
        ? html`
            <ha-expansion-panel
              outlined
              .expanded=${true}
            >
              <div slot="header" class="section-header">
                <div>
                  <div class="section-title">${this._localize('sections.t1_strip_settings')}</div>
                </div>
              </div>
              <div class="section-content" style="display: block; padding: 16px;">
                <div class="form-section">
                  <span class="form-label">${this._localize('config.strip_length_label')}</span>
                  <ha-selector
                    .hass=${this.hass}
                    .selector=${{
                      number: {
                        min: 1,
                        max: 10,
                        step: 0.2,
                        mode: 'slider',
                        unit_of_measurement: 'm',
                      },
                    }}
                    .value=${t1StripLengthValue}
                    @value-changed=${(e: CustomEvent) => this._handleT1StripLengthChange(e)}
                    ?disabled=${!t1StripLengthEntity}
                  ></ha-selector>
                  <div style="margin-top: 8px; font-size: var(--ha-font-size-s, 12px); color: var(--secondary-text-color);">
                    ${t1StripLengthEntity
                      ? this._localize('config.strip_length_info')
                      : this._localize('config.strip_length_not_found')}
                  </div>
                </div>
              </div>
            </ha-expansion-panel>
          `
        : ''}

      ${hasSegmentDevice ? this._renderSegmentZonesSection() : ''}

    `;
  }

  private _renderSegmentZonesSection() {
    const segmentDevices = this._getSelectedSegmentDevices();

    if (segmentDevices.size === 0) {
      if (this.selectedEntities.length > 0) {
        const deviceTypes = this._getSelectedDeviceTypes();
        const hasNonSegmentDevice = deviceTypes.some(dt => dt !== 't1m' && dt !== 't1_strip');
        if (hasNonSegmentDevice) {
          return html`
            <ha-expansion-panel outlined .expanded=${false}>
              <div slot="header" class="section-header">
                <div>
                  <div class="section-title">${this._localize('config.segment_zones_title')}</div>
                  <div class="section-subtitle">${this._localize('config.segment_zones_subtitle')}</div>
                </div>
              </div>
              <div class="section-content" style="display: block; padding: 16px;">
                <ha-alert alert-type="info">
                  ${this._localize('config.zone_no_segment_devices')}
                </ha-alert>
              </div>
            </ha-expansion-panel>
          `;
        }
      }
      return '';
    }

    const totalZones = Array.from(segmentDevices.keys()).reduce(
      (sum, ieee) => sum + (this._zoneEditing.get(ieee) || []).length, 0,
    );
    const deviceCount = segmentDevices.size;
    const zoneSectionId = 'segment_zones';
    const isZonesExpanded = this.collapsed[zoneSectionId] === undefined ? true : !this.collapsed[zoneSectionId];

    return html`
      <ha-expansion-panel
        outlined
        .expanded=${isZonesExpanded}
        @expanded-changed=${(e: CustomEvent) => this._handleExpansionChange(zoneSectionId, e)}
      >
        <div slot="header" class="section-header">
          <div>
            <div class="section-title">${this._localize('config.segment_zones_title')}</div>
            <div class="section-subtitle">${totalZones > 0
              ? this._localize('config.segment_zones_subtitle_count', { zones: totalZones.toString(), devices: deviceCount.toString() })
              : this._localize('config.segment_zones_subtitle')}</div>
          </div>
        </div>
        <div class="section-content" style="display: block; padding: 0;">
          ${Array.from(segmentDevices.entries()).map(([ieee, device]) => {
            const editZones = this._zoneEditing.get(ieee) || [];
            const modified = this._zonesModified(ieee);
            return html`
              <div class="zone-device-section">
                <div class="zone-device-header">
                  <ha-icon icon="${this._getEntityIcon(device.entity_id)}"></ha-icon>
                  <span>${device.z2m_friendly_name}</span>
                  <span class="zone-device-segments">${this._localize('config.segment_count', { count: device.segment_count.toString() })}</span>
                </div>
                <div class="zone-device-toolbar">
                  <ha-button @click=${() => this._addZoneRow(ieee)}>
                    <ha-icon icon="mdi:plus"></ha-icon>
                    <span class="zone-btn-label">${this._localize('config.zone_add_button')}</span>
                  </ha-button>
                  <div class="toolbar-spacer"></div>
                  ${modified ? html`
                    <span class="zone-unsaved-indicator">
                      <span class="zone-unsaved-dot"></span>
                      ${this._localize('config.zone_unsaved_changes')}
                    </span>
                  ` : ''}
                  <ha-button
                    @click=${() => this._saveZones(ieee, device.segment_count)}
                    ?disabled=${!modified || this._zoneSaving}
                  >
                    <ha-icon icon="mdi:content-save-outline"></ha-icon>
                    <span class="zone-btn-label">${this._localize('config.zone_save_button')}</span>
                  </ha-button>
                </div>
                ${editZones.length === 0
                  ? html`
                    <div class="zone-empty-state">
                      <ha-icon icon="mdi:vector-square-plus"></ha-icon>
                      <span class="zone-empty-title">${this._localize('config.zone_no_zones')}</span>
                      <span class="zone-empty-hint">${this._localize('config.zone_empty_hint')}</span>
                    </div>`
                  : html`
                    <div class="zone-list">
                      ${editZones.map((zone, index) => html`
                        <div class="zone-row">
                          <div class="zone-row-header">
                            <ha-selector
                              class="zone-name-input"
                              .hass=${this.hass}
                              .selector=${{ text: {} }}
                              .value=${zone.name}
                              .label=${this._localize('config.zone_name_label')}
                              @value-changed=${(e: CustomEvent) => this._updateZoneField(ieee, index, 'name', e.detail.value)}
                            ></ha-selector>
                            <ha-icon-button
                              @click=${() => this._removeZoneRow(ieee, index)}
                              title=${this._localize('config.zone_delete_tooltip')}
                            >
                              <ha-icon icon="mdi:delete-outline"></ha-icon>
                            </ha-icon-button>
                          </div>
                          <segment-selector
                            .mode=${'selection'}
                            .maxSegments=${device.segment_count}
                            .value=${zone.segments}
                            .hideControls=${true}
                            @value-changed=${(e: CustomEvent) => this._updateZoneField(ieee, index, 'segments', e.detail.value)}
                          ></segment-selector>
                        </div>
                      `)}
                    </div>
                  `}
              </div>
            `;
          })}
        </div>
      </ha-expansion-panel>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'aqara-config-tab': AqaraConfigTab;
  }
}
