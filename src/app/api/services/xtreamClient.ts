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
    return String(serverUrl || '').trim().replace(/\/+$/, '');
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
    const data = await this.fetchWithTimeout(url, xtreamEnv.timeoutMs);

    this.cache.set(key, { data, expiresAt: now + xtreamEnv.cacheTtlMs });
    return data as T;
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
