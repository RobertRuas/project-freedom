import { useMemo, useState } from 'react';
import { ContentGrid } from '../components/ContentGrid';
import { allGridContent } from '../data/content';
import { FeatureGrid } from '../components/FeatureGrid';
import { searchFeatures } from '../data/feature';
import { CatalogPageHeader } from '../components/CatalogPageHeader';
import { useCatalogViewMode } from '../hooks/useCatalogViewMode';

export function SearchPage() {
  const [term, setTerm] = useState('');
  const { viewMode, toggleViewMode } = useCatalogViewMode('catalog-view:search');

  const filteredContent = useMemo(() => {
    const normalizedTerm = term.trim().toLowerCase();

    if (!normalizedTerm) {
      return allGridContent;
    }

    return allGridContent.filter((item) => {
      const titleMatches = item.title.toLowerCase().includes(normalizedTerm);
      const subtitleMatches = item.subtitle?.toLowerCase().includes(normalizedTerm) ?? false;

      return titleMatches || subtitleMatches;
    });
  }, [term]);

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

      <ContentGrid title="Resultados" content={filteredContent} viewMode={viewMode} />
    </div>
  );
}
