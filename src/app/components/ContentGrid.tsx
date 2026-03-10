import { Heart, Tv, Film, Library, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router';
import { ImageWithFallback } from './figma/ImageWithFallback';
import type { ContentType, GridContentItem } from '../types/content';

interface ContentGridProps {
  title: string;
  content: GridContentItem[];
  viewMode?: 'grid' | 'list';
}

export function ContentGrid({ title, content, viewMode = 'grid' }: ContentGridProps) {
  const navigate = useNavigate();

  const openContent = (item: GridContentItem) => {
    if (!item.routeHash) {
      return;
    }

    if (item.type === 'series') {
      navigate(`/series/${item.routeHash}`);
      return;
    }

    if (item.type === 'movie' || item.type === 'tv') {
      const titleParam = encodeURIComponent(item.title);
      const kindParam = item.type === 'tv' ? 'canal' : 'filme';
      navigate(`/player/${item.routeHash}?title=${titleParam}&kind=${kindParam}`);
    }
  };

  /**
   * Resolve o ícone de acordo com o tipo de conteúdo.
   * Mantido em função separada para facilitar inclusão de novos tipos no futuro.
   */
  const getTypeIcon = (type?: ContentType) => {
    switch (type) {
      case 'tv':
        return <Tv className="w-3 h-3 md:w-4 md:h-4 text-green-500" />;
      case 'movie':
        return <Film className="w-3 h-3 md:w-4 md:h-4 text-white" />;
      case 'series':
        return <Library className="w-3 h-3 md:w-4 md:h-4 text-white" />;
      default:
        return null;
    }
  };

  return (
    <div className="content-grid-root mb-12 md:mb-16 lg:mb-20">
      <h2 className="content-grid-title text-white text-xl md:text-2xl lg:text-3xl font-semibold mb-4 md:mb-6 lg:mb-8">
        {title}
      </h2>

      {viewMode === 'grid' ? (
        <div className="content-grid-items grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4 lg:gap-6">
          {content.map((item) => (
            // Regras de navegação padronizadas:
            // filme/canal -> player modal; série -> página de temporadas/episódios.
            <article
              key={item.id}
              className={`group relative ${item.routeHash ? 'cursor-pointer' : ''}`}
              role={item.routeHash ? 'button' : undefined}
              tabIndex={item.routeHash ? 0 : undefined}
              onClick={() => openContent(item)}
              onKeyDown={(event) => {
                if ((event.key === 'Enter' || event.key === ' ') && item.routeHash) {
                  event.preventDefault();
                  openContent(item);
                }
              }}
            >
              <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-gray-800">
                <ImageWithFallback
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                
                <div className="absolute top-2 left-2 bg-black/50 p-1.5 rounded-full backdrop-blur-sm">
                  {getTypeIcon(item.type)}
                </div>

                <button
                  type="button"
                  aria-label={`Favoritar ${item.title}`}
                  className="absolute top-2 right-2 bg-black/50 p-1.5 rounded-full backdrop-blur-sm z-10"
                  onClick={(event) => {
                    event.stopPropagation();
                  }}
                >
                  <Heart className="w-3 h-3 md:w-4 md:h-4 text-white" />
                </button>

                <div className="absolute bottom-0 left-0 right-0 bg-black/30 backdrop-blur-sm p-2">
                  <h3 className="text-white text-xs md:text-sm font-medium line-clamp-2">
                    {item.title}
                  </h3>
                  {item.subtitle && (
                    <p className="text-white/70 text-[10px] md:text-xs mt-0.5">
                      {item.subtitle}
                    </p>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="space-y-2.5 md:space-y-3.5">
          {content.map((item) => (
            <article
              key={item.id}
              className="group rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-3 py-2.5 md:px-3.5 md:py-3 flex items-center gap-2.5 cursor-pointer"
              role={item.routeHash ? 'button' : undefined}
              tabIndex={item.routeHash ? 0 : undefined}
              onClick={() => openContent(item)}
              onKeyDown={(event) => {
                if ((event.key === 'Enter' || event.key === ' ') && item.routeHash) {
                  event.preventDefault();
                  openContent(item);
                }
              }}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-md bg-black/40 border border-white/10 flex items-center justify-center shrink-0">
                    {getTypeIcon(item.type)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-white text-sm md:text-[15px] font-semibold line-clamp-1">{item.title}</h3>
                    {item.subtitle && (
                      <p className="text-white/60 text-[11px] md:text-xs line-clamp-1">{item.subtitle}</p>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="button"
                aria-label={`Favoritar ${item.title}`}
                className="text-white/55 hover:text-white p-1 rounded-md"
                onClick={(event) => {
                  event.stopPropagation();
                }}
              >
                <Heart className="w-4 h-4" />
              </button>

              <ChevronRight className="w-4 h-4 text-white/35 group-hover:text-white/65" />
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
