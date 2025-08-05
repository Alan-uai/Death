
'use client';

import { useState } from 'react';
import { Send, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  channelId: string;
}

const placeholders: Record<string, string> = {
    'welcome': 'This channel is read-only.',
    'q-and-a': 'Message with @Death <your question>',
    'build-suggestions': 'Message with /suggest-build <style>',
    'game-stats': 'Message with /stats',
};


export function ChatInput({ onSendMessage, isLoading, channelId }: ChatInputProps) {
  const [input, setInput] = useState('');
  const isReadOnly = channelId === 'welcome';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading && !isReadOnly) {
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
          placeholder={placeholders[channelId] || 'Send a message...'}
          className="h-12 rounded-lg bg-input pl-10 pr-12 text-base"
          disabled={isLoading || isReadOnly}
          autoComplete="off"
        />
        <Button
          type="submit"
          size="icon"
          variant="ghost"
          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:bg-transparent hover:text-primary"
          disabled={isLoading || !input.trim() || isReadOnly}
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </form>
  );
}
