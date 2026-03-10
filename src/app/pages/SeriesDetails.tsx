import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { ArrowLeft, Play, ChevronDown, ChevronRight, CheckCircle2, Heart } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { seriesDetailsByHash, type SeriesSeason } from '../data/series-details';

const getSeasonProgress = (season: SeriesSeason): number => {
  if (!season.episodes.length) {
    return 0;
  }

  const total = season.episodes.reduce((sum, episode) => sum + episode.progress, 0);
  return Math.round(total / season.episodes.length);
};

export function SeriesDetails() {
  const { hash } = useParams();
  const navigate = useNavigate();

  const details = hash ? seriesDetailsByHash[hash] : undefined;

  const [openSeasonId, setOpenSeasonId] = useState<string | null>(details?.seasons[0]?.id ?? null);

  const totalProgress = useMemo(() => {
    if (!details) {
      return 0;
    }

    const seasons = details.seasons;
    if (!seasons.length) {
      return 0;
    }

    const sum = seasons.reduce((acc, season) => acc + getSeasonProgress(season), 0);
    return Math.round(sum / seasons.length);
  }, [details]);

  if (!details) {
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
          <p className="text-white/70 text-sm md:text-base">
            Esse hash é dinâmico e muda a cada recarga completa da aplicação.
          </p>
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

      <article className="rounded-xl border border-white/10 bg-white/5 p-4 md:p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-4 md:gap-6">
          <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-gray-800 max-w-[220px]">
            <ImageWithFallback src={details.imageUrl} alt={details.seriesTitle} className="w-full h-full object-cover" />
          </div>

          <div>
            <div className="flex items-start justify-between gap-3 mb-2">
              <h1 className="text-white text-2xl md:text-4xl font-semibold">{details.seriesTitle}</h1>
              <button type="button" aria-label="Favoritar série" className="text-white/70 hover:text-white">
                <Heart className={`w-5 h-5 ${details.isFavorite ? 'fill-current text-red-400' : ''}`} />
              </button>
            </div>

            <p className="text-white/70 text-sm md:text-base mb-2">{details.subtitle ?? 'Série disponível'}</p>
            <p className="text-white/65 text-sm md:text-base mb-4">{details.synopsis}</p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              <div className="rounded-lg bg-black/40 border border-white/10 p-2.5">
                <p className="text-white/50 text-[11px] mb-1">Ano</p>
                <p className="text-white text-sm">{details.year}</p>
              </div>
              <div className="rounded-lg bg-black/40 border border-white/10 p-2.5">
                <p className="text-white/50 text-[11px] mb-1">Gênero</p>
                <p className="text-white text-sm">{details.genre}</p>
              </div>
              <div className="rounded-lg bg-black/40 border border-white/10 p-2.5">
                <p className="text-white/50 text-[11px] mb-1">Classificação</p>
                <p className="text-white text-sm">{details.rating}</p>
              </div>
              <div className="rounded-lg bg-black/40 border border-white/10 p-2.5">
                <p className="text-white/50 text-[11px] mb-1">Elenco</p>
                <p className="text-white text-xs">{details.cast}</p>
              </div>
            </div>

            <div className="rounded-lg bg-black/40 border border-white/10 p-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-white text-sm">Progresso total da série</p>
                <div className="flex items-center gap-2">
                  {totalProgress === 100 && <CheckCircle2 className="w-4 h-4 text-green-400" />}
                  <span className="text-white/70 text-xs">{totalProgress}%</span>
                </div>
              </div>
              <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full bg-emerald-700/85" style={{ width: `${totalProgress}%` }} />
              </div>
            </div>
          </div>
        </div>
      </article>

      <div className="space-y-4">
        {details.seasons.map((season) => {
          const isOpen = openSeasonId === season.id;
          const seasonProgress = getSeasonProgress(season);

          return (
            <section key={season.id} className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
              <button
                type="button"
                onClick={() => setOpenSeasonId((current) => (current === season.id ? null : season.id))}
                className="w-full text-left p-4 md:p-5 hover:bg-white/5"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <h2 className="text-white text-lg md:text-xl font-semibold">{season.title}</h2>
                    <p className="text-white/65 text-sm mt-1">{season.synopsis}</p>
                  </div>

                  <div className="flex items-center gap-2 text-white/70 text-xs pt-1">
                    {seasonProgress === 100 && <CheckCircle2 className="w-4 h-4 text-green-400" />}
                    <span>{seasonProgress}%</span>
                    {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </div>
                </div>

                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full bg-white" style={{ width: `${seasonProgress}%` }} />
                </div>
              </button>

              {isOpen && (
                <div className="px-4 md:px-5 pb-4 md:pb-5 space-y-2.5">
                  {season.episodes.map((episode, index) => (
                    <article key={episode.id} className="rounded-lg border border-white/10 bg-black/30 p-2.5 md:p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 mb-1">
                            <h3 className="text-white text-xs md:text-sm font-semibold truncate">{`Episódio ${index + 1}`}</h3>
                            {episode.watched && <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />}
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-white/45 text-[10px]">{episode.duration}</span>
                            </div>
                            <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                              <div className="h-full bg-zinc-600/80" style={{ width: `${episode.progress}%` }} />
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            const title = encodeURIComponent(`${details.seriesTitle} - ${episode.title}`);
                            navigate(`/player/${episode.playerHash}?title=${title}&kind=episodio`);
                          }}
                          className="inline-flex items-center gap-1.5 rounded-md bg-white text-black px-2.5 py-1 text-[11px] md:text-xs font-semibold self-start"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          Assistir
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </section>
  );
}
