import { useState } from 'react';
import { useDiagram } from '@/context/DiagramContext';
import { useAuth } from '@/context/AuthContext';
import { generateExportCode } from '@/utils/exportEngine';
import { ExportModal } from '@/components/ui/ExportModal';
import { ImportModal } from '@/components/ui/ImportModal';
import styles from './Header.module.css';
import { FolderInput, FileDown, Sun, Moon, LogIn } from 'lucide-react';

export function Header() {
  const { nodes, theme, toggleTheme } = useDiagram();
  const { user, isAuthenticated, login, logout } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [exportData, setExportData] = useState('');

  const handleExport = () => {
    const html = generateExportCode(nodes);
    setExportData(html);
    setIsModalOpen(true);
  };

  return (
    <>
      <header className={styles.header}>
        <div className={styles.leftSection}>
          <div className={styles.logoContainer}>
            <div className={styles.logoIcon}>L</div>
            <span className={styles.title}>Loom</span>
          </div>
          <div className={styles.statusIndicator}>
            <span className={styles.statusDot}></span>
            <span>Cloud Connected</span>
          </div>
        </div>

        <div className={styles.centerSection}>
          <span>Drafts</span>
          <span style={{ color: 'var(--text-muted)' }}>/</span>
          <span style={{ color: 'var(--text-primary)' }}>Interactive Diagram</span>
        </div>

        <div className={styles.actions}>
          <button 
            className={styles.btn} 
            onClick={toggleTheme} 
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            style={{
              padding: '6px 8px',
              minWidth: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
          </button>
          <button className={styles.btn} onClick={() => setIsImportOpen(true)}>
            <FolderInput size={14} />
            <span>Import JSON</span>
          </button>
          <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleExport}>
            <FileDown size={14} />
            <span>Export Code</span>
          </button>

          <div style={{ width: '1px', height: '20px', backgroundColor: 'var(--border-default)', margin: '0 8px' }} />

          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <img 
                src={user?.picture} 
                alt={user?.name} 
                style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1px solid var(--border-default)' }} 
              />
              <button className={styles.btn} onClick={logout} style={{ padding: '4px 8px', fontSize: '11px' }}>
                Logout
              </button>
            </div>
          ) : (
            <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={login} style={{ backgroundColor: '#4285F4' }}>
              <LogIn size={14} />
              <span>Sign in</span>
            </button>
          )}
        </div>
      </header>
      <ExportModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        htmlCode={exportData}
      />
      <ImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
      />
    </>
  );
}
