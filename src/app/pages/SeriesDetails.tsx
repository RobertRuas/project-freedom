import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { ArrowLeft, ChevronDown, ChevronRight, Heart } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { CatalogLoader } from '../components/CatalogLoader';
import { useXtreamCatalog, useXtreamSeriesDetail } from '../api';
import { buildPlayUrl } from '../api/services/xtreamMapper';

export function SeriesDetails() {
  const { hash } = useParams();
  const navigate = useNavigate();
  const { loading: catalogLoading, error: catalogError, seriesGrid } = useXtreamCatalog();
  const series = seriesGrid.find((item) => item.routeHash === hash);
  const { loading, error, detail } = useXtreamSeriesDetail(hash);
  const [openSeason, setOpenSeason] = useState<string | number | null>(null);

  const seasons = useMemo(() => detail?.seasons || [], [detail]);
  const info = (detail?.info || {}) as Record<string, unknown>;

  /**
   * Seleciona a sinopse disponível no retorno do Xtream.
   * O serviço pode variar nomes de campo dependendo do painel.
   */
  const synopsis =
    String(info.plot || info.overview || info.description || '').trim() ||
    'Sinopse não disponível.';

  /**
   * Informações extras úteis, exibidas somente quando presentes.
   */
  const extraInfo = [
    { label: 'Gênero', value: info.genre },
    { label: 'Elenco', value: info.cast },
    { label: 'Direção', value: info.director },
    { label: 'Ano', value: info.year },
    { label: 'Classificação', value: info.rating },
    { label: 'Lançamento', value: info.releaseDate || info.releasedate }
  ].filter((item) => item.value != null && String(item.value).trim() !== '');

  if (catalogLoading || loading) {
    return (
      <section className="max-w-6xl mx-auto">
        <div className="mb-6">
          <CatalogLoader variant="grid" />
        </div>
        <CatalogLoader variant="list" />
      </section>
    );
  }

  if (catalogError || error) {
    return <p className="text-red-400 text-sm whitespace-pre-line">Erro: {catalogError || error}</p>;
  }

  if (!series || !detail) {
    return (
      <section className="max-w-4xl mx-auto">
        <Link
          to="/series"
          className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm md:text-base mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para Séries
        </Link>

        <div className="rounded-xl border border-white/10 bg-white/5 p-6 md:p-8">
          <h1 className="text-white text-2xl md:text-3xl font-semibold mb-2">Série não encontrada</h1>
          <p className="text-white/70 text-sm md:text-base">Não foi possível localizar essa série.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-6xl mx-auto">
      <Link
        to="/series"
        className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm md:text-base mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar para Séries
      </Link>

      {/* Cabeçalho com dados principais da série. */}
      <article className="rounded-xl border border-white/10 bg-white/5 p-4 md:p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-4 md:gap-6">
          <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-gray-800 max-w-[220px]">
            <ImageWithFallback src={series.imageUrl} alt={series.title} className="w-full h-full object-cover" />
          </div>

          <div>
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-white text-2xl md:text-4xl font-semibold">{series.title}</h1>
              <button
                type="button"
                aria-label="Favoritar série"
                className="inline-flex items-center justify-center rounded-full border border-white/10 bg-black/40 p-2 text-white/70 hover:text-white"
              >
                <Heart className="w-4 h-4" />
              </button>
            </div>

            <p className="text-white/70 text-sm md:text-base mt-3">{synopsis}</p>

            {extraInfo.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {extraInfo.map((item) => (
                  <span
                    key={item.label}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/40 px-3 py-1 text-[11px] text-white/70"
                  >
                    <span className="text-white/50">{item.label}:</span>
                    <span className="text-white">{String(item.value)}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </article>

      {/* Temporadas e episódios. */}
      <div className="space-y-4">
        {seasons.map((season) => {
          const isOpen = openSeason === season.season;

          return (
            <section key={String(season.season)} className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
              <button
                type="button"
                onClick={() => setOpenSeason((current) => (current === season.season ? null : season.season))}
                className="w-full text-left p-4 md:p-5 hover:bg-white/5"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-white text-lg md:text-xl font-semibold">Temporada {season.season}</h2>
                    <p className="text-white/60 text-xs md:text-sm mt-1">
                      {Array.isArray(season.episodes) ? season.episodes.length : 0} episódios
                    </p>
                  </div>
                  {isOpen ? <ChevronDown className="w-4 h-4 text-white/70" /> : <ChevronRight className="w-4 h-4 text-white/70" />}
                </div>
              </button>

              {isOpen && (
                <div className="px-4 md:px-5 pb-4 md:pb-5 space-y-2.5">
                  {(Array.isArray(season.episodes) ? season.episodes : []).map((episode, index) => {
                    const streamId = episode.stream_id || episode.id || episode.episode_id;
                    const extension =
                      episode.container_extension ||
                      episode.info?.container_extension ||
                      episode.episode_info?.container_extension ||
                      'mp4';
                    const playUrl = streamId ? buildPlayUrl('series', String(streamId), String(extension)) : '';

                    return (
                      // Episódio inteiro clicável: ao clicar abrimos o player com o stream correto.
                      <article
                        key={String(streamId || index)}
                        className={`rounded-lg border border-white/10 bg-black/30 p-2.5 md:p-3 ${
                          streamId ? 'cursor-pointer hover:bg-white/5' : 'opacity-60'
                        }`}
                        role={streamId ? 'button' : undefined}
                        tabIndex={streamId ? 0 : undefined}
                        onClick={() => {
                          if (!streamId) return;
                          const titleParam = encodeURIComponent(series.title);
                          const kindParam = encodeURIComponent(`episodio ${index + 1}`);
                          const playParam = playUrl ? `&src=${encodeURIComponent(playUrl)}` : '';
                          navigate(`/player/${streamId}?title=${titleParam}&kind=${kindParam}${playParam}`);
                        }}
                        onKeyDown={(event) => {
                          if (!streamId) return;
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            const titleParam = encodeURIComponent(series.title);
                            const kindParam = encodeURIComponent(`episodio ${index + 1}`);
                            const playParam = playUrl ? `&src=${encodeURIComponent(playUrl)}` : '';
                            navigate(`/player/${streamId}?title=${titleParam}&kind=${kindParam}${playParam}`);
                          }
                        }}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="text-white text-xs md:text-sm font-semibold truncate">
                              Episódio {index + 1}
                            </h3>
                            <p className="text-white/50 text-[10px] mt-1">
                              {streamId ? 'Disponível para reprodução' : 'Indisponível'}
                            </p>
                          </div>
                          <span className="text-[10px] text-white/40">Abrir</span>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </section>
  );
}
