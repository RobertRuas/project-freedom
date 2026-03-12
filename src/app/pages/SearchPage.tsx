import { useEffect, useMemo, useState } from 'react';
import { ContentGrid } from '../components/ContentGrid';
import { FeatureGrid } from '../components/FeatureGrid';
import { searchFeatures } from '../data/feature';
import { CatalogPageHeader } from '../components/CatalogPageHeader';
import { useCatalogViewMode } from '../hooks/useCatalogViewMode';
import { useXtreamCatalog } from '../api';
import { CatalogLoader } from '../components/CatalogLoader';
import { normalizeSearchText } from '../utils/search';
import { SearchInlineLoader } from '../components/SearchInlineLoader';

export function SearchPage() {
  const [term, setTerm] = useState('');
  const [debouncedTerm, setDebouncedTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const { viewMode, toggleViewMode } = useCatalogViewMode('catalog-view:search');
  const { loading, error, liveGrid, vodGrid, seriesGrid } = useXtreamCatalog();
  const allGridContent = useMemo(
    () => [...liveGrid, ...vodGrid, ...seriesGrid],
    [liveGrid, vodGrid, seriesGrid]
  );

  useEffect(() => {
    setIsSearching(true);
    const timeoutId = window.setTimeout(() => {
      setDebouncedTerm(term);
      setIsSearching(false);
    }, 280);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [term]);

  const filteredContent = useMemo(() => {
    const normalizedTerm = normalizeSearchText(debouncedTerm);

    if (!normalizedTerm) {
      // Sem termo, limitamos para manter a busca leve.
      return allGridContent.slice(0, 30);
    }

    const filtered = allGridContent.filter((item) => {
      const titleMatches = normalizeSearchText(item.title).includes(normalizedTerm);
      const subtitleMatches = normalizeSearchText(item.subtitle || '').includes(normalizedTerm);

      return titleMatches || subtitleMatches;
    });
    return filtered.slice(0, 30);
  }, [debouncedTerm, allGridContent]);

  return (
    <div>
      <CatalogPageHeader title="Buscar" viewMode={viewMode} onToggleViewMode={toggleViewMode} />

      <FeatureGrid
        title="Ferramentas de Busca"
        subtitle="Busque por nome, gênero ou palavra-chave. Todas as telas seguem o padrão em grade."
        items={searchFeatures}
      />

      <section className="mb-8 md:mb-10">
        <label htmlFor="search-content" className="block text-white text-sm md:text-base mb-2">
          Buscar conteúdo
        </label>
        <input
          id="search-content"
          type="search"
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          placeholder="Ex.: ação, ao vivo, drama..."
          className="w-full rounded-lg border border-white/15 bg-white/5 text-white placeholder:text-white/50 px-4 py-3"
        />
      </section>

      {loading && <CatalogLoader variant={viewMode} />}
      {error && <p className="text-red-400 text-sm whitespace-pre-line">Erro: {error}</p>}
      {!loading && !error && (
        <>
          {isSearching && (
            <div className="mb-4">
              <SearchInlineLoader label="Pesquisando no catálogo..." />
            </div>
          )}
          <ContentGrid
            title="Resultados"
            content={filteredContent}
            viewMode={viewMode}
            clickBehavior="details"
          />
        </>
      )}
    </div>
  );
}
