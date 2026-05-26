export interface Position {
  x: number;
  y: number;
}

export interface Dimensions {
  width: number;
  height: number;
}

export interface NodeStyle {
  backgroundColor?: string;
  borderColor?: string;
  color?: string;
  fontSize?: string;
  borderRadius?: string;
  boxShadow?: string;
  fontWeight?: string;
  textAlign?: 'left' | 'center' | 'right';
  opacity?: string;
}

export interface Point {
  x: number;
  y: number;
}

export interface DiagramNode {
  id: string;
  type: 'box' | 'diamond' | 'circle' | 'triangle' | 'line' | 'arrow' | 'star';
  position: Position;
  dimensions: Dimensions;
  content: string;
  style?: NodeStyle;
  rotation?: number;
  startPoint?: Point;
  endPoint?: Point;
  lineStyle?: 'solid' | 'dashed';
  lineCurve?: 'straight' | 'curved';
  arrowType?: 'none' | 'single' | 'double';
}
