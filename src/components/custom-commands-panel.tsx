
'use client';

import { useState, useEffect } from 'react';
import { useForm, FormProvider, useFormContext } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { getCustomCommandAction, saveCustomCommandAction } from '@/app/actions';
import { type CustomCommand } from '@/ai/flows/manage-custom-commands';
import { Loader2, Save } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const commandSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'O nome do comando é obrigatório.'),
  description: z.string().min(1, 'A descrição é obrigatória.'),
  responseType: z.enum(['container', 'embed']),
  response: z.object({
    container: z.string().optional(),
    embed: z.object({
      title: z.string().optional(),
      description: z.string().optional(),
    }).optional(),
  }),
});

const commandOptions = [
    { id: 'q-and-a', name: 'Perguntas e Respostas (@Menção)' },
    { id: 'suggest-build', name: 'Sugestão de Build (/suggest-build)' },
    { id: 'novo-comando', name: 'Criar Novo Comando' },
];

export function CustomCommandsPanel() {
  const { toast } = useToast();
  const [selectedCommandId, setSelectedCommandId] = useState<string>('q-and-a');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const methods = useForm<CustomCommand>({
    resolver: zodResolver(commandSchema),
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
      if (!selectedCommandId || selectedCommandId === 'novo-comando') {
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
  
  const onSubmit = async (data: CustomCommand) => {
    setIsSaving(true);
    const result = await saveCustomCommandAction(data);
    if (result.success) {
      toast({
        title: 'Sucesso!',
        description: result.message,
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Erro!',
        description: result.message,
      });
    }
    setIsSaving(false);
  };
  
  const responseType = methods.watch('responseType');

  return (
    <div className="p-4 md:p-6">
      <Card>
        <CardHeader>
          <CardTitle>Comandos e Respostas</CardTitle>
          <CardDescription>
            Crie novos comandos ou personalize as respostas dos comandos existentes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-8">
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
                      onValueChange={(value) => methods.setValue('responseType', value as 'container' | 'embed')}
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
                        Você pode usar variáveis como `{"{{question}}"}`, `{"{{answer}}"}`, ou `{"{{user}}"}`, que serão substituídas na resposta.
                    </p>
                </div>
              )}

              <div className="flex justify-end">
                <Button type="submit" disabled={isSaving || isLoading}>
                  {isSaving ? <Loader2 className="animate-spin" /> : <Save />}
                  Salvar Alterações
                </Button>
              </div>
            </form>
          </FormProvider>
        </CardContent>
      </Card>
    </div>
  );
}
