import type { ReactiveController, ReactiveControllerHost } from 'lit';
import type { HomeAssistant, UserPreferences, PresetSortOption, PresetSortPreferences, XYColor, FavoritePresetRef, EntityAudioConfig } from './types';

export interface PreferencesState {
  // User preferences
  colorHistory: XYColor[];
  sortPreferences: PresetSortPreferences;
  collapsed: Record<string, boolean>;
  includeAllLights: boolean;
  favoritePresets: FavoritePresetRef[];
  useStaticSceneMode: boolean;
  useDistributionModeOverride: boolean;
  distributionModeOverride: string;
  useCustomBrightness: boolean;
  brightness: number;
  useAudioReactive: boolean;
  audioOverrideEntity: string;
  audioOverrideSensitivity: number;
  audioOverrideTransitionSpeed: number;
  audioOverrideColorAdvance: string;
  audioOverrideDetectionMode: string;
  audioOverridePredictionAggressiveness: number;
  audioOverrideLatencyCompensationMs: number;
  audioOverrideSilenceBehavior: string;
  audioOverrideFrequencyZone: boolean;
  audioOverrideBrightnessCurve: string | null;
  audioOverrideBrightnessMin: number;
  audioOverrideBrightnessMax: number;
  audioOverrideColorByFrequency: boolean;
  audioOverrideRolloffBrightness: boolean;
  useEffectAudioReactive: boolean;
  effectAudioOverrideSensitivity: number;
  effectAudioOverrideSilenceBehavior: string;
  hiddenBuiltinPresets: FavoritePresetRef[];
  selectedEntities: string[];
  activeFavoriteId: string | null;

  // Global preferences
  ignoreExternalChanges: boolean;
  overrideControlMode: string;
  softwareTransitionEntities: string[];
  bareTurnOnOnly: boolean;
  detectNonHaChanges: boolean;
  entityAudioConfig: Record<string, EntityAudioConfig>;
}

const DEFAULT_STATE: PreferencesState = {
  colorHistory: [],
  sortPreferences: {},
  collapsed: { instances: true },
  includeAllLights: false,
  favoritePresets: [],
  useStaticSceneMode: false,
  useDistributionModeOverride: false,
  distributionModeOverride: 'shuffle_rotate',
  useCustomBrightness: false,
  brightness: 100,
  useAudioReactive: false,
  audioOverrideEntity: '',
  audioOverrideSensitivity: 50,
  audioOverrideTransitionSpeed: 50,
  audioOverrideColorAdvance: 'on_onset',
  audioOverrideDetectionMode: 'spectral_flux',
  audioOverridePredictionAggressiveness: 50,
  audioOverrideLatencyCompensationMs: 150,
  audioOverrideSilenceBehavior: 'slow_cycle',
  audioOverrideFrequencyZone: false,
  audioOverrideBrightnessCurve: 'linear',
  audioOverrideBrightnessMin: 30,
  audioOverrideBrightnessMax: 100,
  audioOverrideColorByFrequency: false,
  audioOverrideRolloffBrightness: false,
  useEffectAudioReactive: false,
  effectAudioOverrideSensitivity: 50,
  effectAudioOverrideSilenceBehavior: 'hold',
  hiddenBuiltinPresets: [],
  selectedEntities: [],
  activeFavoriteId: null,

  ignoreExternalChanges: false,
  overrideControlMode: 'pause_changed',
  softwareTransitionEntities: [],
  bareTurnOnOnly: false,
  detectNonHaChanges: false,
  entityAudioConfig: {},
};

export class PreferencesController implements ReactiveController {
  host: ReactiveControllerHost;
  state: PreferencesState;
  private _saveTimer?: ReturnType<typeof setTimeout>;

  constructor(host: ReactiveControllerHost) {
    this.host = host;
    host.addController(this);
    this.state = { ...DEFAULT_STATE, collapsed: { ...DEFAULT_STATE.collapsed } };
  }

  hostConnected(): void {
    // No-op: load() is called explicitly from firstUpdated/updated
  }

  hostDisconnected(): void {
    if (this._saveTimer !== undefined) {
      clearTimeout(this._saveTimer);
      this._saveTimer = undefined;
    }
  }

