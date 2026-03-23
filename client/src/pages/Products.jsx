import { useEffect, useState } from 'react';
import { useSearchParams, useParams, Link } from 'react-router-dom';
import { getProducts, getCategories } from '../services/productService.js';
import ProductCard from '../components/ui/ProductCard.jsx';
// Recently viewed carousel is shown globally in Layout.jsx

const SORT_OPTIONS = [
  { value: 'newest', label: 'Más recientes' },
  { value: 'price-asc', label: 'Precio: menor a mayor' },
  { value: 'price-desc', label: 'Precio: mayor a menor' },
];

const Products = () => {
  const { category: categorySlug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const page = Number(searchParams.get('page')) || 1;
  const sort = searchParams.get('sort') || 'newest';
  const search = searchParams.get('search') || '';

  useEffect(() => {
    getCategories().then(({ data }) => setCategories(data)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    // derive filters from URL and pass them to the API so sorting/pagination is correct
    const langFilters = searchParams.getAll('lang');
    const inStock = searchParams.get('inStock') === 'true';
    const outStock = searchParams.get('outStock') === 'true';
    const isNew = searchParams.get('isNew') === 'true';
    const isDiscount = searchParams.get('isDiscount') === 'true';

    getProducts({ category: categorySlug, sort, search, page, limit: 12, lang: langFilters, inStock: inStock ? 'true' : undefined, outStock: outStock ? 'true' : undefined, isNew: isNew ? 'true' : undefined, isDiscount: isDiscount ? 'true' : undefined })
      .then(({ data }) => {
        setProducts(data.products);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [categorySlug, sort, search, page, searchParams.toString()]);

  const updateParam = (key, value) => {
    const params = new URLSearchParams(searchParams);
    // If changing filters (not the page param itself), reset pagination to page 1
    if (key !== 'page') params.delete('page');
    if (value === undefined || value === null || value === '') params.delete(key); else params.set(key, value);
    setSearchParams(params);
  };

  const toggleParam = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (key !== 'page') params.delete('page');
    const current = params.get(key);
    if (current === value) params.delete(key); else params.set(key, value);
    setSearchParams(params);
  };

  const toggleListParam = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (key !== 'page') params.delete('page');
    const values = params.getAll(key);
    const exists = values.includes(value);
    // remove all current values for this key and re-add accordingly
    params.delete(key);
    if (!exists) {
      // add previous ones plus this
      values.filter((v) => v !== value).forEach((v) => params.append(key, v));
      params.append(key, value);
    } else {
      // re-add previous ones except this (already removed)
      values.filter((v) => v !== value).forEach((v) => params.append(key, v));
    }
    setSearchParams(params);
  };

  // Set page param and scroll to top smoothly
  const goToPage = (newPage) => {
    const params = new URLSearchParams(searchParams);
    if (!newPage || Number(newPage) <= 1) params.delete('page'); else params.set('page', String(newPage));
    setSearchParams(params);
    try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (e) {}
  };

  // Ensure we scroll to top when the page or category changes (robust fallback)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    // Wait a frame and a tiny timeout to ensure DOM updated before scrolling
    const raf = window.requestAnimationFrame(() => {
      const t = setTimeout(() => {
        try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (e) {}
      }, 40);
      // clear timeout if unmounted
      return () => clearTimeout(t);
    });
    return () => window.cancelAnimationFrame(raf);
  }, [page, categorySlug]);

  const activeCategory = categories.find((c) => c.slug === categorySlug);

  // Precio filter component (inline)
  function PriceFilter({ updateParam, searchParams }) {
    const [localMin, setLocalMin] = useState(() => {
      const v = searchParams.get('minPrice');
      return v !== null ? Number(v) : 0;
    });
    const [localMax, setLocalMax] = useState(() => {
      const v = searchParams.get('maxPrice');
      return v !== null ? Number(v) : 1000;
    });

    const minLimit = 0;
    const maxLimit = 5000;

    const applyMin = (val) => {
      const n = val === '' ? undefined : Number(val);
      setLocalMin(n ?? minLimit);
      updateParam('minPrice', n === undefined ? '' : String(n));
    };

    const applyMax = (val) => {
      const n = val === '' ? undefined : Number(val);
      setLocalMax(n ?? maxLimit);
      updateParam('maxPrice', n === undefined ? '' : String(n));
    };

    return (
      <div>
        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">Precio</label>
        <div className="flex items-center gap-3">
          <input type="number" className="input py-1 text-sm w-20" min={minLimit} max={maxLimit} value={localMin} onChange={(e) => applyMin(e.target.value)} />
          <span className="text-sm text-gray-500">—</span>
          <input type="number" className="input py-1 text-sm w-20" min={minLimit} max={maxLimit} value={localMax} onChange={(e) => applyMax(e.target.value)} />
        </div>
        <div className="mt-3">
          <input type="range" min={minLimit} max={maxLimit} value={localMin} onChange={(e) => applyMin(e.target.value)} />
          <input type="range" min={minLimit} max={maxLimit} value={localMax} onChange={(e) => applyMax(e.target.value)} className="mt-2" />
        </div>
      </div>
    );
  }

  // derive filters from URL
  const langFilters = searchParams.getAll('lang') || [];
  const inStockFilter = searchParams.get('inStock') === 'true';
  const outStockFilter = searchParams.get('outStock') === 'true';
  const isNewFilter = searchParams.get('isNew') === 'true';
  const isDiscountFilter = searchParams.get('isDiscount') === 'true';

  // apply client-side filters to fetched products (affects current page results)
  const displayedProducts = products.filter((p) => {
    if (langFilters.length && !langFilters.includes(p.language)) return false;
    if (inStockFilter && !(p.stock > 0)) return false;
    if (outStockFilter && !(p.stock === 0)) return false;
    if (isNewFilter && !p.isNew) return false;
    if (isDiscountFilter && !p.discount) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white">
          {activeCategory ? activeCategory.name : 'Todos los productos'}
        </h1>
        <p className="text-gray-500 dark:text-slate-400 mt-1">{total} productos encontrados</p>
      </div>

      {/* Filters bar */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar..."
            className="input pl-9 py-2 text-sm w-56 font-medium rounded-md"
            value={search}
            onChange={(e) => updateParam('search', e.target.value)}
          />
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Sort */}
        <select
          className="input py-2 text-sm w-auto"
          value={sort}
          onChange={(e) => updateParam('sort', e.target.value)}
        >
          {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        {/* Category filter */}
          <div className="flex flex-wrap gap-3">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/categoria/${cat.slug}`}
              onClick={() => {
                setLoading(true);
                setProducts([]);
                try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (e) {}
              }}
              className={`px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${cat.slug === categorySlug ? 'text-white border-transparent' : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-white hover:border-gray-400 dark:hover:border-slate-500'}`}
              style={cat.slug === categorySlug ? { backgroundColor: cat.color || '#e02424', borderColor: cat.color || '#e02424' } : {}}
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar filters */}
        <aside className="hidden lg:block lg:col-span-1">
          <div className="card p-4 space-y-4">
            <h3 className="font-semibold">Filtros</h3>

            {/* Nuevo (isNew) - primero */}
            <div>
              <label className="flex items-center gap-3">
                <input className="h-4 w-4 rounded text-primary-600" type="checkbox" checked={isNewFilter} onChange={() => toggleParam('isNew', 'true')} />
                <span className="ml-2 text-sm font-semibold text-primary-600">Nuevo</span>
              </label>
            </div>

            {/* Rebajado (isDiscount) - nuevo */}
            <div>
              <label className="flex items-center gap-3">
                <input className="h-4 w-4 rounded text-green-500" type="checkbox" checked={isDiscountFilter} onChange={() => toggleParam('isDiscount', 'true')} />
                <span className="ml-2 text-sm font-semibold text-green-700">Rebajado</span>
              </label>
            </div>

            <hr className="border-t my-3" />

            {/* Stock - segundo */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">Stock</label>
              <div className="flex flex-col gap-3">
                <label className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-200">
                  <input className="h-4 w-4 rounded text-primary-600" type="checkbox" checked={inStockFilter} onChange={() => toggleParam('inStock', 'true')} />
                  <span>En stock</span>
                </label>
                <label className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-200">
                  <input className="h-4 w-4 rounded text-primary-600" type="checkbox" checked={outStockFilter} onChange={() => toggleParam('outStock', 'true')} />
                  <span>Sin stock</span>
                </label>
              </div>
            </div>

            <hr className="border-t my-3" />

            {/* Idioma - tercero */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">Idioma</label>
              <div className="flex flex-col gap-3">
                <label className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-200">
                  <input className="h-4 w-4 rounded text-primary-600" type="checkbox" checked={searchParams.getAll('lang').includes('JAPANESE')} onChange={() => toggleListParam('lang', 'JAPANESE')} />
                  <span>Japones</span>
                </label>
                <label className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-200">
                  <input className="h-4 w-4 rounded text-primary-600" type="checkbox" checked={searchParams.getAll('lang').includes('ENGLISH')} onChange={() => toggleListParam('lang', 'ENGLISH')} />
                  <span>Inglés</span>
                </label>
                <label className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-200">
                  <input className="h-4 w-4 rounded text-primary-600" type="checkbox" checked={searchParams.getAll('lang').includes('KOREAN')} onChange={() => toggleListParam('lang', 'KOREAN')} />
                  <span>Coreano</span>
                </label>
                <label className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-200">
                  <input className="h-4 w-4 rounded text-primary-600" type="checkbox" checked={searchParams.getAll('lang').includes('CHINESE')} onChange={() => toggleListParam('lang', 'CHINESE')} />
                  <span>Chino</span>
                </label>
                <label className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-200">
                  <input className="h-4 w-4 rounded text-primary-600" type="checkbox" checked={searchParams.getAll('lang').includes('SPANISH')} onChange={() => toggleListParam('lang', 'SPANISH')} />
                  <span>Español</span>
                </label>
              </div>
            </div>

            <hr className="border-t my-3" />

            {/* Precio - slider rango */}
            <PriceFilter updateParam={updateParam} searchParams={searchParams} />

            <div className="pt-2">
              <button onClick={() => { setSearchParams(new URLSearchParams()); }} className="btn-secondary w-full">Limpiar filtros</button>
            </div>
          </div>
        </aside>

        {/* Products column */}
        <div className="col-span-1 lg:col-span-3">
      {/* Product grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
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
      ) : displayedProducts.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 dark:text-slate-400 text-lg">Sin resultados</p>
          <p className="text-sm text-gray-400 dark:text-slate-500 mt-1">Prueba con otros filtros o búsqueda</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {displayedProducts.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}



      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          <button
            disabled={page <= 1}
            onClick={() => goToPage(page - 1)}
            className="btn-secondary px-4 py-2 text-sm disabled:opacity-40"
          >
            ← Anterior
          </button>
          <span className="text-sm text-gray-600 dark:text-slate-400 px-4">
            Página {page} de {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => goToPage(page + 1)}
            className="btn-secondary px-4 py-2 text-sm disabled:opacity-40"
          >
            Siguiente →
          </button>
        </div>
      )}
        </div>
      </div>
    </div>
  );
};

export default Products;
