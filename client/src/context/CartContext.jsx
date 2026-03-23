import { createContext, useContext, useEffect, useReducer, useCallback } from 'react';
import api from '../services/api.js';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext.jsx';

const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'SET_ITEMS':
      return { ...state, items: action.payload, loading: false };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'CLEAR':
      return { ...state, items: [] };
    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(cartReducer, { items: [], loading: false });

  // Cargar carrito si hay usuario
  const fetchCart = useCallback(async () => {
    if (!user) return dispatch({ type: 'SET_ITEMS', payload: [] });
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const { data } = await api.get('/cart');
      dispatch({ type: 'SET_ITEMS', payload: data });
    } catch {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [user]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (productId, quantity = 1) => {
    if (!user) {
      toast.error('Inicia sesión para añadir al carrito');
      return;
    }
    try {
      await api.post('/cart', { productId, quantity });
      await fetchCart();
      toast.success('Añadido al carrito 🛒');
      try { window.dispatchEvent(new Event('open-cart')); } catch {}
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Error al añadir al carrito');
    }
  };

  const updateItem = async (itemId, quantity) => {
    try {
      await api.patch(`/cart/${itemId}`, { quantity });
      await fetchCart();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Error al actualizar');
    }
  };

  const removeItem = async (itemId) => {
    try {
      await api.delete(`/cart/${itemId}`);
      await fetchCart();
      toast('Producto eliminado del carrito', { icon: '🗑️' });
    } catch {
      toast.error('Error al eliminar');
    }
  };

  const clearCart = async () => {
    try {
      await api.delete('/cart');
      dispatch({ type: 'CLEAR' });
    } catch {
      toast.error('Error al vaciar el carrito');
    }
  };

  const totalItems = state.items.reduce((acc, i) => acc + i.quantity, 0);
  const totalPrice = state.items.reduce((acc, i) => acc + i.product.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ ...state, addToCart, updateItem, removeItem, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
