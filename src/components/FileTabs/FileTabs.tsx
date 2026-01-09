import { X } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { CodeViewer } from '@/components/CodeViewer/CodeViewer';
import { useApp } from '@/contexts/AppContext';

export function FileTabs() {
  const { openFiles, activeFileId, closeFile, setActiveFile } = useApp();

  // 如果没有打开的文件，显示空状态
  if (openFiles.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-[#1e1e1e] text-[#909090]">
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
      className="h-full flex flex-col bg-[#1e1e1e]"
    >
      <TabsList className="w-full h-10 justify-start rounded-none bg-[#252526] border-b border-[#333] p-0">
        {openFiles.map((file) => (
          <div
            key={file.id}
            className="relative flex items-center group"
          >
            <TabsTrigger
              value={file.id}
              className="h-10 px-4 pr-8 rounded-none border-r border-[#333] text-[#909090] data-[state=active]:bg-[#1e1e1e] data-[state=active]:text-white hover:bg-[#2a2d2e] transition-colors"
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
          className="flex-1 m-0 h-full data-[state=inactive]:hidden"
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
