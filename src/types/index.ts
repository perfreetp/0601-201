export type ElementType = 'text' | 'image' | 'shape' | 'qr' | 'icon';

export interface TextStyles {
  content: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  lineHeight: number;
  letterSpacing: number;
  color: string;
  textAlign: 'left' | 'center' | 'right';
  textShadow?: { x: number; y: number; blur: number; color: string };
}

export interface ImageStyles {
  src: string;
  filter: string;
  borderRadius: number;
  objectFit: 'cover' | 'contain' | 'fill';
  shadow?: { x: number; y: number; blur: number; spread: number; color: string };
  border?: { width: number; color: string };
}

export interface ShapeStyles {
  fill: string;
  shape: 'rect' | 'circle' | 'triangle' | 'line';
  borderRadius: number;
  shadow?: { x: number; y: number; blur: number; spread: number; color: string };
  border?: { width: number; color: string };
  gradient?: { type: 'linear' | 'radial'; colors: string[]; angle: number };
}

export interface QrStyles {
  value: string;
  fgColor: string;
  bgColor: string;
  size: number;
  level: 'L' | 'M' | 'Q' | 'H';
}

export interface IconStyles {
  name: string;
  color: string;
  strokeWidth: number;
}

export interface CanvasElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  locked: boolean;
  opacity: number;
  zIndex: number;
  deleted?: boolean;
  styles: TextStyles | ImageStyles | ShapeStyles | QrStyles | IconStyles;
}

export interface CanvasSize {
  width: number;
  height: number;
  name: string;
  aspect: string;
}

export interface BrandColor {
  id: string;
  name: string;
  color: string;
}

export interface Project {
  id: string;
  name: string;
  thumbnail: string;
  createdAt: number;
  updatedAt: number;
  canvasState: CanvasState;
  versions: { timestamp: number; state: CanvasState }[];
  shareToken: string | null;
}

export interface CanvasState {
  elements: CanvasElement[];
  selectedId: string | null;
  background: string;
  canvasSize: CanvasSize;
  zoom: number;
  deletedElements: CanvasElement[];
}

export interface Template {
  id: string;
  name: string;
  category: string;
  thumbnail: string;
  canvasSize: CanvasSize;
  background: string;
  elements: CanvasElement[];
}

export interface ColorPalette {
  id: string;
  name: string;
  colors: string[];
}

export interface FilterPreset {
  id: string;
  name: string;
  filter: string;
}
