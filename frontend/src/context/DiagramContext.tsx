import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { DiagramNode } from '@/types';

export interface Project {
  id: string;
  name: string;
  category: string;
  nodes: DiagramNode[];
  updatedAt: number;
}

interface DiagramContextType {
  nodes: DiagramNode[];
  selectedNodeIds: string[];
  addBox: (position?: { x: number; y: number }) => void;
  addDiamond: (position?: { x: number; y: number }) => void;
  addCircle: (position?: { x: number; y: number }) => void;
  addTriangle: (position?: { x: number; y: number }) => void;
  addStar: (position?: { x: number; y: number }) => void;
  addLine: (position?: { x: number; y: number }) => void;
  addArrow: (position?: { x: number; y: number }) => void;
  updateLinePoints: (id: string, startPoint: { x: number; y: number }, endPoint: { x: number; y: number }) => void;
  updateNode: (updatedNode: DiagramNode) => void;
  updateMultipleNodes: (ids: string[], updates: Partial<DiagramNode>) => void;
  moveNode: (id: string, position: { x: number; y: number }) => void;
  moveSelectedNodes: (draggedNodeId: string, position: { x: number; y: number }) => void;
  resizeNode: (id: string, dimensions: { width: number; height: number }, position: { x: number; y: number }) => void;
  selectNode: (id: string | null, multi?: boolean) => void;
  setSelectedNodeIds: (ids: string[]) => void;
  setNodes: (nodes: DiagramNode[] | ((prev: DiagramNode[]) => DiagramNode[])) => void;
  bringToFront: (ids: string[]) => void;
  sendToBack: (ids: string[]) => void;
  alignSelected: (alignmentType: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => void;
  zoom: number;
  setZoom: (zoom: number) => void;
  activeTool: string;
  setActiveTool: (tool: string) => void;
  selectToolMode: 'move' | 'scale';
  setSelectToolMode: (mode: 'move' | 'scale') => void;
  projects: Project[];
  activeProjectId: string;
  switchProject: (id: string) => void;
  addProject: (name: string, category?: string) => void;
  
  // Sidebar state
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  
  // History states/functions
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  saveHistoryState: (customNodes: DiagramNode[]) => void;
  
  // Clipboard functions
  copySelected: () => void;
  pasteSelected: () => void;
  cutSelected: () => void;
  deleteSelected: () => void;
  
  // Theme state
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const DiagramContext = createContext<DiagramContextType | undefined>(undefined);

const initialProjects: Project[] = [
  {
    id: 'project-1',
    name: 'Loom Diagram',
    category: 'Loom Diagrams',
    updatedAt: Date.now(),
    nodes: [
      {
        id: 'node-1',
        type: 'box',
        position: { x: 80, y: 80 },
        dimensions: { width: 160, height: 100 },
        content: 'Figma Canvas',
        style: {
          backgroundColor: '#2c2c2c',
          borderColor: '#555555',
          color: '#e3e3e3'
        }
      },
      {
        id: 'node-2',
        type: 'circle',
        position: { x: 340, y: 80 },
        dimensions: { width: 100, height: 100 },
        content: 'Brainstorm',
        style: {
          backgroundColor: '#2c2c2c',
          borderColor: '#555555',
          color: '#e3e3e3'
        }
      },
      {
        id: 'node-3',
        type: 'arrow',
        position: { x: 240, y: 120 },
        dimensions: { width: 100, height: 20 },
        content: '',
        style: {
          borderColor: '#0c8ce9'
        },
        startPoint: { x: 240, y: 130 },
        endPoint: { x: 340, y: 130 }
      }
    ]
  },
  {
    id: 'project-2',
    name: 'Personal Flowchart',
    category: 'Loom Diagrams',
    updatedAt: Date.now() - 3600000,
    nodes: []
  },
  {
    id: 'project-3',
    name: 'Personal Wireframe',
    category: 'Website Wireframes',
    updatedAt: Date.now() - 86400000,
    nodes: []
  }
];

export function DiagramProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [activeProjectId, setActiveProjectId] = useState<string>('project-1');
  const [nodes, setNodesState] = useState<DiagramNode[]>(initialProjects[0].nodes);
  const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);
  const [zoom, setZoom] = useState<number>(1.0);
  const [activeTool, setActiveTool] = useState<string>('select');
  const [selectToolMode, setSelectToolMode] = useState<'move' | 'scale'>('move');
  
