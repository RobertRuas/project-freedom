/**
 * Tipos principais retornados pelo Xtream.
 * Usamos apenas os campos que a aplicacao realmente consome.
 */
export interface XtreamSummary {
  user_info?: Record<string, unknown>;
  server_info?: Record<string, unknown>;
}

export interface XtreamLiveStream {
  stream_id: number | string;
  name: string;
  category_id?: string | number;
  stream_icon?: string;
}

export interface XtreamVodStream {
  stream_id: number | string;
  name: string;
  category_id?: string | number;
  stream_icon?: string;
  container_extension?: string;
}

export interface XtreamSeriesItem {
  series_id: number | string;
  name: string;
  category_id?: string | number;
  cover?: string;
}

export interface XtreamSeriesInfo {
  info?: Record<string, unknown>;
  episodes?: Record<string, XtreamSeriesEpisode[]>;
}

export interface XtreamSeriesEpisode {
  id?: number | string;
  stream_id?: number | string;
  episode_id?: number | string;
  container_extension?: string;
  info?: { container_extension?: string };
  episode_info?: { container_extension?: string };
}

export interface XtreamCategory {
  category_id: string | number;
  category_name: string;
}

export interface XtreamCatalogResponse<T> {
  ok: boolean;
  data: T;
  meta?: Record<string, unknown>;
}
