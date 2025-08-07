
'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Input } from './ui/input';
import { PlusCircle, Trash2, GripVertical, Settings, Smile, Edit, Lock, Palette, MenuSquare, Check, Pencil, MessageSquare } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
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
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';


type ActionButton = {
  type: 'button';
  id: string;
  label: string;
  style: 'primary' | 'secondary' | 'success' | 'danger' | 'link';
  disabled: boolean;
  emoji?: string;
  url?: string;
};

type SelectMenuOption = {
    id: string;
    label: string;
    value: string;
    description?: string;
    emoji?: string;
    default: boolean;
}

type ActionSelectMenu = {
    type: 'selectMenu';
    id: string;
    customId: string;
    placeholder?: string;
    minValues?: number;
    maxValues?: number;
    options: SelectMenuOption[];
}

type ActionRowComponent = ActionButton | ActionSelectMenu;


interface ActionRowBuilderProps {
    initialComponents?: ActionRowComponent[];
    onUpdate: (components: ActionRowComponent[]) => void;
}


const buttonStyleClasses: Record<ActionButton['style'], string> = {
    primary: 'bg-indigo-500 hover:bg-indigo-600 text-white',
    secondary: 'bg-gray-500 hover:bg-gray-600 text-white',
    success: 'bg-green-500 hover:bg-green-600 text-white',
    danger: 'bg-red-500 hover:bg-red-600 text-white',
    link: 'bg-transparent text-blue-400 hover:underline p-0',
};

