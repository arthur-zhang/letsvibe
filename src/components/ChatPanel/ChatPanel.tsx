import { ChatInput } from '@/components/ChatInput/ChatInput';

export function ChatPanel() {
  return (
    <div className="h-full flex flex-col bg-[#181818]">
      {/* Messages area - will be implemented later */}
      <div className="flex-1 overflow-auto p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center text-[#606060] py-20">
            <p className="text-lg mb-2">Start a conversation with Claude</p>
            <p className="text-sm">Ask questions, request code changes, or get help with your project</p>
          </div>
        </div>
      </div>

      {/* Chat input */}
      <ChatInput />
    </div>
  );
}
