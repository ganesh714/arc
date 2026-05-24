import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { DiagramNode } from '@/types';

interface DiagramContextType {
  nodes: DiagramNode[];
  selectedNodeId: string | null;
  addBox: () => void;
  addDiamond: () => void;
  addCircle: () => void;
  addTriangle: () => void;
  addLine: () => void;
  addArrow: () => void;
  updateLinePoints: (id: string, startPoint: { x: number; y: number }, endPoint: { x: number; y: number }) => void;
  updateNode: (updatedNode: DiagramNode) => void;
  moveNode: (id: string, position: { x: number; y: number }) => void;
  resizeNode: (id: string, dimensions: { width: number; height: number }, position: { x: number; y: number }) => void;
  selectNode: (id: string | null) => void;
  setNodes: (nodes: DiagramNode[]) => void;
}

const DiagramContext = createContext<DiagramContextType | undefined>(undefined);

export function DiagramProvider({ children }: { children: ReactNode }) {
  const [nodes, setNodes] = useState<DiagramNode[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const addBox = () => {
    const newNode: DiagramNode = {
      id: crypto.randomUUID().split('-')[0],
      type: 'box',
      position: { x: 50, y: 50 },
      dimensions: { width: 150, height: 100 },
      content: 'New Box',
      style: {
        backgroundColor: '#e0f2fe',
        borderColor: '#0284c7',
        color: '#0f172a'
      }
    };
    setNodes((prev) => [...prev, newNode]);
  };

  const addDiamond = () => {
    const newNode: DiagramNode = {
      id: crypto.randomUUID().split('-')[0],
      type: 'diamond',
      position: { x: 80, y: 80 },
      dimensions: { width: 120, height: 120 },
      content: 'New Diamond',
      style: {
        backgroundColor: '#fff3cd',
        borderColor: '#ffc107',
        color: '#0f172a'
      }
    };
    setNodes((prev) => [...prev, newNode]);
  };

  const addCircle = () => {
    const newNode: DiagramNode = {
      id: crypto.randomUUID().split('-')[0],
      type: 'circle',
      position: { x: 100, y: 100 },
      dimensions: { width: 100, height: 100 },
      content: 'New Circle',
      style: {
        backgroundColor: '#f1f5f9',
        borderColor: '#64748b',
        color: '#0f172a'
      }
    };
    setNodes((prev) => [...prev, newNode]);
  };

  const addTriangle = () => {
    const newNode: DiagramNode = {
      id: crypto.randomUUID().split('-')[0],
      type: 'triangle',
      position: { x: 120, y: 120 },
      dimensions: { width: 120, height: 100 },
      content: 'New Triangle',
      style: {
        backgroundColor: '#f0fdf4',
        borderColor: '#16a34a',
        color: '#0f172a'
      }
    };
    setNodes((prev) => [...prev, newNode]);
  };

  const addLine = () => {
    const newNode: DiagramNode = {
      id: crypto.randomUUID().split('-')[0],
      type: 'line',
      position: { x: 150, y: 150 },
      dimensions: { width: 200, height: 20 },
      content: '',
      style: {
        borderColor: '#475569',
      },
      startPoint: { x: 150, y: 160 },
      endPoint: { x: 350, y: 160 }
    };
    setNodes((prev) => [...prev, newNode]);
  };

  const addArrow = () => {
    const newNode: DiagramNode = {
      id: crypto.randomUUID().split('-')[0],
      type: 'arrow',
      position: { x: 150, y: 200 },
      dimensions: { width: 200, height: 20 },
      content: '',
      style: {
        borderColor: '#0284c7',
      },
      startPoint: { x: 150, y: 210 },
      endPoint: { x: 350, y: 210 }
    };
    setNodes((prev) => [...prev, newNode]);
  };

  const updateLinePoints = (id: string, startPoint: { x: number; y: number }, endPoint: { x: number; y: number }) => {
    setNodes((prev) => prev.map(node => {
      if (node.id === id) {
        const x = Math.min(startPoint.x, endPoint.x);
        const y = Math.min(startPoint.y, endPoint.y);
        const width = Math.max(15, Math.abs(endPoint.x - startPoint.x));
        const height = Math.max(15, Math.abs(endPoint.y - startPoint.y));
        
        return {
          ...node,
          startPoint,
          endPoint,
          position: { x, y },
          dimensions: { width, height }
        };
      }
      return node;
    }));
  };

  const updateNode = (updatedNode: DiagramNode) => {
    setNodes((prev) => prev.map(node => node.id === updatedNode.id ? updatedNode : node));
  };

  const moveNode = (id: string, position: { x: number; y: number }) => {
    setNodes((prev) => prev.map(node => {
      if (node.id === id) {
        if (node.startPoint && node.endPoint) {
          const dx = position.x - node.position.x;
          const dy = position.y - node.position.y;
          return {
            ...node,
            position,
            startPoint: { x: node.startPoint.x + dx, y: node.startPoint.y + dy },
            endPoint: { x: node.endPoint.x + dx, y: node.endPoint.y + dy }
          };
        }
        return { ...node, position };
      }
      return node;
    }));
  };

  const resizeNode = (
    id: string, 
    dimensions: { width: number; height: number }, 
    position: { x: number; y: number }
  ) => {
    setNodes((prev) => prev.map(node => 
      node.id === id ? { ...node, dimensions, position } : node
    ));
  };

  const selectNode = (id: string | null) => {
    setSelectedNodeId(id);
  };

  return (
    <DiagramContext.Provider value={{ nodes, selectedNodeId, addBox, addDiamond, addCircle, addTriangle, addLine, addArrow, updateLinePoints, updateNode, moveNode, resizeNode, selectNode, setNodes }}>
      {children}
    </DiagramContext.Provider>
  );
}

export function useDiagram() {
  const context = useContext(DiagramContext);
  if (!context) {
    throw new Error('useDiagram must be used within a DiagramProvider');
  }
  return context;
}
