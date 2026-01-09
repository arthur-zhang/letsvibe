import { FileTreeItem } from './FileTreeItem';
import type { FileItem } from '@/types';

interface FileTreeProps {
  items: FileItem[];
  onFileClick: (file: FileItem) => void;
}

export function FileTree({ items, onFileClick }: FileTreeProps) {
  if (items.length === 0) {
    return (
      <div className="p-4 text-sm text-[#606060] text-center">
        No files to display
      </div>
    );
  }

  return (
    <div className="text-sm">
      {items.map((item) => (
        <FileTreeItem
          key={item.path}
          item={item}
          level={0}
          onFileClick={onFileClick}
        />
      ))}
    </div>
  );
}
