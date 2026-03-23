import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { Link } from 'react-router-dom';
import { getProducts, getCategories } from '../services/productService.js';
import ProductCard from '../components/ui/ProductCard.jsx';

// ─── Ticker (cinta informativa) ──────────────────────────────────────────────
const TICKER_ITEMS = ['Envíos 24-72 Horas', 'Novedades cada semana', 'Precios competitivos', 'Soporte 24/7', 'Pago seguro', 'Devoluciones fáciles'];

const Ticker = () => (
  <div className="bg-gray-900 dark:bg-black text-white text-sm py-2.5 overflow-hidden">
    <div className="flex animate-marquee whitespace-nowrap">
      {[...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
        <span key={i} className="mx-8 flex items-center gap-2">
          <span className="text-primary-500">★</span> {item}
        </span>
      ))}
    </div>
  </div>
);

// ─── Hero ──────────────────────────────────────────────────────────────────────
const HERO_SLIDES = [
  {
    badge: 'NOVEDAD',
    title: 'ONE PIECE TCG',
    subtitle: '¡Explora el emocionante mundo de One Piece TCG! Aquí encontrarás cartas, colecciones y estrategias inspiradas en tus piratas favoritos. Ya seas un coleccionista apasionado o un jugador competitivo, este espacio está pensado para compartir la aventura, descubrir novedades y vivir toda la emoción del juego de cartas de One Piece.',
    cta: 'Ver colección',
    link: '/categoria/one-piece',
    bg: '/backgroundNovedades/OnePieceBG.jpg',
    bgStyle: {
    backgroundSize: '43%',
    backgroundPosition: 'bottom left',
    backgroundAttachment: 'scroll',
    backgroundRepeat: 'no-repeat',
    filter: 'brightness(0.7)',
  },
    accent: 'text-red-400',
    img: '/backgroundNovedades/fondoonepiece.jpg',
    imgLink: '/producto/one-piece-eb-03-heroines-edition',
  },
  {
    badge: 'DESTACADO',
    title: 'POKÉMON',
    subtitle: '¡Explora el emocionante mundo de Pokémon TCG! Aquí encontrarás cajas, colecciones y estrategias inspiradas en tus Pokémon favoritos. Ya seas un coleccionista apasionado o un jugador competitivo, este espacio está pensado para compartir aventuras, descubrir novedades y vivir toda la emoción del juego de cartas de Pokémon.',
    cta: 'Explorar Pokémon',
    link: '/categoria/pokemon',
    bg: '/backgroundNovedades/videoframe_1813.png',
    bgStyle: {
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'scroll',
    backgroundRepeat: 'no-repeat',
    filter: 'brightness(0.7)',
  },
    accent: 'text-yellow-400',
    img: '/categories/nihilzero.jpg',
    imgLink: '',
  },
  {
    badge: 'NUEVO',
    title: 'DEPORTES',
    subtitle: '¡Explora el emocionante mundo del coleccionesmo de los Deportes! Aquí encontrarás colecciones y estrategias inspiradas en tus héroes deportivos favoritos. Ya seas un coleccionista apasionado por un equipo o por un deport, este espacio está pensado para compartir la pasión, descubrir novedades y vivir toda la emoción del juego de cartas deportivas.',
    cta: 'Ver Deportes',
    link: '/categoria/deportes',
    bg: '/backgroundNovedades/bgfuts.png',
    bgStyle: {
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'scroll',
    backgroundRepeat: 'no-repeat',
    filter: 'brightness(0.7)',
  },
    accent: 'text-orange-400',
    img: '/backgroundNovedades/sportcards.jpg',
    imgStyle: {
      backgroundPosition: 'center'
    },
    imgLink: '',
  },
];

