import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { ReactNode } from 'react';
import type { DiagramNode } from '@/types';
import { useDebounce } from '@/hooks/useDebounce';
import { useAuth } from './AuthContext';
import { useCollaboration } from './CollaborationContext';

export interface CanvasConfig {
  backgroundColor: string;
}

export interface DiagramFile {
  id: string;
  name: string;
  nodes: DiagramNode[];
  canvasConfig: CanvasConfig;
  updatedAt: number;
}

export interface WorkspaceProject {
  id: string;
  name: string;
  category: string;
  files: DiagramFile[];
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
  addPill: (position?: { x: number; y: number }) => void;
  addHexagon: (position?: { x: number; y: number }) => void;
  addParallelogram: (position?: { x: number; y: number }) => void;
  addDatabase: (position?: { x: number; y: number }) => void;
  addNote: (position?: { x: number; y: number }) => void;
  addLine: (position?: { x: number; y: number }) => void;
  addArrow: (position?: { x: number; y: number }) => void;
  addCustomBlock: (position?: { x: number; y: number }) => void;
  addCustomConnector: (position?: { x: number; y: number }) => void;
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
  projects: WorkspaceProject[];
  activeProjectId: string;
  activeFileId: string;
  switchProject: (id: string) => void;
  addProject: (name: string, category?: string, backgroundColor?: string) => void;
  switchFile: (id: string) => void;
  addFile: (projectId: string, name: string, backgroundColor?: string) => void;
  updateCanvasConfig: (fileId: string, config: Partial<CanvasConfig>) => void;
  isLoadingProjects: boolean;
  
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

const initialProjects: WorkspaceProject[] = [
  {
    id: 'project-1',
    name: 'Loom Diagram',
    category: 'Loom Diagrams',
    updatedAt: Date.now(),
    files: [
      {
        id: 'file-1',
        name: 'Main Canvas',
        updatedAt: Date.now(),
        canvasConfig: { backgroundColor: '#0f0f0f' },
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
      }
    ]
  },
  {
    id: 'project-2',
    name: 'Personal Flowchart',
    category: 'Loom Diagrams',
    updatedAt: Date.now() - 3600000,
    files: [
      {
        id: 'file-2',
        name: 'Untitled',
        updatedAt: Date.now() - 3600000,
        canvasConfig: { backgroundColor: '#0f0f0f' },
        nodes: []
      }
    ]
  },
  {
    id: 'project-3',
    name: 'Personal Wireframe',
    category: 'Website Wireframes',
    updatedAt: Date.now() - 86400000,
    files: []
  }
];

export function DiagramProvider({ children }: { children: ReactNode }) {
  const { isGuest } = useAuth();
  const [projects, setProjects] = useState<WorkspaceProject[]>(initialProjects);
  const [activeProjectId, setActiveProjectId] = useState<string>('project-1');
  const [activeFileId, setActiveFileId] = useState<string>('file-1');
  const [nodes, setNodesState] = useState<DiagramNode[]>(initialProjects[0].files[0].nodes);
  const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);
  const [zoom, setZoom] = useState<number>(1.0);
  const [activeTool, setActiveTool] = useState<string>('select');
  const [selectToolMode, setSelectToolMode] = useState<'move' | 'scale'>('move');
  const [isLoadingProjects, setIsLoadingProjects] = useState<boolean>(true);
  
  const { connectToFile, broadcast, incomingActions, clearIncomingActions } = useCollaboration();

  // Connect to WebSocket room for this file
  useEffect(() => {
    connectToFile(activeFileId);
  }, [activeFileId, connectToFile]);

