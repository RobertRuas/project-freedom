/**
 * Campos de query string usados para controlar o player em formato modal.
 * Mantemos os nomes em um único lugar para evitar divergência entre telas.
 */
const PLAYER_QUERY_KEYS = [
  'player',
  'contentId',
  'title',
  'kind',
  'src',
  'streamType',
  'imageUrl',
  'queueKey',
  'queueIndex'
] as const;

export interface PlayerModalQueryPayload {
  contentId: string;
  title?: string;
  kind?: string;
  src?: string;
  streamType?: 'live' | 'vod' | 'series';
  imageUrl?: string;
  queueKey?: string;
  queueIndex?: number;
}

/**
 * Gera a nova query string para abrir o player modal sem trocar de rota.
 * Isso preserva o estado da página atual (filtros, scroll e dados carregados).
 */
export const buildPlayerModalSearch = (currentSearch: string, payload: PlayerModalQueryPayload) => {
  const params = new URLSearchParams(currentSearch);

  params.set('player', '1');
  params.set('contentId', payload.contentId);

  if (payload.title) {
    params.set('title', payload.title);
  } else {
    params.delete('title');
  }

  if (payload.kind) {
    params.set('kind', payload.kind);
  } else {
    params.delete('kind');
  }

  if (payload.src) {
    params.set('src', payload.src);
  } else {
    params.delete('src');
  }

  if (payload.streamType) {
    params.set('streamType', payload.streamType);
  } else {
    params.delete('streamType');
  }

  if (payload.imageUrl) {
    params.set('imageUrl', payload.imageUrl);
  } else {
    params.delete('imageUrl');
  }

  if (payload.queueKey) {
    params.set('queueKey', payload.queueKey);
  } else {
    params.delete('queueKey');
  }

  if (typeof payload.queueIndex === 'number' && Number.isFinite(payload.queueIndex)) {
    params.set('queueIndex', String(Math.max(0, Math.floor(payload.queueIndex))));
  } else {
    params.delete('queueIndex');
  }

  return params.toString();
};

/**
 * Remove apenas os parâmetros ligados ao modal do player.
 * Demais parâmetros da página (ex.: termo de busca) são preservados.
 */
export const clearPlayerModalSearch = (currentSearch: string) => {
  const params = new URLSearchParams(currentSearch);

  PLAYER_QUERY_KEYS.forEach((key) => {
    params.delete(key);
  });

  return params.toString();
};
