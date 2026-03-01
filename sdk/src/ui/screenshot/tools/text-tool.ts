import type { Annotation, Point } from '../types';
import { BaseTool } from './base-tool';

export class TextTool extends BaseTool {
  private pendingPosition: Point | null = null;
  private inputEl: HTMLInputElement | null = null;
  private container: HTMLElement | null = null;
  private displayScale = 1;
  private onCommit: ((annotation: Annotation) => void) | null = null;

  setContainer(container: HTMLElement): void {
    this.container = container;
  }

  setDisplayScale(scale: number): void {
    this.displayScale = scale;
  }

  setOnCommit(cb: (annotation: Annotation) => void): void {
    this.onCommit = cb;
  }

  onPointerDown(point: Point): void {
    // Commit any existing input first
    const prev = this.confirmInput();
    if (prev && this.onCommit) this.onCommit(prev);

    this.pendingPosition = point;
    this.showInput(point);
  }

  onPointerMove(): void {
    // no-op for text tool
  }

  onPointerUp(): Annotation | null {
    // text is committed via confirmInput or Enter key
    return null;
  }

  drawPreview(): void {
    // no canvas preview; we use an HTML input
  }

  confirmInput(): Annotation | null {
    if (!this.inputEl || !this.pendingPosition) return null;
    const content = this.inputEl.value.trim();
    if (!content) {
      this.removeInput();
      return null;
    }
    const annotation: Annotation = {
      type: 'text',
      position: { ...this.pendingPosition },
      content,
      color: this.color,
      fontSize: 20,
    };
    this.removeInput();
    return annotation;
  }

  removeInput(): void {
    this.inputEl?.remove();
    this.inputEl = null;
    this.pendingPosition = null;
  }

  private showInput(point: Point): void {
    if (!this.container) return;

    const scaledX = point.x * this.displayScale;
    const scaledY = point.y * this.displayScale;
    const scaledFontSize = Math.round(20 * this.displayScale);

    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Type here...';
    input.style.cssText = `
      position: absolute;
      left: ${scaledX}px;
      top: ${scaledY - scaledFontSize / 2}px;
      font-size: ${scaledFontSize}px;
      font-weight: bold;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: ${this.color};
      background: rgba(0,0,0,0.5);
      border: 2px solid ${this.color};
      border-radius: 4px;
      padding: 2px 6px;
      outline: none;
      min-width: 80px;
      max-width: ${this.container.clientWidth - scaledX - 8}px;
      z-index: 10;
      box-sizing: border-box;
    `;

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const annotation = this.confirmInput();
        if (annotation && this.onCommit) this.onCommit(annotation);
      }
      if (e.key === 'Escape') {
        this.removeInput();
      }
    });

    this.container.appendChild(input);
    this.inputEl = input;
    requestAnimationFrame(() => input.focus());
  }
}
