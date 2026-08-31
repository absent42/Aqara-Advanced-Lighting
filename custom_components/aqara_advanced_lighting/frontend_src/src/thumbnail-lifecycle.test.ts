import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { adoptThumbnail, discardUnsaved, deleteThumbnail } from './thumbnail-lifecycle';

const hass = { auth: { data: { access_token: 'tok' } } } as any;

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  fetchMock = vi.fn(() => Promise.resolve({ ok: true } as Response));
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('deleteThumbnail', () => {
  it('DELETEs the thumbnail with a bearer token', () => {
    deleteThumbnail(hass, 'abc');
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/aqara_advanced_lighting/thumbnails/abc',
      { method: 'DELETE', headers: { Authorization: 'Bearer tok' } },
    );
  });

  it('does nothing without an access token', () => {
    deleteThumbnail({} as any, 'abc');
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe('adoptThumbnail', () => {
  it('returns the new id when there was none before', () => {
    expect(adoptThumbnail(hass, undefined, 'new', undefined)).toBe('new');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('deletes the previously extracted unsaved thumbnail', () => {
    expect(adoptThumbnail(hass, 'unsaved', 'new', undefined)).toBe('new');
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/aqara_advanced_lighting/thumbnails/unsaved',
      expect.anything(),
    );
  });

  it('never deletes the thumbnail already persisted on the preset', () => {
    expect(adoptThumbnail(hass, 'saved', 'new', 'saved')).toBe('new');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('keeps the current id when no new one was returned', () => {
    expect(adoptThumbnail(hass, 'current', undefined, undefined)).toBe('current');
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe('discardUnsaved', () => {
  it('deletes an extracted-but-unsaved thumbnail', () => {
    discardUnsaved(hass, 'unsaved', undefined);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('leaves the preset thumbnail alone', () => {
    discardUnsaved(hass, 'saved', 'saved');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('is a no-op when there is no thumbnail', () => {
    discardUnsaved(hass, undefined, undefined);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
