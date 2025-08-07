
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from './ui/button';
import { PlusCircle, Trash2 } from 'lucide-react';
import { Separator } from './ui/separator';

type EmbedField = { id: string; name: string; value: string; inline: boolean };

export function EmbedBuilder() {
  const [color, setColor] = useState('#2B2D31');
  const [fields, setFields] = useState<EmbedField[]>([]);
  
  const addField = () => {
    setFields([...fields, { id: `field-${Date.now()}`, name: '', value: '', inline: false }]);
  };
  
  const removeField = (id: string) => {
    setFields(fields.filter(field => field.id !== id));
  };

  return (
    <Card className="bg-secondary/50 border-l-4" style={{ borderColor: color }}>
      <CardHeader>
        <CardTitle className="text-lg">Embed Builder</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="space-y-2 flex-grow">
            <Label htmlFor="embed-author">Autor</Label>
            <Input id="embed-author" placeholder="Nome do autor" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="embed-color">Cor</Label>
            <Input 
              id="embed-color" 
              type="color" 
              value={color} 
              onChange={(e) => setColor(e.target.value)} 
              className="p-1 h-10 w-14"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="embed-title">Título</Label>
          <Input id="embed-title" placeholder="Título do embed" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="embed-description">Descrição</Label>
          <Textarea id="embed-description" placeholder="Corpo principal do embed. Suporta Markdown." rows={4} />
        </div>
        
        <Separator />

        <div>
          <h4 className="text-base font-medium mb-2">Campos (Fields)</h4>
          <div className="space-y-4">
            {fields.map((field) => (
              <Card key={field.id} className="p-3 bg-background/50 relative group">
                <Button variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100" onClick={() => removeField(field.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`field-name-${field.id}`}>Título do Campo</Label>
                    <Input id={`field-name-${field.id}`} placeholder="Título do campo" />
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor={`field-value-${field.id}`}>Valor do Campo</Label>
                    <Input id={`field-value-${field.id}`} placeholder="Valor do campo" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
          <Button variant="outline" size="sm" className="mt-4" onClick={addField}>
            <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Campo
          </Button>
        </div>

        <Separator />

        <div className="space-y-2">
          <Label htmlFor="embed-footer">Rodapé</Label>
          <Input id="embed-footer" placeholder="Texto do rodapé" />
        </div>
      </CardContent>
    </Card>
  );
}
