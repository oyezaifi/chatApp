import { cn } from '../../lib/utils';
import { Bot, User } from 'lucide-react';
import type { Message } from '../../types';

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const timestamp = new Date(message.created_at).toLocaleTimeString();

  return (
    <div className={cn('flex gap-3 p-4', isUser ? 'justify-end' : 'justify-start')}>
      {!isUser && (
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
            <Bot className="h-4 w-4 text-white" />
          </div>
        </div>
      )}

      <div className={cn('flex flex-col max-w-[80%]', isUser ? 'items-end' : 'items-start')}>
        <div
          className={cn(
            'rounded-lg px-4 py-2 text-sm',
            isUser
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-900'
          )}
        >
          <div className="whitespace-pre-wrap">{message.content}</div>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {timestamp}
        </div>
      </div>

      {isUser && (
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
            <User className="h-4 w-4 text-gray-600" />
          </div>
        </div>
      )}
    </div>
  );
}
