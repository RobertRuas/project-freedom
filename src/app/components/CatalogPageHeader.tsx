import { LayoutGrid, List } from 'lucide-react';
import type { CatalogViewMode } from '../hooks/useCatalogViewMode';

interface CatalogPageHeaderProps {
  title: string;
  viewMode: CatalogViewMode;
  onToggleViewMode: () => void;
}

/**
 * Cabeçalho padrão de páginas com catálogo.
 * O botão alterna o modo para a página inteira e mantém visual discreto.
 */
export function CatalogPageHeader({ title, viewMode, onToggleViewMode }: CatalogPageHeaderProps) {
  return (
    <header className="flex items-center justify-between gap-3 mb-6 md:mb-8 lg:mb-10">
      <h1 className="text-white text-2xl md:text-3xl lg:text-4xl font-bold">{title}</h1>

      <button
        type="button"
        aria-label={viewMode === 'grid' ? 'Alternar para lista' : 'Alternar para grade'}
        onClick={onToggleViewMode}
        className="inline-flex items-center justify-center rounded-md p-2 text-white/55 hover:text-white/80 bg-black/20 border border-white/10"
      >
        {viewMode === 'grid' ? <List className="w-4 h-4" /> : <LayoutGrid className="w-4 h-4" />}
      </button>
    </header>
  );
}
