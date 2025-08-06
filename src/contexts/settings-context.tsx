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
  saveChanges: (guildId: string) => Promise<void>;
  discardChanges: () => void;
  registerPanel: (panelId: string, registration: PanelRegistration) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [initialData, setInitialData] = useState<Record<string, any>>({});
  const [panelRegistrations, setPanelRegistrations] = useState<Record<string, PanelRegistration>>({});
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const isDirty = useMemo(() => {
    return Object.values(panelRegistrations).some(panel => panel.isDirty());
  }, [panelRegistrations]);


  const getInitialData = useCallback(<T,>(panelId: string): T | undefined => {
    return initialData[panelId] as T | undefined;
  }, [initialData]);

  const registerPanel = useCallback((panelId: string, registration: PanelRegistration) => {
    setPanelRegistrations(prev => ({...prev, [panelId]: registration}));
  }, []);

  const discardChanges = useCallback(() => {
    // This will trigger a re-render in the panels, which should reset their state
    // to the initial data because their `key` will change or they will re-fetch.
    // A simpler approach for now is just to reload, which is stateless.
    window.location.reload();
  }, []);

  const saveChanges = async (guildId: string) => {
    setIsSaving(true);
    
    const panelsToSave = Object.entries(panelRegistrations).filter(([_, panel]) => panel.isDirty());

    const promises = panelsToSave.map(([_, panel]) => {
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
       // Reload to fetch the new initial state
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
