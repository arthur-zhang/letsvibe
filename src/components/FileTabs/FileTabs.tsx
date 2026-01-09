import { X } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { CodeViewer } from '@/components/CodeViewer/CodeViewer';
import { useApp } from '@/contexts/AppContext';

export function FileTabs() {
  const { openFiles, activeFileId, closeFile, setActiveFile } = useApp();

  // 如果没有打开的文件，显示空状态
  if (openFiles.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-[#181818] text-[#909090]">
        <div className="text-center">
          <p className="text-lg mb-2">No files open</p>
          <p className="text-sm">Select a file from the file tree to view its contents</p>
        </div>
      </div>
    );
  }

  return (
    <Tabs
      value={activeFileId || openFiles[0]?.id}
      onValueChange={setActiveFile}
      className="h-full flex flex-col bg-[#181818] overflow-hidden"
    >
      <TabsList className="flex-shrink-0 w-full h-10 justify-start rounded-none bg-[#1a1a1a] border-b border-[#2a2a2a] p-0">
        {openFiles.map((file) => (
          <div
            key={file.id}
            className="relative flex items-center group"
          >
            <TabsTrigger
              value={file.id}
              className="h-10 px-4 pr-8 rounded-none border-r border-[#2a2a2a] text-[#909090] data-[state=active]:bg-[#181818] data-[state=active]:text-white hover:bg-[#222222] transition-colors"
            >
              {file.name}
            </TabsTrigger>
            <button
              onClick={(e) => {
                e.stopPropagation();
                closeFile(file.id);
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-[#3e3e42] opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label={`Close ${file.name}`}
            >
              <X className="h-3 w-3 text-[#909090] hover:text-white" />
            </button>
          </div>
        ))}
      </TabsList>

      {openFiles.map((file) => (
        <TabsContent
          key={file.id}
          value={file.id}
          className="flex-1 m-0 min-h-0 overflow-hidden data-[state=inactive]:hidden"
        >
          <CodeViewer
            content={file.content}
            fileName={file.name}
            filePath={file.path}
          />
        </TabsContent>
      ))}
    </Tabs>
  );
}