  /**
   * Load user and global preferences from the API.
   * Handles one-time localStorage migration when server returns empty data.
   */
  async load(hass: HomeAssistant): Promise<void> {
    if (!hass) return;

    try {
      const prefs = await hass.callApi<UserPreferences>(
        'GET',
        'aqara_advanced_lighting/user_preferences'
      );

      // One-time migration from localStorage
      if (
        prefs.color_history.length === 0 &&
        Object.keys(prefs.sort_preferences).length === 0
      ) {
        const migrated = this._migrateLocalStoragePreferences();
        if (migrated) {
          const updated = await hass.callApi<UserPreferences>(
            'PUT',
            'aqara_advanced_lighting/user_preferences',
            migrated as unknown as Record<string, unknown>
          );
          // Apply ALL preferences from the server response (not just the migrated fields),
          // so audio overrides and other settings are restored alongside color/sort history.
          this._applyUserPreferences(updated);
          // Clean up localStorage after successful migration
          localStorage.removeItem('aqara_lighting_color_history');
          localStorage.removeItem('aqara_lighting_sort_preferences');
          return;
        }
      }

      this._applyUserPreferences(prefs);
    } catch (err) {
      console.warn('Failed to load user preferences:', err);
      // Fall back to localStorage as read-only source if server unavailable
      this._loadSortPreferencesFromLocalStorage();
    }

    // Load global preferences (separate endpoint, not per-user)
    try {
      const globalPrefs = await hass.callApi<{
        ignore_external_changes?: boolean;
        software_transition_entities?: string[];
        override_control_mode?: string;
        bare_turn_on_only?: boolean;
        detect_non_ha_changes?: boolean;
        entity_audio_config?: Record<string, EntityAudioConfig>;
      }>(
        'GET', 'aqara_advanced_lighting/global_preferences'
      );
      if (globalPrefs.ignore_external_changes !== undefined) {
        this.state.ignoreExternalChanges = globalPrefs.ignore_external_changes;
      }
      if (globalPrefs.override_control_mode) {
        this.state.overrideControlMode = globalPrefs.override_control_mode;
      }
      if (globalPrefs.software_transition_entities) {
        this.state.softwareTransitionEntities = globalPrefs.software_transition_entities;
      }
      if (globalPrefs.bare_turn_on_only !== undefined) {
        this.state.bareTurnOnOnly = globalPrefs.bare_turn_on_only;
      }
      if (globalPrefs.detect_non_ha_changes !== undefined) {
        this.state.detectNonHaChanges = globalPrefs.detect_non_ha_changes;
      }
      if (globalPrefs.entity_audio_config) {
        this.state.entityAudioConfig = globalPrefs.entity_audio_config;
      }
    } catch (err) {
      console.warn('Failed to load global preferences:', err);
    }

    this.host.requestUpdate();
  }

