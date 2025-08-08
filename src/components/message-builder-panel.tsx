
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Bot, Loader2 } from 'lucide-react';
import { MessageEditorPanel } from './message-editor-panel';
import { useToast } from '@/hooks/use-toast';
import type { CustomCommand } from '@/lib/types';
import { saveCommandConfigAction } from '@/app/actions';

export function MessageBuilderPanel({ guildId }: { guildId: string }) {
  const [commandName, setCommandName] = useState('');
  const [commandDescription, setCommandDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleSave = async (messageData: any) => {
    const finalCommandName = commandName.trim().toLowerCase();
    if (!finalCommandName || !commandDescription.trim()) {
        toast({
            variant: 'destructive',
            title: 'Erro de Validação',
            description: 'O nome e a descrição do comando são obrigatórios.',
        });
        return;
    }
    
    setIsSaving(true);
    try {
        const command: CustomCommand = {
            id: finalCommandName,
            name: finalCommandName,
            description: commandDescription.trim(),
            responseType: messageData.mode,
            response: {
                content: messageData.textContent,
                embed: messageData.mode === 'embed' ? messageData.embed : undefined,
                container: messageData.mode === 'container' ? messageData.container : undefined,
            }
        };

        // Modify button customIds before saving
        if (command.responseType === 'container' && command.response.container) {
            command.response.container.forEach((component: any) => {
                if (component.type === 'actionRow' && component.components) {
                    component.components.forEach((subComp: any) => {
                        if (subComp.type === 'button' && subComp.action) {
                            subComp.customId = `customAction_${finalCommandName}_${subComp.action.name}`;
                        }
                    });
                }
            });
        }

        await saveCommandConfigAction(guildId, command);

        toast({
            title: 'Sucesso!',
            description: `Comando /${command.name} salvo com sucesso.`,
        });
    } catch (error) {
        console.error("Falha ao salvar comando customizado:", error);
        toast({
            variant: 'destructive',
            title: 'Erro ao Salvar',
            description: 'Não foi possível salvar o comando customizado.',
        });
    } finally {
        setIsSaving(false);
    }
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
              <Input id="command-name" value={commandName} onChange={(e) => setCommandName(e.target.value.replace(/\s+/g, '-'))} placeholder="bemvindo" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="command-desc">Descrição do Comando</Label>
              <Input id="command-desc" value={commandDescription} onChange={(e) => setCommandDescription(e.target.value)} placeholder="Mostra a mensagem de boas-vindas" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <MessageEditorPanel 
        guildId={guildId} 
        onSave={handleSave} 
        isSaving={isSaving} 
        saveButtonText="Salvar Comando"
        commandName={commandName}
       />

    </div>
  );
}
