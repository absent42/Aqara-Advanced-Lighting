/**
 * Render a Lit TemplateResult icon for a favorite preset.
 *
 * Ports from the panel's icon dispatcher (aqara-panel.ts:595-610,
 * `_renderFavoritePresetIcon`) and its 7 helpers at aqara-panel.ts:4497-4578:
 *  - `_renderPresetIcon` (4497) - shared MDI/file icon renderer
 *  - `_renderUserEffectIcon` (4512) - user effect with audio-badge support
 *  - `_renderUserPatternIcon` (4525) - user pattern with thumbnail
 *  - `_renderUserCCTIcon` (4534) - user CCT with gradient thumbnail
 *  - `_renderUserSegmentSequenceIcon` (4543) - user segment sequence
 *  - `_renderUserDynamicSceneIcon` (4552) - user dynamic scene with audio-badge
 *  - `_renderBuiltinDynamicSceneIcon` (4570) - builtin dynamic scene with audio-badge
 *
 * Panel is the source of truth. Non-trivial divergence from the card's
 * single-switch _renderPresetIcon (aqara-preset-favorites-card.ts:823-878):
 *  - Audio-badge for user effect presets: panel's _renderUserEffectIcon
 *    (panel:4377-4387) checks `audio_config.audio_entity` which incorrectly
 *    misses presets relying on the user-prefs audio entity. The corrected
 *    helper here uses `audio_config.audio_speed_mode` (the actual audio
 *    indicator) and applies the badge in BOTH the icon and thumbnail
 *    branches, matching the panel's My Effects display at panel:4143-4144.
 *
 *  - Built-in effect icon: panel's favorites dispatcher (was at panel:597)
 *    never rendered an audio badge for built-in effects. The corrected
 *    dispatcher here adds the badge when `preset.audio_speed_mode` is set,
 *    matching the panel's My Effects display.
 *
 *  - For user dynamic_scene presets where preset.icon is set AND audio is
 *    enabled, the panel still overlays the audio badge on top of the custom
 *    icon (panel:4555-4559); the card did the same. Behavior unchanged.
 */

import { html, type TemplateResult } from 'lit';
import type {
  FavoritePresetRef,
  AnyPreset,
  DynamicEffectPreset,
  UserEffectPreset,
  SegmentPatternPreset,
  UserSegmentPatternPreset,
  CCTSequencePreset,
  UserCCTSequencePreset,
  SegmentSequencePreset,
  UserSegmentSequencePreset,
  DynamicScenePreset,
  UserDynamicScenePreset,
} from '../types';
import {
  renderEffectThumbnail,
  renderSegmentPatternThumbnail,
  renderCCTSequenceThumbnail,
  renderSegmentSequenceThumbnail,
  renderDynamicSceneThumbnail,
} from '../preset-thumbnails';

/** Render an MDI icon string or a custom icon-file URL. (panel:4497-4509) */
function renderBuiltinIcon(icon: string | undefined, fallbackIcon: string): TemplateResult {
  if (!icon) {
    return html`<ha-icon icon="${fallbackIcon}"></ha-icon>`;
  }

  // Custom icon file (has file extension)
  if (icon.includes('.')) {
    return html`<img src="/api/aqara_advanced_lighting/icons/${icon}" alt="preset icon" />`;
  }

  // Otherwise treat as MDI icon
  return html`<ha-icon icon="${icon}"></ha-icon>`;
}

/** Audio-reactive waveform badge overlay (panel:4519,4557,4564,4574). */
const AUDIO_BADGE = html`<span class="audio-badge"><ha-icon icon="mdi:waveform"></ha-icon></span>`;

/** Append the audio badge to an icon TemplateResult when isAudio is true. */
const withAudioBadge = (icon: TemplateResult, isAudio: boolean): TemplateResult =>
  isAudio ? html`${icon}${AUDIO_BADGE}` : icon;

/** Render a user effect preset icon. (panel:4512-4522) */
function renderUserEffectIcon(preset: UserEffectPreset, showBadge: boolean): TemplateResult {
  // Audio indicator for user effects is `audio_config.audio_speed_mode` (matches
  // the activator's user-effect path which checks `audio_config.audio_speed_mode`).
  // Apply the badge in both the icon-set and thumbnail branches, mirroring the
  // panel's My Effects display behavior at aqara-panel.ts:4143-4144.
  const isAudio = showBadge && !!preset.audio_config?.audio_speed_mode;
  // Precedence: uploaded thumbnail > MDI/file icon > auto-generated SVG.
  // An uploaded thumbnail is a deliberate visual choice; the icon field is often
  // a leftover MDI default from preset creation. Mirrors aqara-panel.ts.
  if (preset.icon && !preset.thumbnail) {
    return withAudioBadge(renderBuiltinIcon(preset.icon, 'mdi:lightbulb-on'), isAudio);
  }
  const thumb = renderEffectThumbnail(preset)
    ?? html`<ha-icon icon="mdi:lightbulb-on"></ha-icon>`;
  return withAudioBadge(thumb, isAudio);
}

/**
 * Render a built-in effect preset icon with audio badge if audio-reactive.
 *
 * Audio indicator for built-in effects is `audio_speed_mode` (NOT `audio_entity`,
 * which is supplied by the user's audio_override_entity at activation time).
 * Matches the panel's My Effects display behavior at aqara-panel.ts:4143-4144.
 */
function renderBuiltinEffectIcon(preset: DynamicEffectPreset, showBadge: boolean): TemplateResult {
  const icon = renderBuiltinIcon(preset.icon, 'mdi:lightbulb-on');
  const isAudio = showBadge && !!preset.audio_speed_mode;
  return withAudioBadge(icon, isAudio);
}

