import { useState } from 'react';
import styles from './ExportModal.module.css';
import { Button } from './button';
import { useDiagram } from '@/context/DiagramContext';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  htmlCode: string;
}

export function ExportModal({ isOpen, onClose, htmlCode }: ExportModalProps) {
  const [copiedHtml, setCopiedHtml] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [activeTab, setActiveTab] = useState<'html' | 'json'>('html');
  const { nodes } = useDiagram();

  if (!isOpen) return null;

  const handleCopyHtml = async () => {
    try {
      await navigator.clipboard.writeText(htmlCode);
      setCopiedHtml(true);
      setTimeout(() => setCopiedHtml(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleCopyJson = async () => {
    try {
      const jsonStr = JSON.stringify(nodes, null, 2);
      await navigator.clipboard.writeText(jsonStr);
      setCopiedJson(true);
      setTimeout(() => setCopiedJson(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleSaveDiagram = () => {
    const jsonStr = JSON.stringify(nodes, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'loom-diagram.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.content}>
        <button className={styles.close} onClick={onClose}>&times;</button>
        <h2 className={styles.title}>Export Diagram</h2>
        
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <Button 
            variant={activeTab === 'html' ? 'default' : 'outline'} 
            onClick={() => setActiveTab('html')}
          >
            HTML
          </Button>
          <Button 
            variant={activeTab === 'json' ? 'default' : 'outline'} 
            onClick={() => setActiveTab('json')}
          >
            JSON Loom Script
          </Button>
        </div>

        {activeTab === 'html' && (
          <div className={styles.codeSection}>
            <div className={styles.codeHeader}>
              <h3>HTML with Inline CSS</h3>
              <Button variant="outline" size="sm" onClick={handleCopyHtml}>
                {copiedHtml ? 'Copied!' : 'Copy to Clipboard'}
              </Button>
            </div>
            <pre className={styles.pre}><code>{htmlCode}</code></pre>
          </div>
        )}

        {activeTab === 'json' && (
          <div className={styles.codeSection}>
            <div className={styles.codeHeader}>
              <h3>JSON AST (Loom Script)</h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Button variant="outline" size="sm" onClick={handleCopyJson}>
                  {copiedJson ? 'Copied!' : 'Copy to Clipboard'}
                </Button>
                <Button variant="outline" size="sm" onClick={handleSaveDiagram}>
                  Save Diagram
                </Button>
              </div>
            </div>
            <pre className={styles.pre}><code>{JSON.stringify(nodes, null, 2)}</code></pre>
          </div>
        )}
      </div>
    </div>
  );
}
