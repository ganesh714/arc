import { useDiagram } from '@/context/DiagramContext';
import styles from './SidePanel.module.css';

export function SidePanel() {
  const { nodes, selectedNodeId, updateNode, selectNode, moveNode, resizeNode, updateLinePoints } = useDiagram();
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

  const handleStartPointChange = (axis: 'x' | 'y', value: number) => {
    if (!node.startPoint || !node.endPoint) return;
    const val = isNaN(value) ? 0 : value;
    const newStart = { ...node.startPoint, [axis]: val };
    updateLinePoints(node.id, newStart, node.endPoint);
  };

  const handleEndPointChange = (axis: 'x' | 'y', value: number) => {
    if (!node.startPoint || !node.endPoint) return;
    const val = isNaN(value) ? 0 : value;
    const newEnd = { ...node.endPoint, [axis]: val };
    updateLinePoints(node.id, node.startPoint, newEnd);
  };

  const handleLengthChange = (newLength: number) => {
    if (!node.startPoint || !node.endPoint) return;
    const len = isNaN(newLength) || newLength < 5 ? 5 : newLength;
    const start = node.startPoint;
    const end = node.endPoint;
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const angleRad = Math.atan2(dy, dx);
    
    const newEndX = start.x + len * Math.cos(angleRad);
    const newEndY = start.y + len * Math.sin(angleRad);
    updateLinePoints(node.id, start, { x: newEndX, y: newEndY });
  };

  const handleAngleChange = (newAngle: number) => {
    if (!node.startPoint || !node.endPoint) return;
    const ang = isNaN(newAngle) ? 0 : newAngle;
    const start = node.startPoint;
    const end = node.endPoint;
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    
    const angleRad = (ang * Math.PI) / 180;
    const newEndX = start.x + len * Math.cos(angleRad);
    const newEndY = start.y + len * Math.sin(angleRad);
    updateLinePoints(node.id, start, { x: newEndX, y: newEndY });
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

      {node.type !== 'line' && node.type !== 'arrow' ? (
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
      ) : node.startPoint && node.endPoint && (() => {
        const start = node.startPoint;
        const end = node.endPoint;
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        const length = Math.round(Math.sqrt(dx * dx + dy * dy));
        let angle = Math.round(Math.atan2(dy, dx) * (180 / Math.PI));
        if (angle < 0) angle += 360;

        return (
          <>
            {/* Start Point */}
            <div className={styles.section}>
              <div className={styles.grid}>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Start X (px)</span>
                  <input
                    type="number"
                    className={styles.numberInput}
                    value={Math.round(start.x)}
                    onChange={(e) => handleStartPointChange('x', parseInt(e.target.value, 10))}
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Start Y (px)</span>
                  <input
                    type="number"
                    className={styles.numberInput}
                    value={Math.round(start.y)}
                    onChange={(e) => handleStartPointChange('y', parseInt(e.target.value, 10))}
                  />
                </div>
              </div>
            </div>

            {/* End Point */}
            <div className={styles.section}>
              <div className={styles.grid}>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">End X (px)</span>
                  <input
                    type="number"
                    className={styles.numberInput}
                    value={Math.round(end.x)}
                    onChange={(e) => handleEndPointChange('x', parseInt(e.target.value, 10))}
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">End Y (px)</span>
                  <input
                    type="number"
                    className={styles.numberInput}
                    value={Math.round(end.y)}
                    onChange={(e) => handleEndPointChange('y', parseInt(e.target.value, 10))}
                  />
                </div>
              </div>
            </div>

            {/* Length and Angle */}
            <div className={styles.section}>
              <div className={styles.grid} style={{ marginBottom: '8px' }}>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Length (px)</span>
                  <input
                    type="number"
                    className={styles.numberInput}
                    value={length}
                    onChange={(e) => handleLengthChange(parseInt(e.target.value, 10))}
                    min={5}
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Angle (°)</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="0"
                      max="360"
                      className={styles.numberInput}
                      value={angle}
                      onChange={(e) => handleAngleChange(parseInt(e.target.value, 10) || 0)}
                      style={{ width: '100%' }}
                    />
                    <span className="text-xs text-slate-400 font-bold">°</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={angle}
                  onChange={(e) => handleAngleChange(parseInt(e.target.value, 10))}
                  className="flex-1 accent-sky-500 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>

            {/* Connector Styling */}
            <div className={styles.section}>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-2">Connector Styling</span>
              <div className="flex flex-col gap-3">
                {/* Curve Type */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-600 font-medium">Connector Route</span>
                  <select
                    className="text-xs bg-slate-50 border border-slate-200 rounded px-2 py-1 outline-none text-slate-700 font-medium cursor-pointer hover:bg-slate-100 transition-colors"
                    value={node.lineCurve || 'straight'}
                    onChange={(e) => updateNode({ ...node, lineCurve: e.target.value as 'straight' | 'curved' })}
                  >
                    <option value="straight">Straight</option>
                    <option value="curved">Curved</option>
                  </select>
                </div>

                {/* Stroke Type */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-600 font-medium">Stroke Pattern</span>
                  <select
                    className="text-xs bg-slate-50 border border-slate-200 rounded px-2 py-1 outline-none text-slate-700 font-medium cursor-pointer hover:bg-slate-100 transition-colors"
                    value={node.lineStyle || 'solid'}
                    onChange={(e) => updateNode({ ...node, lineStyle: e.target.value as 'solid' | 'dashed' })}
                  >
                    <option value="solid">Solid</option>
                    <option value="dashed">Dashed</option>
                  </select>
                </div>

                {/* Arrowhead Type */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-600 font-medium">Arrowheads</span>
                  <select
                    className="text-xs bg-slate-50 border border-slate-200 rounded px-2 py-1 outline-none text-slate-700 font-medium cursor-pointer hover:bg-slate-100 transition-colors"
                    value={node.arrowType || (node.type === 'arrow' ? 'single' : 'none')}
                    onChange={(e) => updateNode({ ...node, arrowType: e.target.value as 'none' | 'single' | 'double' })}
                  >
                    <option value="none">None</option>
                    <option value="single">Single End</option>
                    <option value="double">Double Ended</option>
                  </select>
                </div>
              </div>
            </div>
          </>
        );
      })()}

      {node.type !== 'line' && node.type !== 'arrow' && (
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
      )}

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
              value={parseInt(node.style?.borderRadius || (node.type === 'box' || node.type === 'diamond' ? '4' : '0'), 10)}
              onChange={(e) => handleChange('borderRadius', `${e.target.value}px`)}
              className="flex-1 accent-sky-500 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
            />
            <input
              type="number"
              min="0"
              max="100"
              value={parseInt(node.style?.borderRadius || (node.type === 'box' || node.type === 'diamond' ? '4' : '0'), 10)}
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
