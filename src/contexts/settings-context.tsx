'use client';

import { createContext, useContext, useState, useCallback, ReactNode, useMemo, useRef, useEffect } from 'react';
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
  const panelRegistrations = useRef<Record<string, PanelRegistration>>({});
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  
  // We need a way to trigger re-renders when isDirty changes.
  // A simple counter state is a good way to do this without complex dependencies.
  const [dirtyCheck, setDirtyCheck] = useState(0);

  const isDirty = useMemo(() => {
    return Object.values(panelRegistrations.current).some(panel => panel.isDirty());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dirtyCheck]);

  const getInitialData = useCallback(<T,>(panelId: string): T | undefined => {
    return initialData[panelId] as T | undefined;
  }, [initialData]);

  const registerPanel = useCallback((panelId: string, registration: PanelRegistration) => {
    panelRegistrations.current[panelId] = registration;
    // Force a check on the dirty state when a panel registers or its registration changes
    setDirtyCheck(c => c + 1);
  }, []);

  const discardChanges = useCallback(() => {
    window.location.reload();
  }, []);

  const saveChanges = async (guildId: string) => {
    setIsSaving(true);
    let success = false;

    const panelsToSave = Object.entries(panelRegistrations.current).filter(([_, panel]) => panel.isDirty());

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
      success = true;
    } catch (error) {
      console.error('Falha ao salvar configurações:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao Salvar',
        description: 'Não foi possível salvar uma ou mais configurações. Verifique o console para detalhes.',
      });
      success = false;
    } finally {
      setIsSaving(false);
      if (success) {
        window.location.reload();
      }
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
