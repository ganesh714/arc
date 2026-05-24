import React, { useState } from 'react'
import { Rnd } from 'react-rnd'
import type { DiagramNode } from './types'
import { generateExportCode } from './utils/exportEngine'
import { ExportModal } from './components/ExportModal'
import { SidePanel } from './components/SidePanel'
import { LeftSidebar } from './components/LeftSidebar'
import './App.css'

function App() {
  const [nodes, setNodes] = useState<DiagramNode[]>([])
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [exportData, setExportData] = useState('')

  const handleAddBox = () => {
    const newNode: DiagramNode = {
      id: crypto.randomUUID().split('-')[0], // Shorter ID for cleaner CSS classes
      type: 'box',
      position: { x: 50, y: 50 },
      dimensions: { width: 150, height: 100 },
      content: 'New Box',
      style: {
        backgroundColor: '#e0f2fe',
        borderColor: '#0284c7',
        color: '#0f172a'
      }
    }
    setNodes([...nodes, newNode])
  }

  const handleDragStop = (id: string, d: { x: number, y: number }) => {
    setNodes(nodes.map(node => 
      node.id === id ? { ...node, position: { x: d.x, y: d.y } } : node
    ))
  }

  const handleResizeStop = (
    id: string, 
    ref: HTMLElement, 
    position: { x: number, y: number }
  ) => {
    setNodes(nodes.map(node => 
      node.id === id ? { 
        ...node, 
        dimensions: { 
          width: parseInt(ref.style.width, 10), 
          height: parseInt(ref.style.height, 10) 
        },
        position
      } : node
    ))
  }

  const handleExport = () => {
    const html = generateExportCode(nodes)
    setExportData(html)
    setIsModalOpen(true)
  }

  const handleUpdateNode = (updatedNode: DiagramNode) => {
    setNodes(nodes.map(node => node.id === updatedNode.id ? updatedNode : node))
  }

  return (
    <div className="app-container">
      <header className="toolbar">
        <h1>Project Loom</h1>
        <div className="toolbar-actions">
          <button onClick={handleAddBox} className="btn primary">Add Box</button>
          <button onClick={handleExport} className="btn secondary">Export HTML</button>
        </div>
      </header>
      <div className="main-layout">
        <LeftSidebar />
        
        <main className="workspace">
          <div className="canvas" onClick={() => setSelectedNodeId(null)}>
            {nodes.map(node => (
              <Rnd
                key={node.id}
                position={node.position}
                size={{ width: node.dimensions.width, height: node.dimensions.height }}
                onDragStart={() => setSelectedNodeId(node.id)}
                onDragStop={(_e, d) => handleDragStop(node.id, d)}
                onResizeStop={(_e, _direction, ref, _delta, position) => handleResizeStop(node.id, ref, position)}
                bounds="parent"
                className={`diagram-node ${selectedNodeId === node.id ? 'selected' : ''}`}
                onMouseDown={(e) => {
                  e.stopPropagation()
                  setSelectedNodeId(node.id)
                }}
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation()
                }}
                style={{
                  backgroundColor: node.style?.backgroundColor || '#f0f0f0',
                  border: `2px solid ${selectedNodeId === node.id ? '#3b82f6' : node.style?.borderColor || '#333'}`,
                  color: node.style?.color || '#000',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: node.style?.fontSize || '16px'
                }}
              >
                {node.content}
              </Rnd>
            ))}
          </div>
        </main>

        <SidePanel
          node={nodes.find(n => n.id === selectedNodeId) || null}
          onUpdate={handleUpdateNode}
          onClose={() => setSelectedNodeId(null)}
        />
      </div>

      <ExportModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        htmlCode={exportData}
      />
    </div>
  )
}

export default App
