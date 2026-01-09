import { ScrollArea } from '@/components/ui/scroll-area';
import { FileTree } from '@/components/FileTree/FileTree';
import { useApp } from '@/contexts/AppContext';

export function FileExplorer() {
  const { files, selectedWorkspace, openFile } = useApp();

  return (
    <div className="w-full bg-[#181818] border-l border-[#2a2a2a] flex flex-col h-full">
      <div className="px-4 py-3 border-b border-[#2a2a2a]">
        <h3 className="text-sm font-semibold text-[#e0e0e0]">EXPLORER</h3>
      </div>

      <ScrollArea className="flex-1">
        {!selectedWorkspace ? (
          <div className="p-4 text-sm text-[#606060] text-center">
            Select a workspace to view files
          </div>
        ) : (
          <FileTree items={files} onFileClick={openFile} />
        )}
      </ScrollArea>
    </div>
  );
}
