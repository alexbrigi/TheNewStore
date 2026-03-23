import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { getProductBySlug } from '../services/productService.js';

const KEY = 'tcg_recently_viewed_v1';
const MAX_ITEMS = 12;

const RecentlyViewedContext = createContext();

export const RecentlyViewedProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // Ref to ensure we only refresh once on mount (avoid loop when setItems updates)
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    if (!items || items.length === 0) return;

    let mounted = true;
    (async () => {
      try {
        const promises = items.slice(0, 12).map((it) => getProductBySlug(it.slug).then((r) => r.data).catch(() => null));
        const results = await Promise.all(promises);
        const refreshed = items.map((it, i) => {
          const p = results[i];
          if (!p) return it;
          return {
            ...it,
            name: p.name ?? it.name,
            images: p.images ?? it.images,
            price: p.price ?? it.price,
            discount: p.discount ?? it.discount,
            stock: typeof p.stock === 'number' ? p.stock : it.stock,
            preorder: p.preorder ?? it.preorder,
            releaseDate: p.releaseDate ?? it.releaseDate,
          };
        });
        if (mounted) setItems(refreshed);
      } catch {
        // ignore
      }
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {}
  }, [items]);

  const push = (product) => {
    if (!product || !product.id) return;
    setItems((prev) => {
      const without = prev.filter((p) => p.id !== product.id);
      const next = [product, ...without].slice(0, MAX_ITEMS);
      return next;
    });
  };

  const clear = () => setItems([]);

  return (
    <RecentlyViewedContext.Provider value={{ items, push, clear }}>
      {children}
    </RecentlyViewedContext.Provider>
  );
};

export const useRecentlyViewed = () => useContext(RecentlyViewedContext);

export default RecentlyViewedContext;
