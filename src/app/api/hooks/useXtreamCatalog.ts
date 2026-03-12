import { useEffect, useMemo, useState } from 'react';
import type { GridContentItem, ListContentItem } from '../../types/content';
import { xtreamClient } from '../services/xtreamClient';
import { mapLiveToGrid, mapLiveToList, mapSeriesToGrid, mapVodToGrid } from '../services/xtreamMapper';
import { readCache, writeCache } from '../../utils/localCache';

interface XtreamCatalogState {
  loading: boolean;
  error: string | null;
  liveGrid: GridContentItem[];
  vodGrid: GridContentItem[];
  seriesGrid: GridContentItem[];
  liveList: ListContentItem[];
  liveCategories: Array<{ id: string; name: string }>;
  vodCategories: Array<{ id: string; name: string }>;
  seriesCategories: Array<{ id: string; name: string }>;
}

const CATALOG_CACHE_KEY = 'project-freedom:catalog-snapshot:v1';
const CATALOG_CACHE_TTL_MS = 1000 * 60 * 15; // 15 minutos

interface CatalogCacheSnapshot {
  liveGrid: GridContentItem[];
  vodGrid: GridContentItem[];
  seriesGrid: GridContentItem[];
  liveList: ListContentItem[];
  liveCategories: Array<{ id: string; name: string }>;
  vodCategories: Array<{ id: string; name: string }>;
  seriesCategories: Array<{ id: string; name: string }>;
}

/**
 * Hook central para carregar os catalogos do Xtream.
 * A resposta ja vem mapeada para os tipos usados na UI.
 */
export function useXtreamCatalog() {
  const cachedSnapshot = readCache<CatalogCacheSnapshot>(CATALOG_CACHE_KEY, CATALOG_CACHE_TTL_MS);

  const [state, setState] = useState<XtreamCatalogState>({
    loading: !cachedSnapshot,
    error: null,
    liveGrid: cachedSnapshot?.liveGrid || [],
    vodGrid: cachedSnapshot?.vodGrid || [],
    seriesGrid: cachedSnapshot?.seriesGrid || [],
    liveList: cachedSnapshot?.liveList || [],
    liveCategories: cachedSnapshot?.liveCategories || [],
    vodCategories: cachedSnapshot?.vodCategories || [],
    seriesCategories: cachedSnapshot?.seriesCategories || []
  });

  useEffect(() => {
    let isActive = true;

    const load = async () => {
      try {
        const [live, vod, series, liveCategories, vodCategories, seriesCategories] = await Promise.allSettled([
          xtreamClient.getLiveStreams(),
          xtreamClient.getVodStreams(),
          xtreamClient.getSeries(),
          xtreamClient.getCategories('live'),
          xtreamClient.getCategories('vod'),
          xtreamClient.getCategories('series')
        ]);

        if (!isActive) return;

        const nextSnapshot: CatalogCacheSnapshot = {
          liveGrid: live.status === 'fulfilled' ? mapLiveToGrid(live.value) : state.liveGrid,
          vodGrid: vod.status === 'fulfilled' ? mapVodToGrid(vod.value) : state.vodGrid,
          seriesGrid: series.status === 'fulfilled' ? mapSeriesToGrid(series.value) : state.seriesGrid,
          liveList: live.status === 'fulfilled' ? mapLiveToList(live.value) : state.liveList,
          liveCategories:
            liveCategories.status === 'fulfilled'
              ? (liveCategories.value || []).map((item) => ({
                  id: String(item.category_id ?? ''),
                  name: item.category_name || 'Sem nome'
                }))
              : state.liveCategories,
          vodCategories:
            vodCategories.status === 'fulfilled'
              ? (vodCategories.value || []).map((item) => ({
                  id: String(item.category_id ?? ''),
                  name: item.category_name || 'Sem nome'
                }))
              : state.vodCategories,
          seriesCategories:
            seriesCategories.status === 'fulfilled'
              ? (seriesCategories.value || []).map((item) => ({
                  id: String(item.category_id ?? ''),
                  name: item.category_name || 'Sem nome'
                }))
              : state.seriesCategories
        };

        const hasAnySuccess =
          live.status === 'fulfilled' ||
          vod.status === 'fulfilled' ||
          series.status === 'fulfilled' ||
          liveCategories.status === 'fulfilled' ||
          vodCategories.status === 'fulfilled' ||
          seriesCategories.status === 'fulfilled';

        writeCache(CATALOG_CACHE_KEY, nextSnapshot);

        setState({
          loading: false,
          error: hasAnySuccess ? null : 'Falha ao carregar Xtream.',
          ...nextSnapshot
        });
      } catch (error) {
        if (!isActive) return;
        setState((prev) => ({
          ...prev,
          loading: false,
          error: prev.liveGrid.length || prev.vodGrid.length || prev.seriesGrid.length
            ? null
            : error instanceof Error
              ? error.message
              : 'Falha ao carregar Xtream.'
        }));
      }
    };

    void load();

    return () => {
      isActive = false;
    };
  }, []);

  return useMemo(() => state, [state]);
}
