export interface Point {
  x: number;
  y: number;
}

export type ToolType = 'arrow' | 'rectangle' | 'freehand' | 'text';

export const PRESET_COLORS = [
  '#FF3B30',
  '#FF9500',
  '#FFCC00',
  '#34C759',
  '#007AFF',
  '#AF52DE',
] as const;

export type PresetColor = (typeof PRESET_COLORS)[number];

export const STROKE_WIDTHS = [2, 4, 8] as const;
export type StrokeWidth = (typeof STROKE_WIDTHS)[number];

export interface ArrowAnnotation {
  type: 'arrow';
  start: Point;
  end: Point;
  color: string;
  strokeWidth: number;
}

export interface RectangleAnnotation {
  type: 'rectangle';
  start: Point;
  end: Point;
  color: string;
  strokeWidth: number;
}

export interface FreehandAnnotation {
  type: 'freehand';
  points: Point[];
  color: string;
  strokeWidth: number;
}

export interface TextAnnotation {
  type: 'text';
  position: Point;
  content: string;
  color: string;
  fontSize: number;
}

export type Annotation =
  | ArrowAnnotation
  | RectangleAnnotation
  | FreehandAnnotation
  | TextAnnotation;
