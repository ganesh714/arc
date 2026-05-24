import { useDiagram } from '@/context/DiagramContext';
import styles from './SidePanel.module.css';

export function SidePanel() {
  const { nodes, selectedNodeId, updateNode, selectNode, moveNode, resizeNode } = useDiagram();
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

  const handlePositionChange = (axis: 'x' | 'y', value: number) => {
    moveNode(node.id, {
      ...node.position,
      [axis]: isNaN(value) ? 0 : value,
    });
  };

  const handleDimensionChange = (dimension: 'width' | 'height', value: number) => {
    resizeNode(
      node.id,
      {
        ...node.dimensions,
        [dimension]: isNaN(value) ? 0 : value,
      },
      node.position
    );
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.header}>
        <h3>Properties</h3>
        <button className={styles.close} onClick={() => selectNode(null)}>&times;</button>
      </div>

      {/* Geometry Settings */}
      <div className={styles.section}>
        <label>Geometry</label>
        <div className={styles.grid}>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">X Pos (px)</span>
            <input
              type="number"
              className={styles.numberInput}
              value={node.position.x}
              onChange={(e) => handlePositionChange('x', parseInt(e.target.value, 10))}
            />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Y Pos (px)</span>
            <input
              type="number"
              className={styles.numberInput}
              value={node.position.y}
              onChange={(e) => handlePositionChange('y', parseInt(e.target.value, 10))}
            />
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.grid}>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Width (px)</span>
            <input
              type="number"
              className={styles.numberInput}
              value={node.dimensions.width}
              onChange={(e) => handleDimensionChange('width', parseInt(e.target.value, 10))}
              min={20}
            />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Height (px)</span>
            <input
              type="number"
              className={styles.numberInput}
              value={node.dimensions.height}
              onChange={(e) => handleDimensionChange('height', parseInt(e.target.value, 10))}
              min={20}
            />
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Rotation</span>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0"
            max="360"
            value={node.rotation || 0}
            onChange={(e) => updateNode({ ...node, rotation: parseInt(e.target.value, 10) })}
            className="flex-1 accent-sky-500 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
          />
          <input
            type="number"
            min="0"
            max="360"
            value={node.rotation || 0}
            onChange={(e) => updateNode({ ...node, rotation: parseInt(e.target.value, 10) || 0 })}
            className={styles.numberInput}
            style={{ width: '65px', flexShrink: 0 }}
          />
          <span className="text-xs text-slate-400 font-bold">°</span>
        </div>
      </div>

      {node.type !== 'line' && node.type !== 'arrow' && (
        <div className={styles.section}>
          <label>Text Content</label>
          <textarea
            className={styles.textarea}
            value={node.content}
            onChange={(e) => handleChange('content', e.target.value)}
            rows={4}
          />
        </div>
      )}

      {node.type !== 'line' && node.type !== 'arrow' && (
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
      )}

      {node.type !== 'circle' && node.type !== 'line' && node.type !== 'arrow' && (
        <div className={styles.section}>
          <label>Corner Radius</label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="0"
              max="40"
              value={parseInt(node.style?.borderRadius || (node.type === 'box' ? '4' : '0'), 10)}
              onChange={(e) => handleChange('borderRadius', `${e.target.value}px`)}
              className="flex-1 accent-sky-500 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
            />
            <input
              type="number"
              min="0"
              max="100"
              value={parseInt(node.style?.borderRadius || (node.type === 'box' ? '4' : '0'), 10)}
              onChange={(e) => handleChange('borderRadius', `${e.target.value}px`)}
              className={styles.numberInput}
              style={{ width: '65px', flexShrink: 0 }}
            />
          </div>
        </div>
      )}

      <div className={styles.section}>
        <label>{node.type === 'line' || node.type === 'arrow' ? 'Line Color' : 'Border Color'}</label>
        <div className={styles.colorPickerWrapper}>
          <input
            type="color"
            value={node.style?.borderColor || (node.type === 'line' ? '#475569' : node.type === 'arrow' ? '#0284c7' : '#333333')}
            onChange={(e) => handleChange('borderColor', e.target.value)}
          />
          <span className={styles.colorHex}>{node.style?.borderColor || (node.type === 'line' ? '#475569' : node.type === 'arrow' ? '#0284c7' : '#333333')}</span>
        </div>
      </div>

      {node.type !== 'line' && node.type !== 'arrow' && (
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
      )}
    </div>
  );
}