const HeroBanner = () => {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const { theme } = useTheme();

  // If the current slide is One Piece and we're in light mode, apply
  // a fixed background to the outer container so it behaves like nocturno.
  const currentSlide = HERO_SLIDES[current];
  const shouldUseOuterFixedBg = currentSlide && currentSlide.title && currentSlide.title.toUpperCase().includes('ONE PIECE') && theme === 'light';
  const outerBgStyle = shouldUseOuterFixedBg
    ? {
        // keep minimal inline style in case fixed layer can't render;
        backgroundImage: `url(${currentSlide.bg})`,
        backgroundSize: currentSlide.bgStyle?.backgroundSize || 'cover',
        backgroundPosition: currentSlide.bgStyle?.backgroundPosition || 'center',
        backgroundRepeat: currentSlide.bgStyle?.backgroundRepeat || 'no-repeat',
        filter: currentSlide.bgStyle?.filter || undefined,
      }
    : {};

  useEffect(() => {
    if (paused) return;
    const interval = setInterval(() => setCurrent((prev) => (prev + 1) % HERO_SLIDES.length), 10000);
    return () => clearInterval(interval);
  }, [paused]);

  const prevSlide = () => setCurrent((c) => (c - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  const nextSlide = () => setCurrent((c) => (c + 1) % HERO_SLIDES.length);

  return (
    <div className="relative overflow-hidden h-[66vh]" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} style={outerBgStyle}>
      {/* Fixed background layer for One Piece in light mode. Using a fixed positioned
          element prevents issues when children use transforms which break
          background-attachment: fixed. It sits behind hero content and is
          only visible when `shouldUseOuterFixedBg` is true. */}
      {shouldUseOuterFixedBg && (
        <div
          aria-hidden
          style={{
            position: 'fixed',
            left: 0,
            top: 0,
            width: '100%',
            height: '66vh',
            backgroundImage: `url(${currentSlide.bg})`,
            backgroundSize: currentSlide.bgStyle?.backgroundSize || 'cover',
            backgroundPosition: currentSlide.bgStyle?.backgroundPosition || 'center',
            backgroundRepeat: currentSlide.bgStyle?.backgroundRepeat || 'no-repeat',
            zIndex: 0,
            filter: currentSlide.bgStyle?.filter || undefined,
            pointerEvents: 'none',
            transition: 'opacity 300ms ease',
            opacity: 1,
          }}
        />
      )}

      {/* Dark overlay to force 'modo nocturno' appearance for the banner */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(rgba(15,23,42,0.75), rgba(15,23,42,0.75))',
          zIndex: 5,
          pointerEvents: 'none',
          transition: 'opacity 250ms ease',
        }}
      />

      {/* Content wrapper sits above overlay */}
      <div className="w-full h-full" style={{ position: 'relative', zIndex: 10 }}>
        {/* Track (full width) */}
        <div
          className="h-full flex transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {HERO_SLIDES.map((slide, idx) => {
            const isImageBg = slide.bg && (slide.bg.startsWith('/') || slide.bg.match(/\.(jpg|jpeg|png|webp|avif|gif)$/i));
            // Avoid setting the inner slide background for One Piece in light mode
            // to prevent duplicate images and flicker. Use the fixed layer instead.
            const isOnePiece = slide.title && slide.title.toUpperCase().includes('ONE PIECE');
            let slideBgStyle = {};
            if (isImageBg && !(isOnePiece && theme === 'light')) {
              slideBgStyle = { backgroundImage: `url(${slide.bg})`, backgroundSize: 'cover', backgroundPosition: 'center', ...slide.bgStyle };
            }
            const bgClass = !isImageBg ? `bg-gradient-to-r ${slide.bg}` : '';

            return (
              <div
                key={idx}
                className={`w-full flex-shrink-0 h-full ${bgClass}`}
                style={slideBgStyle}
              >
                <div className="w-[1285px] h-full max-w-full mx-auto flex flex-col lg:flex-row items-center gap-12 px-6 text-white">
                  <div className="flex-1 text-center lg:text-left animate-fade-in bg-gray-900/60 backdrop-blur-sm p-6 rounded-2xl shadow-2xl shadow-gray-900/60">
                    <span className="inline-block bg-primary-600 text-white text-xs font-bold px-3 py-1 rounded mb-4 uppercase tracking-wide">
                      {slide.badge}
                    </span>
                    <h1
                      className={`text-5xl lg:text-7xl font-black text-white mb-4 tracking-tight`}
                      style={{ textShadow: '0 4px 18px rgba(0,0,0,0.6)' }}
                    >
                      {slide.title}
                    </h1>
                    <p
                      className="text-white text-lg mb-8 max-w-lg"
                      style={{ textShadow: '0 3px 12px rgba(0,0,0,0.55)' }}
                    >
                      {slide.subtitle}
                    </p>
                    <Link to={slide.link} className="btn-primary text-base text-white px-8 py-3 inline-block">
                      {slide.cta}
                    </Link>
                  </div>

                  <div className="flex-1 flex justify-center">
                    <img src={slide.img} alt={slide.title} className="max-w-sm w-full rounded-2xl shadow-2xl" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Prev/Next controls */}
      <button aria-label="Anterior" onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center">
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
        </svg>
      </button>
      <button aria-label="Siguiente" onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center">
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
        </svg>
      </button>

      {/* Dots */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
        {HERO_SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${i === current ? 'bg-white w-6' : 'bg-white/40'}`}
          />
        ))}
      </div>
    </div>
  );
};

// ─── Categorías grid ────────────────────────────────────────────────────────────
const CATEGORY_CARDS = [
  // Use public/ path (Vite serves files from client/public at the web root)
  { name: 'One Piece', slug: 'one-piece', color: '#EF4444', img: '/categories/logo-de-one-piece-sobre-fondo-blanco.jpg' },
  { name: 'Pokémon', slug: 'pokemon', color: '#EAB308', img: '/categories/logopokemon.png' },
  { name: 'Dragon Ball', slug: 'dragon-ball', color: '#F97316', img: '/categories/logodragonball.jpg' },
  { name: 'Lorcana', slug: 'lorcana', color: '#A855F7', img: '/categories/logolorcana.png' },
  { name: 'Deportes', slug: 'deportes', color: '#3B82F6', img: '/categories/logodeportes.png' }, 
  { name: 'Accesorios', slug: 'accesorios', color: '#22C55E', img: '/categories/logoaccesorios.png' },
];

const CategoryGrid = () => (
  <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
      {CATEGORY_CARDS.map((cat) => (
        <Link
          key={cat.slug}
          to={`/categoria/${cat.slug}`}
          className="card p-4 flex flex-col items-center text-center hover:scale-105 transition-transform duration-200 cursor-pointer"
        >
          {cat.img && (typeof cat.img === 'string' && (cat.img.startsWith('/') || cat.img.includes('.'))) ? (
            <img src={cat.img} alt={cat.name} className="w-16 h-16 object-cover rounded-md mb-2" />
          ) : (
            <span className="text-3xl mb-2">{cat.emoji}</span>
          )}
          <span className="text-sm font-bold text-gray-900 dark:text-white" style={{ color: cat.color }}>
            {cat.name}
          </span>
        </Link>
      ))}
    </div>
  </section>
);

// ─── Home page ────────────────────────────────────────────────────────────────
const Home = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('newest');

  useEffect(() => {
    setLoading(true);
    getProducts({ sort: tab === 'newest' ? 'newest' : tab === 'featured' ? undefined : undefined, featured: tab === 'featured' ? true : undefined, limit: 8 })
      .then(({ data }) => {
        // Move products with stock to the start of the array
        try {
          const sorted = Array.isArray(data.products)
            ? data.products.slice().sort((a, b) => ((b.stock > 0) - (a.stock > 0)))
            : data.products;
          setProducts(sorted);
        } catch (e) {
          setProducts(data.products);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [tab]);

  const TABS = [
    { key: 'newest', label: 'NOVEDADES' },
    { key: 'featured', label: 'DESTACADOS' },
  ];

  return (
    <>
      <Ticker />
      <HeroBanner />
      <CategoryGrid />

      {/* Products section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Tabs */}
        <div className="flex gap-6 border-b border-gray-200 dark:border-slate-700 mb-8">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`pb-3 text-sm font-bold tracking-wide transition-colors border-b-2 -mb-px ${tab === t.key ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-white'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="card overflow-hidden animate-pulse">
                <div className="aspect-square bg-gray-200 dark:bg-slate-700" />
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-1/3" />
                  <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded" />
                  <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 dark:text-slate-400">No hay productos disponibles aún</p>
            <p className="text-sm text-gray-400 dark:text-slate-500 mt-1">Añade productos desde el panel de administración</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}

        {products.length > 0 && (
          <div className="text-center mt-10">
            <Link to="/productos" className="btn-secondary px-8 py-3 inline-block">
              Ver todos los productos →
            </Link>
          </div>
        )}
      </section>

      {/* About / Sobre nosotros - full width band separated by horizontal lines, different background */}
      <section className="w-full bg-white dark:bg-slate-800">
        <div className="border-t border-b border-slate-200 dark:border-slate-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex-1">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-3">Sobre The New Store</h2>
                <p className="text-slate-700 dark:text-slate-300 mb-4">
                  Nacimos como un proyecto de jugadores con ganas de facilitar el acceso a cartas y accesorios de calidad. Además de vender,
                  queremos crear una comunidad donde compartir colecciones, noticias y recomendaciones.
                </p>
                <p className="text-slate-700 dark:text-slate-300 mb-4">
                  Ofrecemos soporte experto, gestión rápida de reservas y verificación de autenticidad en artículos seleccionados. Si necesitas
                  ayuda con una búsqueda o una reserva, nuestro equipo te guiará.
                </p>

                <Link to="/contacto" className="!bg-primary-600 !text-white font-bold px-6 py-2 rounded-lg hover:!bg-primary-700 inline-block">Contacta con nosotros</Link>
              </div>

              <div className="w-full md:w-56">
                <img src="/backgroundNovedades/about-us.jpg" alt="Sobre nosotros" className="w-full h-36 object-cover rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pre-footer info band: pagos / envío / contacto (orden actualizado) */}
      <section className="w-full bg-slate-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center items-start">
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                <svg className="w-7 h-7 text-slate-700 dark:text-slate-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="7" width="18" height="13" rx="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M7 10h10" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M12 14v4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Pagos Seguros</h3>
              <p className="text-slate-500 dark:text-slate-400 mt-2">Transacciones cifradas y opciones de pago populares para tu tranquilidad.</p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                <svg className="w-7 h-7 text-slate-700 dark:text-slate-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M3 7h18" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M21 7v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Envíos fiables</h3>
              <p className="text-slate-500 dark:text-slate-400 mt-2">Recibe tu pedido en 24–72 horas laborables en la península.</p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                <svg className="w-7 h-7 text-slate-700 dark:text-slate-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="12" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Contacto directo</h3>
              <p className="text-slate-500 dark:text-slate-400 mt-2">Contacto directo para resolver dudas y gestionar reservas rápidamente.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner (hide if user is logged in) */}
      {!user && (
        <section className="border-t border-transparent dark:border-slate-700 bg-white dark:bg-slate-800 py-14 mt-8">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-3">¿Primera compra?</h2>
            <p className="text-slate-700 dark:text-slate-300 text-lg mb-6">
              Regístrate y empieza a coleccionar. Envíos seguros en 24-72h.
            </p>
            <Link to="/registro" className="bg-primary-600 text-white font-bold px-8 py-3 rounded-lg hover:bg-primary-700 transition-colors inline-block">
              Crear cuenta gratis
            </Link>
          </div>
        </section>
      )}
    </>
  );
};

export default Home;
