
'use client';

import { useState } from 'react';
import type { DiscordChannel } from '@/services/discord';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { manageSuggestionChannelAction } from '@/app/actions';
import { Loader2 } from 'lucide-react';

interface ChannelManagerPanelProps {
  channels: DiscordChannel[];
  guildId: string;
}

export function ChannelManagerPanel({ channels, guildId }: ChannelManagerPanelProps) {
  const { toast } = useToast();
  const [enableSuggestions, setEnableSuggestions] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleToggleSuggestions = async (enabled: boolean) => {
    setEnableSuggestions(enabled);
    if (enabled) {
      setIsProcessing(true);
      try {
        const result = await manageSuggestionChannelAction({
          guildId,
          enable: true,
        });

        if (result.success) {
          toast({
            title: 'Canal de Sugestões Ativado!',
            description: result.message,
          });
        } else {
          toast({
            variant: 'destructive',
            title: 'Erro ao Ativar Canal',
            description: result.message,
          });
          setEnableSuggestions(false); // Reverte o switch em caso de erro
        }
      } catch (error) {
        console.error('Falha ao gerenciar canal de sugestões:', error);
        toast({
          variant: 'destructive',
          title: 'Erro Inesperado',
          description: 'Não foi possível completar a ação. Tente novamente.',
        });
        setEnableSuggestions(false);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  return (
    <div className="p-4 md:p-6">
      <Card>
        <CardHeader>
          <CardTitle>Gerenciador de Canais</CardTitle>
          <CardDescription>
            Configure a criação automática de canais para funcionalidades específicas.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Canais Automatizados</h3>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-1">
                <Label htmlFor="suggestions-switch" className="text-base">Canal de Sugestões</Label>
                <p className="text-sm text-muted-foreground">
                  Cria um canal de fórum #sugestoes com reações de like/deslike para a comunidade.
                </p>
              </div>
              <div className="flex items-center gap-2">
                {isProcessing && <Loader2 className="h-5 w-5 animate-spin" />}
                <Switch
                  id="suggestions-switch"
                  checked={enableSuggestions}
                  onCheckedChange={handleToggleSuggestions}
                  disabled={isProcessing}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
