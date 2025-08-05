
'use client';

import { useState, useEffect, useRef } from 'react';
import { ChatMessage, type Message } from '@/components/chat-message';
import { ChatInput } from '@/components/chat-input';
import { askQuestionAction, suggestBuildAction } from '@/app/actions';

interface ChatPanelProps {
  channelId: string;
}

const welcomeMessages: Record<string, Message> = {
  welcome: {
    id: 'welcome-1',
    author: 'bot',
    username: 'Echo Game Bot',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    embed: {
      title: 'Welcome to the Echo Game Bot!',
      description:
        'I can help you with game mechanics, lore, and even suggest builds. Here are some commands you can use in the appropriate channels:',
      fields: [
        { name: '/ask <question>', value: 'Ask anything about the game in #q-and-a.' },
        { name: '/suggest-build <style>', value: 'Get a build suggestion in #build-suggestions.' },
        { name: '/stats', value: 'View mock game stats in #game-stats.' },
      ],
    },
  },
  'q-and-a': {
    id: 'qa-1',
    author: 'bot',
    username: 'Echo Game Bot',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    text: 'This is the Q&A channel. Ask me anything about the game using the `/ask` command!',
  },
  'build-suggestions': {
    id: 'build-1',
    author: 'bot',
    username: 'Echo Game Bot',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    text: 'Looking for a new build? Use `/suggest-build` with your preferred playstyle (e.g., `/suggest-build aggressive mage`).',
  },
  'game-stats': {
    id: 'stats-1',
    author: 'bot',
    username: 'Echo Game Bot',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    text: 'Use the `/stats` command to see some example real-time game statistics.',
  },
};

export function ChatPanel({ channelId }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([welcomeMessages[channelId]]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (input: string) => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      author: 'user',
      username: 'PlayerOne',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: input,
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    const [command, ...args] = input.trim().split(' ');
    const restOfInput = args.join(' ');
    let botResponse: Message | null = null;
    const responseId = (Date.now() + 1).toString();
    const responseTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (channelId === 'q-and-a' && command === '/ask') {
      const answer = await askQuestionAction({ question: restOfInput });
      botResponse = {
        id: responseId, author: 'bot', username: 'Echo Game Bot', timestamp: responseTimestamp,
        embed: { title: `Question: ${restOfInput}`, description: answer },
      };
    } else if (channelId === 'build-suggestions' && command === '/suggest-build') {
      const { buildSuggestion, reasoning } = await suggestBuildAction({
        gameState: 'mid-game, level 50',
        playerPreferences: restOfInput,
      });
      botResponse = {
        id: responseId, author: 'bot', username: 'Echo Game Bot', timestamp: responseTimestamp,
        embed: {
          title: 'Build Suggestion',
          description: `Based on your preference for a *${restOfInput}* style:`,
          fields: [
            { name: 'Suggestion', value: buildSuggestion },
            { name: 'Reasoning', value: reasoning },
          ],
        },
      };
    } else if (channelId === 'game-stats' && command === '/stats') {
      botResponse = {
        id: responseId, author: 'bot', username: 'Echo Game Bot', timestamp: responseTimestamp,
        embed: {
          title: 'Real-time Game Statistics',
          description: 'Here are the current (mocked) stats:',
          fields: [
            { name: 'Players Online', value: '14,582' },
            { name: 'EU-Central Ping', value: '28ms' },
            { name: 'Active World Events', value: '3' },
          ],
        },
      };
    } else {
        botResponse = {
            id: responseId, author: 'bot', username: 'Echo Game Bot', timestamp: responseTimestamp,
            text: `The command \`${command}\` is not valid for this channel. Please check the welcome message for instructions.`,
        };
    }
    
    if (botResponse) {
      setMessages((prev) => [...prev, botResponse!]);
    }
    setIsLoading(false);
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div ref={scrollAreaRef} className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
          {isLoading && (
            <div className="flex items-center space-x-2 pl-14 text-sm text-muted-foreground">
              <span className="font-semibold">Echo Game Bot</span> is typing...
            </div>
          )}
        </div>
      </div>
      <div className="p-4 pt-0">
        <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} channelId={channelId} />
      </div>
    </div>
  );
}
