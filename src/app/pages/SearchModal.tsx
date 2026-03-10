import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { X, Search } from 'lucide-react';
import { ContentGrid } from '../components/ContentGrid';
import { useXtreamCatalog } from '../api';
import { CatalogLoader } from '../components/CatalogLoader';

/**
 * Página modal de resultados de busca.
 * Só aparece quando o usuário usa a caixa de pesquisa do menu.
 */
export function SearchModal() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialTerm = searchParams.get('term') ?? '';
  const [term, setTerm] = useState(initialTerm);

  const { loading, error, liveGrid, vodGrid, seriesGrid } = useXtreamCatalog();
  const allGridContent = useMemo(
    () => [...liveGrid, ...vodGrid, ...seriesGrid],
    [liveGrid, vodGrid, seriesGrid]
  );

  const filteredContent = useMemo(() => {
    const normalizedTerm = term.trim().toLowerCase();

    if (!normalizedTerm) {
      // Sem termo, mostramos apenas o primeiro lote para manter o modal leve.
      return allGridContent.slice(0, 30);
    }

    const filtered = allGridContent.filter((item) => {
      const titleMatches = item.title.toLowerCase().includes(normalizedTerm);
      const subtitleMatches = item.subtitle?.toLowerCase().includes(normalizedTerm) ?? false;

      return titleMatches || subtitleMatches;
    });
    return filtered.slice(0, 30);
  }, [term, allGridContent]);

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
          {error && <p className="text-red-400 text-sm">Erro: {error}</p>}
          {!loading && !error && (
            <ContentGrid title="Catálogo" content={filteredContent} viewMode="grid" />
          )}
        </div>
      </section>
    </div>
  );
}
