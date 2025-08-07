
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, Trash2, GripVertical, Bot } from 'lucide-react';
import { EmbedBuilder } from './embed-builder';
import { ActionRowBuilder } from './action-row-builder';
import { Textarea } from './ui/textarea';
import { MessageEditorPanel } from './message-editor-panel';

export function MessageBuilderPanel({ guildId }: { guildId: string }) {
  const [commandName, setCommandName] = useState('');
  const [commandDescription, setCommandDescription] = useState('');

  const handleSave = () => {
    // Logic to save the entire message structure
    console.log({
      commandName,
      commandDescription,
      // components state would be managed inside MessageEditorPanel
    });
    // This will call a server action in the future
  };
  
  return (
    <div className="p-4 md:p-6 space-y-6">
       <Card>
        <CardHeader>
          <CardTitle>Criar Comando Customizado</CardTitle>
          <CardDescription>
            Crie um novo comando de barra (/) que responderá com uma mensagem customizada.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="command-name">Nome do Comando (sem /)</Label>
              <Input id="command-name" value={commandName} onChange={(e) => setCommandName(e.target.value)} placeholder="bemvindo" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="command-desc">Descrição do Comando</Label>
              <Input id="command-desc" value={commandDescription} onChange={(e) => setCommandDescription(e.target.value)} placeholder="Mostra a mensagem de boas-vindas" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <MessageEditorPanel />

      <div className="flex justify-end mt-6">
          <Button onClick={handleSave}>
              <Bot className="mr-2 h-4 w-4" />
              Salvar Comando
          </Button>
        </div>
    </div>
  );
}
