
'use client';

import { useState, useEffect } from 'react';
import type { DiscordChannel } from '@/services/discord';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';

interface SettingsPanelProps {
  channels: DiscordChannel[];
}

export function SettingsPanel({ channels }: SettingsPanelProps) {
  const { toast } = useToast();
  const [qaChannel, setQaChannel] = useState<string>('any');
  const [buildsChannel, setBuildsChannel] = useState<string>('any');
  const [isSaving, setIsSaving] = useState(false);
  
  const textChannels = channels.filter(c => c.type === 0);

  useEffect(() => {
    const savedQaChannel = localStorage.getItem('settings_qaChannel') || 'any';
    const savedBuildsChannel = localStorage.getItem('settings_buildsChannel') || 'any';
    setQaChannel(savedQaChannel);
    setBuildsChannel(savedBuildsChannel);
  }, []);

  const handleSave = () => {
    setIsSaving(true);
    localStorage.setItem('settings_qaChannel', qaChannel);
    localStorage.setItem('settings_buildsChannel', buildsChannel);

    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: "Configurações Salvas",
        description: "Suas novas configurações foram aplicadas.",
      });
    }, 1000);
  };

  return (
    <div className="p-4 md:p-6">
      <Card>
        <CardHeader>
          <CardTitle>Configuração do Bot</CardTitle>
          <CardDescription>
            Configure onde as funcionalidades do bot estão ativas e como ele responde.
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
