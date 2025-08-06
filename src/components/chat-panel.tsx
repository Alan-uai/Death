
'use client';

import { useState, useEffect, useRef } from 'react';
import { ChatMessage, type Message } from '@/components/chat-message';
import { ChatInput } from '@/components/chat-input';
import { Hash } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DiscordChannel } from '@/lib/types';

interface ChatPanelProps {
  channels: DiscordChannel[];
}

const welcomeMessages: Record<string, Omit<Message, 'timestamp' | 'id'>> = {
  default: {
    author: 'bot',
    username: 'Death',
    embed: {
      title: 'Bem-vindo ao Simulador de Chat!',
      description: 'Selecione um canal à esquerda para simular conversas. As respostas do bot são baseadas nas configurações salvas no Firestore. A execução real acontece no seu cliente de bot separado.',
    },
  },
  'q-and-a': {
    author: 'bot',
    username: 'Death',
    text: 'Este é o canal de Perguntas e Respostas. O bot responderá a menções aqui, com base nas configurações que você definir.',
  },
  'suggestions': {
    author: 'bot',
    username: 'Death',
    text: 'Este é o canal de sugestões. O bot reagirá a novas postagens aqui.',
  },
   'reports': {
    author: 'bot',
    username: 'Death',
    text: 'Este é o canal de denúncias. O bot criará tópicos privados para denúncias iniciadas aqui.',
  },
};

const getTimestamp = () => new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

export function ChatPanel({ channels }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeChannel, setActiveChannel] = useState<DiscordChannel | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  // Includes text (0) and forum (15) channels
  const textAndForumChannels = channels.filter(c => c.type === 0 || c.type === 15);

  useEffect(() => {
    if (!activeChannel && textAndForumChannels.length > 0) {
      setActiveChannel(textAndForumChannels[0]);
    }
  }, [channels, activeChannel, textAndForumChannels]);

  useEffect(() => {
    if (activeChannel) {
        let welcomeMessageKey = 'default';
        if (activeChannel.name.includes('q-and-a')) welcomeMessageKey = 'q-and-a';
        if (activeChannel.name.includes('sugest')) welcomeMessageKey = 'suggestions';
        if (activeChannel.name.includes('denuncia')) welcomeMessageKey = 'reports';

        const welcomeMessage: Message = {
          ...(welcomeMessages[welcomeMessageKey] || welcomeMessages.default),
          id: `${activeChannel.id}-welcome`,
          timestamp: getTimestamp(),
        };
        setMessages([welcomeMessage]);
    } else {
        const welcomeMessage: Message = {
            ...welcomeMessages.default,
            id: 'default-welcome',
            timestamp: getTimestamp(),
        };
        setMessages([welcomeMessage]);
    }
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
      username: 'JogadorUm',
      timestamp: getTimestamp(),
      text: input,
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    // Simulate bot thinking
    setTimeout(() => {
        const botResponse: Message = {
            id: (Date.now() + 1).toString(),
            author: 'bot',
            username: 'Death',
            timestamp: getTimestamp(),
            text: `Simulação: O bot processaria a mensagem "${input}" no canal #${activeChannel.name}. A lógica real é executada pelo seu bot separado, que lê as configurações do Firestore.`,
        };
        setMessages((prev) => [...prev, botResponse]);
        setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="flex h-full flex-col md:flex-row">
      {/* Channel List */}
      <div className="w-full md:w-60 flex-shrink-0 bg-card p-2">
        <h3 className="px-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">Canais</h3>
        <div className="mt-2 space-y-1">
          {textAndForumChannels.map((channel) => (
            <button
              key={channel.id}
              onClick={() => setActiveChannel(channel)}
              className={cn(
                'group flex w-full items-center rounded-md px-2 py-1 transition-colors hover:bg-secondary hover:text-white',
                activeChannel?.id === channel.id && 'bg-secondary text-white'
              )}
            >
              <Hash className="mr-2 h-5 w-5 text-gray-400" />
              <span className="font-medium">{channel.name}</span>
            </button>
          ))}
           {textAndForumChannels.length === 0 && (
            <p className="px-2 text-sm text-muted-foreground">Nenhum canal encontrado.</p>
          )}
        </div>
      </div>
      
      {/* Chat Area */}
      <div className="flex flex-1 flex-col overflow-hidden bg-background">
        <div className="flex h-12 items-center border-b border-border px-4 shadow-md">
          <Hash className="h-6 w-6 text-gray-400" />
          <span className="ml-2 font-semibold text-white">{activeChannel?.name || 'Selecione um canal'}</span>
        </div>
        <div ref={scrollAreaRef} className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            {isLoading && (
              <div className="flex items-center space-x-2 pl-14 text-sm text-muted-foreground">
                <span className="font-semibold">Death</span> está digitando...
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
