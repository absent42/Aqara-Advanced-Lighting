import { css } from 'lit';

/**
 * Panel activate — target input, save-favorite bar, favorites container,
 * favorite buttons/actions/states, and music sync section.
 */
export const activateStyles = css`
  /* Target input with selector and toggle row */
  .target-input {
    display: flex;
    flex-direction: column;
    gap: 0;
    min-width: 0;
    width: 100%;
  }

  /* Target selector container */
  .target-selector {
    width: 100%;
  }

  .target-selector ha-selector {
    display: block;
    width: 100%;
  }

  .include-all-lights-toggle {
    display: flex;
    justify-content: flex-end;
    margin-top: 8px;
    flex-shrink: 0;
  }

  .has-selection .include-all-lights-toggle {
    margin-top: -30px;
    pointer-events: none;
  }

  .include-all-lights-toggle .toggle-label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: var(--ha-font-size-s, 12px);
    color: var(--secondary-text-color);
    cursor: pointer;
    white-space: nowrap;
    pointer-events: auto;
  }

  /* Save-as-favorite action bar */
  .save-favorite-bar {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    margin-top: 10px;
    background: rgba(var(--rgb-primary-color), 0.06);
    border: 1px dashed rgba(var(--rgb-primary-color), 0.3);
    border-radius: var(--ha-card-border-radius, 12px);
    cursor: pointer;
    transition: background 0.15s ease, border-color 0.15s ease;
    font-family: inherit;
    font-size: var(--ha-font-size-m, 14px);
    color: var(--primary-color);
    width: 100%;
    box-sizing: border-box;
    -webkit-tap-highlight-color: transparent;
  }

  .save-favorite-bar:hover {
    background: rgba(var(--rgb-primary-color), 0.12);
    border-color: var(--primary-color);
  }

  .save-favorite-bar:active {
    background: rgba(var(--rgb-primary-color), 0.18);
  }

  .save-favorite-bar ha-icon {
    --mdc-icon-size: 20px;
    flex-shrink: 0;
  }

  .save-favorite-bar span {
    font-weight: var(--ha-font-weight-medium, 500);
    white-space: nowrap;
  }

  /* Favorites empty state */
  .favorites-empty-state {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 16px;
    color: var(--secondary-text-color);
    font-size: var(--ha-font-size-m, 14px);
    border: 1px dashed var(--divider-color);
    border-radius: var(--ha-card-border-radius, 12px);
    min-height: 48px;
  }

  .favorites-empty-state ha-icon {
    --mdc-icon-size: 20px;
    opacity: 0.5;
    flex-shrink: 0;
  }

  /* Favorites container - compact grid layout */
  .favorites-container {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }

  @media (min-width: 768px) {
    .favorites-container {
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    }
  }

  .favorite-button {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 12px 8px 8px 8px;
    background: var(--card-background-color);
    border: 1px solid var(--divider-color);
    border-radius: var(--ha-card-border-radius, 12px);
    cursor: pointer;
    transition: all 0.2s ease-in-out;
    position: relative;
    user-select: none;
    -webkit-user-select: none;
    overflow: hidden;
  }

  .favorite-button::before {
    content: '';
    position: absolute;
    inset: 0;
    background: var(--primary-color);
    opacity: 0;
    transition: opacity 0.15s ease-in-out;
  }

  .favorite-button:hover::before {
    opacity: 0.08;
  }

  .favorite-button:hover {
    border-color: var(--primary-color);
    transform: translateY(-2px);
    box-shadow: var(--ha-card-box-shadow, 0 4px 8px rgba(0, 0, 0, 0.1));
  }

  .favorite-button:active {
    transform: translateY(0);
  }

  .favorite-button.selected {
    border-color: var(--primary-color);
    border-width: 2px;
  }

  .favorite-button.selected::before {
    opacity: 0.12;
  }

  .favorite-button-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    background: rgba(var(--rgb-primary-color), 0.2);
    border-radius: var(--ha-card-border-radius, 10px);
    flex-shrink: 0;
    transition: all 0.2s ease-in-out;
    position: relative;
    z-index: 1;
  }

  .favorite-button-icon ha-icon {
    --mdc-icon-size: 32px;
    color: var(--primary-color);
  }

  .favorite-button:hover .favorite-button-icon {
    background: rgba(var(--rgb-primary-color), 0.3);
  }

  .favorite-button:hover .favorite-button-icon ha-icon {
    color: var(--primary-color);
  }

  .favorite-button-content {
    flex: 1;
    width: 100%;
    text-align: center;
    min-width: 0;
    position: relative;
    z-index: 1;
  }

  .favorite-button-name {
    font-size: 13px;
    font-weight: 500;
    color: var(--primary-text-color);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    line-height: 1.3;
  }

  .favorite-button-count {
    font-size: 11px;
    color: var(--secondary-text-color);
    margin-top: 2px;
  }

  .favorite-button-actions {
    position: absolute;
    top: 2px;
    right: 2px;
    display: flex;
    gap: 0;
    opacity: 0;
    transition: opacity 0.2s ease-in-out;
    z-index: 2;
    pointer-events: none;
  }

  .favorite-button-actions-left {
    right: auto;
    left: 2px;
  }

  /* Hover devices: show actions on hover */
  @media (hover: hover) {
    .favorite-button:hover .favorite-button-actions {
      opacity: 1;
      pointer-events: auto;
    }
  }

  /* Touch edit mode: show actions persistently after long press */
  .favorite-button.edit-mode .favorite-button-actions {
    opacity: 1;
    pointer-events: auto;
  }

  .favorite-button.edit-mode {
    border-color: var(--primary-color);
  }

  .favorite-button-action {
    --ha-icon-button-size: 28px;
    --mdc-icon-size: 16px;
    opacity: 0.6;
    transition: opacity 0.15s ease;
  }

  @media (hover: hover) {
    .favorite-button-action:hover {
      opacity: 1;
    }
  }

  .favorite-button-action ha-icon {
    color: var(--primary-text-color);
  }

  /* Inline rename input */
  .favorite-rename-input {
    width: 100%;
    font-size: 13px;
    font-weight: 500;
    font-family: inherit;
    color: var(--primary-text-color);
    background: var(--input-fill-color, rgba(var(--rgb-primary-color), 0.05));
    border: 1px solid var(--primary-color);
    border-radius: 6px;
    padding: 4px 8px;
    outline: none;
    text-align: center;
    box-sizing: border-box;
  }

  .favorite-button.renaming {
    cursor: default;
  }

  .favorite-button.renaming .favorite-button-actions,
  .favorite-button.renaming.edit-mode .favorite-button-actions {
    opacity: 0;
    pointer-events: none;
  }

  /* Favorite button states */
  .favorite-button.state-off .favorite-button-icon {
    opacity: 0.4;
  }

  .favorite-button.state-off .favorite-button-count {
    opacity: 0.6;
  }

  .favorite-button.state-unavailable .favorite-button-icon {
    opacity: 0.3;
    filter: grayscale(100%);
  }

  .favorite-button.state-unavailable .favorite-button-count {
    opacity: 0.5;
  }

  .favorite-button.state-on:hover .favorite-button-icon {
    filter: none;
  }

  .favorite-button.state-off:hover .favorite-button-icon {
    opacity: 1;
    filter: none;
  }

  .favorite-button.state-unavailable:hover .favorite-button-icon {
    opacity: 1;
    filter: none;
  }

  /* Music sync section */
  .music-sync-content {
    display: grid;
    grid-template-columns: 1fr;
    gap: 16px;
  }

  @media (min-width: 768px) {
    .music-sync-content {
      grid-template-columns: 1fr 1fr;
      gap: 16px 24px;
    }
  }

  .music-sync-left {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    align-items: center;
  }

  .music-sync-right {
    display: flex;
    flex-direction: column;
    gap: 8px;
    transition: opacity 0.2s ease;
  }

  .music-sync-right.disabled {
    opacity: 0.4;
    pointer-events: none;
  }

  .music-sync-right .control-label {
    font-size: var(--ha-font-size-s, 13px);
    font-weight: var(--ha-font-weight-medium, 500);
    color: var(--secondary-text-color);
  }

  .music-sync-toggle .toggle-label {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
  }

  .music-sync-sensitivity-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
    transition: opacity 0.2s ease;
  }

  .music-sync-sensitivity-group.disabled {
    opacity: 0.4;
    pointer-events: none;
  }

  .music-sync-sensitivity-group .control-label {
    font-size: var(--ha-font-size-s, 13px);
    font-weight: var(--ha-font-weight-medium, 500);
    color: var(--secondary-text-color);
  }

  .music-sync-sensitivity {
    display: flex;
    gap: 8px;
  }

  .music-sync-sensitivity ha-button {
    font-size: var(--ha-font-size-s, 13px);
  }

  .music-sync-sensitivity ha-button[appearance="outlined"]::part(base) {
    border-color: var(--divider-color);
  }

  .music-sync-effects {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 8px;
  }

  .preset-button.music-sync-active {
    border-color: var(--primary-color);
    background: rgba(var(--rgb-primary-color), 0.12);
  }

  .preset-button.music-sync-active .preset-name {
    color: var(--primary-color);
  }

  .music-sync-effects .effect-icon {
    width: 100%;
    height: 100%;
    background-color: var(--primary-text-color);
    -webkit-mask-size: contain;
    mask-size: contain;
    -webkit-mask-repeat: no-repeat;
    mask-repeat: no-repeat;
    -webkit-mask-position: center;
    mask-position: center;
  }

  .preset-button.music-sync-active .effect-icon {
    background-color: var(--primary-color);
  }

  /* Responsive activate */
  @media (max-width: 600px) {
    /* Target selector takes full width on mobile */
    .target-selector {
      min-width: 100%;
    }

    /* Favorite input mobile - buttons below text field */
    .favorite-input-container {
      flex-direction: column;
      align-items: stretch;
    }

    .favorite-input-container ha-selector {
      width: 100%;
      min-width: unset;
    }

    .favorite-input-buttons {
      justify-content: flex-end;
    }

    .overrides-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .music-sync-content {
      grid-template-columns: 1fr;
    }
  }
`;
