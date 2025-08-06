
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { manageSuggestionChannelAction, manageReportChannelAction, registerCommandsAction } from '@/app/actions';
import { Loader2 } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';

type ManagementMode = 'channels' | 'slash' | 'both';

export function ChannelManagerPanel({ guildId }: { guildId: string }) {
  const { toast } = useToast();
  const [mode, setMode] = useState<ManagementMode>('channels');
  const [enableSuggestions, setEnableSuggestions] = useState(false);
  const [enableReports, setEnableReports] = useState(false);
  const [processing, setProcessing] = useState<'suggestions' | 'reports' | 'commands' | null>(null);

  useEffect(() => {
    const handleCommandRegistration = async () => {
        if (mode === 'slash' || mode === 'both') {
            setProcessing('commands');
            await registerCommandsAction(guildId, true);
            setProcessing(null);
        } else {
            await registerCommandsAction(guildId, false);
        }
    };
    handleCommandRegistration();
  }, [mode, guildId]);


  const handleToggleFeature = async (
    feature: 'suggestions' | 'reports', 
    enabled: boolean
  ) => {
    if (!enabled) {
        if (feature === 'suggestions') setEnableSuggestions(false);
        if (feature === 'reports') setEnableReports(false);
        toast({ title: 'Desativado', description: `A criação do canal de ${feature} foi desativada.` });
        return;
    }

    setProcessing(feature);

    const action = feature === 'suggestions' 
      ? manageSuggestionChannelAction 
      : manageReportChannelAction;
    
    const input = { guildId, enable: enabled };

    try {
      const result = await action(input as any);

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

  const showChannels = mode === 'channels' || mode === 'both';
  const showSlashInfo = mode === 'slash' || mode === 'both';

  return (
    <div className="p-4 md:p-6">
      <Card>
        <CardHeader>
          <CardTitle>Gerenciador de Canais e Comandos</CardTitle>
          <CardDescription>
            Escolha como o bot deve interagir com o servidor: através de canais automatizados, comandos de barra (/) ou ambos.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          
          <RadioGroup value={mode} onValueChange={(value) => setMode(value as ManagementMode)} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <RadioGroupItem value="slash" id="slash" className="peer sr-only" />
              <Label htmlFor="slash" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                Somente Comandos (/)
                <p className="text-xs text-muted-foreground mt-2 text-center">Ativa comandos como /denunciar e /sugestao.</p>
              </Label>
            </div>
            <div>
              <RadioGroupItem value="channels" id="channels" className="peer sr-only" />
              <Label htmlFor="channels" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                Somente Canais
                 <p className="text-xs text-muted-foreground mt-2 text-center">Cria canais dedicados para sugestões e denúncias.</p>
              </Label>
            </div>
            <div>
              <RadioGroupItem value="both" id="both" className="peer sr-only" />
              <Label htmlFor="both" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                Ambos
                 <p className="text-xs text-muted-foreground mt-2 text-center">Ativa tanto os comandos de barra quanto a criação de canais.</p>
              </Label>
            </div>
          </RadioGroup>

          {showChannels && (
            <div className="space-y-4 pt-4 border-t">
                 <h3 className="text-lg font-medium">Canais Automatizados</h3>
                 <p className="text-sm text-muted-foreground">Ative para que o bot crie e gerencie canais para funcionalidades específicas.</p>
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
                      Cria um canal público #denuncias com um botão para abrir tópicos privados.
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
          )}

           {showSlashInfo && (
                <div className="space-y-4 pt-4 border-t">
                    <h3 className="text-lg font-medium">Comandos de Barra (/)</h3>
                     <p className="text-sm text-muted-foreground">
                        {processing === 'commands' ? 'Registrando comandos...' : 'Os seguintes comandos estão ativos no servidor:'}
                     </p>
                     <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                        <li><code className="bg-muted p-1 rounded-sm">/denunciar</code> - Inicia o processo para criar uma denúncia privada.</li>
                        <li><code className="bg-muted p-1 rounded-sm">/sugestao</code> - Guia o usuário para o canal de sugestões.</li>
                     </ul>
                </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
