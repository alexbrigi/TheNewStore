import { createContext, useContext, useEffect, useState } from 'react';
// no toast for reservations UI per requirements

const ReservationContext = createContext();
const STORAGE_KEY = 'tcg_reservations_v1';

export const ReservationProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch {}
  }, [items]);

  const isReserved = (productId) => items.some((i) => i.id === productId);

  const canReserve = (product) => {
    if (!product) return false;
    // Allow explicit preorder flag
    if (product.preorder === true) return true;
    // Allow if there's a releaseDate in the future
    if (product.releaseDate) {
      try {
        const rd = new Date(product.releaseDate);
        return rd.getTime() > Date.now();
      } catch {
        return false;
      }
    }
    return false;
  };

  // quantity: number of units reserved (default 1). Enforce max per-person limit (6)
  const reserve = (product, quantity = 1) => {
    if (!product || !product.id) return;
    if (!canReserve(product)) {
      toast.error('Solo puedes reservar productos que aún no han salido');
      return;
    }
    const qty = Math.max(1, Number(quantity) || 1);
    const MAX_PER_PERSON = 6;
    if (qty > MAX_PER_PERSON) {
      toast.error(`Máximo ${MAX_PER_PERSON} unidades por persona`);
      return;
    }
    if (isReserved(product.id)) {
      // if already reserved, update quantity (cap at MAX_PER_PERSON)
      setItems((cur) => cur.map((it) => it.id === product.id ? { ...it, quantity: Math.min(MAX_PER_PERSON, (it.quantity || 1) + qty) } : it));
      return;
    }
    const next = [{ id: product.id, name: product.name, slug: product.slug, reservedAt: Date.now(), quantity: Math.min(MAX_PER_PERSON, qty), snapshot: { price: product.price, stock: product.stock, preorder: product.preorder || false, releaseDate: product.releaseDate || null } }, ...items].slice(0, 50);
    setItems(next);
  };

  const unreserve = (productId) => {
    const next = items.filter((i) => i.id !== productId);
    setItems(next);
    // silent
  };

  const clear = () => {
    setItems([]);
    // silent
  };

  return (
    <ReservationContext.Provider value={{ items, reserve, unreserve, isReserved, canReserve, clear }}>
      {children}
    </ReservationContext.Provider>
  );
};

export const useReservation = () => useContext(ReservationContext);
