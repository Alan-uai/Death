
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type AccessoryButton = {
    type: 'button';
    label: string;
    style: 'primary' | 'secondary' | 'success' | 'danger';
};

type Component = {
  id: string;
  type: 'text' | 'actionRow' | 'section' | 'mediaGallery' | 'file' | 'separator';
  content?: string; // For text, section
  accessory?: AccessoryButton | null; // For section
  // Other component-specific properties can be added here
};


interface ContainerBuilderProps {
  initialComponents?: Component[];
  onUpdate: (components: Component[]) => void;
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
        const newComponent: Component = { id: `${type}-${Date.now()}`, type };
        if (type === 'section') {
            newComponent.accessory = null;
            newComponent.content = '';
        }
        setComponents(prev => [...prev, newComponent]);
    };

    const removeComponent = (id: string) => {
        setComponents(prev => prev.filter(c => c.id !== id));
    };

    const handleComponentUpdate = (id: string, updates: Partial<Component>) => {
        setComponents(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    };
    
    const componentRenderers: Record<Component['type'], React.FC<{ component: Component }>> = {
        text: ({ component }) => (
            <BlockWrapper title="Text Display" onRemove={() => removeComponent(component.id)}>
                <Textarea 
                  placeholder="Conteúdo do texto. Suporta Markdown." 
                  value={component.content || ''}
                  onChange={(e) => handleComponentUpdate(component.id, { content: e.target.value })}
                />
            </BlockWrapper>
        ),
        actionRow: ({ component }) => (
            <BlockWrapper title="Action Row (Botões, Menus)" onRemove={() => removeComponent(component.id)}>
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
        section: ({ component }) => (
            <BlockWrapper title="Section" onRemove={() => removeComponent(component.id)}>
                <Textarea 
                  placeholder="Conteúdo do texto da seção..."
                  value={component.content || ''}
                  onChange={(e) => handleComponentUpdate(component.id, { content: e.target.value })}
                />
                <div className="flex items-center gap-2 mt-2">
                    <Label>Accessory:</Label>
                    {!component.accessory ? (
                        <>
                            <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleComponentUpdate(component.id, { accessory: { type: 'button', label: 'Novo Botão', style: 'secondary' }})}
                            >
                                Adicionar Botão
                            </Button>
                            <Button variant="outline" size="sm" disabled>Adicionar Imagem</Button>
                        </>
                    ) : (
                        <Card className="p-2 bg-secondary/50 w-full">
                            <div className="flex items-center justify-between">
                                <Label className="text-sm">Botão Acessório</Label>
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleComponentUpdate(component.id, { accessory: null })}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </div>
                            <div className="grid grid-cols-2 gap-3 mt-2">
                                <Input 
                                    placeholder="Label do Botão"
                                    value={component.accessory.label}
                                    onChange={(e) => handleComponentUpdate(component.id, { accessory: { ...component.accessory!, label: e.target.value }})}
                                />
                                <Select 
                                    value={component.accessory.style}
                                    onValueChange={(value) => handleComponentUpdate(component.id, { accessory: { ...component.accessory!, style: value as any }})}
                                >
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="primary">Primary</SelectItem>
                                        <SelectItem value="secondary">Secondary</SelectItem>
                                        <SelectItem value="success">Success</SelectItem>
                                        <SelectItem value="danger">Danger</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </Card>
                    )}
                </div>
            </BlockWrapper>
        ),
        mediaGallery: ({ component }) => (
            <BlockWrapper title="Media Gallery" onRemove={() => removeComponent(component.id)}>
                <Input placeholder="URL da Imagem/Mídia" />
                <Button variant="outline" size="sm" className="mt-2"><PlusCircle className="mr-2 h-4 w-4" />Adicionar Item</Button>
            </BlockWrapper>
        ),
        file: ({ component }) => (
            <BlockWrapper title="File" onRemove={() => removeComponent(component.id)}>
                <Input placeholder="URL do anexo (ex: attachment://arquivo.pdf)" />
            </BlockWrapper>
        ),
        separator: ({ component }) => (
            <BlockWrapper title="Separator" onRemove={() => removeComponent(component.id)}>
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
                        return <Renderer key={comp.id} component={comp} />;
                    })}
                     {components.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">Nenhum componente adicionado ainda.</p>
                    )}
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                     <Button variant="outline" className="w-full border-dashed">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Adicionar Componente
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                     {componentOptions.map(opt => (
                        <DropdownMenuItem key={opt.type} onSelect={() => addComponent(opt.type)}>
                            <opt.icon className="mr-2 h-4 w-4" />
                            <span>{opt.label}</span>
                        </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

            </CardContent>
        </Card>
    );
}

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

    