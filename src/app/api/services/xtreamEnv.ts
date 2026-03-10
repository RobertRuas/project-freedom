/**
 * Leitura centralizada de variaveis de ambiente do Xtream.
 * Usamos prefixo VITE_ para funcionar com Vite no frontend.
 */
export const xtreamEnv = {
  serverUrl: String(import.meta.env.VITE_XTREAM_SERVER_URL || '').trim(),
  username: String(import.meta.env.VITE_XTREAM_USERNAME || '').trim(),
  password: String(import.meta.env.VITE_XTREAM_PASSWORD || '').trim(),
  timeoutMs: Number.parseInt(String(import.meta.env.VITE_XTREAM_TIMEOUT_MS || '12000'), 10),
  cacheTtlMs: Number.parseInt(String(import.meta.env.VITE_XTREAM_CACHE_TTL_MS || '60000'), 10),
  enabled: true
};

xtreamEnv.enabled = Boolean(xtreamEnv.serverUrl && xtreamEnv.username && xtreamEnv.password);
