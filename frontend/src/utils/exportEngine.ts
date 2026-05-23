import type { DiagramNode } from '../types';

export function generateExportCode(nodes: DiagramNode[]): string {
  let html = `<div style="position: relative; width: 1080px; height: 600px; border: 1px solid #ccc; background-color: #ffffff;">\n`;

  nodes.forEach((node) => {
    let styleStr = `position: absolute; left: ${node.position.x}px; top: ${node.position.y}px; width: ${node.dimensions.width}px; height: ${node.dimensions.height}px; box-sizing: border-box; `;
    
    if (node.style) {
      if (node.style.backgroundColor) styleStr += `background-color: ${node.style.backgroundColor}; `;
      if (node.style.borderColor) styleStr += `border: 1px solid ${node.style.borderColor}; `;
      if (node.style.color) styleStr += `color: ${node.style.color}; `;
      if (node.style.fontSize) styleStr += `font-size: ${node.style.fontSize}; `;
      // Add default flex centering if you want, but for now we'll just add the specified styles
      styleStr += `display: flex; align-items: center; justify-content: center; font-family: sans-serif; `;
    } else {
      // Default styles
      styleStr += `background-color: #f0f0f0; border: 1px solid #333; display: flex; align-items: center; justify-content: center; font-family: sans-serif; `;
    }
    
    html += `  <div style="${styleStr.trim()}">\n    ${node.content}\n  </div>\n`;
  });

  html += `</div>`;

  return html;
}
