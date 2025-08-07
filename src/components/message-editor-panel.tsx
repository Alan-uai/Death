
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EmbedBuilder } from './embed-builder';
import { ContainerBuilder } from './container-builder';
import { Textarea } from './ui/textarea';
import { Card, CardDescription, CardHeader, CardTitle, CardContent, CardFooter } from './ui/card';
import { getGuildConfigAction } from '@/app/actions';
import { Button } from './ui/button';
import { Bot, Loader2 } from 'lucide-react';
import { Skeleton } from './ui/skeleton';

type EditorMode = 'embed' | 'container';

interface MessageEditorPanelProps {
    messageId?: string;
    guildId: string;
    onSave: (data: any) => Promise<void>;
    isSaving: boolean;
}

export function MessageEditorPanel({ messageId, guildId, onSave, isSaving }: MessageEditorPanelProps) {
    const [mode, setMode] = useState<EditorMode>('embed');
    const [textContent, setTextContent] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    
    // States for builders
    const [embedData, setEmbedData] = useState({});
    const [containerComponents, setContainerComponents] = useState([]);

    const handleSaveClick = () => {
        const dataToSave = {
            mode,
            textContent,
            embed: mode === 'embed' ? embedData : null,
            components: mode === 'container' ? containerComponents : null,
        };
        onSave(dataToSave);
    }

    // Load existing data if messageId is provided
    useEffect(() => {
        if (!messageId) {
            setIsLoading(false);
            return;
        }

        const fetchMessageConfig = async () => {
            setIsLoading(true);
            try {
                const config = await getGuildConfigAction(guildId);
                const messageConfig = config?.botResponses?.[messageId];
                if (messageConfig) {
                    setMode(messageConfig.responseType || 'embed');
                    setTextContent(messageConfig.response?.content || '');
                    if (messageConfig.responseType === 'embed' && messageConfig.response?.embed) {
                        setEmbedData(messageConfig.response.embed);
                    }
                    if (messageConfig.responseType === 'container' && messageConfig.response?.container) {
                        setContainerComponents(messageConfig.response.container);
                    }
                }
            } catch (error) {
                console.error(`Failed to fetch config for message: ${messageId}`, error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMessageConfig();
    }, [messageId, guildId]);
    
    if (isLoading) {
       return (
         <Card className="bg-card/50">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                         <Skeleton className="h-6 w-48" />
                         <Skeleton className="h-4 w-96 mt-2" />
                    </div>
                    <Skeleton className="h-10 w-40" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                     <div>
                        <Skeleton className="h-5 w-40 mb-1" />
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-3 w-64 mt-1" />
                    </div>
                    <Skeleton className="h-96 w-full" />
                </div>
            </CardContent>
             {/* Render footer only if it's a command builder */}
             {!messageId && (
                <CardFooter className="flex justify-end mt-6">
                    <Skeleton className="h-10 w-36" />
                </CardFooter>
            )}
        </Card>
       )
    }

    return (
        <Card className="bg-card/50">
            <CardHeader>
                 <div className="flex justify-between items-start">
                    <div>
                        <CardTitle>Conteúdo da Resposta</CardTitle>
                        <CardDescription>
                           Escolha como o bot deve responder: com um Embed simples ou um Contêiner V2 interativo.
                        </CardDescription>
                    </div>
                     <Tabs value={mode} onValueChange={(value) => setMode(value as EditorMode)} className="w-auto">
                        <TabsList>
                            <TabsTrigger value="embed">Embed</TabsTrigger>
                            <TabsTrigger value="container">Contêiner V2</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
            </CardHeader>
            <CardContent>
                 <div className="space-y-4">
                    <div>
                        <label htmlFor="message-content" className="text-sm font-medium text-muted-foreground">Conteúdo da Mensagem (Opcional)</label>
                        <Textarea 
                            id="message-content"
                            placeholder="Você pode adicionar um texto que será enviado junto com o embed ou contêiner."
                            value={textContent}
                            onChange={(e) => setTextContent(e.target.value)}
                            className="mt-1"
                        />
                         <p className="text-xs text-muted-foreground mt-1">Este texto aparece fora do bloco principal. Suporta Markdown.</p>
                    </div>

                    {mode === 'embed' ? (
                        <EmbedBuilder
                            initialData={embedData}
                            onUpdate={setEmbedData}
                        />
                    ) : (
                        <ContainerBuilder
                            initialComponents={containerComponents}
                            onUpdate={setContainerComponents}
                        />
                    )}
                </div>
            </CardContent>
            {/* Render footer with save button only if it's a command builder */}
             {!messageId && (
                <CardFooter className="flex justify-end mt-6">
                    <Button onClick={handleSaveClick} disabled={isSaving}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        <Bot className="mr-2 h-4 w-4" />
                        Salvar Comando
                    </Button>
                </CardFooter>
            )}
             {/* If it's for bot responses, the save button is in the parent component */}
              {messageId && (
                <CardFooter className="flex justify-end mt-6">
                    <Button onClick={handleSaveClick} disabled={isSaving}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Salvar Resposta
                    </Button>
                </CardFooter>
            )}
        </Card>
    );
}
