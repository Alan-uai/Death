
import { BotResponseCard, type EmbedData } from '@/components/bot-response-card';
import { UserAvatar } from '@/components/user-avatar';
import { cn } from '@/lib/utils';

export type Message = {
  id: string;
  author: 'user' | 'bot';
  username: string;
  timestamp: string;
  text?: string;
  embed?: EmbedData;
};

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const { author, username, timestamp, text, embed } = message;
  const isBot = author === 'bot';

  return (
    <div className="group relative flex items-start space-x-4">
      <UserAvatar
        username={username}
        className={cn(isBot ? "border-primary" : "border-secondary")}
      />
      <div className="flex-1">
        <div className="flex items-baseline space-x-2">
          <span className={cn('font-semibold', isBot ? 'text-primary' : 'text-white')}>{username}</span>
          <span className="text-xs text-muted-foreground">{timestamp}</span>
        </div>
        <div className="prose prose-sm max-w-none text-white">
          {text && <p className="m-0">{text}</p>}
          {embed && <BotResponseCard {...embed} />}
        </div>
      </div>
    </div>
  );
}
