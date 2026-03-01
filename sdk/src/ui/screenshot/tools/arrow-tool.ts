import type { Annotation, Point } from '../types';
import { BaseTool } from './base-tool';

export class ArrowTool extends BaseTool {
  private start: Point | null = null;
  private current: Point | null = null;

  onPointerDown(point: Point): void {
    this.start = point;
    this.current = point;
  }

  onPointerMove(point: Point): void {
    this.current = point;
  }

  onPointerUp(_point: Point): Annotation | null {
    if (!this.start || !this.current) return null;
    const dx = this.current.x - this.start.x;
    const dy = this.current.y - this.start.y;
    if (Math.sqrt(dx * dx + dy * dy) < 5) {
      this.start = null;
      this.current = null;
      return null;
    }
    const annotation: Annotation = {
      type: 'arrow',
      start: { ...this.start },
      end: { ...this.current },
      color: this.color,
      strokeWidth: this.strokeWidth,
    };
    this.start = null;
    this.current = null;
    return annotation;
  }

  drawPreview(ctx: CanvasRenderingContext2D): void {
    if (!this.start || !this.current) return;
    BaseTool.drawArrow(ctx, this.start, this.current, this.color, this.strokeWidth);
  }
}
