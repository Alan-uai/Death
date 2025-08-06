
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
  const { markAsDirty, registerPanel, getInitialData, markAsClean } = useSettings();
  
  const initialSettings = getInitialData<{
    qaChannel: string;
    buildsChannel: string;
  }>(PANEL_ID) || {
    qaChannel: 'any',
    buildsChannel: 'any'
  };

  const [qaChannel, setQaChannel] = useState<string>(initialSettings.qaChannel);
  const [buildsChannel, setBuildsChannel] = useState<string>(initialSettings.buildsChannel);
  
  const textChannels = channels.filter(c => c.type === 0);

  const checkIsDirty = () => {
    const dirty = qaChannel !== initialSettings.qaChannel || buildsChannel !== initialSettings.buildsChannel;
    if(dirty) markAsDirty(PANEL_ID); else markAsClean(PANEL_ID);
    return dirty;
  };

  useEffect(() => {
    registerPanel(PANEL_ID, {
        onSave: () => saveGenericConfig(guildId, { qaChannel, buildsChannel }),
        isDirty: checkIsDirty,
    });
  }, [registerPanel, qaChannel, buildsChannel, initialSettings]);


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
        </CardContent>
      </Card>
    </div>
  );
}
