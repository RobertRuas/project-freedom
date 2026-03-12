import { Outlet } from 'react-router';
import { Sidebar } from './components/Sidebar';
import { PlayerOverlay } from './components/PlayerOverlay';

export function Layout() {
  /**
   * Em modo TV, forçamos espaçamentos de desktop para evitar
   * que o layout caia em regras de mobile por largura lógica da TV.
   */
  const isTvMode =
    typeof document !== 'undefined' && document.documentElement.classList.contains('tv-mode');

  return (
    // Layout base aplicado a todas as rotas filhas.
    <div className="min-h-screen app-shell bg-gradient-to-br from-gray-950 via-gray-900 to-black">
      <Sidebar />
      
      {/* O Outlet renderiza a página correspondente à rota ativa. */}
      <main
        className={`app-main ${
          isTvMode
            ? 'ml-56 lg:ml-64 pt-8 p-8 lg:p-12'
            : 'ml-0 md:ml-56 lg:ml-64 pt-16 md:pt-8 p-4 sm:p-6 md:p-8 lg:p-12'
        }`}
      >
        <Outlet />
      </main>

      {/* Overlay global do player para manter a rota pai montada. */}
      <PlayerOverlay />
    </div>
  );
}
