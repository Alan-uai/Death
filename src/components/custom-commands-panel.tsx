
'use client';

import { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { getCustomCommandAction, saveCommandConfigAction } from '@/app/actions';
import { type CustomCommand, CustomCommandSchema } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';

const commandOptions = [
    { id: 'q-and-a', name: 'Perguntas e Respostas (@Menção)' },
    { id: 'suggest-build', name: 'Sugestão de Build (/suggest-build)' },
    { id: 'novo-comando', name: 'Criar Novo Comando' },
];

export function CustomCommandsPanel({ guildId }: { guildId: string }) {
  const [selectedCommandId, setSelectedCommandId] = useState<string>('q-and-a');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const methods = useForm<CustomCommand>({
    resolver: zodResolver(CustomCommandSchema),
    defaultValues: {
      id: 'q-and-a',
      name: 'Perguntas e Respostas',
      description: 'Resposta padrão ao ser mencionado.',
      responseType: 'embed',
      response: {
        container: '',
        embed: { title: '', description: '' },
      },
    },
  });

  useEffect(() => {
    const fetchCommandData = async () => {
      if (!selectedCommandId) return;

      const isNewCommand = selectedCommandId === 'novo-comando';
      methods.reset(undefined, { keepDirty: false, keepValues: false });

      if (isNewCommand) {
         methods.reset({
          id: `custom-${Date.now()}`,
          name: '',
          description: '',
          responseType: 'embed',
          response: { container: '', embed: { title: '', description: '' } },
        });
        return;
      }

      setIsLoading(true);
      const existingCommand = await getCustomCommandAction(selectedCommandId);
      if (existingCommand) {
        methods.reset(existingCommand);
      } else {
        const selectedOption = commandOptions.find(c => c.id === selectedCommandId);
        methods.reset({
          id: selectedCommandId,
          name: selectedOption?.name || '',
          description: 'Personalize a resposta para este comando.',
          responseType: 'embed',
          response: { container: '', embed: { title: 'Resposta para {{question}}', description: '{{answer}}' } },
        });
      }
      setIsLoading(false);
    };

    fetchCommandData();
  }, [selectedCommandId, methods]);
  
  const handleSave = async (data: CustomCommand) => {
    setIsSaving(true);
    try {
        await saveCommandConfigAction(guildId, data);
        toast({
            title: 'Sucesso!',
            description: `Comando "${data.name}" salvo com sucesso.`
        });
        methods.reset(data); // Reseta o form state para "não-sujo"
    } catch (error) {
        console.error("Falha ao salvar comando: ", error);
        toast({
            variant: 'destructive',
            title: 'Erro ao Salvar',
            description: `Não foi possível salvar o comando.`
        });
    } finally {
        setIsSaving(false);
    }
  };
  
  const responseType = methods.watch('responseType');

  return (
    <div className="p-4 md:p-6">
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(handleSave)}>
          <Card>
            <CardHeader>
              <CardTitle>Comandos e Respostas</CardTitle>
              <CardDescription>
                Crie novos comandos ou personalize as respostas.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
                <div>
                  <Label htmlFor="command-select">Selecione o Comando para Editar</Label>
                  <Select value={selectedCommandId} onValueChange={setSelectedCommandId}>
                    <SelectTrigger id="command-select">
                      <SelectValue placeholder="Selecione um comando..." />
                    </SelectTrigger>
                    <SelectContent>
                      {commandOptions.map(cmd => (
                        <SelectItem key={cmd.id} value={cmd.id}>{cmd.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {isLoading ? (
                  <div className="flex justify-center items-center h-40">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-6 rounded-md border p-4">
                      {selectedCommandId === 'novo-comando' && (
                          <>
                              <div className="space-y-2">
                                  <Label htmlFor="name">Nome do Comando (ex: /regras)</Label>
                                  <Input id="name" {...methods.register('name')} placeholder="/regras"/>
                                  {methods.formState.errors.name && <p className="text-sm text-destructive">{methods.formState.errors.name.message}</p>}
                              </div>
                              <div className="space-y-2">
                                  <Label htmlFor="description">Descrição do Comando</Label>
                                  <Input id="description" {...methods.register('description')} placeholder="Mostra as regras do servidor"/>
                                  {methods.formState.errors.description && <p className="text-sm text-destructive">{methods.formState.errors.description.message}</p>}
                              </div>
                          </>
                      )}
                    
                    <div className="space-y-2">
                      <Label>Formato da Resposta</Label>
                      <RadioGroup
                        value={responseType}
                        onValueChange={(value) => methods.setValue('responseType', value as 'container' | 'embed', { shouldDirty: true })}
                        className="flex gap-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="container" id="r-container" />
                          <Label htmlFor="r-container">Container (Texto Simples)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="embed" id="r-embed" />
                          <Label htmlFor="r-embed">Embed (Cartão Formatado)</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <Separator />

                    {responseType === 'container' ? (
                      <div className="space-y-2">
                        <Label htmlFor="response.container">Conteúdo da Mensagem</Label>
                        <Textarea
                          id="response.container"
                          {...methods.register('response.container')}
                          placeholder="Digite a resposta do bot aqui."
                          rows={5}
                        />
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="response.embed.title">Título do Embed</Label>
                          <Input
                            id="response.embed.title"
                            {...methods.register('response.embed.title')}
                            placeholder="Título do cartão"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="response.embed.description">Descrição do Embed</Label>
                          <Textarea
                            id="response.embed.description"
                            {...methods.register('response.embed.description')}
                            placeholder="Corpo da mensagem do cartão"
                            rows={5}
                          />
                        </div>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">
                          Você pode usar variáveis como `{"{{question}}"}`, `{"{{answer}}"}`, ou `{"{{user}}"}`, que serão substituídas na resposta do bot.
                      </p>
                  </div>
                )}
            </CardContent>
             <CardFooter className="flex justify-end">
                  <Button type="submit" disabled={isSaving || !methods.formState.isDirty}>
                      {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Salvar Alterações
                  </Button>
              </CardFooter>
          </Card>
        </form>
      </FormProvider>
    </div>
  );
}
