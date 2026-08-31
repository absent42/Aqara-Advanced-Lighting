/**
 * Transition Curve Editor Component
 * A visual curve editor for T2 bulb transition curve configuration.
 * Displays brightness vs time curve with draggable adjustment.
 * Graph-only component - controls are rendered in parent panel.
 */

import { LitElement, html, css, PropertyValues } from 'lit';
import { customElement, property, state, query } from 'lit/decorators.js';
import { HomeAssistant, Translations } from './types';
import { localize } from './editor-constants';

@customElement('transition-curve-editor')
export class TransitionCurveEditor extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ type: Object }) public translations: Translations = {};
  @property({ type: Number }) curvature = 1.0;  // Controlled from parent
  @property({ type: Number }) width = 300;
  @property({ type: Number }) height = 300;

  @state() private _isDragging = false;

  @query('canvas') private _canvas!: HTMLCanvasElement;

  // Curvature constraints from Z2M converter
  private readonly MIN_CURVATURE = 0.2;
  private readonly MAX_CURVATURE = 6.0;
  private readonly STEP = 0.01;

  static styles = css`
    :host {
      display: block;
    }

    .curve-editor-container {
      background: var(--card-background-color);
      overflow: hidden;
    }

    .curve-header {
      padding: 12px 8px 8px;
    }

    .curve-header .title {
      font-size: var(--ha-font-size-l, 16px);
      font-weight: var(--ha-font-weight-medium, 500);
      color: var(--primary-text-color);
      display: block;
      margin-bottom: 4px;
    }

    .curve-header .subtitle {
      font-size: var(--ha-font-size-s, 12px);
      color: var(--secondary-text-color);
    }

    .curve-canvas-wrapper {
      position: relative;
      padding: 8px;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .graph-container {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .graph-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .y-axis-label {
      display: flex;
      align-items: center;
      color: var(--secondary-text-color);
      --mdc-icon-size: 20px;
    }

    .graph-spacer {
      width: 20px;
      flex-shrink: 0;
    }

    .x-axis-label {
      display: flex;
      justify-content: center;
      padding-top: 8px;
      color: var(--secondary-text-color);
      --mdc-icon-size: 20px;
      width: 100%;
    }

    canvas {
      display: block;
      cursor: ns-resize;
      border-radius: 8px;
      background: var(--card-background-color);
    }
  `;

  protected firstUpdated(): void {
    this._drawCurve();
  }

  private _themeColors: { warning: string; primary: string; success: string } | null = null;

  protected updated(changedProperties: PropertyValues): void {
    if (changedProperties.has('curvature') && this._canvas) {
      this._drawCurve();
    }
  }

  /**
   * Calculate the control point for the quadratic Bezier curve based on curvature.
   * Maps curvature value to control point position for smooth visual curves.
   * - curvature < 1: control point toward upper-left (fast then slow)
   * - curvature = 1: control point at center (linear)
   * - curvature > 1: control point toward lower-right (slow then fast)
   */
  private _getControlPoint(): { cx: number; cy: number } {
    const curvature = this.curvature;

    // Normalize curvature to a 0-1 range for control point positioning
    // Use logarithmic scaling for more uniform visual response
    let normalizedCurvature: number;

    if (curvature <= 1) {
      // Map 0.2-1.0 to 0-0.5 (fast-slow to linear)
      normalizedCurvature = ((curvature - this.MIN_CURVATURE) / (1 - this.MIN_CURVATURE)) * 0.5;
    } else {
      // Map 1.0-6.0 to 0.5-1.0 (linear to slow-fast)
      normalizedCurvature = 0.5 + ((curvature - 1) / (this.MAX_CURVATURE - 1)) * 0.5;
    }

    // Control point moves along a path from upper-left to lower-right
    // Extended range for more dramatic curve visualization
    const cx = 0.05 + normalizedCurvature * 0.9;  // Range: 0.05 to 0.95
    const cy = 0.95 - normalizedCurvature * 0.9;  // Range: 0.95 to 0.05

    return { cx, cy };
  }

  /**
   * Calculate Y value on quadratic Bezier curve at parameter t.
   * P0 = (0, 0), P1 = (cx, cy), P2 = (1, 1)
   */
  private _bezierY(t: number, cy: number): number {
    // Quadratic Bezier: B(t) = (1-t)²P0 + 2(1-t)tP1 + t²P2
    // For Y: (1-t)²*0 + 2(1-t)t*cy + t²*1 = 2(1-t)t*cy + t²
    const oneMinusT = 1 - t;
    return 2 * oneMinusT * t * cy + t * t;
  }

  /**
   * Calculate X value on quadratic Bezier curve at parameter t.
   */
  private _bezierX(t: number, cx: number): number {
    const oneMinusT = 1 - t;
    return 2 * oneMinusT * t * cx + t * t;
  }

  /**
   * Get the color for the curve based on the current curvature value.
   * - 0.2-0.95: Fast then slow (warning color)
   * - 0.95-1.05: Linear (success color)
   * - 1.05-6.0: Slow then fast (primary color)
   */
  private _getCurveColor(): string {
    if (!this._themeColors) {
      const s = getComputedStyle(this);
      this._themeColors = {
        warning: s.getPropertyValue('--warning-color').trim() || '#ffc107',
        primary: s.getPropertyValue('--primary-color').trim() || '#03a9f4',
        success: s.getPropertyValue('--success-color').trim() || '#4caf50',
      };
    }

    if (this.curvature < 0.95) {
      return this._themeColors.warning;
    } else if (this.curvature > 1.05) {
      return this._themeColors.primary;
    } else {
      return this._themeColors.success;
    }
  }

  private _drawCurve(): void {
    const canvas = this._canvas;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = this;
    const padding = 24;
    const graphWidth = width - padding * 2;
    const graphHeight = height - padding * 2;

    // Set canvas size
    canvas.width = width;
    canvas.height = height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw grid
    this._drawGrid(ctx, padding, graphWidth, graphHeight);

    // Get control point based on curvature
    const { cx, cy } = this._getControlPoint();

    // Get curve color based on curvature value
    const curveColor = this._getCurveColor();

    // Parse hex color to RGB components for gradient fill
    const hexMatch = curveColor.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
    const r = hexMatch ? parseInt(hexMatch[1]!, 16) : 3;
    const g = hexMatch ? parseInt(hexMatch[2]!, 16) : 169;
    const b = hexMatch ? parseInt(hexMatch[3]!, 16) : 244;

    // Draw curve fill (area under curve)
    ctx.beginPath();
    ctx.moveTo(padding, height - padding);

    const steps = 100;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const bx = this._bezierX(t, cx);
      const by = this._bezierY(t, cy);
      const x = padding + bx * graphWidth;
      const y = height - padding - by * graphHeight;
      ctx.lineTo(x, y);
    }

    ctx.lineTo(padding + graphWidth, height - padding);
    ctx.closePath();

    // Fill with gradient using the curve color
    const gradient = ctx.createLinearGradient(0, padding, 0, height - padding);
    gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.15)`);
    gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0.02)`);
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw the curve line
    ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const bx = this._bezierX(t, cx);
      const by = this._bezierY(t, cy);
      const x = padding + bx * graphWidth;
      const y = height - padding - by * graphHeight;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    // Use the curve color we already retrieved
    ctx.strokeStyle = curveColor;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    // Draw endpoint marker
    const endY = height - padding - graphHeight;
    ctx.beginPath();
    ctx.arc(padding + graphWidth, endY, 6, 0, Math.PI * 2);
    ctx.fillStyle = curveColor;
    ctx.fill();
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  private _drawGrid(ctx: CanvasRenderingContext2D, padding: number, graphWidth: number, graphHeight: number): void {
    const computedStyle = getComputedStyle(this);
    const secondaryTextColor = computedStyle.getPropertyValue('--secondary-text-color').trim() || 'rgba(128, 128, 128, 0.5)';

    // Create a more contrasting grid color by using secondary text color with lower opacity
    // This works well in both light and dark modes
    ctx.strokeStyle = secondaryTextColor;
    ctx.globalAlpha = 0.3;
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);

    // 3x3 grid: draw 4 lines (including edges) for each axis
    const divisions = 3;

    // Vertical grid lines (time divisions)
    for (let i = 0; i <= divisions; i++) {
      const x = padding + (graphWidth / divisions) * i;
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, padding + graphHeight);
      ctx.stroke();
    }

    // Horizontal grid lines (brightness divisions)
    for (let i = 0; i <= divisions; i++) {
      const y = padding + (graphHeight / divisions) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(padding + graphWidth, y);
      ctx.stroke();
    }

    // Reset global alpha and line dash
    ctx.globalAlpha = 1.0;
    ctx.setLineDash([]);
  }

  private _handleCanvasPointerDown(e: MouseEvent | TouchEvent): void {
    e.preventDefault();
    this._isDragging = true;
    this._handleCanvasInteraction(e);

    if (e instanceof MouseEvent) {
      window.addEventListener('mousemove', this._handleCanvasPointerMove);
      window.addEventListener('mouseup', this._handleCanvasPointerUp);
    } else {
      window.addEventListener('touchmove', this._handleCanvasPointerMove, { passive: false });
      window.addEventListener('touchend', this._handleCanvasPointerUp);
    }
  }

  private _handleCanvasPointerMove = (e: MouseEvent | TouchEvent): void => {
    if (!this._isDragging) return;
    e.preventDefault();
    this._handleCanvasInteraction(e);
  };

  private _handleCanvasPointerUp = (): void => {
    this._isDragging = false;
    window.removeEventListener('mousemove', this._handleCanvasPointerMove);
    window.removeEventListener('mouseup', this._handleCanvasPointerUp);
    window.removeEventListener('touchmove', this._handleCanvasPointerMove);
    window.removeEventListener('touchend', this._handleCanvasPointerUp);
  };

  private _handleCanvasInteraction(e: MouseEvent | TouchEvent): void {
    const canvas = this._canvas;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    let clientY: number;

    if ('touches' in e) {
      const touch = e.touches[0];
      if (!touch) return;
      clientY = touch.clientY;
    } else {
      clientY = e.clientY;
    }

    const padding = 24;
    const graphHeight = this.height - padding * 2;

    // Calculate Y position relative to graph area
    const y = clientY - rect.top - padding;
    const normalizedY = 1 - Math.max(0, Math.min(1, y / graphHeight));

    // Map Y position to curvature using inverse power function
    // When normalizedY is high (top of graph), curvature should be low (fast-slow)
    // When normalizedY is low (bottom of graph), curvature should be high (slow-fast)
    let newCurvature: number;

    if (normalizedY >= 0.5) {
      // Top half: map to 0.2-1.0 (fast-slow to linear)
      const t = (normalizedY - 0.5) * 2;
      newCurvature = 1.0 - t * (1.0 - this.MIN_CURVATURE);
    } else {
      // Bottom half: map to 1.0-6.0 (linear to slow-fast)
      const t = (0.5 - normalizedY) * 2;
      newCurvature = 1.0 + t * (this.MAX_CURVATURE - 1.0);
    }

    // Round to step size
    newCurvature = Math.round(newCurvature / this.STEP) * this.STEP;
    newCurvature = Math.max(this.MIN_CURVATURE, Math.min(this.MAX_CURVATURE, newCurvature));

    const finalValue = parseFloat(newCurvature.toFixed(2));

    // Emit event to parent for state management
    this.dispatchEvent(new CustomEvent('curvature-input', {
      detail: { curvature: finalValue },
      bubbles: true,
      composed: true,
    }));
  }

  private _localize(key: string, replacements?: Record<string, string>): string {
    return localize(this.translations, key, replacements);
  }

  render() {
    return html`
      <div class="curve-editor-container">
        <div class="curve-header">
          <span class="title">${this._localize('transition_curve.title')}</span>
          <span class="subtitle">${this._localize('transition_curve.subtitle')}</span>
        </div>

        <div class="curve-canvas-wrapper">
          <div class="graph-container">
            <div class="graph-row">
              <div class="y-axis-label">
                <ha-icon icon="mdi:brightness-6"></ha-icon>
              </div>
              <canvas
                width="${this.width}"
                height="${this.height}"
                @mousedown=${this._handleCanvasPointerDown}
                @touchstart=${this._handleCanvasPointerDown}
              ></canvas>
              <div class="graph-spacer"></div>
            </div>
            <div class="x-axis-label">
              <ha-icon icon="mdi:clock-outline"></ha-icon>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'transition-curve-editor': TransitionCurveEditor;
  }
}
