import { useCart } from '../../context/CartContext.jsx';

const CartItem = ({ item }) => {
  const { updateItem, removeItem } = useCart();
  const { product, quantity } = item;
  // Use original image for cart item thumbnail as requested
  const imgSrc = product.images?.[0] || 'https://placehold.co/80x80/e2e8f0/94a3b8?text=?';

  return (
    <div className="flex gap-3">
      <img src={imgSrc} alt={product.name} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 leading-snug">
          {product.name}
        </p>
        <p className="text-sm font-bold text-primary-600 mt-0.5">
          {(product.price * quantity).toFixed(2)}€
        </p>

        {/* Cantidad */}
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={() => updateItem(item.id, quantity - 1)}
            className="w-6 h-6 rounded text-gray-600 dark:text-slate-300 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 flex items-center justify-center text-xs font-bold transition-colors"
          >
            −
          </button>
          <span className="text-sm font-semibold text-gray-900 dark:text-white w-6 text-center">{quantity}</span>
          <button
            onClick={() => updateItem(item.id, quantity + 1)}
            disabled={quantity >= product.stock}
            className="w-6 h-6 rounded text-gray-600 dark:text-slate-300 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 disabled:opacity-40 flex items-center justify-center text-xs font-bold transition-colors"
          >
            +
          </button>
        </div>
      </div>

      <button
        onClick={() => removeItem(item.id)}
        className="self-start p-1 text-gray-400 hover:text-red-500 transition-colors"
        aria-label="Eliminar"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  );
};

export default CartItem;