/** Render a user segment pattern preset icon. (panel:4525-4531) */
function renderUserPatternIcon(preset: UserSegmentPatternPreset): TemplateResult {
  // Precedence: uploaded thumbnail > MDI/file icon > auto-generated SVG.
  // An uploaded thumbnail is a deliberate visual choice; the icon field is often
  // a leftover MDI default from preset creation. Mirrors aqara-panel.ts.
  if (preset.icon && !preset.thumbnail) {
    return renderBuiltinIcon(preset.icon, 'mdi:palette');
  }
  return renderSegmentPatternThumbnail(preset)
    ?? html`<ha-icon icon="mdi:palette"></ha-icon>`;
}

/** Render a user CCT sequence preset icon. (panel:4534-4540) */
function renderUserCCTIcon(preset: UserCCTSequencePreset): TemplateResult {
  if (preset.icon) {
    return renderBuiltinIcon(preset.icon, 'mdi:temperature-kelvin');
  }
  return renderCCTSequenceThumbnail(preset)
    ?? html`<ha-icon icon="mdi:temperature-kelvin"></ha-icon>`;
}

/** Render a user segment sequence preset icon. (panel:4543-4549) */
function renderUserSegmentSequenceIcon(preset: UserSegmentSequencePreset): TemplateResult {
  // Precedence: uploaded thumbnail > MDI/file icon > auto-generated SVG.
  // An uploaded thumbnail is a deliberate visual choice; the icon field is often
  // a leftover MDI default from preset creation. Mirrors aqara-panel.ts.
  if (preset.icon && !preset.thumbnail) {
    return renderBuiltinIcon(preset.icon, 'mdi:animation-play');
  }
  return renderSegmentSequenceThumbnail(preset)
    ?? html`<ha-icon icon="mdi:animation-play"></ha-icon>`;
}

/** Render a user dynamic scene preset icon. (panel:4552-4567) */
function renderUserDynamicSceneIcon(preset: UserDynamicScenePreset, showBadge: boolean): TemplateResult {
  const isAudio = showBadge && !!(preset.audio_entity || preset.audio_color_advance);
  // Precedence: uploaded thumbnail > MDI/file icon > auto-generated SVG.
  // An uploaded thumbnail is a deliberate visual choice; the icon field is often
  // a leftover MDI default from preset creation. Always prefer the richer image.
  if (preset.thumbnail) {
    const thumb = renderDynamicSceneThumbnail(preset)
      ?? html`<ha-icon icon="mdi:lamps"></ha-icon>`;
    return withAudioBadge(thumb, isAudio);
  }
  if (preset.icon) {
    return withAudioBadge(renderBuiltinIcon(preset.icon, 'mdi:lamps'), isAudio);
  }
  // No explicit user choice; auto-generate from colors (or fall back to MDI lamps).
  const thumb = renderDynamicSceneThumbnail(preset)
    ?? html`<ha-icon icon="mdi:lamps"></ha-icon>`;
  return withAudioBadge(thumb, isAudio);
}

/** Render a builtin dynamic scene preset icon. (panel:4570-4577) */
function renderBuiltinDynamicSceneIcon(preset: DynamicScenePreset, showBadge: boolean): TemplateResult {
  const thumb = renderDynamicSceneThumbnail(preset)
    ?? html`<ha-icon icon="mdi:lamps"></ha-icon>`;
  const isAudio = showBadge && !!preset.audio_color_advance;
  return withAudioBadge(thumb, isAudio);
}

/**
 * Options for `renderPresetIcon`.
 */
export interface RenderPresetIconOptions {
  /**
   * Whether to render the audio-reactive waveform badge overlay for
   * audio-reactive presets. Default true. Set to false in compact UI
   * surfaces (e.g. the editor's curation list) where the overlay
   * disrupts row layout.
   */
  showAudioBadge?: boolean;
}

/**
 * Top-level dispatcher. Mirrors aqara-panel.ts:595-610
 * (`_renderFavoritePresetIcon`).
 */
export function renderPresetIcon(
  ref: FavoritePresetRef,
  preset: AnyPreset,
  isUser: boolean,
  options: RenderPresetIconOptions = {},
): TemplateResult {
  const showBadge = options.showAudioBadge !== false;
  switch (ref.type) {
    case 'effect':
      return isUser
        ? renderUserEffectIcon(preset as UserEffectPreset, showBadge)
        : renderBuiltinEffectIcon(preset as DynamicEffectPreset, showBadge);
    case 'segment_pattern':
      return isUser
        ? renderUserPatternIcon(preset as UserSegmentPatternPreset)
        : renderBuiltinIcon((preset as SegmentPatternPreset).icon, 'mdi:palette');
    case 'cct_sequence':
      return isUser
        ? renderUserCCTIcon(preset as UserCCTSequencePreset)
        : renderBuiltinIcon((preset as CCTSequencePreset).icon, 'mdi:temperature-kelvin');
    case 'segment_sequence':
      return isUser
        ? renderUserSegmentSequenceIcon(preset as UserSegmentSequencePreset)
        : renderBuiltinIcon((preset as SegmentSequencePreset).icon, 'mdi:animation-play');
    case 'dynamic_scene':
      return isUser
        ? renderUserDynamicSceneIcon(preset as UserDynamicScenePreset, showBadge)
        : renderBuiltinDynamicSceneIcon(preset as DynamicScenePreset, showBadge);
    default:
      return html`<ha-icon icon="mdi:star"></ha-icon>`;
  }
}
