import { seriesGridContentWithHash } from './content';
import { createSessionHash } from '../utils/hash';

export interface SeriesEpisode {
  id: string;
  title: string;
  duration: string;
  playerHash: string;
  synopsis: string;
  progress: number;
  watched: boolean;
  isFavorite: boolean;
}

export interface SeriesSeason {
  id: string;
  title: string;
  episodes: SeriesEpisode[];
  synopsis: string;
}

export interface SeriesDetails {
  seriesHash: string;
  seriesTitle: string;
  subtitle?: string;
  imageUrl: string;
  synopsis: string;
  year: number;
  genre: string;
  rating: string;
  cast: string;
  isFavorite: boolean;
  seasons: SeriesSeason[];
}

const createEpisodes = (seasonNumber: number): SeriesEpisode[] => {
  const progressPattern = [100, 82, 60, 28, 0];

  return Array.from({ length: 5 }, (_, index) => {
    const episodeNumber = index + 1;
    const progress = progressPattern[index] ?? 0;
    const watched = progress >= 100;

    return {
      id: `${seasonNumber}-${episodeNumber}`,
      title: `Episódio ${episodeNumber}`,
      duration: `${40 + episodeNumber} min`,
      playerHash: createSessionHash(),
      synopsis: `Conflitos inesperados colocam os personagens em uma nova decisão crítica no episódio ${episodeNumber}.`,
      progress,
      watched,
      isFavorite: episodeNumber === 1,
    };
  });
};

export const seriesDetailsByHash: Record<string, SeriesDetails> = Object.fromEntries(
  seriesGridContentWithHash
    .filter((series): series is typeof series & { routeHash: string } => Boolean(series.routeHash))
    .map((series) => [
      series.routeHash,
      {
        seriesHash: series.routeHash,
        seriesTitle: series.title,
        subtitle: series.subtitle,
        imageUrl: series.imageUrl,
        synopsis:
          'Uma narrativa intensa com personagens complexos, reviravoltas e dilemas morais que evoluem a cada episódio.',
        year: 2025,
        genre: 'Drama / Ficção',
        rating: '16+',
        cast: 'A. Silva, M. Souza, R. Costa',
        isFavorite: true,
        seasons: [
          {
            id: 'season-1',
            title: 'Temporada 1',
            synopsis: 'Abertura da história e apresentação dos conflitos centrais.',
            episodes: createEpisodes(1),
          },
          {
            id: 'season-2',
            title: 'Temporada 2',
            synopsis: 'Escalada dramática com consequências diretas para todo o elenco.',
            episodes: createEpisodes(2),
          },
        ],
      },
    ]),
);
