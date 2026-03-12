import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { X, Search } from 'lucide-react';
import { ContentGrid } from '../components/ContentGrid';
import { useXtreamCatalog } from '../api';
import { CatalogLoader } from '../components/CatalogLoader';
import { normalizeSearchText } from '../utils/search';
import { SearchInlineLoader } from '../components/SearchInlineLoader';

/**
 * Página modal de resultados de busca.
 * Só aparece quando o usuário usa a caixa de pesquisa do menu.
 */
export function SearchModal() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const termFromQuery = searchParams.get('term') ?? '';
  const [term, setTerm] = useState(termFromQuery);
  const [debouncedTerm, setDebouncedTerm] = useState(termFromQuery);
  const [isSearching, setIsSearching] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { loading, error, liveGrid, vodGrid, seriesGrid } = useXtreamCatalog();
  const allGridContent = useMemo(
    () => [...liveGrid, ...vodGrid, ...seriesGrid],
    [liveGrid, vodGrid, seriesGrid]
  );

  useEffect(() => {
    /**
     * Mantém o campo do modal sincronizado com o termo vindo da sidebar
     * quando a navegação para /buscar-modal acontece em tempo real.
     */
    setTerm(termFromQuery);
    setDebouncedTerm(termFromQuery);
    setIsSearching(false);
  }, [termFromQuery]);

  useEffect(() => {
    /**
     * Ao abrir o modal (ou atualizar termo vindo da sidebar),
     * o foco deve ir para a busca do próprio modal.
     */
    const timeoutId = window.setTimeout(() => {
      const input = searchInputRef.current;
      if (!input) return;

      input.focus({ preventScroll: true });
      const textLength = input.value.length;
      input.setSelectionRange(textLength, textLength);
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [termFromQuery]);

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
      // Sem termo, mostramos apenas o primeiro lote para manter o modal leve.
      return allGridContent.slice(0, 30);
    }

    const filtered = allGridContent.filter((item) => {
      const titleMatches = normalizeSearchText(item.title).includes(normalizedTerm);
      const subtitleMatches = normalizeSearchText(item.subtitle || '').includes(normalizedTerm);

      return titleMatches || subtitleMatches;
    });
    return filtered.slice(0, 30);
  }, [debouncedTerm, allGridContent]);

  const closeModal = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate('/', { replace: true });
  };

  return (
    <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <section className="w-full max-w-6xl rounded-2xl border border-white/10 bg-[#0b0b0b] overflow-hidden">
        {/* Cabeçalho do modal com busca integrada. */}
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between px-4 md:px-6 py-4 border-b border-white/10">
          <div>
            <p className="text-white/50 text-xs uppercase tracking-[0.3em]">Busca rápida</p>
            <h1 className="text-white text-xl md:text-2xl font-semibold mt-1">Resultados</h1>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="flex items-center gap-2 rounded-full border border-white/15 bg-black/40 px-3 py-2 w-full md:w-[320px]">
              <Search className="w-4 h-4 text-white/50" />
              <input
                ref={searchInputRef}
                type="search"
                value={term}
                onChange={(event) => setTerm(event.target.value)}
                placeholder="Pesquisar por título ou gênero"
                className="bg-transparent text-white text-sm outline-none flex-1 placeholder:text-white/40"
              />
            </div>
            <button
              type="button"
              aria-label="Fechar resultados"
              onClick={closeModal}
              className="rounded-md bg-white/10 hover:bg-white/20 text-white p-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Conteúdo do modal com resultados. */}
        <div className="p-4 md:p-6 max-h-[75vh] overflow-y-auto">
          {loading && <CatalogLoader variant="grid" />}
          {error && <p className="text-red-400 text-sm whitespace-pre-line">Erro: {error}</p>}
          {!loading && !error && (
            <>
              {isSearching && (
                <div className="mb-4">
                  <SearchInlineLoader label="Pesquisando resultados..." />
                </div>
              )}
              <ContentGrid
                title="Catálogo"
                content={filteredContent}
                viewMode="grid"
                clickBehavior="details"
              />
            </>
          )}
        </div>
      </section>
    </div>
  );
}