export function ActionRowBuilder({ initialComponents = [], onUpdate }: ActionRowBuilderProps) {
  const [components, setComponents] = useState<ActionRowComponent[]>(initialComponents);
  const [editingButton, setEditingButton] = useState<ActionButton | null>(null);
  const [newLabel, setNewLabel] = useState('');
  const [isLabelAlertOpen, setIsLabelAlertOpen] = useState(false);

  const handleUpdate = (newComponents: ActionRowComponent[]) => {
      setComponents(newComponents);
      onUpdate(newComponents);
  }

  const addComponent = (type: 'button' | 'selectMenu') => {
    if (components.length >= 5) return;
    
    let newComponent: ActionRowComponent;
    if (type === 'button') {
        newComponent = { type: 'button', id: `button-${Date.now()}`, label: 'Novo Botão', style: 'secondary', disabled: false };
    } else {
        newComponent = { type: 'selectMenu', id: `select-${Date.now()}`, customId: `select_menu_${Date.now()}`, options: [] };
    }
    
    handleUpdate([...components, newComponent]);
  };
  
  const removeComponent = (id: string) => {
    handleUpdate(components.filter(c => c.id !== id));
  };
  
  const handleComponentUpdate = (id: string, updates: Partial<ActionRowComponent>) => {
    const updatedComponents = components.map(c => c.id === id ? { ...c, ...updates } : c);
    handleUpdate(updatedComponents);
  };

  const openLabelEditor = (button: ActionButton) => {
    setEditingButton(button);
    setNewLabel(button.label);
    setIsLabelAlertOpen(true);
  };

  const saveLabel = () => {
    if (editingButton) {
      handleComponentUpdate(editingButton.id, { label: newLabel });
    }
    setIsLabelAlertOpen(false);
    setEditingButton(null);
  };


  return (
    <Card className="bg-secondary/50">
      <CardHeader>
        <CardTitle className="text-lg">Action Row</CardTitle>
         <CardDescription>Adicione até 5 botões ou 1 menu de seleção por linha.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {components.map((component, index) => (
             <div key={component.id}>
                {component.type === 'button' && (
                    <Card className="p-3 bg-background/50 relative group flex items-center gap-3">
                        <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab opacity-50 hover:opacity-100" />
                        
                        <div className="flex-grow">
                             <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                  <Button 
                                      className={buttonStyleClasses[component.style]}
                                      disabled={component.disabled}
                                  >
                                      {component.emoji && <span className="mr-2">{component.emoji}</span>}
                                      {component.label}
                                  </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                  <DropdownMenuItem onSelect={() => openLabelEditor(component)}>
                                      <Edit className="mr-2 h-4 w-4" />
                                      Mudar Label
                                  </DropdownMenuItem>
                                   <DropdownMenuItem disabled>
                                      <Smile className="mr-2 h-4 w-4" />
                                      Definir Emoji
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onSelect={() => handleComponentUpdate(component.id, { disabled: !component.disabled })}>
                                      <Lock className="mr-2 h-4 w-4" />
                                      {component.disabled ? 'Habilitar' : 'Desabilitar'}
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                   <DropdownMenuSub>
                                    <DropdownMenuSubTrigger>
                                        <Palette className="mr-2 h-4 w-4" />
                                        <span>Estilo</span>
                                    </DropdownMenuSubTrigger>
                                    <DropdownMenuPortal>
                                        <DropdownMenuSubContent>
                                            <DropdownMenuItem onSelect={() => handleComponentUpdate(component.id, { style: 'primary' })}>
                                                <Palette className="mr-2 h-4 w-4 text-indigo-500" /> Primary
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onSelect={() => handleComponentUpdate(component.id, { style: 'secondary' })}>
                                                <Palette className="mr-2 h-4 w-4 text-gray-500" /> Secondary
                                            </DropdownMenuItem>
                                             <DropdownMenuItem onSelect={() => handleComponentUpdate(component.id, { style: 'success' })}>
                                                <Palette className="mr-2 h-4 w-4 text-green-500" /> Success
                                            </DropdownMenuItem>
                                             <DropdownMenuItem onSelect={() => handleComponentUpdate(component.id, { style: 'danger' })}>
                                                <Palette className="mr-2 h-4 w-4 text-red-500" /> Danger
                                            </DropdownMenuItem>
                                        </DropdownMenuSubContent>
                                    </DropdownMenuPortal>
                                  </DropdownMenuSub>
                              </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => removeComponent(component.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                    </Card>
                )}
                {component.type === 'selectMenu' && (
                     <SelectMenuBuilder 
                        component={component}
                        onUpdate={(updates) => handleComponentUpdate(component.id, updates)}
                        onRemove={() => removeComponent(component.id)}
                    />
                )}
             </div>
          ))}
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
             <Button variant="outline" size="sm" disabled={components.length >= 5 || components.some(c => c.type === 'selectMenu')}>
              <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Componente
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
             <DropdownMenuItem onSelect={() => addComponent('button')} disabled={components.length >= 5}>
                <MessageSquare className="mr-2 h-4 w-4" />
                Botão
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => addComponent('selectMenu')} disabled={components.length > 0}>
                <MenuSquare className="mr-2 h-4 w-4" />
                Menu de Seleção
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
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


// --- Select Menu Builder ---

interface SelectMenuBuilderProps {
    component: ActionSelectMenu;
    onUpdate: (updates: Partial<ActionSelectMenu>) => void;
    onRemove: () => void;
}

function SelectMenuBuilder({ component, onUpdate, onRemove }: SelectMenuBuilderProps) {
    const [isGlobalSettingsOpen, setGlobalSettingsOpen] = useState(false);
    const [isOptionEditorOpen, setOptionEditorOpen] = useState(false);
    const [editingOption, setEditingOption] = useState<SelectMenuOption | null>(null);

    const openOptionEditor = (option: SelectMenuOption | null) => {
        setEditingOption(option ? {...option} : { id: `option-${Date.now()}`, label: '', value: '', default: false });
        setOptionEditorOpen(true);
    };

    const handleSaveOption = (optionToSave: SelectMenuOption) => {
        const existingOption = component.options.find(opt => opt.id === optionToSave.id);
        let newOptions: SelectMenuOption[];

        if (existingOption) {
            newOptions = component.options.map(opt => opt.id === optionToSave.id ? optionToSave : opt);
        } else {
            newOptions = [...component.options, optionToSave];
        }

        if (optionToSave.default) {
            newOptions.forEach(opt => {
                if (opt.id !== optionToSave.id) opt.default = false;
            });
        }

        onUpdate({ options: newOptions });
        setOptionEditorOpen(false);
        setEditingOption(null);
    };

    const handleRemoveOption = (id: string) => {
        onUpdate({ options: component.options.filter(opt => opt.id !== id) });
    };

    return (
        <Card className="bg-background/50 relative group">
            <CardHeader className="flex flex-row items-center justify-between p-3 border-b">
                <div className="flex items-center gap-2">
                    <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                    <h3 className="text-sm font-semibold">Select Menu</h3>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onRemove}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
            </CardHeader>
            <CardContent className="p-4 space-y-2">
                <Button variant="outline" className="w-full justify-between" onClick={() => setGlobalSettingsOpen(true)}>
                    <div className="flex items-center gap-2">
                        <Pencil className="h-4 w-4" />
                        Global settings
                    </div>
                    <span className="bg-muted text-muted-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {component.maxValues || 1}
                    </span>
                </Button>

                {component.options.map(option => (
                     <div key={option.id} className="group/option flex items-center w-full bg-secondary rounded-md pr-2">
                        <Button variant="ghost" className="flex-grow justify-start" onClick={() => openOptionEditor(option)}>
                            {option.label || 'Opção sem nome'}
                            {option.default && <Check className="ml-auto h-4 w-4 text-primary" />}
                        </Button>
                         <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover/option:opacity-100" onClick={() => handleRemoveOption(option.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                     </div>
                ))}
                
                <Button variant="outline" className="w-full" onClick={() => openOptionEditor(null)} disabled={component.options.length >= 25}>
                    <PlusCircle className="mr-2 h-4 w-4" /> New option
                </Button>
            </CardContent>

             <SelectGlobalSettingsDialog
                isOpen={isGlobalSettingsOpen}
                onOpenChange={setGlobalSettingsOpen}
                component={component}
                onUpdate={onUpdate}
            />

            {editingOption && (
                <SelectOptionEditorDialog
                    isOpen={isOptionEditorOpen}
                    onOpenChange={setOptionEditorOpen}
                    option={editingOption}
                    onSave={handleSaveOption}
                />
            )}
        </Card>
    )
}

// --- Dialogs for Select Menu ---

interface SelectGlobalSettingsDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    component: ActionSelectMenu;
    onUpdate: (updates: Partial<ActionSelectMenu>) => void;
}

