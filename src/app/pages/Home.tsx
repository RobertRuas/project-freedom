import { useEffect, useMemo } from 'react';
import { ContentGrid } from '../components/ContentGrid';
import { CatalogPageHeader } from '../components/CatalogPageHeader';
import { useCatalogViewMode } from '../hooks/useCatalogViewMode';
import { useXtreamCatalog } from '../api';
import { CatalogLoader } from '../components/CatalogLoader';
import { useHiddenLiveCategories } from '../hooks/useHiddenLiveCategories';
import { useDefaultFavoriteLiveChannels } from '../hooks/useDefaultFavoriteLiveChannels';

export function Home() {
  /**
   * Chave versionada para invalidar preferência antiga em grade
   * e garantir lista como padrão na tela inicial.
   */
  const { viewMode, toggleViewMode } = useCatalogViewMode('catalog-view:home:v2', 'list');
  const { loading, error, liveGrid, liveCategories } = useXtreamCatalog();
  const { initializeDefaults } = useHiddenLiveCategories();
  const { favoriteLiveGrid } = useDefaultFavoriteLiveChannels(liveGrid);

  useEffect(() => {
    if (liveCategories.length) {
      initializeDefaults(liveCategories.map((category) => String(category.id || '')));
    }
  }, [liveCategories, initializeDefaults]);

  const favoriteOnlyGrid = useMemo(() => favoriteLiveGrid, [favoriteLiveGrid]);

  return (
    <div>
      <CatalogPageHeader title="Início" viewMode={viewMode} onToggleViewMode={toggleViewMode} />

      {/* Home dedicada apenas aos canais favoritos padrão. */}
      {loading && <CatalogLoader variant={viewMode} />}
      {error && <p className="text-red-400 text-sm whitespace-pre-line">Erro: {error}</p>}
      {!loading && !error && (
        <>
          <ContentGrid title="Canais Favoritos" content={favoriteOnlyGrid} viewMode={viewMode} />
        </>
      )}
    </div>
  );
}
