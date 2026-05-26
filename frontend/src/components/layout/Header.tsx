import { useState } from 'react';
import { useDiagram } from '@/context/DiagramContext';
import { generateExportCode } from '@/utils/exportEngine';
import { ExportModal } from '@/components/ui/ExportModal';
import { ImportModal } from '@/components/ui/ImportModal';
import styles from './Header.module.css';
import { FolderInput, FileDown } from 'lucide-react';

export function Header() {
  const { nodes, isSidebarOpen } = useDiagram();
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
          {!isSidebarOpen && (
            <div className={styles.logoContainer}>
              <div className={styles.logoIcon}>L</div>
              <span className={styles.title}>Loom</span>
            </div>
          )}
          <div className={styles.statusIndicator} style={{ marginLeft: isSidebarOpen ? '0px' : '12px' }}>
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
          <button className={styles.btn} onClick={() => setIsImportOpen(true)}>
            <FolderInput size={14} />
            <span>Import JSON</span>
          </button>
          <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleExport}>
            <FileDown size={14} />
            <span>Export Code</span>
          </button>
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
