import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useCart } from '../../context/CartContext.jsx';
import { useCurrency } from '../../context/CurrencyContext.jsx';
import CartDrawer from '../cart/CartDrawer.jsx';
import CurrencySelector from '../ui/CurrencySelector.jsx';

const CATEGORIES = [
  { name: 'ONE PIECE', slug: 'one-piece', color: 'hover:text-rose-500', activeText: 'text-rose-500', activeBorder: 'border-rose-500' },
  { name: 'POKÉMON', slug: 'pokemon', color: 'hover:text-yellow-500', activeText: 'text-yellow-500', activeBorder: 'border-yellow-500' },
  { name: 'DRAGON BALL', slug: 'dragon-ball', color: 'hover:text-orange-500', activeText: 'text-orange-500', activeBorder: 'border-orange-500' },
  { name: 'LORCANA', slug: 'lorcana', color: 'hover:text-purple-500', activeText: 'text-purple-500', activeBorder: 'border-purple-500' },
  { name: 'DEPORTES', slug: 'deportes', color: 'hover:text-blue-500', activeText: 'text-blue-500', activeBorder: 'border-blue-500' },
  { name: 'ACCESORIOS', slug: 'accesorios', color: 'hover:text-green-500', activeText: 'text-green-500', activeBorder: 'border-green-500' },
];

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const { totalItems } = useCart();
  const [cartOpen, setCartOpen] = useState(false);
  const { currency, language, setCurrency, setLanguage } = useCurrency();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Listen for global event to open cart (fired after addToCart)
  useEffect(() => {
    const onOpen = () => setCartOpen(true);
    window.addEventListener('open-cart', onOpen);
    return () => window.removeEventListener('open-cart', onOpen);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 shadow-sm">
        <Link to="/" className="absolute left-0 pl-4 top-1/2 transform -translate-y-1/2 flex items-center z-50">
          <span className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">
            The New <span className="text-primary-600">Store</span>
          </span>
        </Link>

        {/* Actions at right edge of viewport */}
        <div className="absolute right-0 pr-4 top-1/2 transform -translate-y-1/2 flex items-center gap-2 z-50">
          {/* Tema fijo: nocturno (sin control de usuario) */}

          {/* Currency / Language selector */}
          <div className="relative">
            <CurrencySelector />
          </div>

          {/* Cart */}
          <button
            onClick={() => setCartOpen(true)}
            className="relative p-2 rounded-lg text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {totalItems > 99 ? '99+' : totalItems}
              </span>
            )}
          </button>

          {/* Profile icon (visible when logged in) */}
          {user && (
            <Link to="/perfil" className="ml-2 p-2 rounded-lg text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors" aria-label="Mi perfil">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </Link>
          )}

          {/* Auth */}
          {user ? (
            <div className="hidden md:flex items-center gap-2">
              {isAdmin && (
                <Link
                  to="/admin"
                  className="text-sm font-semibold text-primary-600 hover:text-primary-700 px-3 py-2"
                >
                  Admin
                </Link>
              )}
              <button
                onClick={logout}
                className="btn-secondary text-sm px-3 py-2 hidden md:block"
              >
                Salir
              </button>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link to="/login" className="text-sm font-semibold text-gray-700 dark:text-slate-300 hover:text-primary-600 px-3 py-2">
                Entrar
              </Link>
              <Link to="/registro" className="btn-primary text-sm px-4 py-2">
                Registro
              </Link>
            </div>
          )}

          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2 rounded-lg text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex items-center h-16 relative">

            {/* Nav links - desktop (centered) */}
            <nav className="hidden lg:flex absolute inset-x-0 top-1/2 transform -translate-y-1/2 justify-center px-20 items-center gap-4 whitespace-nowrap">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `px-3 py-2 text-base font-semibold transition-colors whitespace-nowrap ${isActive ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white'}`
                }
              >
                INICIO
              </NavLink>
              {CATEGORIES.map((cat) => (
                <NavLink
                  key={cat.slug}
                  to={`/categoria/${cat.slug}`}
                  className={({ isActive }) =>
                    `px-3 py-2 text-base font-semibold transition-colors whitespace-nowrap ${isActive ? `${cat.activeText} border-b-2 ${cat.activeBorder}` : `text-gray-600 dark:text-slate-300 ${cat.color}`}`
                  }
                >
                  {cat.name}
                </NavLink>
              ))}
            </nav>

            
          </div>

          {/* Mobile menu */}
          {menuOpen && (
            <div className="lg:hidden py-4 border-t border-gray-100 dark:border-slate-800 animate-fade-in">
              <nav className="flex flex-col gap-1">
                <NavLink to="/" end onClick={() => setMenuOpen(false)} className="px-3 py-2 text-sm font-semibold text-gray-700 dark:text-slate-300 hover:text-primary-600">INICIO</NavLink>
                {CATEGORIES.map((cat) => (
                  <NavLink key={cat.slug} to={`/categoria/${cat.slug}`} onClick={() => setMenuOpen(false)} className={`px-3 py-2 text-sm font-semibold text-gray-700 dark:text-slate-300 ${cat.color}`}>
                    {cat.name}
                  </NavLink>
                ))}
                <div className="border-t border-gray-100 dark:border-slate-800 mt-2 pt-2">
                  {user ? (
                    <button onClick={() => { logout(); setMenuOpen(false); }} className="w-full text-left px-3 py-2 text-sm font-semibold text-gray-700 dark:text-slate-300">
                      Cerrar sesión
                    </button>
                  ) : (
                    <>
                      <Link to="/login" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-sm font-semibold text-gray-700 dark:text-slate-300">Entrar</Link>
                      <Link to="/registro" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-sm font-semibold text-primary-600">Registro</Link>
                    </>
                  )}
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
};

export default Navbar;