  /** Apply a full UserPreferences object to controller state. */
  private _applyUserPreferences(prefs: UserPreferences): void {
    this.state.colorHistory = prefs.color_history;
    this.state.sortPreferences = prefs.sort_preferences;
    this.state.favoritePresets = prefs.favorite_presets || [];
    this.state.hiddenBuiltinPresets = prefs.hidden_builtin_presets || [];
    if (prefs.collapsed_sections) {
      this.state.collapsed = prefs.collapsed_sections;
    }
    if (prefs.include_all_lights !== undefined) {
      this.state.includeAllLights = prefs.include_all_lights;
    }
    if (prefs.static_scene_mode !== undefined) {
      this.state.useStaticSceneMode = prefs.static_scene_mode;
    }
    if (prefs.distribution_mode_override) {
      this.state.useDistributionModeOverride = true;
      this.state.distributionModeOverride = prefs.distribution_mode_override;
    }
    if (prefs.brightness_override != null) {
      this.state.useCustomBrightness = true;
      this.state.brightness = prefs.brightness_override;
    }
    if (prefs.use_audio_reactive !== undefined) this.state.useAudioReactive = prefs.use_audio_reactive;
    if (prefs.audio_override_entity) this.state.audioOverrideEntity = prefs.audio_override_entity;
    if (prefs.audio_override_sensitivity !== undefined) this.state.audioOverrideSensitivity = prefs.audio_override_sensitivity;
    if (prefs.audio_override_color_advance !== undefined) this.state.audioOverrideColorAdvance = prefs.audio_override_color_advance;
    if (prefs.audio_override_transition_speed !== undefined) this.state.audioOverrideTransitionSpeed = prefs.audio_override_transition_speed;
    if (prefs.audio_override_brightness_curve !== undefined) this.state.audioOverrideBrightnessCurve = prefs.audio_override_brightness_curve;
    if (prefs.audio_override_brightness_min !== undefined) this.state.audioOverrideBrightnessMin = prefs.audio_override_brightness_min;
    if (prefs.audio_override_brightness_max !== undefined) this.state.audioOverrideBrightnessMax = prefs.audio_override_brightness_max;
    if (prefs.audio_override_detection_mode !== undefined) this.state.audioOverrideDetectionMode = prefs.audio_override_detection_mode;
    if (prefs.audio_override_frequency_zone !== undefined) this.state.audioOverrideFrequencyZone = prefs.audio_override_frequency_zone;
    if (prefs.audio_override_silence_behavior !== undefined) this.state.audioOverrideSilenceBehavior = prefs.audio_override_silence_behavior;
    if (prefs.audio_override_prediction_aggressiveness !== undefined) this.state.audioOverridePredictionAggressiveness = prefs.audio_override_prediction_aggressiveness;
    if (prefs.audio_override_latency_compensation_ms !== undefined) this.state.audioOverrideLatencyCompensationMs = prefs.audio_override_latency_compensation_ms;
    if (prefs.audio_override_color_by_frequency !== undefined) this.state.audioOverrideColorByFrequency = prefs.audio_override_color_by_frequency;
    if (prefs.audio_override_rolloff_brightness !== undefined) this.state.audioOverrideRolloffBrightness = prefs.audio_override_rolloff_brightness;
    if (prefs.use_effect_audio_reactive !== undefined) this.state.useEffectAudioReactive = prefs.use_effect_audio_reactive;
    if (prefs.effect_audio_override_sensitivity !== undefined) this.state.effectAudioOverrideSensitivity = prefs.effect_audio_override_sensitivity;
    if (prefs.effect_audio_override_silence_behavior !== undefined) this.state.effectAudioOverrideSilenceBehavior = prefs.effect_audio_override_silence_behavior;
    if (prefs.selected_entities && prefs.selected_entities.length > 0) {
      this.state.selectedEntities = prefs.selected_entities;
      this.state.activeFavoriteId = prefs.active_favorite_id ?? null;
      // Side effects (curvature load, zone load) are handled by config-tab's
      // willUpdate when selectedEntities / supportedEntities props change.
    }
    this.host.requestUpdate();
  }

  private _migrateLocalStoragePreferences(): Partial<UserPreferences> | null {
    const migrated: Partial<UserPreferences> = {};
    let hasMigrationData = false;

    try {
      const localColors = localStorage.getItem('aqara_lighting_color_history');
      if (localColors) {
        const parsed = JSON.parse(localColors);
        if (Array.isArray(parsed) && parsed.length > 0) {
          migrated.color_history = parsed;
          hasMigrationData = true;
        }
      }
    } catch {
      // Ignore parse errors
    }

    try {
      const localSort = localStorage.getItem('aqara_lighting_sort_preferences');
      if (localSort) {
        const parsed = JSON.parse(localSort);
        if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
          migrated.sort_preferences = parsed;
          hasMigrationData = true;
        }
      }
    } catch {
      // Ignore parse errors
    }

