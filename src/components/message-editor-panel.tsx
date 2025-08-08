
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
    onSave?: (data: any) => Promise<void> | void;
    isSaving?: boolean;
    saveButtonText?: string;
    initialData?: any;
    commandName?: string;
}

export function MessageEditorPanel({ 
    messageId, 
    guildId, 
    onSave, 
    isSaving = false,
    saveButtonText = "Salvar",
    initialData,
    commandName
}: MessageEditorPanelProps) {
    const [mode, setMode] = useState<EditorMode>('embed');
    const [textContent, setTextContent] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    
    // States for builders
    const [embedData, setEmbedData] = useState<any>({});
    const [containerComponents, setContainerComponents] = useState<any[]>([]);

    const handleSaveClick = () => {
        if (!onSave) return;
        const dataToSave = {
            mode,
            textContent,
            embed: mode === 'embed' ? embedData : undefined,
            container: mode === 'container' ? containerComponents : undefined,
        };
        onSave(dataToSave);
    }

    const loadInitialData = useCallback((data: any) => {
        if (data && Object.keys(data).length > 0) {
            setMode(data.responseType || 'embed');
            setTextContent(data.response?.content || '');
            if (data.responseType === 'embed' && data.response?.embed) {
                setEmbedData(data.response.embed);
            } else {
                setEmbedData({});
            }
            if (data.responseType === 'container' && data.response?.container) {
                setContainerComponents(data.response.container);
            } else {
                setContainerComponents([]);
            }
        }
    }, []);

    useEffect(() => {
        if (initialData) {
            // Se dados iniciais forem fornecidos, use-os diretamente.
            const responseData = {
                responseType: initialData.mode,
                response: {
                    content: initialData.textContent,
                    embed: initialData.embed,
                    container: initialData.container,
                },
            };
            loadInitialData(responseData);
            setIsLoading(false);
            return;
        }

        if (!messageId) {
            // Se não há messageId nem initialData, é um editor novo.
            setIsLoading(false);
            return;
        }

        const fetchMessageConfig = async () => {
            setIsLoading(true);
            try {
                const config = await getGuildConfigAction(guildId);
                const messageConfig = config?.botResponses?.[messageId];
                if (messageConfig) {
                    loadInitialData(messageConfig);
                } else {
                    // Se não há configuração salva, resete para o estado inicial.
                    setTextContent('');
                    setEmbedData({});
                    setContainerComponents([]);
                }
            } catch (error) {
                console.error(`Failed to fetch config for message: ${messageId}`, error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMessageConfig();
    }, [messageId, guildId, initialData, loadInitialData]);
    
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
             {onSave && (
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
                    <TabsContent value="embed" className="m-0">
                         <EmbedBuilder
                            initialData={embedData}
                            onUpdate={setEmbedData}
                        />
                    </TabsContent>
                    <TabsContent value="container" className="m-0">
                        <ContainerBuilder
                            initialComponents={containerComponents}
                            onUpdate={setContainerComponents}
                            commandName={commandName}
                        />
                    </TabsContent>
                </div>
            </CardContent>
            {onSave && (
                <CardFooter className="flex justify-end mt-6">
                    <Button onClick={handleSaveClick} disabled={isSaving}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        <Bot className="mr-2 h-4 w-4" />
                        {saveButtonText}
                    </Button>
                </CardFooter>
            )}
        </Card>
    );
}
