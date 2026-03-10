import { createBrowserRouter } from 'react-router';
import { Home } from './pages/Home';
import { LiveTV } from './pages/LiveTV';
import { Layout } from './Layout';
import { Movies } from './pages/Movies';
import { Series } from './pages/Series';
import { SearchPage } from './pages/SearchPage';
import { SettingsPage } from './pages/SettingsPage';
import { ProfilePage } from './pages/ProfilePage';
import { MovieDetails } from './pages/MovieDetails';
import { SeriesDetails } from './pages/SeriesDetails';
import { PlayerModal } from './pages/PlayerModal';
import { SearchModal } from './pages/SearchModal';

// Mapa central de rotas da aplicação.
// Novas páginas devem ser registradas aqui como filhas do Layout.
export const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, Component: Home },
      { path: 'live-tv', Component: LiveTV },
      { path: 'filmes', Component: Movies },
      { path: 'filmes/:hash', Component: MovieDetails },
      { path: 'series', Component: Series },
      { path: 'series/:hash', Component: SeriesDetails },
      { path: 'buscar', Component: SearchPage },
      { path: 'buscar-modal', Component: SearchModal },
      { path: 'configuracoes', Component: SettingsPage },
      { path: 'perfil', Component: ProfilePage },
      { path: 'player/:hash', Component: PlayerModal },
    ],
  },
]);
