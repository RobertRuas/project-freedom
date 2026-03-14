import { useEffect, useMemo, useState } from 'react';
import { ContentGrid } from '../components/ContentGrid';
import { useCatalogViewMode } from '../hooks/useCatalogViewMode';
import { useXtreamCatalog } from '../api';
import { CategorySelect } from '../components/CategorySelect';
import { useHiddenLiveCategories } from '../hooks/useHiddenLiveCategories';
import { CatalogPage } from './CatalogPage';

export function TV() {
  const { viewMode, toggleViewMode } = useCatalogViewMode('catalog-view:tv', 'list');
  const { loading, error, liveGrid, liveCategories } = useXtreamCatalog();
  const { hiddenSet, initializeDefaults } = useHiddenLiveCategories();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [visibleCount, setVisibleCount] = useState(30);

  useEffect(() => {
    if (liveCategories.length) {
      initializeDefaults(liveCategories.map((category) => String(category.id || '')));
    }
  }, [liveCategories, initializeDefaults]);

  const visibleCategories = useMemo(
    () => liveCategories.filter((category) => !hiddenSet.has(String(category.id || ''))),
    [liveCategories, hiddenSet]
  );

  const filteredItems = useMemo(() => {
    const baseGrid = liveGrid.filter((item) => !hiddenSet.has(String(item.categoryId || '')));
    const base = selectedCategory === 'all'
      ? baseGrid
      : baseGrid.filter((item) => String(item.categoryId ?? '') === selectedCategory);
    return base;
  }, [liveGrid, selectedCategory, hiddenSet]);

  const visibleItems = filteredItems.slice(0, visibleCount);
  /**
   * Regra de negócio: só exibimos "Ver mais" quando o usuário escolhe
   * uma categoria específica. Em "Todas" mostramos apenas o primeiro lote.
   */
  const hasMore = selectedCategory !== 'all' && filteredItems.length > visibleCount;

  useEffect(() => {
    if (selectedCategory === 'all') return;
    const categoryIsVisible = visibleCategories.some((category) => String(category.id) === selectedCategory);
    if (!categoryIsVisible) {
      setSelectedCategory('all');
      setVisibleCount(30);
    }
  }, [selectedCategory, visibleCategories]);

  return (
    <CatalogPage
      title="TV"
      viewMode={viewMode}
      onToggleViewMode={toggleViewMode}
      loading={loading}
      error={error}
      filters={(
        <CategorySelect
          label="Categoria"
          value={selectedCategory}
          options={visibleCategories}
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
