import { FileTabs } from '@/components/FileTabs/FileTabs';
import { Terminal } from '@/components/Terminal/Terminal';

export function MainContent() {
  return (
    <div className="flex-1 flex flex-col">
      <FileTabs />
      <Terminal />
    </div>
  );
}
