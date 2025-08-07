
'use client';

import { useState, useEffect } from 'react';
import type { DiscordChannel } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getGuildConfigAction, saveGenericConfigAction } from '@/app/actions';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Skeleton } from './ui/skeleton';

interface SettingsPanelProps {
  channels: DiscordChannel[];
  guildId: string;
}

export function SettingsPanel({ channels, guildId }: SettingsPanelProps) {
  const [qaChannel, setQaChannel] = useState<string>('any');
  const [buildsChannel, setBuildsChannel] = useState<string>('any');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  const textChannels = channels.filter(c => c.type === 0);

  useEffect(() => {
    const fetchConfig = async () => {
      setIsLoading(true);
      try {
        const config = await getGuildConfigAction(guildId);
        if (config && config.featureSettings) {
          setQaChannel(config.featureSettings.qaChannel || 'any');
          setBuildsChannel(config.featureSettings.buildsChannel || 'any');
        }
      } catch (error) {
        console.error("Failed to fetch feature settings config:", error);
         toast({
            variant: "destructive",
            title: "Erro ao Carregar",
            description: "Não foi possível buscar as configurações de funcionalidades."
        })
      } finally {
        setIsLoading(false);
      }
    };
    fetchConfig();
  }, [guildId, toast]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveGenericConfigAction(guildId, { 
        featureSettings: {
          qaChannel,
          buildsChannel 
        }
      });
      toast({
        title: 'Sucesso!',
        description: 'Configurações salvas com sucesso.',
      });
    } catch (error) {
      console.error('Falha ao salvar configurações:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao Salvar',
        description: 'Não foi possível salvar as configurações.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 md:p-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-4 w-2/3 mt-2" />
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-4">
              <Skeleton className="h-6 w-1/4" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-10 w-full md:w-[300px]" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-10 w-full md:w-[300px]" />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Skeleton className="h-10 w-28" />
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6">
      <Card>
        <CardHeader>
          <CardTitle>Configuração do Bot</CardTitle>
          <CardDescription>
            Configure onde as funcionalidades do bot estão ativas.
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
        <CardFooter className="flex justify-end">
            <Button onClick={handleSave} disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar Alterações
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
