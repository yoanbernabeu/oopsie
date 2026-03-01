import type { Annotation, Point, ToolType } from './types';
import { PRESET_COLORS, STROKE_WIDTHS } from './types';
import { getAnnotationEditorStyles } from './annotation-styles';
import { BaseTool } from './tools/base-tool';
import { ArrowTool } from './tools/arrow-tool';
import { RectangleTool } from './tools/rectangle-tool';
import { FreehandTool } from './tools/freehand-tool';
import { TextTool } from './tools/text-tool';

interface EditorResult {
  file: File;
}

export class AnnotationEditor {
  private host: HTMLDivElement | null = null;
  private shadowRoot: ShadowRoot | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private canvasContainer: HTMLElement | null = null;

  private sourceCanvas: HTMLCanvasElement;
  private annotations: Annotation[] = [];
  private currentTool: ToolType = 'arrow';
  private currentColor: string = PRESET_COLORS[0];
  private currentStrokeWidth: number = STROKE_WIDTHS[1]; // 4px default
  private isDrawing = false;

  private tools: Record<ToolType, BaseTool>;
  private textTool: TextTool;

  private displayScale = 1;

  private resolvePromise: ((result: EditorResult | null) => void) | null = null;

  constructor(sourceCanvas: HTMLCanvasElement) {
    this.sourceCanvas = sourceCanvas;
    this.textTool = new TextTool(this.currentColor);
    this.tools = {
      arrow: new ArrowTool(this.currentColor, this.currentStrokeWidth),
      rectangle: new RectangleTool(this.currentColor, this.currentStrokeWidth),
      freehand: new FreehandTool(this.currentColor, this.currentStrokeWidth),
      text: this.textTool,
    };
  }

  open(): Promise<EditorResult | null> {
    return new Promise((resolve) => {
      this.resolvePromise = resolve;
      this.render();
    });
  }

  private render(): void {
    this.host = document.createElement('div');
    this.host.id = 'oopsie-annotation-host';
    document.body.appendChild(this.host);
    this.shadowRoot = this.host.attachShadow({ mode: 'open' });

    const style = document.createElement('style');
    style.textContent = getAnnotationEditorStyles();
    this.shadowRoot.appendChild(style);

    const editor = document.createElement('div');
    editor.className = 'oopsie-annotation-editor';

    editor.innerHTML = `
      <div class="oopsie-ae-toolbar">
        <div class="oopsie-ae-toolbar-group">
          ${this.renderToolButton('arrow', this.arrowIcon())}
          ${this.renderToolButton('rectangle', this.rectIcon())}
          ${this.renderToolButton('freehand', this.penIcon())}
          ${this.renderToolButton('text', this.textIcon())}
        </div>
        <div class="oopsie-ae-toolbar-separator"></div>
        <div class="oopsie-ae-toolbar-group">
          ${PRESET_COLORS.map((c) => `<button class="oopsie-ae-color-btn${c === this.currentColor ? ' active' : ''}" data-color="${c}" style="background:${c}"></button>`).join('')}
        </div>
        <div class="oopsie-ae-toolbar-separator"></div>
        <div class="oopsie-ae-toolbar-group">
          ${STROKE_WIDTHS.map((w) => `<button class="oopsie-ae-stroke-btn${w === this.currentStrokeWidth ? ' active' : ''}" data-stroke="${w}" title="${w}px"><span class="oopsie-ae-stroke-line" style="width:${12 + w * 2}px;height:${w}px"></span></button>`).join('')}
        </div>
        <div class="oopsie-ae-toolbar-separator"></div>
        <div class="oopsie-ae-toolbar-group">
          <button class="oopsie-ae-tool-btn" data-action="undo" title="Undo">${this.undoIcon()}</button>
        </div>
        <div class="oopsie-ae-actions">
          <button class="oopsie-ae-btn" data-action="cancel">Cancel</button>
          <button class="oopsie-ae-btn oopsie-ae-btn-primary" data-action="done">Done</button>
        </div>
      </div>
      <div class="oopsie-ae-canvas-wrapper">
        <div class="oopsie-ae-canvas-container"></div>
      </div>
    `;

    this.shadowRoot.appendChild(editor);

    this.canvasContainer = this.shadowRoot.querySelector('.oopsie-ae-canvas-container');
    this.setupCanvas();
    this.attachToolbarEvents(editor);
    this.attachCanvasEvents();
    this.textTool.setContainer(this.canvasContainer!);
    this.textTool.setDisplayScale(this.displayScale);
    this.textTool.setOnCommit((annotation) => {
      this.annotations.push(annotation);
      this.redraw();
    });
    this.redraw();
  }

  private setupCanvas(): void {
    if (!this.canvasContainer) return;

    this.canvas = document.createElement('canvas');
    this.canvas.width = this.sourceCanvas.width;
    this.canvas.height = this.sourceCanvas.height;

    // Scale canvas to fit within the viewport
    const wrapper = this.canvasContainer.parentElement!;
    const maxW = wrapper.clientWidth;
    const maxH = wrapper.clientHeight;
    this.displayScale = Math.min(
      maxW / this.sourceCanvas.width,
      maxH / this.sourceCanvas.height,
      1,
    );
    this.canvas.style.width = `${this.sourceCanvas.width * this.displayScale}px`;
    this.canvas.style.height = `${this.sourceCanvas.height * this.displayScale}px`;

    this.canvasContainer.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d')!;
  }

