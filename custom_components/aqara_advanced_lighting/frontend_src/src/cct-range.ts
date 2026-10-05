// Must match CCT_SEQUENCE_MIN_KELVIN / CCT_SEQUENCE_MAX_KELVIN in const.py
export const CCT_MIN_KELVIN = 2000;
export const CCT_MAX_KELVIN = 6500;

export interface ClampedLight {
  entityId: string;
  min: number;
  max: number;
}

type States = Record<string, { attributes: Record<string, unknown> } | undefined>;

// Mirrors _resolve_entity_ids() in services/_helpers.py
function expandGroups(states: States, entityIds: string[]): string[] {
  const resolved: string[] = [];
  const seen = new Set<string>();
  const add = (entityId: string): void => {
    if (seen.has(entityId)) return;
    seen.add(entityId);
    const members = states[entityId]?.attributes.entity_id;
    if (Array.isArray(members) && members.length) {
      members.forEach((m) => add(String(m)));
      return;
    }
    resolved.push(entityId);
  };
  entityIds.forEach(add);
  return resolved;
}

/**
 * Lights whose reported color temp range does not cover every step value.
 * Groups are expanded to member lights; lights that report no range are skipped.
 */
export function findClampedLights(
  states: States,
  entityIds: string[],
  colorTemps: number[],
): ClampedLight[] {
  if (!colorTemps.length) return [];
  const lowest = Math.min(...colorTemps);
  const highest = Math.max(...colorTemps);
  const result: ClampedLight[] = [];
  for (const entityId of expandGroups(states, entityIds)) {
    const attrs = states[entityId]?.attributes;
    const min = attrs?.min_color_temp_kelvin;
    const max = attrs?.max_color_temp_kelvin;
    if (typeof min !== 'number' || typeof max !== 'number') continue;
    if (lowest < min || highest > max) result.push({ entityId, min, max });
  }
  return result;
}
