import type { GridContentItem, ListContentItem } from '../../types/content';
import type { XtreamLiveStream, XtreamSeriesItem, XtreamVodStream } from '../types/xtream';
import { xtreamEnv } from './xtreamEnv';

/**
 * Construtor de URL de reproducao por tipo.
 * Essa URL segue o padrao Xtream: /live, /movie, /series.
 */
const createPlayUrl = (type: 'live' | 'vod' | 'series', id: string, extension?: string) => {
  const baseUrl = String(xtreamEnv.serverUrl || '').replace(/\/+$/, '');
  const ext = extension || 'mp4';

  if (type === 'live') {
    return `${baseUrl}/live/${xtreamEnv.username}/${xtreamEnv.password}/${id}.m3u8`;
  }

  if (type === 'vod') {
    return `${baseUrl}/movie/${xtreamEnv.username}/${xtreamEnv.password}/${id}.${ext}`;
  }

  return `${baseUrl}/series/${xtreamEnv.username}/${xtreamEnv.password}/${id}.${ext}`;
};

/**
 * Mapeia streams ao formato de grade usado na aplicacao.
 */
export const mapLiveToGrid = (items: XtreamLiveStream[]): GridContentItem[] =>
  (items || []).map((item) => ({
    id: String(item.stream_id),
    title: item.name || 'Canal',
    subtitle: 'Ao vivo',
    imageUrl: item.stream_icon || '/images/posters/tv.svg',
    type: 'tv',
    playUrl: createPlayUrl('live', String(item.stream_id)),
    // Mantemos o id da categoria em string para facilitar filtros na UI.
    categoryId: item.category_id != null ? String(item.category_id) : undefined,
    routeHash: String(item.stream_id)
  }));

export const mapVodToGrid = (items: XtreamVodStream[]): GridContentItem[] =>
  (items || []).map((item) => ({
    id: String(item.stream_id),
    title: item.name || 'Filme',
    subtitle: 'Catálogo',
    imageUrl: item.stream_icon || '/images/posters/movie.svg',
    type: 'movie',
    playUrl: createPlayUrl('vod', String(item.stream_id), item.container_extension || 'mp4'),
    // Mantemos o id da categoria em string para facilitar filtros na UI.
    categoryId: item.category_id != null ? String(item.category_id) : undefined,
    routeHash: String(item.stream_id)
  }));

export const mapSeriesToGrid = (items: XtreamSeriesItem[]): GridContentItem[] =>
  (items || []).map((item) => ({
    id: String(item.series_id),
    title: item.name || 'Série',
    subtitle: 'Série',
    imageUrl: item.cover || '/images/posters/series.svg',
    type: 'series',
    // Mantemos o id da categoria em string para facilitar filtros na UI.
    categoryId: item.category_id != null ? String(item.category_id) : undefined,
    routeHash: String(item.series_id)
  }));

/**
 * Mapeia canais ao formato de lista (TV ao Vivo).
 */
export const mapLiveToList = (items: XtreamLiveStream[]): ListContentItem[] =>
  (items || []).map((item) => ({
    id: String(item.stream_id),
    title: item.name || 'Canal',
    description: 'Canal ao vivo',
    channel: item.name || 'Canal',
    time: 'Ao vivo',
    live: true,
    imageUrl: item.stream_icon || '/images/thumbs/tv-channel.svg',
    playUrl: createPlayUrl('live', String(item.stream_id)),
    // Mantemos o id da categoria em string para facilitar filtros na UI.
    categoryId: item.category_id != null ? String(item.category_id) : undefined,
    routeHash: String(item.stream_id)
  }));

/**
 * Expõe a URL de reproducao quando necessario.
 */
export const buildPlayUrl = (type: 'live' | 'vod' | 'series', id: string, extension?: string) =>
  createPlayUrl(type, id, extension);
