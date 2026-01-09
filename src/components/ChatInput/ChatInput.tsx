import { useState } from 'react';
import { Sparkles, Brain, Clipboard, Code, Ban, Paperclip, ArrowUp } from 'lucide-react';

export function ChatInput() {
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  const handleSubmit = () => {
    if (input.trim()) {
      console.log('Sending message:', input);
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex-shrink-0 border-t border-[#2a2a2a] bg-[#1f1f1f] p-4">
      <div className="max-w-4xl mx-auto">
        {/* Input Area */}
        <div className="bg-[#2a2a2a] rounded-lg border border-[#3a3a3a] overflow-hidden">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask to make changes, @mention files, run /commands"
            className="w-full bg-transparent text-[#cccccc] placeholder-[#606060] px-4 py-3 resize-none outline-none"
            rows={3}
          />

          {/* Toolbar */}
          <div className="px-3 py-2 border-t border-[#3a3a3a] flex items-center justify-between">
            {/* Left side controls */}
            <div className="flex items-center gap-2">
              {/* Model selector */}
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#333333] hover:bg-[#3a3a3a] text-[#cccccc] text-sm transition-colors">
                <Sparkles className="w-4 h-4" />
                <span>Sonnet 4.5</span>
              </button>

              {/* Divider */}
              <div className="w-px h-5 bg-[#3a3a3a]" />

              {/* Think button */}
              <button
                onClick={() => setIsThinking(!isThinking)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors ${
                  isThinking
                    ? 'bg-[#4a4a4a] text-white'
                    : 'hover:bg-[#333333] text-[#909090]'
                }`}
              >
                <Brain className="w-4 h-4" />
                <span>Think</span>
              </button>

              {/* Clipboard button */}
              <button className="p-1.5 rounded-md hover:bg-[#333333] text-[#909090] transition-colors">
                <Clipboard className="w-4 h-4" />
              </button>

              {/* Code button */}
              <button className="p-1.5 rounded-md hover:bg-[#333333] text-[#909090] transition-colors">
                <Code className="w-4 h-4" />
              </button>
            </div>

            {/* Right side controls */}
            <div className="flex items-center gap-2">
              {/* Ban button */}
              <button className="p-1.5 rounded-md hover:bg-[#333333] text-[#909090] transition-colors">
                <Ban className="w-4 h-4" />
              </button>

              {/* Attachment button */}
              <button className="p-1.5 rounded-md hover:bg-[#333333] text-[#909090] transition-colors">
                <Paperclip className="w-4 h-4" />
              </button>

              {/* Submit button */}
              <button
                onClick={handleSubmit}
                disabled={!input.trim()}
                className="p-1.5 rounded-md bg-[#505050] hover:bg-[#5a5a5a] disabled:bg-[#333333] disabled:opacity-50 text-white transition-colors"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
