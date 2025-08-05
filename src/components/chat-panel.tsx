
'use client';

import { useState, useEffect, useRef } from 'react';
import { ChatMessage, type Message } from '@/components/chat-message';
import { ChatInput } from '@/components/chat-input';
import { askQuestionAction, suggestBuildAction } from '@/app/actions';
import { Hash } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DiscordChannel } from '@/services/discord';

interface ChatPanelProps {
  channels: DiscordChannel[];
}

const welcomeMessages: Record<string, Omit<Message, 'timestamp' | 'id'>> = {
  default: {
    author: 'bot',
    username: 'Death',
    embed: {
      title: 'Welcome to the Chat Simulator!',
      description: 'Select a channel on the left to start simulating conversations. The bot will respond based on your current settings.',
    },
  },
  'q-and-a': {
    author: 'bot',
    username: 'Death',
    text: 'This is the Q&A channel. Ask me anything about the game by @mentioning me.',
  },
  'build-suggestions': {
    author: 'bot',
    username: 'Death',
    text: 'Looking for a new build? Use `/suggest-build` with your preferred playstyle.',
  },
};

const getTimestamp = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

export function ChatPanel({ channels }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeChannel, setActiveChannel] = useState<DiscordChannel | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  const textChannels = channels.filter(c => c.type === 0);

  useEffect(() => {
    if (!activeChannel && textChannels.length > 0) {
      setActiveChannel(textChannels[0]);
    }
  }, [channels, activeChannel, textChannels]);

  useEffect(() => {
    const welcomeMessageKey = activeChannel?.name.includes('q-and-a') ? 'q-and-a' : activeChannel?.name.includes('build') ? 'build-suggestions' : 'default';
    const welcomeMessage: Message = {
      ...(welcomeMessages[welcomeMessageKey] || welcomeMessages.default),
      id: `${activeChannel?.id || 'default'}-1`,
      timestamp: getTimestamp(),
    };
    setMessages([welcomeMessage]);
  }, [activeChannel]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (input: string) => {
    if (!input.trim() || !activeChannel) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      author: 'user',
      username: 'PlayerOne',
      timestamp: getTimestamp(),
      text: input,
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    const [command, ...args] = input.trim().split(' ');
    const restOfInput = args.join(' ');
    let botResponse: Message | null = null;
    const responseId = (Date.now() + 1).toString();
    const responseTimestamp = getTimestamp();

    if (command.startsWith('@Death')) {
      const answer = await askQuestionAction({ question: restOfInput });
      botResponse = {
        id: responseId, author: 'bot', username: 'Death', timestamp: responseTimestamp,
        embed: { title: `Response to: ${restOfInput}`, description: answer },
      };
    } else if (command === '/suggest-build') {
      const { buildSuggestion, reasoning } = await suggestBuildAction({
        gameState: 'mid-game, level 50',
        playerPreferences: restOfInput,
      });
      botResponse = {
        id: responseId, author: 'bot', username: 'Death', timestamp: responseTimestamp,
        embed: {
          title: 'Build Suggestion',
          description: `Based on your preference for a *${restOfInput}* style:`,
          fields: [
            { name: 'Suggestion', value: buildSuggestion },
            { name: 'Reasoning', value: reasoning },
          ],
        },
      };
    } else {
        botResponse = {
            id: responseId, author: 'bot', username: 'Death', timestamp: responseTimestamp,
            text: `The command \`${command}\` is not recognized or not configured for this channel.`,
        };
    }
    
    if (botResponse) {
      setMessages((prev) => [...prev, botResponse!]);
    }
    setIsLoading(false);
  };

  return (
    <div className="flex h-full">
      {/* Channel List */}
      <div className="w-60 flex-shrink-0 bg-[#2f3136] p-2">
        <h3 className="px-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">Text Channels</h3>
        <div className="mt-2 space-y-1">
          {textChannels.map((channel) => (
            <button
              key={channel.id}
              onClick={() => setActiveChannel(channel)}
              className={cn(
                'group flex w-full items-center rounded-md px-2 py-1 transition-colors hover:bg-[#36393f] hover:text-white',
                activeChannel?.id === channel.id && 'bg-[#40444b] text-white'
              )}
            >
              <Hash className="mr-2 h-5 w-5 text-gray-400" />
              <span className="font-medium">{channel.name}</span>
            </button>
          ))}
        </div>
      </div>
      
      {/* Chat Area */}
      <div className="flex flex-1 flex-col overflow-hidden bg-[#36393f]">
        <div className="flex h-12 items-center border-b border-black/20 px-4 shadow-md">
          <Hash className="h-6 w-6 text-gray-400" />
          <span className="ml-2 font-semibold text-white">{activeChannel?.name || 'Select a channel'}</span>
        </div>
        <div ref={scrollAreaRef} className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            {isLoading && (
              <div className="flex items-center space-x-2 pl-14 text-sm text-muted-foreground">
                <span className="font-semibold">Death</span> is typing...
              </div>
            )}
          </div>
        </div>
        <div className="p-4 pt-0">
          <ChatInput 
            onSendMessage={handleSendMessage} 
            isLoading={isLoading} 
            channelId={activeChannel?.id || ''}
            disabled={!activeChannel}
          />
        </div>
      </div>
    </div>
  );
}
