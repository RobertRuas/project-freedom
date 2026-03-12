import { useMemo, useState } from 'react';
import { ContentGrid } from '../components/ContentGrid';
import { CatalogPageHeader } from '../components/CatalogPageHeader';
import { useCatalogViewMode } from '../hooks/useCatalogViewMode';
import { useXtreamCatalog } from '../api';
import { CategorySelect } from '../components/CategorySelect';
import { CatalogLoader } from '../components/CatalogLoader';

export function Movies() {
  /**
   * Chave versionada para invalidar preferência antiga em grade
   * e garantir lista como padrão na tela de filmes.
   */
  const { viewMode, toggleViewMode } = useCatalogViewMode('catalog-view:movies:v2', 'list');
  const { loading, error, vodGrid, vodCategories } = useXtreamCatalog();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [visibleCount, setVisibleCount] = useState(30);

  const filteredItems = useMemo(() => {
    const base = selectedCategory === 'all'
      ? vodGrid
      : vodGrid.filter((item) => String(item.categoryId ?? '') === selectedCategory);
    return base;
  }, [vodGrid, selectedCategory]);

  const visibleItems = filteredItems.slice(0, visibleCount);
  /**
   * Regra de negócio: só exibimos "Ver mais" quando o usuário escolhe
   * uma categoria específica. Em "Todas" mostramos apenas o primeiro lote.
   */
  const hasMore = selectedCategory !== 'all' && filteredItems.length > visibleCount;

  return (
    <div>
      <CatalogPageHeader title="Filmes" viewMode={viewMode} onToggleViewMode={toggleViewMode} />

      {/* Página dedicada para filmes no padrão de grade. */}
      {loading && <CatalogLoader variant={viewMode} />}
      {error && <p className="text-red-400 text-sm whitespace-pre-line">Erro: {error}</p>}
      {!loading && !error && (
        <>
          <CategorySelect
            label="Categoria"
            value={selectedCategory}
            options={vodCategories}
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