  // History stack states
  const [past, setPast] = useState<DiagramNode[][]>([]);
  const [future, setFuture] = useState<DiagramNode[][]>([]);
  
  // Clipboard state
  const [clipboard, setClipboard] = useState<DiagramNode[]>([]);

  // Sidebar open/close state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);

  // Theme state initialization with persistence and system preference
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const savedTheme = localStorage.getItem('loom-theme') as 'light' | 'dark';
    if (savedTheme) return savedTheme;
    
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const toggleTheme = () => {
    setTheme(prev => {
      const nextTheme = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('loom-theme', nextTheme);
      document.documentElement.setAttribute('data-theme', nextTheme);
      return nextTheme;
    });
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('loom-theme', theme);
  }, [theme]);

  // Synced setNodes state wrapper
  const setNodes = (newNodes: DiagramNode[] | ((prev: DiagramNode[]) => DiagramNode[])) => {
    setNodesState(prev => {
      const resolvedNodes = typeof newNodes === 'function' ? newNodes(prev) : newNodes;
      
      // Update projects array and last modified timestamp synchronously
      setProjects(prevProjects => 
        prevProjects.map(p => 
          p.id === activeProjectId 
            ? { ...p, nodes: resolvedNodes, updatedAt: Date.now() } 
            : p
        )
      );
      
      return resolvedNodes;
    });
  };

  // Save specific nodes list to history
  const saveHistoryState = (customNodes: DiagramNode[]) => {
    setPast(prev => [...prev, customNodes]);
    setFuture([]);
  };

  const undo = () => {
    if (past.length === 0) return;
    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);
    
    setFuture(prev => [nodes, ...prev]);
    setNodesState(previous);
    setPast(newPast);
    
    // Sync change back to active project
    setProjects(prevProjects => 
      prevProjects.map(p => 
        p.id === activeProjectId 
          ? { ...p, nodes: previous, updatedAt: Date.now() } 
          : p
      )
    );
  };

  const redo = () => {
    if (future.length === 0) return;
    const next = future[0];
    const newFuture = future.slice(1);
    
    setPast(prev => [...prev, nodes]);
    setNodesState(next);
    setFuture(newFuture);
    
    // Sync change back to active project
    setProjects(prevProjects => 
      prevProjects.map(p => 
        p.id === activeProjectId 
          ? { ...p, nodes: next, updatedAt: Date.now() } 
          : p
      )
    );
  };

  const copySelected = () => {
    if (selectedNodeIds.length === 0) return;
    const selectedNodes = nodes.filter(node => selectedNodeIds.includes(node.id));
    setClipboard(selectedNodes);
  };

  const cutSelected = () => {
    if (selectedNodeIds.length === 0) return;
    saveHistoryState(nodes);
    const selectedNodes = nodes.filter(node => selectedNodeIds.includes(node.id));
    setClipboard(selectedNodes);
    setNodes(prev => prev.filter(node => !selectedNodeIds.includes(node.id)));
    setSelectedNodeIds([]);
  };

  const deleteSelected = () => {
    if (selectedNodeIds.length === 0) return;
    saveHistoryState(nodes);
    setNodes(prev => prev.filter(node => !selectedNodeIds.includes(node.id)));
    setSelectedNodeIds([]);
  };

  const pasteSelected = () => {
    if (clipboard.length === 0) return;
    saveHistoryState(nodes);
    
    const newNodes = clipboard.map(node => {
      const newId = crypto.randomUUID().split('-')[0];
      const offsetPos = {
        x: node.position.x + 20,
        y: node.position.y + 20
      };
      
      const extra: Partial<DiagramNode> = {};
      if (node.startPoint && node.endPoint) {
        extra.startPoint = {
          x: node.startPoint.x + 20,
          y: node.startPoint.y + 20
        };
        extra.endPoint = {
          x: node.endPoint.x + 20,
          y: node.endPoint.y + 20
        };
      }
      
      return {
        ...node,
        id: newId,
        position: offsetPos,
        ...extra
      };
    });
    
    setNodes(prev => [...prev, ...newNodes]);
    setSelectedNodeIds(newNodes.map(n => n.id));
    setClipboard(newNodes);
  };

  const addBox = (position?: { x: number; y: number }) => {
    saveHistoryState(nodes);
    const width = 150;
    const height = 100;
    const newNode: DiagramNode = {
      id: crypto.randomUUID().split('-')[0],
      type: 'box',
      position: position ? { x: position.x - width / 2, y: position.y - height / 2 } : { x: 50, y: 50 },
      dimensions: { width, height },
      content: 'New Box',
      style: {
        backgroundColor: '#2c2c2c',
        borderColor: '#555555',
        color: '#e3e3e3'
      }
    };
    setNodes((prev) => [...prev, newNode]);
  };

  const addDiamond = (position?: { x: number; y: number }) => {
    saveHistoryState(nodes);
    const width = 120;
    const height = 120;
    const newNode: DiagramNode = {
      id: crypto.randomUUID().split('-')[0],
      type: 'diamond',
      position: position ? { x: position.x - width / 2, y: position.y - height / 2 } : { x: 80, y: 80 },
      dimensions: { width, height },
      content: 'New Diamond',
      style: {
        backgroundColor: '#2e2c24',
        borderColor: '#c69c3a',
        color: '#e3e3e3',
        borderRadius: '2px'
      }
    };
    setNodes((prev) => [...prev, newNode]);
  };

  const addCircle = (position?: { x: number; y: number }) => {
    saveHistoryState(nodes);
    const width = 100;
    const height = 100;
    const newNode: DiagramNode = {
      id: crypto.randomUUID().split('-')[0],
      type: 'circle',
      position: position ? { x: position.x - width / 2, y: position.y - height / 2 } : { x: 100, y: 100 },
      dimensions: { width, height },
      content: 'New Circle',
      style: {
        backgroundColor: '#2c2c2c',
        borderColor: '#555555',
        color: '#e3e3e3'
      }
    };
    setNodes((prev) => [...prev, newNode]);
  };

  const addTriangle = (position?: { x: number; y: number }) => {
    saveHistoryState(nodes);
    const width = 120;
    const height = 100;
    const newNode: DiagramNode = {
      id: crypto.randomUUID().split('-')[0],
      type: 'triangle',
      position: position ? { x: position.x - width / 2, y: position.y - height / 2 } : { x: 120, y: 120 },
      dimensions: { width, height },
      content: 'New Triangle',
      style: {
        backgroundColor: '#1c2e24',
        borderColor: '#2b8a4e',
        color: '#e3e3e3'
      }
    };
    setNodes((prev) => [...prev, newNode]);
  };

  const addStar = (position?: { x: number; y: number }) => {
    saveHistoryState(nodes);
    const width = 110;
    const height = 110;
    const newNode: DiagramNode = {
      id: crypto.randomUUID().split('-')[0],
      type: 'star',
      position: position ? { x: position.x - width / 2, y: position.y - height / 2 } : { x: 150, y: 150 },
      dimensions: { width, height },
      content: 'New Star',
      style: {
        backgroundColor: '#38301b',
        borderColor: '#9e7c1d',
        color: '#e3e3e3'
      }
    };
    setNodes((prev) => [...prev, newNode]);
  };

  const addLine = (position?: { x: number; y: number }) => {
    saveHistoryState(nodes);
    const width = 200;
    const height = 20;
    const startX = position ? position.x - width / 2 : 150;
    const startY = position ? position.y - height / 2 : 150;
    const newNode: DiagramNode = {
      id: crypto.randomUUID().split('-')[0],
      type: 'line',
      position: { x: startX, y: startY },
      dimensions: { width, height },
      content: '',
      style: {
        borderColor: '#888888',
      },
      startPoint: { x: startX, y: startY + 10 },
      endPoint: { x: startX + width, y: startY + 10 }
    };
    setNodes((prev) => [...prev, newNode]);
  };

  const addArrow = (position?: { x: number; y: number }) => {
    saveHistoryState(nodes);
    const width = 200;
    const height = 20;
    const startX = position ? position.x - width / 2 : 150;
    const startY = position ? position.y - height / 2 : 200;
    const newNode: DiagramNode = {
      id: crypto.randomUUID().split('-')[0],
      type: 'arrow',
      position: { x: startX, y: startY },
      dimensions: { width, height },
      content: '',
      style: {
        borderColor: '#0c8ce9',
      },
      startPoint: { x: startX, y: startY + 10 },
      endPoint: { x: startX + width, y: startY + 10 }
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
    saveHistoryState(nodes);
    setNodes((prev) => prev.map(node => node.id === updatedNode.id ? updatedNode : node));
  };

  const updateMultipleNodes = (ids: string[], updates: Partial<DiagramNode>) => {
    saveHistoryState(nodes);
    setNodes((prev) => prev.map(node => {
      if (ids.includes(node.id)) {
        const newStyle = updates.style 
          ? { ...node.style, ...updates.style } 
          : node.style;
        return {
          ...node,
          ...updates,
          style: newStyle
        } as DiagramNode;
      }
      return node;
    }));
  };

  const moveNode = (id: string, position: { x: number; y: number }) => {
    saveHistoryState(nodes);
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

  const moveSelectedNodes = (draggedNodeId: string, position: { x: number; y: number }) => {
    saveHistoryState(nodes);
    setNodes((prev) => {
      const draggedNode = prev.find(n => n.id === draggedNodeId);
      if (!draggedNode) return prev;

      const dx = position.x - draggedNode.position.x;
      const dy = position.y - draggedNode.position.y;

      if (dx === 0 && dy === 0) return prev;

      return prev.map(node => {
        if (selectedNodeIds.includes(node.id)) {
          if (node.id === draggedNodeId) {
            if (node.startPoint && node.endPoint) {
              return {
                ...node,
                position,
                startPoint: { x: node.startPoint.x + dx, y: node.startPoint.y + dy },
                endPoint: { x: node.endPoint.x + dx, y: node.endPoint.y + dy }
              };
            }
            return { ...node, position };
          } else {
            const newPos = { x: node.position.x + dx, y: node.position.y + dy };
            if (node.startPoint && node.endPoint) {
              return {
                ...node,
                position: newPos,
                startPoint: { x: node.startPoint.x + dx, y: node.startPoint.y + dy },
                endPoint: { x: node.endPoint.x + dx, y: node.endPoint.y + dy }
              };
            }
            return { ...node, position: newPos };
          }
        }
        return node;
      });
    });
  };

  const resizeNode = (
    id: string, 
    dimensions: { width: number; height: number }, 
    position: { x: number; y: number }
  ) => {
    saveHistoryState(nodes);
    setNodes((prev) => prev.map(node => 
      node.id === id ? { ...node, dimensions, position } : node
    ));
  };

  const selectNode = (id: string | null, multi?: boolean) => {
    if (id === null) {
      setSelectedNodeIds([]);
    } else if (multi) {
      setSelectedNodeIds(prev => 
        prev.includes(id) 
          ? prev.filter(item => item !== id) 
          : [...prev, id]
      );
    } else {
      setSelectedNodeIds([id]);
    }
  };

  const bringToFront = (ids: string[]) => {
    saveHistoryState(nodes);
    setNodes((prev) => {
      const selected = prev.filter((node) => ids.includes(node.id));
      const unselected = prev.filter((node) => !ids.includes(node.id));
      return [...unselected, ...selected];
    });
  };

  const sendToBack = (ids: string[]) => {
    saveHistoryState(nodes);
    setNodes((prev) => {
      const selected = prev.filter((node) => ids.includes(node.id));
      const unselected = prev.filter((node) => !ids.includes(node.id));
      return [...selected, ...unselected];
    });
  };

  const alignSelected = (alignmentType: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => {
    if (selectedNodeIds.length === 0) return;

    saveHistoryState(nodes);
    setNodes((prev) => {
      const selectedNodes = prev.filter(n => selectedNodeIds.includes(n.id) && n.type !== 'line' && n.type !== 'arrow');
      if (selectedNodes.length === 0) return prev;

      if (selectedNodes.length === 1) {
        const node = selectedNodes[0];
        const canvasWidth = 1000;
        const canvasHeight = 800;
        let newX = node.position.x;
        let newY = node.position.y;

        switch (alignmentType) {
          case 'left':
            newX = 0;
            break;
          case 'right':
            newX = canvasWidth - node.dimensions.width;
            break;
          case 'center':
            newX = (canvasWidth - node.dimensions.width) / 2;
            break;
          case 'top':
            newY = 0;
            break;
          case 'bottom':
            newY = canvasHeight - node.dimensions.height;
            break;
          case 'middle':
            newY = (canvasHeight - node.dimensions.height) / 2;
            break;
        }

        return prev.map(n => n.id === node.id ? { ...n, position: { x: newX, y: newY } } : n);
      }

      const lefts = selectedNodes.map(n => n.position.x);
      const rights = selectedNodes.map(n => n.position.x + n.dimensions.width);
      const tops = selectedNodes.map(n => n.position.y);
      const bottoms = selectedNodes.map(n => n.position.y + n.dimensions.height);

      const minX = Math.min(...lefts);
      const maxX = Math.max(...rights);
      const minY = Math.min(...tops);
      const maxY = Math.max(...bottoms);

      const targetCenterX = minX + (maxX - minX) / 2;
      const targetCenterY = minY + (maxY - minY) / 2;

      return prev.map(node => {
        if (!selectedNodeIds.includes(node.id) || node.type === 'line' || node.type === 'arrow') return node;

        let newX = node.position.x;
        let newY = node.position.y;

        switch (alignmentType) {
          case 'left':
            newX = minX;
            break;
          case 'right':
            newX = maxX - node.dimensions.width;
            break;
          case 'center':
            newX = targetCenterX - node.dimensions.width / 2;
            break;
          case 'top':
            newY = minY;
            break;
          case 'bottom':
            newY = maxY - node.dimensions.height;
            break;
          case 'middle':
            newY = targetCenterY - node.dimensions.height / 2;
            break;
        }

        return {
          ...node,
          position: { x: newX, y: newY }
        };
      });
    });
  };

  const switchProject = (targetId: string) => {
    const target = projects.find(p => p.id === targetId);
    setNodesState(target ? target.nodes : []);
    setSelectedNodeIds([]);
    setActiveProjectId(targetId);
    setPast([]);
    setFuture([]);
  };

  const addProject = (name: string, category: string = 'Loom Diagrams') => {
    const newId = crypto.randomUUID().split('-')[0];
    const newProj: Project = {
      id: newId,
      name,
      category,
      updatedAt: Date.now(),
      nodes: []
    };
    
    setProjects(prev => [...prev, newProj]);
    setNodesState([]);
    setSelectedNodeIds([]);
    setActiveProjectId(newId);
    setPast([]);
    setFuture([]);
  };

  return (
    <DiagramContext.Provider value={{ 
      nodes, 
      selectedNodeIds, 
      addBox, 
      addDiamond, 
      addCircle, 
      addTriangle, 
      addStar,
      addLine, 
      addArrow, 
      updateLinePoints, 
      updateNode, 
      updateMultipleNodes,
      moveNode, 
      moveSelectedNodes,
      resizeNode, 
      selectNode, 
      setSelectedNodeIds,
      setNodes,
      bringToFront,
      sendToBack,
      alignSelected,
      zoom,
      setZoom,
      activeTool,
      setActiveTool,
      selectToolMode,
      setSelectToolMode,
      projects,
      activeProjectId,
      switchProject,
      addProject,
      
      // Sidebar
      isSidebarOpen,
      toggleSidebar,
      
      // History
      undo,
      redo,
      canUndo: past.length > 0,
      canRedo: future.length > 0,
      saveHistoryState,
      
      // Clipboard
      copySelected,
      pasteSelected,
      cutSelected,
      deleteSelected,

      // Theme
      theme,
      toggleTheme
    }}>
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
