import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext.jsx';
import { useReservation } from '../../context/ReservationContext.jsx';
import LanguageFlag from './LanguageFlag.jsx';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { canReserve } = useReservation();
  const navigate = useNavigate();
  const { name, slug, price, images, category, isNew, discount, stock } = product;
  const language = product.language || 'ENGLISH';

  const finalPrice = discount ? price * (1 - discount / 100) : price;
  // Use original image for listing/cover as requested by user
  const imgSrc = images?.[0] || 'https://placehold.co/400x400/e2e8f0/94a3b8?text=Sin+imagen';

  return (
    <div className="card group overflow-hidden flex flex-col">
      {/* Imagen */}
      <Link to={`/productos/${slug}`} className="relative overflow-hidden aspect-square block">
        <img
          src={imgSrc}
          alt={name}
          className="w-full h-full object-contain bg-white"
          loading="lazy"
        />

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {isNew && (
            <span className="bg-primary-600 text-white text-xs font-bold px-2 py-0.5 rounded">NUEVO</span>
          )}
          {discount && (
            <span className="bg-green-300 text-green-900 text-xs font-bold w-8 h-6 flex items-center justify-center rounded">-{discount}%</span>
          )}
          {product.preorder && (
            <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-0.5 rounded">Reservable</span>
          )}
        </div>

        {/* Language flag top-right */}
        <div className="absolute top-2 right-2">
          <LanguageFlag code={language} />
        </div>

        {stock === 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-bold text-sm bg-black/70 px-3 py-1 rounded">Sin stock</span>
          </div>
        )}
      </Link>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        {/* Categoría */}
        {category && (
          <span
            className="text-xs font-semibold uppercase tracking-wide mb-1"
            style={{ color: category.color || '#6b7280' }}
          >
            {category.name}
          </span>
        )}

        {/* Nombre */}
        <Link to={`/productos/${slug}`} className="font-semibold text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 line-clamp-2 text-sm leading-snug mb-3">
          {name}
        </Link>

        {/* Precio + botón */}
        <div className="mt-auto flex items-center justify-between">
          <div>
            <span className={`${stock === 0 ? 'text-lg font-black text-gray-400 dark:text-slate-500 line-through' : 'text-lg font-black text-gray-900 dark:text-white'}`}>
              {finalPrice.toFixed(2)}€
            </span>
            {discount && (
              <div className="mt-0 leading-tight">
                <span className={`${stock === 0 ? 'text-xs text-gray-400 dark:text-slate-500 leading-none' : 'text-xs text-gray-400 dark:text-slate-500 line-through leading-none'}`}>
                  {price.toFixed(2)}€
                </span>
              </div>
            )}
          </div>

                  <div className="flex items-center gap-2">
                    {!canReserve(product) && (
                      <button
                        onClick={() => addToCart(product.id)}
                        disabled={stock === 0}
                        className="p-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 dark:disabled:bg-slate-700 text-white rounded-lg transition-colors active:scale-95"
                        aria-label="Añadir al carrito"
                      >
                        <svg className={`w-4 h-4 ${stock > 0 ? 'text-white' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                      </button>
                    )}

                    {canReserve(product) && (
                      <button
                        onClick={() => navigate(`/productos/${product.slug}`)}
                        className={`px-3 ${product.discount ? 'py-1 text-xs' : 'py-2 text-sm'} bg-amber-600 hover:bg-amber-700 text-white rounded-lg`}
                      >
                        Reservar
                      </button>
                    )}
                  </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
