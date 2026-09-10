import { css } from 'lit';

/**
 * Panel presets — preset buttons, preset names/icons, audio badge,
 * user-preset cards, preset management, select mode, and toolbar-select-mode.
 */
export const presetStyles = css`
  /* Preset buttons - follows HA card interaction patterns */
  .preset-button {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 12px;
    background: var(--card-background-color);
    border: 2px solid var(--divider-color);
    border-radius: var(--ha-card-border-radius, 12px);
    cursor: pointer;
    transition: all 0.15s ease-in-out;
    min-height: 80px;
    position: relative;
    overflow: hidden;
    user-select: none;
    -webkit-user-select: none;
  }

  .preset-button::before {
    content: '';
    position: absolute;
    inset: 0;
    background: var(--primary-color);
    opacity: 0;
    transition: opacity 0.15s ease-in-out;
  }

  .preset-button:hover::before {
    opacity: 0.08;
  }

  .preset-button:hover {
    border-color: var(--primary-color);
    transform: translateY(-2px);
    box-shadow: var(--ha-card-box-shadow, 0 4px 8px rgba(0, 0, 0, 0.1));
  }

  .preset-button:active {
    transform: translateY(0);
  }

  .preset-button.disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .preset-button.disabled:hover {
    border-color: var(--divider-color);
    transform: none;
    box-shadow: none;
  }

  .preset-button.disabled::before {
    opacity: 0;
  }

  .preset-name {
    font-size: var(--ha-font-size-s, 13px);
    font-weight: var(--ha-font-weight-medium, 500);
    text-align: center;
    margin-top: 8px;
    position: relative;
  }

  .preset-icon {
    width: 56px;
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
  }

  .preset-icon img,
  .preset-icon svg {
    width: 100%;
    height: 100%;
    object-fit: contain;
    border-radius: 50%;
  }

  .preset-icon ha-icon {
    width: 100%;
    height: 100%;
    --mdc-icon-size: 56px;
  }

  /* Audio-reactive DOM badge overlay */
  .preset-icon .audio-badge {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.55);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 0;
    color: #fff;
    pointer-events: none;
  }

  .preset-icon .audio-badge ha-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    --mdc-icon-size: 20px;
  }

  /* User preset button styling in Activate tab */
  .preset-button.user-preset {
    border-color: var(--primary-color);
    border-style: dashed;
    border-width: 2px;
  }

  .preset-button.user-preset:hover {
    border-style: solid;
  }

  /* My Presets management section content */
  .preset-management-content {
    display: block;
  }

  /* Preset grid for My Presets tab */
  .preset-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 12px;
  }

  /* User preset card with action buttons - follows HA card patterns */
  .user-preset-card {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 12px;
    background: var(--card-background-color);
    border: 2px solid var(--divider-color);
    border-radius: var(--ha-card-border-radius, 12px);
    cursor: pointer;
    transition: all 0.15s ease-in-out;
    min-height: 80px;
    overflow: hidden;
    user-select: none;
    -webkit-user-select: none;
  }

  .user-preset-card::before {
    content: '';
    position: absolute;
    inset: 0;
    background: var(--primary-color);
    opacity: 0;
    transition: opacity 0.15s ease-in-out;
  }

  .user-preset-card:hover::before {
    opacity: 0.08;
  }

  .user-preset-card:hover {
    border-color: var(--primary-color);
    transform: translateY(-2px);
    box-shadow: var(--ha-card-box-shadow, 0 4px 8px rgba(0, 0, 0, 0.1));
  }

  .user-preset-card:active {
    transform: translateY(0);
  }

  .user-preset-card.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .user-preset-card.disabled:hover {
    border-color: var(--divider-color);
    transform: none;
    box-shadow: none;
  }

  .user-preset-card.disabled::before {
    opacity: 0;
  }

  .user-preset-card .preset-icon {
    font-size: 40px;
    margin-bottom: 8px;
    line-height: 1;
    position: relative;
    --mdc-icon-size: 40px;
  }

  .user-preset-card .preset-name {
    font-size: var(--ha-font-size-s, 12px);
    text-align: center;
    font-weight: var(--ha-font-weight-medium, 500);
    line-height: 1.2;
    word-break: break-word;
    max-width: 100%;
    position: relative;
  }

  /* Action buttons overlay */
  .preset-card-actions {
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

  .preset-card-actions-right {
    top: auto;
    bottom: 2px;
  }

  .preset-card-actions-left {
    right: auto;
    left: 2px;
  }

  /* Hover devices: show actions on hover */
  @media (hover: hover) {
    .user-preset-card:hover .preset-card-actions,
    .user-preset:hover .preset-card-actions,
    .builtin-preset:hover .preset-card-actions {
      opacity: 1;
      pointer-events: auto;
    }
  }

  /* Touch edit mode: show actions persistently after long press */
  .user-preset-card.edit-mode .preset-card-actions,
  .user-preset.edit-mode .preset-card-actions,
  .builtin-preset.edit-mode .preset-card-actions {
    opacity: 1;
    pointer-events: auto;
  }

  .user-preset-card.edit-mode,
  .user-preset.edit-mode,
  .builtin-preset.edit-mode {
    border-color: var(--primary-color);
  }

  .preset-card-actions ha-icon-button,
  .preset-card-actions .favorite-star {
    --ha-icon-button-size: 28px;
    --mdc-icon-size: 16px;
    opacity: 0.6;
    transition: opacity 0.15s ease;
  }

  @media (hover: hover) {
    .preset-card-actions ha-icon-button:hover,
    .preset-card-actions .favorite-star:hover {
      opacity: 1;
    }
  }

  .preset-card-actions ha-icon-button ha-icon,
  .preset-card-actions .favorite-star ha-icon {
    color: var(--primary-text-color);
  }

  .preset-card-actions .favorite-star.favorited ha-icon {
    color: var(--accent-color, #ffc107);
  }

  /* Select mode checkbox overlay on preset cards */
  .preset-select-checkbox {
    position: absolute;
    top: 4px;
    left: 4px;
    z-index: 2;
    --mdc-icon-size: 20px;
    color: var(--secondary-text-color);
    line-height: 0;
  }

  .user-preset-card.selected {
    border-color: var(--primary-color);
    background: color-mix(in srgb, var(--primary-color) 12%, var(--card-background-color, var(--ha-card-background, white)));
  }

  .user-preset-card.selected .preset-select-checkbox {
    color: var(--primary-color);
  }

  .user-preset-card.select-mode:hover {
    transform: none;
    box-shadow: none;
  }

  .user-preset-card.select-mode:hover::before {
    opacity: 0.05;
  }

  .user-preset-card.select-mode {
    cursor: pointer;
  }

  /* Select mode toolbar highlight */
  .toolbar-select-mode {
    flex-wrap: wrap;
    padding: 8px 12px;
    background: color-mix(in srgb, var(--primary-color) 8%, var(--card-background-color, var(--ha-card-background, white)));
    border-radius: var(--ha-card-border-radius, 12px);
    border: 1px solid var(--primary-color);
  }

  /* Favorites drag-reorder visual feedback. Use outline (not border) so the
     indicator does not shift the grid layout. outline-offset: -2px overlays
     the existing 2px border crisply. */
  .preset-button.drag-source {
    opacity: 0.5;
  }

  .preset-button.drop-target {
    outline: 3px solid var(--primary-color);
    outline-offset: -2px;
  }

  /* Disable native touch gestures (scroll, pinch) on the favorites drag
     handle so vertical-scroll on touch devices does not compete with
     pointer-based drag-reorder. Mirrors the editor's curation-drag-handle. */
  .favorites-drag-handle {
    touch-action: none;
  }

  /* Responsive presets */
  @media (max-width: 600px) {
    .preset-button {
      padding: 8px;
      min-height: 60px;
    }

    .preset-name {
      font-size: var(--ha-font-size-xs, 11px);
    }

    .preset-grid {
      grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
      gap: 8px;
    }

    .user-preset-card {
      padding: 8px;
      min-height: 60px;
    }

    .user-preset-card .preset-icon {
      font-size: 36px;
      margin-bottom: 4px;
      --mdc-icon-size: 36px;
    }

    .user-preset-card .preset-name {
      font-size: var(--ha-font-size-xs, 11px);
    }
  }
`;
