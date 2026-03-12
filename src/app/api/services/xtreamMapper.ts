import type { GridContentItem, ListContentItem } from '../../types/content';
import type { XtreamLiveStream, XtreamSeriesItem, XtreamVodStream } from '../types/xtream';
import { xtreamEnv } from './xtreamEnv';

/**
 * Normaliza a URL base usada para reprodução.
 * Mantemos o protocolo original do Xtream (como no projeto de referência).
 */
const normalizePlayBaseUrl = (serverUrl: string) => {
  return String(serverUrl || '').trim().replace(/\/+$/, '');
};

/**
 * Normaliza URL de imagem para carregar diretamente do Xtream.
 * Sem uso de API intermediária.
 */
const normalizeImageUrl = (rawUrl: string | undefined, fallback: string) => {
  const input = String(rawUrl || '').trim();

  if (!input) {
    return fallback;
  }

  try {
    /**
     * Alguns painéis retornam URLs com barras escapadas (`\/`) ou
     * envoltas em aspas. Normalizamos antes de resolver a URL final.
     */
    const sanitizedInput = input
      .replace(/^['"]+|['"]+$/g, '')
      .replace(/\\\//g, '/')
      .replace(/\\/g, '/');
    const base = String(xtreamEnv.serverUrl || '').trim().replace(/\/+$/, '');

    // Resolve para URL absoluta preservando protocolo original.
    let resolved = '';

    if (/^https?:\/\//i.test(sanitizedInput)) {
      resolved = sanitizedInput;
    } else if (sanitizedInput.startsWith('//')) {
      const protocol =
        typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'https:' : 'http:';
      resolved = `${protocol}${sanitizedInput}`;
    } else if (base) {
      resolved = new URL(sanitizedInput, `${base}/`).toString();
    } else {
      resolved = sanitizedInput;
    }

    /**
     * Alguns painéis devolvem `stream_icon` com domínio que responde 404
     * (ex.: ufoprime.com/images). Nesses casos usamos fallback local.
     */
    if (/ufoprime\.com:80\/images\//i.test(resolved)) {
      return fallback;
    }

    return resolved;
  } catch {
    return input || fallback;
  }
};

/**
 * Construtor de URL de reproducao por tipo.
 * Essa URL segue o padrao Xtream: /live, /movie, /series.
 */
const createPlayUrl = (type: 'live' | 'vod' | 'series', id: string, extension?: string) => {
  const baseUrl = normalizePlayBaseUrl(xtreamEnv.serverUrl || '');
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
    imageUrl: normalizeImageUrl(item.stream_icon, '/images/posters/tv.svg'),
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
    imageUrl: normalizeImageUrl(item.stream_icon, '/images/posters/movie.svg'),
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
    imageUrl: normalizeImageUrl(item.cover, '/images/posters/series.svg'),
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
    imageUrl: normalizeImageUrl(item.stream_icon, '/images/thumbs/tv-channel.svg'),
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
