import { useState } from 'react';
import type { FileItem } from '@/types';

interface FileTreeItemProps {
  item: FileItem;
  level: number;
  parentPath: string;
  onFileClick: (path: string, name: string) => void;
}

export function FileTreeItem({ item, level, parentPath, onFileClick }: FileTreeItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isFolder = item.type === 'folder';

  const handleClick = () => {
    if (isFolder) {
      setIsExpanded(!isExpanded);
    } else {
      // Build the full path
      const fullPath = parentPath ? `${parentPath}/${item.name}` : item.name;
      onFileClick(fullPath, item.name);
    }
  };

  const getChildPath = () => {
    return parentPath ? `${parentPath}/${item.name}` : item.name;
  };

  return (
    <div>
      <div
        className="flex items-center gap-1 px-2 py-1 hover:bg-[#2a2a2a] cursor-pointer text-sm"
        style={{ paddingLeft: `${level * 12 + 8}px` }}
        onClick={handleClick}
      >
        {isFolder && (
          <span className="text-[#909090] w-4">
            {isExpanded ? '▾' : '▸'}
          </span>
        )}
        {!isFolder && <span className="w-4"></span>}
        <span className={isFolder ? 'text-[#4a9eff]' : 'text-[#e0e0e0]'}>
          {item.name}
        </span>
      </div>

      {isFolder && isExpanded && item.children && (
        <div>
          {item.children.map((child) => (
            <FileTreeItem
              key={child.name}
              item={child}
              level={level + 1}
              parentPath={getChildPath()}
              onFileClick={onFileClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}
