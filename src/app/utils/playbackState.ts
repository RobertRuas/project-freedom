import { readCache, writeCache } from './localCache';

const PROGRESS_STORAGE_KEY = 'project-freedom:playback-progress:v1';
const PROGRESS_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 dias
export const PLAYBACK_PROGRESS_EVENT = 'project-freedom:playback-progress-updated';

export type PlaybackType = 'live' | 'vod' | 'series';

export interface PlaybackProgressRow {
  key: string;
  type: PlaybackType;
  contentId: string;
  title: string;
  imageUrl?: string;
  playUrl?: string;
  routeHash?: string;
  durationSeconds: number;
  positionSeconds: number;
  progressPercent: number;
  updatedAt: string;
}

interface SaveProgressPayload {
  type: PlaybackType;
  contentId: string;
  title: string;
  imageUrl?: string;
  playUrl?: string;
  routeHash?: string;
  durationSeconds: number;
  positionSeconds: number;
}

const buildProgressKey = (type: PlaybackType, contentId: string) => `${type}:${contentId}`;

const readProgressMap = () =>
  readCache<Record<string, PlaybackProgressRow>>(PROGRESS_STORAGE_KEY, PROGRESS_TTL_MS) || {};

const writeProgressMap = (map: Record<string, PlaybackProgressRow>) => {
  writeCache(PROGRESS_STORAGE_KEY, map);
};

/**
 * Lista itens de "continuar assistindo" ordenados do mais recente para o mais antigo.
 */
export const listContinueWatching = () => {
  const rows = Object.values(readProgressMap());
  return rows.sort((a, b) => String(b.updatedAt || '').localeCompare(String(a.updatedAt || '')));
};

/**
 * Recupera progresso específico de um conteúdo.
 */
export const getProgressByContent = (type: PlaybackType, contentId: string) => {
  const key = buildProgressKey(type, contentId);
  return readProgressMap()[key] || null;
};

/**
 * Salva progresso de reprodução com deduplicação básica.
 */
export const savePlaybackProgress = (payload: SaveProgressPayload) => {
  const type = payload.type;
  const contentId = String(payload.contentId || '').trim();
  if (!contentId) {
    return null;
  }

  const duration = Math.max(0, Number(payload.durationSeconds) || 0);
  const position = Math.max(0, Number(payload.positionSeconds) || 0);

  if (duration <= 0 || position <= 0) {
    return null;
  }

  const progressPercent = Math.min(100, Math.round((position / duration) * 100));
  const key = buildProgressKey(type, contentId);
  const map = readProgressMap();
  const previous = map[key];

  const nextRow: PlaybackProgressRow = {
    key,
    type,
    contentId,
    title: String(payload.title || '').trim(),
    imageUrl: String(payload.imageUrl || '').trim() || undefined,
    playUrl: String(payload.playUrl || '').trim() || undefined,
    routeHash: String(payload.routeHash || '').trim() || undefined,
    durationSeconds: duration,
    positionSeconds: position,
    progressPercent,
    updatedAt: new Date().toISOString()
  };

  if (
    previous &&
    previous.durationSeconds === nextRow.durationSeconds &&
    previous.positionSeconds === nextRow.positionSeconds &&
    previous.progressPercent === nextRow.progressPercent &&
    previous.title === nextRow.title &&
    previous.imageUrl === nextRow.imageUrl &&
    previous.playUrl === nextRow.playUrl &&
    previous.routeHash === nextRow.routeHash
  ) {
    return previous;
  }

  map[key] = nextRow;
  writeProgressMap(map);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(PLAYBACK_PROGRESS_EVENT));
  }
  return nextRow;
};
