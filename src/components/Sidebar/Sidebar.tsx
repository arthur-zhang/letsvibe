import { SidebarHeader } from './SidebarHeader';
import { RepositoryList } from './RepositoryList';
import { AddMenu } from './AddMenu';

export function Sidebar() {
  return (
    <div className="w-72 bg-[#252525] border-r border-[#333] flex flex-col">
      <SidebarHeader />
      <RepositoryList />
      <AddMenu />
    </div>
  );
}
