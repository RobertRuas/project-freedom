import type { LucideIcon } from 'lucide-react';

export interface FeatureGridItem {
  id: string;
  title: string;
  description: string;
  actionLabel: string;
  icon: LucideIcon;
}

interface FeatureGridProps {
  title: string;
  subtitle?: string;
  items: FeatureGridItem[];
}

/**
 * Grade reutilizável para páginas funcionais.
 * Mantém o mesmo padrão visual entre configurações, perfil e demais áreas.
 */
export function FeatureGrid({ title, subtitle, items }: FeatureGridProps) {
  return (
    <section className="mb-12 md:mb-16 lg:mb-20">
      <h1 className="text-white text-2xl md:text-3xl lg:text-4xl font-bold mb-2">{title}</h1>
      {subtitle && <p className="text-white/70 text-sm md:text-base mb-6 md:mb-8">{subtitle}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <article
              key={item.id}
              className="rounded-xl border border-white/10 bg-white/5 p-4 md:p-5 hover:bg-white/10 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-white" />
              </div>

              <h2 className="text-white text-lg md:text-xl font-semibold mb-2">{item.title}</h2>
              <p className="text-white/70 text-sm md:text-base mb-4 line-clamp-3">{item.description}</p>

              <button
                type="button"
                aria-label={`${item.actionLabel} em ${item.title}`}
                className="inline-flex items-center justify-center rounded-md bg-white text-black px-3 py-2 text-sm font-semibold"
              >
                {item.actionLabel}
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}
