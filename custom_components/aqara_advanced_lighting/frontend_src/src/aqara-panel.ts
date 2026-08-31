import { LitElement, html, PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { ref, createRef, Ref } from 'lit/directives/ref.js';
import {
  baseStyles, scaffoldStyles, sectionStyles, presetStyles,
  activateStyles, configStyles, editorHostStyles, sharedFormStyles,
} from './styles/index';
import { xyToRgb } from './color-utils';
import { localize } from './editor-constants';
import { PreferencesController } from './preferences-controller';
import './running-operations';
import './config-tab';
import { getEntityFriendlyName, getEntityIcon, getEntityState, getEntityColor, hasRGBColorMode, hasCCTColorMode, getEntityDeviceType } from './entity-utils';
import { builtinEffectToUser, builtinPatternToUser, builtinCCTToUser, builtinSegmentSequenceToUser, builtinDynamicSceneToUser } from './preset-duplicate';
import {
  renderEffectThumbnail,
  renderSegmentPatternThumbnail,
  renderCCTSequenceThumbnail,
  renderSegmentSequenceThumbnail,
  renderDynamicSceneThumbnail,
} from './preset-thumbnails';
import { PANEL_TRANSLATIONS } from './panel-translations';
import { getCapabilityFlags } from './preset-runtime/preset-compatibility';
import { resolveFavorites } from './preset-runtime/preset-resolver';
import { renderPresetIcon } from './preset-runtime/preset-icon';
import {
  getPresets,
  getUserPresets,
  getSupportedEntities,
} from './data-client/aqara-api';
import {
  AudioModeEntry,
  audioDeviceTier,
  buildAudioModeOptions,
  fetchAudioModeRegistry,
} from './audio-mode-registry';
import {
  HomeAssistant,
  PresetsData,
  FilteredPresets,
  DynamicEffectPreset,
  SegmentPatternPreset,
  CCTSequencePreset,
  SegmentSequencePreset,
  DynamicScenePreset,
  Favorite,
  PanelTab,
  DeviceContext,
  UserPresetsData,
  UserEffectPreset,
  UserSegmentPatternPreset,
  UserCCTSequencePreset,
  UserSegmentSequencePreset,
  UserDynamicScenePreset,
  PresetSortOption,
  SegmentZoneResolved,
  EditorDraftCache,
  FavoritePresetRef,
  PresetType,
  AnyPreset,
  Translations,
  RunningOperation,
  RunningOperationsResponse,
  EntityAudioConfig,
} from './types';
import './effect-editor';
import './pattern-editor';
import './cct-sequence-editor';
import './segment-sequence-editor';
import './dynamic-scene-editor';
import './color-history-swatches';

// HA tile card custom element interface (created via document.createElement)
type HaTileCard = HTMLElement & {
  setConfig: (config: Record<string, unknown>) => void;
  hass: HomeAssistant;
};

@customElement('aqara-advanced-lighting-panel')
export class AqaraPanel extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property({ type: Boolean, reflect: true }) public narrow = false;

  @state() private _presets?: PresetsData;
  @state() private _loading = true;
  @state() private _error?: string;
  private _prefs = new PreferencesController(this);
  @state() private _hasIncompatibleLights = false;
  @state() private _favorites: Favorite[] = [];
  @state() private _renamingFavoriteId: string | null = null;
  @state() private _renamingFavoriteName = '';
  @state() private _favoriteEditModeId: string | null = null;
  @state() private _presetEditModeId: string | null = null;
  // Active favorites drag state (panel custom-sort reorder). null when not dragging.
  @state() private _favoriteDrag: { fromId: string; toId: string | null } | null = null;
  private _longPressTimer: ReturnType<typeof setTimeout> | null = null;
  @state() private _activeTab: PanelTab = 'activate';
  @state() private _userPresets?: UserPresetsData;
  @state() private _editingPreset?: { type: string; preset: UserEffectPreset | UserSegmentPatternPreset | UserCCTSequencePreset | UserSegmentSequencePreset | UserDynamicScenePreset; isDuplicate?: boolean };
  @state() private _effectPreviewActive = false;
  @state() private _patternPreviewActive = false;
  @state() private _cctPreviewActive = false;
  @state() private _audioModeRegistry: AudioModeEntry[] | null = null;
  @state() private _segmentSequencePreviewActive = false;
  @state() private _scenePreviewActive = false;
  @state() private _backendVersion?: string;
  @state() private _frontendVersion = '__FRONTEND_VERSION__';
  @state() private _supportedEntities: Map<string, { device_type: string; model_id: string; z2m_friendly_name: string; ieee_address?: string; segment_count?: number; is_group?: boolean; member_count?: number }> = new Map();
  @state() private _deviceZones: Map<string, Array<{ name: string; segments: string }>> = new Map();
  @state() private _z2mInstances: Array<{
    entry_id: string;
    title: string;
    backend_type: string;
    z2m_base_topic: string | null;
    device_counts: { t2_rgb: number; t2_cct: number; t1m: number; t1_strip: number; other: number; total: number };
    devices: string[];
  }> = [];
  @state() private _isExporting = false;
  @state() private _isImporting = false;
  @state() private _isSelectMode = false;
  @state() private _selectedPresetIds: Set<string> = new Set();
  @state() private _runningOperations: RunningOperation[] = [];
  @state() private _musicSyncEnabled = false;
  @state() private _musicSyncSensitivity = 'low';
  @state() private _musicSyncEffect = 'random';
  @state() private _setupComplete = true;
  private _setupPollTimer?: ReturnType<typeof setTimeout>;
  private _translations: Translations = PANEL_TRANSLATIONS;
  private _fileInputRef: HTMLInputElement | null = null;
  private _eventUnsubscribers: Array<() => void> = [];
  private _runningOpsDebounceTimer?: ReturnType<typeof setTimeout>;
  private _runningOpsFetchId = 0;

  private _tileCardRef: Ref<HTMLElement> = createRef();
  private _tileCards: Map<string, HaTileCard> = new Map();
  private _editorDraftCache: EditorDraftCache = {};

  static styles = [
    baseStyles, scaffoldStyles, sectionStyles, presetStyles,
    activateStyles, configStyles, editorHostStyles, sharedFormStyles,
  ];

  /**
   * Helper method to localize panel strings
   */
  private _localize(key: string, values?: Record<string, string>): string {
    return localize(this._translations, key, values);
  }

  protected firstUpdated(): void {
    this._loadPresets();
    this._loadFavorites();
    this._loadUserPresets();
    this._prefs.load(this.hass);
    this._loadBackendVersion().then(() => {
      // Only load entities after version check — if setup isn't complete yet,
      // _checkSetupStatus polling will call _loadSupportedEntities when ready.
      if (this._setupComplete) {
        this._loadSupportedEntities();
      }
    });
    this._loadRunningOperations();
    this._subscribeToOperationEvents();
    void fetchAudioModeRegistry(this.hass).then((modes) => {
      if (modes !== null) {
        this._audioModeRegistry = modes;
        this.requestUpdate();
      }
    });

    // Listen for color history events from child editors (bubbles through shadow DOM)
    this.addEventListener('color-history-changed', this._handleColorHistoryChanged as EventListener);
    this.addEventListener('clear-history', this._handleClearColorHistory as EventListener);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener('color-history-changed', this._handleColorHistoryChanged as EventListener);
    this.removeEventListener('clear-history', this._handleClearColorHistory as EventListener);
    // Preferences save timer cleanup is handled by the controller's hostDisconnected()
    if (this._runningOpsDebounceTimer !== undefined) {
      clearTimeout(this._runningOpsDebounceTimer);
      this._runningOpsDebounceTimer = undefined;
    }
    this._stopSetupPolling();
    this._tileCards.clear();
    // Unsubscribe from HA events
    for (const unsub of this._eventUnsubscribers) {
      unsub();
    }
    this._eventUnsubscribers = [];
    // Clean up any in-flight favorite drag so window listeners don't leak.
    if (this._favoriteDrag) {
      window.removeEventListener('pointermove', this._onFavoriteDragMove);
      window.removeEventListener('pointerup', this._onFavoriteDragEnd);
      window.removeEventListener('pointercancel', this._onFavoriteDragEnd);
      this._favoriteDrag = null;
    }
  }

  protected willUpdate(changedProps: PropertyValues): void {
    super.willUpdate(changedProps);

    // Clean up stale favorite preset references when the data they resolve against changes.
    // _favoritePresets now lives in the controller, so we always check on presets/userPresets changes.
    // The controller's requestUpdate() also triggers this path after preference loads.
    if (
      changedProps.has('_presets') ||
      changedProps.has('_userPresets')
    ) {
      this._cleanStaleFavoriteRefs();
      this._rebuildPresetLookup();
    }
  }

  private _presetLookup = new Map<string, { name: string; icon: string | null }>();

  private _rebuildPresetLookup(): void {
    const map = new Map<string, { name: string; icon: string | null }>();
    const add = (id: string, name: string, icon?: string) => {
      map.set(id, { name, icon: icon || null });
    };
    if (this._presets?.dynamic_effects) {
      for (const presets of Object.values(this._presets.dynamic_effects)) {
        for (const p of presets) add(p.id, p.name, p.icon);
      }
    }
    for (const p of this._presets?.segment_patterns || []) add(p.id, p.name, p.icon);
    for (const p of this._presets?.cct_sequences || []) add(p.id, p.name, p.icon);
    for (const p of this._presets?.segment_sequences || []) add(p.id, p.name, p.icon);
    for (const p of this._presets?.dynamic_scenes || []) add(p.id, p.name, p.icon);
    if (this._userPresets) {
      for (const list of [
        this._userPresets.effect_presets, this._userPresets.segment_pattern_presets,
        this._userPresets.cct_sequence_presets, this._userPresets.segment_sequence_presets,
        this._userPresets.dynamic_scene_presets,
      ]) {
        for (const p of list || []) { add(p.id, p.name, p.icon); add(p.name, p.name, p.icon); }
      }
    }
    this._presetLookup = map;
  }

  /**
   * Remove favorite refs that point to deleted presets.
   * Called from willUpdate, not during render.
   */
  private _cleanStaleFavoriteRefs(): void {
    if (this._prefs.state.favoritePresets.length === 0) return;

    const valid = this._prefs.state.favoritePresets.filter(ref => {
      switch (ref.type) {
        case 'effect': {
          for (const key of ['t2_bulb', 't1m', 't1_strip'] as const) {
            if (this._presets?.dynamic_effects?.[key]?.some(p => p.id === ref.id)) return true;
          }
          return this._userPresets?.effect_presets?.some(p => p.id === ref.id) ?? false;
        }
        case 'segment_pattern':
          return (this._presets?.segment_patterns?.some(p => p.id === ref.id) ?? false) ||
                 (this._userPresets?.segment_pattern_presets?.some(p => p.id === ref.id) ?? false);
        case 'cct_sequence':
          return (this._presets?.cct_sequences?.some(p => p.id === ref.id) ?? false) ||
                 (this._userPresets?.cct_sequence_presets?.some(p => p.id === ref.id) ?? false);
        case 'segment_sequence':
          return (this._presets?.segment_sequences?.some(p => p.id === ref.id) ?? false) ||
                 (this._userPresets?.segment_sequence_presets?.some(p => p.id === ref.id) ?? false);
        case 'dynamic_scene':
          return (this._presets?.dynamic_scenes?.some(p => p.id === ref.id) ?? false) ||
                 (this._userPresets?.dynamic_scene_presets?.some(p => p.id === ref.id) ?? false);
        default:
          return false;
      }
    });

    if (valid.length !== this._prefs.state.favoritePresets.length) {
      this._prefs.state.favoritePresets = valid;
      this._prefs.save(this.hass);
    }
  }

  protected updated(changedProps: PropertyValues): void {
    super.updated(changedProps);

    if (changedProps.has('hass') && changedProps.get('hass') === undefined) {
      // Initial hass load
      this._loadPresets();
      this._loadFavorites();
      this._loadUserPresets();
      this._prefs.load(this.hass);
      this._loadSupportedEntities();
    }

    // Update tile card on any re-render (selectedEntities is in controller state,
    // so we always check; the method is cheap when nothing changed)
    this._updateTileCard();
  }

  private async _updateTileCard(): Promise<void> {
    const container = this._tileCardRef.value;
    if (!container || !this.hass) {
      // Container not available (probably on a different tab), clear orphaned card references
      if (this._tileCards.size > 0) {
        this._tileCards.clear();
      }
      return;
    }

    // If no entities selected, clear all cards
    if (!this._prefs.state.selectedEntities.length) {
      this._tileCards.forEach((card) => {
        if (card.parentElement) {
          card.remove();
        }
      });
      this._tileCards.clear();
      return;
    }

    // Wait for hui-tile-card to be defined
    await customElements.whenDefined('hui-tile-card');

    // Track which entities are currently selected
    const selectedSet = new Set(this._prefs.state.selectedEntities);

    // Remove cards for entities that are no longer selected or orphaned
    for (const [entityId, card] of this._tileCards.entries()) {
      if (!selectedSet.has(entityId) || card.parentElement !== container) {
        if (card.parentElement) {
          card.remove();
        }
        this._tileCards.delete(entityId);
      }
    }

    // Create or update cards for each selected entity
    for (const entityId of this._prefs.state.selectedEntities) {
      let card = this._tileCards.get(entityId);

      // Check if card exists and is attached to the current container
      if (!card || card.parentElement !== container) {
        // Create new card for this entity
        card = document.createElement('hui-tile-card') as HaTileCard;
        container.appendChild(card);
        this._tileCards.set(entityId, card);
      }

      // Update the card config and hass
      try {
        card.setConfig({
          type: 'tile',
          entity: entityId,
          features: [{ type: 'light-brightness' }],
        });
        card.hass = this.hass;
      } catch (e) {
        console.warn('Failed to configure tile card for', entityId, ':', e);
      }
    }
  }

  private async _loadPresets(): Promise<void> {
    if (!this.hass) return;
    try {
      this._presets = await getPresets(this.hass);
      this._loading = false;
    } catch (err) {
      this._error = err instanceof Error ? err.message : this._localize('errors.loading_presets_generic');
      this._loading = false;
    }
  }

  private async _loadFavorites(): Promise<void> {
    if (!this.hass) return;

    try {
      const data = await this.hass.callApi<{ favorites: Favorite[] }>('GET', 'aqara_advanced_lighting/favorites');
      this._favorites = data.favorites || [];
    } catch (err) {
      console.warn('Failed to load favorites:', err);
    }
  }

  private async _loadUserPresets(opts: { bypassCache?: boolean } = {}): Promise<void> {
    if (!this.hass) return;

    try {
      this._userPresets = await getUserPresets(this.hass, opts);
    } catch (err) {
      console.warn('Failed to load user presets:', err);
    }
  }

  private _handleColorHistoryChanged = (e: Event): void => {
    const detail = (e as CustomEvent).detail;
    if (detail && Array.isArray(detail.colorHistory)) {
      this._prefs.state.colorHistory = detail.colorHistory;
      this._prefs.save(this.hass);
    }
  };

  private _handleClearColorHistory = (_e: Event): void => {
    this._prefs.state.colorHistory = [];
    this._prefs.save(this.hass, true); // Immediate save for clear
  };

  /** Check if a preset is in the favorites list. */
  private _isPresetFavorited(type: PresetType, id: string): boolean {
    return this._prefs.state.favoritePresets.some(fav => fav.type === type && fav.id === id);
  }

  /** Toggle favorite status for a preset. Stops propagation to prevent activation. */
  private _toggleFavoritePreset(type: PresetType, id: string, event: Event): void {
    event.stopPropagation();
    const index = this._prefs.state.favoritePresets.findIndex(fav => fav.type === type && fav.id === id);
    if (index >= 0) {
      this._prefs.state.favoritePresets = [
        ...this._prefs.state.favoritePresets.slice(0, index),
        ...this._prefs.state.favoritePresets.slice(index + 1),
      ];
    } else {
      this._prefs.state.favoritePresets = [...this._prefs.state.favoritePresets, { type, id }];
    }
    this._prefs.save(this.hass, true);
    this.requestUpdate();
  }

  /** Render a star icon for favorite toggling on preset buttons. */
  private _renderFavoriteStar(type: PresetType, id: string) {
    const isFav = this._isPresetFavorited(type, id);
    return html`
      <ha-icon-button
        class="favorite-star ${isFav ? 'favorited' : ''}"
        @click=${(e: Event) => this._toggleFavoritePreset(type, id, e)}
        title="${isFav ? this._localize('tooltips.favorite_preset_remove') : this._localize('tooltips.favorite_preset_add')}"
      >
        <ha-icon icon="${isFav ? 'mdi:star' : 'mdi:star-outline'}"></ha-icon>
      </ha-icon-button>
    `;
  }

  /** Check if a builtin preset is hidden. */
  private _isBuiltinPresetHidden(type: PresetType, id: string): boolean {
    return this._prefs.state.hiddenBuiltinPresets.some(h => h.type === type && h.id === id);
  }

  /** Hide a builtin preset. Removes from favorites and shows a toast. */
  private _hideBuiltinPreset(type: PresetType, id: string, event: Event): void {
    event.stopPropagation();
    // Add to hidden list
    if (!this._isBuiltinPresetHidden(type, id)) {
      this._prefs.state.hiddenBuiltinPresets = [...this._prefs.state.hiddenBuiltinPresets, { type, id }];
    }
    // Remove from favorites if present
    const favIdx = this._prefs.state.favoritePresets.findIndex(f => f.type === type && f.id === id);
    if (favIdx >= 0) {
      this._prefs.state.favoritePresets = [
        ...this._prefs.state.favoritePresets.slice(0, favIdx),
        ...this._prefs.state.favoritePresets.slice(favIdx + 1),
      ];
    }
    this._prefs.save(this.hass, true);
    this.requestUpdate();
    this._showToast(this._localize('presets.preset_hidden'));
  }

  /** Restore all hidden builtin presets. */
  private _restoreAllHiddenPresets(): void {
    if (this._prefs.state.hiddenBuiltinPresets.length === 0) return;
    this._prefs.state.hiddenBuiltinPresets = [];
    this._prefs.save(this.hass, true);
    this.requestUpdate();
    this._showToast(this._localize('presets.presets_restored'));
  }

  /** Render the hide button for builtin preset cards (bottom-right position). */
  private _renderHideButton(type: PresetType, id: string) {
    return html`
      <div class="preset-card-actions preset-card-actions-right">
        <ha-icon-button
          @click=${(e: Event) => this._hideBuiltinPreset(type, id, e)}
          title="${this._localize('tooltips.preset_hide')}"
        >
          <ha-icon icon="mdi:eye-off-outline"></ha-icon>
        </ha-icon-button>
      </div>
    `;
  }

  /** Activate a favorite preset by dispatching to the appropriate activation method. */
  private async _activateFavoritePreset(ref: FavoritePresetRef, preset: AnyPreset, isUser: boolean): Promise<void> {
    switch (ref.type) {
      case 'effect':
        if (isUser) {
          await this._activateUserEffectPreset(preset as UserEffectPreset);
        } else {
          await this._activateDynamicEffect(preset as DynamicEffectPreset);
        }
        break;
      case 'segment_pattern':
        if (isUser) {
          await this._activateUserPatternPreset(preset as UserSegmentPatternPreset);
        } else {
          await this._activateSegmentPattern(preset as SegmentPatternPreset);
        }
        break;
      case 'cct_sequence':
        if (isUser) {
          await this._activateUserCCTSequencePreset(preset as UserCCTSequencePreset);
        } else {
          await this._activateCCTSequence(preset as CCTSequencePreset);
        }
        break;
      case 'segment_sequence':
        if (isUser) {
          await this._activateUserSegmentSequencePreset(preset as UserSegmentSequencePreset);
        } else {
          await this._activateSegmentSequence(preset as SegmentSequencePreset);
        }
        break;
      case 'dynamic_scene':
        if (isUser) {
          await this._activateUserDynamicScenePreset(preset as UserDynamicScenePreset);
        } else {
          await this._activateDynamicScene(preset as DynamicScenePreset);
        }
        break;
    }
  }


  private _getSortPreference(sectionId: string): PresetSortOption {
    return this._prefs.getSortPreference(sectionId);
  }

  private async _loadBackendVersion(): Promise<void> {
    try {
      const response = await fetch('/api/aqara_advanced_lighting/version');
      if (!response.ok) {
        console.warn('Failed to load backend version:', response.status);
        return;
      }
      const data = await response.json();
      this._backendVersion = data.version;
      this._setupComplete = data.setup_complete ?? true;

      if (!this._setupComplete && !this._setupPollTimer) {
        this._startSetupPolling();
      }
    } catch (err) {
      console.warn('Failed to load backend version:', err);
    }
  }

  private _startSetupPolling(): void {
    this._setupPollTimer = setInterval(() => this._checkSetupStatus(), 2500);
  }

  private async _checkSetupStatus(): Promise<void> {
    try {
      const response = await fetch('/api/aqara_advanced_lighting/version');
      if (!response.ok) return;
      const data = await response.json();
      this._setupComplete = data.setup_complete ?? true;

      if (this._setupComplete) {
        this._stopSetupPolling();
        this._loadSupportedEntities();
      }
    } catch (err) {
      // Keep polling on transient errors
    }
  }

  private _stopSetupPolling(): void {
    if (this._setupPollTimer) {
      clearInterval(this._setupPollTimer);
      this._setupPollTimer = undefined;
    }
  }

  private async _loadSupportedEntities(): Promise<void> {
    if (!this.hass) return;
    try {
      const data = await getSupportedEntities(this.hass);
      // Build a map for fast lookup
      const entityMap = new Map<string, { device_type: string; model_id: string; z2m_friendly_name: string; ieee_address?: string; segment_count?: number; is_group?: boolean; member_count?: number }>();
      for (const entity of data.entities || []) {
        entityMap.set(entity.entity_id, {
          device_type: entity.device_type,
          model_id: entity.model_id,
          z2m_friendly_name: entity.z2m_friendly_name,
          ieee_address: entity.ieee_address,
          segment_count: entity.segment_count,
        });
      }

      // Also add light groups to the supported entities
      for (const group of data.light_groups || []) {
        entityMap.set(group.entity_id, {
          device_type: group.device_type,
          model_id: 'light_group',
          z2m_friendly_name: group.friendly_name,
          is_group: true,
          member_count: group.member_count,
        });
      }

      this._supportedEntities = entityMap;

      // Load zone data for resolved zone lookup (editors need this)
      if (this._prefs.state.selectedEntities.length > 0) {
        this._loadZonesForSelectedDevices();
      }

      // Store instances data
      this._z2mInstances = data.instances || [];
    } catch (err) {
      console.warn('Failed to load supported entities:', err);
    }
  }

  private _scheduleLoadRunningOperations(): void {
    if (this._runningOpsDebounceTimer !== undefined) {
      clearTimeout(this._runningOpsDebounceTimer);
    }
    this._runningOpsDebounceTimer = setTimeout(() => {
      this._runningOpsDebounceTimer = undefined;
      this._loadRunningOperations();
    }, 100);
  }

  private async _loadRunningOperations(): Promise<void> {
    if (!this.hass) return;
    const fetchId = ++this._runningOpsFetchId;
    try {
      const data = await this.hass.callApi<RunningOperationsResponse>('GET', 'aqara_advanced_lighting/running_operations');
      // Discard stale responses from earlier fetches
      if (fetchId !== this._runningOpsFetchId) return;
      this._runningOperations = data.operations || [];

      // Sync music sync state from running operations
      this._syncMusicSyncState();
    } catch (err) {
      console.warn('Failed to load running operations:', err);
    }
  }

  private _syncMusicSyncState(): void {
    const activeMusicSync = this._runningOperations.find(
      op => op.type === 'music_sync' && op.entity_id && this._prefs.state.selectedEntities.includes(op.entity_id)
    );

    if (activeMusicSync) {
      this._musicSyncEnabled = true;
      if (activeMusicSync.sensitivity) this._musicSyncSensitivity = activeMusicSync.sensitivity;
      if (activeMusicSync.audio_effect) this._musicSyncEffect = activeMusicSync.audio_effect;
    } else {
      this._musicSyncEnabled = false;
    }
  }

  private async _subscribeToOperationEvents(): Promise<void> {
    if (!this.hass?.connection) return;

    const eventTypes = [
      'aqara_advanced_lighting_sequence_started',
      'aqara_advanced_lighting_sequence_stopped',
      'aqara_advanced_lighting_sequence_completed',
      'aqara_advanced_lighting_sequence_paused',
      'aqara_advanced_lighting_sequence_resumed',
      'aqara_advanced_lighting_dynamic_scene_started',
      'aqara_advanced_lighting_dynamic_scene_stopped',
      'aqara_advanced_lighting_dynamic_scene_finished',
      'aqara_advanced_lighting_dynamic_scene_paused',
      'aqara_advanced_lighting_dynamic_scene_resumed',
      'aqara_advanced_lighting_effect_activated',
      'aqara_advanced_lighting_effect_stopped',
      'aqara_advanced_lighting_entity_externally_controlled',
      'aqara_advanced_lighting_entity_control_resumed',
    ];

    for (const eventType of eventTypes) {
      try {
        const unsub = await this.hass.connection.subscribeEvents(
          () => { this._scheduleLoadRunningOperations(); },
          eventType,
        );
        this._eventUnsubscribers.push(unsub);
      } catch (err) {
        console.warn(`Failed to subscribe to ${eventType}:`, err);
      }
    }
  }

  /**
   * Get unique segment-capable devices from selected entities.
   * Returns a map of ieee_address to { device_type, segment_count, z2m_friendly_name }.
   */
  private _getSelectedSegmentDevices(): Map<string, { device_type: string; segment_count: number; z2m_friendly_name: string; entity_id: string }> {
    const devices = new Map<string, { device_type: string; segment_count: number; z2m_friendly_name: string; entity_id: string }>();
    for (const entityId of this._prefs.state.selectedEntities) {
      const info = this._supportedEntities.get(entityId);
      if (!info?.ieee_address) continue;
      if (info.device_type !== 't1m' && info.device_type !== 't1_strip') continue;
      if (devices.has(info.ieee_address)) continue;
      // T1 Strip has segment_count=0 in backend (variable based on length)
      // so use the dynamic calculation for strips
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

  /**
   * Load zones for a specific device from the backend (read-only, for resolved zone lookup).
   */
  private async _loadZonesForDevice(ieeeAddress: string): Promise<void> {
    if (!this.hass) return;
    try {
      const data = await this.hass.callApi<{ zones?: Record<string, string> }>('GET', `aqara_advanced_lighting/segment_zones/${encodeURIComponent(ieeeAddress)}`);
      const zones: Array<{ name: string; segments: string }> = Object.entries(data.zones || {}).map(
        ([name, segments]) => ({ name, segments: segments as string })
      );
      this._deviceZones = new Map(this._deviceZones).set(ieeeAddress, zones);
    } catch (err) {
      console.warn('Failed to load zones for device:', ieeeAddress, err);
    }
  }

  /**
   * Load zones for all selected segment-capable devices (read-only).
   */
  private async _loadZonesForSelectedDevices(): Promise<void> {
    const devices = this._getSelectedSegmentDevices();
    await Promise.all(
      Array.from(devices.keys()).map(ieee => this._loadZonesForDevice(ieee))
    );
  }

  private _setSortPreference(sectionId: string, value: PresetSortOption): void {
    this._prefs.setSortPreference(sectionId, value, this.hass);
  }

  // Sorting utility function (generic for all preset types)
  private _sortPresets<T extends { name: string; created_at?: string }>(presets: T[], sortOption: PresetSortOption): T[] {
    const sorted = [...presets];
    switch (sortOption) {
      case 'name-asc':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case 'name-desc':
        return sorted.sort((a, b) => b.name.localeCompare(a.name));
      case 'date-new':
        if (sorted.length > 0 && sorted[0]?.created_at) {
          return sorted.sort((a, b) => new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime());
        }
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case 'date-old':
        if (sorted.length > 0 && sorted[0]?.created_at) {
          return sorted.sort((a, b) => new Date(a.created_at!).getTime() - new Date(b.created_at!).getTime());
        }
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      default:
        return sorted;
    }
  }

  /**
   * Pointer-down on a favorite card's drag handle. Captures the pointer on the
   * handle element so subsequent moves/up events fire on the same target even
   * if the pointer leaves it. stopPropagation prevents the card click handler
   * (preset activation) from firing on drag-start.
   */
  private _onFavoriteDragStart = (e: PointerEvent, fromId: string): void => {
    e.preventDefault();
    e.stopPropagation();
    this._favoriteDrag = { fromId, toId: null };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    window.addEventListener('pointermove', this._onFavoriteDragMove);
    window.addEventListener('pointerup', this._onFavoriteDragEnd);
    window.addEventListener('pointercancel', this._onFavoriteDragEnd);
  };

  /**
   * Track which card the pointer is currently over by hit-testing the
   * `.preset-button[data-fav-id]` rects. Updates `_favoriteDrag.toId` on every move.
   */
  private _onFavoriteDragMove = (e: PointerEvent): void => {
    if (!this._favoriteDrag) return;
    const cards = this.shadowRoot!.querySelectorAll('.preset-button[data-fav-id]');
    for (const card of Array.from(cards)) {
      const rect = (card as HTMLElement).getBoundingClientRect();
      if (
        e.clientX >= rect.left && e.clientX <= rect.right &&
        e.clientY >= rect.top && e.clientY <= rect.bottom
      ) {
        const id = (card as HTMLElement).dataset.favId!;
        if (this._favoriteDrag.toId !== id) {
          this._favoriteDrag = { ...this._favoriteDrag, toId: id };
        }
        break;
      }
    }
  };

  /**
   * Capture-phase click suppressor used to swallow the synthetic click that
   * the browser fires after a successful pointerup. Without this the preset
   * card's @click would activate the preset on drop. Registered with
   * { capture: true, once: true } so it removes itself after one click.
   */
  private _suppressClick = (e: Event): void => {
    e.preventDefault();
    e.stopPropagation();
  };

  /**
   * Pointer-up: persist the new order and clean up listeners. Splice/insert
   * the dragged ref to the drop target's index, then PUT through the existing
   * preferences-controller update mechanism.
   */
  private _onFavoriteDragEnd = (e?: PointerEvent): void => {
    const isCancel = e?.type === 'pointercancel';
    window.removeEventListener('pointermove', this._onFavoriteDragMove);
    window.removeEventListener('pointerup', this._onFavoriteDragEnd);
    window.removeEventListener('pointercancel', this._onFavoriteDragEnd);
    const drag = this._favoriteDrag;
    this._favoriteDrag = null;
    if (!drag) return;

    // Suppress the synthetic click that follows pointerup. Capture phase + once
    // so the suppressor catches the click before it reaches the preset-button
    // handler and removes itself afterward. Skip on pointercancel — no click
    // follows a cancel.
    if (!isCancel) {
      window.addEventListener('click', this._suppressClick, { capture: true, once: true });
    }

    if (!drag.toId || drag.fromId === drag.toId) return;

    const refs = [...this._prefs.state.favoritePresets];
    const fromIdx = refs.findIndex(r => r.id === drag.fromId);
    const toIdx = refs.findIndex(r => r.id === drag.toId);
    if (fromIdx < 0 || toIdx < 0) return;

    const [moved] = refs.splice(fromIdx, 1);
    if (!moved) return;
    refs.splice(toIdx, 0, moved);

    this._prefs.update({ favoritePresets: refs }, this.hass);
  };

  private _sortResolvedFavorites(
    items: Array<{ ref: FavoritePresetRef; preset: any; isUser: boolean }>,
    sortOption: PresetSortOption,
  ): Array<{ ref: FavoritePresetRef; preset: any; isUser: boolean }> {
    const sorted = [...items];
    switch (sortOption) {
      case 'custom':
        // User-managed manual order; reflects the favoritePresets array as-is.
        return sorted;
      case 'name-asc':
        return sorted.sort((a, b) => a.preset.name.localeCompare(b.preset.name));
      case 'name-desc':
        return sorted.sort((a, b) => b.preset.name.localeCompare(a.preset.name));
      // Date sort uses the order they were favorited (array position)
      case 'date-new':
        return sorted.reverse();
      case 'date-old':
      default:
        return sorted;
    }
  }

  // Device type keys for My Presets sub-categories
  // Order defines display order of sub-categories
  private static readonly PRESET_DEVICE_TYPES: string[] = [
    't2_bulb', 't1', 't1m', 't1_strip',
  ];

  /**
   * Group presets by device_type for sub-category rendering.
   * Returns ungrouped presets (no device_type) and a map of device_type to presets.
   */
  private _groupPresetsByDeviceType<T extends { device_type?: string }>(
    presets: T[],
  ): { ungrouped: T[]; grouped: Map<string, T[]> } {
    const ungrouped: T[] = [];
    const grouped = new Map<string, T[]>();

    for (const preset of presets) {
      if (!preset.device_type) {
        ungrouped.push(preset);
      } else {
        const list = grouped.get(preset.device_type) || [];
        list.push(preset);
        grouped.set(preset.device_type, list);
      }
    }

    return { ungrouped, grouped };
  }

  private async _saveUserPreset(type: string, data: Record<string, unknown>): Promise<void> {
    if (!this.hass) return;

    try {
      await this.hass.callApi('POST', 'aqara_advanced_lighting/user_presets', { type, data });
      await this._loadUserPresets({ bypassCache: true });
    } catch (err) {
      console.error('Failed to save user preset:', err);
    }
  }

  private async _updateUserPreset(type: string, id: string, data: Record<string, unknown>): Promise<void> {
    if (!this.hass) return;

    try {
      await this.hass.callApi('PUT', `aqara_advanced_lighting/user_presets/${type}/${id}`, data);
      await this._loadUserPresets({ bypassCache: true });
    } catch (err) {
      console.error('Failed to update user preset:', err);
    }
  }

  private async _deleteUserPreset(type: string, id: string): Promise<void> {
    if (!this.hass) return;

    try {
      await this.hass.callApi('DELETE', `aqara_advanced_lighting/user_presets/${type}/${id}`);
      await this._loadUserPresets({ bypassCache: true });
    } catch (err) {
      console.error('Failed to delete user preset:', err);
    }
  }

  private _setActiveTab(tab: PanelTab): void {
    if (tab !== this._activeTab) {
      this._cacheCurrentEditorDraft();
      if (this._isSelectMode) {
        this._exitSelectMode();
      }
    }
    this._activeTab = tab;
  }

  private _handleTabChange(ev: CustomEvent<{ name: string }>): void {
    const newTab = ev.detail.name as PanelTab;
    if (newTab) {
      this._setActiveTab(newTab);
    }
  }

  private _cacheCurrentEditorDraft(): void {
    const editorSelectors: Partial<Record<PanelTab, string>> = {
      effects: 'effect-editor',
      patterns: 'pattern-editor',
      cct: 'cct-sequence-editor',
      segments: 'segment-sequence-editor',
      scenes: 'dynamic-scene-editor',
    };

    const selector = editorSelectors[this._activeTab];
    if (!selector) return;

    const editor = this.shadowRoot?.querySelector(selector) as
      | { getDraftState?: () => unknown }
      | null;
    if (editor && typeof editor.getDraftState === 'function') {
      const draft = editor.getDraftState();
      if (draft) {
        const tab = this._activeTab as keyof EditorDraftCache;
        this._editorDraftCache = { ...this._editorDraftCache, [tab]: draft };
      }
    }
  }

  private _getEditorDraft(tab: PanelTab): unknown {
    const key = tab as keyof EditorDraftCache;
    const draft = this._editorDraftCache[key];
    if (draft) {
      // Clear the draft after retrieval (one-time restore)
      const { [key]: _, ...rest } = this._editorDraftCache;
      this._editorDraftCache = rest;
    }
    return draft;
  }

  private _clearEditorDraft(tab?: PanelTab): void {
    if (tab) {
      const key = tab as keyof EditorDraftCache;
      const { [key]: _, ...rest } = this._editorDraftCache;
      this._editorDraftCache = rest;
    } else {
      this._editorDraftCache = {};
    }
  }

  private async _addFavorite(): Promise<void> {
    if (!this._prefs.state.selectedEntities.length || !this.hass) return;

    const firstEntity = this._prefs.state.selectedEntities[0];
    const autoName = this._prefs.state.selectedEntities.length === 1 && firstEntity
      ? this._getEntityFriendlyName(firstEntity)
      : this._localize('target.lights_count', { count: this._prefs.state.selectedEntities.length.toString() });

    try {
      const data = await this.hass.callApi<{ favorite: Favorite }>('POST', 'aqara_advanced_lighting/favorites', {
        entities: this._prefs.state.selectedEntities,
        name: autoName,
      });
      this._favorites = [...this._favorites, data.favorite];
    } catch (err) {
      console.error('Failed to add favorite:', err);
    }
  }

  private async _removeFavorite(favoriteId: string): Promise<void> {
    if (!this.hass) return;

    try {
      await this.hass.callApi('DELETE', `aqara_advanced_lighting/favorites/${favoriteId}`);
      this._favorites = this._favorites.filter((f) => f.id !== favoriteId);
    } catch (err) {
      console.error('Failed to remove favorite:', err);
    }
  }

  private _startRenameFavorite(e: Event, favorite: Favorite): void {
    e.stopPropagation();
    this._favoriteEditModeId = null;
    this._renamingFavoriteId = favorite.id;
    this._renamingFavoriteName = favorite.name;
    this.updateComplete.then(() => {
      const input = this.shadowRoot?.querySelector('.favorite-rename-input') as HTMLInputElement | null;
      if (input) {
        input.focus();
        input.select();
      }
    });
  }

  private _handleRenameInput(e: InputEvent): void {
    this._renamingFavoriteName = (e.target as HTMLInputElement).value;
  }

  private _handleRenameKeydown(e: KeyboardEvent): void {
    if (e.key === 'Enter') {
      e.preventDefault();
      this._saveRenameFavorite();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      this._cancelRenameFavorite();
    }
  }

  private async _saveRenameFavorite(): Promise<void> {
    if (!this.hass || !this._renamingFavoriteId || !this._renamingFavoriteName.trim()) {
      this._cancelRenameFavorite();
      return;
    }

    try {
      const data = await this.hass.callApi<{ favorite: Favorite }>(
        'PUT',
        `aqara_advanced_lighting/favorites/${this._renamingFavoriteId}`,
        { name: this._renamingFavoriteName.trim() },
      );
      this._favorites = this._favorites.map((f) =>
        f.id === this._renamingFavoriteId ? data.favorite : f,
      );
    } catch (err) {
      console.error('Failed to rename favorite:', err);
    }

    this._cancelRenameFavorite();
  }

  private _handleRenameBlur(): void {
    // Delay save so that tapping a button (e.g. cancel) can fire before blur commits
    setTimeout(() => {
      if (this._renamingFavoriteId) {
        this._saveRenameFavorite();
      }
    }, 150);
  }

  private _cancelRenameFavorite(): void {
    this._renamingFavoriteId = null;
    this._renamingFavoriteName = '';
  }

  private _handleFavoriteTouchStart(favorite: Favorite): void {
    this._longPressTimer = setTimeout(() => {
      this._longPressTimer = null;
      this._favoriteEditModeId = favorite.id;
    }, 500);
  }

  private _handleFavoriteTouchEnd(e: TouchEvent): void {
    if (this._longPressTimer) {
      // Short tap -- timer didn't fire, treat as normal click
      clearTimeout(this._longPressTimer);
      this._longPressTimer = null;
    } else {
      // Long press fired -- prevent the click from also selecting
      e.preventDefault();
    }
  }

  private _handleFavoriteTouchMove(): void {
    if (this._longPressTimer) {
      clearTimeout(this._longPressTimer);
      this._longPressTimer = null;
    }
  }

  private _clearFavoriteEditMode(): void {
    this._favoriteEditModeId = null;
  }

  private _handlePresetTouchStart(presetId: string): void {
    this._longPressTimer = setTimeout(() => {
      this._longPressTimer = null;
      this._presetEditModeId = presetId;
    }, 500);
  }

  private _handlePresetTouchEnd(e: TouchEvent): void {
    if (this._longPressTimer) {
      clearTimeout(this._longPressTimer);
      this._longPressTimer = null;
    } else {
      // Long press fired -- prevent click from also activating preset
      e.preventDefault();
    }
  }

  private _handlePresetTouchMove(): void {
    if (this._longPressTimer) {
      clearTimeout(this._longPressTimer);
      this._longPressTimer = null;
    }
  }

  private _selectFavorite(favorite: Favorite): void {
    this._prefs.update({
      selectedEntities: [...favorite.entities],
      activeFavoriteId: favorite.id,
    }, this.hass);
    this._favoriteEditModeId = null;
    // Load zone data for resolved zone lookup
    this._loadZonesForSelectedDevices();
  }

  private _getEntityFriendlyName(entityId: string): string {
    if (!this.hass) return entityId;
    return getEntityFriendlyName(this.hass, entityId);
  }

  private _getEntityIcon(entityId: string): string {
    if (!this.hass) return 'mdi:lightbulb';
    return getEntityIcon(this.hass, entityId);
  }

  private _getEntityState(entityId: string): string {
    if (!this.hass) return 'unavailable';
    return getEntityState(this.hass, entityId);
  }

  private _getEntityColor(entityId: string): string | null {
    if (!this.hass) return null;
    return getEntityColor(this.hass, entityId);
  }

  private _getSelectedDeviceTypes(): string[] {
    if (!this._prefs.state.selectedEntities.length || !this.hass) {
      this._hasIncompatibleLights = false;
      return [];
    }

    const deviceTypes = new Set<string>();
    let hasIncompatible = false;

    for (const entityId of this._prefs.state.selectedEntities) {
      const dt = this._getEntityDeviceType(entityId);
      if (dt) {
        deviceTypes.add(dt);
      } else {
        hasIncompatible = true;
      }
    }

    // Generic lights are not incompatible - only mark as incompatible if there are
    // truly unrecognized devices that aren't classified as generic
    this._hasIncompatibleLights = hasIncompatible
      && !deviceTypes.has('generic_rgb') && !deviceTypes.has('generic_cct');
    return Array.from(deviceTypes);
  }

  private _getT1StripSegmentCount(): number {
    // Default to 10 segments (2 meters - standard out-of-box T1 Strip length)
    const defaultSegments = 10;

    if (!this._prefs.state.selectedEntities.length || !this.hass) {
      return defaultSegments;
    }

    // Look for T1 Strip entities and get the "length" attribute
    for (const entityId of this._prefs.state.selectedEntities) {
      if (this._getEntityDeviceType(entityId) !== 't1_strip') continue;

      const entity = this.hass.states[entityId];
      if (!entity) continue;

      // This is a T1 Strip - try to get the length
      let lengthMeters: number | undefined;

      // Method 1: Check direct attribute on light entity
      const attrLength = entity.attributes.length as number | undefined;
      if (attrLength && typeof attrLength === 'number' && attrLength > 0) {
        lengthMeters = attrLength;
      }

      // Method 2: Look for separate length entity (number.xxx_length or sensor.xxx_length)
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
        // 5 segments per meter - use Math.floor to match backend's int() behavior
        return Math.floor(lengthMeters * 5);
      }
    }

    return defaultSegments;
  }

  private _getDeviceContextForEditor(editorType: 'effect' | 'pattern' | 'segment' | 'cct'): DeviceContext {
    const deviceTypes = this._getSelectedDeviceTypes();

    if (deviceTypes.length === 0) {
      return { deviceType: null, hasSelection: false };
    }

    // Find the first device type compatible with the editor
    let compatibleType: string | null = null;

    switch (editorType) {
      case 'effect':
        // Effect editor supports t2_bulb, t1, t1m, t1_strip
        compatibleType = deviceTypes.find(
          (dt) => dt === 't2_bulb' || dt === 't1m' || dt === 't1_strip' || dt === 't1'
        ) ?? null;
        break;

      case 'pattern':
      case 'segment':
        // Pattern and segment editors only support T1 variants
        compatibleType = deviceTypes.find(
          (dt) => dt === 't1m' || dt === 't1_strip' || dt === 't1'
        ) ?? null;
        break;

      case 'cct':
        // CCT supports all devices - use first available
        compatibleType = deviceTypes[0] ?? null;
        break;
    }

    // Resolve zones for the first segment-capable selected device
    const resolvedZones = this._getResolvedZonesForSelection();

    return { deviceType: compatibleType, hasSelection: true, zones: resolvedZones };
  }

  /**
   * Get resolved zones (with 0-based segment indices) for the first
   * segment-capable device in the current selection.
   */
  private _getResolvedZonesForSelection(): SegmentZoneResolved[] {
    for (const entityId of this._prefs.state.selectedEntities) {
      const info = this._supportedEntities.get(entityId);
      if (!info?.ieee_address) continue;
      if (info.device_type !== 't1m' && info.device_type !== 't1_strip') continue;

      // T1 Strip has segment_count=0 in backend (variable based on length)
      const maxSegments = info.device_type === 't1_strip'
        ? this._getT1StripSegmentCount()
        : (info.segment_count || 0);
      if (maxSegments === 0) continue;

      const zones = this._deviceZones.get(info.ieee_address) || [];
      return zones.map(z => {
        // Parse the segment range string into 0-based indices
        const indices: number[] = [];
        for (const part of z.segments.split(',')) {
          const trimmed = part.trim();
          const rangeMatch = trimmed.match(/^(\d+)-(\d+)$/);
          if (rangeMatch && rangeMatch[1] && rangeMatch[2]) {
            const start = parseInt(rangeMatch[1], 10);
            const end = parseInt(rangeMatch[2], 10);
            for (let i = start; i <= end && i <= maxSegments; i++) {
              indices.push(i - 1); // Convert to 0-based
            }
          } else {
            const num = parseInt(trimmed, 10);
            if (!isNaN(num) && num >= 1 && num <= maxSegments) {
              indices.push(num - 1); // Convert to 0-based
            }
          }
        }
        return { name: z.name, segmentIndices: indices };
      });
    }
    return [];
  }

  // Compatibility checks for each tab - check actual entity capabilities
  // Effects: T2 RGB, T1M RGB, T1 Strip (entities with RGB effect_list)
  // Check if an entity has RGB color mode support (xy, hs, rgb, rgbw, rgbww)
  private _hasRGBColorMode(entity: { attributes: Record<string, unknown> }): boolean {
    return hasRGBColorMode(entity);
  }

  /**
   * Resolve the device type for a single entity.
   *
   * Uses the backend supported-entities API (authoritative), then the
   * "include all lights" generic classification, then a legacy
   * effect_list fallback for Z2M entities.
   */
  private _getEntityDeviceType(entityId: string): string | null {
    if (!this.hass) return null;
    return getEntityDeviceType(this.hass, entityId, this._supportedEntities, this._prefs.state.includeAllLights);
  }

  private _isEffectsCompatible(): boolean { return this._getEffectsCompatibleEntities().length > 0; }
  private _isPatternsCompatible(): boolean { return this._getPatternsCompatibleEntities().length > 0; }
  private _isCCTCompatible(): boolean { return this._getCCTCompatibleEntities().length > 0; }
  private _isSegmentsCompatible(): boolean { return this._getSegmentsCompatibleEntities().length > 0; }

  // Filter methods - return only compatible entities from selection
  // These are used to send commands only to compatible devices when multiple device types are selected

  private _getEffectsCompatibleEntities(): string[] {
    if (!this.hass) return [];
    return this._prefs.state.selectedEntities.filter(entityId => {
      if (!this._supportedEntities.has(entityId)) return false;
      const dt = this._getEntityDeviceType(entityId);
      return dt === 't2_bulb' || dt === 't1m' || dt === 't1_strip';
    });
  }

  private _getPatternsCompatibleEntities(): string[] {
    if (!this.hass) return [];
    return this._prefs.state.selectedEntities.filter(entityId => {
      if (!this._supportedEntities.has(entityId)) return false;
      const dt = this._getEntityDeviceType(entityId);
      return dt === 't1m' || dt === 't1_strip';
    });
  }

  private _getCCTCompatibleEntities(): string[] {
    if (!this.hass) return [];
    return this._prefs.state.selectedEntities.filter(entityId => {
      const entity = this.hass!.states[entityId];
      if (!entity) return false;
      const hasCCT = entity.attributes.color_temp_kelvin !== undefined ||
             entity.attributes.min_color_temp_kelvin !== undefined;
      if (!hasCCT) return false;
      // T1M RGB endpoint has color_temp but doesn't support CCT sequences
      const dt = this._getEntityDeviceType(entityId);
      if (dt === 't1m') return false;
      return true;
    });
  }

  private _getSegmentsCompatibleEntities(): string[] {
    if (!this.hass) return [];
    return this._prefs.state.selectedEntities.filter(entityId => {
      if (!this._supportedEntities.has(entityId)) return false;
      const dt = this._getEntityDeviceType(entityId);
      return dt === 't1m' || dt === 't1_strip';
    });
  }

  private _filterPresets(): FilteredPresets {
    const deviceTypes = this._getSelectedDeviceTypes();
    const flags = getCapabilityFlags(deviceTypes);
    return {
      ...flags,
      t2Presets: flags.hasT2 ? (this._presets?.dynamic_effects.t2_bulb || []) : [],
      t1mPresets: flags.hasT1M ? (this._presets?.dynamic_effects.t1m || []) : [],
      t1StripPresets: flags.hasT1Strip ? (this._presets?.dynamic_effects.t1_strip || []) : [],
    };
  }

  private _handleEntityChanged(e: CustomEvent): void {
    const value = e.detail.value;
    if (!value) {
      this._prefs.update({ selectedEntities: [], activeFavoriteId: null }, this.hass);
      return;
    }

    // Entity selector with multiple: true returns string[] directly
    const entities = Array.isArray(value) ? value : [value];

    // Clear active favorite when manually changing selection
    this._prefs.update({ selectedEntities: entities, activeFavoriteId: null }, this.hass);

    // Clear editor drafts so device type auto-set reflects the new selection
    // (drafts set _hasUserInteraction=true which blocks auto-set)
    this._clearEditorDraft();

    // Load zone data for resolved zone lookup
    this._loadZonesForSelectedDevices();
  }

  private _handleIncludeAllLightsToggle(e: Event): void {
    const checked = (e.target as HTMLInputElement).checked;
    this._prefs.update({ includeAllLights: checked }, this.hass);

    // When toggling off, filter out non-Aqara lights from current selection
    if (!checked) {
      const supportedEntityIds = new Set(this._supportedEntities.keys());
      const filtered = this._prefs.state.selectedEntities.filter(id => supportedEntityIds.has(id));
      if (filtered.length !== this._prefs.state.selectedEntities.length) {
        this._prefs.state.selectedEntities = filtered;
        this.requestUpdate();
      }
    }
  }

  private _handleBrightnessChange(e: CustomEvent): void {
    this._prefs.update({ brightness: e.detail.value }, this.hass);
  }

  private _handleCustomBrightnessToggle(e: Event): void {
    this._prefs.update({ useCustomBrightness: (e.target as HTMLInputElement).checked }, this.hass);
  }

  private _handleStaticSceneModeToggle(e: Event): void {
    this._prefs.update({ useStaticSceneMode: (e.target as HTMLInputElement).checked }, this.hass);
  }

  private _handleIgnoreExternalChangesToggle(e: Event): void {
    this._prefs.state.ignoreExternalChanges = (e.target as HTMLInputElement).checked;
    this.requestUpdate();
    this._prefs.saveGlobalPreferences(this.hass);
  }

  private _handleOverrideControlModeChanged(e: CustomEvent): void {
    this._prefs.state.overrideControlMode = e.detail.value;
    this.requestUpdate();
    this._prefs.saveGlobalPreferences(this.hass);
  }

  private _handleBareTurnOnOnlyToggle(e: Event): void {
    this._prefs.state.bareTurnOnOnly = (e.target as HTMLInputElement).checked;
    this.requestUpdate();
    this._prefs.saveGlobalPreferences(this.hass);
  }

  private _handleDetectNonHaChangesToggle(e: Event): void {
    this._prefs.state.detectNonHaChanges = (e.target as HTMLInputElement).checked;
    this.requestUpdate();
    this._prefs.saveGlobalPreferences(this.hass);
  }

  private _handleDistributionModeOverrideToggle(e: Event): void {
    this._prefs.update({ useDistributionModeOverride: (e.target as HTMLInputElement).checked }, this.hass);
  }

  private _handleDistributionModeOverrideChange(e: CustomEvent): void {
    this._prefs.update({ distributionModeOverride: e.detail.value || 'shuffle_rotate' }, this.hass);
  }

  private _handleAudioReactiveToggle(e: Event): void {
    const checked = (e.target as HTMLInputElement).checked;
    if (checked) {
      // Audio-reactive conflicts with brightness, static mode, and distribution overrides
      this._prefs.update({
        useAudioReactive: true,
        useCustomBrightness: false,
        useStaticSceneMode: false,
        useDistributionModeOverride: false,
      }, this.hass);
    } else {
      this._prefs.update({ useAudioReactive: false }, this.hass);
    }
  }

  private _handleEffectAudioReactiveToggle(e: Event): void {
    const checked = (e.target as HTMLInputElement).checked;
    if (checked) {
      this._prefs.update({
        useEffectAudioReactive: true,
        useCustomBrightness: false,
      }, this.hass);
    } else {
      this._prefs.update({ useEffectAudioReactive: false }, this.hass);
    }
  }

  private _handleAudioOverrideEntityChange(e: CustomEvent): void {
    this._prefs.update({ audioOverrideEntity: e.detail.value || '' }, this.hass);
  }

  private _handleAudioOverrideSensitivityChange(e: CustomEvent): void {
    this._prefs.update({ audioOverrideSensitivity: e.detail.value ?? 50 }, this.hass);
  }

  private _handleAudioOverrideColorAdvanceChange(e: CustomEvent): void {
    this._prefs.update({ audioOverrideColorAdvance: e.detail.value || 'on_onset' }, this.hass);
  }

  private _handleAudioOverrideDetectionModeChange(e: CustomEvent): void {
    this._prefs.update({ audioOverrideDetectionMode: e.detail.value || 'spectral_flux' }, this.hass);
  }

  private _handleAudioOverridePredictionAggressivenessChange(e: CustomEvent): void {
    this._prefs.update({ audioOverridePredictionAggressiveness: e.detail.value ?? 50 }, this.hass);
  }

  private _handleAudioOverrideLatencyCompensationChange(e: CustomEvent): void {
    this._prefs.update({ audioOverrideLatencyCompensationMs: e.detail.value ?? 150 }, this.hass);
  }

  private _handleAudioOverrideTransitionSpeedChange(e: CustomEvent): void {
    this._prefs.update({ audioOverrideTransitionSpeed: e.detail.value ?? 50 }, this.hass);
  }

  // Audio presets (UI-only, same definitions as scene editor)
  private static readonly AUDIO_PRESETS: Record<string, {
    color_advance: string; detection_mode: string; sensitivity: number;
    transition_speed: number; brightness_curve: string | null; brightness_min: number; brightness_max: number; frequency_zone: boolean;
    color_by_frequency: boolean; rolloff_brightness: boolean; silence_behavior: string;
    prediction_aggressiveness: number; latency_compensation_ms: number;
  }> = {
    beat: { color_advance: 'on_onset', detection_mode: 'spectral_flux', sensitivity: 60, transition_speed: 80, brightness_curve: 'linear', brightness_min: 30, brightness_max: 100, frequency_zone: false, color_by_frequency: false, rolloff_brightness: false, silence_behavior: 'slow_cycle', prediction_aggressiveness: 50, latency_compensation_ms: 150 },
    ambient: { color_advance: 'intensity_breathing', detection_mode: 'spectral_flux', sensitivity: 50, transition_speed: 20, brightness_curve: 'logarithmic', brightness_min: 20, brightness_max: 80, frequency_zone: false, color_by_frequency: false, rolloff_brightness: true, silence_behavior: 'slow_cycle', prediction_aggressiveness: 50, latency_compensation_ms: 150 },
    concert: { color_advance: 'beat_predictive', detection_mode: 'complex_domain', sensitivity: 50, transition_speed: 50, brightness_curve: 'linear', brightness_min: 30, brightness_max: 100, frequency_zone: true, color_by_frequency: true, rolloff_brightness: false, silence_behavior: 'slow_cycle', prediction_aggressiveness: 70, latency_compensation_ms: 150 },
    chill: { color_advance: 'continuous', detection_mode: 'spectral_flux', sensitivity: 40, transition_speed: 30, brightness_curve: 'logarithmic', brightness_min: 20, brightness_max: 80, frequency_zone: false, color_by_frequency: false, rolloff_brightness: false, silence_behavior: 'slow_cycle', prediction_aggressiveness: 50, latency_compensation_ms: 150 },
    club: { color_advance: 'onset_flash', detection_mode: 'bass_energy', sensitivity: 70, transition_speed: 95, brightness_curve: 'exponential', brightness_min: 10, brightness_max: 100, frequency_zone: false, color_by_frequency: false, rolloff_brightness: false, silence_behavior: 'hold', prediction_aggressiveness: 50, latency_compensation_ms: 150 },
  };

  private get _currentAudioOverridePreset(): string {
    for (const [name, p] of Object.entries(AqaraPanel.AUDIO_PRESETS)) {
      if (this._prefs.state.audioOverrideColorAdvance === p.color_advance &&
          this._prefs.state.audioOverrideDetectionMode === p.detection_mode &&
          this._prefs.state.audioOverrideSensitivity === p.sensitivity &&
          this._prefs.state.audioOverrideTransitionSpeed === p.transition_speed &&
          this._prefs.state.audioOverrideBrightnessCurve === p.brightness_curve &&
          this._prefs.state.audioOverrideBrightnessMin === p.brightness_min &&
          this._prefs.state.audioOverrideBrightnessMax === p.brightness_max &&
          this._prefs.state.audioOverrideFrequencyZone === p.frequency_zone &&
          this._prefs.state.audioOverrideColorByFrequency === p.color_by_frequency &&
          this._prefs.state.audioOverrideRolloffBrightness === p.rolloff_brightness &&
          this._prefs.state.audioOverrideSilenceBehavior === p.silence_behavior &&
          this._prefs.state.audioOverridePredictionAggressiveness === p.prediction_aggressiveness &&
          this._prefs.state.audioOverrideLatencyCompensationMs === p.latency_compensation_ms) {
        return name;
      }
    }
    return 'custom';
  }

  private get _audioPresetOptions() {
    return [
      { value: 'beat', label: this._localize('dynamic_scene.audio_preset_beat') || 'Beat' },
      { value: 'ambient', label: this._localize('dynamic_scene.audio_preset_ambient') || 'Ambient' },
      { value: 'concert', label: this._localize('dynamic_scene.audio_preset_concert') || 'Concert' },
      { value: 'chill', label: this._localize('dynamic_scene.audio_preset_chill') || 'Chill' },
      { value: 'club', label: this._localize('dynamic_scene.audio_preset_club') || 'Club' },
      { value: 'custom', label: this._localize('dynamic_scene.audio_preset_custom') || 'Custom' },
    ];
  }

  private _handleAudioOverridePresetChange(e: CustomEvent): void {
    const preset = e.detail.value;
    if (preset === 'custom') return;
    const p = AqaraPanel.AUDIO_PRESETS[preset];
    if (!p) return;
    this._prefs.update({
      audioOverrideColorAdvance: p.color_advance,
      audioOverrideDetectionMode: p.detection_mode,
      audioOverrideSensitivity: p.sensitivity,
      audioOverrideTransitionSpeed: p.transition_speed,
      audioOverrideBrightnessCurve: p.brightness_curve,
      audioOverrideBrightnessMin: p.brightness_min,
      audioOverrideBrightnessMax: p.brightness_max,
      audioOverrideFrequencyZone: p.frequency_zone,
      audioOverrideColorByFrequency: p.color_by_frequency,
      audioOverrideRolloffBrightness: p.rolloff_brightness,
      audioOverrideSilenceBehavior: p.silence_behavior,
      audioOverridePredictionAggressiveness: p.prediction_aggressiveness,
      audioOverrideLatencyCompensationMs: p.latency_compensation_ms,
    }, this.hass);
  }

  private get _distributionModeOverrideOptions() {
    return [
      { value: 'shuffle_rotate', label: this._localize('dynamic_scene.distribution_shuffle_rotate') || 'Shuffle and rotate' },
      { value: 'synchronized', label: this._localize('dynamic_scene.distribution_synchronized') || 'Synchronized' },
      { value: 'random', label: this._localize('dynamic_scene.distribution_random') || 'Random' },
    ];
  }

  /**
   * Apply partial global preferences from config tab child component.
   * Updates local state fields and persists via the preferences controller.
   */
  private _applyGlobalPreferencesFromConfigTab(prefs: Record<string, unknown>): void {
    if ('software_transition_entities' in prefs) {
      this._prefs.state.softwareTransitionEntities = prefs.software_transition_entities as string[];
    }
    if ('entity_audio_config' in prefs) {
      this._prefs.state.entityAudioConfig = prefs.entity_audio_config as Record<string, EntityAudioConfig>;
    }
    this.requestUpdate();
    this._prefs.saveGlobalPreferences(this.hass);
  }

  private _handleExpansionChange(sectionId: string, e: CustomEvent): void {
    this._prefs.setCollapsed(sectionId, !e.detail.expanded, this.hass);
  }

  private async _activateDynamicEffect(preset: DynamicEffectPreset): Promise<void> {
    if (!this._prefs.state.selectedEntities.length) return;

    const serviceData: Record<string, unknown> = {
      entity_id: this._prefs.state.selectedEntities,
      preset: preset.id,
      turn_on: true,
      sync: true,
    };

    // Only include brightness if custom brightness is enabled
    if (this._prefs.state.useCustomBrightness) {
      serviceData.brightness = this._prefs.state.brightness;
    }

    // Effect audio override
    if (this._prefs.state.useEffectAudioReactive) {
      if (this._prefs.state.audioOverrideEntity) {
        serviceData.audio_entity = this._prefs.state.audioOverrideEntity;
        serviceData.audio_sensitivity = preset.audio_sensitivity ?? this._prefs.state.effectAudioOverrideSensitivity;
        serviceData.audio_silence_behavior = preset.audio_silence_behavior ?? 'decay_min';
        // Use preset's configured speed mode, fall back to 'volume' for non-audio presets
        serviceData.audio_speed_mode = preset.audio_speed_mode || 'volume';
        // Pass through preset's speed min/max when available
        if (preset.audio_speed_min !== undefined) serviceData.audio_speed_min = preset.audio_speed_min;
        if (preset.audio_speed_max !== undefined) serviceData.audio_speed_max = preset.audio_speed_max;
      } else {
        console.warn('Effect audio reactive override is enabled but no audio sensor entity is configured');
      }
    } else if (preset.audio_speed_mode) {
      // Built-in audio-reactive preset — inject user's default entity when configured.
      // Backend also resolves from user prefs, but passing it explicitly keeps both in sync.
      const fallbackEntity = this._prefs.state.audioOverrideEntity;
      if (fallbackEntity) {
        serviceData.audio_entity = fallbackEntity;
      }
    }

    await this.hass.callService('aqara_advanced_lighting', 'set_dynamic_effect', serviceData);
    await this._loadRunningOperations();
  }

  private async _activateSegmentPattern(preset: SegmentPatternPreset): Promise<void> {
    if (!this._prefs.state.selectedEntities.length) return;

    const serviceData: Record<string, unknown> = {
      entity_id: this._prefs.state.selectedEntities,
      preset: preset.id,
      turn_on: true,
      sync: true,
    };

    // Only include brightness if custom brightness is enabled
    if (this._prefs.state.useCustomBrightness) {
      serviceData.brightness = this._prefs.state.brightness;
    }

    await this.hass.callService('aqara_advanced_lighting', 'set_segment_pattern', serviceData);
    await this._loadRunningOperations();
  }

  private async _activateCCTSequence(preset: CCTSequencePreset): Promise<void> {
    if (!this._prefs.state.selectedEntities.length) return;

    const isAdaptive = preset.mode === 'solar' || preset.mode === 'schedule';
    await this.hass.callService('aqara_advanced_lighting', 'start_cct_sequence', {
      entity_id: this._prefs.state.selectedEntities,
      preset: preset.id,
      ...(!isAdaptive && { turn_on: true }),
      sync: true,
    });
    await this._loadRunningOperations();
  }

  private async _activateSegmentSequence(preset: SegmentSequencePreset): Promise<void> {
    if (!this._prefs.state.selectedEntities.length) return;

    const serviceData: Record<string, unknown> = {
      entity_id: this._prefs.state.selectedEntities,
      preset: preset.id,
      turn_on: true,
      sync: true,
    };

    if (this._prefs.state.useCustomBrightness) {
      serviceData.brightness = this._prefs.state.brightness;
    }

    await this.hass.callService('aqara_advanced_lighting', 'start_segment_sequence', serviceData);
    await this._loadRunningOperations();
  }

  private async _activateDynamicScene(preset: DynamicScenePreset): Promise<void> {
    if (!this._prefs.state.selectedEntities.length) return;

    // When brightness override is enabled, replace all per-color brightness
    const overrideBrightness = this._prefs.state.useCustomBrightness ? this._prefs.state.brightness : null;

    const serviceData: Record<string, unknown> = {
      entity_id: this._prefs.state.selectedEntities,
      scene_name: preset.name,
      transition_time: preset.transition_time,
      hold_time: preset.hold_time,
      distribution_mode: this._prefs.state.useDistributionModeOverride ? this._prefs.state.distributionModeOverride : preset.distribution_mode,
      random_order: preset.random_order,
      loop_mode: preset.loop_mode,
      end_behavior: preset.end_behavior,
    };

    // Add offset_delay only if provided and non-zero
    if (preset.offset_delay !== undefined && preset.offset_delay > 0) {
      serviceData.offset_delay = preset.offset_delay;
    }

    // Add loop_count only if loop_mode is 'count'
    if (preset.loop_mode === 'count' && preset.loop_count !== undefined) {
      serviceData.loop_count = preset.loop_count;
    }

    // Add colors array - override brightness if custom brightness is enabled
    serviceData.colors = preset.colors.map((color) => ({
      x: color.x,
      y: color.y,
      brightness_pct: overrideBrightness ?? color.brightness_pct,
    }));

    // Static mode: apply colors once without starting a transition loop
    if (this._prefs.state.useStaticSceneMode) {
      serviceData.static = true;
    }

    // Audio reactive override (panel override takes precedence over preset audio settings)
    this._applyAudioOverrides(serviceData);
    this._applyPresetAudioFields(serviceData, preset);

    await this.hass.callService('aqara_advanced_lighting', 'start_dynamic_scene', serviceData);
    await this._loadRunningOperations();
  }

  /** Apply audio fields from a preset to service data, only including defined values. */
  private _applyPresetAudioFields(serviceData: Record<string, unknown>, preset: DynamicScenePreset | UserDynamicScenePreset): void {
    if (this._prefs.state.useAudioReactive && this._prefs.state.audioOverrideEntity) return;
    if (!preset.audio_color_advance) return;

    const audioEntity = preset.audio_entity || this._prefs.state.audioOverrideEntity;
    if (!audioEntity) return;

    serviceData.audio_entity = audioEntity;
    serviceData.audio_color_advance = preset.audio_color_advance;
    if (preset.audio_sensitivity != null) serviceData.audio_sensitivity = preset.audio_sensitivity;
    if (preset.audio_brightness_curve !== undefined) serviceData.audio_brightness_curve = preset.audio_brightness_curve;
    if (preset.audio_brightness_min != null) serviceData.audio_brightness_min = preset.audio_brightness_min;
    if (preset.audio_brightness_max != null) serviceData.audio_brightness_max = preset.audio_brightness_max;
    if (preset.audio_transition_speed != null) serviceData.audio_transition_speed = preset.audio_transition_speed;
    if (preset.audio_detection_mode != null) serviceData.audio_detection_mode = preset.audio_detection_mode;
    if (preset.audio_frequency_zone != null) serviceData.audio_frequency_zone = preset.audio_frequency_zone;
    if (preset.audio_silence_behavior != null) serviceData.audio_silence_behavior = preset.audio_silence_behavior;
    if (preset.audio_prediction_aggressiveness != null) serviceData.audio_prediction_aggressiveness = preset.audio_prediction_aggressiveness;
    if (preset.audio_latency_compensation_ms != null) serviceData.audio_latency_compensation_ms = preset.audio_latency_compensation_ms;
    if (preset.audio_color_by_frequency != null) serviceData.audio_color_by_frequency = preset.audio_color_by_frequency;
    if (preset.audio_rolloff_brightness != null) serviceData.audio_rolloff_brightness = preset.audio_rolloff_brightness;
  }

  private _applyAudioOverrides(serviceData: Record<string, unknown>): void {
    if (this._prefs.state.useAudioReactive && this._prefs.state.audioOverrideEntity) {
      serviceData.audio_entity = this._prefs.state.audioOverrideEntity;
      serviceData.audio_sensitivity = this._prefs.state.audioOverrideSensitivity;
      serviceData.audio_color_advance = this._prefs.state.audioOverrideColorAdvance;
      serviceData.audio_transition_speed = this._prefs.state.audioOverrideTransitionSpeed;
      serviceData.audio_brightness_curve = this._prefs.state.audioOverrideBrightnessCurve;
      serviceData.audio_brightness_min = this._prefs.state.audioOverrideBrightnessMin;
      serviceData.audio_brightness_max = this._prefs.state.audioOverrideBrightnessMax;
      serviceData.audio_detection_mode = this._prefs.state.audioOverrideDetectionMode;
      serviceData.audio_frequency_zone = this._prefs.state.audioOverrideFrequencyZone;
      serviceData.audio_silence_behavior = this._prefs.state.audioOverrideSilenceBehavior;
      serviceData.audio_prediction_aggressiveness = this._prefs.state.audioOverridePredictionAggressiveness;
      serviceData.audio_latency_compensation_ms = this._prefs.state.audioOverrideLatencyCompensationMs;
    }
  }

  // Filter user effect presets for a specific device type section
  private _filterByDeviceType<T extends { device_type?: string }>(presets: T[], deviceType: string): T[] {
    return presets.filter((preset) => {
      if (!preset.device_type) return true;
      if (deviceType === 't1m' && (preset.device_type === 't1' || preset.device_type === 't1m')) return true;
      return preset.device_type === deviceType;
    });
  }

  private _getUserEffectPresetsForDeviceType(deviceType: string): UserEffectPreset[] {
    return this._filterByDeviceType(this._userPresets?.effect_presets || [], deviceType);
  }

  private _getUserPatternPresetsForDeviceType(deviceType: string): UserSegmentPatternPreset[] {
    return this._filterByDeviceType(this._userPresets?.segment_pattern_presets || [], deviceType);
  }

  private _getFilteredUserCCTSequencePresets(): UserCCTSequencePreset[] {
    if (!this._userPresets?.cct_sequence_presets) return [];
    const deviceTypes = this._getSelectedDeviceTypes();
    // CCT sequences apply to all lights
    return deviceTypes.length > 0 ? this._userPresets.cct_sequence_presets : [];
  }

  private _getUserSegmentSequencePresetsForDeviceType(deviceType: string): UserSegmentSequencePreset[] {
    return this._filterByDeviceType(this._userPresets?.segment_sequence_presets || [], deviceType);
  }

  private _getFilteredUserDynamicScenePresets(): UserDynamicScenePreset[] {
    if (!this._userPresets?.dynamic_scene_presets) return [];
    const deviceTypes = this._getSelectedDeviceTypes();
    // Dynamic scenes apply to all RGB-capable lights
    return deviceTypes.length > 0 ? this._userPresets.dynamic_scene_presets : [];
  }

  // Activate user presets
  private async _activateUserEffectPreset(preset: UserEffectPreset): Promise<void> {
    if (!this._prefs.state.selectedEntities.length) return;

    const serviceData: Record<string, unknown> = {
      entity_id: this._prefs.state.selectedEntities,
      effect: preset.effect,
      speed: preset.effect_speed,
      preset: preset.name,
      turn_on: true,
      sync: true,
    };

    // Add individual color parameters (color_1, color_2, etc.) as XY colors
    preset.effect_colors.forEach((c, index) => {
      if (index < 8) {
        serviceData[`color_${index + 1}`] = { x: c.x, y: c.y };
      }
    });

    if (preset.effect_brightness !== undefined) {
      serviceData.brightness = preset.effect_brightness;
    } else if (this._prefs.state.useCustomBrightness) {
      serviceData.brightness = this._prefs.state.brightness;
    }

    if (preset.effect_segments) {
      serviceData.segments = preset.effect_segments;
    }

    // Effect audio override takes precedence, but merge with preset's audio config
    if (this._prefs.state.useEffectAudioReactive) {
      if (this._prefs.state.audioOverrideEntity) {
        const ac = preset.audio_config;
        serviceData.audio_entity = this._prefs.state.audioOverrideEntity;
        serviceData.audio_sensitivity = ac?.audio_sensitivity ?? this._prefs.state.effectAudioOverrideSensitivity;
        serviceData.audio_silence_behavior = ac?.audio_silence_behavior ?? 'decay_min';
        // Use preset's configured speed mode, fall back to 'volume' for non-audio presets
        serviceData.audio_speed_mode = ac?.audio_speed_mode || 'volume';
        // Pass through preset's speed min/max when available
        if (ac?.audio_speed_min !== undefined) serviceData.audio_speed_min = ac.audio_speed_min;
        if (ac?.audio_speed_max !== undefined) serviceData.audio_speed_max = ac.audio_speed_max;
      } else {
        console.warn('Effect audio reactive override is enabled but no audio sensor entity is configured');
      }
    } else if (preset.audio_config?.audio_entity) {
      // Fall back to preset's saved audio config (only when override is OFF)
      const ac = preset.audio_config;
      const fallbackEntity = ac.audio_entity || this._prefs.state.audioOverrideEntity;
      if (fallbackEntity) {
        serviceData.audio_entity = fallbackEntity;
        serviceData.audio_sensitivity = ac.audio_sensitivity ?? 50;
        serviceData.audio_silence_behavior = ac.audio_silence_behavior ?? 'decay_min';
        if (ac.audio_speed_mode) {
          serviceData.audio_speed_mode = ac.audio_speed_mode;
          serviceData.audio_speed_min = ac.audio_speed_min ?? 1;
          serviceData.audio_speed_max = ac.audio_speed_max ?? 100;
        }
      }
    }

    await this.hass.callService('aqara_advanced_lighting', 'set_dynamic_effect', serviceData);
    await this._loadRunningOperations();
  }

  private async _activateUserPatternPreset(preset: UserSegmentPatternPreset): Promise<void> {
    if (!this._prefs.state.selectedEntities.length) return;

    // Validate preset has segments
    if (!preset.segments || !Array.isArray(preset.segments) || preset.segments.length === 0) {
      console.warn('Pattern preset has no segments:', preset.name);
      return;
    }

    const segment_colors = preset.segments
      .filter((s) => s && s.color)
      .map((s) => ({
        segment: s.segment,
        color: { r: s.color.r, g: s.color.g, b: s.color.b },
      }));

    if (segment_colors.length === 0) {
      console.warn('Pattern preset has no valid segments after filtering:', preset.name);
      return;
    }

    const serviceData: Record<string, unknown> = {
      entity_id: this._prefs.state.selectedEntities,
      segment_colors,
      preset: preset.name,
      turn_on: true,
      sync: true,
      turn_off_unspecified: true,
    };

    if (this._prefs.state.useCustomBrightness) {
      serviceData.brightness = this._prefs.state.brightness;
    }

    try {
      await this.hass.callService('aqara_advanced_lighting', 'set_segment_pattern', serviceData);
      await this._loadRunningOperations();
    } catch (err) {
      console.error('Failed to activate pattern preset:', err);
    }
  }

  private async _activateUserCCTSequencePreset(preset: UserCCTSequencePreset): Promise<void> {
    if (!this._prefs.state.selectedEntities.length) return;

    // Adaptive presets (solar/schedule) are resolved by name on the backend.
    // Don't turn on lights -- the loop waits for them to be turned on.
    if (preset.mode === 'solar' || preset.mode === 'schedule') {
      await this.hass.callService('aqara_advanced_lighting', 'start_cct_sequence', {
        entity_id: this._prefs.state.selectedEntities,
        preset: preset.name,
        sync: true,
      });
      await this._loadRunningOperations();
      return;
    }

    const serviceData: Record<string, unknown> = {
      entity_id: this._prefs.state.selectedEntities,
      preset: preset.name,
      loop_mode: preset.loop_mode,
      end_behavior: preset.end_behavior,
      turn_on: true,
      sync: true,
    };

    // Add loop_count only if loop_mode is 'count'
    if (preset.loop_mode === 'count' && preset.loop_count !== undefined) {
      serviceData.loop_count = preset.loop_count;
    }

    // Convert steps array to individual step fields (step_1_color_temp, step_1_brightness, etc.)
    preset.steps.forEach((step, index) => {
      const stepNum = index + 1;
      if (stepNum <= 20) {
        serviceData[`step_${stepNum}_color_temp`] = step.color_temp;
        serviceData[`step_${stepNum}_brightness`] = step.brightness;
        serviceData[`step_${stepNum}_transition`] = step.transition;
        serviceData[`step_${stepNum}_hold`] = step.hold;
      }
    });

    await this.hass.callService('aqara_advanced_lighting', 'start_cct_sequence', serviceData);
    await this._loadRunningOperations();
  }

  private async _activateUserSegmentSequencePreset(preset: UserSegmentSequencePreset): Promise<void> {
    if (!this._prefs.state.selectedEntities.length) return;

    const serviceData: Record<string, unknown> = {
      entity_id: this._prefs.state.selectedEntities,
      preset: preset.name,
      loop_mode: preset.loop_mode,
      end_behavior: preset.end_behavior,
      turn_on: true,
      sync: true,
    };

    if (this._prefs.state.useCustomBrightness) {
      serviceData.brightness = this._prefs.state.brightness;
    }

    // Add loop_count only if loop_mode is 'count'
    if (preset.loop_mode === 'count' && preset.loop_count !== undefined) {
      serviceData.loop_count = preset.loop_count;
    }

    // Convert steps array to individual step fields
    preset.steps.forEach((step, index) => {
      const stepNum = index + 1;
      if (stepNum <= 20) {
        serviceData[`step_${stepNum}_segments`] = step.segments;
        serviceData[`step_${stepNum}_mode`] = step.mode;
        serviceData[`step_${stepNum}_duration`] = step.duration;
        serviceData[`step_${stepNum}_hold`] = step.hold;
        serviceData[`step_${stepNum}_activation_pattern`] = step.activation_pattern;

        // Add individual color parameters (up to 6 colors per step)
        if (step.colors && Array.isArray(step.colors)) {
          step.colors.forEach((color: number[], colorIndex: number) => {
            if (colorIndex < 6) {
              serviceData[`step_${stepNum}_color_${colorIndex + 1}`] = color;
            }
          });
        }
      }
    });

    await this.hass.callService('aqara_advanced_lighting', 'start_segment_sequence', serviceData);
    await this._loadRunningOperations();
  }

  private async _activateUserDynamicScenePreset(preset: UserDynamicScenePreset): Promise<void> {
    if (!this._prefs.state.selectedEntities.length) return;

    // When brightness override is enabled, replace all per-color brightness
    const overrideBrightness = this._prefs.state.useCustomBrightness ? this._prefs.state.brightness : null;

    const serviceData: Record<string, unknown> = {
      entity_id: this._prefs.state.selectedEntities,
      scene_name: preset.name,
      transition_time: preset.transition_time,
      hold_time: preset.hold_time,
      distribution_mode: this._prefs.state.useDistributionModeOverride ? this._prefs.state.distributionModeOverride : preset.distribution_mode,
      random_order: preset.random_order,
      loop_mode: preset.loop_mode,
      end_behavior: preset.end_behavior,
    };

    // Add offset_delay only if provided and non-zero
    if (preset.offset_delay !== undefined && preset.offset_delay > 0) {
      serviceData.offset_delay = preset.offset_delay;
    }

    // Add loop_count only if loop_mode is 'count'
    if (preset.loop_mode === 'count' && preset.loop_count !== undefined) {
      serviceData.loop_count = preset.loop_count;
    }

    // Add colors array - override brightness replaces per-color values
    serviceData.colors = preset.colors.map((color) => ({
      x: color.x,
      y: color.y,
      brightness_pct: overrideBrightness ?? color.brightness_pct,
    }));

    // Static mode: apply colors once without starting a transition loop
    if (this._prefs.state.useStaticSceneMode) {
      serviceData.static = true;
    }

    // Audio reactive override (panel override takes precedence over preset audio settings)
    this._applyAudioOverrides(serviceData);
    this._applyPresetAudioFields(serviceData, preset);

    await this.hass.callService('aqara_advanced_lighting', 'start_dynamic_scene', serviceData);
    await this._loadRunningOperations();
  }

  protected render() {
    if (this._loading) {
      return html`
        <div class="header">
          <div class="toolbar">
            <ha-menu-button .hass=${this.hass} .narrow=${this.narrow}></ha-menu-button>
            <div class="main-title">${this._localize('title')}</div>
          </div>
        </div>
        <div class="content">
          <div class="loading">${this._localize('errors.loading_presets')}</div>
        </div>
      `;
    }

    if (this._error) {
      return html`
        <div class="header">
          <div class="toolbar">
            <ha-menu-button .hass=${this.hass} .narrow=${this.narrow}></ha-menu-button>
            <div class="main-title">${this._localize('title')}</div>
          </div>
        </div>
        <div class="content">
          <ha-alert alert-type="error" title="${this._localize('errors.title')}">
            ${this._error}
          </ha-alert>
        </div>
      `;
    }

    if (!this._presets) {
      return html`
        <div class="header">
          <div class="toolbar">
            <ha-menu-button .hass=${this.hass} .narrow=${this.narrow}></ha-menu-button>
            <div class="main-title">${this._localize('title')}</div>
          </div>
        </div>
        <div class="content">
          <ha-alert alert-type="warning" title="${this._localize('errors.no_presets_title')}">
            ${this._localize('errors.no_presets_message')}
          </ha-alert>
        </div>
      `;
    }

    const versionMismatch = this._backendVersion && this._backendVersion !== this._frontendVersion;

    return html`
      <div class="header">
        <div class="toolbar">
          <ha-menu-button .hass=${this.hass} .narrow=${this.narrow}></ha-menu-button>
          <div class="main-title">${this._localize('title')}</div>
          ${this._backendVersion ? html`
            <div
              class="version-display ${versionMismatch ? 'version-mismatch' : ''}"
              title="${versionMismatch ? this._localize('tooltips.version_mismatch', { backend: this._backendVersion, frontend: this._frontendVersion }) : `v${this._backendVersion}`}"
            >
              ${!this._setupComplete ? html`
                <span class="setup-badge" title="${this._localize('tooltips.setup_in_progress')}">${this._localize('status.setting_up')}</span>
              ` : ''}
              ${versionMismatch ? html`
                <ha-icon icon="mdi:alert-circle-outline"></ha-icon>
                <span class="version-text">v${this._backendVersion} / v${this._frontendVersion}</span>
              ` : html`
                <span class="version-text">v${this._backendVersion}</span>
              `}
            </div>
          ` : ''}
        </div>
        <ha-tab-group @wa-tab-show=${this._handleTabChange}>
          <ha-tab-group-tab slot="nav" panel="activate" .active=${this._activeTab === 'activate'}>
            ${this._localize('tabs.activate')}
          </ha-tab-group-tab>
          <ha-tab-group-tab slot="nav" panel="scenes" .active=${this._activeTab === 'scenes'}>
            ${this._localize('tabs.scenes')}
          </ha-tab-group-tab>
          <ha-tab-group-tab slot="nav" panel="effects" .active=${this._activeTab === 'effects'}>
            ${this._localize('tabs.effects')}
          </ha-tab-group-tab>
          <ha-tab-group-tab slot="nav" panel="patterns" .active=${this._activeTab === 'patterns'}>
            ${this._localize('tabs.patterns')}
          </ha-tab-group-tab>
          <ha-tab-group-tab slot="nav" panel="cct" .active=${this._activeTab === 'cct'}>
            ${this._localize('tabs.cct')}
          </ha-tab-group-tab>
          <ha-tab-group-tab slot="nav" panel="segments" .active=${this._activeTab === 'segments'}>
            ${this._localize('tabs.segments')}
          </ha-tab-group-tab>
          <ha-tab-group-tab slot="nav" panel="config" .active=${this._activeTab === 'config'}>
            ${this._localize('tabs.config')}
          </ha-tab-group-tab>
          <ha-tab-group-tab slot="nav" panel="presets" .active=${this._activeTab === 'presets'}>
            ${this._localize('tabs.presets')}
          </ha-tab-group-tab>
        </ha-tab-group>
      </div>
      <div class="content">
        <div class="tab-content">
          ${this._renderTabContent()}
        </div>
      </div>
    `;
  }

  private _renderTabContent() {
    switch (this._activeTab) {
      case 'activate':
        return this._renderActivateTab();
      case 'effects':
        return this._renderEffectsTab();
      case 'patterns':
        return this._renderPatternsTab();
      case 'cct':
        return this._renderCCTTab();
      case 'segments':
        return this._renderSegmentsTab();
      case 'scenes':
        return this._renderScenesTab();
      case 'presets':
        return this._renderPresetsTab();
      case 'config':
        return html`
          <aqara-config-tab
            .hass=${this.hass}
            .selectedEntities=${this._prefs.state.selectedEntities}
            .supportedEntities=${this._supportedEntities}
            .translations=${this._translations}
            .collapsed=${this._prefs.state.collapsed}
            .includeAllLights=${this._prefs.state.includeAllLights}
            .z2mInstances=${this._z2mInstances}
            .softwareTransitionEntities=${this._prefs.state.softwareTransitionEntities}
            .entityAudioConfig=${this._prefs.state.entityAudioConfig}
            .audioOverrideEntity=${this._prefs.state.audioOverrideEntity}
            @collapsed-changed=${(e: CustomEvent) => this._prefs.setCollapsed(e.detail.sectionId, e.detail.collapsed, this.hass)}
            @audio-override-entity-changed=${(e: CustomEvent) => this._handleAudioOverrideEntityChange(e)}
            @global-preferences-changed=${(e: CustomEvent) => this._applyGlobalPreferencesFromConfigTab(e.detail)}
            @toast=${(e: CustomEvent) => this._showToast(e.detail.message)}
          ></aqara-config-tab>
        `;
      default:
        return this._renderActivateTab();
    }
  }

  private _renderActivateTab() {
    const filtered = this._filterPresets();
    const hasSelection = this._prefs.state.selectedEntities.length > 0;

    const targetSectionId = 'target_controls';
    const isTargetExpanded = !this._prefs.state.collapsed[targetSectionId];

    return html`
      <ha-expansion-panel
        outlined
        .expanded=${isTargetExpanded}
        @expanded-changed=${(e: CustomEvent) => this._handleExpansionChange(targetSectionId, e)}
      >
        <div slot="header" class="section-header">
          <div>
            <div class="section-title">${this._localize('target.section_title')}</div>
            <div class="section-subtitle">${hasSelection ? this._localize(this._prefs.state.selectedEntities.length === 1 ? 'target.lights_selected' : 'target.lights_selected_plural', {count: this._prefs.state.selectedEntities.length.toString()}) : this._localize('target.select_lights')}</div>
          </div>
        </div>
        <div class="section-content controls-content">
          <div class="target-favorites-grid">
            <div class="control-row">
              <div class="control-input target-input ${hasSelection ? 'has-selection' : ''}">
                <div class="target-selector">
                  <ha-selector
                    .hass=${this.hass}
                    .selector=${{
                      entity: {
                        multiple: true,
                        domain: 'light',
                        // Filter to only show supported Aqara entities unless toggle is on
                        ...(!this._prefs.state.includeAllLights && this._supportedEntities.size > 0
                          ? { include_entities: Array.from(this._supportedEntities.keys()) }
                          : {}),
                      },
                    }}
                    .value=${this._prefs.state.selectedEntities}
                    @value-changed=${this._handleEntityChanged}
                  ></ha-selector>
                </div>
                <div class="include-all-lights-toggle">
                  <label class="toggle-label">
                    <ha-switch
                      .checked=${this._prefs.state.includeAllLights}
                      @change=${this._handleIncludeAllLightsToggle}
                      title="${this._localize('target.include_all_lights_hint')}"
                    ></ha-switch>
                    <span>${this._localize('target.include_all_lights_label')}</span>
                  </label>
                </div>
              </div>
              ${hasSelection
                ? html`
                    <button class="save-favorite-bar" @click=${this._addFavorite}>
                      <ha-icon icon="mdi:star-plus-outline"></ha-icon>
                      <span>${this._localize('target.save_as_favorite')}</span>
                    </button>
                  `
                : ''}
            </div>

            ${this._favorites.length > 0
              ? html`
                  <div class="control-row">
                    <span class="control-label">${this._localize('target.favorites_label')}</span>
                    <div class="control-input favorites-container">
                      ${this._favorites.map((favorite) => {
                        const firstEntity = favorite.entities[0] || '';
                        const entityIcon = this._getEntityIcon(firstEntity);
                        const entityCount = favorite.entities.length;
                        const entityState = this._getEntityState(firstEntity);
                        const entityColor = this._getEntityColor(firstEntity);
                        const isOn = entityState === 'on';
                        const isUnavailable = entityState === 'unavailable' || entityState === 'unknown';
                        const isActive = this._prefs.state.activeFavoriteId === favorite.id;

                        // Determine icon background and color styles
                        let iconBackgroundStyle = '';
                        let iconColorStyle = '';
                        if (entityColor) {
                          // Extract RGB values and create rgba with 0.2 opacity for background
                          const rgbMatch = entityColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
                          if (rgbMatch) {
                            const [, r, g, b] = rgbMatch;
                            iconBackgroundStyle = `background: rgba(${r}, ${g}, ${b}, 0.2);`;
                            iconColorStyle = `color: ${entityColor};`;
                          }
                        }

                        const isRenaming = this._renamingFavoriteId === favorite.id;
                        const isEditMode = this._favoriteEditModeId === favorite.id;

                        return html`
                          <div
                            class="favorite-button ${isOn ? 'state-on' : 'state-off'} ${isUnavailable ? 'state-unavailable' : ''} ${isActive ? 'selected' : ''} ${isRenaming ? 'renaming' : ''} ${isEditMode ? 'edit-mode' : ''}"
                            @click=${() => { if (isEditMode) { this._clearFavoriteEditMode(); } else if (!isRenaming) { this._selectFavorite(favorite); } }}
                            @touchstart=${() => this._handleFavoriteTouchStart(favorite)}
                            @touchend=${(e: TouchEvent) => this._handleFavoriteTouchEnd(e)}
                            @touchmove=${this._handleFavoriteTouchMove}
                          >
                            <div class="favorite-button-icon" style="${iconBackgroundStyle}">
                              <ha-icon icon="${entityIcon}" style="${iconColorStyle}"></ha-icon>
                            </div>
                            <div class="favorite-button-content">
                              ${isRenaming
                                ? html`
                                    <input
                                      class="favorite-rename-input"
                                      type="text"
                                      .value=${this._renamingFavoriteName}
                                      @input=${this._handleRenameInput}
                                      @keydown=${this._handleRenameKeydown}
                                      @blur=${this._handleRenameBlur}
                                      @click=${(e: Event) => e.stopPropagation()}
                                    />
                                  `
                                : html`<div class="favorite-button-name">${favorite.name}</div>`}
                              ${entityCount > 1 && !isRenaming
                                ? html`<div class="favorite-button-count">${this._localize('target.favorite_lights_count', { count: entityCount.toString() })}</div>`
                                : ''}
                            </div>
                            <div class="favorite-button-actions favorite-button-actions-left">
                              <ha-icon-button
                                class="favorite-button-action"
                                @click=${(e: Event) => this._startRenameFavorite(e, favorite)}
                                title="${this._localize('tooltips.favorite_rename')}"
                              >
                                <ha-icon icon="mdi:pencil"></ha-icon>
                              </ha-icon-button>
                            </div>
                            <div class="favorite-button-actions">
                              <ha-icon-button
                                class="favorite-button-action"
                                @click=${(e: Event) => {
                                  e.stopPropagation();
                                  this._removeFavorite(favorite.id);
                                }}
                                title="${this._localize('tooltips.favorite_remove')}"
                              >
                                <ha-icon icon="mdi:close"></ha-icon>
                              </ha-icon-button>
                            </div>
                          </div>
                        `;
                      })}
                    </div>
                  </div>
                `
              : html`
                  <div class="control-row">
                    <div class="favorites-empty-state">
                      <ha-icon icon="mdi:star-outline"></ha-icon>
                      <span>${this._localize('target.favorites_empty')}</span>
                    </div>
                  </div>
                `}
          </div>

          ${hasSelection
            ? html`
                <div class="control-row">
                  <span class="control-label">${this._localize('target.light_control_label')}</span>
                  <div class="control-input light-tile-container" ${ref(this._tileCardRef)}>
                  </div>
                </div>
              `
            : ''}
        </div>
      </ha-expansion-panel>

      ${hasSelection || this._runningOperations.length > 0
        ? html`
            <ha-expansion-panel
              outlined
              .expanded=${!this._prefs.state.collapsed['controls']}
              @expanded-changed=${(e: CustomEvent) => this._handleExpansionChange('controls', e)}
            >
              <div slot="header" class="section-header">
                <div>
                  <div class="section-title">${this._localize('target.controls_card_title')}</div>
                </div>
              </div>
              <div class="section-content controls-content">
                <aqara-running-operations
                  .hass=${this.hass}
                  .operations=${this._runningOperations}
                  .presetLookup=${this._presetLookup}
                  .translations=${this._translations}
                  @operations-changed=${() => this._loadRunningOperations()}
                ></aqara-running-operations>
              </div>
            </ha-expansion-panel>
          `
        : ''}

      ${hasSelection
        ? html`
            <ha-expansion-panel
              outlined
              .expanded=${this._prefs.state.collapsed['activation_overrides'] === undefined ? false : !this._prefs.state.collapsed['activation_overrides']}
              @expanded-changed=${(e: CustomEvent) => this._handleExpansionChange('activation_overrides', e)}
            >
              <div slot="header" class="section-header">
                <div>
                  <div class="section-title">${this._localize('target.activation_overrides_title')}</div>
                </div>
              </div>
              <div class="section-content controls-content">
                <!-- All toggles at the top -->
                <div class="overrides-grid">
                  <div class="override-item" style="opacity: ${this._prefs.state.useAudioReactive ? '0.5' : '1'}">
                    <span class="form-label">${this._localize('target.custom_brightness_label')}</span>
                    <ha-switch
                      .checked=${this._prefs.state.useCustomBrightness}
                      .disabled=${this._prefs.state.useAudioReactive}
                      @change=${this._handleCustomBrightnessToggle}
                    ></ha-switch>
                  </div>

                  <div class="override-item" style="opacity: ${this._prefs.state.useAudioReactive ? '0.5' : '1'}">
                    <span class="form-label">${this._localize('target.static_scene_mode_label')}</span>
                    <ha-switch
                      .checked=${this._prefs.state.useStaticSceneMode}
                      .disabled=${this._prefs.state.useAudioReactive}
                      @change=${this._handleStaticSceneModeToggle}
                    ></ha-switch>
                  </div>

                  <div class="override-item" style="opacity: ${this._prefs.state.useAudioReactive ? '0.5' : '1'}">
                    <span class="form-label">${this._localize('target.distribution_mode_override_label')}</span>
                    <ha-switch
                      .checked=${this._prefs.state.useDistributionModeOverride}
                      .disabled=${this._prefs.state.useAudioReactive}
                      @change=${this._handleDistributionModeOverrideToggle}
                    ></ha-switch>
                  </div>

                  <div class="override-item">
                    <span class="form-label">${this._localize('target.audio_reactive_label') || 'Audio reactive'}</span>
                    <ha-switch
                      .checked=${this._prefs.state.useAudioReactive}
                      @change=${this._handleAudioReactiveToggle}
                    ></ha-switch>
                  </div>

                  <div class="override-item">
                    <span class="form-label">${this._localize('target.effect_audio_reactive_label') || 'Effect audio reactive'}</span>
                    <ha-switch
                      .checked=${this._prefs.state.useEffectAudioReactive}
                      @change=${this._handleEffectAudioReactiveToggle}
                    ></ha-switch>
                  </div>
                </div>

                <!-- Parameters below all toggles -->
                ${this._prefs.state.useCustomBrightness
                  ? html`
                      <div class="brightness-slider" style="padding-top: 8px;">
                        <span class="form-label">${this._localize('target.brightness_override_label') || 'Brightness'}</span>
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
                          .value=${this._prefs.state.brightness}
                          @value-changed=${this._handleBrightnessChange}
                        ></ha-selector>
                      </div>
                    `
                  : ''}

                ${this._prefs.state.useDistributionModeOverride
                  ? html`
                      <div class="brightness-slider" style="padding-top: 8px;">
                        <span class="form-label">${this._localize('target.distribution_mode_override_label') || 'Color assignment'}</span>
                        <ha-selector
                          .hass=${this.hass}
                          .selector=${{
                            select: {
                              options: this._distributionModeOverrideOptions,
                              mode: 'dropdown',
                            },
                          }}
                          .value=${this._prefs.state.distributionModeOverride}
                          @value-changed=${this._handleDistributionModeOverrideChange}
                        ></ha-selector>
                      </div>
                    `
                  : ''}

                ${this._prefs.state.useAudioReactive
                  ? html`
                      <!-- Row 1: Audio preset + Entity selector -->
                      <div class="audio-override-row">
                        <div>
                          <span class="form-label">${this._localize('dynamic_scene.audio_preset_label') || 'Audio preset'}</span>
                          <ha-selector
                            .hass=${this.hass}
                            .selector=${{ select: { options: this._audioPresetOptions, mode: 'dropdown' } }}
                            .value=${this._currentAudioOverridePreset}
                            @value-changed=${this._handleAudioOverridePresetChange}
                          ></ha-selector>
                        </div>
                        <div>
                          <span class="form-label">${this._localize('target.audio_entity_label') || 'Audio sensor entity'}</span>
                          <ha-selector
                            .hass=${this.hass}
                            .selector=${{ entity: { domain: 'binary_sensor' } }}
                            .value=${this._prefs.state.audioOverrideEntity}
                            @value-changed=${this._handleAudioOverrideEntityChange}
                          ></ha-selector>
                        </div>
                      </div>
                      <!-- Row 2: Detection mode + Color advance -->
                      <div class="audio-override-row">
                        <div>
                          <span class="form-label">${this._localize('dynamic_scene.audio_detection_mode_label') || 'Detection mode'}</span>
                          <ha-selector
                            .hass=${this.hass}
                            .selector=${{ select: { options: [
                              { value: 'spectral_flux', label: this._localize('dynamic_scene.audio_detection_spectral_flux') || 'Spectral flux (all genres)' },
                              { value: 'bass_energy', label: this._localize('dynamic_scene.audio_detection_bass_energy') || 'Bass energy (rhythmic music)' },
                              { value: 'complex_domain', label: this._localize('dynamic_scene.audio_detection_complex_domain') || 'Complex domain (phase+magnitude)' },
                            ], mode: 'dropdown' } }}
                            .value=${this._prefs.state.audioOverrideDetectionMode}
                            @value-changed=${this._handleAudioOverrideDetectionModeChange}
                          ></ha-selector>
                        </div>
                        <div>
                          <span class="form-label">${this._localize('dynamic_scene.audio_color_advance_label') || 'Color advance'}</span>
                          <ha-selector
                            .hass=${this.hass}
                            .selector=${{ select: { options: buildAudioModeOptions(
                              this._audioModeRegistry,
                              audioDeviceTier(this.hass, this._prefs.state.audioOverrideEntity),
                              (k) => this._localize(k),
                            ), mode: 'dropdown' } }}
                            .value=${this._prefs.state.audioOverrideColorAdvance}
                            @value-changed=${this._handleAudioOverrideColorAdvanceChange}
                          ></ha-selector>
                        </div>
                      </div>
                      <!-- Row 3: Sensitivity + Transition speed -->
                      <div class="audio-override-row">
                        <div>
                          <span class="form-label">${this._localize('dynamic_scene.audio_sensitivity_label') || 'Sensitivity'}</span>
                          <ha-selector
                            .hass=${this.hass}
                            .selector=${{ number: { min: 1, max: 100, mode: 'slider', unit_of_measurement: '%' } }}
                            .value=${this._prefs.state.audioOverrideSensitivity}
                            @value-changed=${this._handleAudioOverrideSensitivityChange}
                          ></ha-selector>
                        </div>
                        <div>
                          <span class="form-label">${this._localize('dynamic_scene.audio_transition_speed_label') || 'Transition speed'}</span>
                          <ha-selector
                            .hass=${this.hass}
                            .disabled=${!(this._prefs.state.audioOverrideColorAdvance === 'on_onset' || this._prefs.state.audioOverrideColorAdvance === 'beat_predictive' || this._prefs.state.audioOverrideColorAdvance === 'onset_flash')}
                            .selector=${{ number: { min: 1, max: 100, mode: 'slider', unit_of_measurement: '%' } }}
                            .value=${this._prefs.state.audioOverrideTransitionSpeed}
                            @value-changed=${this._handleAudioOverrideTransitionSpeedChange}
                          ></ha-selector>
                        </div>
                      </div>
                      <!-- Row 4: Prediction aggressiveness + Latency compensation -->
                      <div class="audio-override-row">
                        <div>
                          <span class="form-label">${this._localize('dynamic_scene.audio_prediction_aggressiveness_label') || 'Prediction aggressiveness'}</span>
                          <ha-selector
                            .hass=${this.hass}
                            .disabled=${this._prefs.state.audioOverrideColorAdvance !== 'beat_predictive'}
                            .selector=${{ number: { min: 1, max: 100, mode: 'slider', unit_of_measurement: '%' } }}
                            .value=${this._prefs.state.audioOverridePredictionAggressiveness}
                            @value-changed=${this._handleAudioOverridePredictionAggressivenessChange}
                          ></ha-selector>
                        </div>
                        <div>
                          <span class="form-label">${this._localize('dynamic_scene.audio_latency_compensation_label') || 'Latency compensation'}</span>
                          <ha-selector
                            .hass=${this.hass}
                            .disabled=${this._prefs.state.audioOverrideColorAdvance !== 'beat_predictive'}
                            .selector=${{ number: { min: 0, max: 500, mode: 'slider', unit_of_measurement: 'ms' } }}
                            .value=${this._prefs.state.audioOverrideLatencyCompensationMs}
                            @value-changed=${this._handleAudioOverrideLatencyCompensationChange}
                          ></ha-selector>
                        </div>
                      </div>
                      <!-- Dropdowns: brightness curve and silence behavior -->
                      <div class="audio-dropdowns-grid">
                        <div class="override-item">
                          <span class="form-label">${this._localize('dynamic_scene.audio_brightness_curve_label') || 'Brightness curve'}</span>
                          <ha-selector
                            .hass=${this.hass}
                            .disabled=${!(this._prefs.state.audioOverrideColorAdvance === 'on_onset' || this._prefs.state.audioOverrideColorAdvance === 'continuous' || this._prefs.state.audioOverrideColorAdvance === 'beat_predictive')}
                            .selector=${{ select: { options: [
                              { value: 'disabled', label: this._localize('dynamic_scene.audio_brightness_curve_disabled') || 'Disabled' },
                              { value: 'linear', label: this._localize('dynamic_scene.audio_brightness_curve_linear') || 'Linear' },
                              { value: 'logarithmic', label: this._localize('dynamic_scene.audio_brightness_curve_logarithmic') || 'Logarithmic' },
                              { value: 'exponential', label: this._localize('dynamic_scene.audio_brightness_curve_exponential') || 'Exponential' },
                            ], mode: 'dropdown' } }}
                            .value=${this._prefs.state.audioOverrideBrightnessCurve ?? 'disabled'}
                            @value-changed=${(e: CustomEvent) => {
                              const val = e.detail.value;
                              this._prefs.update({
                                audioOverrideBrightnessCurve: val === 'disabled' ? null : (val || 'linear'),
                              }, this.hass);
                            }}
                          ></ha-selector>
                        </div>
                        <div class="override-item">
                          <span class="form-label">${this._localize('dynamic_scene.audio_silence_behavior_label') || 'Silence behavior'}</span>
                          <ha-selector
                            .hass=${this.hass}
                            .selector=${{ select: { options: [
                              { value: 'hold', label: this._localize('dynamic_scene.audio_silence_hold') || 'Hold last color' },
                              { value: 'slow_cycle', label: this._localize('dynamic_scene.audio_silence_slow_cycle') || 'Slow cycle' },
                              { value: 'decay_min', label: this._localize('dynamic_scene.audio_silence_decay_min') || 'Decay to min' },
                              { value: 'decay_mid', label: this._localize('dynamic_scene.audio_silence_decay_mid') || 'Decay to mid' },
                            ], mode: 'dropdown' } }}
                            .value=${this._prefs.state.audioOverrideSilenceBehavior}
                            @value-changed=${(e: CustomEvent) => { this._prefs.update({ audioOverrideSilenceBehavior: e.detail.value || 'slow_cycle' }, this.hass); }}
                          ></ha-selector>
                        </div>
                      </div>

                      ${this._prefs.state.audioOverrideBrightnessCurve ? html`
                      <div class="audio-sliders-row">
                        <div class="override-item">
                          <span class="form-label">${this._localize('dynamic_scene.audio_brightness_min_label') || 'Brightness min'}</span>
                          <ha-selector
                            .hass=${this.hass}
                            .selector=${{ number: { min: 0, max: 100, mode: 'slider', unit_of_measurement: '%' } }}
                            .value=${this._prefs.state.audioOverrideBrightnessMin}
                            @value-changed=${(e: CustomEvent) => { this._prefs.update({ audioOverrideBrightnessMin: e.detail.value ?? 30 }, this.hass); }}
                          ></ha-selector>
                        </div>
                        <div class="override-item">
                          <span class="form-label">${this._localize('dynamic_scene.audio_brightness_max_label') || 'Brightness max'}</span>
                          <ha-selector
                            .hass=${this.hass}
                            .selector=${{ number: { min: 0, max: 100, mode: 'slider', unit_of_measurement: '%' } }}
                            .value=${this._prefs.state.audioOverrideBrightnessMax}
                            @value-changed=${(e: CustomEvent) => { this._prefs.update({ audioOverrideBrightnessMax: e.detail.value ?? 100 }, this.hass); }}
                          ></ha-selector>
                        </div>
                      </div>
                      ` : ''}

                      <!-- Toggles: 4-per-row desktop, 2-per-row mobile -->
                      <div class="audio-toggles-grid">
                        <div class="override-item">
                          <span class="form-label">${this._localize('dynamic_scene.audio_frequency_zone_label') || 'Frequency zone'}</span>
                          <ha-switch
                            .checked=${this._prefs.state.audioOverrideFrequencyZone}
                            @change=${(e: Event) => { this._prefs.update({ audioOverrideFrequencyZone: (e.target as HTMLInputElement).checked }, this.hass); }}
                          ></ha-switch>
                        </div>
                        <div class="override-item">
                          <span class="form-label">${this._localize('dynamic_scene.audio_color_by_frequency_label') || 'Color by frequency'}</span>
                          <ha-switch
                            .checked=${this._prefs.state.audioOverrideColorByFrequency}
                            @change=${(e: Event) => { this._prefs.update({ audioOverrideColorByFrequency: (e.target as HTMLInputElement).checked }, this.hass); }}
                          ></ha-switch>
                        </div>
                        <div class="override-item">
                          <span class="form-label">${this._localize('dynamic_scene.audio_rolloff_brightness_label') || 'Rolloff brightness'}</span>
                          <ha-switch
                            .checked=${this._prefs.state.audioOverrideRolloffBrightness}
                            @change=${(e: Event) => { this._prefs.update({ audioOverrideRolloffBrightness: (e.target as HTMLInputElement).checked }, this.hass); }}
                          ></ha-switch>
                        </div>
                      </div>
                    `
                  : ''}

                ${this._prefs.state.useEffectAudioReactive
                  ? html`
                      <div class="audio-override-row" style="padding-top: 8px;">
                        <div>
                          <span class="form-label">${this._localize('target.audio_entity_label') || 'Audio sensor entity'}</span>
                          <ha-selector
                            .hass=${this.hass}
                            .selector=${{ entity: { domain: 'binary_sensor' } }}
                            .value=${this._prefs.state.audioOverrideEntity}
                            @value-changed=${this._handleAudioOverrideEntityChange}
                          ></ha-selector>
                        </div>
                        <div>
                          <span class="form-label">${this._localize('target.effect_sensitivity_label') || 'Sensitivity'}</span>
                          <ha-selector
                            .hass=${this.hass}
                            .selector=${{ number: { min: 1, max: 100, mode: 'slider', unit_of_measurement: '%' } }}
                            .value=${this._prefs.state.effectAudioOverrideSensitivity}
                            @value-changed=${(e: CustomEvent) => { this._prefs.update({ effectAudioOverrideSensitivity: e.detail.value ?? 50 }, this.hass); }}
                          ></ha-selector>
                        </div>
                      </div>
                      <div class="audio-override-row">
                        <div>
                          <span class="form-label">${this._localize('target.effect_silence_behavior_label') || 'Silence behavior'}</span>
                          <ha-selector
                            .hass=${this.hass}
                            .selector=${{ select: { options: [
                              { value: 'hold', label: this._localize('effect_editor.silence_hold') || 'Hold last values' },
                              { value: 'decay_min', label: this._localize('effect_editor.silence_decay_min') || 'Decay to minimum' },
                              { value: 'decay_mid', label: this._localize('effect_editor.silence_decay_mid') || 'Decay to midpoint' },
                            ], mode: 'dropdown' } }}
                            .value=${this._prefs.state.effectAudioOverrideSilenceBehavior}
                            @value-changed=${(e: CustomEvent) => { this._prefs.update({ effectAudioOverrideSilenceBehavior: e.detail.value || 'decay_min' }, this.hass); }}
                          ></ha-selector>
                        </div>
                      </div>
                    `
                  : ''}
              </div>
            </ha-expansion-panel>

            <ha-expansion-panel
              outlined
              .expanded=${this._prefs.state.collapsed['override_detection'] === undefined ? false : !this._prefs.state.collapsed['override_detection']}
              @expanded-changed=${(e: CustomEvent) => this._handleExpansionChange('override_detection', e)}
            >
              <div slot="header" class="section-header">
                <div>
                  <div class="section-title">${this._localize('target.override_detection_title')}</div>
                </div>
              </div>
              <div class="section-content controls-content">
                <div class="overrides-grid">
                  <div class="override-item">
                    <span class="form-label">${this._localize('target.ignore_external_changes_label')}</span>
                    <ha-switch
                      .checked=${this._prefs.state.ignoreExternalChanges}
                      @change=${this._handleIgnoreExternalChangesToggle}
                    ></ha-switch>
                  </div>

                  <div class="override-item">
                    <span class="form-label">${this._localize('target.override_control_mode_label')}</span>
                    <ha-selector
                      .hass=${this.hass}
                      .selector=${{
                        select: {
                          options: [
                            { value: 'pause_all', label: this._localize('target.override_mode_pause_all') },
                            { value: 'pause_changed', label: this._localize('target.override_mode_pause_changed') },
                          ],
                          mode: 'dropdown',
                        },
                      }}
                      .value=${this._prefs.state.overrideControlMode}
                      .disabled=${this._prefs.state.ignoreExternalChanges}
                      @value-changed=${this._handleOverrideControlModeChanged}
                    ></ha-selector>
                  </div>

                  <div class="override-item">
                    <span class="form-label">${this._localize('target.bare_turn_on_only_label')}</span>
                    <ha-switch
                      .checked=${this._prefs.state.bareTurnOnOnly}
                      .disabled=${this._prefs.state.ignoreExternalChanges}
                      @change=${this._handleBareTurnOnOnlyToggle}
                    ></ha-switch>
                  </div>

                  <div class="override-item">
                    <span class="form-label">${this._localize('target.detect_non_ha_changes_label')}</span>
                    <ha-switch
                      .checked=${this._prefs.state.detectNonHaChanges}
                      .disabled=${this._prefs.state.ignoreExternalChanges}
                      @change=${this._handleDetectNonHaChangesToggle}
                    ></ha-switch>
                  </div>
                </div>
              </div>
            </ha-expansion-panel>
          `
        : ''}

      ${!hasSelection
        ? html`<div class="no-lights">${this._localize('target.no_lights_message')}</div>`
        : ''}

      ${this._hasIncompatibleLights
        ? html`
            <ha-alert alert-type="error" title="${this._localize('errors.incompatible_light_title')}">
              ${this._localize('errors.incompatible_light_message')}
            </ha-alert>
          `
        : ''}

      ${hasSelection && !this._hasIncompatibleLights ? this._renderFavoritesSection() : ''}

      ${filtered.showDynamicScenes && ((this._presets?.dynamic_scenes?.length ?? 0) > 0 || this._getFilteredUserDynamicScenePresets().length > 0) && !this._hasIncompatibleLights
        ? this._renderDynamicScenesSection()
        : ''}

      ${filtered.showDynamicEffects && !this._hasIncompatibleLights
        ? html`
            ${filtered.hasT2 && (filtered.t2Presets.length > 0 || this._getUserEffectPresetsForDeviceType('t2_bulb').length > 0)
              ? this._renderDynamicEffectsSection(this._localize('devices.t2_bulb'), filtered.t2Presets, 't2_bulb')
              : ''}
            ${filtered.hasT1M && (filtered.t1mPresets.length > 0 || this._getUserEffectPresetsForDeviceType('t1m').length > 0)
              ? this._renderDynamicEffectsSection(this._localize('devices.t1m'), filtered.t1mPresets, 't1m')
              : ''}
            ${filtered.hasT1Strip && (filtered.t1StripPresets.length > 0 || this._getUserEffectPresetsForDeviceType('t1_strip').length > 0)
              ? this._renderDynamicEffectsSection(this._localize('devices.t1_strip'), filtered.t1StripPresets, 't1_strip')
              : ''}
          `
        : ''}

      ${filtered.showMusicSync && !this._hasIncompatibleLights
        ? this._renderMusicSyncSection()
        : ''}

      ${filtered.showSegmentPatterns && !this._hasIncompatibleLights
        ? html`
            ${filtered.hasT1M && ((this._presets?.segment_patterns?.length ?? 0) > 0 || this._getUserPatternPresetsForDeviceType('t1m').length > 0)
              ? this._renderSegmentPatternsSection(this._localize('devices.t1m'), this._presets?.segment_patterns || [], 't1m')
              : ''}
            ${filtered.hasT1Strip && ((this._presets?.segment_patterns?.length ?? 0) > 0 || this._getUserPatternPresetsForDeviceType('t1_strip').length > 0)
              ? this._renderSegmentPatternsSection(this._localize('devices.t1_strip'), this._presets?.segment_patterns || [], 't1_strip')
              : ''}
          `
        : ''}

      ${filtered.showCCTSequences && ((this._presets?.cct_sequences?.length ?? 0) > 0 || this._getFilteredUserCCTSequencePresets().length > 0) && !this._hasIncompatibleLights
        ? this._renderCCTSequencesSection()
        : ''}

      ${filtered.showSegmentSequences && !this._hasIncompatibleLights
        ? html`
            ${filtered.hasT1M && ((this._presets?.segment_sequences?.length ?? 0) > 0 || this._getUserSegmentSequencePresetsForDeviceType('t1m').length > 0)
              ? this._renderSegmentSequencesSection(this._localize('devices.t1m'), this._presets?.segment_sequences || [], 't1m')
              : ''}
            ${filtered.hasT1Strip && ((this._presets?.segment_sequences?.length ?? 0) > 0 || this._getUserSegmentSequencePresetsForDeviceType('t1_strip').length > 0)
              ? this._renderSegmentSequencesSection(this._localize('devices.t1_strip'), this._presets?.segment_sequences || [], 't1_strip')
              : ''}
          `
        : ''}
    `;
  }

  private _renderEffectsTab() {
    const editingEffect = this._editingPreset?.type === 'effect' ? this._editingPreset.preset as UserEffectPreset : undefined;
    const isCompatible = this._isEffectsCompatible();
    const hasSelection = this._prefs.state.selectedEntities.length > 0;

    return html`
      <ha-card class="editor-form">
        <h2>${editingEffect ? this._localize('dialogs.edit_effect_title') : this._localize('dialogs.create_effect_title')}</h2>
        <p class="editor-description">
          ${editingEffect ? this._localize('dialogs.edit_effect_description') : this._localize('dialogs.create_effect_description')}
        </p>
        ${hasSelection && !isCompatible ? html`
          <ha-alert alert-type="warning" class="compatibility-warning">
            ${this._localize('dialogs.compatibility_warning_effects')}
          </ha-alert>
        ` : ''}
        <effect-editor
          .hass=${this.hass}
          .preset=${editingEffect}
          .draft=${this._getEditorDraft('effects')}
          .translations=${this._translations}
          .editMode=${!!editingEffect && !this._editingPreset?.isDuplicate}
          .hasSelectedEntities=${hasSelection}
          .isCompatible=${isCompatible}
          .previewActive=${this._effectPreviewActive}
          .stripSegmentCount=${this._getT1StripSegmentCount()}
          .deviceContext=${this._getDeviceContextForEditor('effect')}
          .colorHistory=${this._prefs.state.colorHistory}
          .defaultAudioEntity=${this._prefs.state.audioOverrideEntity}
          @save=${this._handleEffectSave}
          @preview=${this._handleEffectPreview}
          @stop-preview=${this._handleEffectStopPreview}
          @cancel=${this._handleEditorCancel}
        ></effect-editor>
      </ha-card>
    `;
  }

  private async _handleEffectSave(e: CustomEvent): Promise<void> {
    if (this._editingPreset?.type === 'effect' && !this._editingPreset.isDuplicate) {
      const existingPreset = this._editingPreset.preset as UserEffectPreset;
      await this._updateUserPreset('effect', existingPreset.id, e.detail);
    } else {
      await this._saveUserPreset('effect', e.detail);
    }
    this._clearEditorDraft('effects');
    this._editingPreset = undefined;
    this._setActiveTab('presets');
  }

  private async _handleEditorCancel(): Promise<void> {
    await this._stopActivePreview();
    this._clearEditorDraft(this._activeTab);
    this._resetCurrentEditor();
    this._editingPreset = undefined;
    this._setActiveTab('activate');
  }

  private async _stopActivePreview(): Promise<void> {
    switch (this._activeTab) {
      case 'effects':
        if (this._effectPreviewActive) await this._handleEffectStopPreview();
        break;
      case 'patterns':
        if (this._patternPreviewActive) await this._handlePatternStopPreview();
        break;
      case 'cct':
        if (this._cctPreviewActive) await this._handleCCTStopPreview();
        break;
      case 'segments':
        if (this._segmentSequencePreviewActive) await this._handleSegmentSequenceStopPreview();
        break;
      case 'scenes':
        if (this._scenePreviewActive) await this._handleSceneStopPreview();
        break;
    }
  }

  private _resetCurrentEditor(): void {
    const editorSelectors: Partial<Record<PanelTab, string>> = {
      effects: 'effect-editor',
      patterns: 'pattern-editor',
      cct: 'cct-sequence-editor',
      segments: 'segment-sequence-editor',
      scenes: 'dynamic-scene-editor',
    };

    const selector = editorSelectors[this._activeTab];
    if (!selector) return;

    const editor = this.shadowRoot?.querySelector(selector) as
      | { resetToDefaults?: () => void }
      | null;
    if (editor && typeof editor.resetToDefaults === 'function') {
      editor.resetToDefaults();
    }
  }

  private async _handleEffectPreview(e: CustomEvent): Promise<void> {
    const compatibleEntities = this._getEffectsCompatibleEntities();
    if (!compatibleEntities.length) {
      console.warn('No compatible entities selected for effect preview');
      return;
    }

    const data = e.detail;
    const serviceData: Record<string, unknown> = {
      entity_id: compatibleEntities,
      effect: data.effect,
      speed: data.effect_speed,
      turn_on: true,
      sync: true,
    };

    // Add individual color parameters (color_1, color_2, etc.)
    // Colors can be either XY format {x, y} or RGB format {r, g, b}
    // Service expects RGB array format [r, g, b]
    if (data.effect_colors) {
      data.effect_colors.forEach((c: { x?: number; y?: number; r?: number; g?: number; b?: number }, index: number) => {
        if (index < 8) {
          // Check if it's XY format or RGB format and convert to RGB array
          if ('x' in c && 'y' in c && c.x !== undefined && c.y !== undefined) {
            // XY format - convert to RGB array
            const rgb = xyToRgb(c.x, c.y, 255);
            serviceData[`color_${index + 1}`] = [rgb.r, rgb.g, rgb.b];
          } else if ('r' in c && 'g' in c && 'b' in c) {
            // RGB format - send as array
            serviceData[`color_${index + 1}`] = [c.r, c.g, c.b];
          }
        }
      });
    }

    if (data.effect_brightness !== undefined) {
      serviceData.brightness = data.effect_brightness;
    }

    if (data.effect_segments) {
      serviceData.segments = data.effect_segments;
    }

    // Pass audio-reactive config if configured in the editor
    if (data.audio_config?.audio_entity && data.audio_config?.audio_speed_mode) {
      serviceData.audio_entity = data.audio_config.audio_entity;
      serviceData.audio_sensitivity = data.audio_config.audio_sensitivity;
      serviceData.audio_silence_behavior = data.audio_config.audio_silence_behavior;
      serviceData.audio_speed_mode = data.audio_config.audio_speed_mode;
      if (data.audio_config.audio_speed_min !== undefined) serviceData.audio_speed_min = data.audio_config.audio_speed_min;
      if (data.audio_config.audio_speed_max !== undefined) serviceData.audio_speed_max = data.audio_config.audio_speed_max;
    }

    await this.hass.callService('aqara_advanced_lighting', 'set_dynamic_effect', serviceData);
    this._effectPreviewActive = true;
  }

  private async _handleEffectStopPreview(): Promise<void> {
    const compatibleEntities = this._getEffectsCompatibleEntities();
    if (!compatibleEntities.length) return;

    await this.hass.callService('aqara_advanced_lighting', 'stop_effect', {
      entity_id: compatibleEntities,
      restore_state: true,
    });
    this._effectPreviewActive = false;
  }

  private _renderPatternsTab() {
    const editingPattern = this._editingPreset?.type === 'pattern' ? this._editingPreset.preset as UserSegmentPatternPreset : undefined;
    const isCompatible = this._isPatternsCompatible();
    const hasSelection = this._prefs.state.selectedEntities.length > 0;

    return html`
      <ha-card class="editor-form">
        <h2>${editingPattern ? this._localize('dialogs.edit_pattern_title') : this._localize('dialogs.create_pattern_title')}</h2>
        <p class="editor-description">
          ${editingPattern ? this._localize('dialogs.edit_pattern_description') : this._localize('dialogs.create_pattern_description')}
        </p>
        ${hasSelection && !isCompatible ? html`
          <ha-alert alert-type="warning" class="compatibility-warning">
            ${this._localize('dialogs.compatibility_warning_patterns')}
          </ha-alert>
        ` : ''}
        <pattern-editor
          .hass=${this.hass}
          .preset=${editingPattern}
          .draft=${this._getEditorDraft('patterns')}
          .translations=${this._translations}
          .editMode=${!!editingPattern && !this._editingPreset?.isDuplicate}
          .hasSelectedEntities=${hasSelection}
          .isCompatible=${isCompatible}
          .stripSegmentCount=${this._getT1StripSegmentCount()}
          .deviceContext=${this._getDeviceContextForEditor('pattern')}
          .colorHistory=${this._prefs.state.colorHistory}
          .previewActive=${this._patternPreviewActive}
          @save=${this._handlePatternSave}
          @preview=${this._handlePatternPreview}
          @stop-preview=${this._handlePatternStopPreview}
          @cancel=${this._handleEditorCancel}
        ></pattern-editor>
      </ha-card>
    `;
  }

  private async _handlePatternSave(e: CustomEvent): Promise<void> {
    if (this._editingPreset?.type === 'pattern' && !this._editingPreset.isDuplicate) {
      const existingPreset = this._editingPreset.preset as UserSegmentPatternPreset;
      await this._updateUserPreset('segment_pattern', existingPreset.id, e.detail);
    } else {
      await this._saveUserPreset('segment_pattern', e.detail);
    }
    this._clearEditorDraft('patterns');
    this._editingPreset = undefined;
    this._setActiveTab('presets');
  }

  private async _handlePatternPreview(e: CustomEvent): Promise<void> {
    const compatibleEntities = this._getPatternsCompatibleEntities();
    if (!compatibleEntities.length) {
      console.warn('No compatible entities selected for pattern preview');
      return;
    }

    const data = e.detail;

    if (!data.segments || !Array.isArray(data.segments)) {
      console.error('Pattern preview: No segments in data');
      return;
    }

    const segment_colors = data.segments.map((s: { segment: number; color: { r: number; g: number; b: number } }) => ({
      segment: s.segment,
      color: { r: s.color.r, g: s.color.g, b: s.color.b },
    }));

    try {
      await this.hass.callService('aqara_advanced_lighting', 'set_segment_pattern', {
        entity_id: compatibleEntities,
        segment_colors,
        turn_on: true,
        turn_off_unspecified: data.turn_off_unspecified ?? true,
        sync: true,
      });
      this._patternPreviewActive = true;
    } catch (err) {
      console.error('Pattern preview service call failed:', err);
    }
  }

  private async _handlePatternStopPreview(): Promise<void> {
    const compatibleEntities = this._getPatternsCompatibleEntities();
    if (!compatibleEntities.length) return;

    await this.hass.callService('aqara_advanced_lighting', 'stop_effect', {
      entity_id: compatibleEntities,
      restore_state: true,
    });
    this._patternPreviewActive = false;
  }

  private _renderCCTTab() {
    const editingCCT = this._editingPreset?.type === 'cct' ? this._editingPreset.preset as UserCCTSequencePreset : undefined;
    const isCompatible = this._isCCTCompatible();
    const hasSelection = this._prefs.state.selectedEntities.length > 0;

    return html`
      <ha-card class="editor-form">
        <h2>${editingCCT ? this._localize('dialogs.edit_cct_title') : this._localize('dialogs.create_cct_title')}</h2>
        <p class="editor-description">
          ${editingCCT ? this._localize('dialogs.edit_cct_description') : this._localize('dialogs.create_cct_description')}
        </p>
        ${hasSelection && !isCompatible ? html`
          <ha-alert alert-type="warning" class="compatibility-warning">
            ${this._localize('dialogs.compatibility_warning_cct')}
          </ha-alert>
        ` : ''}
        <cct-sequence-editor
          .hass=${this.hass}
          .preset=${editingCCT}
          .draft=${this._getEditorDraft('cct')}
          .translations=${this._translations}
          .editMode=${!!editingCCT && !this._editingPreset?.isDuplicate}
          .hasSelectedEntities=${hasSelection}
          .isCompatible=${isCompatible}
          .selectedEntities=${this._prefs.state.selectedEntities}
          .previewActive=${this._cctPreviewActive}
          .deviceContext=${this._getDeviceContextForEditor('cct')}
          @save=${this._handleCCTSave}
          @preview=${this._handleCCTPreview}
          @stop-preview=${this._handleCCTStopPreview}
          @cancel=${this._handleEditorCancel}
        ></cct-sequence-editor>
      </ha-card>
    `;
  }

  private async _handleCCTSave(e: CustomEvent): Promise<void> {
    if (this._editingPreset?.type === 'cct' && !this._editingPreset.isDuplicate) {
      const existingPreset = this._editingPreset.preset as UserCCTSequencePreset;
      await this._updateUserPreset('cct_sequence', existingPreset.id, e.detail);
    } else {
      await this._saveUserPreset('cct_sequence', e.detail);
    }
    this._clearEditorDraft('cct');
    this._editingPreset = undefined;
    this._setActiveTab('presets');
  }

  private async _handleCCTPreview(e: CustomEvent): Promise<void> {
    const compatibleEntities = this._getCCTCompatibleEntities();
    if (!compatibleEntities.length) {
      console.warn('No compatible entities selected for CCT preview');
      return;
    }

    const data = e.detail;
    const isAdaptive = (data.mode === 'schedule' && data.schedule_steps) || (data.mode === 'solar' && data.solar_steps);
    const serviceData: Record<string, unknown> = {
      entity_id: compatibleEntities,
      loop_mode: data.loop_mode,
      end_behavior: data.end_behavior,
      skip_first_in_loop: data.skip_first_in_loop || false,
      turn_on: !isAdaptive,
      sync: true,
    };

    // Add loop_count only if loop_mode is 'count'
    if (data.loop_mode === 'count' && data.loop_count !== undefined) {
      serviceData.loop_count = data.loop_count;
    }

    if (data.mode === 'schedule' && data.schedule_steps) {
      serviceData.mode = 'schedule';
      serviceData.schedule_steps = data.schedule_steps;
    } else if (data.mode === 'solar' && data.solar_steps) {
      serviceData.mode = 'solar';
      serviceData.solar_steps = data.solar_steps;
    } else if (data.steps && Array.isArray(data.steps)) {
      // Standard mode: convert steps array to individual step fields
      data.steps.forEach((step: { color_temp: number; brightness: number; transition: number; hold: number }, index: number) => {
        const stepNum = index + 1;
        if (stepNum <= 20) {
          serviceData[`step_${stepNum}_color_temp`] = step.color_temp;
          serviceData[`step_${stepNum}_brightness`] = step.brightness;
          serviceData[`step_${stepNum}_transition`] = step.transition;
          serviceData[`step_${stepNum}_hold`] = step.hold;
        }
      });
    }

    await this.hass.callService('aqara_advanced_lighting', 'start_cct_sequence', serviceData);
    this._cctPreviewActive = true;
  }

  private async _handleCCTStopPreview(): Promise<void> {
    const compatibleEntities = this._getCCTCompatibleEntities();
    if (!compatibleEntities.length) return;

    await this.hass.callService('aqara_advanced_lighting', 'stop_cct_sequence', {
      entity_id: compatibleEntities,
      restore_state: true,
    });
    this._cctPreviewActive = false;
  }

  private _renderSegmentsTab() {
    const editingSegment = this._editingPreset?.type === 'segment' ? this._editingPreset.preset as UserSegmentSequencePreset : undefined;
    const isCompatible = this._isSegmentsCompatible();
    const hasSelection = this._prefs.state.selectedEntities.length > 0;

    return html`
      <ha-card class="editor-form">
        <h2>${editingSegment ? this._localize('dialogs.edit_segment_title') : this._localize('dialogs.create_segment_title')}</h2>
        <p class="editor-description">
          ${editingSegment ? this._localize('dialogs.edit_segment_description') : this._localize('dialogs.create_segment_description')}
        </p>
        ${hasSelection && !isCompatible ? html`
          <ha-alert alert-type="warning" class="compatibility-warning">
            ${this._localize('dialogs.compatibility_warning_segments')}
          </ha-alert>
        ` : ''}
        <segment-sequence-editor
          .hass=${this.hass}
          .preset=${editingSegment}
          .draft=${this._getEditorDraft('segments')}
          .translations=${this._translations}
          .editMode=${!!editingSegment && !this._editingPreset?.isDuplicate}
          .hasSelectedEntities=${hasSelection}
          .isCompatible=${isCompatible}
          .previewActive=${this._segmentSequencePreviewActive}
          .stripSegmentCount=${this._getT1StripSegmentCount()}
          .deviceContext=${this._getDeviceContextForEditor('segment')}
          .colorHistory=${this._prefs.state.colorHistory}
          @save=${this._handleSegmentSequenceSave}
          @preview=${this._handleSegmentSequencePreview}
          @stop-preview=${this._handleSegmentSequenceStopPreview}
          @cancel=${this._handleEditorCancel}
        ></segment-sequence-editor>
      </ha-card>
    `;
  }

  private async _handleSegmentSequenceSave(e: CustomEvent): Promise<void> {
    if (this._editingPreset?.type === 'segment' && !this._editingPreset.isDuplicate) {
      const existingPreset = this._editingPreset.preset as UserSegmentSequencePreset;
      await this._updateUserPreset('segment_sequence', existingPreset.id, e.detail);
    } else {
      await this._saveUserPreset('segment_sequence', e.detail);
    }
    this._clearEditorDraft('segments');
    this._editingPreset = undefined;
    this._setActiveTab('presets');
  }

  private async _handleSegmentSequencePreview(e: CustomEvent): Promise<void> {
    const compatibleEntities = this._getSegmentsCompatibleEntities();
    if (!compatibleEntities.length) {
      console.warn('No compatible entities selected for segment sequence preview');
      return;
    }

    const data = e.detail;
    const serviceData: Record<string, unknown> = {
      entity_id: compatibleEntities,
      loop_mode: data.loop_mode,
      end_behavior: data.end_behavior,
      clear_segments: data.clear_segments || false,
      skip_first_in_loop: data.skip_first_in_loop || false,
      turn_on: true,
      sync: true,
    };

    // Add loop_count only if loop_mode is 'count'
    if (data.loop_mode === 'count' && data.loop_count !== undefined) {
      serviceData.loop_count = data.loop_count;
    }

    // Convert steps array to individual step fields
    if (data.steps && Array.isArray(data.steps)) {
      data.steps.forEach((step: { segments: string; mode: string; colors: number[][]; segment_colors?: Array<{segment: number, color: {r: number, g: number, b: number}}>; duration: number; hold: number; activation_pattern: string }, index: number) => {
        const stepNum = index + 1;
        if (stepNum <= 20) {
          serviceData[`step_${stepNum}_segments`] = step.segments;
          serviceData[`step_${stepNum}_mode`] = step.mode;
          serviceData[`step_${stepNum}_duration`] = step.duration;
          serviceData[`step_${stepNum}_hold`] = step.hold;
          serviceData[`step_${stepNum}_activation_pattern`] = step.activation_pattern;

          // Add segment_colors if provided (new format)
          if (step.segment_colors && Array.isArray(step.segment_colors) && step.segment_colors.length > 0) {
            serviceData[`step_${stepNum}_segment_colors`] = step.segment_colors;
          } else {
            // Fallback to individual color parameters (legacy format, up to 6 colors per step)
            if (step.colors && Array.isArray(step.colors)) {
              step.colors.forEach((color: number[], colorIndex: number) => {
                if (colorIndex < 6) {
                  serviceData[`step_${stepNum}_color_${colorIndex + 1}`] = color;
                }
              });
            }
          }
        }
      });
    }

    await this.hass.callService('aqara_advanced_lighting', 'start_segment_sequence', serviceData);
    this._segmentSequencePreviewActive = true;
  }

  private async _handleSegmentSequenceStopPreview(): Promise<void> {
    const compatibleEntities = this._getSegmentsCompatibleEntities();
    if (!compatibleEntities.length) return;

    await this.hass.callService('aqara_advanced_lighting', 'stop_segment_sequence', {
      entity_id: compatibleEntities,
      restore_state: true,
    });
    this._segmentSequencePreviewActive = false;
  }

  // Dynamic scenes: Any light with color capability (RGB or CCT - backend adapts XY to color_temp)
  private _isScenesCompatible(): boolean {
    if (!this.hass || !this._prefs.state.selectedEntities.length) return false;
    return this._prefs.state.selectedEntities.some(entityId => {
      const entity = this.hass!.states[entityId];
      if (!entity) return false;
      return this._hasRGBColorMode(entity) || this._hasCCTColorMode(entity);
    });
  }

  private _hasCCTColorMode(entity: { attributes: Record<string, unknown> }): boolean {
    return hasCCTColorMode(entity);
  }

  private _getScenesCompatibleEntities(): string[] {
    if (!this.hass) return [];
    return this._prefs.state.selectedEntities.filter(entityId => {
      const entity = this.hass!.states[entityId];
      if (!entity) return false;
      return this._hasRGBColorMode(entity) || this._hasCCTColorMode(entity);
    });
  }

  private _renderScenesTab() {
    const editingScene = this._editingPreset?.type === 'dynamic_scene' ? this._editingPreset.preset as UserDynamicScenePreset : undefined;
    const isCompatible = this._isScenesCompatible();
    const hasSelection = this._prefs.state.selectedEntities.length > 0;

    return html`
      <ha-card class="editor-form">
        <h2>${editingScene ? this._localize('dialogs.edit_scene_title') : this._localize('dialogs.create_scene_title')}</h2>
        <p class="editor-description">
          ${editingScene ? this._localize('dialogs.edit_scene_description') : this._localize('dialogs.create_scene_description')}
        </p>
        ${hasSelection && !isCompatible ? html`
          <ha-alert alert-type="warning" class="compatibility-warning">
            ${this._localize('dialogs.compatibility_warning_scenes')}
          </ha-alert>
        ` : ''}
        <dynamic-scene-editor
          .hass=${this.hass}
          .preset=${editingScene}
          .draft=${this._getEditorDraft('scenes')}
          .translations=${this._translations}
          .editMode=${!!editingScene && !this._editingPreset?.isDuplicate}
          .hasSelectedEntities=${hasSelection}
          .isCompatible=${isCompatible}
          .selectedEntities=${this._prefs.state.selectedEntities}
          .previewActive=${this._scenePreviewActive}
          .colorHistory=${this._prefs.state.colorHistory}
          .defaultAudioEntity=${this._prefs.state.audioOverrideEntity}
          @save=${this._handleSceneSave}
          @preview=${this._handleScenePreview}
          @stop-preview=${this._handleSceneStopPreview}
          @cancel=${this._handleEditorCancel}
          @color-history-changed=${this._handleColorHistoryChanged}
        ></dynamic-scene-editor>
      </ha-card>
    `;
  }

  private async _handleSceneSave(e: CustomEvent): Promise<void> {
    if (this._editingPreset?.type === 'dynamic_scene' && !this._editingPreset.isDuplicate) {
      const existingPreset = this._editingPreset.preset as UserDynamicScenePreset;
      await this._updateUserPreset('dynamic_scene', existingPreset.id, e.detail);
    } else {
      await this._saveUserPreset('dynamic_scene', e.detail);
    }
    this._clearEditorDraft('scenes');
    this._editingPreset = undefined;
    this._setActiveTab('presets');
  }

  private async _handleScenePreview(e: CustomEvent): Promise<void> {
    const compatibleEntities = this._getScenesCompatibleEntities();
    if (!compatibleEntities.length) {
      console.warn('No compatible entities selected for scene preview');
      return;
    }

    const data = e.detail;
    const serviceData: Record<string, unknown> = {
      entity_id: compatibleEntities,
      transition_time: data.transition_time,
      hold_time: data.hold_time,
      distribution_mode: data.distribution_mode,
      random_order: data.random_order,
      loop_mode: data.loop_mode,
      end_behavior: data.end_behavior,
    };

    // Add offset_delay only if provided and non-zero
    if (data.offset_delay !== undefined && data.offset_delay > 0) {
      serviceData.offset_delay = data.offset_delay;
    }

    // Add loop_count only if loop_mode is 'count'
    if (data.loop_mode === 'count' && data.loop_count !== undefined) {
      serviceData.loop_count = data.loop_count;
    }

    // Add colors array in XY format with brightness: {x, y, brightness_pct}
    if (data.colors && Array.isArray(data.colors)) {
      serviceData.colors = data.colors.map((color: { x: number; y: number; brightness_pct: number }) => ({
        x: color.x,
        y: color.y,
        brightness_pct: color.brightness_pct,
      }));
    }

    // Pass through audio fields from editor (included when audio enabled + entity selected)
    if (data.audio_entity) {
      serviceData.audio_entity = data.audio_entity;
      if (data.audio_color_advance) serviceData.audio_color_advance = data.audio_color_advance;
      if (data.audio_sensitivity != null) serviceData.audio_sensitivity = data.audio_sensitivity;
      if (data.audio_brightness_curve !== undefined) serviceData.audio_brightness_curve = data.audio_brightness_curve;
      if (data.audio_brightness_min != null) serviceData.audio_brightness_min = data.audio_brightness_min;
      if (data.audio_brightness_max != null) serviceData.audio_brightness_max = data.audio_brightness_max;
      if (data.audio_transition_speed != null) serviceData.audio_transition_speed = data.audio_transition_speed;
      if (data.audio_detection_mode != null) serviceData.audio_detection_mode = data.audio_detection_mode;
      if (data.audio_frequency_zone != null) serviceData.audio_frequency_zone = data.audio_frequency_zone;
      if (data.audio_silence_behavior != null) serviceData.audio_silence_behavior = data.audio_silence_behavior;
      if (data.audio_prediction_aggressiveness != null) serviceData.audio_prediction_aggressiveness = data.audio_prediction_aggressiveness;
      if (data.audio_latency_compensation_ms != null) serviceData.audio_latency_compensation_ms = data.audio_latency_compensation_ms;
      if (data.audio_color_by_frequency != null) serviceData.audio_color_by_frequency = data.audio_color_by_frequency;
      if (data.audio_rolloff_brightness != null) serviceData.audio_rolloff_brightness = data.audio_rolloff_brightness;
    }

    await this.hass.callService('aqara_advanced_lighting', 'start_dynamic_scene', serviceData);
    this._scenePreviewActive = true;
  }

  private async _handleSceneStopPreview(): Promise<void> {
    const compatibleEntities = this._getScenesCompatibleEntities();
    if (!compatibleEntities.length) return;

    await this.hass.callService('aqara_advanced_lighting', 'stop_dynamic_scene', {
      entity_id: compatibleEntities,
      restore_state: true,
    });
    this._scenePreviewActive = false;
  }

  private _enterSelectMode(): void {
    this._selectedPresetIds = new Set();
    this._isSelectMode = true;
    this._presetEditModeId = null;
  }

  private _exitSelectMode(): void {
    this._isSelectMode = false;
    this._selectedPresetIds = new Set();
  }

  private _togglePresetSelection(id: string): void {
    const next = new Set(this._selectedPresetIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    this._selectedPresetIds = next;
  }

  private _getAllPresetIds(): string[] {
    if (!this._userPresets) return [];
    return [
      ...this._userPresets.effect_presets.map(p => p.id),
      ...this._userPresets.segment_pattern_presets.map(p => p.id),
      ...this._userPresets.cct_sequence_presets.map(p => p.id),
      ...this._userPresets.segment_sequence_presets.map(p => p.id),
      ...this._userPresets.dynamic_scene_presets.map(p => p.id),
    ];
  }

  private _isAllSelected(): boolean {
    const all = this._getAllPresetIds();
    return all.length > 0 && all.every(id => this._selectedPresetIds.has(id));
  }

  private _toggleSelectAll(): void {
    if (this._isAllSelected()) {
      this._selectedPresetIds = new Set();
    } else {
      this._selectedPresetIds = new Set(this._getAllPresetIds());
    }
  }

  private async _handleExportSelected(): Promise<void> {
    if (!this._userPresets || this._selectedPresetIds.size === 0) return;
    const exportedCount = this._selectedPresetIds.size;
    try {
      await this._exportPresets([...this._selectedPresetIds]);
      this._exitSelectMode();
      this._showToast(
        this._localize('presets.export_selected_success', {
          count: exportedCount.toString(),
        }),
      );
    } catch (err) {
      this._showToast(this._localize('presets.export_error_network'));
      console.error('Export error:', err);
    }
  }

  private async _handleExportPresets(): Promise<void> {
    this._isExporting = true;
    this.requestUpdate();
    try {
      await this._exportPresets();
      this._showToast(this._localize('presets.export_success'));
    } catch (err) {
      this._showToast(this._localize('presets.export_error_network'));
      console.error('Export error:', err);
    } finally {
      this._isExporting = false;
      this.requestUpdate();
    }
  }

  /**
   * Export presets via a signed backend URL.
   * Uses HA's sign_path WebSocket command to create a temporary
   * authenticated URL, then navigates to it. The Content-Disposition
   * attachment header triggers a download without leaving the page.
   * This works in both desktop browsers and the HA mobile app WebView
   * (which cannot handle blob: URLs).
   */
  private async _exportPresets(presetIds?: string[]): Promise<void> {
    let path = '/api/aqara_advanced_lighting/presets/export';
    if (presetIds?.length) {
      path += `?preset_ids=${encodeURIComponent(presetIds.join(','))}`;
    }

    const result = await this.hass.callWS<{ path: string }>({
      type: 'auth/sign_path',
      path,
    });

    window.location.href = result.path;
  }

  private _handleImportClick(): void {
    // Trigger file input
    if (!this._fileInputRef) {
      this._fileInputRef = document.createElement('input');
      this._fileInputRef.type = 'file';
      this._fileInputRef.accept = '.json,application/json';
      this._fileInputRef.addEventListener('change', (e) => {
        const target = e.target as HTMLInputElement;
        if (target.files && target.files[0]) {
          this._handleImportFile(target.files[0]);
        }
      });
    }
    this._fileInputRef.click();
  }

  private async _handleImportFile(file: File): Promise<void> {
    this._isImporting = true;
    this.requestUpdate();

    try {
      // Read file content
      const content = await file.text();
      const importData = JSON.parse(content);

      // Send to API
      const result = await this.hass.callApi<{ counts: Record<string, number> }>('POST', 'aqara_advanced_lighting/presets/import', importData);
      const totalCount = Object.values(result.counts).reduce(
        (sum: number, count) => sum + (count as number),
        0
      );

      // Show success toast with count
      this._showToast(this._localize('presets.import_success', { count: totalCount.toString() }));

      // Refresh presets display
      await this._loadUserPresets({ bypassCache: true });
    } catch (err) {
      let errorMessage = this._localize('presets.import_error_unknown');

      if (err instanceof SyntaxError) {
        errorMessage = this._localize('presets.import_error_invalid_file');
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      this._showToast(errorMessage);
      console.error('Import error:', err);
    } finally {
      this._isImporting = false;
      this.requestUpdate();
    }
  }

  private _showToast(message: string): void {
    // Use Home Assistant's toast system
    const event = new CustomEvent('hass-notification', {
      detail: {
        message: message,
        duration: 3000,
      },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }

  private _renderPresetsTab() {
    const effectPresets = this._userPresets?.effect_presets || [];
    const patternPresets = this._userPresets?.segment_pattern_presets || [];
    const cctPresets = this._userPresets?.cct_sequence_presets || [];
    const segmentPresets = this._userPresets?.segment_sequence_presets || [];
    const scenePresets = this._userPresets?.dynamic_scene_presets || [];
    const totalCount = effectPresets.length + patternPresets.length + cctPresets.length + segmentPresets.length + scenePresets.length;

    const myPresetsSectionId = 'my_presets_overview';
    const myPresetsExpanded = !this._prefs.state.collapsed[myPresetsSectionId];

    return html`
      <ha-expansion-panel
        outlined
        .expanded=${myPresetsExpanded}
        @expanded-changed=${(e: CustomEvent) => this._handleExpansionChange(myPresetsSectionId, e)}
      >
        <div slot="header" class="section-header">
          <div>
            <div class="section-title">${this._localize('tabs.presets')}</div>
            <div class="section-subtitle">
              ${this._localize('sections.subtitle_user_presets', {count: totalCount.toString()})}
            </div>
          </div>
        </div>
        <div class="section-content preset-management-content">
          ${this._isSelectMode
            ? html`
              <div class="toolbar-actions toolbar-select-mode">
                <ha-button @click=${() => this._exitSelectMode()}>
                  <ha-icon icon="mdi:close" slot="icon"></ha-icon>
                  ${this._localize('presets.select_cancel')}
                </ha-button>
                <ha-button @click=${() => this._toggleSelectAll()}>
                  <ha-icon icon=${this._isAllSelected()
                    ? 'mdi:checkbox-multiple-blank-outline'
                    : 'mdi:checkbox-multiple-outline'} slot="icon"></ha-icon>
                  ${this._isAllSelected()
                    ? this._localize('presets.deselect_all')
                    : this._localize('presets.select_all')}
                </ha-button>
                <ha-button
                  @click=${() => this._handleExportSelected()}
                  .disabled=${this._selectedPresetIds.size === 0}
                >
                  <ha-icon icon="mdi:download" slot="icon"></ha-icon>
                  ${this._localize('presets.export_selected_button', {
                    count: this._selectedPresetIds.size.toString(),
                  })}
                </ha-button>
              </div>
            `
            : html`
              <div class="toolbar-actions">
                <ha-button
                  @click=${this._handleExportPresets}
                  .disabled=${this._isExporting || this._isImporting}
                >
                  <ha-icon icon="mdi:download" slot="icon"></ha-icon>
                  ${this._isExporting
                    ? this._localize('presets.export_progress')
                    : this._localize('presets.export_button')}
                </ha-button>

                <ha-button
                  @click=${this._handleImportClick}
                  .disabled=${this._isExporting || this._isImporting}
                >
                  <ha-icon icon="mdi:upload" slot="icon"></ha-icon>
                  ${this._isImporting
                    ? this._localize('presets.import_progress')
                    : this._localize('presets.import_button')}
                </ha-button>

                <ha-button
                  @click=${() => this._enterSelectMode()}
                  .disabled=${totalCount === 0 || this._isExporting || this._isImporting}
                >
                  <ha-icon icon="mdi:checkbox-multiple-marked-outline" slot="icon"></ha-icon>
                  ${this._localize('presets.select_button')}
                </ha-button>

                <ha-button
                  @click=${() => this._restoreAllHiddenPresets()}
                  .disabled=${this._prefs.state.hiddenBuiltinPresets.length === 0}
                >
                  <ha-icon icon="mdi:eye-outline" slot="icon"></ha-icon>
                  ${this._localize('presets.restore_hidden_button')}
                  ${this._prefs.state.hiddenBuiltinPresets.length > 0
                    ? html` (${this._prefs.state.hiddenBuiltinPresets.length})`
                    : ''}
                </ha-button>
              </div>
            `}
        </div>
      </ha-expansion-panel>

      ${totalCount === 0
        ? html`
            <div class="no-presets">
              <ha-icon icon="mdi:folder-open-outline"></ha-icon>
              <p>${this._localize('presets.no_presets_title')}</p>
              <p>${this._localize('presets.no_presets_description')}</p>
            </div>
          `
        : html`
            ${this._renderPresetDeviceSections(
              this._localize('sections.dynamic_effects'), 'presets_effects',
              effectPresets,
              (p) => this._editEffectPreset(p),
              'effect',
              (p) => this._renderUserEffectIcon(p),
              (presets, opt) => this._sortPresets(presets, opt),
              (p) => this._duplicateUserEffectPreset(p),
            )}

            ${this._renderPresetDeviceSections(
              this._localize('sections.segment_patterns'), 'presets_patterns',
              patternPresets,
              (p) => this._editPatternPreset(p),
              'segment_pattern',
              (p) => this._renderUserPatternIcon(p),
              (presets, opt) => this._sortPresets(presets, opt),
              (p) => this._duplicateUserPatternPreset(p),
            )}

            ${cctPresets.length > 0
              ? this._renderPresetSection(
                  this._localize('sections.cct_sequences'), 'presets_cct',
                  cctPresets,
                  (p) => this._editCCTSequencePreset(p),
                  'cct_sequence',
                  (p) => this._renderUserCCTIcon(p),
                  (presets, opt) => this._sortPresets(presets, opt),
                  (p) => this._duplicateUserCCTSequencePreset(p),
                )
              : ''}

            ${this._renderPresetDeviceSections(
              this._localize('sections.segment_sequences'), 'presets_segments',
              segmentPresets,
              (p) => this._editSegmentSequencePreset(p),
              'segment_sequence',
              (p) => this._renderUserSegmentSequenceIcon(p),
              (presets, opt) => this._sortPresets(presets, opt),
              (p) => this._duplicateUserSegmentSequencePreset(p),
            )}

            ${scenePresets.length > 0
              ? this._renderPresetSection(
                  this._localize('sections.dynamic_scenes'), 'presets_scenes',
                  scenePresets,
                  (p) => this._editDynamicScenePreset(p),
                  'dynamic_scene',
                  (p) => this._renderUserDynamicSceneIcon(p),
                  (presets, opt) => this._sortPresets(presets, opt),
                  (p) => this._duplicateUserDynamicScenePreset(p),
                )
              : ''}
          `}
    `;
  }

  /**
   * Render one ha-expansion-panel per device type for a preset category.
   * Matches the Activate tab pattern: "Dynamic Effects: T2 Bulb", "Segment Patterns: T1M", etc.
   * Presets without device_type are shown in a general section titled by the category name alone.
   */
  private _renderPresetDeviceSections<T extends { id: string; name: string; device_type?: string }>(
    categoryTitle: string,
    sectionPrefix: string,
    presets: T[],
    onEdit: (preset: T) => void,
    deleteType: string,
    renderIcon: (preset: T) => unknown,
    sortFn: (presets: T[], sortOption: PresetSortOption) => T[],
    onDuplicate: (preset: T) => void,
  ) {
    if (presets.length === 0) return '';

    const { ungrouped, grouped } = this._groupPresetsByDeviceType(presets);

    return html`
      ${ungrouped.length > 0
        ? this._renderPresetSection(
            categoryTitle, sectionPrefix,
            ungrouped, onEdit, deleteType, renderIcon, sortFn, onDuplicate,
          )
        : ''}
      ${AqaraPanel.PRESET_DEVICE_TYPES.map((deviceKey) => {
        const devicePresets = grouped.get(deviceKey);
        if (!devicePresets?.length) return '';
        const deviceLabel = this._localize(`devices.${deviceKey}`);
        return this._renderPresetSection(
          `${categoryTitle}: ${deviceLabel}`, `${sectionPrefix}_${deviceKey}`,
          devicePresets, onEdit, deleteType, renderIcon, sortFn, onDuplicate,
        );
      })}
    `;
  }

  /**
   * Render a single ha-expansion-panel section with preset cards inside.
   * Uses the same header structure as the Activate tab (section-title, section-subtitle, sort controls).
   * Sorting is applied per-section using the section ID as the sort preference key.
   */
  private _renderPresetSection<T extends { id: string; name: string }>(
    title: string,
    sectionId: string,
    presets: T[],
    onEdit: (preset: T) => void,
    deleteType: string,
    renderIcon: (preset: T) => unknown,
    sortFn: (presets: T[], sortOption: PresetSortOption) => T[],
    onDuplicate: (preset: T) => void,
  ) {
    const isExpanded = !this._prefs.state.collapsed[sectionId];
    const sortOption = this._getSortPreference(sectionId);
    const sortedPresets = sortFn(presets, sortOption);

    return html`
      <ha-expansion-panel
        outlined
        .expanded=${isExpanded}
        @expanded-changed=${(e: CustomEvent) => this._handleExpansionChange(sectionId, e)}
      >
        <div slot="header" class="section-header">
          <div>
            <div class="section-title">${title}</div>
            <div class="section-subtitle">${this._localize('presets.presets_count', { count: presets.length.toString() })}</div>
          </div>
          <div class="section-header-controls" @click=${(e: Event) => e.stopPropagation()}>
            ${this._renderSortDropdown(sectionId)}
          </div>
        </div>
        <div class="section-content preset-grid">
          ${sortedPresets.map((preset) => this._renderPresetCard(
            preset, onEdit, deleteType, renderIcon, onDuplicate,
          ))}
        </div>
      </ha-expansion-panel>
    `;
  }

  /** Render a single user preset card with action buttons. */
  /** Render a single user preset card with action buttons or selection checkbox. */
  private _renderPresetCard<T extends { id: string; name: string }>(
    preset: T,
    onEdit: (preset: T) => void,
    deleteType: string,
    renderIcon: (preset: T) => unknown,
    onDuplicate: (preset: T) => void,
  ) {
    if (this._isSelectMode) {
      const isSelected = this._selectedPresetIds.has(preset.id);
      return html`
        <div
          class="user-preset-card select-mode ${isSelected ? 'selected' : ''}"
          title="${preset.name}"
          aria-label="${preset.name}"
          aria-pressed="${isSelected}"
          @click=${() => this._togglePresetSelection(preset.id)}
        >
          <div class="preset-select-checkbox">
            <ha-icon icon=${isSelected
              ? 'mdi:checkbox-marked'
              : 'mdi:checkbox-blank-outline'}
            ></ha-icon>
          </div>
          <div class="preset-icon">
            ${renderIcon(preset)}
          </div>
          <div class="preset-name">${preset.name}</div>
        </div>
      `;
    }

    const isEditMode = this._presetEditModeId === preset.id;
    return html`
      <div
        class="user-preset-card ${isEditMode ? 'edit-mode' : ''}"
        title="${preset.name}"
        aria-label="${preset.name}"
        @click=${() => { this._presetEditModeId = isEditMode ? null : preset.id; }}
      >
        <div class="preset-card-actions preset-card-actions-left">
          <ha-icon-button
            @click=${(e: Event) => { e.stopPropagation(); onEdit(preset); }}
            title="${this._localize('tooltips.preset_edit')}"
          >
            <ha-icon icon="mdi:pencil"></ha-icon>
          </ha-icon-button>
        </div>
        <div class="preset-card-actions">
          <ha-icon-button
            @click=${(e: Event) => { e.stopPropagation(); onDuplicate(preset); }}
            title="${this._localize('tooltips.preset_duplicate')}"
          >
            <ha-icon icon="mdi:content-copy"></ha-icon>
          </ha-icon-button>
        </div>
        <div class="preset-card-actions preset-card-actions-right">
          <ha-icon-button
            @click=${(e: Event) => { e.stopPropagation(); this._deleteUserPreset(deleteType, preset.id); }}
            title="${this._localize('tooltips.preset_delete')}"
          >
            <ha-icon icon="mdi:delete"></ha-icon>
          </ha-icon-button>
        </div>
        <div class="preset-icon">
          ${renderIcon(preset)}
        </div>
        <div class="preset-name">${preset.name}</div>
      </div>
    `;
  }

  // Edit preset methods - navigate to editor tab with preset loaded
  private _editEffectPreset(preset: UserEffectPreset): void {
    this._clearEditorDraft('effects');
    this._editingPreset = { type: 'effect', preset };
    this._setActiveTab('effects');
  }

  private _editPatternPreset(preset: UserSegmentPatternPreset): void {
    this._clearEditorDraft('patterns');
    this._editingPreset = { type: 'pattern', preset };
    this._setActiveTab('patterns');
  }

  private _editCCTSequencePreset(preset: UserCCTSequencePreset): void {
    this._clearEditorDraft('cct');
    this._editingPreset = { type: 'cct', preset };
    this._setActiveTab('cct');
  }

  private _editSegmentSequencePreset(preset: UserSegmentSequencePreset): void {
    this._clearEditorDraft('segments');
    this._editingPreset = { type: 'segment', preset };
    this._setActiveTab('segments');
  }

  // Duplicate user preset methods - open editor in create mode with preset data pre-filled
  private _duplicateUserPreset<T extends { id: string; name: string; created_at: string; modified_at: string }>(
    preset: T, type: string, tab: PanelTab
  ): void {
    const copy = { ...preset, id: '', name: `${preset.name} ${this._localize('presets.copy_suffix')}`, created_at: '', modified_at: '' };
    this._clearEditorDraft(tab);
    this._editingPreset = { type, preset: copy as any, isDuplicate: true };
    this._setActiveTab(tab);
  }

  private _duplicateUserEffectPreset(preset: UserEffectPreset): void { this._duplicateUserPreset(preset, 'effect', 'effects'); }
  private _duplicateUserPatternPreset(preset: UserSegmentPatternPreset): void { this._duplicateUserPreset(preset, 'pattern', 'patterns'); }
  private _duplicateUserCCTSequencePreset(preset: UserCCTSequencePreset): void { this._duplicateUserPreset(preset, 'cct', 'cct'); }
  private _duplicateUserSegmentSequencePreset(preset: UserSegmentSequencePreset): void { this._duplicateUserPreset(preset, 'segment', 'segments'); }
  private _duplicateUserDynamicScenePreset(preset: UserDynamicScenePreset): void { this._duplicateUserPreset(preset, 'dynamic_scene', 'scenes'); }

  private _editDynamicScenePreset(preset: UserDynamicScenePreset): void {
    this._clearEditorDraft('scenes');
    this._editingPreset = { type: 'dynamic_scene', preset };
    this._setActiveTab('scenes');
  }

  // Duplicate built-in preset methods - convert from built-in format to user format and open editor
  private _duplicateBuiltinEffectPreset(preset: DynamicEffectPreset, deviceType: string): void {
    const userPreset = builtinEffectToUser(preset, deviceType, this._localize('presets.copy_suffix'));
    this._clearEditorDraft('effects');
    this._editingPreset = { type: 'effect', preset: userPreset, isDuplicate: true };
    this._setActiveTab('effects');
  }

  private _getDeviceSegmentCount(deviceType: string): number {
    switch (deviceType) {
      case 't1': return 20;
      case 't1m': return 26;
      case 't1_strip': return this._getT1StripSegmentCount();
      default: return 26;
    }
  }

  private _duplicateBuiltinPatternPreset(preset: SegmentPatternPreset, deviceType: string): void {
    const userPreset = builtinPatternToUser(preset, deviceType, this._getDeviceSegmentCount(deviceType), this._localize('presets.copy_suffix'));
    this._clearEditorDraft('patterns');
    this._editingPreset = { type: 'pattern', preset: userPreset, isDuplicate: true };
    this._setActiveTab('patterns');
  }

  private _duplicateBuiltinCCTSequencePreset(preset: CCTSequencePreset): void {
    const userPreset = builtinCCTToUser(preset, this._localize('presets.copy_suffix'));
    this._clearEditorDraft('cct');
    this._editingPreset = { type: 'cct', preset: userPreset, isDuplicate: true };
    this._setActiveTab('cct');
  }

  private _duplicateBuiltinSegmentSequencePreset(preset: SegmentSequencePreset, deviceType: string): void {
    const userPreset = builtinSegmentSequenceToUser(preset, deviceType, this._localize('presets.copy_suffix'));
    this._clearEditorDraft('segments');
    this._editingPreset = { type: 'segment', preset: userPreset, isDuplicate: true };
    this._setActiveTab('segments');
  }

  private _duplicateBuiltinDynamicScenePreset(preset: DynamicScenePreset): void {
    const userPreset = builtinDynamicSceneToUser(preset, this._localize('presets.copy_suffix'));
    this._clearEditorDraft('scenes');
    this._editingPreset = { type: 'dynamic_scene', preset: userPreset, isDuplicate: true };
    this._setActiveTab('scenes');
  }

  private get _sortOptions() {
    return [
      { value: 'custom', label: this._localize('presets.sort_custom') },
      { value: 'name-asc', label: this._localize('presets.sort_name_asc') },
      { value: 'name-desc', label: this._localize('presets.sort_name_desc') },
      { value: 'date-new', label: this._localize('presets.sort_date_new') },
      { value: 'date-old', label: this._localize('presets.sort_date_old') },
    ];
  }

  private _renderSortDropdown(sectionId: string) {
    const currentSort = this._getSortPreference(sectionId);
    return html`
      <ha-selector
        class="sort-select"
        .hass=${this.hass}
        .selector=${{
          select: {
            options: this._sortOptions,
            mode: 'dropdown',
          },
        }}
        .value=${currentSort}
        @value-changed=${(e: CustomEvent) => {
          e.stopPropagation();
          if (e.detail.value) {
            this._setSortPreference(sectionId, e.detail.value as PresetSortOption);
          }
        }}
        @click=${(e: Event) => e.stopPropagation()}
      ></ha-selector>
    `;
  }

  /** Render the Favorite Presets section in the Activate tab. Filtered by device capabilities. */
  private _renderFavoritesSection() {
    if (!this._presets || !this._userPresets) return '';

    // Filter hidden built-in presets upstream before resolving (the shared
    // resolveFavorites does not honor _isBuiltinPresetHidden).
    const visibleRefs = this._prefs.state.favoritePresets.filter(
      ref => !this._isBuiltinPresetHidden(ref.type, ref.id),
    );
    const deviceTypes = this._getSelectedDeviceTypes();
    // resolveFavorites already filters via isPresetCompatible, which consults
    // both device-type compat and section-visibility flags via getCapabilityFlags.
    const resolved = resolveFavorites(visibleRefs, this._presets, this._userPresets, deviceTypes);
    if (resolved.length === 0) return '';

    const sectionId = 'favorite_presets';
    const isExpanded = !this._prefs.state.collapsed[sectionId];
    const sortOption = this._getSortPreference(sectionId);
    const sortedFavorites = this._sortResolvedFavorites(resolved, sortOption);
    const isCustomSort = sortOption === 'custom';
    const dragFromId = this._favoriteDrag?.fromId;
    const dragToId = this._favoriteDrag?.toId;

    return html`
      <ha-expansion-panel
        outlined
        .expanded=${isExpanded}
        @expanded-changed=${(e: CustomEvent) => this._handleExpansionChange(sectionId, e)}
      >
        <div slot="header" class="section-header">
          <div>
            <div class="section-title">${this._localize('sections.favorite_presets')}</div>
            <div class="section-subtitle">${this._localize('sections.subtitle_favorites', { count: resolved.length.toString() })}</div>
          </div>
          <div class="section-header-controls" @click=${(e: Event) => e.stopPropagation()}>
            ${this._renderSortDropdown(sectionId)}
          </div>
        </div>
        <div class="section-content">
          ${sortedFavorites.map(({ ref, preset, isUser }) => {
            const isEditMode = this._presetEditModeId === ref.id;
            const isDragSource = dragFromId === ref.id;
            const isDropTarget = dragToId === ref.id && dragFromId !== ref.id;
            return html`
            <div class="preset-button ${isUser ? 'user-preset' : 'builtin-preset'} ${isEditMode ? 'edit-mode' : ''} ${isDragSource ? 'drag-source' : ''} ${isDropTarget ? 'drop-target' : ''}" data-fav-id=${ref.id} role="button" tabindex="0" aria-label="${preset.name}" @click=${() => { if (isEditMode) { this._presetEditModeId = null; } else { this._activateFavoritePreset(ref, preset, isUser); } }} @touchstart=${() => this._handlePresetTouchStart(ref.id)} @touchend=${(e: TouchEvent) => this._handlePresetTouchEnd(e)} @touchmove=${this._handlePresetTouchMove}>
              <div class="preset-card-actions preset-card-actions-left">
                ${this._renderFavoriteStar(ref.type, ref.id)}
              </div>
              ${isCustomSort ? html`
                <div class="preset-card-actions">
                  <ha-icon-button
                    class="favorites-drag-handle"
                    @pointerdown=${(e: PointerEvent) => this._onFavoriteDragStart(e, ref.id)}
                  >
                    <ha-icon icon="mdi:drag"></ha-icon>
                  </ha-icon-button>
                </div>
              ` : ''}
              <div class="preset-icon">
                ${renderPresetIcon(ref, preset, isUser)}
              </div>
              <div class="preset-name">${preset.name}</div>
            </div>
          `;})}
        </div>
      </ha-expansion-panel>
    `;
  }

  private _renderDynamicEffectsSection(title: string, presets: DynamicEffectPreset[], deviceType: string) {
    const sectionId = `dynamic_${title.toLowerCase().replace(/\s+/g, '_')}`;
    const isExpanded = !this._prefs.state.collapsed[sectionId];
    const userPresets = this._getUserEffectPresetsForDeviceType(deviceType);
    const visibleBuiltinPresets = presets.filter(p => !this._isBuiltinPresetHidden('effect', p.id));
    const totalCount = userPresets.length + visibleBuiltinPresets.length;

    // Apply sorting
    const sortOption = this._getSortPreference(sectionId);
    const sortedUserPresets = this._sortPresets(userPresets, sortOption);
    const sortedBuiltinPresets = this._sortPresets(visibleBuiltinPresets, sortOption);

    return html`
      <ha-expansion-panel
        outlined
        .expanded=${isExpanded}
        @expanded-changed=${(e: CustomEvent) => this._handleExpansionChange(sectionId, e)}
      >
        <div slot="header" class="section-header">
          <div>
            <div class="section-title">${this._localize('sections.dynamic_effects')}: ${title}</div>
            <div class="section-subtitle">${userPresets.length > 0 ? this._localize('sections.subtitle_presets_custom', {count: totalCount.toString(), custom: userPresets.length.toString()}) : this._localize('sections.subtitle_presets', {count: totalCount.toString()})}</div>
          </div>
          <div class="section-header-controls" @click=${(e: Event) => e.stopPropagation()}>
            ${this._renderSortDropdown(sectionId)}
          </div>
        </div>
        <div class="section-content">
          ${sortedUserPresets.map(
            (preset) => html`
              <div class="preset-button user-preset ${this._presetEditModeId === preset.id ? 'edit-mode' : ''}" role="button" tabindex="0" aria-label="${preset.name}" @click=${() => { if (this._presetEditModeId === preset.id) { this._presetEditModeId = null; } else { this._activateUserEffectPreset(preset); } }} @touchstart=${() => this._handlePresetTouchStart(preset.id)} @touchend=${(e: TouchEvent) => this._handlePresetTouchEnd(e)} @touchmove=${this._handlePresetTouchMove}>
                <div class="preset-card-actions preset-card-actions-left">
                  ${this._renderFavoriteStar('effect', preset.id)}
                </div>
                <div class="preset-icon">
                  ${this._renderUserEffectIcon(preset)}
                </div>
                <div class="preset-name">${preset.name}</div>
              </div>
            `
          )}
          ${sortedBuiltinPresets.map(
            (preset) => html`
              <div class="preset-button builtin-preset ${this._presetEditModeId === preset.id ? 'edit-mode' : ''}" role="button" tabindex="0" aria-label="${preset.name}" @click=${() => { if (this._presetEditModeId === preset.id) { this._presetEditModeId = null; } else { this._activateDynamicEffect(preset); } }} @touchstart=${() => this._handlePresetTouchStart(preset.id)} @touchend=${(e: TouchEvent) => this._handlePresetTouchEnd(e)} @touchmove=${this._handlePresetTouchMove}>
                <div class="preset-card-actions preset-card-actions-left">
                  ${this._renderFavoriteStar('effect', preset.id)}
                </div>
                <div class="preset-card-actions">
                  <ha-icon-button
                    @click=${(e: Event) => { e.stopPropagation(); this._duplicateBuiltinEffectPreset(preset, deviceType); }}
                    title="${this._localize('tooltips.preset_duplicate')}"
                  >
                    <ha-icon icon="mdi:content-copy"></ha-icon>
                  </ha-icon-button>
                </div>
                ${this._renderHideButton('effect', preset.id)}
                <div class="preset-icon">
                  ${preset.audio_speed_mode
                    ? html`${this._renderPresetIcon(preset.icon, 'mdi:lightbulb-on')}<span class="audio-badge"><ha-icon icon="mdi:waveform"></ha-icon></span>`
                    : this._renderPresetIcon(preset.icon, 'mdi:lightbulb-on')}
                </div>
                <div class="preset-name">${preset.name}</div>
              </div>
            `
          )}
        </div>
      </ha-expansion-panel>
    `;
  }

  private _renderMusicSyncSection() {
    const sectionId = 'music_sync';
    const isExpanded = !this._prefs.state.collapsed[sectionId];

    const effects = [
      { id: 'random', icon: 'random.svg' },
      { id: 'blink', icon: 'blink.svg' },
      { id: 'rainbow', icon: 'rainbow.svg' },
      { id: 'wave', icon: 'wave.svg' },
    ];

    return html`
      <ha-expansion-panel
        outlined
        .expanded=${isExpanded}
        @expanded-changed=${(e: CustomEvent) => this._handleExpansionChange(sectionId, e)}
      >
        <div slot="header" class="section-header">
          <div>
            <div class="section-title">${this._localize('sections.music_sync')}</div>
            <div class="section-subtitle">${this._localize('music_sync.subtitle')}</div>
          </div>
        </div>
        <div class="section-content music-sync-content">
          <div class="music-sync-left">
            <div class="music-sync-toggle">
              <label class="toggle-label">
                <ha-switch
                  .checked=${this._musicSyncEnabled}
                  @change=${this._handleMusicSyncToggle}
                ></ha-switch>
                <span class="control-label">${this._localize('music_sync.enabled_label')}</span>
              </label>
            </div>

            <div class="music-sync-sensitivity-group ${!this._musicSyncEnabled ? 'disabled' : ''}">
              <span class="control-label">${this._localize('music_sync.sensitivity_label')}</span>
              <div class="music-sync-sensitivity">
                <ha-button
                  .disabled=${!this._musicSyncEnabled}
                  @click=${() => this._handleMusicSyncSensitivity('low')}
                  .appearance=${this._musicSyncSensitivity === 'low' ? 'filled' : 'outlined'}
                >${this._localize('music_sync.sensitivity_low')}</ha-button>
                <ha-button
                  .disabled=${!this._musicSyncEnabled}
                  @click=${() => this._handleMusicSyncSensitivity('high')}
                  .appearance=${this._musicSyncSensitivity === 'high' ? 'filled' : 'outlined'}
                >${this._localize('music_sync.sensitivity_high')}</ha-button>
              </div>
            </div>
          </div>

          <div class="music-sync-right ${!this._musicSyncEnabled ? 'disabled' : ''}">
            <span class="control-label">${this._localize('music_sync.effect_label')}</span>
            <div class="music-sync-effects">
              ${effects.map(effect => html`
                <div
                  class="preset-button ${this._musicSyncEffect === effect.id ? 'music-sync-active' : ''} ${!this._musicSyncEnabled ? 'disabled' : ''}"
                  role="button"
                  tabindex="0"
                  aria-label="${this._localize(`music_sync.effect_${effect.id}`)}"
                  aria-disabled="${!this._musicSyncEnabled ? 'true' : 'false'}"
                  @click=${() => this._musicSyncEnabled ? this._handleMusicSyncEffectSelect(effect.id) : null}
                >
                  <div class="preset-icon">
                    <div
                      class="effect-icon"
                      style="
                        -webkit-mask-image: url('/api/aqara_advanced_lighting/icons/${effect.icon}');
                        mask-image: url('/api/aqara_advanced_lighting/icons/${effect.icon}');
                      "
                    ></div>
                  </div>
                  <div class="preset-name">${this._localize(`music_sync.effect_${effect.id}`)}</div>
                </div>
              `)}
            </div>
          </div>
        </div>
      </ha-expansion-panel>
    `;
  }

  private async _handleMusicSyncToggle(e: Event): Promise<void> {
    const enabled = (e.target as HTMLInputElement).checked;
    this._musicSyncEnabled = enabled;

    // Get T1 Strip entities from selection
    const stripEntities = this._prefs.state.selectedEntities.filter(entityId => {
      const dt = this._getEntityDeviceType(entityId);
      return dt === 't1_strip';
    });
    if (stripEntities.length === 0) return;

    await this.hass.callService('aqara_advanced_lighting', 'set_music_sync', {
      entity_id: stripEntities,
      enabled,
      sensitivity: this._musicSyncSensitivity,
      audio_effect: this._musicSyncEffect,
    });
  }

  private async _handleMusicSyncSensitivity(sensitivity: string): Promise<void> {
    this._musicSyncSensitivity = sensitivity;
    if (!this._musicSyncEnabled) return;

    const stripEntities = this._prefs.state.selectedEntities.filter(entityId => {
      const dt = this._getEntityDeviceType(entityId);
      return dt === 't1_strip';
    });
    if (stripEntities.length === 0) return;

    await this.hass.callService('aqara_advanced_lighting', 'set_music_sync', {
      entity_id: stripEntities,
      enabled: true,
      sensitivity,
      audio_effect: this._musicSyncEffect,
    });
  }

  private async _handleMusicSyncEffectSelect(effect: string): Promise<void> {
    this._musicSyncEffect = effect;
    if (!this._musicSyncEnabled) return;

    const stripEntities = this._prefs.state.selectedEntities.filter(entityId => {
      const dt = this._getEntityDeviceType(entityId);
      return dt === 't1_strip';
    });
    if (stripEntities.length === 0) return;

    await this.hass.callService('aqara_advanced_lighting', 'set_music_sync', {
      entity_id: stripEntities,
      enabled: true,
      sensitivity: this._musicSyncSensitivity,
      audio_effect: effect,
    });
  }

  private _renderSegmentPatternsSection(title: string, builtinPresets: SegmentPatternPreset[], deviceType: string) {
    const sectionId = `segment_pat_${title.toLowerCase().replace(/\s+/g, '_')}`;
    const isExpanded = !this._prefs.state.collapsed[sectionId];
    const userPresets = this._getUserPatternPresetsForDeviceType(deviceType);
    const visibleBuiltinPresets = builtinPresets.filter(p => !this._isBuiltinPresetHidden('segment_pattern', p.id));
    const totalCount = userPresets.length + visibleBuiltinPresets.length;

    // Apply sorting
    const sortOption = this._getSortPreference(sectionId);
    const sortedUserPresets = this._sortPresets(userPresets, sortOption);
    const sortedBuiltinPresets = this._sortPresets(visibleBuiltinPresets, sortOption);

    return html`
      <ha-expansion-panel
        outlined
        .expanded=${isExpanded}
        @expanded-changed=${(e: CustomEvent) => this._handleExpansionChange(sectionId, e)}
      >
        <div slot="header" class="section-header">
          <div>
            <div class="section-title">${this._localize('sections.segment_patterns')}: ${title}</div>
            <div class="section-subtitle">${userPresets.length > 0 ? this._localize('sections.subtitle_presets_custom', {count: totalCount.toString(), custom: userPresets.length.toString()}) : this._localize('sections.subtitle_presets', {count: totalCount.toString()})}</div>
          </div>
          <div class="section-header-controls" @click=${(e: Event) => e.stopPropagation()}>
            ${this._renderSortDropdown(sectionId)}
          </div>
        </div>
        <div class="section-content">
          ${sortedUserPresets.map(
            (preset) => html`
              <div class="preset-button user-preset ${this._presetEditModeId === preset.id ? 'edit-mode' : ''}" role="button" tabindex="0" aria-label="${preset.name}" @click=${() => { if (this._presetEditModeId === preset.id) { this._presetEditModeId = null; } else { this._activateUserPatternPreset(preset); } }} @touchstart=${() => this._handlePresetTouchStart(preset.id)} @touchend=${(e: TouchEvent) => this._handlePresetTouchEnd(e)} @touchmove=${this._handlePresetTouchMove}>
                <div class="preset-card-actions preset-card-actions-left">
                  ${this._renderFavoriteStar('segment_pattern', preset.id)}
                </div>
                <div class="preset-icon">
                  ${this._renderUserPatternIcon(preset)}
                </div>
                <div class="preset-name">${preset.name}</div>
              </div>
            `
          )}
          ${sortedBuiltinPresets.map(
            (preset) => html`
              <div class="preset-button builtin-preset ${this._presetEditModeId === preset.id ? 'edit-mode' : ''}" role="button" tabindex="0" aria-label="${preset.name}" @click=${() => { if (this._presetEditModeId === preset.id) { this._presetEditModeId = null; } else { this._activateSegmentPattern(preset); } }} @touchstart=${() => this._handlePresetTouchStart(preset.id)} @touchend=${(e: TouchEvent) => this._handlePresetTouchEnd(e)} @touchmove=${this._handlePresetTouchMove}>
                <div class="preset-card-actions preset-card-actions-left">
                  ${this._renderFavoriteStar('segment_pattern', preset.id)}
                </div>
                <div class="preset-card-actions">
                  <ha-icon-button
                    @click=${(e: Event) => { e.stopPropagation(); this._duplicateBuiltinPatternPreset(preset, deviceType); }}
                    title="${this._localize('tooltips.preset_duplicate')}"
                  >
                    <ha-icon icon="mdi:content-copy"></ha-icon>
                  </ha-icon-button>
                </div>
                ${this._renderHideButton('segment_pattern', preset.id)}
                <div class="preset-icon">
                  ${this._renderPresetIcon(preset.icon, 'mdi:palette')}
                </div>
                <div class="preset-name">${preset.name}</div>
              </div>
            `
          )}
        </div>
      </ha-expansion-panel>
    `;
  }

  private _renderPresetIcon(icon: string | undefined, fallbackIcon: string) {
    if (!icon) {
      return html`<ha-icon icon="${fallbackIcon}"></ha-icon>`;
    }

    // Check if it's a custom icon file (has file extension)
    if (icon.includes('.')) {
      return html`<img src="/api/aqara_advanced_lighting/icons/${icon}" alt="preset icon" />`;
    }

    // Otherwise treat as MDI icon
    return html`<ha-icon icon="${icon}"></ha-icon>`;
  }

  /** Render a user effect preset icon: image or generated thumbnail, or MDI fallback. */
  private _renderUserEffectIcon(preset: UserEffectPreset) {
    // Precedence: uploaded thumbnail > MDI/file icon > auto-generated SVG.
    // An uploaded thumbnail is a deliberate visual choice; the icon field is often
    // a leftover MDI default from preset creation. Mirrors preset-runtime/preset-icon.ts.
    if (preset.icon && !preset.thumbnail) {
      return this._renderPresetIcon(preset.icon, 'mdi:lightbulb-on');
    }
    const thumb = renderEffectThumbnail(preset)
      ?? html`<ha-icon icon="mdi:lightbulb-on"></ha-icon>`;
    if (preset.audio_config?.audio_entity) {
      return html`${thumb}<span class="audio-badge"><ha-icon icon="mdi:waveform"></ha-icon></span>`;
    }
    return thumb;
  }

  /** Render a user segment pattern preset icon: image or pie thumbnail, or MDI fallback. */
  private _renderUserPatternIcon(preset: UserSegmentPatternPreset) {
    // Precedence: uploaded thumbnail > MDI/file icon > auto-generated SVG.
    // An uploaded thumbnail is a deliberate visual choice; the icon field is often
    // a leftover MDI default from preset creation. Mirrors preset-runtime/preset-icon.ts.
    if (preset.icon && !preset.thumbnail) {
      return this._renderPresetIcon(preset.icon, 'mdi:palette');
    }
    return renderSegmentPatternThumbnail(preset)
      ?? html`<ha-icon icon="mdi:palette"></ha-icon>`;
  }

  /** Render a user CCT sequence preset icon: gradient thumbnail or MDI fallback. */
  private _renderUserCCTIcon(preset: UserCCTSequencePreset) {
    if (preset.icon) {
      return this._renderPresetIcon(preset.icon, 'mdi:temperature-kelvin');
    }
    return renderCCTSequenceThumbnail(preset)
      ?? html`<ha-icon icon="mdi:temperature-kelvin"></ha-icon>`;
  }

  /** Render a user segment sequence preset icon: image or ring thumbnail, or MDI fallback. */
  private _renderUserSegmentSequenceIcon(preset: UserSegmentSequencePreset) {
    // Precedence: uploaded thumbnail > MDI/file icon > auto-generated SVG.
    // An uploaded thumbnail is a deliberate visual choice; the icon field is often
    // a leftover MDI default from preset creation. Mirrors preset-runtime/preset-icon.ts.
    if (preset.icon && !preset.thumbnail) {
      return this._renderPresetIcon(preset.icon, 'mdi:animation-play');
    }
    return renderSegmentSequenceThumbnail(preset)
      ?? html`<ha-icon icon="mdi:animation-play"></ha-icon>`;
  }

  /** Render a user dynamic scene preset icon: generated thumbnail or MDI icon. */
  private _renderUserDynamicSceneIcon(preset: UserDynamicScenePreset) {
    const isAudio = !!(preset.audio_entity || preset.audio_color_advance);
    // Precedence: uploaded thumbnail > MDI/file icon > auto-generated SVG.
    // An uploaded thumbnail is a deliberate visual choice; the icon field is often
    // a leftover MDI default from preset creation. Mirrors preset-runtime/preset-icon.ts.
    if (preset.thumbnail) {
      const thumb = renderDynamicSceneThumbnail(preset)
        ?? html`<ha-icon icon="mdi:lamps"></ha-icon>`;
      if (isAudio) {
        return html`${thumb}<span class="audio-badge"><ha-icon icon="mdi:waveform"></ha-icon></span>`;
      }
      return thumb;
    }
    if (preset.icon) {
      const icon = this._renderPresetIcon(preset.icon, 'mdi:lamps');
      if (isAudio) {
        return html`${icon}<span class="audio-badge"><ha-icon icon="mdi:waveform"></ha-icon></span>`;
      }
      return icon;
    }
    const thumb = renderDynamicSceneThumbnail(preset)
      ?? html`<ha-icon icon="mdi:lamps"></ha-icon>`;
    if (isAudio) {
      return html`${thumb}<span class="audio-badge"><ha-icon icon="mdi:waveform"></ha-icon></span>`;
    }
    return thumb;
  }

  /** Render a builtin dynamic scene preset icon: always use gradient thumbnail. */
  private _renderBuiltinDynamicSceneIcon(preset: DynamicScenePreset) {
    const thumb = renderDynamicSceneThumbnail(preset)
      ?? html`<ha-icon icon="mdi:lamps"></ha-icon>`;
    if (preset.audio_color_advance) {
      return html`${thumb}<span class="audio-badge"><ha-icon icon="mdi:waveform"></ha-icon></span>`;
    }
    return thumb;
  }

  private _renderCCTSequencesSection() {
    const sectionId = 'cct_sequences';
    const isExpanded = !this._prefs.state.collapsed[sectionId];
    const userPresets = this._getFilteredUserCCTSequencePresets();
    const visibleBuiltinPresets = this._presets!.cct_sequences.filter(p => !this._isBuiltinPresetHidden('cct_sequence', p.id));
    const totalCount = userPresets.length + visibleBuiltinPresets.length;

    // Apply sorting
    const sortOption = this._getSortPreference(sectionId);
    const sortedUserPresets = this._sortPresets(userPresets, sortOption);
    const sortedBuiltinPresets = this._sortPresets(visibleBuiltinPresets, sortOption);

    return html`
      <ha-expansion-panel
        outlined
        .expanded=${isExpanded}
        @expanded-changed=${(e: CustomEvent) => this._handleExpansionChange(sectionId, e)}
      >
        <div slot="header" class="section-header">
          <div>
            <div class="section-title">${this._localize('sections.cct_sequences')}</div>
            <div class="section-subtitle">${userPresets.length > 0 ? this._localize('sections.subtitle_presets_custom', {count: totalCount.toString(), custom: userPresets.length.toString()}) : this._localize('sections.subtitle_presets', {count: totalCount.toString()})}</div>
          </div>
          <div class="section-header-controls" @click=${(e: Event) => e.stopPropagation()}>
            ${this._renderSortDropdown(sectionId)}
          </div>
        </div>
        <div class="section-content">
          ${sortedUserPresets.map(
            (preset) => html`
              <div class="preset-button user-preset ${this._presetEditModeId === preset.id ? 'edit-mode' : ''}" role="button" tabindex="0" aria-label="${preset.name}" @click=${() => { if (this._presetEditModeId === preset.id) { this._presetEditModeId = null; } else { this._activateUserCCTSequencePreset(preset); } }} @touchstart=${() => this._handlePresetTouchStart(preset.id)} @touchend=${(e: TouchEvent) => this._handlePresetTouchEnd(e)} @touchmove=${this._handlePresetTouchMove}>
                <div class="preset-card-actions preset-card-actions-left">
                  ${this._renderFavoriteStar('cct_sequence', preset.id)}
                </div>
                <div class="preset-icon">
                  ${this._renderUserCCTIcon(preset)}
                </div>
                <div class="preset-name">${preset.name}</div>
              </div>
            `
          )}
          ${sortedBuiltinPresets.map(
            (preset) => html`
              <div class="preset-button builtin-preset ${this._presetEditModeId === preset.id ? 'edit-mode' : ''}" role="button" tabindex="0" aria-label="${preset.name}" @click=${() => { if (this._presetEditModeId === preset.id) { this._presetEditModeId = null; } else { this._activateCCTSequence(preset); } }} @touchstart=${() => this._handlePresetTouchStart(preset.id)} @touchend=${(e: TouchEvent) => this._handlePresetTouchEnd(e)} @touchmove=${this._handlePresetTouchMove}>
                <div class="preset-card-actions preset-card-actions-left">
                  ${this._renderFavoriteStar('cct_sequence', preset.id)}
                </div>
                <div class="preset-card-actions">
                  <ha-icon-button
                    @click=${(e: Event) => { e.stopPropagation(); this._duplicateBuiltinCCTSequencePreset(preset); }}
                    title="${this._localize('tooltips.preset_duplicate')}"
                  >
                    <ha-icon icon="mdi:content-copy"></ha-icon>
                  </ha-icon-button>
                </div>
                ${this._renderHideButton('cct_sequence', preset.id)}
                <div class="preset-icon">
                  ${this._renderPresetIcon(preset.icon, 'mdi:temperature-kelvin')}
                </div>
                <div class="preset-name">${preset.name}</div>
              </div>
            `
          )}
        </div>
      </ha-expansion-panel>
    `;
  }

  private _renderSegmentSequencesSection(title: string, builtinPresets: SegmentSequencePreset[], deviceType: string) {
    const sectionId = `segment_seq_${title.toLowerCase().replace(/\s+/g, '_')}`;
    const isExpanded = !this._prefs.state.collapsed[sectionId];
    const userPresets = this._getUserSegmentSequencePresetsForDeviceType(deviceType);
    const visibleBuiltinPresets = builtinPresets.filter(p => !this._isBuiltinPresetHidden('segment_sequence', p.id));
    const totalCount = userPresets.length + visibleBuiltinPresets.length;

    // Apply sorting
    const sortOption = this._getSortPreference(sectionId);
    const sortedUserPresets = this._sortPresets(userPresets, sortOption);
    const sortedBuiltinPresets = this._sortPresets(visibleBuiltinPresets, sortOption);

    return html`
      <ha-expansion-panel
        outlined
        .expanded=${isExpanded}
        @expanded-changed=${(e: CustomEvent) => this._handleExpansionChange(sectionId, e)}
      >
        <div slot="header" class="section-header">
          <div>
            <div class="section-title">${this._localize('sections.segment_sequences')}: ${title}</div>
            <div class="section-subtitle">${userPresets.length > 0 ? this._localize('sections.subtitle_presets_custom', {count: totalCount.toString(), custom: userPresets.length.toString()}) : this._localize('sections.subtitle_presets', {count: totalCount.toString()})}</div>
          </div>
          <div class="section-header-controls" @click=${(e: Event) => e.stopPropagation()}>
            ${this._renderSortDropdown(sectionId)}
          </div>
        </div>
        <div class="section-content">
          ${sortedUserPresets.map(
            (preset) => html`
              <div class="preset-button user-preset ${this._presetEditModeId === preset.id ? 'edit-mode' : ''}" role="button" tabindex="0" aria-label="${preset.name}" @click=${() => { if (this._presetEditModeId === preset.id) { this._presetEditModeId = null; } else { this._activateUserSegmentSequencePreset(preset); } }} @touchstart=${() => this._handlePresetTouchStart(preset.id)} @touchend=${(e: TouchEvent) => this._handlePresetTouchEnd(e)} @touchmove=${this._handlePresetTouchMove}>
                <div class="preset-card-actions preset-card-actions-left">
                  ${this._renderFavoriteStar('segment_sequence', preset.id)}
                </div>
                <div class="preset-icon">
                  ${this._renderUserSegmentSequenceIcon(preset)}
                </div>
                <div class="preset-name">${preset.name}</div>
              </div>
            `
          )}
          ${sortedBuiltinPresets.map(
            (preset) => html`
              <div class="preset-button builtin-preset ${this._presetEditModeId === preset.id ? 'edit-mode' : ''}" role="button" tabindex="0" aria-label="${preset.name}" @click=${() => { if (this._presetEditModeId === preset.id) { this._presetEditModeId = null; } else { this._activateSegmentSequence(preset); } }} @touchstart=${() => this._handlePresetTouchStart(preset.id)} @touchend=${(e: TouchEvent) => this._handlePresetTouchEnd(e)} @touchmove=${this._handlePresetTouchMove}>
                <div class="preset-card-actions preset-card-actions-left">
                  ${this._renderFavoriteStar('segment_sequence', preset.id)}
                </div>
                <div class="preset-card-actions">
                  <ha-icon-button
                    @click=${(e: Event) => { e.stopPropagation(); this._duplicateBuiltinSegmentSequencePreset(preset, deviceType); }}
                    title="${this._localize('tooltips.preset_duplicate')}"
                  >
                    <ha-icon icon="mdi:content-copy"></ha-icon>
                  </ha-icon-button>
                </div>
                ${this._renderHideButton('segment_sequence', preset.id)}
                <div class="preset-icon">
                  ${this._renderPresetIcon(preset.icon, 'mdi:animation-play')}
                </div>
                <div class="preset-name">${preset.name}</div>
              </div>
            `
          )}
        </div>
      </ha-expansion-panel>
    `;
  }

  private _renderDynamicScenesSection() {
    const sectionId = 'dynamic_scenes';
    const isExpanded = !this._prefs.state.collapsed[sectionId];
    const userPresets = this._getFilteredUserDynamicScenePresets();
    const visibleBuiltinPresets = (this._presets!.dynamic_scenes || []).filter(p => !this._isBuiltinPresetHidden('dynamic_scene', p.id));
    const totalCount = userPresets.length + visibleBuiltinPresets.length;

    // Apply sorting
    const sortOption = this._getSortPreference(sectionId);
    const sortedUserPresets = this._sortPresets(userPresets, sortOption);
    const sortedBuiltinPresets = this._sortPresets(visibleBuiltinPresets, sortOption);

    return html`
      <ha-expansion-panel
        outlined
        .expanded=${isExpanded}
        @expanded-changed=${(e: CustomEvent) => this._handleExpansionChange(sectionId, e)}
      >
        <div slot="header" class="section-header">
          <div>
            <div class="section-title">${this._localize('sections.dynamic_scenes')}</div>
            <div class="section-subtitle">${userPresets.length > 0 ? this._localize('sections.subtitle_presets_custom', {count: totalCount.toString(), custom: userPresets.length.toString()}) : this._localize('sections.subtitle_presets', {count: totalCount.toString()})}</div>
          </div>
          <div class="section-header-controls" @click=${(e: Event) => e.stopPropagation()}>
            ${this._renderSortDropdown(sectionId)}
          </div>
        </div>
        <div class="section-content">
          ${sortedUserPresets.map(
            (preset) => html`
              <div class="preset-button user-preset ${this._presetEditModeId === preset.id ? 'edit-mode' : ''}" role="button" tabindex="0" aria-label="${preset.name}" @click=${() => { if (this._presetEditModeId === preset.id) { this._presetEditModeId = null; } else { this._activateUserDynamicScenePreset(preset); } }} @touchstart=${() => this._handlePresetTouchStart(preset.id)} @touchend=${(e: TouchEvent) => this._handlePresetTouchEnd(e)} @touchmove=${this._handlePresetTouchMove}>
                <div class="preset-card-actions preset-card-actions-left">
                  ${this._renderFavoriteStar('dynamic_scene', preset.id)}
                </div>
                <div class="preset-icon">
                  ${this._renderUserDynamicSceneIcon(preset)}
                </div>
                <div class="preset-name">${preset.name}</div>
              </div>
            `
          )}
          ${sortedBuiltinPresets.map(
            (preset) => html`
              <div class="preset-button builtin-preset ${this._presetEditModeId === preset.id ? 'edit-mode' : ''}" role="button" tabindex="0" aria-label="${preset.name}" @click=${() => { if (this._presetEditModeId === preset.id) { this._presetEditModeId = null; } else { this._activateDynamicScene(preset); } }} @touchstart=${() => this._handlePresetTouchStart(preset.id)} @touchend=${(e: TouchEvent) => this._handlePresetTouchEnd(e)} @touchmove=${this._handlePresetTouchMove}>
                <div class="preset-card-actions preset-card-actions-left">
                  ${this._renderFavoriteStar('dynamic_scene', preset.id)}
                </div>
                <div class="preset-card-actions">
                  <ha-icon-button
                    @click=${(e: Event) => { e.stopPropagation(); this._duplicateBuiltinDynamicScenePreset(preset); }}
                    title="${this._localize('tooltips.preset_duplicate')}"
                  >
                    <ha-icon icon="mdi:content-copy"></ha-icon>
                  </ha-icon-button>
                </div>
                ${this._renderHideButton('dynamic_scene', preset.id)}
                <div class="preset-icon">
                  ${this._renderBuiltinDynamicSceneIcon(preset)}
                </div>
                <div class="preset-name">${preset.name}</div>
              </div>
            `
          )}
        </div>
      </ha-expansion-panel>
    `;
  }


}

declare global {
  interface HTMLElementTagNameMap {
    'aqara-advanced-lighting-panel': AqaraPanel;
  }
}
