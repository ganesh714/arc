import type { DiagramNode } from '../types';

export interface ExportResult {
  html: string;
  scss: string;
}

export function generateExportCode(nodes: DiagramNode[]): ExportResult {
  let html = `<div class="loom-canvas">\n`;
  let scss = `.loom-canvas {\n  position: relative;\n  width: 1080px;\n  height: 600px;\n  border: 1px solid #ccc;\n  background-color: #ffffff;\n}\n\n`;

  nodes.forEach((node) => {
    const className = `loom-node-${node.id}`;
    html += `  <div class="${className}">\n    ${node.content}\n  </div>\n`;

    scss += `.${className} {\n`;
    scss += `  position: absolute;\n`;
    scss += `  left: ${node.position.x}px;\n`;
    scss += `  top: ${node.position.y}px;\n`;
    scss += `  width: ${node.dimensions.width}px;\n`;
    scss += `  height: ${node.dimensions.height}px;\n`;
    scss += `  box-sizing: border-box;\n`;
    
    if (node.style) {
      if (node.style.backgroundColor) scss += `  background-color: ${node.style.backgroundColor};\n`;
      if (node.style.borderColor) scss += `  border: 1px solid ${node.style.borderColor};\n`;
      if (node.style.color) scss += `  color: ${node.style.color};\n`;
      if (node.style.fontSize) scss += `  font-size: ${node.style.fontSize};\n`;
    } else {
      // Default styles
      scss += `  background-color: #f0f0f0;\n`;
      scss += `  border: 1px solid #333;\n`;
      scss += `  display: flex;\n`;
      scss += `  align-items: center;\n`;
      scss += `  justify-content: center;\n`;
      scss += `  font-family: sans-serif;\n`;
    }
    scss += `}\n\n`;
  });

  html += `</div>`;

  return { html, scss };
}
