import type { GridContentItem, ListContentItem } from '../types/content';
import { createSessionHash } from '../utils/hash';

/**
 * Gera URL do Picsum com seed estável para não trocar imagem a cada render.
 * Exemplo: https://picsum.photos/seed/meu-seed/480/720
 */
const createPicsumUrl = (seed: string, width: number, height: number): string =>
  `https://picsum.photos/seed/${encodeURIComponent(seed)}/${width}/${height}`;

/**
 * Cria itens de grade com imagem local e tipo explícito.
 * Mantém o arquivo enxuto e com padrão único para devs juniores.
 */
const createGridItems = (
  items: Array<{ id: string; title: string; subtitle?: string }>,
  type: NonNullable<GridContentItem['type']>,
): GridContentItem[] => {
  return items.map((item) => ({
    ...item,
    type,
    // Poster vertical (proporção 2:3) para cards de grade.
    imageUrl: createPicsumUrl(`${type}-${item.id}`, 480, 720),
  }));
};

/**
 * Cria itens de lista de TV com thumbnail local.
 */
const createListItems = (
  items: Array<{
    id: string;
    title: string;
    description: string;
    channel: string;
    time: string;
    live: boolean;
  }>,
): ListContentItem[] => {
  return items.map((item) => ({
    ...item,
    // Thumbnail horizontal para listas de TV ao vivo.
    imageUrl: createPicsumUrl(`channel-${item.id}`, 960, 540),
  }));
};

/**
 * Dados estáticos da Home e das páginas em grade.
 * Todos os posters são locais para evitar dependência externa em Smart TVs.
 */
export const liveTvGridContent: GridContentItem[] = createGridItems(
  [
    { id: '1', title: 'Jornal Nacional', subtitle: 'Ao Vivo' },
    { id: '2', title: 'Show de Culinária', subtitle: 'Ao Vivo' },
    { id: '3', title: 'Talk Show Noturno', subtitle: 'Ao Vivo' },
    { id: '4', title: 'Game Show', subtitle: 'Ao Vivo' },
    { id: '5', title: 'Reality Show', subtitle: 'Ao Vivo' },
    { id: '6', title: 'Esportes ao Vivo', subtitle: 'Ao Vivo' },
    { id: '7', title: 'Documentário Natureza', subtitle: 'Ao Vivo' },
    { id: '8', title: 'Show de Comédia', subtitle: 'Ao Vivo' },
    { id: '9', title: 'Música ao Vivo', subtitle: 'Ao Vivo' },
    { id: '10', title: 'Entrevistas', subtitle: 'Ao Vivo' },
  ],
  'tv',
);

const baseMoviesGridContent: GridContentItem[] = createGridItems(
  [
    { id: '11', title: 'Explosão Total', subtitle: '2024 • Ação' },
    { id: '12', title: 'Amor ao Pôr do Sol', subtitle: '2024 • Romance' },
    { id: '13', title: 'Suspense Sombrio', subtitle: '2024 • Suspense' },
    { id: '14', title: 'Futuro Distante', subtitle: '2023 • Ficção' },
    { id: '15', title: 'Terror Noturno', subtitle: '2024 • Terror' },
    { id: '16', title: 'Montanhas Extremas', subtitle: '2023 • Aventura' },
    { id: '17', title: 'Profundezas Azuis', subtitle: '2024 • Drama' },
    { id: '18', title: 'Galáxia Infinita', subtitle: '2023 • Sci-Fi' },
    { id: '19', title: 'Cidade Eterna', subtitle: '2024 • Drama' },
    { id: '20', title: 'Floresta Mágica', subtitle: '2024 • Fantasia' },
  ],
  'movie',
);

/**
 * Filmes recebem hash dinâmico para a rota /filmes/{hash}.
 * O hash é recriado sempre que a aplicação inicia.
 */
export const moviesGridContent: GridContentItem[] = baseMoviesGridContent.map((movie) => ({
  ...movie,
  routeHash: createSessionHash(),
}));

export const seriesGridContent: GridContentItem[] = createGridItems(
  [
    { id: '21', title: 'Mundos Paralelos', subtitle: '3 Temporadas' },
    { id: '22', title: 'Detetives Noturnos', subtitle: '2 Temporadas' },
    { id: '23', title: 'Vida Selvagem', subtitle: '4 Temporadas' },
    { id: '24', title: 'Famílias Modernas', subtitle: '5 Temporadas' },
    { id: '25', title: 'Expedição Espacial', subtitle: '2 Temporadas' },
    { id: '26', title: 'Histórias Urbanas', subtitle: '3 Temporadas' },
    { id: '27', title: 'Corações Partidos', subtitle: '4 Temporadas' },
    { id: '28', title: 'Guerreiros do Tempo', subtitle: '2 Temporadas' },
    { id: '29', title: 'Reinos Encantados', subtitle: '3 Temporadas' },
    { id: '30', title: 'Sombras da Noite', subtitle: '1 Temporada' },
  ],
  'series',
);

