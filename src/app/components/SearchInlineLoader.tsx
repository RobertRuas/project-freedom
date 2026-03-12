import { Loader2 } from 'lucide-react';

interface SearchInlineLoaderProps {
  label?: string;
}

/**
 * Loader compacto para feedback imediato durante a busca.
 * Mantemos este componente separado para reutilizar em múltiplas telas.
 */
export function SearchInlineLoader({ label = 'Pesquisando...' }: SearchInlineLoaderProps) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs md:text-sm text-white/75">
      <Loader2 className="w-4 h-4 animate-spin" />
      <span>{label}</span>
    </div>
  );
}
