import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { detectLanguage } from '@/lib/utils';

interface CodeViewerProps {
  content: string;
  fileName: string;
  filePath: string;
}

export function CodeViewer({ content, fileName, filePath }: CodeViewerProps) {
  const language = detectLanguage(fileName);

  return (
    <div className="h-full flex flex-col bg-[#1e1e1e] overflow-hidden">
      <div className="flex-shrink-0 px-4 py-2 border-b border-[#333] flex items-center justify-between">
        <div className="text-sm text-[#909090]">{filePath}</div>
      </div>

      <div className="flex-1 overflow-auto min-h-0">
        <SyntaxHighlighter
          language={language}
          style={vscDarkPlus}
          showLineNumbers
          customStyle={{
            margin: 0,
            background: '#1e1e1e',
            fontSize: '13px',
            padding: '16px',
          }}
          lineNumberStyle={{
            minWidth: '3em',
            paddingRight: '1em',
            color: '#858585',
            textAlign: 'right',
            userSelect: 'none',
          }}
          wrapLongLines
        >
          {content}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
