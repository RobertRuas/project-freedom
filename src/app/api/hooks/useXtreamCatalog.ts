import { useEffect, useMemo, useState } from 'react';
import type { GridContentItem, ListContentItem } from '../../types/content';
import { xtreamClient } from '../services/xtreamClient';
import { mapLiveToGrid, mapLiveToList, mapSeriesToGrid, mapVodToGrid } from '../services/xtreamMapper';

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

/**
 * Hook central para carregar os catalogos do Xtream.
 * A resposta ja vem mapeada para os tipos usados na UI.
 */
export function useXtreamCatalog() {
  const [state, setState] = useState<XtreamCatalogState>({
    loading: true,
    error: null,
    liveGrid: [],
    vodGrid: [],
    seriesGrid: [],
    liveList: [],
    liveCategories: [],
    vodCategories: [],
    seriesCategories: []
  });

  useEffect(() => {
    let isActive = true;

    const load = async () => {
      try {
        const [live, vod, series, liveCategories, vodCategories, seriesCategories] = await Promise.all([
          xtreamClient.getLiveStreams(),
          xtreamClient.getVodStreams(),
          xtreamClient.getSeries(),
          xtreamClient.getCategories('live'),
          xtreamClient.getCategories('vod'),
          xtreamClient.getCategories('series')
        ]);

        if (!isActive) return;

        setState({
          loading: false,
          error: null,
          liveGrid: mapLiveToGrid(live),
          vodGrid: mapVodToGrid(vod),
          seriesGrid: mapSeriesToGrid(series),
          liveList: mapLiveToList(live),
          liveCategories: (liveCategories || []).map((item) => ({
            id: String(item.category_id ?? ''),
            name: item.category_name || 'Sem nome'
          })),
          vodCategories: (vodCategories || []).map((item) => ({
            id: String(item.category_id ?? ''),
            name: item.category_name || 'Sem nome'
          })),
          seriesCategories: (seriesCategories || []).map((item) => ({
            id: String(item.category_id ?? ''),
            name: item.category_name || 'Sem nome'
          }))
        });
      } catch (error) {
        if (!isActive) return;
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Falha ao carregar Xtream.'
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
