import { useState } from 'react';
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
  X
} from 'lucide-react';
import styles from './Dashboard.module.css';

interface DashboardProps {
  onEnterWorkspace: () => void;
}

export function Dashboard({ onEnterWorkspace }: DashboardProps) {
  const { projects, addProject, switchProject } = useDiagram();
  const { user, logout, isGuest } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeNav, setActiveNav] = useState('recent');

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalNodes = projects.reduce((acc, p) => acc + p.nodes.length, 0);

  const handleCreateNew = () => {
    const name = `New Project ${projects.length + 1}`;
    addProject(name);
    onEnterWorkspace();
  };

  const handleProjectClick = (id: string) => {
    switchProject(id);
    onEnterWorkspace();
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
          <span className={styles.logoText}>Loom Dashboard</span>
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
            className={`${styles.navLink} ${activeNav === 'starred' ? styles.activeNavLink : ''}`}
            onClick={() => setActiveNav('starred')}
          >
            <Star size={18} />
            <span>Starred</span>
          </div>
        </nav>

        <nav className={styles.navSection}>
          <div className={styles.navLabel}>Organization</div>
          <div className={styles.navLink}>
            <Users size={18} />
            <span>Team Workspace</span>
          </div>
          <div className={styles.navLink}>
            <Grid3X3 size={18} />
            <span>Templates</span>
          </div>
        </nav>

        <nav className={styles.navSection} style={{ marginTop: 'auto' }}>
          <div className={styles.navLink}>
            <Settings size={18} />
            <span>Settings</span>
          </div>
          
          <div style={{ margin: '16px 12px', padding: '12px', background: '#12141a', borderRadius: '12px', border: '1px solid #1a1d26' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#0c8ce920', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                {user?.picture ? <img src={user.picture} style={{ width: '100%' }} /> : <Users size={16} color="#0c8ce9" />}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{user?.name || 'Explorer'}</div>
                <div style={{ fontSize: '10px', color: '#666' }}>{isGuest ? 'Guest Access' : 'Pro Account'}</div>
              </div>
            </div>
            <button 
              onClick={logout}
              style={{ width: '100%', background: '#1a1d26', border: 'none', color: '#888', padding: '6px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            >
              <X size={12} /> Sign out
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
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#444' }} />
              <input 
                type="text" 
                placeholder="Search projects..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  backgroundColor: '#12141a',
                  border: '1px solid #1a1d26',
                  borderRadius: '8px',
                  padding: '10px 12px 10px 36px',
                  color: '#fff',
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

        {/* Stats Row */}
        <div className={styles.statsRow}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}><FolderKanban size={24} /></div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{projects.length}</span>
              <span className={styles.statLabel}>Total Projects</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}><Layers size={24} /></div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{totalNodes}</span>
              <span className={styles.statLabel}>Active Layers</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ color: '#10b981' }}><Sparkles size={24} /></div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>Pro</span>
              <span className={styles.statLabel}>Current Plan</span>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        {filteredProjects.length > 0 ? (
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
                  </div>                  {project.nodes.length > 0 && (
                    <div style={{ position: 'absolute', bottom: '16px', right: '16px', background: '#0c8ce920', padding: '6px', borderRadius: '50%' }}>
                      <Sparkles size={14} color="#0c8ce9" />
                    </div>
                  )}
                </div>
                
                <div className={styles.info}>
                  <div className={styles.projectHeader}>
                    <span className={styles.projectName}>{project.name}</span>
                    <button style={{ background: 'none', border: 'none', color: '#444', cursor: 'pointer' }} onClick={(e) => e.stopPropagation()}>
                      <MoreVertical size={16} />
                    </button>
                  </div>
                  
                  <div className={styles.projectMeta}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Clock size={14} color="#444" />
                      <span>{formatDate(project.updatedAt)}</span>
                    </div>
                    <div className={styles.nodeCount}>
                      <Layers size={12} />
                      <span>{project.nodes.length}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <div style={{ backgroundColor: '#161922', padding: '32px', borderRadius: '50%', color: '#0c8ce9' }}>
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
    </div>
  );
}
