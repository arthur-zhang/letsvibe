import { SidebarHeader } from './SidebarHeader';
import { RepositoryList } from './RepositoryList';
import { AddMenu } from './AddMenu';

export function Sidebar() {
  return (
    <div className="w-full bg-[#252525] border-r border-[#333] flex flex-col h-full">
      <SidebarHeader />
      <RepositoryList />
      <AddMenu />
    </div>
  );
}