/**
 * Dados estáticos da página TV ao Vivo.
 * Thumbnails locais eliminam falhas de renderização por rede externa.
 */
export const newsListContent: ListContentItem[] = createListItems([
  {
    id: '1',
    title: 'Jornal Nacional',
    description:
      'O principal telejornal do Brasil traz as notícias mais importantes do dia com credibilidade e imparcialidade.',
    channel: 'Globo',
    time: '20:30',
    live: true,
  },
  {
    id: '2',
    title: 'CNN Notícias',
    description:
      'Acompanhe ao vivo as últimas notícias do Brasil e do mundo com análises exclusivas e correspondentes internacionais.',
    channel: 'CNN Brasil',
    time: '19:00',
    live: true,
  },
  {
    id: '3',
    title: 'Band News',
    description:
      'Notícias 24 horas com cobertura completa dos principais acontecimentos nacionais e internacionais.',
    channel: 'Band',
    time: '21:00',
    live: true,
  },
  {
    id: '4',
    title: 'Fantástico',
    description:
      'O show da vida com grandes reportagens, entretenimento e histórias que emocionam o Brasil.',
    channel: 'Globo',
    time: 'Domingo 20:30',
    live: false,
  },
]);

export const entertainmentListContent: ListContentItem[] = createListItems([
  {
    id: '5',
    title: 'MasterChef Brasil',
    description:
      'O maior programa de culinária da TV apresenta desafios incríveis e pratos surpreendentes preparados pelos participantes.',
    channel: 'Band',
    time: '22:30',
    live: true,
  },
  {
    id: '6',
    title: 'The Voice Brasil',
    description:
      'O reality show musical mais emocionante da televisão brasileira com apresentações ao vivo de tirar o fôlego.',
    channel: 'Globo',
    time: '23:00',
    live: true,
  },
  {
    id: '7',
    title: 'Programa do Porchat',
    description:
      'Talk show irreverente com entrevistas descontraídas, quadros divertidos e muita interação com o público.',
    channel: 'Record',
    time: '22:00',
    live: false,
  },
  {
    id: '8',
    title: 'Big Brother Brasil',
    description:
      'Acompanhe 24 horas por dia a maior competição de reality show do Brasil com participantes em tempo real.',
    channel: 'Globo',
    time: '24h',
    live: true,
  },
]);

export const sportsListContent: ListContentItem[] = createListItems([
  {
    id: '9',
    title: 'Campeonato Brasileiro',
    description:
      'Transmissão ao vivo do Brasileirão com narração emocionante, comentários técnicos e replays em alta definição.',
    channel: 'Premiere',
    time: '16:00',
    live: true,
  },
  {
    id: '10',
    title: 'NBA ao Vivo',
    description:
      'Os melhores jogos da NBA com transmissão ao vivo, estatísticas em tempo real e análises dos especialistas.',
    channel: 'ESPN',
    time: '21:30',
    live: true,
  },
  {
    id: '11',
    title: 'Esporte Espetacular',
    description:
      'As principais notícias do esporte, entrevistas exclusivas e reportagens especiais sobre os atletas brasileiros.',
    channel: 'Globo',
    time: 'Domingo 10:00',
    live: false,
  },
  {
    id: '12',
    title: 'UFC Fight Night',
    description:
      'Lutas emocionantes do UFC com os melhores lutadores do mundo em combates transmitidos ao vivo.',
    channel: 'Combate',
    time: '23:00',
    live: true,
  },
]);

/**
 * Variações com hash dinâmico para rotas e player.
 * O hash é renovado a cada recarga completa da aplicação.
 */
export const liveTvGridContentWithHash: GridContentItem[] = liveTvGridContent.map((item) => ({
  ...item,
  routeHash: createSessionHash(),
}));

export const seriesGridContentWithHash: GridContentItem[] = seriesGridContent.map((item) => ({
  ...item,
  routeHash: createSessionHash(),
}));

export const newsListContentWithHash: ListContentItem[] = newsListContent.map((item) => ({
  ...item,
  routeHash: createSessionHash(),
}));

export const entertainmentListContentWithHash: ListContentItem[] = entertainmentListContent.map((item) => ({
  ...item,
  routeHash: createSessionHash(),
}));

export const sportsListContentWithHash: ListContentItem[] = sportsListContent.map((item) => ({
  ...item,
  routeHash: createSessionHash(),
}));

/**
 * Conjunto unificado para páginas que precisam pesquisar todo o catálogo.
 */
export const allGridContent: GridContentItem[] = [
  ...liveTvGridContentWithHash,
  ...moviesGridContent,
  ...seriesGridContentWithHash,
];
