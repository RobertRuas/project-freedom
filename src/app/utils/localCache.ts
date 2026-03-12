/**
 * Utilitários centralizados de cache local (localStorage).
 * O objetivo é manter dados e configurações em cache no navegador,
 * sem dependência de banco de dados.
 */

interface CacheEnvelope<T> {
  savedAt: number;
  data: T;
}

/**
 * Lê um valor em cache e valida TTL.
 * Retorna null quando inexistente, inválido ou expirado.
 */
export const readCache = <T>(key: string, ttlMs: number): T | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as CacheEnvelope<T>;
    if (!parsed || typeof parsed !== 'object') {
      return null;
    }

    const savedAt = Number(parsed.savedAt || 0);
    if (!savedAt || Date.now() - savedAt > ttlMs) {
      return null;
    }

    return parsed.data ?? null;
  } catch {
    return null;
  }
};

/**
 * Escreve valor em cache com timestamp.
 */
export const writeCache = <T>(key: string, data: T) => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const envelope: CacheEnvelope<T> = {
      savedAt: Date.now(),
      data
    };
    window.localStorage.setItem(key, JSON.stringify(envelope));
  } catch {
    // Ignora erros de quota/serialização.
  }
};

/**
 * Remove uma chave de cache quando necessário.
 */
export const clearCacheKey = (key: string) => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.removeItem(key);
  } catch {
    // Ignora falhas de storage.
  }
};
