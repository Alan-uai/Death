
'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { PlusCircle, Trash2, GripVertical, Settings, Smile, Edit, Lock, Palette } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"


type ActionButton = {
  id: string;
  label: string;
  style: 'primary' | 'secondary' | 'success' | 'danger' | 'link';
  disabled: boolean;
  emoji?: string;
  url?: string;
};

const buttonStyleClasses: Record<ActionButton['style'], string> = {
    primary: 'bg-indigo-500 hover:bg-indigo-600 text-white',
    secondary: 'bg-gray-500 hover:bg-gray-600 text-white',
    success: 'bg-green-500 hover:bg-green-600 text-white',
    danger: 'bg-red-500 hover:bg-red-600 text-white',
    link: 'bg-transparent text-blue-400 hover:underline p-0',
};

export function ActionRowBuilder() {
  const [buttons, setButtons] = useState<ActionButton[]>([]);
  const [editingButton, setEditingButton] = useState<ActionButton | null>(null);
  const [newLabel, setNewLabel] = useState('');
  const [isLabelAlertOpen, setIsLabelAlertOpen] = useState(false);

  const addButton = () => {
    if (buttons.length >= 5) return;
    setButtons([...buttons, { id: `button-${Date.now()}`, label: 'Novo Botão', style: 'secondary', disabled: false }]);
  };
  
  const removeButton = (id: string) => {
    setButtons(buttons.filter(btn => btn.id !== id));
  };
  
  const handleButtonUpdate = (id: string, updates: Partial<Omit<ActionButton, 'id'>>) => {
    setButtons(buttons.map(btn => btn.id === id ? { ...btn, ...updates } : btn));
  };

  const openLabelEditor = (button: ActionButton) => {
    setEditingButton(button);
    setNewLabel(button.label);
    setIsLabelAlertOpen(true);
  };

  const saveLabel = () => {
    if (editingButton) {
      handleButtonUpdate(editingButton.id, { label: newLabel });
    }
    setIsLabelAlertOpen(false);
    setEditingButton(null);
  };


  return (
    <Card className="bg-secondary/50">
      <CardHeader>
        <CardTitle className="text-lg">Action Row (Buttons)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {buttons.map(button => (
            <Card key={button.id} className="p-3 bg-background/50 relative group flex items-center gap-3">
                <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab opacity-50 hover:opacity-100" />
                
                <div className="flex-grow">
                    <Button 
                        className={buttonStyleClasses[button.style]}
                        disabled={button.disabled}
                    >
                        {button.emoji && <span className="mr-2">{button.emoji}</span>}
                        {button.label}
                    </Button>
                </div>
                
                <div className="flex items-center gap-1">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Settings className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem onSelect={() => openLabelEditor(button)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Mudar Label
                            </DropdownMenuItem>
                             <DropdownMenuItem disabled>
                                <Smile className="mr-2 h-4 w-4" />
                                Definir Emoji
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => handleButtonUpdate(button.id, { disabled: !button.disabled })}>
                                <Lock className="mr-2 h-4 w-4" />
                                {button.disabled ? 'Habilitar' : 'Desabilitar'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                             <DropdownMenuItem onSelect={() => handleButtonUpdate(button.id, { style: 'primary' })}>
                                <Palette className="mr-2 h-4 w-4 text-indigo-500" />
                                Set as Main Action
                            </DropdownMenuItem>
                             <DropdownMenuItem onSelect={() => handleButtonUpdate(button.id, { style: 'secondary' })}>
                                <Palette className="mr-2 h-4 w-4 text-gray-500" />
                                Set as Secondary Action
                            </DropdownMenuItem>
                             <DropdownMenuItem onSelect={() => handleButtonUpdate(button.id, { style: 'success' })}>
                                <Palette className="mr-2 h-4 w-4 text-green-500" />
                                Set as Confirmation
                            </DropdownMenuItem>
                             <DropdownMenuItem onSelect={() => handleButtonUpdate(button.id, { style: 'danger' })}>
                                <Palette className="mr-2 h-4 w-4 text-red-500" />
                                Set as Destructive
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                     <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => removeButton(button.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                </div>
            </Card>
          ))}
        </div>
        <Button variant="outline" size="sm" onClick={addButton} disabled={buttons.length >= 5}>
          <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Botão
        </Button>
        
        {/* Hidden Dialog for editing label */}
        <AlertDialog open={isLabelAlertOpen} onOpenChange={setIsLabelAlertOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>Editar Label do Botão</AlertDialogTitle>
                <AlertDialogDescription>
                    Digite o novo texto que será exibido no botão.
                </AlertDialogDescription>
                </AlertDialogHeader>
                <Input 
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    placeholder="Label do Botão"
                    maxLength={80}
                />
                <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={saveLabel}>Salvar</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

      </CardContent>
    </Card>
  );
}

    