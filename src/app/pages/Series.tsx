import { ContentGrid } from '../components/ContentGrid';
import { CatalogPageHeader } from '../components/CatalogPageHeader';
import { seriesGridContentWithHash } from '../data/content';
import { useCatalogViewMode } from '../hooks/useCatalogViewMode';

export function Series() {
  const { viewMode, toggleViewMode } = useCatalogViewMode('catalog-view:series');

  return (
    <div>
      <CatalogPageHeader title="Séries" viewMode={viewMode} onToggleViewMode={toggleViewMode} />

      {/* Página dedicada para séries no padrão de grade. */}
      <ContentGrid title="Catálogo" content={seriesGridContentWithHash} viewMode={viewMode} />
    </div>
  );
}
