import { useCallback, useEffect, useState } from 'react';
import { storage } from '@/lib/storage';
import { DEFAULT_BUILTIN_PRESET } from '@/lib/dslParser';
import type { DslPreset } from '@/types';

export function usePresets() {
  const [userPresets, setUserPresets] = useState<DslPreset[]>([]);

  useEffect(() => {
    storage.getPresets().then(setUserPresets);
  }, []);

  const allPresets: DslPreset[] = [DEFAULT_BUILTIN_PRESET, ...userPresets];

  const addPreset = useCallback(
    async (data: { name: string; paramMatchers: string[] }) => {
      const newPreset: DslPreset = { ...data, id: crypto.randomUUID() };
      const updated = [...userPresets, newPreset];
      await storage.setPresets(updated);
      setUserPresets(updated);
    },
    [userPresets],
  );

  const updatePreset = useCallback(
    async (id: string, changes: Partial<Pick<DslPreset, 'name' | 'paramMatchers'>>) => {
      const updated = userPresets.map((p) => (p.id === id ? { ...p, ...changes } : p));
      await storage.setPresets(updated);
      setUserPresets(updated);
    },
    [userPresets],
  );

  const deletePreset = useCallback(
    async (id: string) => {
      const updated = userPresets.filter((p) => p.id !== id);
      await storage.setPresets(updated);
      setUserPresets(updated);
    },
    [userPresets],
  );

  return { presets: allPresets, addPreset, updatePreset, deletePreset };
}
