import { FileTreeItem } from './FileTreeItem';
import type { FileItem } from '@/types';

interface FileTreeProps {
  items: FileItem[];
  onFileClick: (path: string, name: string) => void;
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
          key={item.name}
          item={item}
          level={0}
          parentPath=""
          onFileClick={onFileClick}
        />
      ))}
    </div>
  );
}
