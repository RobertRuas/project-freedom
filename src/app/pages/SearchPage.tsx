import { Navigate, useSearchParams } from 'react-router';

/**
 * Rota legada de busca.
 * Redireciona para o modal para evitar duplicação de experiência.
 */
export function SearchPage() {
  const [searchParams] = useSearchParams();
  const term = String(searchParams.get('term') || '').trim();
  const target = term
    ? `/buscar-modal?term=${encodeURIComponent(term)}`
    : '/buscar-modal';

  return <Navigate to={target} replace />;
}
