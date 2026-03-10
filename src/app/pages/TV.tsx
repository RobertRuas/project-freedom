import { ContentGrid } from '../components/ContentGrid';
import { CatalogPageHeader } from '../components/CatalogPageHeader';
import { liveTvGridContent } from '../data/content';
import { useCatalogViewMode } from '../hooks/useCatalogViewMode';

export function TV() {
  const { viewMode, toggleViewMode } = useCatalogViewMode('catalog-view:tv');

  return (
    <div>
      <CatalogPageHeader title="TV" viewMode={viewMode} onToggleViewMode={toggleViewMode} />

      {/* Página dedicada para conteúdos de TV no padrão de grade. */}
      <ContentGrid title="Catálogo" content={liveTvGridContent} viewMode={viewMode} />
    </div>
  );
}
