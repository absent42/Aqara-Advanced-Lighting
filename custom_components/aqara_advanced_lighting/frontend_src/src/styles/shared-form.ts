import { css } from 'lit';

/**
 * Shared form layout CSS — merged from panel form rules and editor
 * editorFormStyles.  Used by both the panel host and standalone editor
 * components (effect-editor, cct-sequence-editor, etc.).
 *
 * Covers: .form-row, .form-row-pair, .form-row-triple, .form-section,
 * .form-label, .form-input, .form-actions, .form-actions-left,
 * .unsaved-indicator, .preview-warning, .form-hint, .field-description,
 * .icon-field-row, .overrides-grid, .audio-toggles-grid, .audio-dropdowns-grid,
 * .audio-sliders-row, .audio-override-row,
 * .brightness-slider, and responsive breakpoints.
 */
export const sharedFormStyles = css`
  /* Editor-content wrapper used by all standalone editors */
  .editor-content {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .form-row {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 16px;
  }

  .form-row:last-child {
    margin-bottom: 0;
  }

  .form-row-pair {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-bottom: 16px;
  }

  .form-row-triple {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 16px;
    margin-bottom: 16px;
  }

  .form-row-pair .form-field,
  .form-row-triple .form-field {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .form-row-pair .form-field .form-label {
    min-width: unset;
  }

  .form-section {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 16px;
  }

  .form-section .form-label {
    min-width: unset;
  }

  .form-label {
    font-size: var(--ha-font-size-m, 14px);
    font-weight: var(--ha-font-weight-medium, 500);
    min-width: 120px;
    color: var(--secondary-text-color);
  }

  .field-description {
    font-size: 12px;
    color: var(--secondary-text-color);
    margin-top: 4px;
  }

  .form-input {
    flex: 1;
  }

  .form-hint {
    font-size: var(--ha-font-size-s, 12px);
    color: var(--secondary-text-color);
    margin-top: -4px;
  }

  .form-actions {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    align-items: center;
    margin-top: 24px;
    padding-top: 16px;
    border-top: 1px solid var(--divider-color);
  }

  .form-actions-left {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-right: auto;
  }

  .unsaved-indicator {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: var(--ha-font-size-s, 12px);
    color: var(--warning-color);
    white-space: nowrap;
  }

  .unsaved-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--warning-color);
    flex-shrink: 0;
  }

  .preview-warning {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background: var(--secondary-background-color);
    color: var(--secondary-text-color);
    border: 1px solid var(--divider-color);
    border-left: 4px solid var(--warning-color, #ffc107);
    border-radius: 4px;
    font-size: 13px;
  }

  .preview-warning ha-icon {
    flex-shrink: 0;
    --mdc-icon-size: 18px;
  }

  .icon-field-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .icon-field-row ha-selector {
    flex: 1;
  }

  .icon-clear-btn {
    --ha-icon-button-size: 32px;
    --mdc-icon-size: 18px;
    color: var(--secondary-text-color);
  }

  /* Activation overrides grid - 4 columns desktop, 2 columns mobile */
  .overrides-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    padding: 16px 0;
  }

  .override-item {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .override-item .form-label {
    min-width: unset;
    font-size: var(--ha-font-size-s, 12px);
  }

  .brightness-slider {
    padding: 0 16px 8px;
  }

  /* Two-column row for audio override controls, stacks on mobile */
  .audio-override-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    padding: 0 16px 8px;
  }

  .audio-dropdowns-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    padding: 0 16px 8px;
  }

  .audio-sliders-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    padding: 0 16px 8px;
  }

  .audio-toggles-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    padding: 0 16px 8px;
  }

  .audio-toggles-grid .form-section {
    align-items: flex-start;
    margin-bottom: 0;
  }

  /* Responsive form */
  @media (max-width: 600px) {
    .form-row {
      flex-direction: column;
      align-items: stretch;
    }

    .form-row-pair,
    .form-row-triple {
      grid-template-columns: 1fr;
    }

    .audio-override-row {
      grid-template-columns: 1fr;
    }

    .audio-dropdowns-grid {
      grid-template-columns: 1fr;
    }

    .audio-sliders-row {
      grid-template-columns: 1fr;
    }

    .audio-toggles-grid {
      grid-template-columns: 1fr 1fr;
    }

    .form-label {
      min-width: unset;
      margin-bottom: 4px;
    }

    .form-actions .btn-text {
      display: none;
    }

    .form-actions {
      gap: 8px;
    }
  }
`;
