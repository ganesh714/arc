import { useDiagram } from '@/context/DiagramContext';
import { Node } from './Node';
import styles from './Canvas.module.css';

export function Canvas() {
  const { nodes, selectNode } = useDiagram();

  return (
    <div className={styles.canvasWrapper}>
      <div className={styles.canvas} onClick={() => selectNode(null)}>
        {nodes.map((node) => (
          <Node key={node.id} node={node} />
        ))}
      </div>
    </div>
  );
}
