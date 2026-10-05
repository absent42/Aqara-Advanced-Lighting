import { describe, expect, it } from 'vitest';
import { findClampedLights } from './cct-range';

const light = (min?: number, max?: number) => ({
  attributes: { min_color_temp_kelvin: min, max_color_temp_kelvin: max },
});

describe('findClampedLights', () => {
  const states = {
    'light.t2_cct': light(2700, 6500),
    'light.wide': light(2000, 6500),
    'light.narrow_cool': light(2200, 5000),
    'light.no_range': light(),
  };

  it('flags a light whose minimum is above the lowest step', () => {
    expect(findClampedLights(states, ['light.t2_cct'], [2000, 4000])).toEqual([
      { entityId: 'light.t2_cct', min: 2700, max: 6500 },
    ]);
  });

  it('flags a light whose maximum is below the highest step', () => {
    expect(findClampedLights(states, ['light.narrow_cool'], [3000, 6500])).toEqual([
      { entityId: 'light.narrow_cool', min: 2200, max: 5000 },
    ]);
  });

  it('ignores lights that cover the whole sequence', () => {
    expect(findClampedLights(states, ['light.wide'], [2000, 6500])).toEqual([]);
  });

  it('ignores lights without a reported range and unknown entities', () => {
    expect(findClampedLights(states, ['light.no_range', 'light.missing'], [2000])).toEqual([]);
  });

  it('returns nothing when there are no steps', () => {
    expect(findClampedLights(states, ['light.t2_cct'], [])).toEqual([]);
  });

  it('checks group members, not the group range', () => {
    const withGroups = {
      ...states,
      // A group reports the widest range of its members
      'light.inner': { attributes: { entity_id: ['light.t2_cct', 'light.wide'], min_color_temp_kelvin: 2000, max_color_temp_kelvin: 6500 } },
      'light.outer': { attributes: { entity_id: ['light.inner', 'light.narrow_cool'], min_color_temp_kelvin: 2000, max_color_temp_kelvin: 6500 } },
    };
    expect(findClampedLights(withGroups, ['light.outer', 'light.t2_cct'], [2000, 6500])).toEqual([
      { entityId: 'light.t2_cct', min: 2700, max: 6500 },
      { entityId: 'light.narrow_cool', min: 2200, max: 5000 },
    ]);
  });

  it('terminates on cyclic groups', () => {
    const cyclic = {
      'light.a': { attributes: { entity_id: ['light.b'] } },
      'light.b': { attributes: { entity_id: ['light.a', 'light.t2_cct'] } },
      'light.t2_cct': light(2700, 6500),
    };
    expect(findClampedLights(cyclic, ['light.a'], [2000])).toEqual([
      { entityId: 'light.t2_cct', min: 2700, max: 6500 },
    ]);
  });
});
