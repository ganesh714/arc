import type { DiagramNode } from '../types';

export function generateExportCode(nodes: DiagramNode[]): string {
  let html = `<div style="position: relative; width: 1080px; height: 600px; border: 1px solid #ccc; background-color: #ffffff;">\n`;

  nodes.forEach((node) => {
    if (node.type === 'diamond') {
      const bg = node.style?.backgroundColor || '#fff3cd';
      const border = node.style?.borderColor || '#ffc107';
      const color = node.style?.color || '#000000';
      const fontSize = node.style?.fontSize || '16px';
      const radius = node.style?.borderRadius || '0px';
      
      html += `  <div style="position: absolute; left: ${node.position.x}px; top: ${node.position.y}px; width: ${node.dimensions.width}px; height: ${node.dimensions.height}px; display: flex; align-items: center; justify-content: center; font-family: sans-serif; z-index: 5;">\n`;
      html += `    <div style="width: 70.7%; height: 70.7%; transform: rotate(45deg); border: 2px solid ${border}; background-color: ${bg}; border-radius: ${radius}; display: flex; align-items: center; justify-content: center; box-sizing: border-box;">\n`;
      html += `      <div style="transform: rotate(-45deg); width: 141.4%; text-align: center; color: ${color}; font-size: ${fontSize}; word-wrap: break-word; padding: 4px;">\n`;
      html += `        ${node.content}\n`;
      html += `      </div>\n`;
      html += `    </div>\n`;
      html += `  </div>\n`;
    } else if (node.type === 'circle') {
      const bg = node.style?.backgroundColor || '#f1f5f9';
      const border = node.style?.borderColor || '#64748b';
      const color = node.style?.color || '#000000';
      const fontSize = node.style?.fontSize || '16px';
      
      html += `  <div style="position: absolute; left: ${node.position.x}px; top: ${node.position.y}px; width: ${node.dimensions.width}px; height: ${node.dimensions.height}px; display: flex; align-items: center; justify-content: center; font-family: sans-serif; z-index: 5;">\n`;
      html += `    <div style="width: 100%; height: 100%; border-radius: 50%; border: 2px solid ${border}; background-color: ${bg}; display: flex; align-items: center; justify-content: center; box-sizing: border-box;">\n`;
      html += `      <div style="text-align: center; color: ${color}; font-size: ${fontSize}; word-wrap: break-word; padding: 8px;">\n`;
      html += `        ${node.content}\n`;
      html += `      </div>\n`;
      html += `    </div>\n`;
      html += `  </div>\n`;
    } else if (node.type === 'triangle') {
      const bg = node.style?.backgroundColor || '#f0fdf4';
      const border = node.style?.borderColor || '#16a34a';
      const color = node.style?.color || '#000000';
      const fontSize = node.style?.fontSize || '16px';
      
      html += `  <div style="position: absolute; left: ${node.position.x}px; top: ${node.position.y}px; width: ${node.dimensions.width}px; height: ${node.dimensions.height}px; z-index: 5;">\n`;
      html += `    <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style="display: block;">\n`;
      html += `      <polygon points="50,3 97,97 3,97" fill="${bg}" stroke="${border}" stroke-width="2.5" vector-effect="non-scaling-stroke" />\n`;
      html += `    </svg>\n`;
      html += `    <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-family: sans-serif; pointer-events: none;">\n`;
      html += `      <div style="text-align: center; color: ${color}; font-size: ${fontSize}; word-wrap: break-word; padding: 30px 15px 15px 15px;">\n`;
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
        styleStr += `border-radius: ${node.style.borderRadius || '4px'}; `;
        styleStr += `display: flex; align-items: center; justify-content: center; font-family: sans-serif; `;
      } else {
        styleStr += `background-color: #f0f0f0; border: 2px solid #333; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-family: sans-serif; `;
      }
      
      html += `  <div style="${styleStr.trim()}">\n    ${node.content}\n  </div>\n`;
    }
  });

  html += `</div>`;

  return html;
}
