'use client';

import { useState, useEffect } from 'react';
import type { DiscordChannel, DiscordRole } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { getGuildConfigAction, saveGenericConfigAction, getGuildRolesAction } from '@/app/actions';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, X } from 'lucide-react';
import { Skeleton } from './ui/skeleton';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './ui/command';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';


interface SettingsPanelProps {
  channels: DiscordChannel[];
  guildId: string;
}

export function SettingsPanel({ channels, guildId }: SettingsPanelProps) {
  const [qaChannels, setQaChannels] = useState<string[]>([]);
  const [buildsChannels, setBuildsChannels] = useState<string[]>([]);
  const [bannedRoles, setBannedRoles] = useState<string[]>([]);

  const [allRoles, setAllRoles] = useState<DiscordRole[]>([]);
  
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  const textChannels = channels.filter(c => c.type === 0);

  useEffect(() => {
    const fetchConfigAndRoles = async () => {
      setIsLoading(true);
      try {
        const [config, roles] = await Promise.all([
          getGuildConfigAction(guildId),
          getGuildRolesAction(guildId)
        ]);

        if (config && config.featureSettings) {
          setQaChannels(config.featureSettings.qaChannels || []);
          setBuildsChannels(config.featureSettings.buildsChannels || []);
          setBannedRoles(config.featureSettings.bannedRoles || []);
        } else if (config === null) {
          console.warn('SettingsPanel: No existing config found in Firestore. Using default values.');
        }

        // Filter out @everyone and bot-managed roles
        setAllRoles(roles.filter(role => role.name !== '@everyone' && !role.managed));

      } catch (error) {
        console.error("SettingsPanel: Failed to fetch settings or roles:", error);
         toast({
            variant: "destructive",
            title: "Erro ao Carregar",
            description: "Não foi possível buscar as configurações ou cargos."
        })
      } finally {
        setIsLoading(false);
      }
    };
    fetchConfigAndRoles();
  }, [guildId, toast]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveGenericConfigAction(guildId, { 
        featureSettings: {
          qaChannels,
          buildsChannels,
          bannedRoles,
        }
      });
      toast({
        title: 'Sucesso!',
        description: 'Configurações salvas com sucesso.',
      });
    } catch (error) {
      console.error('Falha ao salvar configurações:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao Salvar',
        description: 'Não foi possível salvar as configurações.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 md:p-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-4 w-2/3 mt-2" />
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-4">
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-10 w-full md:w-[400px]" />
              <Skeleton className="h-10 w-full md:w-[400px]" />
              <Skeleton className="h-10 w-full md:w-[400px]" />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Skeleton className="h-10 w-28" />
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6">
      <Card>
        <CardHeader>
          <CardTitle>Configuração do Bot</CardTitle>
          <CardDescription>
            Configure onde as funcionalidades do bot estão ativas e quem pode (ou não) usá-las.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Configurações de Canal</h3>
             <MultiSelect
              label="Canais de Perguntas e Respostas"
              description="Selecione os canais onde o bot responderá a perguntas. Se nenhum for selecionado, funcionará em todos."
              options={textChannels.map(c => ({ value: c.id, label: `# ${c.name}` }))}
              selectedValues={qaChannels}
              onSelectionChange={setQaChannels}
            />
            <MultiSelect
              label="Canais de Sugestões de Build"
              description="Selecione os canais para sugestões de build. Se nenhum for selecionado, funcionará em todos."
              options={textChannels.map(c => ({ value: c.id, label: `# ${c.name}` }))}
              selectedValues={buildsChannels}
              onSelectionChange={setBuildsChannels}
            />
          </div>

          <div className="space-y-4">
             <h3 className="text-lg font-medium">Permissões de Uso</h3>
             <MultiSelect
              label="Cargos Bloqueados"
              description="Selecione os cargos que não poderão usar os comandos do bot."
              options={allRoles.map(r => ({ value: r.id, label: r.name }))}
              selectedValues={bannedRoles}
              onSelectionChange={setBannedRoles}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
            <Button onClick={handleSave} disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar Alterações
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

// --- MultiSelect Component ---

interface MultiSelectProps {
  label: string;
  description: string;
  options: { value: string; label: string }[];
  selectedValues: string[];
  onSelectionChange: (selected: string[]) => void;
}

function MultiSelect({ label, description, options, selectedValues, onSelectionChange }: MultiSelectProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = (value: string) => {
    onSelectionChange([...selectedValues, value]);
  };

  const handleDeselect = (value: string) => {
    onSelectionChange(selectedValues.filter(v => v !== value));
  };
  
  const selectedLabels = selectedValues.map(val => options.find(opt => opt.value === val)?.label).filter(Boolean);

  return (
     <div className="space-y-2">
        <Label>{label}</Label>
        <p className="text-sm text-muted-foreground">{description}</p>
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" aria-expanded={open} className="w-full md:w-[400px] justify-between h-auto min-h-10">
                    <div className="flex gap-1 flex-wrap">
                        {selectedLabels.length > 0 ? selectedLabels.map(label => (
                             <Badge
                                variant="secondary"
                                key={label}
                                className="mr-1"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    const valueToDeselect = options.find(opt => opt.label === label)?.value;
                                    if(valueToDeselect) handleDeselect(valueToDeselect);
                                }}
                            >
                                {label}
                                <X className="ml-1 h-3 w-3" />
                            </Badge>
                        )) : "Selecione..."}
                    </div>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0">
                <Command>
                    <CommandInput placeholder="Procurar..." />
                    <CommandList>
                        <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
                        <CommandGroup>
                             {options.map(option => {
                                const isSelected = selectedValues.includes(option.value);
                                return (
                                    <CommandItem
                                        key={option.value}
                                        onSelect={() => {
                                            if(isSelected) {
                                                handleDeselect(option.value);
                                            } else {
                                                handleSelect(option.value);
                                            }
                                        }}
                                        className={cn("cursor-pointer", isSelected && "font-bold bg-secondary")}
                                    >
                                       {option.label}
                                    </CommandItem>
                                )
                            })}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
     </div>
  )
}
