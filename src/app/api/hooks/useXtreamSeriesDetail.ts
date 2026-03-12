import { useEffect, useState } from 'react';
import { xtreamClient } from '../services/xtreamClient';
import { readCache, writeCache } from '../../utils/localCache';

interface XtreamSeriesDetailState {
  loading: boolean;
  error: string | null;
  detail: null | {
    info: Record<string, unknown>;
    seasons: Array<{ season: number | string; episodes: Array<Record<string, unknown>> }>;
  };
}

const SERIES_DETAIL_CACHE_TTL_MS = 1000 * 60 * 30; // 30 minutos

/**
 * Hook para buscar detalhes de serie via Xtream.
 */
export function useXtreamSeriesDetail(seriesId?: string) {
  const cacheKey = seriesId ? `project-freedom:series-detail:${seriesId}` : '';
  const cachedDetail = seriesId
    ? readCache<NonNullable<XtreamSeriesDetailState['detail']>>(cacheKey, SERIES_DETAIL_CACHE_TTL_MS)
    : null;

  const [state, setState] = useState<XtreamSeriesDetailState>({
    loading: Boolean(seriesId && !cachedDetail),
    error: null,
    detail: cachedDetail || null
  });

  useEffect(() => {
    if (!seriesId) {
      setState({ loading: false, error: 'Serie invalida.', detail: null });
      return;
    }

    let isActive = true;

    const load = async () => {
      try {
        const data = await xtreamClient.getSeriesInfo(seriesId);
        if (!isActive) return;

        const episodesMap = typeof data?.episodes === 'object' && data?.episodes ? data.episodes : {};
        const seasons = Object.entries(episodesMap).map(([season, episodes]) => ({
          season: Number.parseInt(season, 10) || season,
          episodes: Array.isArray(episodes) ? episodes : []
        }));

        const detail = {
          info: (data?.info || {}) as Record<string, unknown>,
          seasons
        };

        writeCache(cacheKey, detail);

        setState({
          loading: false,
          error: null,
          detail
        });
      } catch (error) {
        if (!isActive) return;
        setState({
          loading: false,
          error: cachedDetail ? null : error instanceof Error ? error.message : 'Falha ao carregar detalhes.',
          detail: cachedDetail || null
        });
      }
    };

    void load();

    return () => {
      isActive = false;
    };
  }, [seriesId]);

  return state;
}
