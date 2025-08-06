
'use client';

import { useState } from 'react';
import { Send, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  channelId: string;
  disabled?: boolean;
}

const placeholders: Record<string, string> = {
    'q-and-a': 'Mensagem com @Death <sua pergunta>',
    'suggestions': 'Crie um novo post para sua sugestão neste canal de fórum.',
    'reports': 'Use /denunciar em qualquer canal para criar um tópico privado.',
};


export function ChatInput({ onSendMessage, isLoading, channelId, disabled = false }: ChatInputProps) {
  const [input, setInput] = useState('');
  
  let currentPlaceholder = 'Enviar uma mensagem...';
  if (channelId) {
      const channelKey = Object.keys(placeholders).find(key => channelId.toLowerCase().includes(key));
      currentPlaceholder = channelKey ? placeholders[channelKey] : 'Enviar uma mensagem...';
  }

  const isInputDisabled = isLoading || disabled || channelId.toLowerCase().includes('suggestions') || channelId.toLowerCase().includes('reports');


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isInputDisabled) {
      onSendMessage(input);
      setInput('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <div className="relative">
        <Terminal className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={disabled ? 'Selecione um canal para começar' : currentPlaceholder}
          className="h-12 rounded-lg bg-input pl-10 pr-12 text-base"
          disabled={isInputDisabled}
          autoComplete="off"
        />
        <Button
          type="submit"
          size="icon"
          variant="ghost"
          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:bg-transparent hover:text-primary"
          disabled={isInputDisabled || !input.trim()}
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </form>
  );
}
