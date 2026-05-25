import { useDiagram } from '@/context/DiagramContext';
import { Node } from './Node';
import styles from './Canvas.module.css';

export function Canvas() {
  const { 
    nodes, 
    selectNode,
    addBox,
    addDiamond,
    addCircle,
    addTriangle,
    addLine,
    addArrow
  } = useDiagram();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('application/loom-node-type');
    if (!type) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (type === 'box') addBox({ x, y });
    else if (type === 'diamond') addDiamond({ x, y });
    else if (type === 'circle') addCircle({ x, y });
    else if (type === 'triangle') addTriangle({ x, y });
    else if (type === 'line') addLine({ x, y });
    else if (type === 'arrow') addArrow({ x, y });
  };

  return (
    <div className={styles.canvasWrapper}>
      <div 
        className={styles.canvas} 
        onClick={() => selectNode(null)}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {nodes.map((node) => (
          <Node key={node.id} node={node} />
        ))}
      </div>
    </div>
  );
}
