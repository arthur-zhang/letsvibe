import type { Workspace } from '@/types';
import { useApp } from '@/contexts/AppContext';
import { formatDate } from '@/lib/utils';

interface WorkspaceListProps {
  workspaces: Workspace[];
  repoId: string;
}

export function WorkspaceList({ workspaces, repoId }: WorkspaceListProps) {
  const { selectedWorkspace, selectWorkspace, createWorkspace, deleteWorkspace } = useApp();

  const handleCreateWorkspace = () => {
    createWorkspace(repoId);
  };

  return (
    <div className="ml-4">
      <button
        onClick={handleCreateWorkspace}
        className="w-full text-left px-3 py-1.5 text-sm hover:bg-[#2a2a2a] text-[#4a9eff] flex items-center gap-2"
      >
        <span>+</span> New Workspace
      </button>

      {workspaces.map((workspace) => {
        const isSelected = selectedWorkspace === workspace.id;
        const stats = [];
        if (workspace.git_insertions) stats.push(`+${workspace.git_insertions}`);
        if (workspace.git_deletions) stats.push(`-${workspace.git_deletions}`);

        return (
          <div
            key={workspace.id}
            className={`px-3 py-1.5 text-sm cursor-pointer group flex items-center justify-between ${
              isSelected ? 'bg-[#2a2a2a] text-[#e0e0e0]' : 'text-[#909090] hover:bg-[#2a2a2a] hover:text-[#e0e0e0]'
            }`}
            onClick={() => selectWorkspace(workspace.id)}
          >
            <div className="flex-1 min-w-0">
              <div className="font-medium">{workspace.directory_name || workspace.branch}</div>
              <div className="text-xs flex items-center gap-2 mt-0.5">
                {workspace.branch && (
                  <span className="text-[#4a9eff]">{workspace.branch}</span>
                )}
                {stats.length > 0 && (
                  <span className="text-[#606060]">{stats.join(' ')}</span>
                )}
              </div>
              {workspace.updated_at && (
                <div className="text-xs text-[#606060] mt-0.5">
                  {formatDate(workspace.updated_at)}
                </div>
              )}
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteWorkspace(workspace.id);
              }}
              className="opacity-0 group-hover:opacity-100 text-[#606060] hover:text-[#f87171] px-1"
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  );
}
