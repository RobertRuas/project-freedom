/**
 * Gera hash opaco por sessão para uso em rotas dinâmicas.
 * O resultado muda a cada recarga completa da aplicação.
 */
export const createSessionHash = (): string => {
  const randomPart = Math.random().toString(36).slice(2, 12);
  const timePart = Date.now().toString(36).slice(-4);

  return `${randomPart}${timePart}`;
};
