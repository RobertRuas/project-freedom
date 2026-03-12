import { useEffect } from 'react';
import { useXtreamCatalog } from '../api';
import { useHiddenLiveCategories } from '../hooks/useHiddenLiveCategories';

export function SettingsPage() {
  const { loading, error, liveCategories } = useXtreamCatalog();
  const { hiddenSet, toggleCategoryVisibility, initializeDefaults } = useHiddenLiveCategories();

  useEffect(() => {
    if (liveCategories.length) {
      initializeDefaults(liveCategories.map((category) => String(category.id || '')));
    }
  }, [liveCategories, initializeDefaults]);

  return (
    <div>
      <h1 className="text-white text-2xl md:text-3xl font-semibold mb-4">Configurações</h1>

      {/* Lista de categorias de canais disponível no catálogo Live. */}
      <section className="rounded-xl border border-white/10 bg-white/5 p-4 md:p-6">
        <h2 className="text-white/80 text-sm uppercase tracking-[0.2em] mb-3">
          Categorias de Canais
        </h2>

        {loading && <p className="text-white/60 text-sm">Carregando categorias...</p>}
        {error && <p className="text-red-400 text-sm whitespace-pre-line">Erro: {error}</p>}
        {!loading && !error && (
          <div className="rounded-lg border border-white/10 bg-black/30 p-3">
            {liveCategories.length === 0 ? (
              <p className="text-white/60 text-sm">Nenhuma categoria de canal encontrada.</p>
            ) : (
              <>
                <p className="text-white/50 text-xs mb-3">
                  Categorias ocultas: {liveCategories.filter((category) => hiddenSet.has(String(category.id || ''))).length}
                </p>
                <ul className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {liveCategories.map((category) => (
                  <li
                    key={category.id || category.name}
                    className="flex items-center justify-between gap-3 rounded-md border border-white/10 bg-white/5 px-3 py-2"
                  >
                    <span className="text-white text-sm">{category.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-white/50 text-xs">{category.id || '-'}</span>
                      <button
                        type="button"
                        onClick={() => toggleCategoryVisibility(String(category.id || ''))}
                        className={`rounded-md px-2 py-1 text-[10px] border ${
                          hiddenSet.has(String(category.id || ''))
                            ? 'border-red-400/40 bg-red-500/15 text-red-200'
                            : 'border-emerald-400/40 bg-emerald-500/15 text-emerald-200'
                        }`}
                      >
                        {hiddenSet.has(String(category.id || '')) ? 'Oculta' : 'Visível'}
                      </button>
                    </div>
                  </li>
                ))}
                </ul>
              </>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
