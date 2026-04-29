import { useCart } from '../../context/CartContext.jsx';
import CartItem from './CartItem.jsx';
import { Link } from 'react-router-dom';

const CartDrawer = ({ open, onClose }) => {
  const { items, totalItems, totalPrice, clearCart } = useCart();
  const freeShippingThreshold = 150;
  const remaining = Math.max(0, freeShippingThreshold - totalPrice);
  const shipping = totalPrice >= freeShippingThreshold ? 0 : 6;
  const totalWithShipping = totalPrice + shipping;
  const progress = Math.min(100, (totalPrice / freeShippingThreshold) * 100);

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 animate-fade-in"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <aside
        className={`fixed top-0 right-0 h-full w-full max-w-sm bg-white dark:bg-slate-900 z-50 flex flex-col shadow-2xl transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-slate-800">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Carrito
            {totalItems > 0 && (
              <span className="ml-2 text-sm font-medium text-gray-500 dark:text-slate-400">
                ({totalItems} {totalItems === 1 ? 'artículo' : 'artículos'})
              </span>
            )}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 dark:text-slate-400 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-5">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <svg className="w-16 h-16 text-gray-300 dark:text-slate-700 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <p className="text-gray-500 dark:text-slate-400 font-medium">Tu carrito está vacío</p>
              <button onClick={onClose} className="mt-4 btn-primary text-sm">
                Seguir comprando
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <CartItem key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-5 border-t border-gray-100 dark:border-slate-800">
            <div className="mb-4">
              <div className="text-xs font-semibold text-gray-700 dark:text-slate-300 mb-2">
                {remaining > 0 ? `Estas a ${remaining.toFixed(2)}€ del envio gratuito.` : 'Envio gratuito desbloqueado.'}
              </div>
              <div className="h-1.5 rounded-full bg-gray-100 dark:bg-slate-800 overflow-hidden">
                <div className="h-full bg-primary-600" style={{ width: `${progress}%` }} />
              </div>
            </div>

            <div className="flex justify-between mb-1 text-sm text-gray-500 dark:text-slate-400">
              <span>Subtotal</span>
              <span>{totalPrice.toFixed(2)}€</span>
            </div>
            <div className="flex justify-between mb-1 text-sm text-gray-500 dark:text-slate-400">
              <span>Envio</span>
              <span>{shipping === 0 ? 'Gratis' : `${shipping.toFixed(2)}€`}</span>
            </div>
            <div className="flex justify-between mb-4 font-bold text-gray-900 dark:text-white">
              <span>Total</span>
              <span className="text-primary-600 text-lg">{totalWithShipping.toFixed(2)}€</span>
            </div>
            <Link
              to="/checkout"
              onClick={onClose}
              className="btn-primary w-full text-center block py-3"
            >
              Finalizar compra
            </Link>
            <button
              onClick={clearCart}
              className="w-full mt-2 text-sm text-gray-500 dark:text-slate-400 hover:text-primary-600 transition-colors"
            >
              Vaciar carrito
            </button>
          </div>
        )}
      </aside>
    </>
  );
};

export default CartDrawer;
