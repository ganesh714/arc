import { useDiagram } from '@/context/DiagramContext';
import type { DiagramNode } from '@/types';
import styles from './SidePanel.module.css';
import { X as CloseIcon } from 'lucide-react';

export function SidePanel() {
  const { 
    nodes, 
    selectedNodeIds, 
    updateNode, 
    updateMultipleNodes, 
    selectNode, 
    moveNode, 
    resizeNode, 
    updateLinePoints 
  } = useDiagram();

  const selectedNodes = nodes.filter(n => selectedNodeIds.includes(n.id));

  if (selectedNodes.length === 0) return null;

  const node = selectedNodes[0];

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

  const handleMultipleChange = (field: string, value: any) => {
    if (field === 'content') {
      updateMultipleNodes(selectedNodeIds, { content: value });
    } else if (field === 'rotation') {
      updateMultipleNodes(selectedNodeIds, { rotation: value });
    } else if (field === 'lineCurve' || field === 'lineStyle' || field === 'arrowType') {
      updateMultipleNodes(selectedNodeIds, { [field]: value });
    } else {
      updateMultipleNodes(selectedNodeIds, {
        style: {
          [field]: value
        }
      });
    }
  };

  const handlePositionChange = (axis: 'x' | 'y', value: number) => {
    if (!node) return;
    moveNode(node.id, {
      ...node.position,
      [axis]: isNaN(value) ? 0 : value,
    });
  };

  const handleDimensionChange = (dimension: 'width' | 'height', value: number) => {
    if (!node) return;
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
    if (!node || !node.startPoint || !node.endPoint) return;
    const val = isNaN(value) ? 0 : value;
    const newStart = { ...node.startPoint, [axis]: val };
    updateLinePoints(node.id, newStart, node.endPoint);
  };

  const handleEndPointChange = (axis: 'x' | 'y', value: number) => {
    if (!node || !node.startPoint || !node.endPoint) return;
    const val = isNaN(value) ? 0 : value;
    const newEnd = { ...node.endPoint, [axis]: val };
    updateLinePoints(node.id, node.startPoint, newEnd);
  };

  const handleLengthChange = (newLength: number) => {
    if (!node || !node.startPoint || !node.endPoint) return;
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
    if (!node || !node.startPoint || !node.endPoint) return;
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

  // Helper to format node title
  const getNodeTitle = (n: DiagramNode) => {
    return n.type.toUpperCase() + ` (${n.id})`;
  };

  if (selectedNodes.length > 1) {
    const allShapes = selectedNodes.every(n => n.type !== 'line' && n.type !== 'arrow');
    const allConnectors = selectedNodes.every(n => n.type === 'line' || n.type === 'arrow');
    const noCircles = selectedNodes.every(n => n.type !== 'circle');

    const firstNode = selectedNodes[0];
    const getCommonStyleValue = (field: string, fallback: string) => {
      const isCommon = selectedNodes.every(n => n.style?.[field as keyof typeof n.style] === firstNode.style?.[field as keyof typeof firstNode.style]);
      return isCommon ? (firstNode.style?.[field as keyof typeof firstNode.style] || fallback) : fallback;
    };

    const getCommonValue = (field: keyof DiagramNode, fallback: any) => {
      const isCommon = selectedNodes.every(n => n[field] === firstNode[field]);
      return isCommon ? (firstNode[field] ?? fallback) : fallback;
    };

    const commonBg = getCommonStyleValue('backgroundColor', '#ffffff');
    const commonBorder = getCommonStyleValue('borderColor', '#333333');
    const commonTextColor = getCommonStyleValue('color', '#000000');
    const commonRadius = parseInt(getCommonStyleValue('borderRadius', '4px'), 10);
    const commonRotation = getCommonValue('rotation', 0);

    const commonLineCurve = getCommonValue('lineCurve', 'straight');
    const commonLineStyle = getCommonValue('lineStyle', 'solid');
    const commonArrowType = getCommonValue('arrowType', 'none');

    return (
      <div className={styles.overlay}>
        <div className={styles.header}>
          <h3>Mixed selection ({selectedNodes.length})</h3>
          <button className={styles.close} onClick={() => selectNode(null)}>
            <CloseIcon size={12} />
          </button>
        </div>

        <div className={styles.propertiesContent}>
          {allShapes && (
            <>
              {/* Layout Properties */}
              <div className={styles.section}>
                <span className={styles.sectionTitle}>Layout</span>
                <div className={styles.row}>
                  <span className={styles.rowLabel}>Rotation</span>
                  <div className={styles.sliderContainer} style={{ width: '120px' }}>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      value={commonRotation}
                      onChange={(e) => handleMultipleChange('rotation', parseInt(e.target.value, 10))}
                      className={styles.slider}
                    />
                    <div className={styles.inputWrapper} style={{ width: '45px' }}>
                      <input
                        type="number"
                        min="0"
                        max="360"
                        value={commonRotation}
                        onChange={(e) => handleMultipleChange('rotation', parseInt(e.target.value, 10) || 0)}
                        className={styles.numberInput}
                      />
                      <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>°</span>
                    </div>
                  </div>
                </div>

                {noCircles && (
                  <div className={styles.row}>
                    <span className={styles.rowLabel}>Corner</span>
                    <div className={styles.sliderContainer} style={{ width: '120px' }}>
                      <input
                        type="range"
                        min="0"
                        max="40"
                        value={commonRadius}
                        onChange={(e) => handleMultipleChange('borderRadius', `${e.target.value}px`)}
                        className={styles.slider}
                      />
                      <div className={styles.inputWrapper} style={{ width: '45px' }}>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={commonRadius}
                          onChange={(e) => handleMultipleChange('borderRadius', `${e.target.value}px`)}
                          className={styles.numberInput}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Fill Properties */}
              <div className={styles.section}>
                <span className={styles.sectionTitle}>Fill</span>
                <div className={styles.colorPickerWrapper}>
                  <input
                    type="color"
                    value={commonBg}
                    onChange={(e) => handleMultipleChange('backgroundColor', e.target.value)}
                  />
                  <span className={styles.colorHex}>{commonBg}</span>
                </div>
              </div>

              {/* Stroke Properties */}
              <div className={styles.section}>
                <span className={styles.sectionTitle}>Stroke</span>
                <div className={styles.colorPickerWrapper}>
                  <input
                    type="color"
                    value={commonBorder}
                    onChange={(e) => handleMultipleChange('borderColor', e.target.value)}
                  />
                  <span className={styles.colorHex}>{commonBorder}</span>
                </div>
              </div>

              {/* Text Properties */}
              <div className={styles.section}>
                <span className={styles.sectionTitle}>Text</span>
                <div className={styles.colorPickerWrapper}>
                  <input
                    type="color"
                    value={commonTextColor}
                    onChange={(e) => handleMultipleChange('color', e.target.value)}
                  />
                  <span className={styles.colorHex}>{commonTextColor}</span>
                </div>
              </div>
            </>
          )}

          {allConnectors && (
            <>
              {/* Stroke Properties */}
              <div className={styles.section}>
                <span className={styles.sectionTitle}>Stroke</span>
                <div className={styles.colorPickerWrapper} style={{ marginBottom: '10px' }}>
                  <input
                    type="color"
                    value={commonBorder}
                    onChange={(e) => handleMultipleChange('borderColor', e.target.value)}
                  />
                  <span className={styles.colorHex}>{commonBorder}</span>
                </div>

                <div className={styles.row}>
                  <span className={styles.rowLabel}>Route</span>
                  <select
                    className={styles.select}
                    value={commonLineCurve}
                    onChange={(e) => handleMultipleChange('lineCurve', e.target.value as 'straight' | 'curved')}
                  >
                    <option value="straight">Straight</option>
                    <option value="curved">Curved</option>
                  </select>
                </div>

                <div className={styles.row}>
                  <span className={styles.rowLabel}>Pattern</span>
                  <select
                    className={styles.select}
                    value={commonLineStyle}
                    onChange={(e) => handleMultipleChange('lineStyle', e.target.value as 'solid' | 'dashed')}
                  >
                    <option value="solid">Solid</option>
                    <option value="dashed">Dashed</option>
                  </select>
                </div>

                <div className={styles.row}>
                  <span className={styles.rowLabel}>Arrows</span>
                  <select
                    className={styles.select}
                    value={commonArrowType}
                    onChange={(e) => handleMultipleChange('arrowType', e.target.value as 'none' | 'single' | 'double')}
                  >
                    <option value="none">None</option>
                    <option value="single">Single End</option>
                    <option value="double">Double Ended</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {!allShapes && !allConnectors && (
            <div className={styles.section}>
              <span className={styles.sectionTitle}>Stroke</span>
              <div className={styles.colorPickerWrapper}>
                <input
                  type="color"
                  value={commonBorder}
                  onChange={(e) => handleMultipleChange('borderColor', e.target.value)}
                />
                <span className={styles.colorHex}>{commonBorder}</span>
              </div>
              <p style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '8px', fontStyle: 'italic', textAlign: 'center' }}>
                Mixed shapes selected. Edit line or border color above.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Single Selection Inspection
  const isLine = node.type === 'line' || node.type === 'arrow';

  return (
    <div className={styles.overlay}>
      <div className={styles.header}>
        <h3>{getNodeTitle(node)}</h3>
        <button className={styles.close} onClick={() => selectNode(null)}>
          <CloseIcon size={12} />
        </button>
      </div>

      <div className={styles.propertiesContent}>
        {/* Geometry / Layout Section */}
        <div className={styles.section}>
          <span className={styles.sectionTitle}>Alignment & Dimensions</span>
          <div className={styles.grid}>
            <div className={styles.inputWrapper}>
              <span className={styles.inputLabel}>X</span>
              <input
                type="number"
                className={styles.numberInput}
                value={Math.round(node.position.x)}
                onChange={(e) => handlePositionChange('x', parseInt(e.target.value, 10))}
              />
            </div>
            <div className={styles.inputWrapper}>
              <span className={styles.inputLabel}>Y</span>
              <input
                type="number"
                className={styles.numberInput}
                value={Math.round(node.position.y)}
                onChange={(e) => handlePositionChange('y', parseInt(e.target.value, 10))}
              />
            </div>
          </div>

          {!isLine ? (
            <div className={styles.grid}>
              <div className={styles.inputWrapper}>
                <span className={styles.inputLabel}>W</span>
                <input
                  type="number"
                  className={styles.numberInput}
                  value={Math.round(node.dimensions.width)}
                  onChange={(e) => handleDimensionChange('width', parseInt(e.target.value, 10))}
                  min={20}
                />
              </div>
              <div className={styles.inputWrapper}>
                <span className={styles.inputLabel}>H</span>
                <input
                  type="number"
                  className={styles.numberInput}
                  value={Math.round(node.dimensions.height)}
                  onChange={(e) => handleDimensionChange('height', parseInt(e.target.value, 10))}
                  min={20}
                />
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
                <div style={{ margin: '8px 0 4px 0', fontSize: '9px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '600' }}>Line Points</div>
                <div className={styles.grid}>
                  <div className={styles.inputWrapper}>
                    <span className={styles.inputLabel}>SX</span>
                    <input
                      type="number"
                      className={styles.numberInput}
                      value={Math.round(start.x)}
                      onChange={(e) => handleStartPointChange('x', parseInt(e.target.value, 10))}
                    />
                  </div>
                  <div className={styles.inputWrapper}>
                    <span className={styles.inputLabel}>SY</span>
                    <input
                      type="number"
                      className={styles.numberInput}
                      value={Math.round(start.y)}
                      onChange={(e) => handleStartPointChange('y', parseInt(e.target.value, 10))}
                    />
                  </div>
                </div>
                <div className={styles.grid}>
                  <div className={styles.inputWrapper}>
                    <span className={styles.inputLabel}>EX</span>
                    <input
                      type="number"
                      className={styles.numberInput}
                      value={Math.round(end.x)}
                      onChange={(e) => handleEndPointChange('x', parseInt(e.target.value, 10))}
                    />
                  </div>
                  <div className={styles.inputWrapper}>
                    <span className={styles.inputLabel}>EY</span>
                    <input
                      type="number"
                      className={styles.numberInput}
                      value={Math.round(end.y)}
                      onChange={(e) => handleEndPointChange('y', parseInt(e.target.value, 10))}
                    />
                  </div>
                </div>

                <div className={styles.row} style={{ marginTop: '8px' }}>
                  <span className={styles.rowLabel}>Length</span>
                  <div className={styles.inputWrapper} style={{ width: '60px' }}>
                    <input
                      type="number"
                      className={styles.numberInput}
                      value={length}
                      onChange={(e) => handleLengthChange(parseInt(e.target.value, 10))}
                      min={5}
                    />
                    <span style={{ fontSize: '9px', color: 'var(--text-muted)', marginLeft: '2px' }}>px</span>
                  </div>
                </div>
                
                <div className={styles.row}>
                  <span className={styles.rowLabel}>Angle</span>
                  <div className={styles.sliderContainer} style={{ width: '120px' }}>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      value={angle}
                      onChange={(e) => handleAngleChange(parseInt(e.target.value, 10))}
                      className={styles.slider}
                    />
                    <div className={styles.inputWrapper} style={{ width: '45px' }}>
                      <input
                        type="number"
                        min="0"
                        max="360"
                        value={angle}
                        onChange={(e) => handleAngleChange(parseInt(e.target.value, 10) || 0)}
                        className={styles.numberInput}
                      />
                      <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>°</span>
                    </div>
                  </div>
                </div>
              </>
            );
          })()}

          {!isLine && (
            <div className={styles.row} style={{ marginTop: '8px' }}>
              <span className={styles.rowLabel}>Rotation</span>
              <div className={styles.sliderContainer} style={{ width: '120px' }}>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={node.rotation || 0}
                  onChange={(e) => updateNode({ ...node, rotation: parseInt(e.target.value, 10) })}
                  className={styles.slider}
                />
                <div className={styles.inputWrapper} style={{ width: '45px' }}>
                  <input
                    type="number"
                    min="0"
                    max="360"
                    value={node.rotation || 0}
                    onChange={(e) => updateNode({ ...node, rotation: parseInt(e.target.value, 10) || 0 })}
                    className={styles.numberInput}
                  />
                  <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>°</span>
                </div>
              </div>
            </div>
          )}

          {!isLine && node.type !== 'circle' && (
            <div className={styles.row}>
              <span className={styles.rowLabel}>Corner</span>
              <div className={styles.sliderContainer} style={{ width: '120px' }}>
                <input
                  type="range"
                  min="0"
                  max="40"
                  value={parseInt(node.style?.borderRadius || (node.type === 'box' || node.type === 'diamond' ? '4' : '0'), 10)}
                  onChange={(e) => handleChange('borderRadius', `${e.target.value}px`)}
                  className={styles.slider}
                />
                <div className={styles.inputWrapper} style={{ width: '45px' }}>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={parseInt(node.style?.borderRadius || (node.type === 'box' || node.type === 'diamond' ? '4' : '0'), 10)}
                    onChange={(e) => handleChange('borderRadius', `${e.target.value}px`)}
                    className={styles.numberInput}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Text Area Content Section */}
        {!isLine && (
          <div className={styles.section}>
            <span className={styles.sectionTitle}>Content</span>
            <textarea
              className={styles.textarea}
              value={node.content}
              onChange={(e) => handleChange('content', e.target.value)}
              rows={3}
              placeholder="Enter text..."
            />
          </div>
        )}

        {/* Fill color picker */}
        {!isLine && (
          <div className={styles.section}>
            <span className={styles.sectionTitle}>Fill</span>
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

        {/* Stroke Section */}
        <div className={styles.section}>
          <span className={styles.sectionTitle}>Stroke</span>
          <div className={styles.colorPickerWrapper} style={{ marginBottom: '10px' }}>
            <input
              type="color"
              value={node.style?.borderColor || (node.type === 'line' ? '#475569' : node.type === 'arrow' ? '#0284c7' : '#333333')}
              onChange={(e) => handleChange('borderColor', e.target.value)}
            />
            <span className={styles.colorHex}>
              {node.style?.borderColor || (node.type === 'line' ? '#475569' : node.type === 'arrow' ? '#0284c7' : '#333333')}
            </span>
          </div>

          {isLine && (
            <>
              <div className={styles.row}>
                <span className={styles.rowLabel}>Route</span>
                <select
                  className={styles.select}
                  value={node.lineCurve || 'straight'}
                  onChange={(e) => updateNode({ ...node, lineCurve: e.target.value as 'straight' | 'curved' })}
                >
                  <option value="straight">Straight</option>
                  <option value="curved">Curved</option>
                </select>
              </div>

              <div className={styles.row}>
                <span className={styles.rowLabel}>Pattern</span>
                <select
                  className={styles.select}
                  value={node.lineStyle || 'solid'}
                  onChange={(e) => updateNode({ ...node, lineStyle: e.target.value as 'solid' | 'dashed' })}
                >
                  <option value="solid">Solid</option>
                  <option value="dashed">Dashed</option>
                </select>
              </div>

              <div className={styles.row}>
                <span className={styles.rowLabel}>Arrows</span>
                <select
                  className={styles.select}
                  value={node.arrowType || (node.type === 'arrow' ? 'single' : 'none')}
                  onChange={(e) => updateNode({ ...node, arrowType: e.target.value as 'none' | 'single' | 'double' })}
                >
                  <option value="none">None</option>
                  <option value="single">Single End</option>
                  <option value="double">Double Ended</option>
                </select>
              </div>
            </>
          )}
        </div>

        {/* Text styles section (Color) */}
        {!isLine && (
          <div className={styles.section}>
            <span className={styles.sectionTitle}>Text Color</span>
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
    </div>
  );
}
