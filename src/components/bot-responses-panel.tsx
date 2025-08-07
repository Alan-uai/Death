
'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { MessageEditorPanel } from "./message-editor-panel";
import { Card, CardDescription, CardHeader, CardTitle, CardContent, CardFooter } from "./ui/card";
import { Button } from "./ui/button";

const responseCategories = {
    general: {
        title: "Geral",
        responses: [
            { id: 'welcome', label: 'Mensagem de Boas-Vindas' },
            { id: 'error', label: 'Resposta de Erro Genérica' },
            { id: 'success', label: 'Resposta de Sucesso Genérica' },
        ]
    },
    commands: {
        title: "Comandos",
        responses: [
            { id: 'help', label: 'Comando /ajuda' },
            { id: 'stats', label: 'Comando /stats' },
        ]
    }
}

export function BotResponsesPanel({ guildId }: { guildId: string }) {
    // In a real application, you would fetch the saved state for each message
    // from Firestore and pass it down to the MessageEditorPanel.
    // For now, this is a placeholder structure.
    
    return (
        <div className="p-4 md:p-6 space-y-6">
             <Card className="border-none shadow-none bg-transparent">
                <CardHeader className="px-2">
                    <CardTitle>Respostas do Bot</CardTitle>
                    <CardDescription>
                        Edite as mensagens automáticas e respostas de comandos do bot. 
                        Você pode escolher entre Embeds ou Contêineres V2 para cada resposta.
                    </CardDescription>
                </CardHeader>
            </Card>

            <Accordion type="multiple" defaultValue={['general', 'commands']} className="w-full">
                {Object.entries(responseCategories).map(([key, category]) => (
                     <AccordionItem key={key} value={key}>
                        <AccordionTrigger className="text-lg font-semibold">{category.title}</AccordionTrigger>
                        <AccordionContent className="space-y-6 pt-4">
                           {category.responses.map(response => (
                             <Card key={response.id}>
                                <CardHeader>
                                    <CardTitle className="text-xl">{response.label}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <MessageEditorPanel messageId={response.id} guildId={guildId} />
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
