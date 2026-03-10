import { ContentGrid } from '../../components/ContentGrid';
import { ContentList } from '../../components/ContentList';
import { useXtreamCatalog } from '../hooks/useXtreamCatalog';

/**
 * App isolado do Xtream.
 * Esta camada pode ser reaproveitada em outros projetos.
 */
export function XtreamApp() {
  const { loading, error, liveGrid, vodGrid, seriesGrid, liveList } = useXtreamCatalog();

  if (loading) {
    return (
      <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <p className="text-white/70 text-sm">Carregando catalogo do Xtream...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <p className="text-red-400 text-sm">Erro: {error}</p>
        <p className="text-white/60 text-xs mt-2">
          Verifique as variaveis VITE_XTREAM_SERVER_URL, VITE_XTREAM_USERNAME e VITE_XTREAM_PASSWORD.
        </p>
      </section>
    );
  }

  return (
    <div>
      <ContentGrid title="TV ao Vivo" content={liveGrid} viewMode="grid" />
      <ContentList title="Canais em destaque" content={liveList} viewMode="list" />
      <ContentGrid title="Filmes" content={vodGrid} viewMode="grid" />
      <ContentGrid title="Series" content={seriesGrid} viewMode="grid" />
    </div>
  );
}
