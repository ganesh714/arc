import { useState } from 'react';
import styles from './ExportModal.module.css';
import { Button } from './button';
import { useDiagram } from '@/context/DiagramContext';
import { toPng, toSvg } from 'html-to-image';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  htmlCode: string;
}

export function ExportModal({ isOpen, onClose, htmlCode }: ExportModalProps) {
  const [copiedHtml, setCopiedHtml] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [activeTab, setActiveTab] = useState<'image' | 'html' | 'json'>('image');
  const { nodes, theme } = useDiagram();

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

  const handleExportImage = async (format: 'png' | 'svg') => {
    try {
      setIsExporting(true);
      const element = document.getElementById('loom-export-area');
      if (!element) throw new Error('Export area not found');

      if (nodes.length === 0) {
        alert("Canvas is empty!");
        setIsExporting(false);
        return;
      }

      // Calculate exact bounding box of the diagram
      const padding = 40;
      const minX = Math.min(...nodes.map(n => n.position.x)) - padding;
      const minY = Math.min(...nodes.map(n => n.position.y)) - padding;
      const maxX = Math.max(...nodes.map(n => n.position.x + n.dimensions.width)) + padding;
      const maxY = Math.max(...nodes.map(n => n.position.y + n.dimensions.height)) + padding;
      
      const width = maxX - minX;
      const height = maxY - minY;

      const filter = (node: HTMLElement) => {
        // Exclude elements that shouldn't be in the export (like selection borders, if any have specific classes)
        // For now, capture everything in the wrapper.
        return true;
      };

      const options = {
        filter,
        width,
        height,
        style: {
          transform: `translate(${-minX}px, ${-minY}px) scale(1)`,
          transformOrigin: 'top left',
          width: `${width}px`,
          height: `${height}px`,
        },
        backgroundColor: theme === 'dark' ? '#121212' : '#f8f9fa',
        pixelRatio: format === 'png' ? 2 : 1, // 2x scale for crisp PNGs
      };

      let dataUrl = '';
      if (format === 'png') {
        dataUrl = await toPng(element, options);
      } else {
        dataUrl = await toSvg(element, options);
      }

      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `loom-export.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error('Export failed:', err);
      alert('Failed to export image. See console for details.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.content}>
        <button className={styles.close} onClick={onClose}>&times;</button>
        <h2 className={styles.title}>Export Diagram</h2>
        
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <Button 
            variant={activeTab === 'image' ? 'default' : 'outline'} 
            onClick={() => setActiveTab('image')}
          >
            Image
          </Button>
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

        {activeTab === 'image' && (
          <div className={styles.codeSection} style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>Export as High-Quality Image</h3>
            <p style={{ margin: 0, color: 'var(--text-secondary)', textAlign: 'center', fontSize: '14px' }}>
              Download your canvas as a perfectly cropped, scalable image for sharing or embedding in your projects.
            </p>
            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
              <Button 
                onClick={() => handleExportImage('svg')} 
                disabled={isExporting}
                style={{ padding: '8px 24px' }}
              >
                {isExporting ? 'Exporting...' : 'Download SVG'}
              </Button>
              <Button 
                variant="outline"
                onClick={() => handleExportImage('png')} 
                disabled={isExporting}
                style={{ padding: '8px 24px' }}
              >
                {isExporting ? 'Exporting...' : 'Download PNG (@2x)'}
              </Button>
            </div>
          </div>
        )}

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
