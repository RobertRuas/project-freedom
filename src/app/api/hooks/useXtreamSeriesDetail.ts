import { useEffect, useState } from 'react';
import { xtreamClient } from '../services/xtreamClient';

interface XtreamSeriesDetailState {
  loading: boolean;
  error: string | null;
  detail: null | {
    info: Record<string, unknown>;
    seasons: Array<{ season: number | string; episodes: Array<Record<string, unknown>> }>;
  };
}

/**
 * Hook para buscar detalhes de serie via Xtream.
 */
export function useXtreamSeriesDetail(seriesId?: string) {
  const [state, setState] = useState<XtreamSeriesDetailState>({
    loading: true,
    error: null,
    detail: null
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

        setState({
          loading: false,
          error: null,
          detail: {
            info: (data?.info || {}) as Record<string, unknown>,
            seasons
          }
        });
      } catch (error) {
        if (!isActive) return;
        setState({
          loading: false,
          error: error instanceof Error ? error.message : 'Falha ao carregar detalhes.',
          detail: null
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
