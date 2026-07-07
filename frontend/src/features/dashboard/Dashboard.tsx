import { useState, useEffect } from 'react';
import { useDiagram } from '@/context/DiagramContext';
import { useAuth } from '@/context/AuthContext';
import { 
  Plus, 
  Search, 
  LayoutGrid, 
  Clock, 
  FolderKanban, 
  MoreVertical,
  Layers,
  Sparkles,
  Home,
  Star,
  Users,
  Settings,
  Grid3X3,
  Sun,
  Moon,
  LogOut,
  Edit,
  Trash2
} from 'lucide-react';
import { CreateEntityModal } from '@/components/layout/CreateEntityModal';
import { DashboardSettingsModal } from '@/components/layout/DashboardSettingsModal';
import { Skeleton } from '@/components/ui/Skeleton';
import { useNavigate } from 'react-router-dom';
import styles from './Dashboard.module.css';

export function Dashboard() {
  const { projects, addProject, isLoadingProjects, theme, toggleTheme } = useDiagram();
  const { user, logout, isGuest } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeNav, setActiveNav] = useState('recent');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const navigate = useNavigate();
  
  const { updateProject, deleteProject } = useDiagram();


  useEffect(() => {
    if (!activeMenuId) return;
    const handleOutsideClick = () => setActiveMenuId(null);
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, [activeMenuId]);

  const handleRename = (e: React.MouseEvent, id: string, currentName: string) => {
    e.stopPropagation();
    setActiveMenuId(null);
    const newName = prompt('Enter new project name:', currentName);
    if (newName && newName.trim() !== '' && newName !== currentName) {
      updateProject(id, newName.trim());
    }
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setActiveMenuId(null);
    if (confirm('Are you sure you want to delete this project?')) {
      deleteProject(id);
    }
  };

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateNew = () => {
    setIsCreateModalOpen(true);
  };

  const handleConfirmCreate = async (name: string, bgColor: string) => {
    const newProj = await addProject(name, 'Arc Diagrams', bgColor);
    if (newProj && newProj.files.length > 0) {
      navigate(`/project/${newProj.id}/file/${newProj.files[0].id}`);
    }
  };

  const handleProjectClick = (id: string) => {
    const proj = projects.find(p => p.id === id);
    if (proj && proj.files.length > 0) {
      navigate(`/project/${id}/file/${proj.files[0].id}`);
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric' 
    }).format(date);
  };

  return (
    <div className={styles.container}>
      {/* Dashboard Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.logoArea}>
          <div className={styles.logoIcon}>L</div>
          <span className={styles.logoText}>Arc Dashboard</span>
        </div>

        <nav className={styles.navSection}>
          <div className={styles.navLabel}>Personal</div>
          <div 
            className={`${styles.navLink} ${activeNav === 'recent' ? styles.activeNavLink : ''}`}
            onClick={() => setActiveNav('recent')}
          >
            <Home size={18} />
            <span>Recent Projects</span>
          </div>
          <div 
            className={styles.navLink}
            style={{ opacity: 0.4, cursor: 'not-allowed' }}
          >
            <Star size={18} />
            <span>Starred</span>
          </div>
        </nav>

        <nav className={styles.navSection}>
          <div className={styles.navLabel}>Organization</div>
          <div className={styles.navLink} style={{ opacity: 0.4, cursor: 'not-allowed' }}>
            <Users size={18} />
            <span>Team Workspace</span>
          </div>
          <div className={styles.navLink} style={{ opacity: 0.4, cursor: 'not-allowed' }}>
            <Grid3X3 size={18} />
            <span>Templates</span>
          </div>
        </nav>

        <nav className={styles.navSection} style={{ marginTop: 'auto' }}>
          <div 
            className={styles.navLink} 
            onClick={() => setIsSettingsModalOpen(true)}
          >
            <Settings size={18} />
            <span>Settings</span>
          </div>
          
          <div style={{ margin: '16px 12px', padding: '12px', background: 'var(--bg-canvas)', borderRadius: '12px', border: '1px solid var(--border-default)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--accent-blue-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                {user?.picture ? <img src={user.picture} style={{ width: '100%' }} /> : <Users size={18} color="var(--accent-blue)" />}
              </div>
              <div style={{ overflow: 'hidden', flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{user?.name || 'Explorer'}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{isGuest ? 'Guest Access' : 'Pro Account'}</div>
              </div>
              <button 
                onClick={toggleTheme}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px', borderRadius: '6px', transition: 'all 0.2s' }}
                title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                onMouseOver={(e) => { e.currentTarget.style.background = 'var(--accent-blue-subtle)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                onMouseOut={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-muted)'; }}
              >
                {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
              </button>
            </div>
            
            <button 
              onClick={logout}
              style={{ width: '100%', background: 'var(--bg-canvas)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)', padding: '8px', borderRadius: '8px', fontSize: '12px', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', transition: 'all 0.2s' }}
              onMouseOver={(e) => { e.currentTarget.style.background = 'var(--accent-blue-subtle)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
              onMouseOut={(e) => { e.currentTarget.style.background = 'var(--bg-canvas)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
            >
              <LogOut size={14} /> Sign out
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className={styles.main}>
        <header className={styles.header}>
          <div className={styles.titleSection}>
            <h1>Welcome back, {user?.name?.split(' ')[0] || 'Explorer'}</h1>
            <p>Manage and create your architectural diagrams and UI models.</p>
          </div>
          
          <div className={styles.actions}>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                placeholder="Search projects..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  backgroundColor: 'var(--bg-panel-solid)',
                  border: '1px solid var(--border-default)',
                  borderRadius: '8px',
                  padding: '10px 12px 10px 36px',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  width: '280px',
                  outline: 'none'
                }}
              />
            </div>
            <button className={styles.newProjectBtn} onClick={handleCreateNew}>
              <Plus size={18} />
              <span>Create Project</span>
            </button>
          </div>
        </header>



        {/* Main Grid */}
        {isLoadingProjects ? (
          <div className={styles.grid}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} className={styles.card} style={{ pointerEvents: 'none', border: 'none' }}>
                <Skeleton height="140px" borderRadius="12px 12px 0 0" />
                <div style={{ padding: '16px' }}>
                  <Skeleton height="20px" width="70%" className="mb-2" />
                  <Skeleton height="14px" width="40%" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProjects.length > 0 ? (
          <div className={styles.grid}>
            {filteredProjects.sort((a, b) => b.updatedAt - a.updatedAt).map((project) => (
              <div 
                key={project.id} 
                className={styles.card}
                onClick={() => handleProjectClick(project.id)}
              >
                <div className={styles.preview}>
                  <div className={styles.previewGradient} />
                  <div className={styles.cardIcon}>
                    <FolderKanban size={64} strokeWidth={1} />
                  </div>                  {project.files.length > 0 && (
                    <div style={{ position: 'absolute', bottom: '16px', right: '16px', background: 'var(--accent-blue-subtle)', padding: '6px', borderRadius: '50%' }}>
                      <Sparkles size={14} color="var(--accent-blue)" />
                    </div>
                  )}
                </div>
                
                <div className={styles.info}>
                  <div className={styles.projectHeader}>
                    <span className={styles.projectName}>{project.name}</span>
                    <div style={{ position: 'relative' }}>
                      <button 
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }} 
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuId(activeMenuId === project.id ? null : project.id);
                        }}
                      >
                        <MoreVertical size={16} />
                      </button>
                      
                      {activeMenuId === project.id && (
                        <div style={{
                          position: 'absolute',
                          top: '100%',
                          right: '0',
                          backgroundColor: 'var(--bg-panel-solid)',
                          border: '1px solid var(--border-default)',
                          borderRadius: '6px',
                          boxShadow: 'var(--shadow-sm)',
                          zIndex: 50,
                          minWidth: '120px',
                          overflow: 'hidden'
                        }}>
                          <button 
                            onClick={(e) => handleRename(e, project.id, project.name)}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '8px 12px', background: 'none', border: 'none', borderBottom: '1px solid var(--border-default)', color: 'var(--text-primary)', fontSize: '12px', cursor: 'pointer', textAlign: 'left' }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                          >
                            <Edit size={12} /> Rename
                          </button>
                          <button 
                            onClick={(e) => handleDelete(e, project.id)}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '8px 12px', background: 'none', border: 'none', color: '#ef4444', fontSize: '12px', cursor: 'pointer', textAlign: 'left' }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                          >
                            <Trash2 size={12} /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className={styles.projectMeta}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Clock size={14} color="var(--text-muted)" />
                      <span>{formatDate(project.updatedAt)}</span>
                    </div>
                    <div className={styles.nodeCount}>
                      <Layers size={12} />
                      <span>{project.files.length}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <div style={{ backgroundColor: 'var(--bg-surface-solid)', padding: '32px', borderRadius: '50%', color: 'var(--accent-blue)' }}>
              <LayoutGrid size={48} strokeWidth={1.5} />
            </div>
            <h2>No projects found</h2>
            <p>Ready to start weaving your next masterpiece? Create a new project to begin.</p>
            <button className={styles.newProjectBtn} onClick={handleCreateNew} style={{ marginTop: '12px' }}>
              Create Your First Project
            </button>
          </div>
        )}
      </main>

      <CreateEntityModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onConfirm={handleConfirmCreate}
        title="Create New Project"
        defaultName={`New Project ${projects.length + 1}`}
      />

      <DashboardSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />
    </div>
  );
}
