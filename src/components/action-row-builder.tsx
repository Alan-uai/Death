
'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { PlusCircle, Trash2, GripVertical } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"


type ActionButton = { id: string; label: string; style: 'primary' | 'secondary' | 'success' | 'danger' | 'link'; url?: string; };

const buttonStyleClasses = {
    primary: 'bg-indigo-500 hover:bg-indigo-600 text-white',
    secondary: 'bg-gray-500 hover:bg-gray-600 text-white',
    success: 'bg-green-500 hover:bg-green-600 text-white',
    danger: 'bg-red-500 hover:bg-red-600 text-white',
    link: 'bg-transparent text-blue-400 hover:underline p-0',
};

export function ActionRowBuilder() {
  const [buttons, setButtons] = useState<ActionButton[]>([]);

  const addButton = () => {
    setButtons([...buttons, { id: `button-${Date.now()}`, label: 'Novo Botão', style: 'secondary' }]);
  };
  
  const removeButton = (id: string) => {
    setButtons(buttons.filter(btn => btn.id !== id));
  };
  
  const handleButtonChange = (id: string, field: keyof ActionButton, value: string) => {
    setButtons(buttons.map(btn => btn.id === id ? { ...btn, [field]: value } : btn));
  };

  return (
    <Card className="bg-secondary/50">
      <CardHeader>
        <CardTitle className="text-lg">Action Row (Buttons)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {buttons.map(button => (
            <Card key={button.id} className="p-3 bg-background/50 relative group flex items-center gap-2">
                <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab opacity-50 hover:opacity-100" />
                <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-1">
                        <Label htmlFor={`btn-label-${button.id}`}>Label</Label>
                        <Input id={`btn-label-${button.id}`} value={button.label} onChange={(e) => handleButtonChange(button.id, 'label', e.target.value)} placeholder="Texto do botão" />
                    </div>
                     <div className="space-y-1">
                        <Label htmlFor={`btn-style-${button.id}`}>Style</Label>
                        <Select value={button.style} onValueChange={(value) => handleButtonChange(button.id, 'style', value)}>
                            <SelectTrigger id={`btn-style-${button.id}`}>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="primary">Primary (Azul)</SelectItem>
                                <SelectItem value="secondary">Secondary (Cinza)</SelectItem>
                                <SelectItem value="success">Success (Verde)</SelectItem>
                                <SelectItem value="danger">Danger (Vermelho)</SelectItem>
                                <SelectItem value="link">Link</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-1">
                        <Label htmlFor={`btn-url-${button.id}`}>URL (se Link)</Label>
                        <Input id={`btn-url-${button.id}`} value={button.url} onChange={(e) => handleButtonChange(button.id, 'url', e.target.value)} placeholder="https://google.com" disabled={button.style !== 'link'} />
                    </div>
                </div>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" onClick={() => removeButton(button.id)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </Card>
          ))}
        </div>
        <Button variant="outline" size="sm" onClick={addButton}>
          <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Botão
        </Button>
        
        <div className="mt-4 p-4 border rounded-lg bg-background/50">
            <Label>Pré-visualização</Label>
            <div className="flex gap-2 mt-2">
                {buttons.map(button => (
                    <Button key={`preview-${button.id}`} className={buttonStyleClasses[button.style]} size="sm">
                        {button.label}
                    </Button>
                ))}
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
