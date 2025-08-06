
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { saveGenericConfigAction } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

type Personality = 'amigavel' | 'sarcastico' | 'formal';

const personalityDescriptions: Record<Personality, string> = {
    amigavel: 'O bot será amigável, prestativo e usará emojis. Ideal para comunidades descontraídas.',
    sarcastico: 'O bot terá um tom espirituoso e irônico. Bom para engajar com humor.',
    formal: 'O bot será direto, objetivo e sem excessos. Perfeito para servidores profissionais.',
};

const personalityPrompts: Record<Personality, string> = {
    amigavel: 'Você é o Death, um bot do Discord. Aja de forma muito amigável, prestativa e use emojis para tornar a conversa mais leve e divertida. Sempre se ofereça para ajudar com mais alguma coisa.',
    sarcastico: 'Você é o Death, um bot do Discord. Responda com um tom sarcástico e espirituoso, mas sem ser rude. Use ironia e humor para interagir com os usuários. Você secretamente gosta de ajudar, mas nunca admita isso.',
    formal: 'Você é o Death, um bot do Discord. Comunique-se de maneira formal, clara e concisa. Evite gírias, emojis ou linguagem casual. Vá direto ao ponto e forneça as informações solicitadas de forma eficiente.',
};

export function BotPersonalityPanel({ guildId }: { guildId: string }) {
    const [personality, setPersonality] = useState<Personality>('amigavel');
    const [customPrompt, setCustomPrompt] = useState(personalityPrompts.amigavel);
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();

    const handlePersonalityChange = (newPersonality: Personality) => {
        setPersonality(newPersonality);
        const oldDefaultPrompt = personalityPrompts[personality];
        if (customPrompt === oldDefaultPrompt || customPrompt === '') {
            setCustomPrompt(personalityPrompts[newPersonality]);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await saveGenericConfigAction(guildId, {
                personality,
                customPrompt
            });
            toast({
                title: 'Sucesso!',
                description: 'A personalidade do bot foi salva.',
            });
        } catch (error) {
            console.error('Falha ao salvar personalidade:', error);
            toast({
                variant: 'destructive',
                title: 'Erro ao Salvar',
                description: 'Não foi possível salvar a personalidade do bot.',
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="p-4 md:p-6">
            <Card>
                <CardHeader>
                    <CardTitle>Personalidade do Bot</CardTitle>
                    <CardDescription>
                        Defina o tom e a persona do seu bot para que ele se encaixe na sua comunidade.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                    <div className="space-y-4">
                        <Label className="text-base font-medium">Estilo de Comunicação</Label>
                        <RadioGroup value={personality} onValueChange={(value) => handlePersonalityChange(value as Personality)} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                           {(Object.keys(personalityDescriptions) as Personality[]).map((key) => (
                             <div key={key}>
                               <RadioGroupItem value={key} id={key} className="peer sr-only" />
                               <Label htmlFor={key} className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                                 <span className="font-semibold capitalize">{key}</span>
                                 <p className="text-xs text-muted-foreground mt-2 text-center">{personalityDescriptions[key]}</p>
                               </Label>
                             </div>
                           ))}
                        </RadioGroup>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="custom-prompt" className="text-base font-medium">Prompt de Personalidade</Label>
                        <p className="text-sm text-muted-foreground">
                           Este é o prompt que o modelo de IA usará para guiar todas as suas respostas. Sinta-se à vontade para personalizá-lo como quiser.
                        </p>
                        <Textarea
                            id="custom-prompt"
                            value={customPrompt}
                            onChange={(e) => setCustomPrompt(e.target.value)}
                            rows={8}
                            placeholder="Descreva em detalhes como o bot deve se comportar, o que ele deve ou não fazer, etc."
                        />
                    </div>
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
