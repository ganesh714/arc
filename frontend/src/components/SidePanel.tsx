import type { DiagramNode } from '../types';

interface SidePanelProps {
  node: DiagramNode | null;
  onUpdate: (updatedNode: DiagramNode) => void;
  onClose: () => void;
}
export function SidePanel({ node, onUpdate, onClose }: SidePanelProps) {
  if (!node) {
    return (
      <div className="side-panel placeholder">
        <div className="placeholder-content">
          <span className="placeholder-icon">🎨</span>
          <h3>No Selection</h3>
          <p>Click on any box on the canvas to customize its text content and styling colors.</p>
        </div>
      </div>
    );
  }

  const handleChange = (field: string, value: string) => {
    if (field === 'content') {
      onUpdate({ ...node, content: value });
    } else {
      onUpdate({
        ...node,
        style: {
          ...node.style,
          [field]: value,
        },
      });
    }
  };

  return (
    <div className="side-panel">
      <div className="side-panel-header">
        <h3>Properties</h3>
        <button className="panel-close" onClick={onClose}>&times;</button>
      </div>

      <div className="panel-section">
        <label>Text Content</label>
        <textarea
          className="panel-textarea"
          value={node.content}
          onChange={(e) => handleChange('content', e.target.value)}
          rows={4}
        />
      </div>

      <div className="panel-section">
        <label>Background Color</label>
        <div className="color-picker-wrapper">
          <input
            type="color"
            value={node.style?.backgroundColor || '#f0f0f0'}
            onChange={(e) => handleChange('backgroundColor', e.target.value)}
          />
          <span className="color-hex">{node.style?.backgroundColor || '#f0f0f0'}</span>
        </div>
      </div>

      <div className="panel-section">
        <label>Border Color</label>
        <div className="color-picker-wrapper">
          <input
            type="color"
            value={node.style?.borderColor || '#333333'}
            onChange={(e) => handleChange('borderColor', e.target.value)}
          />
          <span className="color-hex">{node.style?.borderColor || '#333333'}</span>
        </div>
      </div>

      <div className="panel-section">
        <label>Text Color</label>
        <div className="color-picker-wrapper">
          <input
            type="color"
            value={node.style?.color || '#000000'}
            onChange={(e) => handleChange('color', e.target.value)}
          />
          <span className="color-hex">{node.style?.color || '#000000'}</span>
        </div>
      </div>
    </div>
  );
}
