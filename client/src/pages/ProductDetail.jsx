import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProductBySlug } from '../services/productService.js';
import LanguageFlag from '../components/ui/LanguageFlag.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useReservation } from '../context/ReservationContext.jsx';
import ReserveModal from '../components/ui/ReserveModal.jsx';
import toast from 'react-hot-toast';
import { useRecentlyViewed } from '../context/RecentlyViewedContext.jsx';

const ProductDetail = () => {
  const { slug } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [reserveOpen, setReserveOpen] = useState(false);
  const [selectedImg, setSelectedImg] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [notifyEmail, setNotifyEmail] = useState('');
  const [notifyLoading, setNotifyLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getProductBySlug(slug)
      .then(({ data }) => setProduct(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  const { push: pushRecently } = useRecentlyViewed();
  const { canReserve, reserve } = useReservation();

  // cuando cambia el producto, guardar en "visto recientemente"
  useEffect(() => {
    if (product) {
      // guardamos sólo los campos necesarios para la preview
      pushRecently({
        id: product.id,
        slug: product.slug,
        name: product.name,
        images: product.images,
        price: product.price,
        discount: product.discount,
        stock: product.stock,
        preorder: product.preorder || false,
        releaseDate: product.releaseDate || null,
      });
    }
  }, [product]);

  useEffect(() => {
    const len = product?.images?.length || 1;
    if (!lightboxOpen) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setLightboxOpen(false);
      if (e.key === 'ArrowLeft') setSelectedImg((s) => (s - 1 + len) % len);
      if (e.key === 'ArrowRight') setSelectedImg((s) => (s + 1) % len);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxOpen, product]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 grid md:grid-cols-2 gap-10 animate-pulse">
        <div className="aspect-square bg-gray-200 dark:bg-slate-700 rounded-2xl" />
        <div className="space-y-4">
          <div className="h-6 w-1/4 bg-gray-200 dark:bg-slate-700 rounded" />
          <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded" />
          <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-3/4" />
          <div className="h-10 w-1/3 bg-gray-200 dark:bg-slate-700 rounded" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Producto no encontrado</h2>
        <Link to="/productos" className="btn-primary">Ver todos los productos</Link>
      </div>
    );
  }

  const finalPrice = product.discount ? product.price * (1 - product.discount / 100) : product.price;
  const images = product.images?.length ? product.images : ['https://placehold.co/600x600/e2e8f0/94a3b8?text=Sin+imagen'];

  const deriveThumb = (url) => {
    if (!url) return url;
    try {
      const u = new URL(url, window.location.origin);
      const parts = u.pathname.split('/');
      const name = parts.pop();
      const dot = name.lastIndexOf('.');
      const base = dot !== -1 ? name.slice(0, dot) : name;
      const thumbName = base + '-thumb.jpg';
      parts.push(thumbName);
      return `${u.origin}${parts.join('/')}`;
    } catch (e) {
      return url;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 dark:text-slate-400 mb-6 flex items-center gap-2">
        <Link to="/" className="hover:text-primary-600">Inicio</Link>
        <span>/</span>
        <Link to="/productos" className="hover:text-primary-600">Productos</Link>
        {product.category && <>
          <span>/</span>
          <Link to={`/categoria/${product.category.slug}`} className="hover:text-primary-600">{product.category.name}</Link>
        </>}
        <span>/</span>
        <span className="text-gray-900 dark:text-white">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-10">
        {/* Imágenes */}
        <div>
          <div className="rounded-2xl overflow-hidden aspect-square mb-3 border border-gray-100 dark:border-slate-700 cursor-zoom-in" onClick={() => setLightboxOpen(true)}>
            {/* Use original image for the cover (so it's not blown-up from a small thumb) */}
            <img src={images[selectedImg]} alt={product.name} className="w-full h-full object-contain bg-white" />
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {images.map((img, i) => (
                <button key={i} onClick={() => setSelectedImg(i)} className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${i === selectedImg ? 'border-primary-600' : 'border-gray-200 dark:border-slate-700'}`}>
                  <img src={(img && img.includes('/uploads/')) ? deriveThumb(img) : img} alt="" className="w-full h-full object-contain bg-white" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Lightbox modal */}
        {lightboxOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={() => setLightboxOpen(false)}>
            <div className="relative max-w-[90vw] max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => setLightboxOpen(false)} className="absolute top-2 right-2 text-white bg-black/40 rounded-full p-2">✕</button>
              <button onClick={() => setSelectedImg((s) => (s - 1 + images.length) % images.length)} className="absolute left-2 top-1/2 -translate-y-1/2 text-white bg-black/40 rounded-full p-2">◀</button>
              <div className="w-[80vw] h-[80vh] md:w-[60vw] md:h-[80vh] flex items-center justify-center">
                <img src={images[selectedImg]} alt={product.name} className="max-w-full max-h-full object-contain rounded" />
              </div>
              <button onClick={() => setSelectedImg((s) => (s + 1) % images.length)} className="absolute right-2 top-1/2 -translate-y-1/2 text-white bg-black/40 rounded-full p-2">▶</button>
            </div>
          </div>
        )}

        {/* Info */}
        <div>
          <div className="flex items-center gap-3">
            {product.category && (
              <Link to={`/categoria/${product.category.slug}`} className="text-sm font-semibold uppercase tracking-wide" style={{ color: product.category.color || '#e02424' }}>
                {product.category.name}
              </Link>
            )}
            <div className="ml-auto">
              <LanguageFlag code={product.language} />
            </div>
          </div>

          <h1 className="text-3xl font-black text-gray-900 dark:text-white mt-1 mb-3">{product.name}</h1>

          {/* Badges */}
          <div className="flex gap-2 mb-4">
            {product.isNew && <span className="bg-primary-600 text-white text-xs font-bold px-2 py-0.5 rounded">NUEVO</span>}
            {product.discount && <span className="bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded">-{product.discount}%</span>}
          </div>

          {/* Botones de reserva junto a badges (debajo del nombre, encima del precio) */}
          {canReserve(product) && (
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={() => setReserveOpen(true)}
                className={`btn-primary ${product.discount ? 'px-3 py-1 text-sm' : 'px-3 py-2'}`}
              >
                Reservar
              </button>
              <button disabled className="btn-secondary px-3 py-2 opacity-80 cursor-default" title="Solo informativo">SOLO RESERVA</button>
              {product.releaseDate && (
                <p className="text-sm italic text-emerald-600 ml-2">Fecha de salida: {new Date(product.releaseDate).toLocaleDateString()}</p>
              )}
              <ReserveModal product={product} open={reserveOpen} onClose={() => setReserveOpen(false)} onConfirm={(q) => { reserve(product, q); addToCart(product.id, q); }} />
            </div>
          )}

          {/* Precio */}
          <div className="flex items-end gap-3 mb-6">
            <span className={`${product.stock === 0 ? 'text-4xl font-black text-gray-400 line-through' : 'text-4xl font-black text-primary-600'}`}>
              {finalPrice.toFixed(2)}€
            </span>

            {product.stock === 0 && (
              <button onClick={() => setNotifyOpen(true)} className="ml-2 inline-flex items-center px-3 py-1 bg-red-600 text-white rounded font-semibold">FUERA DE STOCK</button>
            )}

            {product.discount && (
              <span className={`${product.stock === 0 ? 'text-gray-400 line-through text-lg mb-1' : 'text-gray-400 line-through text-lg mb-1'}`}>{product.price.toFixed(2)}€</span>
            )}
          </div>
            
          {/* Descripción */}
          {product.description && (
            <p className="text-gray-600 dark:text-slate-400 mb-6 leading-relaxed">{product.description}</p>
          )}

          {/* Stock (oculto cantidad) */}
          <p className={`text-sm font-semibold mb-4 ${product.stock > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
            {product.stock > 0 ? '✓ En stock' : '✗ Sin stock'}
          </p>

          {/* Cantidad + Añadir / Reservar */}
          <div className="flex items-center gap-4">
            <div className="flex items-center border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-3 py-2 text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors font-bold">−</button>
              <span className="px-4 py-2 text-sm font-semibold text-gray-900 dark:text-white">{qty}</span>
              <button onClick={() => setQty(Math.min(product.stock || 999, qty + 1))} disabled={product.stock !== undefined && qty >= product.stock} className="px-3 py-2 text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-40 transition-colors font-bold">+</button>
            </div>

            {canReserve(product) ? (
              <>
                <button
                  onClick={() => setReserveOpen(true)}
                  className={`btn-primary flex-1 ${product.discount ? 'py-2 text-sm' : 'py-3'}`}
                >
                  Reservar
                </button>
                <ReserveModal product={product} open={reserveOpen} onClose={() => setReserveOpen(false)} onConfirm={(q) => { reserve(product, q); addToCart(product.id, q); }} />
              </>
            ) : (
              <button
                onClick={() => addToCart(product.id, qty)}
                disabled={product.stock === 0}
                className="btn-primary flex-1 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Añadir al carrito
              </button>
            )}
          </div>

          {/* Botón NOTIFICAME (debajo, dentro del producto) */}
          {product.stock === 0 && (
            <div className="mt-4">
              <button onClick={() => setNotifyOpen(true)} className="btn-secondary w-full">Avisarme cuando haya stock</button>
            </div>
          )}

          {/* Modal notificar */}
          {notifyOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={(e) => e.target === e.currentTarget && setNotifyOpen(false)}>
              <div className="bg-white dark:bg-slate-900 rounded-lg p-6 w-full max-w-md">
                <h3 className="text-lg font-bold mb-3">Notificarme cuando haya stock</h3>
                <p className="text-sm text-gray-600 dark:text-slate-400 mb-3">Introduce tu correo y te avisaremos (y nos llegará una notificación a la tienda).</p>
                <input type="email" className="input w-full mb-3" placeholder="tu@correo.com" value={notifyEmail} onChange={(e) => setNotifyEmail(e.target.value)} />
                <div className="flex gap-3 justify-end">
                  <button onClick={() => setNotifyOpen(false)} className="btn-secondary">Cancelar</button>
                  <button onClick={async () => {
                    if (!notifyEmail || !notifyEmail.includes('@')) { toast.error('Introduce un correo válido'); return; }
                    setNotifyLoading(true);
                    try {
                      const res = await fetch('/api/notify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ productId: product.id, email: notifyEmail }) });
                      if (!res.ok) throw new Error('Error');
                      toast.success('Solicitud registrada. Gracias');
                      setNotifyOpen(false);
                    } catch (err) {
                      toast.error('Error al enviar la solicitud');
                    } finally { setNotifyLoading(false); }
                  }} className="btn-primary" disabled={notifyLoading}>{notifyLoading ? 'Enviando...' : 'Enviar'}</button>
                </div>
              </div>
            </div>
          )}

          {/* Features */}
          <div className="mt-8 grid grid-cols-2 gap-3">
            {[['📦', 'Envío 24-72h'], ['🔒', 'Pago seguro'], ['↩️', 'Devoluciones'], ['✅', 'Producto oficial']].map(([emoji, text]) => (
              <div key={text} className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400">
                <span>{emoji}</span> {text}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
