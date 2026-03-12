import { ContentList } from '../components/ContentList';
import { CatalogPageHeader } from '../components/CatalogPageHeader';
import { useCatalogViewMode } from '../hooks/useCatalogViewMode';
import { useXtreamCatalog } from '../api';
import { useEffect, useMemo, useState } from 'react';
import { CategorySelect } from '../components/CategorySelect';
import { CatalogLoader } from '../components/CatalogLoader';
import { useHiddenLiveCategories } from '../hooks/useHiddenLiveCategories';

export function LiveTV() {
  const { viewMode, toggleViewMode } = useCatalogViewMode('catalog-view:live-tv', 'list');
  const { loading, error, liveList, liveCategories } = useXtreamCatalog();
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
    const baseList = liveList.filter((item) => !hiddenSet.has(String(item.categoryId || '')));
    const base = selectedCategory === 'all'
      ? baseList
      : baseList.filter((item) => String(item.categoryId ?? '') === selectedCategory);
    return base;
  }, [liveList, selectedCategory, hiddenSet]);

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
    <div>
      <CatalogPageHeader title="TV ao Vivo" viewMode={viewMode} onToggleViewMode={toggleViewMode} />

      {/* Cada bloco representa uma trilha editorial da TV ao vivo. */}
      {loading && <CatalogLoader variant={viewMode} />}
      {error && <p className="text-red-400 text-sm whitespace-pre-line">Erro: {error}</p>}
      {!loading && !error && (
        <>
          <CategorySelect
            label="Categoria"
            value={selectedCategory}
            options={visibleCategories}
            onChange={(value) => {
              setSelectedCategory(value);
              setVisibleCount(30);
            }}
          />

          <ContentList
            title="Canais"
            content={visibleItems}
            viewMode={viewMode}
            hasMore={hasMore}
            onLoadMore={() => setVisibleCount((current) => current + 30)}
          />
        </>
      )}
    </div>
  );
}
