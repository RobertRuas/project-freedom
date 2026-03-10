import { Heart, Tv, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router';
import { ImageWithFallback } from './figma/ImageWithFallback';
import type { ListContentItem } from '../types/content';

interface ContentListProps {
  title: string;
  content: ListContentItem[];
  viewMode?: 'grid' | 'list';
}

export function ContentList({ title, content, viewMode = 'grid' }: ContentListProps) {
  const navigate = useNavigate();

  const openPlayer = (item: ListContentItem) => {
    if (!item.routeHash) {
      return;
    }

    const titleParam = encodeURIComponent(item.title);
    navigate(`/player/${item.routeHash}?title=${titleParam}&kind=canal`);
  };

  return (
    <div className="content-list-root mb-12 md:mb-16 lg:mb-20">
      <h2 className="content-list-title text-white text-xl md:text-2xl lg:text-3xl font-semibold mb-4 md:mb-6">
        {title}
      </h2>

      {viewMode === 'list' ? (
        <div className="space-y-2.5 md:space-y-3.5">
          {content.map((item) => (
            /**
             * O card inteiro é clicável para abrir o player.
             * Mantemos uma única ação primária para simplificar a experiência.
             */
            <article
              key={item.id}
              className="group bg-white/5 hover:bg-white/10 rounded-xl px-3 py-2.5 md:px-3.5 md:py-3 cursor-pointer border border-white/10 transition-colors"
              role={item.routeHash ? 'button' : undefined}
              tabIndex={item.routeHash ? 0 : undefined}
              onClick={() => openPlayer(item)}
              onKeyDown={(event) => {
                if ((event.key === 'Enter' || event.key === ' ') && item.routeHash) {
                  event.preventDefault();
                  openPlayer(item);
                }
              }}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-6 h-6 rounded-md bg-black/40 border border-white/10 flex items-center justify-center shrink-0">
                  <Tv className="w-3.5 h-3.5 text-green-500" />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <h3 className="text-white text-sm md:text-[15px] font-semibold line-clamp-1">{item.title}</h3>
                    {item.live && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-red-600/90 px-1.5 py-0.5 text-[10px] font-semibold text-white shrink-0">
                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                        AO VIVO
                      </span>
                    )}
                  </div>

                  <p className="text-white/60 text-[11px] md:text-xs line-clamp-1">{item.description}</p>

                  <div className="mt-1 flex items-center gap-2 text-white/60 text-[10px] md:text-xs">
                    {item.channel && (
                      <span className="inline-flex items-center rounded-md bg-black/40 border border-white/10 px-1.5 py-0.5">
                        {item.channel}
                      </span>
                    )}
                    {item.time && (
                      <span className="inline-flex items-center rounded-md bg-black/40 border border-white/10 px-1.5 py-0.5">
                        {item.time}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="ml-auto flex items-center gap-1">
                <button
                  type="button"
                  aria-label={`Favoritar ${item.title}`}
                  className="flex-shrink-0 text-white/60 hover:text-white p-1 rounded-md"
                  onClick={(event) => {
                    event.stopPropagation();
                  }}
                >
                  <Heart className="w-4 h-4" />
                </button>
                <ChevronRight className="w-4 h-4 text-white/35 group-hover:text-white/70 transition-colors" />
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
          {content.map((item) => (
            <article
              key={item.id}
              className="group relative rounded-lg overflow-hidden bg-gray-800 border border-white/10 cursor-pointer"
              role={item.routeHash ? 'button' : undefined}
              tabIndex={item.routeHash ? 0 : undefined}
              onClick={() => openPlayer(item)}
              onKeyDown={(event) => {
                if ((event.key === 'Enter' || event.key === ' ') && item.routeHash) {
                  event.preventDefault();
                  openPlayer(item);
                }
              }}
            >
              <div className="aspect-video">
                <ImageWithFallback
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="p-2">
                <h3 className="text-white text-xs md:text-sm font-semibold line-clamp-1">{item.title}</h3>
                <div className="mt-1 flex items-center gap-2 text-white/60 text-[10px]">
                  {item.channel && (
                    <span className="inline-flex items-center gap-1">
                      <Tv className="w-3 h-3 text-green-500" />
                      {item.channel}
                    </span>
                  )}
                  {item.time && <span>{item.time}</span>}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <button
        type="button"
        className="mt-4 md:mt-6 text-white/70 hover:text-white text-sm md:text-base font-medium"
      >
        Ver mais →
      </button>
    </div>
  );
}
