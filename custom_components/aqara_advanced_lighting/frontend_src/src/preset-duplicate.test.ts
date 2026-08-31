import { describe, it, expect } from 'vitest';
import { userPresetToDuplicate } from './preset-duplicate';
import type { UserDynamicScenePreset, UserEffectPreset } from './types';

const scene = {
  id: 'scene-1',
  name: 'Sunset',
  colors: [{ x: 0.5, y: 0.4 }],
  transition_time: 120,
  created_at: '2026-01-01T00:00:00Z',
  modified_at: '2026-02-01T00:00:00Z',
  icon: 'mdi:lamps',
  thumbnail: 'abc123',
} as UserDynamicScenePreset;

describe('userPresetToDuplicate', () => {
  it('clears the identity and timestamp fields', () => {
    const copy = userPresetToDuplicate(scene, '(Copy)');
    expect(copy.id).toBe('');
    expect(copy.name).toBe('Sunset (Copy)');
    expect(copy.created_at).toBe('');
    expect(copy.modified_at).toBe('');
  });

  it('drops the thumbnail so the copy never shares the original file', () => {
    const copy = userPresetToDuplicate(scene, '(Copy)');
    expect(copy.thumbnail).toBeUndefined();
  });

  it('leaves the source preset untouched', () => {
    userPresetToDuplicate(scene, '(Copy)');
    expect(scene.thumbnail).toBe('abc123');
    expect(scene.id).toBe('scene-1');
    expect(scene.name).toBe('Sunset');
  });

  it('preserves every other field, including the icon', () => {
    const copy = userPresetToDuplicate(scene, '(Copy)');
    expect(copy.icon).toBe('mdi:lamps');
    expect(copy.colors).toEqual(scene.colors);
    expect(copy.transition_time).toBe(120);
  });

  it('works for a preset that has no thumbnail', () => {
    const effect = {
      id: 'fx-1',
      name: 'Rainbow',
      effect: 'rainbow',
      effect_speed: 50,
      device_type: 't2_bulb',
      created_at: '2026-01-01T00:00:00Z',
      modified_at: '2026-01-01T00:00:00Z',
    } as UserEffectPreset;
    const copy = userPresetToDuplicate(effect, '(Copy)');
    expect(copy.thumbnail).toBeUndefined();
    expect(copy.name).toBe('Rainbow (Copy)');
    expect(copy.effect).toBe('rainbow');
  });
});
