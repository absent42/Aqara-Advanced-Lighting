/**
 * Shared constants and utilities for editor components.
 *
 * Consolidates DEVICE_LABELS, form CSS, and the _localize helper that were
 * previously duplicated across every editor file.
 */

import { css, html, nothing } from 'lit';
import type { TemplateResult } from 'lit';
import type { Translations, XYColor } from './types';
import { sharedFormStyles } from './styles/shared-form';

// Default color palettes shared across editors
export const DEFAULT_PALETTE: XYColor[] = [
  { x: 0.6800, y: 0.3100 },    // Red
  { x: 0.1700, y: 0.7000 },    // Green
  { x: 0.1500, y: 0.0600 },    // Blue
  { x: 0.4200, y: 0.5100 },    // Yellow
  { x: 0.3800, y: 0.1600 },    // Magenta
  { x: 0.2200, y: 0.3300 },    // Cyan
];

export const DEFAULT_GRADIENT_COLORS: XYColor[] = [
  { x: 0.6800, y: 0.3100 },  // Red
  { x: 0.1500, y: 0.0600 },  // Blue
];

export const DEFAULT_BLOCK_COLORS: XYColor[] = [
  { x: 0.6800, y: 0.3100 },  // Red
  { x: 0.1700, y: 0.7000 },  // Green
];

/**
 * Render dialog action buttons into the footer slot.
 */
export function dialogActions(
  cancelLabel: string,
  confirmLabel: string,
  onCancel: (e: Event) => void,
  onConfirm: (e: Event) => void,
  confirmIcon?: string,
): TemplateResult {
  return html`
    <div slot="footer">
      <ha-button @click=${onCancel}>${cancelLabel}</ha-button>
      <ha-button @click=${onConfirm}>
        ${confirmIcon ? html`<ha-icon icon=${confirmIcon}></ha-icon>` : nothing}
        ${confirmLabel}
      </ha-button>
    </div>
  `;
}

/**
 * Render a text input field.
 *
 * Usage:
 *   ${renderInput({ label: 'Name', value: this.name, onChange: this._handleName })}
 */
export function renderInput(opts: {
  label?: string;
  value?: string;
  hint?: string;
  type?: string;
  min?: string;
  max?: string;
  className?: string;
  style?: string;
  onChange?: (e: Event) => void;
  onInput?: (e: Event) => void;
}): TemplateResult {
  return html`
    <ha-input
      .label=${opts.label ?? ''}
      .value=${opts.value ?? ''}
      .hint=${opts.hint ?? ''}
      type=${opts.type ?? nothing}
      min=${opts.min ?? nothing}
      max=${opts.max ?? nothing}
      class=${opts.className ?? nothing}
      style=${opts.style ?? nothing}
      @change=${opts.onChange ?? nothing}
      @input=${opts.onInput ?? nothing}
    ></ha-input>
  `;
}

/** Human-readable labels for segment device types. */
export const DEVICE_LABELS: Record<string, string> = {
  t1: 'T1 (20 segments)',
  t1m: 'T1M (26 segments)',
  t1_strip: 'T1 Strip (up to 50 segments)',
};

/** Human-readable labels for all device types (including non-segment). */
export const ALL_DEVICE_LABELS: Record<string, string> = {
  t2_bulb: 'T2 Bulb',
  ...DEVICE_LABELS,
};

/**
 * Resolve a dot-separated key from a nested translations object.
 *
 * Supports placeholder replacement: `{name}` in the resolved string is
 * replaced by the value of `replacements.name`.
 */
export function localize(
  translations: Translations,
  key: string,
  replacements?: Record<string, string>,
): string {
  const keys = key.split('.');
  let value: string | Translations = translations;
  for (const k of keys) {
    if (typeof value !== 'object' || !(k in value)) {
      return key;
    }
    const next: string | Translations | undefined = value[k];
    if (next === undefined) return key;
    value = next;
  }
  let result = typeof value === 'string' ? value : key;

  if (replacements) {
    Object.entries(replacements).forEach(([placeholder, replacement]) => {
      result = result.replace(`{${placeholder}}`, replacement);
    });
  }

  return result;
}

// Shared editor option list factories
type LocalizeFn = (key: string) => string;

export function loopModeOptions(loc: LocalizeFn) {
  return [
    { value: 'once', label: loc('options.loop_mode_once') },
    { value: 'count', label: loc('options.loop_mode_count') },
    { value: 'continuous', label: loc('options.loop_mode_continuous') },
  ];
}

export function endBehaviorOptions(loc: LocalizeFn, restoreKey = 'options.end_behavior_restore') {
  return [
    { value: 'maintain', label: loc('options.end_behavior_maintain') },
    { value: 'turn_off', label: loc('options.end_behavior_turn_off') },
    { value: 'restore', label: loc(restoreKey) },
  ];
}

/**
 * Editor form styles — composes the editor-specific :host/icon-fix
 * with the shared form rules from styles/shared-form.ts.
 *
 * Editor components import `editorFormStyles` from here; the alias
 * keeps existing imports working after the bulk CSS was moved.
 */

export const editorFormStyles = css`
  :host {
    display: block;
  }

  /* Fix ha-svg-icon vertical misalignment inside ha-icon-button.
   * ha-svg-icon sets vertical-align: middle in its shadow DOM.
   * Making ha-icon a flex container neutralizes this. */
  ha-icon-button > ha-icon {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  ${sharedFormStyles}
`;