function SelectGlobalSettingsDialog({ isOpen, onOpenChange, component, onUpdate }: SelectGlobalSettingsDialogProps) {
    const [customId, setCustomId] = useState(component.customId || '');
    const [placeholder, setPlaceholder] = useState(component.placeholder || '');
    const [maxValues, setMaxValues] = useState(component.maxValues || 1);

    const handleSave = () => {
        onUpdate({ customId, placeholder, maxValues });
        onOpenChange(false);
    };
    
    return (
        <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Global Settings</AlertDialogTitle>
                    <AlertDialogDescription>Configure as propriedades principais do seu menu de seleção.</AlertDialogDescription>
                </AlertDialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="custom-id">Custom ID</Label>
                        <Input id="custom-id" value={customId} onChange={e => setCustomId(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="placeholder">Placeholder</Label>
                        <Input id="placeholder" value={placeholder} onChange={e => setPlaceholder(e.target.value)} placeholder="Selecione uma opção"/>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="max-values">Max Values</Label>
                        <Input id="max-values" type="number" min="1" max="25" value={maxValues} onChange={e => setMaxValues(Number(e.target.value))} />
                    </div>
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleSave}>Salvar</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

interface SelectOptionEditorDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    option: SelectMenuOption;
    onSave: (option: SelectMenuOption) => void;
}

function SelectOptionEditorDialog({ isOpen, onOpenChange, option, onSave }: SelectOptionEditorDialogProps) {
    const [currentOption, setCurrentOption] = useState(option);
    
    const handleSave = () => {
        onSave(currentOption);
        onOpenChange(false);
    }

    const updateField = (field: keyof SelectMenuOption, value: any) => {
        setCurrentOption(prev => ({...prev, [field]: value}));
    }

    return (
        <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                 <AlertDialogHeader>
                    <AlertDialogTitle>Edit Option</AlertDialogTitle>
                    <AlertDialogDescription>Defina os detalhes desta opção de seleção.</AlertDialogDescription>
                </AlertDialogHeader>
                <div className="space-y-4 py-4">
                     <div className="space-y-2">
                        <Label htmlFor="opt-label">Label</Label>
                        <Input id="opt-label" value={currentOption.label} onChange={e => updateField('label', e.target.value)} maxLength={100} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="opt-value">Value</Label>
                        <Input id="opt-value" value={currentOption.value} onChange={e => updateField('value', e.target.value)} maxLength={100} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="opt-desc">Description</Label>
                        <Textarea id="opt-desc" value={currentOption.description} onChange={e => updateField('description', e.target.value)} maxLength={100} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="opt-emoji">Emoji</Label>
                        <Input id="opt-emoji" value={currentOption.emoji} onChange={e => updateField('emoji', e.target.value)} maxLength={10} placeholder="Ex: ✨ ou :sparkles:" />
                    </div>
                    <div className="flex items-center space-x-2">
                        <Switch id="opt-default" checked={currentOption.default} onCheckedChange={checked => updateField('default', checked)} />
                        <Label htmlFor="opt-default">Set as default</Label>
                    </div>
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleSave}>Salvar</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

    