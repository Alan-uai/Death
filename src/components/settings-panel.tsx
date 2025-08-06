
'use client';

import { useState, useEffect } from 'react';
import type { DiscordChannel } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { saveCustomCommandAction } from '@/app/actions';

interface SettingsPanelProps {
  channels: DiscordChannel[];
  guildId: string;
}

export function SettingsPanel({ channels, guildId }: SettingsPanelProps) {
  const { toast } = useToast();
  const [qaChannel, setQaChannel] = useState<string>('any');
  const [buildsChannel, setBuildsChannel] = useState<string>('any');
  const [isSaving, setIsSaving] = useState(false);
  
  const textChannels = channels.filter(c => c.type === 0);

  useEffect(() => {
    // In a real app, you would fetch these settings from Firestore
    const savedQaChannel = localStorage.getItem(`settings_qaChannel_${guildId}`) || 'any';
    const savedBuildsChannel = localStorage.getItem(`settings_buildsChannel_${guildId}`) || 'any';
    setQaChannel(savedQaChannel);
    setBuildsChannel(savedBuildsChannel);
  }, [guildId]);

  const handleSave = async () => {
    setIsSaving(true);
    
    // Save settings to Firestore via a 'custom command' for simplicity
    const settingsPayload = {
      id: `settings-${guildId}`,
      name: `Configurações para ${guildId}`,
      description: 'Configurações gerais do bot para este servidor.',
      responseType: 'container',
      response: {
        container: JSON.stringify({
          qaChannel: qaChannel,
          buildsChannel: buildsChannel,
        })
      }
    };

    const result = await saveCustomCommandAction(settingsPayload);
    
    if (result.success) {
      toast({
        title: "Configurações Salvas",
        description: "Suas novas configurações foram salvas no Firestore. O bot as usará em breve.",
      });
    } else {
       toast({
        variant: 'destructive',
        title: "Erro ao Salvar",
        description: result.message,
      });
    }

    // Also save to localStorage for instant UI feedback
    localStorage.setItem(`settings_qaChannel_${guildId}`, qaChannel);
    localStorage.setItem(`settings_buildsChannel_${guildId}`, buildsChannel);

    setIsSaving(false);
  };

  return (
    <div className="p-4 md:p-6">
      <Card>
        <CardHeader>
          <CardTitle>Configuração do Bot</CardTitle>
          <CardDescription>
            Configure onde as funcionalidades do bot estão ativas. As configurações são salvas no Firestore para o bot ler.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Configurações de Canal</h3>
            <div className="space-y-2">
              <Label htmlFor="qa-channel">Canal de Perguntas e Respostas</Label>
              <p className="text-sm text-muted-foreground">
                Selecione um canal onde o bot responderá a perguntas. Escolha "Qualquer Canal" para permitir perguntas em todos os lugares.
              </p>
              <Select value={qaChannel} onValueChange={setQaChannel}>
                <SelectTrigger id="qa-channel" className="w-full md:w-[300px]">
                  <SelectValue placeholder="Selecione um canal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Qualquer Canal</SelectItem>
                  {textChannels.map(channel => (
                    <SelectItem key={channel.id} value={channel.id}>
                      # {channel.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="builds-channel">Canal de Sugestões de Build</Label>
              <p className="text-sm text-muted-foreground">
                Selecione um canal para sugestões de build. Escolha "Qualquer Canal" para permitir este comando em todos os lugares.
              </p>
              <Select value={buildsChannel} onValueChange={setBuildsChannel}>
                <SelectTrigger id="builds-channel" className="w-full md:w-[300px]">
                  <SelectValue placeholder="Selecione um canal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Qualquer Canal</SelectItem>
                  {textChannels.map(channel => (
                    <SelectItem key={channel.id} value={channel.id}>
                      # {channel.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

    