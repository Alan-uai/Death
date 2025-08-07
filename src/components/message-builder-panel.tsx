
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { PlusCircle, Trash2, GripVertical } from 'lucide-react';
import { EmbedBuilder } from './embed-builder';
import { ActionRowBuilder } from './action-row-builder';

// Mock data structure, will be replaced with form state management
type Component = { id: string; type: 'embed' | 'actionRow' | 'content'; data: any };

export function MessageBuilderPanel({ guildId }: { guildId: string }) {
  const [commandName, setCommandName] = useState('');
  const [commandDescription, setCommandDescription] = useState('');
  const [components, setComponents] = useState<Component[]>([]);

  const addComponent = (type: 'embed' | 'actionRow' | 'content') => {
    const newComponent: Component = {
      id: `${type}-${Date.now()}`,
      type: type,
      data: type === 'content' ? '' : (type === 'embed' ? {} : { buttons: [] }),
    };
    setComponents(prev => [...prev, newComponent]);
  };

  const removeComponent = (id: string) => {
    setComponents(prev => prev.filter(c => c.id !== id));
  };

  const handleSave = () => {
    // Logic to save the entire message structure
    console.log({
      commandName,
      commandDescription,
      components,
    });
    // This will call a server action in the future
  };
  
  const renderComponent = (component: Component) => {
    switch(component.type) {
      case 'content':
        return (
          <div className="space-y-2">
            <Label>Conteúdo da Mensagem</Label>
            <Textarea 
              placeholder="Escreva a mensagem principal aqui. Você pode usar Markdown." 
              rows={5}
            />
          </div>
        )
      case 'embed':
        return <EmbedBuilder />;
      case 'actionRow':
        return <ActionRowBuilder />;
      default:
        return null;
    }
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Message Builder</CardTitle>
          <CardDescription>Crie e edite respostas complexas para seus comandos de bot.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="command-name">Nome do Comando</Label>
              <Input id="command-name" value={commandName} onChange={(e) => setCommandName(e.target.value)} placeholder="/bemvindo" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="command-desc">Descrição do Comando</Label>
              <Input id="command-desc" value={commandDescription} onChange={(e) => setCommandDescription(e.target.value)} placeholder="Mostra a mensagem de boas-vindas" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="space-y-4">
        {components.map((component, index) => (
          <Card key={component.id} className="relative group">
             <div className="absolute -left-8 top-1/2 -translate-y-1/2 flex flex-col items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
              </div>
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button variant="ghost" size="icon" onClick={() => removeComponent(component.id)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
            <CardContent className="p-4">
              {renderComponent(component)}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-dashed">
        <CardContent className="p-4 text-center">
          <div className="flex justify-center gap-4">
            <Button variant="outline" onClick={() => addComponent('content')}>
              <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Conteúdo
            </Button>
            <Button variant="outline" onClick={() => addComponent('embed')}>
              <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Embed
            </Button>
            <Button variant="outline" onClick={() => addComponent('actionRow')}>
              <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Botões
            </Button>
          </div>
        </CardContent>
      </Card>

       <div className="flex justify-end">
          <Button onClick={handleSave}>
              Salvar Comando
          </Button>
        </div>
    </div>
  );
}
