import { ContentGrid } from '../components/ContentGrid';
import { CatalogPageHeader } from '../components/CatalogPageHeader';
import {
  liveTvGridContentWithHash,
  moviesGridContent,
  seriesGridContentWithHash,
} from '../data/content';
import { useCatalogViewMode } from '../hooks/useCatalogViewMode';

export function Home() {
  const { viewMode, toggleViewMode } = useCatalogViewMode('catalog-view:home');

  return (
    <div>
      <CatalogPageHeader title="Início" viewMode={viewMode} onToggleViewMode={toggleViewMode} />

      {/* Home composta por seções independentes para facilitar evolução por categoria. */}
      <ContentGrid title="TV ao Vivo" content={liveTvGridContentWithHash} viewMode={viewMode} />
      <ContentGrid title="Filmes" content={moviesGridContent} viewMode={viewMode} />
      <ContentGrid title="Séries" content={seriesGridContentWithHash} viewMode={viewMode} />
    </div>
  );
}