  // Process incoming WebSocket actions
  useEffect(() => {
    if (incomingActions.length > 0) {
      setNodesState(prev => {
        let next = [...prev];
        incomingActions.forEach(action => {
          if (action.type === 'NODE_MOVED') {
            next = next.map(node => node.id === action.payload.id ? { ...node, position: action.payload.position, startPoint: action.payload.startPoint, endPoint: action.payload.endPoint } : node);
          } else if (action.type === 'NODE_ADDED') {
            next.push(action.payload);
          } else if (action.type === 'NODE_UPDATED') {
            next = next.map(node => node.id === action.payload.id ? { ...node, ...action.payload } : node);
          } else if (action.type === 'NODES_DELETED') {
            const idsToDelete = action.payload.ids as string[];
            next = next.filter(node => !idsToDelete.includes(node.id));
          }
        });
        return next;
      });
      clearIncomingActions();
    }
  }, [incomingActions, clearIncomingActions]);

  // Simulate network fetch for projects
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoadingProjects(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);
  
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
    setNodesState(newNodes);
  };

  // Sync nodes state to projects array whenever nodes change
  useEffect(() => {
    setProjects(prevProjects => 
      prevProjects.map(p => {
        if (p.id === activeProjectId) {
          const updatedFiles = p.files.map(f => 
            f.id === activeFileId ? { ...f, nodes, updatedAt: Date.now() } : f
          );
          return { ...p, files: updatedFiles, updatedAt: Date.now() };
        }
        return p;
      })
    );
  }, [nodes, activeProjectId, activeFileId]);

  // Auto-save mechanism with 1000ms debounce
  const debouncedNodes = useDebounce(nodes, 1000);
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // This prevents saving on project switch unless it's an actual node change
    if (!activeFileId) return;

    // Guest Mode API Guard (Resolves Issue #3)
    if (isGuest) {
      // Guest mode - skip saving to backend
      return;
    }

    const autoSave = async () => {
      try {
        // Uncomment/Update this when the backend API is fully integrated in frontend
        /*
        const loomApiUrl = import.meta.env.VITE_LOOM_API_URL || 'http://localhost:8081';
        const response = await fetch(`${loomApiUrl}/api/files/${activeFileId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nodes: debouncedNodes })
        });
        
        if (!response.ok) {
          console.error('Auto-save failed:', response.statusText);
        }
        */
      } catch (error) {
        console.error('Failed to auto-save to backend:', error);
      }
    };

    autoSave();
  }, [debouncedNodes, activeFileId, isGuest]);

  // Save specific nodes list to history
  const saveHistoryState = useCallback((customNodes: DiagramNode[]) => {
    setPast(prev => [...prev, [...customNodes]]);
    setFuture([]);
  }, []);

  const undo = useCallback(() => {
    if (past.length === 0) return;
    
    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);
    
    setFuture(prev => [[...nodes], ...prev]);
    setNodesState([...previous]);
    setPast(newPast);
  }, [past, nodes, activeProjectId]);

  const redo = useCallback(() => {
    if (future.length === 0) return;
    
    const next = future[0];
    const newFuture = future.slice(1);
    
    setPast(prev => [...prev, [...nodes]]);
    setNodesState([...next]);
    setFuture(newFuture);
  }, [future, nodes, activeProjectId]);

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
    broadcast('NODES_DELETED', { ids: selectedNodeIds });
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
    broadcast('NODE_ADDED', newNode);
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
    broadcast('NODE_ADDED', newNode);
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
    broadcast('NODE_ADDED', newNode);
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

  const addPill = (position?: { x: number; y: number }) => {
    saveHistoryState(nodes);
    const width = 150;
    const height = 60;
    const newNode: DiagramNode = {
      id: crypto.randomUUID().split('-')[0],
      type: 'pill',
      position: position ? { x: position.x - width / 2, y: position.y - height / 2 } : { x: 50, y: 250 },
      dimensions: { width, height },
      content: 'New Pill',
      style: {
        backgroundColor: '#2c2c2c',
        borderColor: '#555555',
        color: '#e3e3e3',
        borderRadius: '30px'
      }
    };
    setNodes((prev) => [...prev, newNode]);
  };

  const addHexagon = (position?: { x: number; y: number }) => {
    saveHistoryState(nodes);
    const width = 120;
    const height = 100;
    const newNode: DiagramNode = {
      id: crypto.randomUUID().split('-')[0],
      type: 'hexagon',
      position: position ? { x: position.x - width / 2, y: position.y - height / 2 } : { x: 150, y: 250 },
      dimensions: { width, height },
      content: 'New Hexagon',
      style: {
        backgroundColor: '#2e2438',
        borderColor: '#824ea0',
        color: '#e3e3e3'
      }
    };
    setNodes((prev) => [...prev, newNode]);
  };

  const addParallelogram = (position?: { x: number; y: number }) => {
    saveHistoryState(nodes);
    const width = 150;
    const height = 100;
    const newNode: DiagramNode = {
      id: crypto.randomUUID().split('-')[0],
      type: 'parallelogram',
      position: position ? { x: position.x - width / 2, y: position.y - height / 2 } : { x: 250, y: 250 },
      dimensions: { width, height },
      content: 'New Parallelogram',
      style: {
        backgroundColor: '#242e38',
        borderColor: '#4e82a0',
        color: '#e3e3e3'
      }
    };
    setNodes((prev) => [...prev, newNode]);
  };

  const addDatabase = (position?: { x: number; y: number }) => {
    saveHistoryState(nodes);
    const width = 100;
    const height = 120;
    const newNode: DiagramNode = {
      id: crypto.randomUUID().split('-')[0],
      type: 'database',
      position: position ? { x: position.x - width / 2, y: position.y - height / 2 } : { x: 350, y: 250 },
      dimensions: { width, height },
      content: 'New DB',
      style: {
        backgroundColor: '#382424',
        borderColor: '#a04e4e',
        color: '#e3e3e3'
      }
    };
    setNodes((prev) => [...prev, newNode]);
  };

  const addNote = (position?: { x: number; y: number }) => {
    saveHistoryState(nodes);
    const width = 140;
    const height = 140;
    const newNode: DiagramNode = {
      id: crypto.randomUUID().split('-')[0],
      type: 'note',
      position: position ? { x: position.x - width / 2, y: position.y - height / 2 } : { x: 450, y: 250 },
      dimensions: { width, height },
      content: 'New Note',
      style: {
        backgroundColor: '#fef3c7',
        borderColor: '#f59e0b',
        color: '#92400e',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
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

  const addCustomBlock = (position?: { x: number; y: number }) => {
    saveHistoryState(nodes);
    const width = 160;
    const height = 120;
    const newNode: DiagramNode = {
      id: crypto.randomUUID().split('-')[0],
      type: 'custom-block',
      position: position ? { x: position.x - width / 2, y: position.y - height / 2 } : { x: 100, y: 100 },
      dimensions: { width, height },
      content: '',
      style: {
        background: 'linear-gradient(135deg, #667eea, #764ba2)',
        clipPath: 'polygon(0% 15%, 15% 15%, 15% 0%, 85% 0%, 85% 15%, 100% 15%, 100% 85%, 85% 85%, 85% 100%, 15% 100%, 15% 85%, 0% 85%)',
        color: '#ffffff',
        borderWidth: '0px',
        opacity: '0.9'
      }
    };
    setNodes((prev) => [...prev, newNode]);
  };

  const addCustomConnector = (position?: { x: number; y: number }) => {
    saveHistoryState(nodes);
    const width = 200;
    const height = 20;
    const startX = position ? position.x - width / 2 : 150;
    const startY = position ? position.y - height / 2 : 200;
    const newNode: DiagramNode = {
      id: crypto.randomUUID().split('-')[0],
      type: 'custom-connector',
      position: { x: startX, y: startY },
      dimensions: { width, height },
      content: '',
      style: {
        borderColor: '#e74c3c',
        borderStyle: 'dashed',
        borderWidth: '2px',
        opacity: '0.8'
      },
      startPoint: { x: startX, y: startY + 10 },
      endPoint: { x: startX + width, y: startY + 10 },
      customConnectorStyle: {
        borderBottomColor: '#e74c3c',
        borderWidth: '12px'
      }
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
    broadcast('NODE_UPDATED', updatedNode);
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
    setNodes((prev) => {
      const updatedNodes = prev.map(node => {
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
      });

      // Update any lines/arrows connected to this node
      return updatedNodes.map(node => {
        if ((node.type === 'line' || node.type === 'arrow') && (node.startConnection?.nodeId === id || node.endConnection?.nodeId === id)) {
          const newNode = { ...node };
          const movedNode = updatedNodes.find(n => n.id === id)!;

          if (node.startConnection?.nodeId === id) {
            newNode.startPoint = getAnchorPoint(movedNode, node.startConnection.anchor);
          }
          if (node.endConnection?.nodeId === id) {
            newNode.endPoint = getAnchorPoint(movedNode, node.endConnection.anchor);
          }

          // Recalculate bounding box for the line
          const minX = Math.min(newNode.startPoint!.x, newNode.endPoint!.x);
          const minY = Math.min(newNode.startPoint!.y, newNode.endPoint!.y);
          const width = Math.max(15, Math.abs(newNode.endPoint!.x - newNode.startPoint!.x));
          const height = Math.max(15, Math.abs(newNode.endPoint!.y - newNode.startPoint!.y));
          
          newNode.position = { x: minX, y: minY };
          newNode.dimensions = { width, height };
          broadcast('NODE_UPDATED', newNode);
          return newNode;
        }
        return node;
      });
    });
    
    // Broadcast the main node move
    const finalNodes = nodes;
    const nodeToBroadcast = finalNodes.find(n => n.id === id);
    if (nodeToBroadcast) {
        broadcast('NODE_MOVED', { 
            id, 
            position, 
            startPoint: nodeToBroadcast.startPoint, 
            endPoint: nodeToBroadcast.endPoint 
        });
    }
  };

  const getAnchorPoint = (node: DiagramNode, anchor: 'top' | 'bottom' | 'left' | 'right') => {
    const { x, y } = node.position;
    const { width, height } = node.dimensions;
    switch (anchor) {
      case 'top': return { x: x + width / 2, y };
      case 'bottom': return { x: x + width / 2, y: y + height };
      case 'left': return { x, y: y + height / 2 };
      case 'right': return { x: x + width, y: y + height / 2 };
    }
  };

  const moveSelectedNodes = (draggedNodeId: string, position: { x: number; y: number }) => {
    saveHistoryState(nodes);
    setNodes((prev) => {
      const draggedNode = prev.find(n => n.id === draggedNodeId);
      if (!draggedNode) return prev;

      const dx = position.x - draggedNode.position.x;
      const dy = position.y - draggedNode.position.y;

      if (dx === 0 && dy === 0) return prev;

      const movedIds = selectedNodeIds;
      const updatedNodes = prev.map(node => {
        if (movedIds.includes(node.id)) {
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
        return node;
      });

      // Update lines connected to moved nodes (if the line itself isn't being moved)
      return updatedNodes.map(node => {
        const isLine = node.type === 'line' || node.type === 'arrow';
        if (isLine && !movedIds.includes(node.id)) {
          let needsUpdate = false;
          const newNode = { ...node };

          if (node.startConnection && movedIds.includes(node.startConnection.nodeId)) {
            const connectedNode = updatedNodes.find(n => n.id === node.startConnection!.nodeId)!;
            newNode.startPoint = getAnchorPoint(connectedNode, node.startConnection.anchor);
            needsUpdate = true;
          }
          if (node.endConnection && movedIds.includes(node.endConnection.nodeId)) {
            const connectedNode = updatedNodes.find(n => n.id === node.endConnection!.nodeId)!;
            newNode.endPoint = getAnchorPoint(connectedNode, node.endConnection.anchor);
            needsUpdate = true;
          }

          if (needsUpdate) {
            const minX = Math.min(newNode.startPoint!.x, newNode.endPoint!.x);
            const minY = Math.min(newNode.startPoint!.y, newNode.endPoint!.y);
            newNode.position = { x: minX, y: minY };
            newNode.dimensions = { 
              width: Math.max(15, Math.abs(newNode.endPoint!.x - newNode.startPoint!.x)), 
              height: Math.max(15, Math.abs(newNode.endPoint!.y - newNode.startPoint!.y)) 
            };
            return newNode;
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
    if (!target) return;
    
    let targetFile = target.files.length > 0 ? target.files[0] : null;
    
    // Auto-create a file if the project is somehow empty (edge case recovery)
    if (!targetFile) {
      const newFileId = crypto.randomUUID().split('-')[0];
      targetFile = {
        id: newFileId,
        name: 'Untitled',
        updatedAt: Date.now(),
        canvasConfig: { backgroundColor: '#0f0f0f' },
        nodes: []
      };
      
      // Update projects array to include this new file
      setProjects(prev => prev.map(p => 
        p.id === targetId ? { ...p, files: [targetFile!] } : p
      ));
    }
    
    setNodesState(targetFile.nodes);
    setSelectedNodeIds([]);
    setActiveProjectId(targetId);
    setActiveFileId(targetFile.id);
    setPast([]);
    setFuture([]);
  };

  const addProject = (name: string, category: string = 'Loom Diagrams', backgroundColor: string = '#0f0f0f') => {
    const newId = crypto.randomUUID().split('-')[0];
    const newFileId = crypto.randomUUID().split('-')[0];
    
    const newProj: WorkspaceProject = {
      id: newId,
      name,
      category,
      updatedAt: Date.now(),
      files: [
        {
          id: newFileId,
          name: 'Untitled',
          updatedAt: Date.now(),
          canvasConfig: { backgroundColor },
          nodes: []
        }
      ]
    };
    
    setProjects(prev => [...prev, newProj]);
    setNodesState([]);
    setSelectedNodeIds([]);
    setActiveProjectId(newId);
    setActiveFileId(newFileId);
    setPast([]);
    setFuture([]);
  };

  const switchFile = (fileId: string) => {
    const targetProj = projects.find(p => p.id === activeProjectId);
    if (!targetProj) return;
    const targetFile = targetProj.files.find(f => f.id === fileId);
    if (!targetFile) return;

    setNodesState(targetFile.nodes);
    setSelectedNodeIds([]);
    setActiveFileId(fileId);
    setPast([]);
    setFuture([]);
  };

  const addFile = (projectId: string, name: string, backgroundColor: string = '#0f0f0f') => {
    const newFileId = crypto.randomUUID().split('-')[0];
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          files: [
            ...p.files,
            {
              id: newFileId,
              name,
              updatedAt: Date.now(),
              canvasConfig: { backgroundColor },
              nodes: []
            }
          ]
        };
      }
      return p;
    }));
    
    if (projectId === activeProjectId) {
      switchFile(newFileId);
    }
  };

  const updateCanvasConfig = (fileId: string, config: Partial<CanvasConfig>) => {
    setProjects(prev => prev.map(p => {
      if (p.id === activeProjectId) {
        return {
          ...p,
          files: p.files.map(f => f.id === fileId ? { ...f, canvasConfig: { ...f.canvasConfig, ...config } } : f)
        };
      }
      return p;
    }));
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
      addPill,
      addHexagon,
      addParallelogram,
      addDatabase,
      addNote,
      addLine,
      addArrow, 
      addCustomBlock,
      addCustomConnector,
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
      activeFileId,
      switchProject,
      addProject,
      switchFile,
      addFile,
      updateCanvasConfig,
      isLoadingProjects,
      
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
