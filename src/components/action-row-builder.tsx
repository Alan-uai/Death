
'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Input } from './ui/input';
import { PlusCircle, Trash2, GripVertical, Settings, Smile, Edit, Lock, Palette, MenuSquare, Check, Pencil, MessageSquare, Bot } from 'lucide-react';
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
import { MessageEditorPanel } from './message-editor-panel';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './ui/select';

// --- Type Definitions ---

type ActionType = 'REPLY' | 'ASSIGN_ROLE' | 'SEND_DM';

type BotAction = {
    name: string;
    type: ActionType;
    parameters: {
        // For REPLY
        message?: any; 
        // For ASSIGN_ROLE
        roleId?: string;
        // For SEND_DM
        dmMessage?: any;
    }
}

type ActionButton = {
  type: 'button';
  id: string;
  label: string;
  style: 'primary' | 'secondary' | 'success' | 'danger' | 'link';
  disabled: boolean;
  emoji?: string;
  url?: string;
  action?: BotAction;
  customId?: string;
};

type SelectMenuOption = {
    id: string;
    label:string;
    value: string;
    description?: string;
    emoji?: string;
    default: boolean;
    action?: BotAction;
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
    commandName?: string;
}


const buttonStyleClasses: Record<ActionButton['style'], string> = {
    primary: 'bg-indigo-500 hover:bg-indigo-600 text-white',
    secondary: 'bg-gray-500 hover:bg-gray-600 text-white',
    success: 'bg-green-500 hover:bg-green-600 text-white',
    danger: 'bg-red-500 hover:bg-red-600 text-white',
    link: 'bg-transparent text-blue-400 hover:underline p-0',
};

