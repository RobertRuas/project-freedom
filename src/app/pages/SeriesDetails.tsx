import { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router';
import { ArrowLeft, ChevronDown, ChevronRight, Heart } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { CatalogLoader } from '../components/CatalogLoader';
import { Progress } from '../components/ui/progress';
import { useXtreamCatalog, useXtreamSeriesDetail } from '../api';
import { buildPlayUrl } from '../api/services/xtreamMapper';
import { buildPlayerModalSearch } from '../utils/playerModalSearch';
import { savePlayerQueue } from '../utils/playerQueue';
import { getProgressByContent } from '../utils/playbackState';

export function SeriesDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading: catalogLoading, error: catalogError, seriesGrid } = useXtreamCatalog();
  const series = seriesGrid.find((item) => item.routeHash === id);
  const { loading, error, detail } = useXtreamSeriesDetail(id);
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

  /**
   * Calcula o progresso agregado por temporada com base no cache local.
   * Também serve para alimentar o progresso de cada episódio.
   */
  const seasonProgressByKey = useMemo(() => {
    const result: Record<string, { average: number; watched: number; total: number }> = {};

    seasons.forEach((season) => {
      const episodes = Array.isArray(season.episodes) ? season.episodes : [];
      const values = episodes
        .map((episode) => {
          const episodeId = episode.stream_id || episode.id || episode.episode_id;
          if (!episodeId) return 0;
          const row = getProgressByContent('series', String(episodeId));
          return Math.max(0, Math.min(100, Number(row?.progressPercent || 0)));
        });

      const total = values.length;
      const watched = values.filter((value) => value >= 95).length;
      const average = total > 0
        ? Math.round(values.reduce((acc, value) => acc + value, 0) / total)
        : 0;

      result[String(season.season)] = { average, watched, total };
    });

    return result;
  }, [seasons, location.search]);

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
          const seasonProgress = seasonProgressByKey[String(season.season)] || { average: 0, watched: 0, total: 0 };

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
                      {seasonProgress.total} episódios • {seasonProgress.watched} concluídos
                    </p>
                    <div className="mt-2 max-w-xs">
                      <Progress value={seasonProgress.average} />
                      <p className="text-white/45 text-[10px] mt-1">
                        Progresso total: {seasonProgress.average}%
                      </p>
                    </div>
                  </div>
                  {isOpen ? <ChevronDown className="w-4 h-4 text-white/70" /> : <ChevronRight className="w-4 h-4 text-white/70" />}
                </div>
              </button>

              {isOpen && (
                <div className="px-4 md:px-5 pb-4 md:pb-5 space-y-2.5">
                  {(Array.isArray(season.episodes) ? season.episodes : []).map((episode, index) => {
                    // No Xtream, para episódios de série o campo `id` costuma ser o mais confiável.
                    const streamId = episode.id || episode.stream_id || episode.episode_id;
                    const episodeProgress = streamId
                      ? Math.max(0, Math.min(100, Number(getProgressByContent('series', String(streamId))?.progressPercent || 0)))
                      : 0;
                    const extension =
                      episode.container_extension ||
                      episode.info?.container_extension ||
                      episode.episode_info?.container_extension ||
                      'mp4';
                    const playUrl = streamId ? buildPlayUrl('series', String(streamId), String(extension)) : '';
                    const seasonEpisodes = Array.isArray(season.episodes) ? season.episodes : [];

                    const openEpisodeQueue = () => {
                      if (!streamId || !playUrl) return;

                      const queueItems = seasonEpisodes
                        .slice(index)
                        .map((row, rowOffset) => {
                          const queueStreamId = row.id || row.stream_id || row.episode_id;
                          if (!queueStreamId) return null;
                          const queueExtension =
                            row.container_extension ||
                            row.info?.container_extension ||
                            row.episode_info?.container_extension ||
                            'mp4';
                          const queuePlayUrl = buildPlayUrl('series', String(queueStreamId), String(queueExtension));
                          return {
                            contentId: String(queueStreamId),
                            title: `${series.title} - Episódio ${index + rowOffset + 1}`,
                            kind: `episodio ${index + rowOffset + 1}`,
                            src: queuePlayUrl,
                            streamType: 'series' as const,
                            imageUrl: series.imageUrl
                          };
                        })
                        .filter((item): item is NonNullable<typeof item> => Boolean(item && item.src));

                      const queueKey = savePlayerQueue(queueItems);
                      const nextSearch = buildPlayerModalSearch(location.search, {
                        contentId: String(streamId),
                        title: `${series.title} - Episódio ${index + 1}`,
                        kind: `episodio ${index + 1}`,
                        src: playUrl,
                        streamType: 'series',
                        imageUrl: series.imageUrl,
                        queueKey,
                        queueIndex: 0
                      });

                      navigate({
                        pathname: location.pathname,
                        search: `?${nextSearch}`
                      });
                    };

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
                          openEpisodeQueue();
                        }}
                        onKeyDown={(event) => {
                          if (!streamId) return;
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            openEpisodeQueue();
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
                            <div className="mt-2">
                              <Progress value={episodeProgress} />
                              <p className="text-white/45 text-[10px] mt-1">
                                {episodeProgress}% assistido
                              </p>
                            </div>
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
