import { useCallback, useEffect, useMemo, useState } from 'react';
import { DEFAULT_VISIBLE_LIVE_CATEGORY_IDS } from '../config/defaultLivePreferences';

const HIDDEN_LIVE_CATEGORIES_STORAGE_KEY = 'project-freedom:hidden-live-categories:v1';
const HIDDEN_LIVE_CATEGORIES_INITIALIZED_KEY = 'project-freedom:hidden-live-categories:initialized:v2';

const readHiddenCategories = () => {
  if (typeof window === 'undefined') {
    return [] as string[];
  }

  try {
    const raw = window.localStorage.getItem(HIDDEN_LIVE_CATEGORIES_STORAGE_KEY);
    if (!raw) {
      return [] as string[];
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [] as string[];
    }

    return parsed
      .map((value) => String(value || '').trim())
      .filter(Boolean);
  } catch {
    return [] as string[];
  }
};

const writeHiddenCategories = (ids: string[]) => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(
      HIDDEN_LIVE_CATEGORIES_STORAGE_KEY,
      JSON.stringify(Array.from(new Set(ids)))
    );
    window.dispatchEvent(new CustomEvent('project-freedom:hidden-live-categories-updated'));
  } catch {
    // Ignora falhas de storage.
  }
};

/**
 * Controla categorias de canais ocultas.
 * A preferência é persistida no navegador para reaproveitar entre sessões.
 */
export function useHiddenLiveCategories() {
  const [hiddenCategoryIds, setHiddenCategoryIds] = useState<string[]>(() => readHiddenCategories());

  useEffect(() => {
    const refresh = () => {
      setHiddenCategoryIds(readHiddenCategories());
    };

    window.addEventListener('project-freedom:hidden-live-categories-updated', refresh);
    window.addEventListener('storage', refresh);

    return () => {
      window.removeEventListener('project-freedom:hidden-live-categories-updated', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  const hideCategory = useCallback((categoryId: string) => {
    const normalizedId = String(categoryId || '').trim();
    if (!normalizedId) return;

    const next = Array.from(new Set([...readHiddenCategories(), normalizedId]));
    writeHiddenCategories(next);
    setHiddenCategoryIds(next);
  }, []);

  const showCategory = useCallback((categoryId: string) => {
    const normalizedId = String(categoryId || '').trim();
    const next = readHiddenCategories().filter((id) => id !== normalizedId);
    writeHiddenCategories(next);
    setHiddenCategoryIds(next);
  }, []);

  const toggleCategoryVisibility = useCallback((categoryId: string) => {
    const normalizedId = String(categoryId || '').trim();
    if (!normalizedId) return;

    const current = readHiddenCategories();
    if (current.includes(normalizedId)) {
      const next = current.filter((id) => id !== normalizedId);
      writeHiddenCategories(next);
      setHiddenCategoryIds(next);
      return;
    }

    const next = Array.from(new Set([...current, normalizedId]));
    writeHiddenCategories(next);
    setHiddenCategoryIds(next);
  }, []);

  const hiddenSet = useMemo(() => new Set(hiddenCategoryIds), [hiddenCategoryIds]);

  const initializeDefaults = useCallback((allCategoryIds: string[]) => {
    if (typeof window === 'undefined') {
      return;
    }

    const wasInitialized = window.localStorage.getItem(HIDDEN_LIVE_CATEGORIES_INITIALIZED_KEY) === '1';
    if (wasInitialized) {
      return;
    }

    const visibleSet = new Set(DEFAULT_VISIBLE_LIVE_CATEGORY_IDS.map((value) => String(value)));
    const hiddenDefaults = allCategoryIds
      .map((value) => String(value || '').trim())
      .filter((value) => value && !visibleSet.has(value));

    writeHiddenCategories(hiddenDefaults);
    setHiddenCategoryIds(hiddenDefaults);
    window.localStorage.setItem(HIDDEN_LIVE_CATEGORIES_INITIALIZED_KEY, '1');
  }, []);

  return {
    hiddenCategoryIds,
    hiddenSet,
    hideCategory,
    showCategory,
    toggleCategoryVisibility,
    initializeDefaults
  };
}
