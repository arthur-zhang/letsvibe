import { FileTabs } from '@/components/FileTabs/FileTabs';
import { Terminal } from '@/components/Terminal/Terminal';

export function MainContent() {
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <div className="flex-1 min-h-0 overflow-hidden">
        <FileTabs />
      </div>
      <Terminal />
    </div>
  );
}
