import { AppProvider, useApp } from '@/contexts/AppContext';
import { Sidebar } from '@/components/Sidebar/Sidebar';
import { MainContent } from '@/components/MainContent';
import { FileExplorer } from '@/components/FileExplorer';
import { ResizableHandle } from '@/components/ResizableHandle';

function AppContent() {
  const { sidebarWidth, explorerWidth, setSidebarWidth, setExplorerWidth } = useApp();

  const MIN_SIDEBAR_WIDTH = 200;
  const MAX_SIDEBAR_WIDTH = 500;
  const MIN_EXPLORER_WIDTH = 200;
  const MAX_EXPLORER_WIDTH = 500;

  const handleSidebarResize = (delta: number) => {
    setSidebarWidth((prev) => {
      const newWidth = prev + delta;
      return Math.max(MIN_SIDEBAR_WIDTH, Math.min(MAX_SIDEBAR_WIDTH, newWidth));
    });
  };

  const handleExplorerResize = (delta: number) => {
    setExplorerWidth((prev) => {
      const newWidth = prev + delta;
      return Math.max(MIN_EXPLORER_WIDTH, Math.min(MAX_EXPLORER_WIDTH, newWidth));
    });
  };

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-[#181818] text-[#cccccc]">
      <div style={{ width: `${sidebarWidth}px` }} className="flex-shrink-0">
        <Sidebar />
      </div>
      <ResizableHandle direction="right" onDrag={handleSidebarResize} />
      <div className="flex-1 flex flex-col min-w-0">
        <MainContent />
      </div>
      <ResizableHandle direction="left" onDrag={handleExplorerResize} />
      <div style={{ width: `${explorerWidth}px` }} className="flex-shrink-0">
        <FileExplorer />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
