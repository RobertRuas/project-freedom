import { useMemo, useState } from 'react';
import { ContentGrid } from '../components/ContentGrid';
import { CatalogPageHeader } from '../components/CatalogPageHeader';
import { useCatalogViewMode } from '../hooks/useCatalogViewMode';
import { useXtreamCatalog } from '../api';
import { CategorySelect } from '../components/CategorySelect';
import { CatalogLoader } from '../components/CatalogLoader';

export function TV() {
  const { viewMode, toggleViewMode } = useCatalogViewMode('catalog-view:tv');
  const { loading, error, liveGrid, liveCategories } = useXtreamCatalog();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [visibleCount, setVisibleCount] = useState(30);

  const filteredItems = useMemo(() => {
    const base = selectedCategory === 'all'
      ? liveGrid
      : liveGrid.filter((item) => String(item.categoryId ?? '') === selectedCategory);
    return base;
  }, [liveGrid, selectedCategory]);

  const visibleItems = filteredItems.slice(0, visibleCount);
  /**
   * Regra de negócio: só exibimos "Ver mais" quando o usuário escolhe
   * uma categoria específica. Em "Todas" mostramos apenas o primeiro lote.
   */
  const hasMore = selectedCategory !== 'all' && filteredItems.length > visibleCount;

  return (
    <div>
      <CatalogPageHeader title="TV" viewMode={viewMode} onToggleViewMode={toggleViewMode} />

      {/* Página dedicada para conteúdos de TV no padrão de grade. */}
      {loading && <CatalogLoader variant={viewMode} />}
      {error && <p className="text-red-400 text-sm whitespace-pre-line">Erro: {error}</p>}
      {!loading && !error && (
        <>
          <CategorySelect
            label="Categoria"
            value={selectedCategory}
            options={liveCategories}
            onChange={(value) => {
              setSelectedCategory(value);
              setVisibleCount(30);
            }}
          />

          <ContentGrid
            title="Catálogo"
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
