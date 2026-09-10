/// <reference types="vite/client" />
import { describe, expect, it } from 'vitest';

// CSS custom properties Home Assistant's frontend no longer reads. Setting one
// silently does nothing, so a declaration is dead code and usually means the
// live token is missing. Verified against the built frontend bundles
// (hass_frontend) of the core version the integration targets.
const DEAD_TOKENS = [
  // Replaced by --ha-icon-button-size in HA 2026.3 (frontend PR #29622)
  '--mdc-icon-button-size',
];

// Every component source file, read as text at transform time.
const sources = import.meta.glob('./**/*.ts', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

const componentSources = Object.entries(sources).filter(
  ([path]) => !path.endsWith('.test.ts'),
);

describe('dead Home Assistant CSS tokens', () => {
  it('scans the component sources', () => {
    expect(componentSources.length).toBeGreaterThan(0);
  });

  for (const token of DEAD_TOKENS) {
    it(`${token} is not declared anywhere`, () => {
      const offenders = componentSources
        .filter(([, text]) => text.includes(token))
        .map(([path]) => path);
      expect(offenders).toEqual([]);
    });
  }
});
