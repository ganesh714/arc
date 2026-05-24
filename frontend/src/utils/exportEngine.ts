import type { DiagramNode } from '../types';

export function generateExportCode(nodes: DiagramNode[]): string {
  let html = `<div style="position: relative; width: 1080px; height: 600px; border: 1px solid #ccc; background-color: #ffffff;">\n`;

  nodes.forEach((node) => {
    if (node.type === 'diamond') {
      const bg = node.style?.backgroundColor || '#fff3cd';
      const border = node.style?.borderColor || '#ffc107';
      const color = node.style?.color || '#000000';
      const fontSize = node.style?.fontSize || '16px';
      
      html += `  <div style="position: absolute; left: ${node.position.x}px; top: ${node.position.y}px; width: ${node.dimensions.width}px; height: ${node.dimensions.height}px; display: flex; align-items: center; justify-content: center; font-family: sans-serif; z-index: 5;">\n`;
      html += `    <div style="width: 70.7%; height: 70.7%; transform: rotate(45deg); border: 2px solid ${border}; background-color: ${bg}; display: flex; align-items: center; justify-content: center; box-sizing: border-box;">\n`;
      html += `      <div style="transform: rotate(-45deg); width: 141.4%; text-align: center; color: ${color}; font-size: ${fontSize}; word-wrap: break-word; padding: 4px;">\n`;
      html += `        ${node.content}\n`;
      html += `      </div>\n`;
      html += `    </div>\n`;
      html += `  </div>\n`;
    } else {
      let styleStr = `position: absolute; left: ${node.position.x}px; top: ${node.position.y}px; width: ${node.dimensions.width}px; height: ${node.dimensions.height}px; box-sizing: border-box; `;
      
      if (node.style) {
        if (node.style.backgroundColor) styleStr += `background-color: ${node.style.backgroundColor}; `;
        if (node.style.borderColor) styleStr += `border: 2px solid ${node.style.borderColor}; `;
        if (node.style.color) styleStr += `color: ${node.style.color}; `;
        if (node.style.fontSize) styleStr += `font-size: ${node.style.fontSize}; `;
        styleStr += `display: flex; align-items: center; justify-content: center; font-family: sans-serif; `;
      } else {
        styleStr += `background-color: #f0f0f0; border: 2px solid #333; display: flex; align-items: center; justify-content: center; font-family: sans-serif; `;
      }
      
      html += `  <div style="${styleStr.trim()}">\n    ${node.content}\n  </div>\n`;
    }
  });

  html += `</div>`;

  return html;
}
