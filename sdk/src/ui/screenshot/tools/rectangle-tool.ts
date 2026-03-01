import type { Annotation, Point } from '../types';
import { BaseTool } from './base-tool';

export class RectangleTool extends BaseTool {
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
    const w = Math.abs(this.current.x - this.start.x);
    const h = Math.abs(this.current.y - this.start.y);
    if (w < 5 && h < 5) {
      this.start = null;
      this.current = null;
      return null;
    }
    const annotation: Annotation = {
      type: 'rectangle',
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
    BaseTool.drawRectangle(ctx, this.start, this.current, this.color, this.strokeWidth);
  }
}
