import { useDiagram } from '@/context/DiagramContext';
import styles from './SidePanel.module.css';

export function SidePanel() {
  const { nodes, selectedNodeId, updateNode, selectNode } = useDiagram();
  const node = nodes.find(n => n.id === selectedNodeId);

  if (!node) return null;

  const handleChange = (field: string, value: string) => {
    if (field === 'content') {
      updateNode({ ...node, content: value });
    } else {
      updateNode({
        ...node,
        style: {
          ...node.style,
          [field]: value,
        },
      });
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.header}>
        <h3>Properties</h3>
        <button className={styles.close} onClick={() => selectNode(null)}>&times;</button>
      </div>

      <div className={styles.section}>
        <label>Text Content</label>
        <textarea
          className={styles.textarea}
          value={node.content}
          onChange={(e) => handleChange('content', e.target.value)}
          rows={4}
        />
      </div>

      <div className={styles.section}>
        <label>Background Color</label>
        <div className={styles.colorPickerWrapper}>
          <input
            type="color"
            value={node.style?.backgroundColor || '#f0f0f0'}
            onChange={(e) => handleChange('backgroundColor', e.target.value)}
          />
          <span className={styles.colorHex}>{node.style?.backgroundColor || '#f0f0f0'}</span>
        </div>
      </div>

      <div className={styles.section}>
        <label>Border Color</label>
        <div className={styles.colorPickerWrapper}>
          <input
            type="color"
            value={node.style?.borderColor || '#333333'}
            onChange={(e) => handleChange('borderColor', e.target.value)}
          />
          <span className={styles.colorHex}>{node.style?.borderColor || '#333333'}</span>
        </div>
      </div>

      <div className={styles.section}>
        <label>Text Color</label>
        <div className={styles.colorPickerWrapper}>
          <input
            type="color"
            value={node.style?.color || '#000000'}
            onChange={(e) => handleChange('color', e.target.value)}
          />
          <span className={styles.colorHex}>{node.style?.color || '#000000'}</span>
        </div>
      </div>
    </div>
  );
}
