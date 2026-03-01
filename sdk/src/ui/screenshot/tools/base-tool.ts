import type { Annotation, Point } from '../types';

export abstract class BaseTool {
  protected color: string;
  protected strokeWidth: number;

  constructor(color: string, strokeWidth = 3) {
    this.color = color;
    this.strokeWidth = strokeWidth;
  }

  setColor(color: string): void {
    this.color = color;
  }

  setStrokeWidth(width: number): void {
    this.strokeWidth = width;
  }

  abstract onPointerDown(point: Point, ctx: CanvasRenderingContext2D): void;
  abstract onPointerMove(point: Point, ctx: CanvasRenderingContext2D): void;
  abstract onPointerUp(point: Point, ctx: CanvasRenderingContext2D): Annotation | null;

  abstract drawPreview(ctx: CanvasRenderingContext2D): void;

  static renderAnnotation(ctx: CanvasRenderingContext2D, annotation: Annotation): void {
    switch (annotation.type) {
      case 'arrow':
        BaseTool.drawArrow(ctx, annotation.start, annotation.end, annotation.color, annotation.strokeWidth);
        break;
      case 'rectangle':
        BaseTool.drawRectangle(ctx, annotation.start, annotation.end, annotation.color, annotation.strokeWidth);
        break;
      case 'freehand':
        BaseTool.drawFreehand(ctx, annotation.points, annotation.color, annotation.strokeWidth);
        break;
      case 'text':
        BaseTool.drawText(ctx, annotation.position, annotation.content, annotation.color, annotation.fontSize);
        break;
    }
  }

  protected static drawArrow(ctx: CanvasRenderingContext2D, start: Point, end: Point, color: string, strokeWidth = 3): void {
    const headLen = 10 + strokeWidth * 2;
    const angle = Math.atan2(end.y - start.y, end.x - start.x);

    ctx.strokeStyle = color;
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(end.x, end.y);
    ctx.lineTo(
      end.x - headLen * Math.cos(angle - Math.PI / 6),
      end.y - headLen * Math.sin(angle - Math.PI / 6),
    );
    ctx.moveTo(end.x, end.y);
    ctx.lineTo(
      end.x - headLen * Math.cos(angle + Math.PI / 6),
      end.y - headLen * Math.sin(angle + Math.PI / 6),
    );
    ctx.stroke();
  }

  protected static drawRectangle(ctx: CanvasRenderingContext2D, start: Point, end: Point, color: string, strokeWidth = 3): void {
    ctx.strokeStyle = color;
    ctx.lineWidth = strokeWidth;
    ctx.lineJoin = 'round';
    ctx.strokeRect(
      Math.min(start.x, end.x),
      Math.min(start.y, end.y),
      Math.abs(end.x - start.x),
      Math.abs(end.y - start.y),
    );
  }

  protected static drawFreehand(ctx: CanvasRenderingContext2D, points: Point[], color: string, strokeWidth = 3): void {
    if (points.length < 2) return;
    ctx.strokeStyle = color;
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();
  }

  protected static drawText(ctx: CanvasRenderingContext2D, position: Point, content: string, color: string, fontSize: number): void {
    ctx.fillStyle = color;
    ctx.font = `bold ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.textBaseline = 'top';
    ctx.fillText(content, position.x, position.y);
  }
}
