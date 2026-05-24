import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { DiagramNode } from '@/types';

interface DiagramContextType {
  nodes: DiagramNode[];
  selectedNodeId: string | null;
  addBox: () => void;
  addDiamond: () => void;
  updateNode: (updatedNode: DiagramNode) => void;
  moveNode: (id: string, position: { x: number; y: number }) => void;
  resizeNode: (id: string, dimensions: { width: number; height: number }, position: { x: number; y: number }) => void;
  selectNode: (id: string | null) => void;
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

  const updateNode = (updatedNode: DiagramNode) => {
    setNodes((prev) => prev.map(node => node.id === updatedNode.id ? updatedNode : node));
  };

  const moveNode = (id: string, position: { x: number; y: number }) => {
    setNodes((prev) => prev.map(node => 
      node.id === id ? { ...node, position } : node
    ));
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
    <DiagramContext.Provider value={{ nodes, selectedNodeId, addBox, addDiamond, updateNode, moveNode, resizeNode, selectNode }}>
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
