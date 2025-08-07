
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from './ui/button';
import { PlusCircle, Trash2, GripVertical, FileText, Image as ImageIcon, ChevronDown, Type, Rows, Link2 } from 'lucide-react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';

// Simplified types for UI representation
type Component = { id: string; type: 'text' | 'actionRow' | 'section' | 'mediaGallery' | 'file' | 'separator' };

interface ContainerBuilderProps {
  initialComponents?: Component[];
  onUpdate: (components: Component[]) => void;
}

// A simplified representation of discord.js builders for the UI
const componentRenderers: Record<Component['type'], React.FC<{ componentId: string, onRemove: (id: string) => void }>> = {
    text: ({ componentId, onRemove }) => (
        <BlockWrapper title="Text Display" onRemove={() => onRemove(componentId)}>
            <Textarea placeholder="Conteúdo do texto. Suporta Markdown." />
        </BlockWrapper>
    ),
    actionRow: ({ componentId, onRemove }) => (
        <BlockWrapper title="Action Row (Botões, Menus)" onRemove={() => onRemove(componentId)}>
            <div className="p-4 border rounded-md bg-secondary/50 space-y-3">
                <Label>Botão 1</Label>
                <div className="grid grid-cols-2 gap-3">
                    <Input placeholder="Label do Botão" />
                    <Select defaultValue="primary">
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="primary">Primary</SelectItem>
                            <SelectItem value="secondary">Secondary</SelectItem>
                            <SelectItem value="success">Success</SelectItem>
                            <SelectItem value="danger">Danger</SelectItem>
                            <SelectItem value="link">Link</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                 <Label>Menu de Seleção 1</Label>
                <Input placeholder="Custom ID do Menu" />
                <Input placeholder="Opção 1 (Label)" />
                <Button variant="outline" size="sm"><PlusCircle className="mr-2 h-4 w-4" />Adicionar Opção</Button>
            </div>
            <Button variant="outline" size="sm" className="mt-2"><PlusCircle className="mr-2 h-4 w-4" />Adicionar Componente na Linha</Button>
        </BlockWrapper>
    ),
    section: ({ componentId, onRemove }) => (
        <BlockWrapper title="Section" onRemove={() => onRemove(componentId)}>
            <Textarea placeholder="Conteúdo do texto da seção..." />
             <div className="flex items-center gap-2 mt-2">
                <Label>Accessory:</Label>
                <Button variant="outline" size="sm">Adicionar Botão</Button>
                <Button variant="outline" size="sm">Adicionar Imagem</Button>
             </div>
        </BlockWrapper>
    ),
    mediaGallery: ({ componentId, onRemove }) => (
        <BlockWrapper title="Media Gallery" onRemove={() => onRemove(componentId)}>
            <Input placeholder="URL da Imagem/Mídia" />
            <Button variant="outline" size="sm" className="mt-2"><PlusCircle className="mr-2 h-4 w-4" />Adicionar Item</Button>
        </BlockWrapper>
    ),
    file: ({ componentId, onRemove }) => (
        <BlockWrapper title="File" onRemove={() => onRemove(componentId)}>
            <Input placeholder="URL do anexo (ex: attachment://arquivo.pdf)" />
        </BlockWrapper>
    ),
    separator: ({ componentId, onRemove }) => (
        <BlockWrapper title="Separator" onRemove={() => onRemove(componentId)}>
            <div className="flex items-center gap-2">
                 <Label>Spacing:</Label>
                 <Select defaultValue="small">
                    <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="small">Small</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="large">Large</SelectItem>
                    </SelectContent>
                 </Select>
            </div>
        </BlockWrapper>
    ),
};

function BlockWrapper({ title, children, onRemove }: { title: string, children: React.ReactNode, onRemove: () => void }) {
    return (
        <Card className="bg-background/70 relative group">
            <CardHeader className="flex flex-row items-center justify-between p-3 border-b">
                <div className="flex items-center gap-2">
                    <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                    <h3 className="text-sm font-semibold">{title}</h3>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onRemove}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
            </CardHeader>
            <CardContent className="p-4">
                {children}
            </CardContent>
        </Card>
    );
}

const componentOptions = [
    { type: 'text', label: 'Text Display', icon: Type },
    { type: 'actionRow', label: 'Action Row', icon: Rows },
    { type: 'section', label: 'Section', icon: FileText },
    { type: 'mediaGallery', label: 'Media Gallery', icon: ImageIcon },
    { type: 'file', label: 'File', icon: Link2 },
    { type: 'separator', label: 'Separator', icon: Separator },
] as const;


export function ContainerBuilder({ initialComponents = [], onUpdate }: ContainerBuilderProps) {
    const [components, setComponents] = useState<Component[]>(initialComponents);

    useEffect(() => {
        onUpdate(components);
    }, [components, onUpdate]);

    const addComponent = (type: Component['type']) => {
        setComponents(prev => [...prev, { id: `${type}-${Date.now()}`, type }]);
    };

    const removeComponent = (id: string) => {
        setComponents(prev => prev.filter(c => c.id !== id));
    };

    return (
        <Card className="bg-secondary/50">
            <CardHeader>
                <CardTitle className="text-lg">Container Builder (V2)</CardTitle>
                 <CardDescription>
                    Construa respostas interativas complexas adicionando e organizando blocos de componentes.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-3">
                    {components.map(comp => {
                        const Renderer = componentRenderers[comp.type];
                        return <Renderer key={comp.id} componentId={comp.id} onRemove={removeComponent} />;
                    })}
                     {components.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">Nenhum componente adicionado ainda.</p>
                    )}
                </div>

                <Card className="border-dashed">
                    <CardContent className="p-4 text-center">
                        <p className="text-sm font-medium mb-3">Adicionar Componente ao Contêiner</p>
                        <div className="flex flex-wrap justify-center gap-2">
                             {componentOptions.map(opt => (
                                <Button key={opt.type} variant="outline" size="sm" onClick={() => addComponent(opt.type)}>
                                    <opt.icon className="mr-2 h-4 w-4" />
                                    {opt.label}
                                </Button>
                            ))}
                        </div>
                    </CardContent>
                </Card>

            </CardContent>
        </Card>
    );
}
