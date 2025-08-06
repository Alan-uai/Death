
'use client';

import { createContext, useContext, useState, useCallback, ReactNode, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';

type PanelRegistration = {
    onSave: () => Promise<any>;
    isDirty: () => boolean;
};

interface SettingsContextType {
  isSaving: boolean;
  isDirty: boolean;
  getInitialData: <T>(panelId: string) => T | undefined;
  markAsDirty: (panelId: string) => void;
  markAsClean: (panelId: string) => void;
  saveChanges: (guildId: string) => Promise<void>;
  discardChanges: () => void;
  registerPanel: (panelId: string, registration: PanelRegistration) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [initialData, setInitialData] = useState<Record<string, any>>({});
  const [dirtyPanels, setDirtyPanels] = useState<Set<string>>(new Set());
  const [panelRegistrations, setPanelRegistrations] = useState<Record<string, PanelRegistration>>({});
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const isDirty = useMemo(() => {
    return Array.from(dirtyPanels).length > 0;
  }, [dirtyPanels]);


  const getInitialData = useCallback(<T,>(panelId: string): T | undefined => {
    return initialData[panelId] as T | undefined;
  }, [initialData]);

  const markAsDirty = useCallback((panelId: string) => {
    setDirtyPanels(prev => {
        const newSet = new Set(prev);
        newSet.add(panelId);
        return newSet;
    });
  }, []);

  const markAsClean = useCallback((panelId: string) => {
    setDirtyPanels(prev => {
        const newSet = new Set(prev);
        newSet.delete(panelId);
        return newSet;
    });
  }, []);
  
  const registerPanel = useCallback((panelId: string, registration: PanelRegistration) => {
    setPanelRegistrations(prev => ({...prev, [panelId]: registration}));
    if (registration.isDirty()) {
        markAsDirty(panelId);
    }
  }, [markAsDirty]);

  const discardChanges = useCallback(() => {
    window.location.reload();
  }, []);

  const saveChanges = async (guildId: string) => {
    setIsSaving(true);
    
    const panelsToSave = Object.entries(panelRegistrations).filter(([panelId, panel]) => panel.isDirty());

    const promises = panelsToSave.map(([panelId, panel]) => {
      if (panel.onSave) {
        return panel.onSave();
      }
      return Promise.resolve();
    });

    try {
      await Promise.all(promises);
      toast({
        title: 'Sucesso!',
        description: 'Todas as configurações foram salvas e enviadas para o bot.',
      });
       window.location.reload();
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
    isSaving,
    isDirty,
    getInitialData,
    markAsDirty,
    markAsClean,
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
