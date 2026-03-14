import { useMemo, useState } from 'react';
import { ContentGrid } from '../components/ContentGrid';
import { useCatalogViewMode } from '../hooks/useCatalogViewMode';
import { useXtreamCatalog } from '../api';
import { CategorySelect } from '../components/CategorySelect';
import { CatalogPage } from './CatalogPage';

export function Series() {
  const { viewMode, toggleViewMode } = useCatalogViewMode('catalog-view:series');
  const { loading, error, seriesGrid, seriesCategories } = useXtreamCatalog();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [visibleCount, setVisibleCount] = useState(30);

  const filteredItems = useMemo(() => {
    const base = selectedCategory === 'all'
      ? seriesGrid
      : seriesGrid.filter((item) => String(item.categoryId ?? '') === selectedCategory);
    return base;
  }, [seriesGrid, selectedCategory]);

  const visibleItems = filteredItems.slice(0, visibleCount);
  /**
   * Regra de negócio: só exibimos "Ver mais" quando o usuário escolhe
   * uma categoria específica. Em "Todas" mostramos apenas o primeiro lote.
   */
  const hasMore = selectedCategory !== 'all' && filteredItems.length > visibleCount;

  return (
    <CatalogPage
      title="Séries"
      viewMode={viewMode}
      onToggleViewMode={toggleViewMode}
      loading={loading}
      error={error}
      filters={(
        <CategorySelect
          label="Categoria"
          value={selectedCategory}
          options={seriesCategories}
          onChange={(value) => {
            setSelectedCategory(value);
            setVisibleCount(30);
          }}
        />
      )}
    >
      <ContentGrid
        title="Catálogo"
        content={visibleItems}
        viewMode={viewMode}
        hasMore={hasMore}
        onLoadMore={() => setVisibleCount((current) => current + 30)}
      />
    </CatalogPage>
  );
}
