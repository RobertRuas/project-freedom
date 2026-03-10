/**
 * Tipos compartilhados dos conteúdos exibidos na aplicação.
 * A centralização evita duplicação entre páginas e componentes.
 */
export type ContentType = 'tv' | 'movie' | 'series';

/**
 * Item usado em grades de conteúdo (Home).
 */
export interface GridContentItem {
  id: string;
  title: string;
  imageUrl: string;
  subtitle?: string;
  type?: ContentType;
  /**
   * URL direta de reproducao quando disponivel (Xtream).
   */
  playUrl?: string;
  /**
   * Categoria do item no Xtream.
   * Usamos string para simplificar comparações no filtro.
   */
  categoryId?: string;
  /**
   * Hash dinâmico para rotas de detalhe.
   * Exemplo: /filmes/{hash}
   */
  routeHash?: string;
}

/**
 * Item usado em listas de conteúdo (TV ao Vivo).
 */
export interface ListContentItem {
  id: string;
  title: string;
  imageUrl: string;
  description: string;
  channel?: string;
  time?: string;
  live?: boolean;
  /**
   * URL direta de reproducao quando disponivel (Xtream).
   */
  playUrl?: string;
  /**
   * Categoria do item no Xtream.
   * Usamos string para simplificar comparações no filtro.
   */
  categoryId?: string;
  routeHash?: string;
}
