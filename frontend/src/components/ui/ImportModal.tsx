import { useState, useRef } from 'react';
import type { DragEvent, ChangeEvent } from 'react';
import styles from './ImportModal.module.css';
import { Button } from './button';
import { useDiagram } from '@/context/DiagramContext';
import { autoLayoutNodes } from '@/utils/layoutEngine';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ImportModal({ isOpen, onClose }: ImportModalProps) {
  const { nodes, setNodes, saveHistoryState } = useDiagram();
  const [activeTab, setActiveTab] = useState<'file' | 'code'>('file');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedNodes, setParsedNodes] = useState<any[] | null>(null);
  const [codeText, setCodeText] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleClose = () => {
    setErrorMsg('');
    setSuccessMsg('');
    setSelectedFile(null);
    setParsedNodes(null);
    setCodeText('');
    onClose();
  };

  const processImportData = (content: string): any[] | null => {
    try {
      const parsedData = JSON.parse(content);
      if (!Array.isArray(parsedData)) {
        setErrorMsg('Invalid format: The diagram data must be a JSON array of nodes.');
        return null;
      }

      let needsAutoLayout = false;

      // Basic structure validation for all nodes
      for (const node of parsedData) {
        if (!node || typeof node !== 'object') {
          setErrorMsg('Invalid format: Nodes must be objects.');
          return null;
        }
        if (typeof node.id !== 'string' || typeof node.type !== 'string') {
          setErrorMsg('Invalid format: Each node must have a string "id" and "type".');
          return null;
        }
        if (!node.position || typeof node.position.x !== 'number' || typeof node.position.y !== 'number') {
          if (node.type !== 'arrow' && node.type !== 'line' && node.type !== 'custom-connector') {
            needsAutoLayout = true;
          }
        }
      }

      setErrorMsg('');
      return needsAutoLayout ? autoLayoutNodes(parsedData) : parsedData;
    } catch (err) {
      setErrorMsg('Failed to parse: Invalid JSON structure.');
      return null;
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleSelectedFile(file);
    }
  };

  const handleSelectedFile = (file: File) => {
    if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
      setErrorMsg('Unsupported file type. Please upload a .json diagram file.');
      setSelectedFile(null);
      setParsedNodes(null);
      return;
    }

    setSelectedFile(file);
    setErrorMsg('');
    setSuccessMsg('');

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const nodesData = processImportData(text);
      if (nodesData) {
        setParsedNodes(nodesData);
        setSuccessMsg('Diagram file loaded successfully and is ready to import.');
      } else {
        setParsedNodes(null);
      }
    };
    reader.onerror = () => {
      setErrorMsg('Failed to read the file.');
      setSelectedFile(null);
      setParsedNodes(null);
    };
    reader.readAsText(file);
  };

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const executeImport = () => {
    if (activeTab === 'file') {
      if (parsedNodes) {
        saveHistoryState(nodes);
        setNodes(parsedNodes);
        handleClose();
      }
    } else {
      const nodesData = processImportData(codeText);
      if (nodesData) {
        saveHistoryState(nodes);
        setNodes(nodesData);
        handleClose();
      }
    }
  };

  const handleCodeChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setCodeText(text);
    setErrorMsg('');
    setSuccessMsg('');

    if (text.trim() === '') {
      return;
    }

    try {
      const parsedData = JSON.parse(text);
      if (Array.isArray(parsedData)) {
        setSuccessMsg('Valid JSON AST array! Ready to import.');
      } else {
        setErrorMsg('Warning: Data must be a JSON array of nodes.');
      }
    } catch (err) {
      // Don't show parse errors typing midway unless they stop or click import,
      // but let's show visual warning if there is a syntax error
      setErrorMsg('Invalid JSON syntax...');
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.content}>
        <button className={styles.close} onClick={handleClose}>&times;</button>
        <h2 className={styles.title}>Import Diagram</h2>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <Button
            variant={activeTab === 'file' ? 'default' : 'outline'}
            onClick={() => {
              setActiveTab('file');
              setErrorMsg('');
              setSuccessMsg('');
            }}
          >
            File (JSON)
          </Button>
          <Button
            variant={activeTab === 'code' ? 'default' : 'outline'}
            onClick={() => {
              setActiveTab('code');
              setErrorMsg('');
              setSuccessMsg('');
            }}
          >
            Code Input
          </Button>
        </div>

        {activeTab === 'file' && (
          <div className={styles.section}>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              style={{ display: 'none' }}
            />
            
            <div
              className={`${styles.dropzone} ${dragActive ? styles.dropzoneActive : ''}`}
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={triggerFileInput}
            >
              <svg
                className={styles.dropzoneIcon}
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <p className={styles.dropzoneText}>
                Drag &amp; drop your <strong>.json</strong> file here, or <strong>browse</strong>
              </p>
            </div>

            {selectedFile && (
              <div className={styles.fileInfo}>
                <div className={styles.fileDetails}>
                  <span className={styles.fileName}>{selectedFile.name}</span>
                  <span className={styles.fileSize}>{(selectedFile.size / 1024).toFixed(2)} KB</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => {
                  setSelectedFile(null);
                  setParsedNodes(null);
                  setErrorMsg('');
                  setSuccessMsg('');
                }}>
                  Clear
                </Button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'code' && (
          <div className={styles.section}>
            <div className={styles.textareaContainer}>
              <textarea
                className={styles.textarea}
                placeholder={`[\n  {\n    "id": "1",\n    "type": "rectangle",\n    "position": { "x": 100, "y": 100 },\n    "dimensions": { "width": 150, "height": 80 },\n    "content": "Double click to edit",\n    "style": { "backgroundColor": "#ffffff" }\n  }\n]`}
                value={codeText}
                onChange={handleCodeChange}
              />
            </div>
          </div>
        )}

        {errorMsg && (
          <div className={styles.errorBanner} style={{ marginTop: '16px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className={styles.successBanner} style={{ marginTop: '16px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <span>{successMsg}</span>
          </div>
        )}

        <div className={styles.actionRow}>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            variant="default"
            onClick={executeImport}
            disabled={activeTab === 'file' ? !parsedNodes : (!codeText.trim() || !!errorMsg.includes('syntax'))}
          >
            Import Diagram
          </Button>
        </div>
      </div>
    </div>
  );
}
