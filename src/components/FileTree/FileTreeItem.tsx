import { useState } from 'react';
import type { FileItem } from '@/types';

interface FileTreeItemProps {
  item: FileItem;
  level: number;
  onFileClick: (file: FileItem) => void;
}

export function FileTreeItem({ item, level, onFileClick }: FileTreeItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleClick = () => {
    if (item.is_directory) {
      setIsExpanded(!isExpanded);
    } else {
      onFileClick(item);
    }
  };

  return (
    <div>
      <div
        className="flex items-center gap-1 px-2 py-1 hover:bg-[#2a2a2a] cursor-pointer text-sm"
        style={{ paddingLeft: `${level * 12 + 8}px` }}
        onClick={handleClick}
      >
        {item.is_directory && (
          <span className="text-[#909090] w-4">
            {isExpanded ? '▾' : '▸'}
          </span>
        )}
        {!item.is_directory && <span className="w-4"></span>}
        <span className={item.is_directory ? 'text-[#4a9eff]' : 'text-[#e0e0e0]'}>
          {item.name}
        </span>
      </div>

      {item.is_directory && isExpanded && item.children && (
        <div>
          {item.children.map((child) => (
            <FileTreeItem
              key={child.path}
              item={child}
              level={level + 1}
              onFileClick={onFileClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}
