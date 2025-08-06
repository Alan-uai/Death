
'use client';

import { useState } from 'react';
import type { DiscordChannel } from '@/services/discord';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { manageSuggestionChannelAction, manageReportChannelAction } from '@/app/actions';
import { Loader2 } from 'lucide-react';

interface ChannelManagerPanelProps {
  channels: DiscordChannel[];
  guildId: string;
}

export function ChannelManagerPanel({ channels, guildId }: ChannelManagerPanelProps) {
  const { toast } = useToast();
  const [enableSuggestions, setEnableSuggestions] = useState(false);
  const [enableReports, setEnableReports] = useState(false);
  const [processing, setProcessing] = useState<'suggestions' | 'reports' | null>(null);

  const handleToggleFeature = async (
    feature: 'suggestions' | 'reports', 
    enabled: boolean
  ) => {
    setProcessing(feature);

    const action = feature === 'suggestions' 
      ? manageSuggestionChannelAction 
      : manageReportChannelAction;
    
    const input = { guildId, enable: enabled };

    try {
      const result = await action(input as any); // Type assertion to handle different inputs

      if (result.success) {
        toast({
          title: `Canal de ${feature === 'suggestions' ? 'Sugestões' : 'Denúncias'} Ativado!`,
          description: result.message,
        });
        if (feature === 'suggestions') setEnableSuggestions(true);
        if (feature === 'reports') setEnableReports(true);
      } else {
        toast({
          variant: 'destructive',
          title: 'Erro ao Ativar Canal',
          description: result.message,
        });
        if (feature === 'suggestions') setEnableSuggestions(false);
        if (feature === 'reports') setEnableReports(false);
      }
    } catch (error) {
      console.error(`Falha ao gerenciar canal de ${feature}:`, error);
      toast({
        variant: 'destructive',
        title: 'Erro Inesperado',
        description: 'Não foi possível completar a ação. Tente novamente.',
      });
      if (feature === 'suggestions') setEnableSuggestions(false);
      if (feature === 'reports') setEnableReports(false);
    } finally {
      setProcessing(null);
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

            {/* Suggestions Channel */}
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-1">
                <Label htmlFor="suggestions-switch" className="text-base">Canal de Sugestões</Label>
                <p className="text-sm text-muted-foreground">
                  Cria um canal de fórum #sugestoes para a comunidade com reações.
                </p>
              </div>
              <div className="flex items-center gap-2">
                {processing === 'suggestions' && <Loader2 className="h-5 w-5 animate-spin" />}
                <Switch
                  id="suggestions-switch"
                  checked={enableSuggestions}
                  onCheckedChange={(checked) => handleToggleFeature('suggestions', checked)}
                  disabled={!!processing}
                />
              </div>
            </div>

            {/* Reports Channel */}
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-1">
                <Label htmlFor="reports-switch" className="text-base">Canal de Denúncias</Label>
                <p className="text-sm text-muted-foreground">
                  Cria um canal de texto #denuncias privado, visível apenas para administradores.
                </p>
              </div>
              <div className="flex items-center gap-2">
                {processing === 'reports' && <Loader2 className="h-5 w-5 animate-spin" />}
                <Switch
                  id="reports-switch"
                  checked={enableReports}
                  onCheckedChange={(checked) => handleToggleFeature('reports', checked)}
                  disabled={!!processing}
                />
              </div>
            </div>

          </div>
        </CardContent>
      </Card>
    </div>
  );
}
