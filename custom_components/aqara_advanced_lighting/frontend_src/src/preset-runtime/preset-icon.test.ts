import { describe, it, expect } from 'vitest';
import { render, type TemplateResult } from 'lit';
import { renderPresetIcon } from './preset-icon';
import type {
  FavoritePresetRef,
  DynamicEffectPreset,
  UserEffectPreset,
  DynamicScenePreset,
  UserDynamicScenePreset,
  AnyPreset,
} from '../types';

const renderToHTML = (template: TemplateResult): string => {
  const container = document.createElement('div');
  render(template, container);
  return container.innerHTML;
};

describe('renderPresetIcon', () => {
  it('user effect with audio_config.audio_entity alone (no audio_speed_mode) does NOT show audio badge', () => {
    // audio_entity alone is not the audio indicator for user effects;
    // audio_config.audio_speed_mode is. Without it, no badge.
    const ref: FavoritePresetRef = { type: 'effect', id: 'u1' };
    const preset = {
      id: 'u1',
      name: 'My',
      effect: 'jitter',
      effect_speed: 50,
      effect_colors: [{ x: 0.5, y: 0.5 }],
      audio_config: { audio_entity: 'sensor.audio' },
    } as unknown as UserEffectPreset;
    const html = renderToHTML(renderPresetIcon(ref, preset, true));
    expect(html).not.toContain('audio-badge');
  });

  it('built-in effect with audio_speed_mode shows audio badge', () => {
    const ref: FavoritePresetRef = { type: 'effect', id: 'kick' };
    const preset = {
      id: 'kick', name: 'Kick', icon: 'mdi:music-circle', audio_speed_mode: 'tempo',
    } as unknown as DynamicEffectPreset;
    const html = renderToHTML(renderPresetIcon(ref, preset, false));
    expect(html).toContain('audio-badge');
  });

  it('built-in effect WITHOUT audio_speed_mode does not show audio badge', () => {
    const ref: FavoritePresetRef = { type: 'effect', id: 'rainbow' };
    const preset = {
      id: 'rainbow', name: 'Rainbow', icon: 'mdi:looks',
    } as unknown as DynamicEffectPreset;
    const html = renderToHTML(renderPresetIcon(ref, preset, false));
    expect(html).not.toContain('audio-badge');
  });

  it('user effect with audio_config.audio_speed_mode and custom icon shows audio badge', () => {
    const ref: FavoritePresetRef = { type: 'effect', id: 'u1' };
    const preset = {
      id: 'u1', name: 'My Audio Effect',
      effect: 'jitter', effect_speed: 50,
      effect_colors: [{ x: 0.5, y: 0.5 }],
      icon: 'mdi:speaker',
      audio_config: { audio_speed_mode: 'volume' },
    } as unknown as UserEffectPreset;
    const html = renderToHTML(renderPresetIcon(ref, preset, true));
    expect(html).toContain('audio-badge');
  });

  it('user effect with audio_config.audio_speed_mode and no icon shows audio badge', () => {
    const ref: FavoritePresetRef = { type: 'effect', id: 'u1' };
    const preset = {
      id: 'u1', name: 'My Audio Effect',
      effect: 'jitter', effect_speed: 50,
      effect_colors: [{ x: 0.5, y: 0.5 }],
      audio_config: { audio_speed_mode: 'tempo' },
    } as unknown as UserEffectPreset;
    const html = renderToHTML(renderPresetIcon(ref, preset, true));
    expect(html).toContain('audio-badge');
  });

  it('builtin dynamic scene with audio_color_advance shows audio badge', () => {
    const ref: FavoritePresetRef = { type: 'dynamic_scene', id: 'b1' };
    const preset = {
      name: 'Scene',
      colors: [{ x: 0.5, y: 0.5, brightness_pct: 50 }],
      audio_color_advance: 'continuous',
    } as unknown as DynamicScenePreset;
    const html = renderToHTML(renderPresetIcon(ref, preset, false));
    expect(html).toContain('audio-badge');
  });

  it('builtin dynamic scene without audio_color_advance does NOT show audio badge', () => {
    const ref: FavoritePresetRef = { type: 'dynamic_scene', id: 'b1' };
    const preset = {
      name: 'Scene',
      colors: [{ x: 0.5, y: 0.5, brightness_pct: 50 }],
    } as unknown as DynamicScenePreset;
    const html = renderToHTML(renderPresetIcon(ref, preset, false));
    expect(html).not.toContain('audio-badge');
  });

  it('user dynamic scene with audio_entity AND custom icon DOES show audio badge', () => {
    // Panel parity: user dynamic scenes show the badge on top of a custom icon
    // when audio is enabled (panel:4555-4559). Different from user effect.
    const ref: FavoritePresetRef = { type: 'dynamic_scene', id: 'ud1' };
    const preset = {
      name: 'My Scene',
      icon: 'mdi:lightbulb',
      colors: [{ x: 0.5, y: 0.5, brightness_pct: 50 }],
      audio_entity: 'sensor.audio',
    } as unknown as UserDynamicScenePreset;
    const html = renderToHTML(renderPresetIcon(ref, preset, true));
    expect(html).toContain('audio-badge');
  });

  it('user dynamic_scene with both thumbnail and icon shows the thumbnail (image)', () => {
    const ref: FavoritePresetRef = { type: 'dynamic_scene', id: 'u1' };
    const preset = {
      name: 'Odeon',
      thumbnail: 'abc123',
      icon: 'mdi:music',
      colors: [{ x: 0.5, y: 0.5, brightness_pct: 50 }],
    } as any;
    const html = renderToHTML(renderPresetIcon(ref, preset, true));
    expect(html).toContain('thumbnails/abc123');
    expect(html).not.toContain('mdi:music');
  });

  it('falls back to mdi:star for unknown ref type', () => {
    const ref = { type: 'unknown' as FavoritePresetRef['type'], id: 'x' };
    const html = renderToHTML(renderPresetIcon(ref, {} as AnyPreset, false));
    expect(html).toContain('mdi:star');
  });

  it('user effect with audio_config and showAudioBadge: false hides the badge', () => {
    const ref: FavoritePresetRef = { type: 'effect', id: 'u1' };
    const preset = {
      id: 'u1', name: 'My Audio Effect',
      effect: 'jitter', effect_speed: 50,
      effect_colors: [{ x: 0.5, y: 0.5 }],
      audio_config: { audio_speed_mode: 'volume' },
    } as unknown as UserEffectPreset;
    const html = renderToHTML(renderPresetIcon(ref, preset, true, { showAudioBadge: false }));
    expect(html).not.toContain('audio-badge');
  });

  it('builtin scene with audio_color_advance and showAudioBadge: false hides the badge', () => {
    const ref: FavoritePresetRef = { type: 'dynamic_scene', id: 'b1' };
    const preset = {
      name: 'Concert', colors: [{ x: 0.5, y: 0.5, brightness_pct: 50 }],
      audio_color_advance: true,
    } as any;
    const html = renderToHTML(renderPresetIcon(ref, preset, false, { showAudioBadge: false }));
    expect(html).not.toContain('audio-badge');
  });

  it('builtin effect with audio_speed_mode and showAudioBadge: false hides the badge', () => {
    const ref: FavoritePresetRef = { type: 'effect', id: 'kick' };
    const preset = {
      id: 'kick', name: 'Kick', icon: 'mdi:music-circle', audio_speed_mode: 'tempo',
    } as unknown as DynamicEffectPreset;
    const html = renderToHTML(renderPresetIcon(ref, preset, false, { showAudioBadge: false }));
    expect(html).not.toContain('audio-badge');
  });

  // -------------------------------------------------------------------------
  // Thumbnail-over-icon precedence for the three preset types that gained
  // image extraction. An uploaded thumbnail is a deliberate visual choice and
  // must beat an icon left over from preset creation, matching dynamic scenes.
  // -------------------------------------------------------------------------

  it('user effect with both thumbnail and icon shows the thumbnail (image)', () => {
    const ref: FavoritePresetRef = { type: 'effect', id: 'u1' };
    const preset = {
      id: 'u1', name: 'Sunset',
      effect: 'jitter', effect_speed: 50,
      effect_colors: [{ x: 0.5, y: 0.5 }],
      thumbnail: 'eff123',
      icon: 'mdi:music',
    } as any;
    const html = renderToHTML(renderPresetIcon(ref, preset, true));
    expect(html).toContain('thumbnails/eff123');
    expect(html).not.toContain('mdi:music');
  });

  it('user effect with an icon and no thumbnail shows the icon', () => {
    const ref: FavoritePresetRef = { type: 'effect', id: 'u1' };
    const preset = {
      id: 'u1', name: 'Sunset',
      effect: 'jitter', effect_speed: 50,
      effect_colors: [{ x: 0.5, y: 0.5 }],
      icon: 'mdi:music',
    } as any;
    const html = renderToHTML(renderPresetIcon(ref, preset, true));
    expect(html).toContain('mdi:music');
    expect(html).not.toContain('thumbnails/');
  });

  it('user effect with neither thumbnail nor icon shows the generated SVG', () => {
    const ref: FavoritePresetRef = { type: 'effect', id: 'u1' };
    const preset = {
      id: 'u1', name: 'Sunset',
      effect: 'jitter', effect_speed: 50,
      effect_colors: [{ x: 0.5, y: 0.5 }],
    } as any;
    const html = renderToHTML(renderPresetIcon(ref, preset, true));
    expect(html).toContain('<svg');
    expect(html).not.toContain('thumbnails/');
  });

  it('user segment pattern with both thumbnail and icon shows the thumbnail (image)', () => {
    const ref: FavoritePresetRef = { type: 'segment_pattern', id: 'p1' };
    const preset = {
      id: 'p1', name: 'Stripes',
      segments: [{ segment: 1, color: { r: 255, g: 0, b: 0 } }],
      thumbnail: 'pat123',
      icon: 'mdi:music',
    } as any;
    const html = renderToHTML(renderPresetIcon(ref, preset, true));
    expect(html).toContain('thumbnails/pat123');
    expect(html).not.toContain('mdi:music');
  });

  it('user segment pattern with an icon and no thumbnail shows the icon', () => {
    const ref: FavoritePresetRef = { type: 'segment_pattern', id: 'p1' };
    const preset = {
      id: 'p1', name: 'Stripes',
      segments: [{ segment: 1, color: { r: 255, g: 0, b: 0 } }],
      icon: 'mdi:music',
    } as any;
    const html = renderToHTML(renderPresetIcon(ref, preset, true));
    expect(html).toContain('mdi:music');
    expect(html).not.toContain('thumbnails/');
  });

  it('user segment pattern with neither thumbnail nor icon shows the generated SVG', () => {
    const ref: FavoritePresetRef = { type: 'segment_pattern', id: 'p1' };
    const preset = {
      id: 'p1', name: 'Stripes',
      segments: [{ segment: 1, color: { r: 255, g: 0, b: 0 } }],
    } as any;
    const html = renderToHTML(renderPresetIcon(ref, preset, true));
    expect(html).toContain('<svg');
    expect(html).not.toContain('thumbnails/');
  });

  it('user segment sequence with both thumbnail and icon shows the thumbnail (image)', () => {
    const ref: FavoritePresetRef = { type: 'segment_sequence', id: 's1' };
    const preset = {
      id: 's1', name: 'Chase',
      steps: [{ segment_colors: [{ segment: 1, color: { r: 0, g: 255, b: 0 } }] }],
      thumbnail: 'seq123',
      icon: 'mdi:music',
    } as any;
    const html = renderToHTML(renderPresetIcon(ref, preset, true));
    expect(html).toContain('thumbnails/seq123');
    expect(html).not.toContain('mdi:music');
  });

  it('user segment sequence with an icon and no thumbnail shows the icon', () => {
    const ref: FavoritePresetRef = { type: 'segment_sequence', id: 's1' };
    const preset = {
      id: 's1', name: 'Chase',
      steps: [{ segment_colors: [{ segment: 1, color: { r: 0, g: 255, b: 0 } }] }],
      icon: 'mdi:music',
    } as any;
    const html = renderToHTML(renderPresetIcon(ref, preset, true));
    expect(html).toContain('mdi:music');
    expect(html).not.toContain('thumbnails/');
  });

  it('user segment sequence with neither thumbnail nor icon shows the generated SVG', () => {
    const ref: FavoritePresetRef = { type: 'segment_sequence', id: 's1' };
    const preset = {
      id: 's1', name: 'Chase',
      steps: [{ segment_colors: [{ segment: 1, color: { r: 0, g: 255, b: 0 } }] }],
    } as any;
    const html = renderToHTML(renderPresetIcon(ref, preset, true));
    expect(html).toContain('<svg');
    expect(html).not.toContain('thumbnails/');
  });
});
