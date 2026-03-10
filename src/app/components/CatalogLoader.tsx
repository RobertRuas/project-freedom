import { Skeleton } from './ui/skeleton';

interface CatalogLoaderProps {
  /**
   * Define se o loader deve parecer grade ou lista.
   * Usamos o mesmo valor de viewMode para simplificar.
   */
  variant?: 'grid' | 'list';
}

/**
 * Loader padrão para catálogos.
 * Mantém o layout previsível enquanto os dados chegam do Xtream.
 */
export function CatalogLoader({ variant = 'grid' }: CatalogLoaderProps) {
  if (variant === 'list') {
    return (
      <div className="space-y-2.5 md:space-y-3.5">
        {Array.from({ length: 6 }).map((_, index) => (
          // Bloco simulando card de lista compacto.
          <div
            key={`list-skeleton-${index}`}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 md:px-3.5 md:py-3 flex items-center gap-3"
          >
            <Skeleton className="w-6 h-6 rounded-md bg-white/10" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-2/3 bg-white/10" />
              <Skeleton className="h-2 w-1/3 bg-white/10" />
            </div>
            <Skeleton className="h-4 w-4 rounded bg-white/10" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4 lg:gap-6">
      {Array.from({ length: 10 }).map((_, index) => (
        // Bloco simulando card de grade com pôster.
        <div key={`grid-skeleton-${index}`} className="space-y-2">
          <Skeleton className="aspect-[2/3] rounded-lg bg-white/10" />
          <Skeleton className="h-3 w-3/4 bg-white/10" />
          <Skeleton className="h-2 w-1/2 bg-white/10" />
        </div>
      ))}
    </div>
  );
}
