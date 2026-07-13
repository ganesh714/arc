const code = `graph TD
  A[Client] --> B{Load Balancer}
  B -->|Traffic| C[(Primary Database)]
  B -.->|Failover| D[(Replica Database)]
  C --- E([Internal Service])`;

// 1. We first extract any edge by looking for arrow patterns: -->, ---, -.->, ==>
// An edge splits the line into left and right.
const edgeSplitRegex = /(-->|---|-.->|==>)/;

const parseNode = (nodeStr) => {
    nodeStr = nodeStr.trim();
    const nodeRegex = /^([a-zA-Z0-9_-]+)(?:\[\((.*?)\)\]|\[\/(.*?)\/\]|\(\((.*?)\)\)|\{(.*?)\}|\(\[(.*?)\]\)|\((.*?)\)|\[(.*?)\])?$/;
    const match = nodeStr.match(nodeRegex);
    if (!match) return { id: nodeStr, content: nodeStr, type: 'box' };
    
    const id = match[1];
    let type = 'box';
    let content = id;
    
    if (match[2] !== undefined) { type = 'database'; content = match[2]; } // [()]
    else if (match[3] !== undefined) { type = 'parallelogram'; content = match[3]; } // [/ /]
    else if (match[4] !== undefined) { type = 'circle'; content = match[4]; } // (())
    else if (match[5] !== undefined) { type = 'diamond'; content = match[5]; } // {}
    else if (match[6] !== undefined) { type = 'pill'; content = match[6]; } // ([])
    else if (match[7] !== undefined) { type = 'rounded-rect'; content = match[7]; } // ()
    else if (match[8] !== undefined) { type = 'box'; content = match[8]; } // []
    
    return { id, content, type };
};

const lines = code.split('\n');
lines.forEach(l => {
    l = l.trim();
    if (!l || l.startsWith('graph')) return;
    
    // Check for inline edge labels: A -->|Label| B
    let label = '';
    let edgeType = '-->';
    
    // Extract |label| if present
    const pipeLabelMatch = l.match(/\|(.*?)\|/);
    if (pipeLabelMatch) {
        label = pipeLabelMatch[1];
        l = l.replace(`|${label}|`, '');
    }
    
    // Alternative label: A -- label --> B
    const textLabelMatch = l.match(/--\s+(.*?)\s+-->/);
    if (textLabelMatch) {
        label = textLabelMatch[1];
        l = l.replace(textLabelMatch[0], '-->');
    }
    
    const parts = l.split(edgeSplitRegex);
    if (parts.length >= 3) {
        const leftNode = parseNode(parts[0]);
        edgeType = parts[1];
        const rightNode = parseNode(parts.slice(2).join(''));
        console.log('EDGE:', leftNode.id, edgeType, rightNode.id, 'Label:', label);
        console.log('  Left:', leftNode);
        console.log('  Right:', rightNode);
    } else {
        const node = parseNode(l);
        console.log('NODE:', node);
    }
});
