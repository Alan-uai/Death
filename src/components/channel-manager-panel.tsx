
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { saveChannelConfigAction } from '@/app/actions';
import { useSettings } from '@/contexts/settings-context';

type ManagementMode = 'slash' | 'channels' | 'both';

const PANEL_ID = 'channelManagement';

export function ChannelManagerPanel({ guildId }: { guildId: string }) {
  const { registerPanel, getInitialData } = useSettings();

  const initialSettings = getInitialData<{
      mode: ManagementMode;
      suggestions: { enabled: boolean };
      reports: { enabled: boolean };
  }>(PANEL_ID) || {
      mode: 'slash',
      suggestions: { enabled: false },
      reports: { enabled: false },
  };

  const [mode, setMode] = useState<ManagementMode>(initialSettings.mode);
  const [enableSuggestions, setEnableSuggestions] = useState(initialSettings.suggestions.enabled);
  const [enableReports, setEnableReports] = useState(initialSettings.reports.enabled);

  const isDirty = useCallback(() => {
    return (
      mode !== initialSettings.mode ||
      enableSuggestions !== initialSettings.suggestions.enabled ||
      enableReports !== initialSettings.reports.enabled
    );
  }, [mode, enableSuggestions, enableReports, initialSettings]);
  
  const onSave = useCallback(() => {
    return saveChannelConfigAction(guildId, {
        mode,
        suggestions: { enabled: enableSuggestions },
        reports: { enabled: enableReports }
    });
  }, [guildId, mode, enableSuggestions, enableReports]);

  useEffect(() => {
    registerPanel(PANEL_ID, { onSave, isDirty });
  }, [registerPanel, onSave, isDirty]);
  
  const showChannels = mode === 'channels' || mode === 'both';
  const showSlashInfo = mode === 'slash' || mode === 'both';

  return (
    <div className="p-4 md:p-6">
      <Card>
        <CardHeader>
          <CardTitle>Gerenciador de Canais e Comandos</CardTitle>
          <CardDescription>
            Escolha como o bot deve interagir com o servidor. As alterações serão salvas quando você clicar em "Salvar" na barra inferior.
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
      </Card>
    </div>
  );
}

