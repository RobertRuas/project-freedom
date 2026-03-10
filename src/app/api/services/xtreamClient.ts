import { xtreamEnv } from './xtreamEnv';
import type {
  XtreamCatalogResponse,
  XtreamCategory,
  XtreamLiveStream,
  XtreamSeriesInfo,
  XtreamSeriesItem,
  XtreamSummary,
  XtreamVodStream
} from '../types/xtream';

/**
 * Cliente HTTP do Xtream.
 * - Monta URL no formato player_api.php
 * - Aplica timeout manual
 * - Faz cache simples em memoria para evitar chamadas repetidas
 */
class XtreamClient {
  private cache = new Map<string, { expiresAt: number; data: unknown }>();

  private normalizeBaseUrl(serverUrl: string) {
    let normalized = String(serverUrl || '').trim().replace(/\/+$/, '');

    /**
     * Se a aplicação estiver em HTTPS, tentamos forçar HTTPS no Xtream
     * para evitar Mixed Content (bloqueio do navegador).
     */
    try {
      if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
        const parsed = new URL(normalized);
        if (parsed.protocol === 'http:') {
          parsed.protocol = 'https:';
          normalized = parsed.toString().replace(/\/+$/, '');
        }
      }
    } catch {
      // Ignorado: URL inválida.
    }

    return normalized;
  }

  /**
   * Monta uma mensagem de erro mais explicativa para problemas de rede.
   * Evitamos expor credenciais, usando apenas a URL base.
   */
  private buildErrorMessage(error: unknown, baseUrl: string, timeoutMs: number) {
    const rawMessage = error instanceof Error ? error.message : String(error || '');
    const hints: string[] = [];

    if (!baseUrl) {
      hints.push('VITE_XTREAM_SERVER_URL está vazio ou inválido.');
    }

    if (
      rawMessage.toLowerCase().includes('failed to fetch') ||
      rawMessage.toLowerCase().includes('load failed') ||
      rawMessage.toLowerCase().includes('networkerror')
    ) {
      hints.push('Verifique se o servidor Xtream está acessível e se CORS está liberado.');
    }

    if (rawMessage.toLowerCase().includes('tempo esgotado')) {
      hints.push(`Ajuste VITE_XTREAM_TIMEOUT_MS (atual: ${timeoutMs}ms).`);
    }

    try {
      const pageProtocol = window.location.protocol;
      const baseProtocol = new URL(baseUrl).protocol;
      if (pageProtocol === 'https:' && baseProtocol === 'http:') {
        hints.push('Mixed Content: a página está em HTTPS e o Xtream em HTTP.');
      }
    } catch {
      // Ignorado: URL inválida ou ambiente sem window.
    }

    const hintText = hints.length ? ` Dicas: ${hints.join(' | ')}` : '';
    return `Falha ao consultar Xtream em ${baseUrl || 'URL não definida'}. Motivo: ${rawMessage || 'desconhecido'}.${hintText}`;
  }

  private cacheKey(action?: string, extraParams: Record<string, string> = {}) {
    const extras = new URLSearchParams(extraParams).toString();
    return `${xtreamEnv.serverUrl}|${xtreamEnv.username}|${action || 'summary'}|${extras}`;
  }

  private async fetchWithTimeout(url: string, timeoutMs: number) {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, { signal: controller.signal });
      if (!response.ok) {
        throw new Error(`Falha ao consultar Xtream (${response.status})`);
      }
      return response.json();
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new Error(`Tempo esgotado ao consultar Xtream (${timeoutMs}ms).`);
      }
      throw error;
    } finally {
      window.clearTimeout(timeoutId);
    }
  }

  private async request<T>(action?: string, extraParams: Record<string, string> = {}) {
    if (!xtreamEnv.enabled) {
      throw new Error('Xtream nao configurado nas variaveis de ambiente.');
    }

    const key = this.cacheKey(action, extraParams);
    const now = Date.now();
    const hit = this.cache.get(key);

    if (hit && hit.expiresAt > now) {
      return hit.data as T;
    }

    const params = new URLSearchParams({
      username: xtreamEnv.username,
      password: xtreamEnv.password
    });

    if (action) {
      params.set('action', action);
    }

    Object.entries(extraParams).forEach(([paramKey, paramValue]) => {
      if (paramValue != null && paramValue !== '') {
        params.set(paramKey, String(paramValue));
      }
    });

    const baseUrl = this.normalizeBaseUrl(xtreamEnv.serverUrl);
    const url = `${baseUrl}/player_api.php?${params.toString()}`;
    try {
      const data = await this.fetchWithTimeout(url, xtreamEnv.timeoutMs);
      this.cache.set(key, { data, expiresAt: now + xtreamEnv.cacheTtlMs });
      return data as T;
    } catch (error) {
      throw new Error(this.buildErrorMessage(error, baseUrl, xtreamEnv.timeoutMs));
    }
  }

  async getSummary() {
    return this.request<XtreamSummary>();
  }

  async getLiveStreams() {
    return this.request<XtreamLiveStream[]>('get_live_streams');
  }

  async getVodStreams() {
    return this.request<XtreamVodStream[]>('get_vod_streams');
  }

  async getSeries() {
    return this.request<XtreamSeriesItem[]>('get_series');
  }

  async getSeriesInfo(seriesId: string) {
    return this.request<XtreamSeriesInfo>('get_series_info', { series_id: seriesId });
  }

  async getCategories(type: 'live' | 'vod' | 'series') {
    const action =
      type === 'live'
        ? 'get_live_categories'
        : type === 'vod'
          ? 'get_vod_categories'
          : 'get_series_categories';

    return this.request<XtreamCategory[]>(action);
  }
}

export const xtreamClient = new XtreamClient();
