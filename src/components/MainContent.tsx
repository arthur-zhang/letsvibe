import { TabBar } from '@/components/TabBar/TabBar';
import { ChatPanel } from '@/components/ChatPanel/ChatPanel';
import { CodeViewer } from '@/components/CodeViewer/CodeViewer';
import { useApp } from '@/contexts/AppContext';

export function MainContent() {
  const { activeTab, currentFile } = useApp();

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <TabBar />

      <div className="flex-1 min-h-0 overflow-hidden">
        {activeTab === 'chat' ? (
          <ChatPanel />
        ) : (
          <div className="h-full bg-[#181818]">
            {currentFile ? (
              <CodeViewer
                content={currentFile.content}
                fileName={currentFile.name}
                filePath={currentFile.path}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-[#606060]">
                <div className="text-center">
                  <p className="text-lg mb-2">No file open</p>
                  <p className="text-sm">Select a file from the file tree to view its contents</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
