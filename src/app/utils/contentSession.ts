import { createSessionHash } from './hash';

/**
 * Chave usada para armazenar o mapa de conteúdos no localStorage.
 * Mantemos localStorage para sobreviver a reloads na Vercel.
 */
const STORAGE_KEY = 'content-session-map';
const MAX_AGE_MS = 6 * 60 * 60 * 1000; // 6 horas

export interface ContentSessionPayload {
  title: string;
  kind: string;
  src?: string;
  /**
   * Tipo do conteúdo para regras de progresso e retomada.
   */
  streamType?: 'live' | 'vod' | 'series';
  /**
   * Capa/thumbnail usada na seção "continuar assistindo".
   */
  imageUrl?: string;
  /**
   * Hash de rota para permitir retorno ao contexto correto.
   */
  routeHash?: string;
  /**
   * ID opcional do conteúdo original (ex.: stream_id).
   */
  contentId?: string;
  createdAt: number;
}

/**
 * Carrega o mapa salvo no localStorage e remove entradas expiradas.
 */
const loadMap = () => {
  if (typeof window === 'undefined') {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {};
    }
    const map = JSON.parse(raw) as Record<string, ContentSessionPayload>;
    const now = Date.now();
    const entries = Object.entries(map);

    const next: Record<string, ContentSessionPayload> = {};
    entries.forEach(([key, value]) => {
      if (now - value.createdAt <= MAX_AGE_MS) {
        next[key] = value;
      }
    });

    if (entries.length !== Object.keys(next).length) {
      saveMap(next);
    }

    return next;
  } catch {
    return {};
  }
};

/**
 * Salva o mapa no localStorage.
 */
const saveMap = (map: Record<string, ContentSessionPayload>) => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // Ignora falhas de armazenamento.
  }
};

/**
 * Registra um conteúdo na sessão e devolve o id curto para uso na URL.
 */
export const registerContentSession = (payload: Omit<ContentSessionPayload, 'createdAt'>) => {
  const map = loadMap();
  const id = createSessionHash();

  map[id] = {
    ...payload,
    createdAt: Date.now()
  };

  // Mantém o mapa enxuto.
  const entries = Object.entries(map);
  if (entries.length > 200) {
    entries
      .sort(([, a], [, b]) => a.createdAt - b.createdAt)
      .slice(0, entries.length - 200)
      .forEach(([key]) => {
        delete map[key];
      });
  }

  saveMap(map);
  return id;
};

/**
 * Recupera um conteúdo registrado previamente na sessão.
 */
export const getContentSession = (id?: string | null) => {
  if (!id) {
    return null;
  }
  const map = loadMap();
  return map[id] || null;
};
