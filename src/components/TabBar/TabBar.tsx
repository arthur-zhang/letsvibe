import { FileText, Sparkles, Plus, X } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

export function TabBar() {
  const { activeTab, setActiveTab, currentFile, closeCurrentFile } = useApp();

  return (
    <div className="flex-shrink-0 h-12 bg-[#181818] border-b border-[#2a2a2a] flex items-center px-2 gap-1">
      {/* Left icons placeholder */}
      <button className="p-2 rounded hover:bg-[#2a2a2a] text-[#909090] transition-colors">
        <FileText className="w-4 h-4" />
      </button>

      {/* File Tab - 只在有文件时显示 */}
      {currentFile && (
        <div className="relative flex items-center group">
          <button
            onClick={() => setActiveTab('file')}
            className={`flex items-center gap-2 px-4 pr-8 h-10 rounded-t border-b-2 transition-colors ${
              activeTab === 'file'
                ? 'bg-[#1a1a1a] border-[#4a9eff] text-white'
                : 'border-transparent text-[#909090] hover:text-white hover:bg-[#2a2a2a]'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span className="text-sm">{currentFile.name}</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              closeCurrentFile();
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-[#3e3e42] opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label={`Close ${currentFile.name}`}
          >
            <X className="h-3 w-3 text-[#909090] hover:text-white" />
          </button>
        </div>
      )}

      {/* Claude Tab */}
      <button
        onClick={() => setActiveTab('chat')}
        className={`flex items-center gap-2 px-4 h-10 rounded-t border-b-2 transition-colors ${
          activeTab === 'chat'
            ? 'bg-[#1a1a1a] border-[#4a9eff] text-white'
            : 'border-transparent text-[#909090] hover:text-white hover:bg-[#2a2a2a]'
        }`}
      >
        <Sparkles className="w-4 h-4" />
        <span className="text-sm">Claude</span>
      </button>

      {/* Add button */}
      <button className="p-2 ml-1 rounded hover:bg-[#2a2a2a] text-[#909090] transition-colors">
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
}
