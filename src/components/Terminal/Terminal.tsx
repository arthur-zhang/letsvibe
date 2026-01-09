import { useApp } from '@/contexts/AppContext';

export function Terminal() {
  const { terminalOutput, showTerminal, toggleTerminal } = useApp();

  return (
    <div className="flex-shrink-0 border-t border-[#333] bg-[#1e1e1e] flex flex-col">
      <div
        className="px-4 py-2 border-b border-[#333] flex items-center justify-between cursor-pointer hover:bg-[#252525]"
        onClick={toggleTerminal}
      >
        <span className="text-sm text-[#e0e0e0] font-medium">Terminal</span>
        <span className="text-[#909090] text-xs">
          {showTerminal ? '▾' : '▸'}
        </span>
      </div>

      {showTerminal && (
        <div className="h-48 overflow-auto p-4 font-mono text-xs">
          {terminalOutput.map((line, index) => (
            <div
              key={index}
              className={
                line.startsWith('✓')
                  ? 'text-[#4ade80]'
                  : line.startsWith('✗')
                  ? 'text-[#f87171]'
                  : 'text-[#909090]'
              }
            >
              {line}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
