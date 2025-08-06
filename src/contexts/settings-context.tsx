
'use client';

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { saveChannelConfig, saveCommandConfig, saveGenericConfig } from '@/lib/bot-api';
import { CustomCommand } from '@/lib/types';

type SettingsValue = Record<string, any>;

interface SettingsContextType {
  isDirty: boolean;
  isSaving: boolean;
  updateSetting: (key: string, value: SettingsValue) => void;
  getSetting: <T>(key: string) => T | undefined;
  saveChanges: (guildId: string) => Promise<void>;
  discardChanges: () => void;
  registerPanel: (panelId: string, onSave: (guildId: string, data: any) => Promise<any>) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [initialSettings, setInitialSettings] = useState<Record<string, SettingsValue>>({});
  const [dirtySettings, setDirtySettings] = useState<Record<string, SettingsValue>>({});
  const [panelSavers, setPanelSavers] = useState<Record<string, (guildId: string, data: any) => Promise<any>>>({});
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const isDirty = Object.keys(dirtySettings).length > 0;

  const updateSetting = useCallback((key: string, value: SettingsValue) => {
    if (initialSettings[key] === undefined) {
       setInitialSettings(prev => ({ ...prev, [key]: value }));
    }
    setDirtySettings(prev => ({ ...prev, [key]: value }));
  }, [initialSettings]);

  const getSetting = useCallback(<T>(key: string): T | undefined => {
    return dirtySettings[key] as T || initialSettings[key] as T;
  }, [dirtySettings, initialSettings]);


  const discardChanges = useCallback(() => {
    setDirtySettings({});
  }, []);
  
  const registerPanel = useCallback((panelId: string, onSave: (guildId: string, data: any) => Promise<any>) => {
    setPanelSavers(prev => ({...prev, [panelId]: onSave}));
  }, []);

  const saveChanges = async (guildId: string) => {
    setIsSaving(true);
    const promises = Object.entries(dirtySettings).map(([key, data]) => {
      const saver = panelSavers[key];
      if (saver) {
        return saver(guildId, data);
      }
      return Promise.resolve();
    });

    try {
      await Promise.all(promises);
      toast({
        title: 'Sucesso!',
        description: 'Todas as configurações foram salvas e enviadas para o bot.',
      });
      setInitialSettings(prev => ({ ...prev, ...dirtySettings }));
      setDirtySettings({});
    } catch (error) {
      console.error('Falha ao salvar configurações:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao Salvar',
        description: 'Não foi possível salvar uma ou mais configurações. Verifique o console para detalhes.',
      });
    } finally {
      setIsSaving(false);
    }
  };


  const value = {
    isDirty,
    isSaving,
    updateSetting,
    getSetting,
    saveChanges,
    discardChanges,
    registerPanel,
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
