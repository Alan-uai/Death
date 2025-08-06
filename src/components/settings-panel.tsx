'use client';

import { useState, useEffect } from 'react';
import type { DiscordChannel } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { saveGenericConfig } from '@/lib/bot-api';

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
    // In a real app, you would fetch these settings from your bot's backend
    // For now, we use localStorage for demonstration
    const savedQaChannel = localStorage.getItem(`settings_qaChannel_${guildId}`) || 'any';
    const savedBuildsChannel = localStorage.getItem(`settings_buildsChannel_${guildId}`) || 'any';
    setQaChannel(savedQaChannel);
    setBuildsChannel(savedBuildsChannel);
  }, [guildId]);

  const handleSave = async () => {
    setIsSaving(true);
    
    const settingsPayload = {
        qaChannel: qaChannel,
        buildsChannel: buildsChannel,
    };

    try {
        await saveGenericConfig(guildId, settingsPayload);
        toast({
            title: "Configurações Enviadas",
            description: "Suas novas configurações foram enviadas para o bot.",
        });
    } catch (error) {
       toast({
        variant: 'destructive',
        title: "Erro ao Salvar",
        description: "Não foi possível enviar as configurações para o bot.",
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
            Configure onde as funcionalidades do bot estão ativas. As configurações são enviadas para o seu bot.
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
