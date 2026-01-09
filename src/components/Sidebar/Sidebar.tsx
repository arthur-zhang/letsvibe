import { SidebarHeader } from './SidebarHeader';
import { RepositoryList } from './RepositoryList';
import { AddMenu } from './AddMenu';

export function Sidebar() {
  return (
    <div className="w-full bg-[#1a1a1a] border-r border-[#2a2a2a] flex flex-col h-full">
      <SidebarHeader />
      <RepositoryList />
      <AddMenu />
    </div>
  );
}
