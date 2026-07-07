import { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Sparkles, 
  History, 
  Palette, 
  Sun, 
  Moon, 
  Workflow, 
  LayoutTemplate, 
  Cpu, 
  Maximize2, 
  Trash2, 
  X,
  Plus,
  Minus
} from 'lucide-react';
import styles from './CommandPalette.module.css';
import { useDiagram } from '@/context/DiagramContext';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  // Let's allow App.tsx to pass hooks for toggling sidebars if needed
  setIsLeftSidebarPinned: (pinned: boolean) => void;
  setActiveLeftTab: (tab: 'layers' | 'shapes' | 'templates') => void;
}

interface CommandItem {
  id: string;
  name: string;
  category: 'View & Navigation' | 'Templates' | 'Actions';
  icon: React.ComponentType<any>;
  shortcut?: string;
  action: () => void;
}

export function CommandPalette({ 
  isOpen, 
  onClose,
  setIsLeftSidebarPinned,
  setActiveLeftTab
}: CommandPaletteProps) {
  const { 
    theme, 
    toggleTheme, 
    toggleAiChat, 
    toggleVersionHistory, 
    toggleDesignPanel, 
    zoom, 
    setZoom, 
    nodes, 
    setNodes, 
    setSelectedNodeIds,
    saveHistoryState 
  } = useDiagram();

  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Command items declaration
  const commands: CommandItem[] = [
    // Navigation / View
    {
      id: 'open-layers',
      name: 'Open Layers Panel',
      category: 'View & Navigation',
      icon: LayoutTemplate,
      action: () => {
        setIsLeftSidebarPinned(true);
        setActiveLeftTab('layers');
      }
    },
    {
      id: 'open-shapes',
      name: 'Open Shapes Selector',
      category: 'View & Navigation',
      icon: LayoutTemplate,
      action: () => {
        setIsLeftSidebarPinned(true);
        setActiveLeftTab('shapes');
      }
    },
    {
      id: 'open-templates',
      name: 'Open Prebuilt Templates',
      category: 'View & Navigation',
      icon: LayoutTemplate,
      action: () => {
        setIsLeftSidebarPinned(true);
        setActiveLeftTab('templates');
      }
    },
    {
      id: 'toggle-ai-chat',
      name: 'Toggle AI Chat Assistant',
      category: 'View & Navigation',
      icon: Sparkles,
      shortcut: 'Ctrl + Alt + A',
      action: () => toggleAiChat()
    },
    {
      id: 'toggle-version-history',
      name: 'Toggle Version History Snapshots',
      category: 'View & Navigation',
      icon: History,
      action: () => toggleVersionHistory()
    },
    {
      id: 'toggle-design-panel',
      name: 'Toggle Inspector Design Panel',
      category: 'View & Navigation',
      icon: Palette,
      action: () => toggleDesignPanel()
    },
    {
      id: 'toggle-theme',
      name: `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Theme`,
      category: 'View & Navigation',
      icon: theme === 'dark' ? Sun : Moon,
      action: () => toggleTheme()
    },

    // Templates
    {
      id: 'load-auth-flow',
      name: 'Load User Authentication Flowchart',
      category: 'Templates',
      icon: Workflow,
      action: () => {
        const templateNodes: any[] = [
          { id: 'start', type: 'terminator', content: 'Start', position: { x: 250, y: 50 }, dimensions: { width: 100, height: 45 }, style: { backgroundColor: '#10b981', color: '#fff', borderColor: '#059669', strokeWidth: 1 } },
          { id: 'login', type: 'process', content: 'Login Page', position: { x: 230, y: 140 }, dimensions: { width: 140, height: 60 }, style: { backgroundColor: '#1e293b', color: '#fff', borderColor: '#334155', strokeWidth: 1 } },
          { id: 'decision', type: 'decision-merge', content: 'Credentials\nValid?', position: { x: 240, y: 250 }, dimensions: { width: 120, height: 90 }, style: { backgroundColor: '#d97706', color: '#fff', borderColor: '#b45309', strokeWidth: 1 } },
          { id: 'dashboard', type: 'process', content: 'Dashboard', position: { x: 120, y: 400 }, dimensions: { width: 120, height: 60 }, style: { backgroundColor: '#0c8ce9', color: '#fff', borderColor: '#0284c7', strokeWidth: 1 } },
          { id: 'error', type: 'process', content: 'Show Error', position: { x: 360, y: 400 }, dimensions: { width: 120, height: 60 }, style: { backgroundColor: '#ef4444', color: '#fff', borderColor: '#dc2626', strokeWidth: 1 } },
          { id: 'conn1', type: 'arrow', startConnection: { nodeId: 'start', anchor: 'bottom' }, endConnection: { nodeId: 'login', anchor: 'top' }, startPoint: { x: 300, y: 95 }, endPoint: { x: 300, y: 140 } },
          { id: 'conn2', type: 'arrow', startConnection: { nodeId: 'login', anchor: 'bottom' }, endConnection: { nodeId: 'decision', anchor: 'top' }, startPoint: { x: 300, y: 200 }, endPoint: { x: 300, y: 250 } },
          { id: 'conn3', type: 'arrow', startConnection: { nodeId: 'decision', anchor: 'left' }, endConnection: { nodeId: 'dashboard', anchor: 'top' }, startPoint: { x: 240, y: 295 }, endPoint: { x: 180, y: 400 } },
          { id: 'conn4', type: 'arrow', startConnection: { nodeId: 'decision', anchor: 'right' }, endConnection: { nodeId: 'error', anchor: 'top' }, startPoint: { x: 360, y: 295 }, endPoint: { x: 420, y: 400 } },
        ];
        saveHistoryState(nodes);
        setNodes(templateNodes as any);
        setSelectedNodeIds([]);
      }
    },
    {
      id: 'load-three-tier',
      name: 'Load 3-Tier Architecture Diagram',
      category: 'Templates',
      icon: LayoutTemplate,
      action: () => {
        const templateNodes: any[] = [
          { id: 'browser', type: 'browser', content: 'Browser App', position: { x: 50, y: 180 }, dimensions: { width: 120, height: 70 }, style: { backgroundColor: '#1e293b', color: '#fff', borderColor: '#334155', strokeWidth: 1 } },
          { id: 'gateway', type: 'server', content: 'API Gateway', position: { x: 230, y: 180 }, dimensions: { width: 110, height: 70 }, style: { backgroundColor: '#0c8ce9', color: '#fff', borderColor: '#0284c7', strokeWidth: 1 } },
          { id: 'server', type: 'server', content: 'App Server', position: { x: 410, y: 180 }, dimensions: { width: 110, height: 70 }, style: { backgroundColor: '#8b5cf6', color: '#fff', borderColor: '#7c3aed', strokeWidth: 1 } },
          { id: 'db', type: 'database', content: 'SQL Database', position: { x: 590, y: 180 }, dimensions: { width: 110, height: 70 }, style: { backgroundColor: '#10b981', color: '#fff', borderColor: '#059669', strokeWidth: 1 } },
          { id: 'conn1', type: 'arrow', startConnection: { nodeId: 'browser', anchor: 'right' }, endConnection: { nodeId: 'gateway', anchor: 'left' }, startPoint: { x: 170, y: 215 }, endPoint: { x: 230, y: 215 } },
          { id: 'conn2', type: 'arrow', startConnection: { nodeId: 'gateway', anchor: 'right' }, endConnection: { nodeId: 'server', anchor: 'left' }, startPoint: { x: 340, y: 215 }, endPoint: { x: 410, y: 215 } },
          { id: 'conn3', type: 'arrow', startConnection: { nodeId: 'server', anchor: 'right' }, endConnection: { nodeId: 'db', anchor: 'left' }, startPoint: { x: 520, y: 215 }, endPoint: { x: 590, y: 215 } },
        ];
        saveHistoryState(nodes);
        setNodes(templateNodes as any);
        setSelectedNodeIds([]);
      }
    },
    {
      id: 'load-uml-classes',
      name: 'Load UML Class Inheritance Diagram',
      category: 'Templates',
      icon: Cpu,
      action: () => {
        const templateNodes: any[] = [
          { id: 'user', type: 'uml-class', content: 'User\n--\n+ id: string\n+ name: string\n--\n+ login(): void', position: { x: 100, y: 100 }, dimensions: { width: 150, height: 100 }, style: { backgroundColor: '#1e293b', color: '#fff', borderColor: '#334155', strokeWidth: 1 } },
          { id: 'account', type: 'uml-class', content: 'Account\n--\n+ balance: double\n--\n+ deposit(amt): void', position: { x: 320, y: 100 }, dimensions: { width: 150, height: 100 }, style: { backgroundColor: '#1e293b', color: '#fff', borderColor: '#334155', strokeWidth: 1 } },
          { id: 'conn1', type: 'line', startConnection: { nodeId: 'user', anchor: 'right' }, endConnection: { nodeId: 'account', anchor: 'left' }, startPoint: { x: 250, y: 150 }, endPoint: { x: 320, y: 150 } },
        ];
        saveHistoryState(nodes);
        setNodes(templateNodes as any);
        setSelectedNodeIds([]);
      }
    },

    // Actions
    {
      id: 'zoom-in',
      name: 'Zoom In Diagram view',
      category: 'Actions',
      icon: Plus,
      shortcut: 'Ctrl + +',
      action: () => setZoom(Math.min(3, zoom + 0.1))
    },
    {
      id: 'zoom-out',
      name: 'Zoom Out Diagram view',
      category: 'Actions',
      icon: Minus,
      shortcut: 'Ctrl + -',
      action: () => setZoom(Math.max(0.1, zoom - 0.1))
    },
    {
      id: 'reset-zoom',
      name: 'Reset Zoom to 100%',
      category: 'Actions',
      icon: Maximize2,
      shortcut: 'Ctrl + 0',
      action: () => setZoom(1)
    },
    {
      id: 'clear-canvas',
      name: 'Clear Canvas (Delete all shapes)',
      category: 'Actions',
      icon: Trash2,
      action: () => {
        if (window.confirm('Are you sure you want to delete all elements?')) {
          saveHistoryState(nodes);
          setNodes([]);
          setSelectedNodeIds([]);
        }
      }
    }
  ];

  // Search filtering
  const filteredCommands = commands.filter(cmd => 
    cmd.name.toLowerCase().includes(search.toLowerCase()) || 
    cmd.category.toLowerCase().includes(search.toLowerCase())
  );

  // Auto focus input
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      setSearch('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Keyboard navigation inside modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % Math.max(1, filteredCommands.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % Math.max(1, filteredCommands.length));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
          onClose();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredCommands, onClose]);

  if (!isOpen) return null;

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div 
        className={styles.modal} 
        onClick={(e) => e.stopPropagation()}
        ref={containerRef}
      >
        <header className={styles.header}>
          <Search size={18} className={styles.searchIcon} />
          <input 
            ref={inputRef}
            type="text" 
            placeholder="Type a command or search actions..." 
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedIndex(0);
            }}
            className={styles.input}
          />
          <button onClick={onClose} className={styles.closeBtn} title="Close Palette">
            <X size={16} />
          </button>
        </header>

        <div className={styles.content}>
          {filteredCommands.length === 0 ? (
            <div className={styles.emptyState}>
              <Search size={24} style={{ color: 'var(--text-muted)', marginBottom: '8px' }} />
              <p>No results found for "{search}"</p>
            </div>
          ) : (
            <div className={styles.commandList}>
              {/* Group by category */}
              {Array.from(new Set(filteredCommands.map(c => c.category))).map(category => {
                const categoryCommands = filteredCommands.filter(c => c.category === category);
                return (
                  <div key={category} className={styles.group}>
                    <span className={styles.groupHeader}>{category}</span>
                    {categoryCommands.map(cmd => {
                      const Icon = cmd.icon;
                      // Find index of this item in the global filteredCommands array
                      const globalIdx = filteredCommands.findIndex(c => c.id === cmd.id);
                      const isSelected = globalIdx === selectedIndex;

                      return (
                        <div 
                          key={cmd.id} 
                          className={`${styles.commandItem} ${isSelected ? styles.selectedItem : ''}`}
                          onClick={() => {
                            cmd.action();
                            onClose();
                          }}
                          onMouseEnter={() => setSelectedIndex(globalIdx)}
                        >
                          <div className={styles.itemLeft}>
                            <Icon size={14} className={styles.itemIcon} />
                            <span className={styles.itemName}>{cmd.name}</span>
                          </div>
                          {cmd.shortcut && (
                            <span className={styles.shortcutTag}>{cmd.shortcut}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        <footer className={styles.footer}>
          <div className={styles.hint}>
            <span>↑↓ Navigation</span>
            <span>Enter Select</span>
            <span>Esc Close</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
