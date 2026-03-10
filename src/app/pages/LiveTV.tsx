import { ContentList } from '../components/ContentList';
import { CatalogPageHeader } from '../components/CatalogPageHeader';
import { useCatalogViewMode } from '../hooks/useCatalogViewMode';
import { useXtreamCatalog } from '../api';
import { useMemo, useState } from 'react';
import { CategorySelect } from '../components/CategorySelect';
import { CatalogLoader } from '../components/CatalogLoader';

export function LiveTV() {
  const { viewMode, toggleViewMode } = useCatalogViewMode('catalog-view:live-tv');
  const { loading, error, liveList, liveCategories } = useXtreamCatalog();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [visibleCount, setVisibleCount] = useState(30);

  const filteredItems = useMemo(() => {
    const base = selectedCategory === 'all'
      ? liveList
      : liveList.filter((item) => String(item.categoryId ?? '') === selectedCategory);
    return base;
  }, [liveList, selectedCategory]);

  const visibleItems = filteredItems.slice(0, visibleCount);
  /**
   * Regra de negócio: só exibimos "Ver mais" quando o usuário escolhe
   * uma categoria específica. Em "Todas" mostramos apenas o primeiro lote.
   */
  const hasMore = selectedCategory !== 'all' && filteredItems.length > visibleCount;

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
            options={liveCategories}
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
