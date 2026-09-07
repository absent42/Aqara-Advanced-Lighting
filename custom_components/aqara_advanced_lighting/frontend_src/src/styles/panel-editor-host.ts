import { css } from 'lit';

/**
 * Panel editor host — loading state, alerts, no-lights, tab-content,
 * editor-form card, step lists, segment grid, preset lists, empty states,
 * editor description, toolbar actions, and no-presets placeholder.
 */
export const editorHostStyles = css`
  /* Loading state - follows HA patterns */
  .loading {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 40px;
    font-size: var(--ha-font-size-m, 16px);
    color: var(--secondary-text-color);
  }

  /* HA native ha-alert component styling */
  ha-alert {
    display: block;
    margin-bottom: 16px;
  }

  .no-lights {
    text-align: center;
    padding: 40px;
    color: var(--secondary-text-color);
    font-size: var(--ha-font-size-m, 14px);
  }

  ha-selector {
    display: block;
    width: 100%;
  }

  ha-slider {
    width: 100%;
  }

  /* Tab content area */
  .tab-content {
    min-height: 200px;
  }

  /* Editor form styles - now using ha-card, follows HA form patterns */
  ha-card.editor-form {
    padding: 16px;
  }

  .editor-form h2 {
    font-size: var(--ha-font-size-xl, 20px);
    font-weight: var(--ha-font-weight-medium, 500);
    margin: 0 0 8px 0;
    color: var(--primary-text-color);
  }

  /* Step list styles - follows HA list patterns */
  .step-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .step-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 12px;
    background: var(--card-background-color);
    border-radius: var(--ha-border-radius-sm, 8px);
    border: 1px solid var(--divider-color);
  }

  .step-number {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    background: var(--primary-color);
    color: var(--text-primary-color);
    border-radius: 50%;
    font-size: var(--ha-font-size-s, 12px);
    font-weight: var(--ha-font-weight-medium, 600);
    flex-shrink: 0;
  }

  .step-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .step-row {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }

  .step-field {
    flex: 1;
    min-width: 120px;
  }

  .step-field-label {
    font-size: var(--ha-font-size-xs, 11px);
    color: var(--secondary-text-color);
    margin-bottom: 4px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .step-actions {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .step-actions ha-icon-button {
    --ha-icon-button-size: 32px;
    --mdc-icon-size: 18px;
  }

  .add-step-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px;
    border: 2px dashed var(--divider-color);
    border-radius: var(--ha-border-radius-sm, 8px);
    cursor: pointer;
    color: var(--secondary-text-color);
    transition: all 0.15s ease-in-out;
  }

  .add-step-btn:hover {
    border-color: var(--primary-color);
    color: var(--primary-color);
    background: var(--secondary-background-color);
  }

  /* Segment grid editor - follows HA grid patterns */
  .segment-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(40px, 1fr));
    gap: 4px;
    padding: 12px;
    background: var(--card-background-color);
    border-radius: var(--ha-border-radius-sm, 8px);
  }

  .segment-cell {
    aspect-ratio: 1;
    border-radius: var(--ha-border-radius-sm, 4px);
    cursor: pointer;
    border: 2px solid var(--divider-color);
    transition: all 0.15s ease-in-out;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--ha-font-size-xs, 10px);
    font-weight: var(--ha-font-weight-medium, 600);
    color: var(--secondary-text-color);
  }

  .segment-cell:hover {
    transform: scale(1.1);
    z-index: 1;
  }

  .segment-cell.selected {
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px var(--primary-color);
  }

  .segment-cell.colored {
    border-color: transparent;
  }

  .preset-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  /* Preset list item - follows HA list-item patterns */
  .preset-list-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    background: var(--card-background-color);
    border-radius: var(--ha-border-radius-sm, 8px);
    border: 1px solid var(--divider-color);
    cursor: pointer;
    transition: all 0.15s ease-in-out;
  }

  .preset-list-item:hover {
    background: var(--secondary-background-color);
  }

  .preset-list-item-info {
    flex: 1;
  }

  .preset-list-item-name {
    font-weight: var(--ha-font-weight-medium, 500);
    font-size: var(--ha-font-size-m, 14px);
  }

  .preset-list-item-description {
    font-size: var(--ha-font-size-s, 12px);
    color: var(--secondary-text-color);
    margin-top: 2px;
  }

  .preset-list-item-meta {
    font-size: var(--ha-font-size-xs, 11px);
    color: var(--secondary-text-color);
    margin-top: 4px;
  }

  .preset-list-item-actions {
    display: flex;
    gap: 4px;
  }

  .preset-list-item-actions ha-icon-button {
    --ha-icon-button-size: 32px;
    --mdc-icon-size: 18px;
  }

  .empty-state {
    text-align: center;
    padding: 40px;
    color: var(--secondary-text-color);
  }

  .empty-state-icon {
    --mdc-icon-size: 48px;
    margin-bottom: 16px;
    opacity: 0.5;
  }

  .empty-state-text {
    font-size: var(--ha-font-size-m, 14px);
  }

  /* Editor description */
  .editor-description {
    font-size: var(--ha-font-size-m, 14px);
    color: var(--secondary-text-color);
    margin-bottom: 24px;
    line-height: var(--ha-line-height-normal, 1.5);
  }

  /* Placeholder styles */
  .coming-soon {
    text-align: center;
    padding: 60px 20px;
    color: var(--secondary-text-color);
    background: var(--card-background-color);
    border-radius: var(--ha-card-border-radius, 12px);
    border: 2px dashed var(--divider-color);
    font-size: var(--ha-font-size-m, 14px);
  }

  /* Toolbar actions for export/import buttons */
  .toolbar-actions {
    display: flex;
    gap: 8px;
    margin: 16px 0;
  }

  .toolbar-actions ha-button {
    font-size: var(--ha-font-size-s, 13px);
  }

  /* No presets empty state - follows HA empty state patterns */
  .no-presets {
    text-align: center;
    padding: 60px 20px;
    color: var(--secondary-text-color);
    background: var(--card-background-color);
    border-radius: var(--ha-card-border-radius, 12px);
  }

  .no-presets ha-icon {
    --mdc-icon-size: 48px;
    opacity: 0.5;
    margin-bottom: 16px;
    display: block;
  }

  .no-presets p {
    margin: 8px 0;
    font-size: var(--ha-font-size-m, 14px);
  }

  /* Responsive editor host */
  @media (max-width: 600px) {
    .step-row {
      flex-direction: column;
    }

    .step-field {
      min-width: unset;
    }
  }
`;
