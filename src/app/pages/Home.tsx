import { ContentGrid } from '../components/ContentGrid';
import { CatalogPageHeader } from '../components/CatalogPageHeader';
import { useCatalogViewMode } from '../hooks/useCatalogViewMode';
import { useXtreamCatalog } from '../api';
import { CatalogLoader } from '../components/CatalogLoader';

export function Home() {
  const { viewMode, toggleViewMode } = useCatalogViewMode('catalog-view:home');
  const { loading, error, liveGrid, vodGrid, seriesGrid } = useXtreamCatalog();
  const limit = 30;

  return (
    <div>
      <CatalogPageHeader title="Início" viewMode={viewMode} onToggleViewMode={toggleViewMode} />

      {/* Home composta por seções independentes para facilitar evolução por categoria. */}
      {loading && <CatalogLoader variant={viewMode} />}
      {error && <p className="text-red-400 text-sm whitespace-pre-line">Erro: {error}</p>}
      {!loading && !error && (
        <>
          <ContentGrid title="TV ao Vivo" content={liveGrid.slice(0, limit)} viewMode={viewMode} />
          <ContentGrid title="Filmes" content={vodGrid.slice(0, limit)} viewMode={viewMode} />
          <ContentGrid title="Séries" content={seriesGrid.slice(0, limit)} viewMode={viewMode} />
        </>
      )}
    </div>
  );
}
