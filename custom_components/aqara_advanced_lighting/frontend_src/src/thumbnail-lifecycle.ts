/**
 * Thumbnail lifecycle helpers shared by every preset editor that can extract
 * colours from an image.
 *
 * INVARIANT: DELETE /api/aqara_advanced_lighting/thumbnails/{id} only evicts
 * the in-memory *pending* entry. It never removes a file from disk. That is
 * correct for every call site here, which only ever touch IDs that have not
 * been persisted to a preset yet -- but a future caller pointing this at a
 * persisted ID would silently no-op. Deleting a persisted thumbnail is
 * preset_store's job, and happens when the preset is updated or deleted.
 */

import { HomeAssistant } from './types';

const API_BASE = '/api/aqara_advanced_lighting';

/**
 * Best-effort delete of an unsaved (pending) thumbnail. Fire and forget:
 * a failure here leaks one in-memory entry, which startup cleanup reclaims.
 */
export function deleteThumbnail(hass: HomeAssistant, thumbnailId: string): void {
  const token = hass?.auth?.data?.access_token;
  if (!token) return;
  fetch(`${API_BASE}/thumbnails/${thumbnailId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  }).catch(() => {
    // Best-effort cleanup
  });
}

/**
 * Adopt a newly extracted thumbnail, discarding the previously extracted one.
 *
 * @param current The id the editor currently holds, if any.
 * @param next The id just returned by extraction, if any.
 * @param originalFromPreset The id already persisted on the preset being
 *   edited. Never deleted here -- it is still referenced on disk until the
 *   preset is saved with a different one.
 * @returns The id the editor should now hold.
 */
export function adoptThumbnail(
  hass: HomeAssistant,
  current: string | undefined,
  next: string | undefined,
  originalFromPreset: string | undefined,
): string | undefined {
  if (!next) return current;
  if (current && current !== originalFromPreset) {
    deleteThumbnail(hass, current);
  }
  return next;
}

/**
 * Discard a thumbnail that was extracted but never persisted, e.g. when the
 * editor is cancelled. The preset's own thumbnail is left untouched.
 */
export function discardUnsaved(
  hass: HomeAssistant,
  current: string | undefined,
  originalFromPreset: string | undefined,
): void {
  if (current && current !== originalFromPreset) {
    deleteThumbnail(hass, current);
  }
}
