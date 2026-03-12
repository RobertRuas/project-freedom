import { useEffect, useState } from 'react';

export type CatalogViewMode = 'grid' | 'list';

/**
 * Controla o modo de exibição de catálogo por página.
 * O valor é salvo em sessionStorage para durar durante a sessão atual.
 */
export function useCatalogViewMode(storageKey: string, defaultMode: CatalogViewMode = 'grid') {
  const [viewMode, setViewMode] = useState<CatalogViewMode>(() => {
    if (typeof window === 'undefined') {
      return defaultMode;
    }

    try {
      const storedValue = window.sessionStorage.getItem(storageKey);
      if (storedValue === 'list' || storedValue === 'grid') {
        return storedValue;
      }
      return defaultMode;
    } catch {
      return defaultMode;
    }
  });

  useEffect(() => {
    try {
      window.sessionStorage.setItem(storageKey, viewMode);
    } catch {
      // Alguns browsers de TV podem restringir sessionStorage.
    }
  }, [storageKey, viewMode]);

  const toggleViewMode = () => {
    setViewMode((current) => (current === 'grid' ? 'list' : 'grid'));
  };

  return {
    viewMode,
    toggleViewMode,
  };
}
