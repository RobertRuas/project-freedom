/**
 * Normaliza texto para busca flexível:
 * - remove espaços extras nas extremidades e no meio;
 * - transforma para minúsculas;
 * - remove acentos/diacríticos.
 */
export const normalizeSearchText = (value: string) =>
  String(value || '')
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ');
