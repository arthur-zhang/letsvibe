import { useState } from 'react';
import type { RepoWithWorkspaces } from '@/types';
import { WorkspaceList } from './WorkspaceList';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useApp } from '@/contexts/AppContext';

interface RepositoryItemProps {
  repo: RepoWithWorkspaces;
}

export function RepositoryItem({ repo }: RepositoryItemProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const { deleteRepository } = useApp();

  return (
    <div className="border-b border-[#333]">
      <div
        className="px-4 py-2 hover:bg-[#2a2a2a] cursor-pointer flex items-center justify-between group"
        onMouseEnter={() => setShowMenu(true)}
        onMouseLeave={() => setShowMenu(false)}
      >
        <div
          className="flex items-center gap-2 flex-1"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <span className="text-[#909090]">{isExpanded ? '▾' : '▸'}</span>
          <span className="text-sm font-medium text-[#e0e0e0]">
            {repo.name || 'Unnamed Repository'}
          </span>
        </div>

        {showMenu && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="text-[#909090] hover:text-[#e0e0e0] px-2">
                ⋮
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-[#2a2a2a] border-[#444]">
              <DropdownMenuItem
                onClick={() => deleteRepository(repo.id)}
                className="text-[#f87171] focus:bg-[#383838] focus:text-[#f87171]"
              >
                Delete Repository
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {isExpanded && (
        <WorkspaceList workspaces={repo.workspaces} repoId={repo.id} />
      )}
    </div>
  );
}
