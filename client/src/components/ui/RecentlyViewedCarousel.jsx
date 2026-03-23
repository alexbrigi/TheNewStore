import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext.jsx';
import { useReservation } from '../../context/ReservationContext.jsx';
import { useRef, useState, useEffect } from 'react';
import { getProductBySlug } from '../../services/productService.js';

const RecentlyViewedCarousel = ({ items = [] }) => {
  if (!items || items.length === 0) return null;

  const { addToCart } = useCart();
  const { canReserve } = useReservation();
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [fresh, setFresh] = useState({});

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      setCanScrollLeft(el.scrollLeft > 0);
      setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
    };
    update();
    el.addEventListener('scroll', update);
    window.addEventListener('resize', update);
    return () => {
      el.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [items]);

  // Fetch latest product data for displayed recently viewed items to reflect stock changes
  useEffect(() => {
    if (!items || items.length === 0) return;
    let mounted = true;
    (async () => {
      try {
        const promises = items.map((it) => getProductBySlug(it.slug).then((r) => r.data).catch(() => null));
        const results = await Promise.all(promises);
        if (!mounted) return;
        const map = {};
        items.forEach((it, i) => {
          const p = results[i];
          if (p) map[it.slug] = p;
        });
        setFresh(map);
      } catch (e) {
        // ignore
      }
    })();
    return () => { mounted = false; };
  }, [items]);

  const scrollByAmount = (direction = 'right') => {
    const el = containerRef.current;
    if (!el) return;
    const amount = Math.floor(el.clientWidth * 0.8);
    const left = direction === 'left' ? Math.max(0, el.scrollLeft - amount) : Math.min(el.scrollWidth, el.scrollLeft + amount);
    el.scrollTo({ left, behavior: 'smooth' });
  };

  return (
    <div className="mt-12 relative pb-12">{/* más espacio superior entre productos y la barra */}
      <h3 className="text-lg font-semibold mb-4">Visto recientemente</h3>

      {/* Left arrow */}
      <button
        onClick={() => scrollByAmount('left')}
        disabled={!canScrollLeft}
        aria-label="Anterior"
        className={`absolute left-0 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full shadow-md transition-opacity bg-white dark:bg-slate-800 ${canScrollLeft ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}
      >
        <svg className="w-5 h-5 text-gray-700 dark:text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Right arrow */}
      <button
        onClick={() => scrollByAmount('right')}
        disabled={!canScrollRight}
        aria-label="Siguiente"
        className={`absolute right-0 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full shadow-md transition-opacity bg-white dark:bg-slate-800 ${canScrollRight ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}
      >
        <svg className="w-5 h-5 text-gray-700 dark:text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <div className="overflow-x-auto h-96" ref={containerRef}>
        <div className="flex gap-4 w-max px-10">{/* carrusel horizontal */}
          {items.map((p) => {
            const current = fresh[p.slug] || p;
            const stock = typeof current.stock === 'number' ? current.stock : 1;
            const discount = current.discount || 0;
            const finalPrice = (current.price * (1 - discount / 100)).toFixed(2);
            const originalPrice = current.price ? current.price.toFixed(2) : null;

            return (
              <div key={p.id} className="w-48 flex-shrink-0 h-80">{/* tarjeta con altura fija aumentada */}
                <div className="card p-2 relative h-full flex flex-col justify-between overflow-hidden">{/* ocupar toda la altura */}
                  <Link
                    to={`/productos/${p.slug}`}
                    className="block"
                    onClick={() => {
                      try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (e) {}
                    }}
                  >
                    <div className="relative overflow-hidden rounded h-52">{/* imagen con altura fija ajustada */}
                      <img src={current.images?.[0] || p.images?.[0]} alt={p.name} loading="lazy" className="w-full h-full object-contain bg-white" />
                      {stock === 0 && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="text-white font-bold text-sm bg-black/70 px-3 py-1 rounded">Sin stock</span>
                        </div>
                      )}
                      {/* removed 'Reservado' badge per new UX */}
                      {discount > 0 && (
                        <span className="absolute top-2 left-2 bg-green-300 text-green-900 text-xs font-bold w-8 h-6 flex items-center justify-center rounded">-{discount}%</span>
                      )}
                    </div>
                    <div className={`${stock === 0 ? 'mt-2 text-sm font-semibold line-clamp-2 text-gray-400 line-through h-10 overflow-hidden' : 'mt-2 text-sm font-semibold line-clamp-2 text-gray-900 dark:text-white h-10 overflow-hidden'}`}>{p.name}</div>
                  </Link>

                  <div className="flex items-center justify-between mt-2">
                    <div>
                      <span className={`${stock === 0 ? 'text-sm font-bold text-gray-400 line-through' : 'text-sm font-bold text-gray-900 dark:text-white'}`}>{finalPrice}€</span>
                      {discount > 0 && originalPrice && (
                        <div className="mt-0 leading-tight">
                          <span className="text-xs text-gray-400 line-through ml-1 leading-none">{originalPrice}€</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {canReserve(p) ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              if (stock > 0) {
                                navigate(`/productos/${p.slug}`);
                                setTimeout(() => { try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (e) {} }, 50);
                              }
                            }}
                            disabled={stock === 0}
                            className={`${discount > 0 ? 'px-2 py-0.5 text-xs' : 'px-2 py-1 text-sm'} rounded ${stock > 0 ? 'bg-amber-500 hover:bg-amber-600 text-white' : 'bg-amber-200 text-amber-500 cursor-not-allowed'}`}
                            aria-label="Reservar"
                          >
                            Reservar
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => addToCart(p.id)}
                          disabled={stock === 0}
                          className={`p-2 ${stock > 0 ? 'bg-primary-600 hover:bg-primary-700 text-white' : 'bg-gray-300 text-gray-500 dark:bg-slate-700'} rounded-lg transition-colors active:scale-95 -translate-y-1`}
                          aria-label="Añadir al carrito"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RecentlyViewedCarousel;
