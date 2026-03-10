import { Link, useParams } from 'react-router';
import { ArrowLeft, Play, Heart } from 'lucide-react';
import { moviesGridContent } from '../data/content';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

export function MovieDetails() {
  const { hash } = useParams();

  const movie = moviesGridContent.find((item) => item.routeHash === hash);

  if (!movie) {
    return (
      <section className="max-w-4xl mx-auto">
        <Link
          to="/filmes"
          className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm md:text-base mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para Filmes
        </Link>

        <div className="rounded-xl border border-white/10 bg-white/5 p-6 md:p-8">
          <h1 className="text-white text-2xl md:text-3xl font-semibold mb-2">Filme não encontrado</h1>
          <p className="text-white/70 text-sm md:text-base">
            Esse hash é dinâmico e muda a cada vez que a aplicação é carregada.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-5xl mx-auto">
      <Link
        to="/filmes"
        className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm md:text-base mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar para Filmes
      </Link>

      <article className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-6 md:gap-8 rounded-xl border border-white/10 bg-white/5 p-4 md:p-6">
        <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-gray-800">
          <ImageWithFallback src={movie.imageUrl} alt={movie.title} className="w-full h-full object-cover" />
        </div>

        <div className="flex flex-col justify-between">
          <div>
            <h1 className="text-white text-2xl md:text-4xl font-semibold mb-2">{movie.title}</h1>
            <p className="text-white/70 text-sm md:text-base mb-6">{movie.subtitle ?? 'Filme disponível'}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-lg bg-black/40 border border-white/10 p-3">
                <p className="text-white/60 text-xs mb-1">Rota dinâmica</p>
                <p className="text-white text-sm break-all">/filmes/{movie.routeHash}</p>
              </div>
              <div className="rounded-lg bg-black/40 border border-white/10 p-3">
                <p className="text-white/60 text-xs mb-1">Identificador interno</p>
                <p className="text-white text-sm">{movie.id}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mt-6">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-md bg-white text-black px-4 py-2 text-sm font-semibold"
            >
              <Play className="w-4 h-4 fill-current" />
              Assistir
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-md bg-black/70 text-white px-4 py-2 text-sm border border-white/10"
            >
              <Heart className="w-4 h-4" />
              Favoritar
            </button>
          </div>
        </div>
      </article>
    </section>
  );
}
