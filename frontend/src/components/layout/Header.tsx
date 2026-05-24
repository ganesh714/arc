import { useState, useRef } from 'react';
import { useDiagram } from '@/context/DiagramContext';
import { generateExportCode } from '@/utils/exportEngine';
import { ExportModal } from '@/components/ui/ExportModal';
import styles from './Header.module.css';
import { Button } from '@/components/ui/button';

export function Header() {
  const { nodes, setNodes } = useDiagram();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [exportData, setExportData] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const html = generateExportCode(nodes);
    setExportData(html);
    setIsModalOpen(true);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsedData = JSON.parse(content);
        if (Array.isArray(parsedData)) {
          setNodes(parsedData);
        } else {
          alert('Invalid diagram file format.');
        }
      } catch (error) {
        console.error('Failed to parse JSON', error);
        alert('Failed to parse diagram file.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <header className={styles.header}>
        <h1 className={styles.title}>Project Loom</h1>
        <div className={styles.actions} style={{ display: 'flex', gap: '8px' }}>
          <input 
            type="file" 
            accept=".json" 
            style={{ display: 'none' }} 
            ref={fileInputRef}
            onChange={handleImport}
          />
          <Button onClick={() => fileInputRef.current?.click()} variant="outline">Import Diagram</Button>
          <Button onClick={handleExport} variant="outline">Export</Button>
        </div>
      </header>
      <ExportModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        htmlCode={exportData}
      />
    </>
  );
}
