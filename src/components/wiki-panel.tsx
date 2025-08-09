
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { getGuildConfigAction, saveWikiAction } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, PlusCircle, Trash2 } from 'lucide-react';
import { Skeleton } from './ui/skeleton';
import { Input } from './ui/input';

type WikiEntry = {
    id: string;
    question: string;
    answer: string;
};

export function WikiPanel({ guildId }: { guildId: string }) {
    const [entries, setEntries] = useState<WikiEntry[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
      const fetchConfig = async () => {
        setIsLoading(true);
        try {
          const config = await getGuildConfigAction(guildId);
          if (config && config.wikiData) {
            setEntries(config.wikiData);
          } else {
             if (config === null) {
                console.warn('WikiPanel: No existing config found in Firestore. Using default values.');
             }
          }
        } catch (error) {
          console.error("WikiPanel: Failed to fetch wiki config:", error);
          toast({
            variant: "destructive",
            title: "Erro ao Carregar",
            description: "Não foi possível buscar as configurações da wiki."
          })
        } finally {
          setIsLoading(false);
        }
      };

      fetchConfig();
    }, [guildId, toast]);

    const handleAddEntry = () => {
        setEntries([...entries, { id: `wiki-${Date.now()}`, question: '', answer: '' }]);
    };
    
    const handleRemoveEntry = (id: string) => {
        setEntries(entries.filter(entry => entry.id !== id));
    }

    const handleEntryChange = (id: string, field: 'question' | 'answer', value: string) => {
        setEntries(entries.map(entry => entry.id === id ? { ...entry, [field]: value } : entry));
    }

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await saveWikiAction(guildId, entries);
            toast({
                title: 'Sucesso!',
                description: 'As entradas da Wiki foram salvas.',
            });
        } catch (error) {
            console.error('Falha ao salvar a Wiki:', error);
            toast({
                variant: 'destructive',
                title: 'Erro ao Salvar',
                description: 'Não foi possível salvar as entradas da wiki.',
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
                        <Skeleton className="h-8 w-1/3" />
                        <Skeleton className="h-4 w-2/3 mt-2" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                         <Skeleton className="h-40 w-full" />
                         <Skeleton className="h-10 w-full" />
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
                    <CardTitle>Gerenciador da Wiki</CardTitle>
                    <CardDescription>
                        Adicione e gerencie a base de conhecimento do seu bot. A IA usará essas informações para responder perguntas dos usuários.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {entries.map((entry, index) => (
                        <Card key={entry.id} className="p-4 bg-secondary/50 relative">
                             <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7 text-muted-foreground" onClick={() => handleRemoveEntry(entry.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor={`question-${index}`}>Pergunta / Gatilho</Label>
                                    <Input 
                                        id={`question-${index}`}
                                        placeholder="Ex: Como consigo a flor da meia-noite?"
                                        value={entry.question}
                                        onChange={(e) => handleEntryChange(entry.id, 'question', e.target.value)}
                                    />
                                     <p className="text-xs text-muted-foreground">Insira a pergunta que o usuário faria ou palavras-chave.</p>
                                </div>
                                 <div className="space-y-2">
                                    <Label htmlFor={`answer-${index}`}>Resposta do Bot</Label>
                                    <Textarea
                                        id={`answer-${index}`}
                                        placeholder="Ex: A flor da meia-noite pode ser encontrada na Ilha Sombria durante a noite."
                                        value={entry.answer}
                                        onChange={(e) => handleEntryChange(entry.id, 'answer', e.target.value)}
                                        rows={4}
                                    />
                                     <p className="text-xs text-muted-foreground">Esta é a resposta que o bot fornecerá. Suporta Markdown.</p>
                                </div>
                            </div>
                        </Card>
                    ))}
                    <Button variant="outline" className="w-full border-dashed" onClick={handleAddEntry}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Entrada na Wiki
                    </Button>
                </CardContent>
                <CardFooter className="flex justify-end">
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Salvar Wiki
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
