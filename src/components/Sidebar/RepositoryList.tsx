import { ScrollArea } from '@/components/ui/scroll-area';
import { RepositoryItem } from './RepositoryItem';
import { useApp } from '@/contexts/AppContext';

export function RepositoryList() {
  const { repositories, isLoading } = useApp();

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center text-[#606060] text-sm">
        Loading repositories...
      </div>
    );
  }

  if (repositories.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-[#606060] text-sm text-center p-4">
        <div>
          <p>No repositories yet</p>
          <p className="text-xs mt-1">Use the Add button below to get started</p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1">
      {repositories.map((repo) => (
        <RepositoryItem key={repo.id} repo={repo} />
      ))}
    </ScrollArea>
  );
}