  private getCanvasPoint(e: PointerEvent): Point {
    const rect = this.canvas!.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / this.displayScale,
      y: (e.clientY - rect.top) / this.displayScale,
    };
  }

  private attachCanvasEvents(): void {
    if (!this.canvas) return;

    this.canvas.addEventListener('pointerdown', (e) => {
      // If text tool has pending input, commit it first
      if (this.currentTool !== 'text') {
        const textResult = this.textTool.confirmInput();
        if (textResult) this.annotations.push(textResult);
      }

      this.isDrawing = true;
      const point = this.getCanvasPoint(e);
      this.tools[this.currentTool].onPointerDown(point, this.ctx!);
      this.canvas!.setPointerCapture(e.pointerId);
    });

    this.canvas.addEventListener('pointermove', (e) => {
      if (!this.isDrawing) return;
      const point = this.getCanvasPoint(e);
      this.tools[this.currentTool].onPointerMove(point, this.ctx!);
      this.redraw();
    });

    this.canvas.addEventListener('pointerup', (e) => {
      if (!this.isDrawing) return;
      this.isDrawing = false;
      const point = this.getCanvasPoint(e);
      const annotation = this.tools[this.currentTool].onPointerUp(point, this.ctx!);
      if (annotation) {
        this.annotations.push(annotation);
      }
      this.redraw();
    });
  }

  private attachToolbarEvents(editor: HTMLElement): void {
    editor.querySelectorAll('[data-tool]').forEach((btn) => {
      btn.addEventListener('click', () => {
        // Commit any pending text
        const textResult = this.textTool.confirmInput();
        if (textResult) {
          this.annotations.push(textResult);
          this.redraw();
        }

        this.currentTool = btn.getAttribute('data-tool') as ToolType;
        editor.querySelectorAll('[data-tool]').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    editor.querySelectorAll('[data-color]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.currentColor = btn.getAttribute('data-color')!;
        Object.values(this.tools).forEach((t) => t.setColor(this.currentColor));
        editor.querySelectorAll('[data-color]').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    editor.querySelectorAll('[data-stroke]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.currentStrokeWidth = Number(btn.getAttribute('data-stroke'));
        Object.values(this.tools).forEach((t) => t.setStrokeWidth(this.currentStrokeWidth));
        editor.querySelectorAll('[data-stroke]').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    editor.querySelector('[data-action="undo"]')?.addEventListener('click', () => {
      this.annotations.pop();
      this.redraw();
    });

    editor.querySelector('[data-action="cancel"]')?.addEventListener('click', () => {
      this.close(null);
    });

    editor.querySelector('[data-action="done"]')?.addEventListener('click', () => {
      // Commit any pending text
      const textResult = this.textTool.confirmInput();
      if (textResult) this.annotations.push(textResult);
      this.exportAndClose();
    });
  }

  private redraw(): void {
    if (!this.ctx || !this.canvas) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.drawImage(this.sourceCanvas, 0, 0);

    for (const annotation of this.annotations) {
      BaseTool.renderAnnotation(this.ctx, annotation);
    }

    // Draw current tool preview
    if (this.isDrawing) {
      this.tools[this.currentTool].drawPreview(this.ctx);
    }
  }

  private exportAndClose(): void {
    // Render at native resolution on the source canvas
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = this.sourceCanvas.width;
    exportCanvas.height = this.sourceCanvas.height;
    const exportCtx = exportCanvas.getContext('2d')!;

    exportCtx.drawImage(this.sourceCanvas, 0, 0);
    for (const annotation of this.annotations) {
      BaseTool.renderAnnotation(exportCtx, annotation);
    }

    exportCanvas.toBlob((blob) => {
      if (!blob) {
        this.close(null);
        return;
      }
      const file = new File([blob], `screenshot-${Date.now()}.png`, { type: 'image/png' });
      this.close({ file });
    }, 'image/png');
  }

  private close(result: EditorResult | null): void {
    this.textTool.removeInput();
    this.host?.remove();
    this.host = null;
    this.shadowRoot = null;
    this.canvas = null;
    this.ctx = null;
    this.resolvePromise?.(result);
  }

  // Icons
  private arrowIcon(): string {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="19" x2="19" y2="5"/><polyline points="13 5 19 5 19 11"/></svg>`;
  }

  private rectIcon(): string {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>`;
  }

  private penIcon(): string {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg>`;
  }

  private textIcon(): string {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>`;
  }

  private undoIcon(): string {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>`;
  }

  private renderToolButton(tool: ToolType, icon: string): string {
    const active = tool === this.currentTool ? ' active' : '';
    return `<button class="oopsie-ae-tool-btn${active}" data-tool="${tool}" title="${tool}">${icon}</button>`;
  }
}
