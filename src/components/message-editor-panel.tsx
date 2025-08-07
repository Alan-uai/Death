
'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EmbedBuilder } from './embed-builder';
import { ContainerBuilder } from './container-builder';
import { Textarea } from './ui/textarea';
import { Card, CardDescription, CardHeader, CardTitle } from './ui/card';

type EditorMode = 'embed' | 'container';

interface MessageEditorPanelProps {
    messageId?: string; // Optional ID for tracking which message is being edited
}

export function MessageEditorPanel({ messageId }: MessageEditorPanelProps) {
    const [mode, setMode] = useState<EditorMode>('embed');
    const [textContent, setTextContent] = useState('');

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

                    {mode === 'embed' ? <EmbedBuilder /> : <ContainerBuilder />}
                </div>
            </CardContent>
        </Card>
    );
}
