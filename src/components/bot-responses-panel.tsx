'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { MessageEditorPanel } from "./message-editor-panel";
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from "./ui/card";
import { saveBotResponseAction } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const responseCategories = {
    general: {
        title: "Geral",
        responses: [
            { id: 'welcome', label: 'Mensagem de Boas-Vindas', description: 'A mensagem que novos membros recebem. Use {user} para mencionar o usuário e {server} para o nome do servidor.' },
            { id: 'error', label: 'Resposta de Erro Genérica', description: 'Enviada quando um comando falha por um motivo inesperado.' },
            { id: 'success', label: 'Resposta de Sucesso Genérica', description: 'Confirmação padrão para ações bem-sucedidas.' },
        ]
    },
    features: {
        title: "Funcionalidades",
        responses: [
             { id: 'verificationForm', label: 'Formulário de Verificação', description: 'O formulário que os usuários devem preencher para se verificarem no servidor.' },
        ]
    },
    commands: {
        title: "Comandos",
        responses: [
            { id: 'help', label: 'Comando /ajuda', description: 'A resposta padrão para o comando de ajuda.' },
            { id: 'stats', label: 'Comando /stats', description: 'A resposta para o comando que exibe estatísticas.' },
        ]
    }
}

export function BotResponsesPanel({ guildId }: { guildId: string }) {
    const { toast } = useToast();
    const [savingStates, setSavingStates] = useState<Record<string, boolean>>({});

    const handleSave = async (messageId: string, messageData: any) => {
        setSavingStates(prev => ({ ...prev, [messageId]: true }));
        try {
            const responsePayload = {
                responseType: messageData.mode,
                response: {
                    content: messageData.textContent,
                    embed: messageData.mode === 'embed' ? messageData.embed : undefined,
                    container: messageData.mode === 'container' ? messageData.container : undefined,
                }
            };
            await saveBotResponseAction(guildId, messageId, responsePayload);
            toast({
                title: 'Sucesso!',
                description: `A resposta para "${messageId}" foi salva.`,
            });
        } catch (error) {
            console.error(`Falha ao salvar a resposta para ${messageId}:`, error);
            toast({
                variant: 'destructive',
                title: 'Erro ao Salvar',
                description: 'Não foi possível salvar a resposta do bot.',
            });
        } finally {
            setSavingStates(prev => ({ ...prev, [messageId]: false }));
        }
    };
    
    return (
        <div className="p-4 md:p-6 space-y-6">
             <Card className="border-none shadow-none bg-transparent">
                <CardHeader className="px-2">
                    <CardTitle>Respostas do Bot</CardTitle>
                    <CardDescription>
                        Edite as mensagens automáticas e respostas de comandos do bot.
                    </CardDescription>
                </CardHeader>
            </Card>

            <Accordion type="multiple" defaultValue={['general', 'features', 'commands']} className="w-full">
                {Object.entries(responseCategories).map(([key, category]) => (
                     <AccordionItem key={key} value={key}>
                        <AccordionTrigger className="text-lg font-semibold">{category.title}</AccordionTrigger>
                        <AccordionContent className="space-y-6 pt-4">
                           {category.responses.map(response => (
                             <Card key={response.id}>
                                <CardHeader>
                                    <CardTitle className="text-xl">{response.label}</CardTitle>
                                    <CardDescription>{response.description}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <MessageEditorPanel 
                                        messageId={response.id} 
                                        guildId={guildId}
                                        onSave={(data) => handleSave(response.id, data)}
                                        isSaving={savingStates[response.id] || false}
                                        saveButtonText="Salvar Resposta"
                                    />
                                </CardContent>
                            </Card>
                           ))}
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
    )
}
