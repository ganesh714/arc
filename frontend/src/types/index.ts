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
}

export interface DiagramNode {
  id: string;
  type: 'box' | 'diamond' | 'circle' | 'triangle';
  position: Position;
  dimensions: Dimensions;
  content: string;
  style?: NodeStyle;
}
