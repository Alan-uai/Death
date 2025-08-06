
'use client';

import { useSettings } from '@/contexts/settings-context';
import { Button } from './ui/button';
import { Loader2 } from 'lucide-react';

export function SaveChangesBar({ guildId }: { guildId: string }) {
  const { isDirty, isSaving, saveChanges, discardChanges } = useSettings();

  if (!isDirty) {
    return null;
  }

  const handleSave = async () => {
    await saveChanges(guildId);
  };
  
  return (
    <div className="fixed inset-x-0 bottom-0 z-50">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 bg-popover p-3 shadow-[0_-2px_4px_rgba(0,0,0,0.1)] rounded-t-lg border-t border-x">
        <p className="text-sm font-medium text-popover-foreground">
          Você tem alterações não salvas.
        </p>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={discardChanges} disabled={isSaving}>
            Descartar
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salvar Mudanças
          </Button>
        </div>
      </div>
    </div>
  );
}
