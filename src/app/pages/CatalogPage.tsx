import type { ReactNode } from 'react';
import { CatalogLoader } from '../components/CatalogLoader';
import { CatalogPageHeader } from '../components/CatalogPageHeader';
import type { CatalogViewMode } from '../hooks/useCatalogViewMode';

/**
 * Propriedades do layout base de catálogo.
 * Cada página injeta seus filtros e seu conteúdo mantendo o padrão visual.
 */
interface CatalogPageProps {
  title: string;
  viewMode: CatalogViewMode;
  onToggleViewMode: () => void;
  loading?: boolean;
  error?: string | null;
  filters?: ReactNode;
  preContent?: ReactNode;
  children?: ReactNode;
}

/**
 * Layout base reutilizável para telas de catálogo.
 * Centraliza cabeçalho, loading, erro, área de filtros e conteúdo.
 */
export function CatalogPage({
  title,
  viewMode,
  onToggleViewMode,
  loading = false,
  error = null,
  filters,
  preContent,
  children
}: CatalogPageProps) {
  return (
    <div>
      <CatalogPageHeader title={title} viewMode={viewMode} onToggleViewMode={onToggleViewMode} />

      {preContent}

      {filters ? <div className="mb-4">{filters}</div> : null}

      {loading && <CatalogLoader variant={viewMode} />}
      {error && <p className="text-red-400 text-sm whitespace-pre-line">Erro: {error}</p>}
      {!loading && !error ? children : null}
    </div>
  );
}
