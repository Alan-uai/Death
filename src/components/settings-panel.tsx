
'use client';

import { useState, useEffect } from 'react';
import type { DiscordChannel } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { saveGenericConfig } from '@/lib/bot-api';
import { useSettings } from '@/contexts/settings-context';

interface SettingsPanelProps {
  channels: DiscordChannel[];
  guildId: string;
}

const PANEL_ID = 'genericSettings';

export function SettingsPanel({ channels, guildId }: SettingsPanelProps) {
  const { updateSetting, registerPanel, getSetting } = useSettings();
  const [qaChannel, setQaChannel] = useState<string>('any');
  const [buildsChannel, setBuildsChannel] = useState<string>('any');
  
  const textChannels = channels.filter(c => c.type === 0);

  useEffect(() => {
    registerPanel(PANEL_ID, (guildId, data) => saveGenericConfig(guildId, data));
  }, [registerPanel]);


  useEffect(() => {
    // In a real app, you would fetch these settings from your bot's backend
    // For now, we use localStorage as a fallback for initial state
    const savedQaChannel = localStorage.getItem(`settings_qaChannel_${guildId}`) || 'any';
    const savedBuildsChannel = localStorage.getItem(`settings_buildsChannel_${guildId}`) || 'any';
    
    // Set initial state for the panel
    const initialQa = getSetting<string>('qaChannel') ?? savedQaChannel;
    const initialBuilds = getSetting<string>('buildsChannel') ?? savedBuildsChannel;

    setQaChannel(initialQa);
    setBuildsChannel(initialBuilds);

    // Set initial settings in the context if not already there
    updateSetting(PANEL_ID, {
      qaChannel: initialQa,
      buildsChannel: initialBuilds,
    });
  }, [guildId, getSetting, updateSetting]);

  const handleQaChange = (value: string) => {
    setQaChannel(value);
    updateSetting(PANEL_ID, { qaChannel: value, buildsChannel });
  };

  const handleBuildsChange = (value: string) => {
    setBuildsChannel(value);
    updateSetting(PANEL_ID, { qaChannel, buildsChannel: value });
  };


  return (
    <div className="p-4 md:p-6">
      <Card>
        <CardHeader>
          <CardTitle>Configuração do Bot</CardTitle>
          <CardDescription>
            Configure onde as funcionalidades do bot estão ativas. Clique em "Salvar" na barra inferior para aplicar.
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
              <Select value={qaChannel} onValueChange={handleQaChange}>
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
              <Select value={buildsChannel} onValueChange={handleBuildsChange}>
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
        </CardContent>
      </Card>
    </div>
  );
}
