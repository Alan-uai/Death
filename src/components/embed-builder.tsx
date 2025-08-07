
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from './ui/button';
import { PlusCircle, Trash2, GripVertical, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type EmbedField = { id: string; name: string; value: string; inline: boolean };

type EmbedData = {
  author?: { name: string; icon_url?: string };
  color?: string;
  title?: string;
  description?: string;
  fields?: EmbedField[];
  footer?: { text: string; icon_url?: string };
  image?: { url: string };
  thumbnail?: { url: string };
}

interface EmbedBuilderProps {
  initialData?: EmbedData;
  onUpdate: (data: EmbedData) => void;
}

const embedProperties = [
    { key: 'author', label: 'Autor' },
    { key: 'title', label: 'Título' },
    { key: 'description', label: 'Descrição' },
    { key: 'fields', label: 'Campos (Fields)' },
    { key: 'image', label: 'Imagem Principal' },
    { key: 'thumbnail', label: 'Thumbnail' },
    { key: 'footer', label: 'Rodapé' },
] as const;


export function EmbedBuilder({ initialData = {}, onUpdate }: EmbedBuilderProps) {
  const [data, setData] = useState<EmbedData>(initialData);
  const [color, setColor] = useState(initialData.color || '#2B2D31');

  useEffect(() => {
    onUpdate({ ...data, color });
  }, [data, color, onUpdate]);
  
  const addProperty = (key: typeof embedProperties[number]['key']) => {
    const newData = {...data};
    switch (key) {
        case 'author': newData.author = { name: '' }; break;
        case 'title': newData.title = ''; break;
        case 'description': newData.description = ''; break;
        case 'fields': newData.fields = []; break;
        case 'footer': newData.footer = { text: '' }; break;
        case 'image': newData.image = { url: '' }; break;
        case 'thumbnail': newData.thumbnail = { url: '' }; break;
    }
    setData(newData);
  };

  const removeProperty = (key: keyof EmbedData) => {
    const newData = {...data};
    delete newData[key];
    setData(newData);
  };

  const handleFieldChange = (id: string, prop: 'name' | 'value', value: string) => {
    setData(prev => ({
        ...prev,
        fields: prev.fields?.map(f => f.id === id ? {...f, [prop]: value} : f)
    }));
  };
  
  const addField = () => {
    setData(prev => ({
        ...prev,
        fields: [...(prev.fields || []), { id: `field-${Date.now()}`, name: '', value: '', inline: false }]
    }));
  };

  const removeField = (id: string) => {
    setData(prev => ({
        ...prev,
        fields: prev.fields?.filter(f => f.id !== id)
    }));
  };

  const availableProperties = embedProperties.filter(p => !(p.key in data));

  const renderProperty = (key: keyof EmbedData) => {
    switch (key) {
        case 'author':
            return (
                <BlockWrapper title="Autor" onRemove={() => removeProperty('author')}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label>Nome do Autor</Label>
                            <Input placeholder="Nome" value={data.author?.name} onChange={e => setData(d => ({...d, author: {...d.author!, name: e.target.value}}))} />
                        </div>
                        <div className="space-y-1">
                            <Label>URL do Ícone do Autor</Label>
                            <Input placeholder="https://" value={data.author?.icon_url} onChange={e => setData(d => ({...d, author: {...d.author!, icon_url: e.target.value}}))} />
                        </div>
                    </div>
                </BlockWrapper>
            )
        case 'title':
            return (
                <BlockWrapper title="Título" onRemove={() => removeProperty('title')}>
                    <Input placeholder="Título do embed" value={data.title} onChange={e => setData(d => ({...d, title: e.target.value}))} />
                </BlockWrapper>
            )
        case 'description':
             return (
                <BlockWrapper title="Descrição" onRemove={() => removeProperty('description')}>
                    <Textarea placeholder="Corpo principal do embed. Suporta Markdown." rows={4} value={data.description} onChange={e => setData(d => ({...d, description: e.target.value}))} />
                </BlockWrapper>
            )
        case 'fields':
            return (
                <BlockWrapper title="Campos (Fields)" onRemove={() => removeProperty('fields')}>
                     <div className="space-y-3">
                        {data.fields?.map(field => (
                           <Card key={field.id} className="p-3 bg-secondary/50 relative group">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <Label>Título do Campo</Label>
                                        <Input placeholder="Título" value={field.name} onChange={e => handleFieldChange(field.id, 'name', e.target.value)} />
                                    </div>
                                    <div className="space-y-1">
                                        <Label>Valor do Campo</Label>
                                        <Input placeholder="Valor" value={field.value} onChange={e => handleFieldChange(field.id, 'value', e.target.value)} />
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon" className="absolute top-1 right-1 h-7 w-7" onClick={() => removeField(field.id)}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </Card>
                        ))}
                     </div>
                     <Button variant="outline" size="sm" className="mt-3" onClick={addField}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Campo
                    </Button>
                </BlockWrapper>
            )
        case 'footer':
            return (
                <BlockWrapper title="Rodapé" onRemove={() => removeProperty('footer')}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label>Texto do Rodapé</Label>
                            <Input placeholder="Texto" value={data.footer?.text} onChange={e => setData(d => ({...d, footer: {...d.footer!, text: e.target.value}}))} />
                        </div>
                        <div className="space-y-1">
                            <Label>URL do Ícone do Rodapé</Label>
                            <Input placeholder="https://" value={data.footer?.icon_url} onChange={e => setData(d => ({...d, footer: {...d.footer!, icon_url: e.target.value}}))} />
                        </div>
                    </div>
                </BlockWrapper>
            )
        case 'image':
             return (
                <BlockWrapper title="Imagem Principal" onRemove={() => removeProperty('image')}>
                    <Label>URL da Imagem</Label>
                    <Input placeholder="https://" value={data.image?.url} onChange={e => setData(d => ({...d, image: {url: e.target.value}}))} />
                </BlockWrapper>
            )
        case 'thumbnail':
            return (
                <BlockWrapper title="Thumbnail" onRemove={() => removeProperty('thumbnail')}>
                    <Label>URL da Thumbnail</Label>
                    <Input placeholder="https://" value={data.thumbnail?.url} onChange={e => setData(d => ({...d, thumbnail: {url: e.target.value}}))} />
                </BlockWrapper>
            )
        default:
            return null;
    }
  }

  return (
    <Card className="bg-secondary/50 border-l-4" style={{ borderColor: color }}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Embed Builder</CardTitle>
        <div className="space-y-1 flex items-center gap-2">
            <Label htmlFor="embed-color" className="text-sm">Cor</Label>
            <Input 
              id="embed-color" 
              type="color" 
              value={color} 
              onChange={(e) => setColor(e.target.value)} 
              className="p-1 h-8 w-10"
            />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
            {(Object.keys(data) as Array<keyof EmbedData>).map(key => key !== 'color' && renderProperty(key))}
            {Object.keys(data).length === 0 && (
                 <p className="text-sm text-muted-foreground text-center py-4">Nenhuma propriedade adicionada ainda.</p>
            )}
        </div>

        {availableProperties.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                 <Button variant="outline" className="w-full border-dashed">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Adicionar Propriedade
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                 {availableProperties.map(prop => (
                    <DropdownMenuItem key={prop.key} onSelect={() => addProperty(prop.key)}>
                        <span>{prop.label}</span>
                    </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
        )}
      </CardContent>
    </Card>
  );
}


function BlockWrapper({ title, children, onRemove }: { title: string, children: React.ReactNode, onRemove: () => void }) {
    return (
        <Card className="bg-background/70 relative group">
            <CardHeader className="flex flex-row items-center justify-between p-3 border-b">
                <div className="flex items-center gap-2">
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
