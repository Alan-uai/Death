
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from './ui/button';
import { PlusCircle, Trash2, GripVertical, FileText, Image as ImageIcon, ChevronDown, Type, Rows, Link2, CaseUpper, MessageSquare, Palette } from 'lucide-react';
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
import { Checkbox } from './ui/checkbox';
import { cn } from '@/lib/utils';
import { ActionRowBuilder } from './action-row-builder';

type AccessoryButton = {
    type: 'button';
    label: string;
    style: 'primary' | 'secondary' | 'success' | 'danger' | 'link';
    url?: string;
};

type AccessoryImage = {
    type: 'image';
    url: string;
}

type Accessory = AccessoryButton | AccessoryImage;


type Component = {
  id: string;
  type: 'text' | 'actionRow' | 'section' | 'mediaGallery' | 'file' | 'separator';
  content?: string; // For text, section
  accessory?: Accessory | null; // For section
  // Separator specific
  spacing?: 'normal' | 'large';
  divider?: boolean;
  // ActionRow specific
  components?: any[];
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
    { type: 'file', label: 'File (Anexo)', icon: Link2 },
    { type: 'separator', label: 'Separador', icon: () => <Separator className="my-0" /> },
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
        if (type === 'separator') {
            newComponent.spacing = 'normal';
            newComponent.divider = true;
        }
        if (type === 'actionRow') {
            newComponent.components = [];
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
                <ActionRowBuilder 
                    initialComponents={component.components}
                    onUpdate={(newComponents) => handleComponentUpdate(component.id, { components: newComponents })}
                />
            </BlockWrapper>
        ),
        section: ({ component }) => (
            <BlockWrapper title="Section" onRemove={() => removeComponent(component.id)}>
                 <div className="flex gap-4">
                    <Textarea 
                        placeholder="Conteúdo do texto da seção..."
                        className="flex-grow"
                        value={component.content || ''}
                        onChange={(e) => handleComponentUpdate(component.id, { content: e.target.value })}
                    />
                    <div className="flex-shrink-0 w-48 space-y-2">
                        <Label>Acessório</Label>
                        {!component.accessory ? (
                             <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="w-full">
                                        <PlusCircle className="mr-2 h-4 w-4" />
                                        Adicionar...
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem onSelect={() => handleComponentUpdate(component.id, { accessory: { type: 'button', label: 'Clique', style: 'secondary' }})}>
                                        <MessageSquare className="mr-2 h-4 w-4" />
                                        Botão
                                    </DropdownMenuItem>
                                     <DropdownMenuItem onSelect={() => handleComponentUpdate(component.id, { accessory: { type: 'button', label: 'Link', style: 'link', url: '' }})}>
                                        <Link2 className="mr-2 h-4 w-4" />
                                        Botão com Link
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onSelect={() => handleComponentUpdate(component.id, { accessory: { type: 'image', url: '' }})}>
                                        <ImageIcon className="mr-2 h-4 w-4" />
                                        Imagem
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <Card className="p-2 bg-secondary/50 w-full relative">
                                <Button variant="ghost" size="icon" className="absolute top-0 right-0 h-6 w-6" onClick={() => handleComponentUpdate(component.id, { accessory: null })}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                                {component.accessory.type === 'image' && (
                                     <div className="space-y-2">
                                        <Label className="text-sm">Imagem</Label>
                                        <Input
                                            placeholder="URL da imagem"
                                            value={component.accessory.url}
                                            onChange={(e) => handleComponentUpdate(component.id, { accessory: { ...component.accessory!, url: e.target.value }})}
                                        />
                                    </div>
                                )}
                                {component.accessory.type === 'button' && (
                                    <div className="space-y-2">
                                        <Label className="text-sm">Botão</Label>
                                        <Input 
                                            placeholder="Label"
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
                                                <SelectItem value="link">Link</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {component.accessory.style === 'link' && (
                                            <Input 
                                                placeholder="URL do Link"
                                                value={component.accessory.url}
                                                onChange={(e) => handleComponentUpdate(component.id, { accessory: { ...component.accessory!, url: e.target.value }})}
                                            />
                                        )}
                                    </div>
                                )}
                            </Card>
                        )}
                    </div>
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
            <BlockWrapper title="File (Anexo)" onRemove={() => removeComponent(component.id)}>
                <Input placeholder="URL do anexo (ex: attachment://arquivo.pdf)" />
            </BlockWrapper>
        ),
        separator: ({ component }) => {
            const toggleSpacing = () => {
                const newSpacing = component.spacing === 'normal' ? 'large' : 'normal';
                handleComponentUpdate(component.id, { spacing: newSpacing });
            };

            const toggleDivider = (checked: boolean) => {
                handleComponentUpdate(component.id, { divider: checked });
            };

            return (
                <BlockWrapper title="Separador" onRemove={() => removeComponent(component.id)}>
                    <div className={cn(
                        "relative flex flex-col items-center justify-center transition-all",
                        component.spacing === 'normal' ? 'h-10' : 'h-16'
                    )}>
                        <div className="absolute left-2 top-1/2 -translate-y-1/2">
                            <Checkbox 
                                checked={component.divider} 
                                onCheckedChange={toggleDivider} 
                                aria-label="Mostrar/Ocultar linha"
                            />
                        </div>
                        <div className="w-full px-12">
                            {component.divider && <Separator />}
                        </div>
                        <Button
                            variant="secondary"
                            size="sm"
                            className="absolute top-1/2 -translate-y-1/2 h-6"
                            onClick={toggleSpacing}
                        >
                            Clique para mudar a margem
                        </Button>
                    </div>
                </BlockWrapper>
            );
        },
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

    