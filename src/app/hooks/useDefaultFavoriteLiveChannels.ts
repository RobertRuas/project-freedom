import { useEffect, useMemo, useState } from 'react';
import type { GridContentItem } from '../types/content';
import { DEFAULT_FAVORITE_LIVE_CHANNEL_TITLES } from '../config/defaultLivePreferences';
import { normalizeSearchText } from '../utils/search';

const FAVORITE_LIVE_CHANNEL_IDS_KEY = 'project-freedom:favorite-live-channel-ids:v1';
const FAVORITE_LIVE_CHANNELS_INITIALIZED_KEY = 'project-freedom:favorite-live-channels:initialized:v2';

const readFavoriteIds = () => {
  if (typeof window === 'undefined') return [] as string[];

  try {
    const raw = window.localStorage.getItem(FAVORITE_LIVE_CHANNEL_IDS_KEY);
    if (!raw) return [] as string[];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [] as string[];
    return parsed.map((value) => String(value || '').trim()).filter(Boolean);
  } catch {
    return [] as string[];
  }
};

const writeFavoriteIds = (ids: string[]) => {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(
      FAVORITE_LIVE_CHANNEL_IDS_KEY,
      JSON.stringify(Array.from(new Set(ids)))
    );
  } catch {
    // Ignora falhas de storage.
  }
};

/**
 * Garante favoritos padrão de canais na Home.
 */
export function useDefaultFavoriteLiveChannels(liveGrid: GridContentItem[]) {
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => readFavoriteIds());

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!liveGrid.length) return;

    const wasInitialized = window.localStorage.getItem(FAVORITE_LIVE_CHANNELS_INITIALIZED_KEY) === '1';
    if (wasInitialized) {
      setFavoriteIds(readFavoriteIds());
      return;
    }

    const matchedIds = DEFAULT_FAVORITE_LIVE_CHANNEL_TITLES
      .map((expectedTitle) => {
        const normalizedExpected = normalizeSearchText(expectedTitle);
        const match = liveGrid.find((item) => {
          const normalizedItem = normalizeSearchText(item.title);
          return normalizedItem.includes(normalizedExpected) || normalizedExpected.includes(normalizedItem);
        });
        return match?.id || '';
      })
      .filter(Boolean);

    writeFavoriteIds(matchedIds);
    window.localStorage.setItem(FAVORITE_LIVE_CHANNELS_INITIALIZED_KEY, '1');
    setFavoriteIds(matchedIds);
  }, [liveGrid]);

  const favoriteSet = useMemo(() => new Set(favoriteIds), [favoriteIds]);
  const favoriteLiveGrid = useMemo(() => {
    if (!favoriteIds.length) return [] as GridContentItem[];

    const map = new Map(liveGrid.map((item) => [item.id, item]));
    return favoriteIds
      .map((id) => map.get(id))
      .filter((item): item is GridContentItem => Boolean(item && favoriteSet.has(item.id)));
  }, [liveGrid, favoriteIds, favoriteSet]);

  return {
    favoriteIds,
    favoriteLiveGrid
  };
}
