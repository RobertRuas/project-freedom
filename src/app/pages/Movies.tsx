import { ContentGrid } from '../components/ContentGrid';
import { CatalogPageHeader } from '../components/CatalogPageHeader';
import { moviesGridContent } from '../data/content';
import { useCatalogViewMode } from '../hooks/useCatalogViewMode';

export function Movies() {
  const { viewMode, toggleViewMode } = useCatalogViewMode('catalog-view:movies');

  return (
    <div>
      <CatalogPageHeader title="Filmes" viewMode={viewMode} onToggleViewMode={toggleViewMode} />

      {/* Página dedicada para filmes no padrão de grade. */}
      <ContentGrid title="Catálogo" content={moviesGridContent} viewMode={viewMode} />
    </div>
  );
}
