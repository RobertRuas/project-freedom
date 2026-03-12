import { readCache, writeCache } from './localCache';

const PLAYER_QUEUE_STORAGE_KEY = 'project-freedom:player-queue:v1';
const PLAYER_QUEUE_TTL_MS = 1000 * 60 * 60 * 6; // 6 horas

export interface PlayerQueueItem {
  contentId: string;
  title: string;
  kind: string;
  src: string;
  streamType: 'live' | 'vod' | 'series';
  imageUrl?: string;
}

interface PlayerQueueMap {
  [queueKey: string]: PlayerQueueItem[];
}

const readQueueMap = (): PlayerQueueMap =>
  readCache<PlayerQueueMap>(PLAYER_QUEUE_STORAGE_KEY, PLAYER_QUEUE_TTL_MS) || {};

const writeQueueMap = (map: PlayerQueueMap) => {
  writeCache(PLAYER_QUEUE_STORAGE_KEY, map);
};

/**
 * Salva fila de reprodução e retorna chave para consulta posterior.
 */
export const savePlayerQueue = (items: PlayerQueueItem[]) => {
  const queue = (Array.isArray(items) ? items : []).filter((item) => item?.src && item?.contentId);
  if (queue.length === 0) {
    return '';
  }

  const queueKey = `queue-${Date.now()}-${queue.length}`;
  const map = readQueueMap();
  map[queueKey] = queue;
  writeQueueMap(map);
  return queueKey;
};

/**
 * Lê fila de reprodução pela chave.
 */
export const getPlayerQueue = (queueKey?: string | null) => {
  if (!queueKey) {
    return [];
  }

  const map = readQueueMap();
  return map[queueKey] || [];
};
