import { AppProvider } from '@/contexts/AppContext';
import { Sidebar } from '@/components/Sidebar/Sidebar';
import { MainContent } from '@/components/MainContent';
import { FileExplorer } from '@/components/FileExplorer';

export default function App() {
  return (
    <AppProvider>
      <div className="h-screen w-screen flex overflow-hidden bg-[#1e1e1e] text-[#cccccc]">
        <Sidebar />
        <MainContent />
        <FileExplorer />
      </div>
    </AppProvider>
  );
}