    return hasMigrationData ? migrated : null;
  }

  private _loadSortPreferencesFromLocalStorage(): void {
    try {
      const stored = localStorage.getItem('aqara_lighting_sort_preferences');
      if (stored) {
        this.state.sortPreferences = JSON.parse(stored) as PresetSortPreferences;
        this.host.requestUpdate();
      }
    } catch {
      // Ignore
    }
  }

  /**
   * Save user preferences to the API.
   * Debounced by default (500ms); pass immediate=true to save immediately.
   */
  save(hass: HomeAssistant, immediate = false): void {
    if (!hass) return;

    // Clear any pending debounced save
    if (this._saveTimer !== undefined) {
      clearTimeout(this._saveTimer);
      this._saveTimer = undefined;
    }

    const doSave = () => {
      hass.callApi<UserPreferences>(
        'PUT',
        'aqara_advanced_lighting/user_preferences',
        {
          color_history: this.state.colorHistory,
          sort_preferences: this.state.sortPreferences,
          collapsed_sections: this.state.collapsed,
          include_all_lights: this.state.includeAllLights,
          favorite_presets: this.state.favoritePresets,
          hidden_builtin_presets: this.state.hiddenBuiltinPresets,
          static_scene_mode: this.state.useStaticSceneMode,
          distribution_mode_override: this.state.useDistributionModeOverride ? this.state.distributionModeOverride : null,
          brightness_override: this.state.useCustomBrightness ? this.state.brightness : null,
          use_audio_reactive: this.state.useAudioReactive,
          audio_override_entity: this.state.audioOverrideEntity,
          audio_override_sensitivity: this.state.audioOverrideSensitivity,
          audio_override_color_advance: this.state.audioOverrideColorAdvance,
          audio_override_transition_speed: this.state.audioOverrideTransitionSpeed,
          audio_override_brightness_curve: this.state.audioOverrideBrightnessCurve,
          audio_override_brightness_min: this.state.audioOverrideBrightnessMin,
          audio_override_brightness_max: this.state.audioOverrideBrightnessMax,
          audio_override_detection_mode: this.state.audioOverrideDetectionMode,
          audio_override_frequency_zone: this.state.audioOverrideFrequencyZone,
          audio_override_silence_behavior: this.state.audioOverrideSilenceBehavior,
          audio_override_prediction_aggressiveness: this.state.audioOverridePredictionAggressiveness,
          audio_override_latency_compensation_ms: this.state.audioOverrideLatencyCompensationMs,
          audio_override_color_by_frequency: this.state.audioOverrideColorByFrequency,
          audio_override_rolloff_brightness: this.state.audioOverrideRolloffBrightness,
          use_effect_audio_reactive: this.state.useEffectAudioReactive,
          effect_audio_override_sensitivity: this.state.effectAudioOverrideSensitivity,
          effect_audio_override_silence_behavior: this.state.effectAudioOverrideSilenceBehavior,
          selected_entities: this.state.selectedEntities,
          active_favorite_id: this.state.activeFavoriteId,
        } as unknown as Record<string, unknown>
      ).catch(err => {
        console.warn('Failed to save user preferences:', err);
      });
    };

    if (immediate) {
      doSave();
    } else {
      this._saveTimer = setTimeout(doSave, 500);
    }
  }

  /** Save global preferences (separate endpoint, not per-user). */
  async saveGlobalPreferences(hass: HomeAssistant): Promise<void> {
    try {
      await hass.callApi('PUT', 'aqara_advanced_lighting/global_preferences', {
        ignore_external_changes: this.state.ignoreExternalChanges,
        override_control_mode: this.state.overrideControlMode,
        software_transition_entities: this.state.softwareTransitionEntities,
        bare_turn_on_only: this.state.bareTurnOnOnly,
        detect_non_ha_changes: this.state.detectNonHaChanges,
        entity_audio_config: this.state.entityAudioConfig,
      });
    } catch (err) {
      console.warn('Failed to save global preferences:', err);
    }
  }

  getSortPreference(sectionId: string): PresetSortOption {
    const stored = this.state.sortPreferences?.[sectionId];
    if (stored) return stored;
    if (sectionId === 'favorite_presets') return 'custom';
    return 'name-asc';
  }

  setSortPreference(sectionId: string, value: PresetSortOption, hass: HomeAssistant): void {
    this.state.sortPreferences = {
      ...this.state.sortPreferences,
      [sectionId]: value,
    };
    this.host.requestUpdate();
    this.save(hass);
  }

  setCollapsed(sectionId: string, collapsed: boolean, hass: HomeAssistant): void {
    this.state.collapsed = {
      ...this.state.collapsed,
      [sectionId]: collapsed,
    };
    this.host.requestUpdate();
    this.save(hass);
  }

  /**
   * Merge partial state updates, trigger host re-render, and debounced save.
   * For mutations that don't need persistence, set state directly and call host.requestUpdate().
   */
  update(partial: Partial<PreferencesState>, hass: HomeAssistant): void {
    Object.assign(this.state, partial);
    this.host.requestUpdate();
    this.save(hass);
  }
}
