
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { getGuildConfigAction, saveChannelConfigAction } from '@/app/actions';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Skeleton } from './ui/skeleton';

type ManagementMode = 'slash' | 'channels' | 'both';

export function ChannelManagerPanel({ guildId }: { guildId: string }) {
  const [mode, setMode] = useState<ManagementMode>('slash');
  const [enableSuggestions, setEnableSuggestions] = useState(false);
  const [enableReports, setEnableReports] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  const showChannels = mode === 'channels' || mode === 'both';
  const showSlashInfo = mode === 'slash' || mode === 'both';

  useEffect(() => {
    const fetchConfig = async () => {
      setIsLoading(true);
      try {
        const config = await getGuildConfigAction(guildId);
        if (config && config.channelManagement) {
          setMode(config.channelManagement.mode || 'slash');
          setEnableSuggestions(config.channelManagement.suggestions?.enabled || false);
          setEnableReports(config.channelManagement.reports?.enabled || false);
        }
      } catch (error) {
        console.error("Failed to fetch channel management config:", error);
        toast({
          variant: "destructive",
          title: "Erro ao Carregar",
          description: "Não foi possível buscar as configurações de canal."
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
        await saveChannelConfigAction(guildId, {
            mode,
            suggestions: { enabled: enableSuggestions },
            reports: { enabled: enableReports }
        });
        toast({
            title: 'Sucesso!',
            description: 'Configurações de canal salvas.',
        });
    } catch (error) {
        console.error('Falha ao salvar configurações de canal:', error);
        toast({
            variant: 'destructive',
            title: 'Erro ao Salvar',
            description: `Não foi possível salvar as configurações de canal. Erro: ${error}`,
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
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-4 w-3/4 mt-2" />
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
            <div className="space-y-4 pt-4 border-t">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-4 w-2/3" />
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-1 w-full">
                  <Skeleton className="h-6 w-1/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
                <Skeleton className="h-6 w-11" />
              </div>
               <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-1 w-full">
                  <Skeleton className="h-6 w-1/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
                <Skeleton className="h-6 w-11" />
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
          <CardTitle>Gerenciador de Canais e Comandos</CardTitle>
          <CardDescription>
            Escolha como o bot deve interagir com o servidor.
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
                 <p className="text-sm text-muted-foreground">Ative para que seu bot crie e gerencie canais para funcionalidades específicas.</p>
                {/* Suggestions Channel */}
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-1">
                    <Label htmlFor="suggestions-switch" className="text-base">Canal de Sugestões</Label>
                    <p className="text-sm text-muted-foreground">
                      Cria um canal de fórum #sugestoes para a comunidade.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="suggestions-switch"
                      checked={enableSuggestions}
                      onCheckedChange={setEnableSuggestions}
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
                    <Switch
                      id="reports-switch"
                      checked={enableReports}
                      onCheckedChange={setEnableReports}
                    />
                  </div>
                </div>
            </div>
          )}

           {showSlashInfo && (
                <div className="space-y-4 pt-4 border-t">
                    <h3 className="text-lg font-medium">Comandos de Barra (/)</h3>
                     <p className="text-sm text-muted-foreground">
                        Seu bot lerá esta configuração e registrará os seguintes comandos de barra no servidor:
                     </p>
                     <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                        <li><code className="bg-muted p-1 rounded-sm">/denunciar</code> - Inicia o processo para criar uma denúncia privada.</li>
                        <li><code className="bg-muted p-1 rounded-sm">/sugestao</code> - Guia o usuário para o canal de sugestões, se existir.</li>
                     </ul>
                </div>
            )}
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
