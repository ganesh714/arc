import { DiagramProvider } from '@/context/DiagramContext';
import { Header } from '@/components/layout/Header';
import { LeftSidebar } from '@/components/layout/LeftSidebar';
import { SidePanel } from '@/components/layout/SidePanel';
import { Canvas } from '@/features/diagram/components/Canvas';

function App() {
  return (
    <DiagramProvider>
      <div className="flex flex-col h-screen w-full bg-slate-50 overflow-hidden relative">
        <Header />
        
        {/* Workspace Area */}
        <div className="flex flex-1 relative overflow-hidden bg-slate-100">
          {/* Overlays */}
          <LeftSidebar />
          <SidePanel />
          
          {/* Main Canvas */}
          <Canvas />
        </div>
      </div>
    </DiagramProvider>
  );
}

export default App;