export function ActionRowBuilder({ initialComponents = [], onUpdate, commandName }: ActionRowBuilderProps) {
  const [components, setComponents] = useState<ActionRowComponent[]>(initialComponents);
  const [editingComponent, setEditingComponent] = useState<ActionButton | SelectMenuOption | null>(null);
  
  const [isLabelAlertOpen, setIsLabelAlertOpen] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [isActionEditorOpen, setIsActionEditorOpen] = useState(false);

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
    setEditingComponent(button);
    setNewLabel(button.label);
    setIsLabelAlertOpen(true);
  };

  const saveLabel = () => {
    if (editingComponent && 'label' in editingComponent) {
      handleComponentUpdate(editingComponent.id, { label: newLabel });
    }
    setIsLabelAlertOpen(false);
    setEditingComponent(null);
  };
  
  const openActionEditor = (component: ActionButton | SelectMenuOption) => {
      setEditingComponent(component);
      setIsActionEditorOpen(true);
  }

  const saveAction = (actionData: BotAction) => {
      if (!editingComponent) return;
      
      if ('style' in editingComponent) { // It's an ActionButton
          handleComponentUpdate(editingComponent.id, { action: actionData });
      } else { // It's a SelectMenuOption
         const updatedComponents = components.map(c => {
             if (c.type === 'selectMenu') {
                 const newOptions = c.options.map(opt => 
                    opt.id === editingComponent.id ? { ...opt, action: actionData } : opt
                 );
                 return { ...c, options: newOptions };
             }
             return c;
         });
         handleUpdate(updatedComponents);
      }
      
      setIsActionEditorOpen(false);
      setEditingComponent(null);
  }


  return (
    <Card className="bg-secondary/50">
      <CardHeader>
        <CardTitle className="text-lg">Action Row</CardTitle>
         <CardDescription>Adicione até 5 botões ou 1 menu de seleção por linha.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {components.map((component) => (
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
                                      {component.action && <Bot className="ml-2 h-3 w-3 text-white/70" />}
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
                                   <DropdownMenuItem onSelect={() => openActionEditor(component)}>
                                        <Bot className="mr-2 h-4 w-4" />
                                        Definir Ação
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
                        onEditAction={openActionEditor}
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
        
        {/* --- DIALOGS --- */}
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
                <AlertDialogCancel onClick={() => setEditingComponent(null)}>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={saveLabel}>Salvar</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

        <ActionEditorDialog
            isOpen={isActionEditorOpen}
            onOpenChange={setIsActionEditorOpen}
            initialAction={editingComponent?.action}
            onSave={saveAction}
            onClose={() => setEditingComponent(null)}
        />
      </CardContent>
    </Card>
  );
}

// --- Action Editor Dialog ---
interface ActionEditorDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    initialAction?: BotAction;
    onSave: (action: BotAction) => void;
    onClose: () => void;
}

function ActionEditorDialog({ isOpen, onOpenChange, initialAction, onSave, onClose }: ActionEditorDialogProps) {
    const [action, setAction] = useState<Partial<BotAction>>(initialAction || { type: 'REPLY', parameters: {} });

    const handleSave = () => {
        // Basic validation
        if (!action.name || !action.type) {
            alert("Action Name and Type are required.");
            return;
        }
        onSave(action as BotAction);
    };
    
    const handleOpenChange = (open: boolean) => {
        if (!open) {
            onClose();
        }
        onOpenChange(open);
    }

    return (
         <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Editor de Ação</DialogTitle>
                    <DialogDescription>
                        Configure o que o bot deve fazer quando este componente for usado.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex-grow overflow-y-auto pr-6 -mr-6 space-y-4 py-4">
                    <div className='grid grid-cols-2 gap-4'>
                         <div className="space-y-2">
                            <Label htmlFor="action-name">Nome da Ação (ID)</Label>
                            <Input
                                id="action-name"
                                placeholder="ex: dar_cargo_vip"
                                value={action.name || ''}
                                onChange={(e) => setAction(a => ({ ...a, name: e.target.value.replace(/\s+/g, '_') }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="action-type">Tipo de Ação</Label>
                            <Select
                                value={action.type}
                                onValueChange={(type: ActionType) => setAction(a => ({ ...a, type, parameters: {} }))}
                            >
                                <SelectTrigger id="action-type">
                                    <SelectValue placeholder="Selecione um tipo de ação" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="REPLY">Responder com Mensagem</SelectItem>
                                    <SelectItem value="ASSIGN_ROLE">Atribuir Cargo</SelectItem>
                                    <SelectItem value="SEND_DM">Enviar Mensagem Direta (DM)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* --- Parameter Editors --- */}
                    {action.type === 'REPLY' && (
                        <div>
                             <Label className="text-base">Resposta do Bot</Label>
                             <MessageEditorPanel 
                                guildId="DUMMY_GUILD_ID"
                                initialData={action.parameters?.message}
                                onSave={(messageData) => setAction(a => ({...a, parameters: { ...a.parameters, message: messageData } }))}
                            />
                        </div>
                    )}
                    {action.type === 'ASSIGN_ROLE' && (
                         <div className="space-y-2 rounded-lg border p-4">
                            <Label htmlFor="role-id">ID do Cargo</Label>
                            <Input
                                id="role-id"
                                placeholder="Cole o ID do cargo aqui"
                                value={action.parameters?.roleId || ''}
                                onChange={(e) => setAction(a => ({...a, parameters: { ...a.parameters, roleId: e.target.value }}))}
                             />
                             <p className="text-xs text-muted-foreground">Você pode obter o ID de um cargo ativando o Modo de Desenvolvedor no Discord.</p>
                        </div>
                    )}
                     {action.type === 'SEND_DM' && (
                        <div>
                             <Label className="text-base">Mensagem a ser enviada na DM</Label>
                             <MessageEditorPanel 
                                guildId="DUMMY_GUILD_ID"
                                initialData={action.parameters?.dmMessage}
                                onSave={(messageData) => setAction(a => ({...a, parameters: { ...a.parameters, dmMessage: messageData } }))}
                            />
                        </div>
                    )}
                </div>
                 <DialogFooter>
                    <Button variant="outline" onClick={() => handleOpenChange(false)}>Cancelar</Button>
                    <Button onClick={handleSave}>Salvar Ação</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )

}


// --- Select Menu Builder ---

interface SelectMenuBuilderProps {
    component: ActionSelectMenu;
    onUpdate: (updates: Partial<ActionSelectMenu>) => void;
    onRemove: () => void;
    onEditAction: (option: SelectMenuOption) => void;
}

function SelectMenuBuilder({ component, onUpdate, onRemove, onEditAction }: SelectMenuBuilderProps) {
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
            // Preserve the action when updating other fields
            optionToSave.action = existingOption.action;
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
                            {option.action && <Bot className="ml-auto mr-2 h-3 w-3 text-white/70" />}
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
                    onEditAction={onEditAction}
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
    onEditAction: (option: SelectMenuOption) => void;
}

function SelectOptionEditorDialog({ isOpen, onOpenChange, option, onSave, onEditAction }: SelectOptionEditorDialogProps) {
    const [currentOption, setCurrentOption] = useState(option);
    
    const handleSave = () => {
        onSave(currentOption);
        onOpenChange(false);
    }

    const updateField = (field: keyof SelectMenuOption, value: any) => {
        setCurrentOption(prev => ({...prev, [field]: value}));
    }

    const handleEditAction = () => {
        onEditAction(currentOption);
        onOpenChange(false);
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
                    <Button variant="outline" className="w-full" onClick={handleEditAction}>
                        <Bot className="mr-2 h-4 w-4" /> Definir Ação de Resposta
                    </Button>
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleSave}>Salvar</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
