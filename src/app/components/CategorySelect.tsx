import { Filter } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from './ui/select';

/**
 * Tipagem local para as categorias exibidas no seletor.
 */
export interface CategoryOption {
  id: string;
  name: string;
}

interface CategorySelectProps {
  label: string;
  value: string;
  options: CategoryOption[];
  onChange: (value: string) => void;
  /**
   * Mensagem opcional abaixo do seletor.
   * Útil para orientar o usuário sobre a regra de "Ver mais".
   */
  helperText?: string;
}

/**
 * Seletor de categoria padronizado para todos os catálogos.
 * O objetivo é manter a UI consistente e mais elegante que um <select> nativo.
 */
export function CategorySelect({ label, value, options, onChange, helperText }: CategorySelectProps) {
  return (
    <section className="mb-4 md:mb-6">
      <p className="text-white/60 text-xs uppercase tracking-[0.25em]">{label}</p>

      <div className="mt-2 flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
        <div className="flex-1 max-w-full md:max-w-sm">
          <Select value={value} onValueChange={onChange}>
            <SelectTrigger className="bg-white/5 border-white/15 text-white hover:bg-white/10">
              <SelectValue placeholder="Selecione uma categoria" />
            </SelectTrigger>
            <SelectContent className="bg-[#0d0d0d] border-white/10 text-white">
              <SelectItem value="all">Todas as categorias</SelectItem>
              {options.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-3 py-1 text-[11px] text-white/60">
          <Filter className="w-3.5 h-3.5" />
          <span>{helperText || 'Selecione uma categoria para liberar mais itens.'}</span>
        </div>
      </div>
    </section>
  );
}
