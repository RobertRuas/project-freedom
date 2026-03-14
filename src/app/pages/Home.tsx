import { useEffect, useMemo } from 'react';
import { ContentGrid } from '../components/ContentGrid';
import { useCatalogViewMode } from '../hooks/useCatalogViewMode';
import { useXtreamCatalog } from '../api';
import { useHiddenLiveCategories } from '../hooks/useHiddenLiveCategories';
import { useDefaultFavoriteLiveChannels } from '../hooks/useDefaultFavoriteLiveChannels';
import { CatalogPage } from './CatalogPage';
import { DEFAULT_FAVORITE_SERIES_TITLES } from '../config/defaultLivePreferences';
import { normalizeSearchText } from '../utils/search';

export function Home() {
  /**
   * Chave versionada para invalidar preferência antiga em grade
   * e garantir lista como padrão na tela inicial.
   */
  const { viewMode, toggleViewMode } = useCatalogViewMode('catalog-view:home:v2', 'list');
  const { loading, error, liveGrid, liveCategories, seriesGrid } = useXtreamCatalog();
  const { initializeDefaults } = useHiddenLiveCategories();
  const { favoriteLiveGrid } = useDefaultFavoriteLiveChannels(liveGrid);

  useEffect(() => {
    if (liveCategories.length) {
      initializeDefaults(liveCategories.map((category) => String(category.id || '')));
    }
  }, [liveCategories, initializeDefaults]);

  const favoriteOnlyGrid = useMemo(() => favoriteLiveGrid, [favoriteLiveGrid]);
  const favoriteSeriesGrid = useMemo(() => {
    if (!seriesGrid.length) return [];

    return DEFAULT_FAVORITE_SERIES_TITLES
      .map((expectedTitle) => {
        const normalizedExpected = normalizeSearchText(expectedTitle);
        return (
          seriesGrid.find((item) => {
            const normalizedItem = normalizeSearchText(item.title);
            return normalizedItem.includes(normalizedExpected) || normalizedExpected.includes(normalizedItem);
          }) || null
        );
      })
      .filter((item): item is NonNullable<typeof item> => Boolean(item));
  }, [seriesGrid]);

  return (
    <CatalogPage
      title="Início"
      viewMode={viewMode}
      onToggleViewMode={toggleViewMode}
      loading={loading}
      error={error}
    >
      <ContentGrid title="Canais Favoritos" content={favoriteOnlyGrid} viewMode={viewMode} />
      {favoriteSeriesGrid.length > 0 ? (
        <ContentGrid title="Série Padrão" content={favoriteSeriesGrid} viewMode={viewMode} />
      ) : null}
    </CatalogPage>
  );
}
