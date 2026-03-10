import { useMemo, useState } from 'react';
import { ContentGrid } from '../components/ContentGrid';
import { CatalogPageHeader } from '../components/CatalogPageHeader';
import { useCatalogViewMode } from '../hooks/useCatalogViewMode';
import { useXtreamCatalog } from '../api';
import { CategorySelect } from '../components/CategorySelect';
import { CatalogLoader } from '../components/CatalogLoader';

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
    <div>
      <CatalogPageHeader title="Séries" viewMode={viewMode} onToggleViewMode={toggleViewMode} />

      {/* Página dedicada para séries no padrão de grade. */}
      {loading && <CatalogLoader variant={viewMode} />}
      {error && <p className="text-red-400 text-sm">Erro: {error}</p>}
      {!loading && !error && (
        <>
          <CategorySelect
            label="Categoria"
            value={selectedCategory}
            options={seriesCategories}
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
