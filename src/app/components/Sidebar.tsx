import { useEffect, useRef, useState, type ComponentType } from 'react';
import { Home, Tv, Film, Library, Search, Settings, Menu, X } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router';

type NavigationItem = {
  label: string;
  to: string;
  icon: ComponentType<{ className?: string }>;
};

const navigationItems: NavigationItem[] = [
  { label: 'Início', to: '/', icon: Home },
  { label: 'TV ao Vivo', to: '/live-tv', icon: Tv },
  { label: 'Filmes', to: '/filmes', icon: Film },
  { label: 'Séries', to: '/series', icon: Library },
];

const footerNavigationItems: NavigationItem[] = [
  { label: 'Configurações', to: '/configuracoes', icon: Settings },
];

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const desktopSearchInputRef = useRef<HTMLInputElement>(null);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);
  const isTvMode =
    typeof document !== 'undefined' && document.documentElement.classList.contains('tv-mode');

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const openSearchModal = (term: string) => {
    const normalizedTerm = term.trim();

    if (!normalizedTerm) {
      return;
    }

    navigate(`/buscar-modal?term=${encodeURIComponent(normalizedTerm)}`, { replace: true });
  };

  useEffect(() => {
    const normalizedTerm = searchTerm.trim();
    if (!normalizedTerm) {
      return;
    }

    const activeElement = document.activeElement;
    const isSidebarSearchFocused =
      activeElement === desktopSearchInputRef.current || activeElement === mobileSearchInputRef.current;

    /**
     * Autoabrir modal somente durante digitação na busca da sidebar.
     * Isso evita "reabrir" o modal quando o usuário já clicou em um resultado.
     */
    if (!isSidebarSearchFocused && location.pathname !== '/buscar-modal') {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      const expectedPath = `/buscar-modal?term=${encodeURIComponent(normalizedTerm)}`;
      const currentPath = `${location.pathname}${location.search}`;
      if (currentPath !== expectedPath) {
        navigate(expectedPath, { replace: true });
      }
    }, 220);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [searchTerm, navigate, location.pathname, location.search]);

  return (
    <>
      {/* Em TV, não exibimos o menu mobile para evitar layout quebrado. */}
      {!isTvMode && (
        <button
          type="button"
          aria-label="Abrir menu de navegação"
          onClick={() => setIsMobileMenuOpen(true)}
          className="md:hidden fixed top-4 left-4 z-50 rounded-md bg-black/80 text-white p-2 border border-white/15"
        >
          <Menu className="w-5 h-5" />
        </button>
      )}

      {/* Sidebar fixa para desktop/tablet. */}
      <aside
        className={`fixed left-0 top-0 bottom-0 w-56 lg:w-64 bg-black/90 backdrop-blur-md z-40 flex-col py-6 md:py-8 border-r border-white/10 ${
          isTvMode ? 'flex' : 'hidden md:flex'
        }`}
      >
        <nav className="flex flex-col gap-3 px-4">
          {/* Caixa de pesquisa substitui o primeiro item do menu. */}
          <form
            onSubmit={(event) => {
              event.preventDefault();
              openSearchModal(searchTerm);
            }}
            className="flex items-center gap-2 rounded-lg bg-white/5 border border-white/10 px-3 py-2"
          >
            <Search className="w-4 h-4 text-white/50" />
            <input
              ref={desktopSearchInputRef}
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Buscar..."
              className="bg-transparent text-white text-sm outline-none flex-1 placeholder:text-white/40"
            />
          </form>

          {/* Itens de navegação ativos e roteáveis. */}
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to;

            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg ${
                  isActive ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/5'
                }`}
              >
                <Icon className="w-6 h-6 md:w-7 md:h-7 flex-shrink-0" />
                <span className="text-sm md:text-base xl:text-lg font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Botões inferiores menores e visualmente mais discretos. */}
        <nav className="mt-auto flex flex-col gap-2 px-4">
          {footerNavigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to;

            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-2 px-3 py-2 rounded-md ${
                  isActive ? 'bg-black/90 text-white' : 'bg-black/70 text-white/70 hover:bg-black/90'
                }`}
              >
                <Icon className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0" />
                <span className="text-xs xl:text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Menu lateral no mobile com overlay. */}
      {!isTvMode && isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <button
            type="button"
            aria-label="Fechar menu de navegação"
            onClick={closeMobileMenu}
            className="absolute inset-0 bg-black/70"
          />

          <aside className="absolute left-0 top-0 bottom-0 w-72 max-w-[85vw] bg-black/95 border-r border-white/10 p-4 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white text-base font-semibold">Menu</h2>
              <button
                type="button"
                aria-label="Fechar menu"
                onClick={closeMobileMenu}
                className="rounded-md bg-white/10 text-white p-2"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                closeMobileMenu();
                openSearchModal(searchTerm);
              }}
              className="flex items-center gap-2 rounded-lg bg-white/5 border border-white/10 px-3 py-2 mb-4"
            >
              <Search className="w-4 h-4 text-white/50" />
              <input
                ref={mobileSearchInputRef}
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Buscar..."
                className="bg-transparent text-white text-sm outline-none flex-1 placeholder:text-white/40"
              />
            </form>

            <nav className="flex flex-col gap-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.to;

                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={closeMobileMenu}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg ${
                      isActive ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <nav className="mt-auto flex flex-col gap-2">
              {footerNavigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.to;

                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={closeMobileMenu}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md ${
                      isActive ? 'bg-black/90 text-white' : 'bg-black/70 text-white/70 hover:bg-black/90'
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="text-xs font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </aside>
        </div>
      )}
    </>
  );
}
