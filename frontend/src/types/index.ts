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
  clipPath?: string;
  background?: string;
  transform?: string;
  backdropFilter?: string;
  filter?: string;
  borderWidth?: string;
  borderStyle?: string;
  customCss?: string;
}

export interface Point {
  x: number;
  y: number;
}

export interface Connection {
  nodeId: string;
  anchor: 'top' | 'bottom' | 'left' | 'right';
}

export interface DiagramNode {
  id: string;
  type: 'box' | 'diamond' | 'circle' | 'triangle' | 'line' | 'arrow' | 'star' | 'path' | 'comment' | 'pill' | 'hexagon' | 'parallelogram' | 'database' | 'note' | 'custom-block' | 'custom-connector';
  position: Position;
  dimensions: Dimensions;
  content: string;
  style?: NodeStyle;
  rotation?: number;
  startPoint?: Point;
  endPoint?: Point;
  startConnection?: Connection;
  endConnection?: Connection;
  lineStyle?: 'solid' | 'dashed';
  lineCurve?: 'straight' | 'curved';
  arrowType?: 'none' | 'single' | 'double';
  points?: Point[];
  customConnectorStyle?: Record<string, string | number>;
}
