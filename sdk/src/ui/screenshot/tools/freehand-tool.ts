import type { Annotation, Point } from '../types';
import { BaseTool } from './base-tool';

export class FreehandTool extends BaseTool {
  private points: Point[] = [];

  onPointerDown(point: Point): void {
    this.points = [point];
  }

  onPointerMove(point: Point): void {
    this.points.push(point);
  }

  onPointerUp(_point: Point): Annotation | null {
    if (this.points.length < 2) {
      this.points = [];
      return null;
    }
    const annotation: Annotation = {
      type: 'freehand',
      points: [...this.points],
      color: this.color,
      strokeWidth: this.strokeWidth,
    };
    this.points = [];
    return annotation;
  }

  drawPreview(ctx: CanvasRenderingContext2D): void {
    if (this.points.length < 2) return;
    BaseTool.drawFreehand(ctx, this.points, this.color, this.strokeWidth);
  }
}
