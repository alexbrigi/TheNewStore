import { useEffect, useState } from 'react';
import {
  getProducts,
  getCategories,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../../services/productService.js';
import toast from 'react-hot-toast';
import LanguageFlag from '../../components/ui/LanguageFlag.jsx';

const EMPTY_FORM = {
  name: '', description: '', price: '', stock: '', categoryId: '',
  featured: false, isNew: false, discount: '', images: '', language: 'ENGLISH', outOfStock: false,
  preorder: false, releaseDate: '',
};

const ProductsAdmin = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [imagesList, setImagesList] = useState([]); // { src, file? }
  const [uploadingImages, setUploadingImages] = useState(false);
  const [search, setSearch] = useState('');

  const fetchData = async (category) => {
    setLoading(true);
    try {
      const catRes = await getCategories();
      setCategories(catRes.data);

      const params = { limit: 100 };
      const cat = category ?? selectedCategory;
      if (cat && cat !== 'ALL') params.category = cat;
      const prodRes = await getProducts(params);
      setProducts(prodRes.data.products);
    } catch {
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);
  useEffect(() => { fetchData(selectedCategory); }, [selectedCategory]);

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setShowForm(true); };
  
  // ensure images reset when creating new
  const openCreateReset = () => { setEditing(null); setForm(EMPTY_FORM); setImagesList([]); setShowForm(true); };

  const openEdit = (p) => {
    setEditing(p.id);
    setForm({
      name: p.name,
      description: p.description || '',
      price: p.price,
      stock: p.stock,
      categoryId: p.categoryId,
      featured: p.featured,
      isNew: p.isNew,
      discount: p.discount || '',
      images: '',
      language: p.language || 'ENGLISH',
      outOfStock: p.stock === 0,
      preorder: p.preorder || false,
      releaseDate: p.releaseDate ? new Date(p.releaseDate).toISOString().slice(0,16) : '',
    });
    setImagesList((p.images || []).map((u) => ({ src: u })));
    setShowForm(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleFilesChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const items = files.map((f) => ({ src: URL.createObjectURL(f), file: f }));
    setImagesList((s) => [...s, ...items]);
  };

  const handleDragOver = (e) => { e.preventDefault(); };
  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files || []).filter((f) => f.type.startsWith('image/'));
    if (files.length === 0) return;
    const items = files.map((f) => ({ src: URL.createObjectURL(f), file: f }));
    setImagesList((s) => [...s, ...items]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.categoryId) { toast.error('Nombre, precio y categoría son obligatorios'); return; }
    setSaving(true);
    try {
      const manualUrls = form.images ? form.images.split(',').map((s) => s.trim()).filter(Boolean) : [];

      // If there are files to upload, send them now and replace previews with real URLs
      let uploadedUrls = [];
      const filesToUpload = imagesList.filter((it) => it.file).map((it) => it.file);
      if (filesToUpload.length > 0) {
        try {
          setUploadingImages(true);
          const fd = new FormData();
          filesToUpload.forEach((f) => fd.append('images', f));
          const res = await fetch('/api/upload', { method: 'POST', body: fd });
          const data = await res.json();
          const imgs = data.images || [];
          // Save full/original URLs to the product; thumbnails will be derived on the client for listings
          uploadedUrls = imgs.map((it) => it.url);
        } catch (err) {
          toast.error('Error subiendo imágenes');
        } finally {
          setUploadingImages(false);
        }
      }

      // Build final images list keeping order: replace file entries with uploadedUrls in sequence
      const uploadedQueue = [...uploadedUrls];
      const existingUploaded = imagesList
        .map((it) => (it.file ? uploadedQueue.shift() : it.src))
        .filter(Boolean);
      const finalImages = [...existingUploaded, ...manualUrls];

      const payload = {
        ...form,
        price: parseFloat(form.price),
        stock: form.outOfStock ? 0 : (parseInt(form.stock) || 0),
        discount: form.discount ? parseInt(form.discount) : null,
        images: finalImages,
      };
      // normalize releaseDate (convert from datetime-local to ISO) or remove if empty
      if (form.releaseDate) payload.releaseDate = new Date(form.releaseDate).toISOString(); else payload.releaseDate = null;
      payload.preorder = !!form.preorder;
      if (editing) {
        await updateProduct(editing, payload);
        toast.success('Producto actualizado');
      } else {
        await createProduct(payload);
        toast.success('Producto creado');
      }
      setShowForm(false);
      // revoke any object URLs created for previews
      imagesList.forEach((it) => { if (it?.file) URL.revokeObjectURL(it.src); });
      setImagesList([]);
      fetchData();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`¿Eliminar "${name}"?`)) return;
    try {
      await deleteProduct(id);
      toast.success('Producto eliminado');
      fetchData();
    } catch {
      toast.error('Error al eliminar');
    }
  };

  const toggleFlag = async (id, field, current) => {
    const prev = products;
    try {
      setUpdatingFlagIds((s) => [...s, id]);
      // optimistic update locally to avoid full-table reload and flicker
      setProducts((s) => s.map((p) => (p.id === id ? { ...p, [field]: !current } : p)));

      await updateProduct(id, { [field]: !current });
      toast.success('Actualizado');
    } catch (err) {
      toast.error('Error al actualizar');
      setProducts(prev);
    } finally {
      setUpdatingFlagIds((s) => s.filter((x) => x !== id));
    }
  };

  const [updatingStockIds, setUpdatingStockIds] = useState([]);
  const [discountEdits, setDiscountEdits] = useState({});
  const [stockEdits, setStockEdits] = useState({});
  const [updatingDiscountIds, setUpdatingDiscountIds] = useState([]);
  const [updatingFlagIds, setUpdatingFlagIds] = useState([]);

  const modifyStock = async (id, current, delta) => {
    // Always treat +/- as modifying the inline edit value only.
    const base = stockEdits[id] !== undefined ? (Number(stockEdits[id]) || 0) : (Number(current) || 0);
    const newStock = Math.max(0, base + delta);
    // update inline edit state; do NOT call API yet — user must press save (💾)
    setStockEdits((s) => ({ ...s, [id]: newStock }));
  };

  const isUpdating = (id) => updatingStockIds.includes(id);

  const isUpdatingDiscount = (id) => updatingDiscountIds.includes(id);

  const handleDiscountChangeInline = (id, value) => {
    // normalize and clamp between 0 and 100; allow empty string to clear
    let next = value;
    if (next !== '' && next !== null && next !== undefined) {
      next = Number(next);
      if (Number.isNaN(next)) next = '';
      else next = Math.max(0, Math.min(100, Math.round(next)));
    }
    setDiscountEdits((s) => ({ ...s, [id]: next }));
  };

  const handleStockChangeInline = (id, value) => {
    let next = value;
    if (next !== '' && next !== null && next !== undefined) {
      next = Number(next);
      if (Number.isNaN(next)) next = '';
      else next = Math.max(0, Math.round(next));
    }
    setStockEdits((s) => ({ ...s, [id]: next }));
  };

  const saveInlineStock = async (id) => {
    if (isUpdating(id)) return;
    const raw = stockEdits[id];
    const val = raw === '' || raw === null || raw === undefined ? 0 : parseInt(raw);
    const prev = products;
    try {
      setUpdatingStockIds((s) => [...s, id]);
      // optimistic update
      setProducts((s) => s.map((p) => (p.id === id ? { ...p, stock: val } : p)));
      await updateProduct(id, { stock: val });
      toast.success('Stock actualizado');
      setStockEdits((s) => {
        const copy = { ...s };
        delete copy[id];
        return copy;
      });
    } catch (err) {
      toast.error('Error actualizando stock');
      setProducts(prev);
    } finally {
      setUpdatingStockIds((s) => s.filter((x) => x !== id));
    }
  };

  const saveInlineDiscount = async (id) => {
    if (isUpdatingDiscount(id)) return;
    const raw = discountEdits[id];
    const val = raw === '' || raw === null || raw === undefined ? null : parseInt(raw);
    try {
      setUpdatingDiscountIds((s) => [...s, id]);
      await updateProduct(id, { discount: val });
      toast.success('Descuento actualizado');
      await fetchData(selectedCategory);
      setDiscountEdits((s) => {
        const copy = { ...s };
        delete copy[id];
        return copy;
      });
    } catch (err) {
      toast.error('Error actualizando descuento');
    } finally {
      setUpdatingDiscountIds((s) => s.filter((x) => x !== id));
    }
  };

  // Save both stock and discount edits for a single row (manual per-row save)
  const saveRow = async (id) => {
    const hasStock = Object.prototype.hasOwnProperty.call(stockEdits, id);
    const hasDiscount = Object.prototype.hasOwnProperty.call(discountEdits, id);
    if (!hasStock && !hasDiscount) return;

    const payload = {};
    if (hasStock) {
      const raw = stockEdits[id];
      payload.stock = raw === '' || raw === null || raw === undefined ? 0 : parseInt(raw);
    }
    if (hasDiscount) {
      const raw = discountEdits[id];
      payload.discount = raw === '' || raw === null || raw === undefined ? null : parseInt(raw);
    }

    const prev = products;
    try {
      if (hasStock) setUpdatingStockIds((s) => [...s, id]);
      if (hasDiscount) setUpdatingDiscountIds((s) => [...s, id]);

      // optimistic local update for immediate feedback
      setProducts((s) => s.map((p) => (p.id === id ? { ...p, ...(payload.stock !== undefined ? { stock: payload.stock } : {}), ...(payload.discount !== undefined ? { discount: payload.discount } : {}) } : p)));

      await updateProduct(id, payload);
      toast.success('Cambios guardados');

      // refresh to ensure server canonical data (keeps complex derived fields in sync)
      await fetchData(selectedCategory);

      // clear inline edits for this row
      setStockEdits((s) => { const c = { ...s }; delete c[id]; return c; });
      setDiscountEdits((s) => { const c = { ...s }; delete c[id]; return c; });
    } catch (err) {
      toast.error('Error guardando cambios');
      setProducts(prev);
    } finally {
      if (hasStock) setUpdatingStockIds((s) => s.filter((x) => x !== id));
      if (hasDiscount) setUpdatingDiscountIds((s) => s.filter((x) => x !== id));
    }
  };

  const filtered = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">Gestión de Productos</h1>
          <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">{products.length} productos {selectedCategory !== 'ALL' && (<span>en { (categories.find(c => c.slug === selectedCategory) || {}).name }</span>)}</p>
        </div>
        <button onClick={openCreateReset} className="btn-primary">+ Nuevo producto</button>
      </div>

      {/* Categories + Search */}
      <div className="mb-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex gap-2 overflow-x-auto">
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`px-3 py-1 rounded ${selectedCategory === 'ALL' ? 'text-white' : 'text-gray-700 dark:text-slate-200'}`}
              style={selectedCategory === 'ALL' ? { backgroundColor: '#e02424', borderColor: '#e02424' } : {}}
            >
              Todas
            </button>
            {categories.map((c) => {
              const active = selectedCategory === c.slug;
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.slug)}
                  className={`px-3 py-1 rounded flex items-center gap-2 focus:outline-none focus:ring-0 ${active ? 'text-white' : 'text-gray-700 dark:text-slate-200'}`}
                  style={active ? { backgroundColor: c.color || '#e02424', borderColor: c.color || '#e02424', filter: 'brightness(0.82)' } : {}}
                >
                  {/* removed small colored square to avoid checkbox-like artifact; keep only optional image */}
                  {c.image ? (
                    <img src={c.image} alt={c.name} className="w-6 h-6 rounded object-cover" />
                  ) : null}
                  <span className="text-sm font-medium">{c.name}</span>
                </button>
              );
            })}
          </div>

          <input
            type="text"
            placeholder="Buscar producto..."
            className="input max-w-xs ml-auto"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Tabla */}
      {loading ? (
        <div className="card p-8 text-center text-gray-500 dark:text-slate-400">Cargando...</div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm table-fixed">
              <thead className="bg-gray-50 dark:bg-slate-800">
                <tr className="text-left text-gray-600 dark:text-slate-400">
                    <th className="px-4 py-3 font-semibold w-20">Imagen</th>
                    <th className="px-4 py-3 font-semibold w-48">Nombre</th>
                    <th className="px-4 py-3 font-semibold w-36">Categoría</th>
                    <th className="px-4 py-3 font-semibold w-24">Precio</th>
                    <th className="px-4 py-3 font-semibold w-32 text-center">Stock</th>
                    <th className="px-4 py-3 font-semibold w-20 text-center">Idioma</th>
                    <th className="px-4 py-3 font-semibold w-56">Estado</th>
                    <th className="px-4 py-3 font-semibold w-48">Acciones</th>
                  </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-500 dark:text-slate-400">Sin productos</td></tr>
                ) : filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50">
                    <td className="px-4 py-3">
                      <img src={p.images?.[0] || 'https://placehold.co/40x40/e2e8f0/94a3b8?text=?'} alt={p.name} className="w-10 h-10 rounded-lg object-cover" />
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white w-48 truncate">{p.name}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-slate-400">{p.category?.name}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white text-left">
                      {(() => {
                        const disc = discountEdits[p.id] !== undefined ? discountEdits[p.id] : (p.discount ?? 0);
                        if (disc !== '' && Number(disc) > 0) {
                          const discounted = (p.price * (1 - Number(disc) / 100)).toFixed(2);
                          return (
                            <div className="flex flex-col items-start justify-center">
                              <span className="text-gray-900 dark:text-white font-semibold">{discounted}€</span>
                              <span className="text-sm line-through text-gray-400 dark:text-slate-500">{p.price.toFixed(2)}€</span>
                            </div>
                          );
                        }
                        return <div className="flex items-center justify-start"><span className="font-semibold text-gray-900 dark:text-white">{p.price.toFixed(2)}€</span></div>;
                      })()}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="inline-flex items-center gap-2 justify-center">
                        <button
                          onClick={() => modifyStock(p.id, p.stock, -1)}
                          disabled={isUpdating(p.id) || (p.stock || 0) <= 0}
                          className="w-8 h-8 flex items-center justify-center rounded bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 disabled:opacity-50"
                        >
                          −
                        </button>
                        {stockEdits[p.id] !== undefined ? (
                          <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={stockEdits[p.id]}
                            onChange={(e) => handleStockChangeInline(p.id, e.target.value === '' ? '' : e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Escape') { setStockEdits((s) => { const c = { ...s }; delete c[p.id]; return c; }); } }}
                            className="w-12 px-1 py-1 text-center font-medium text-gray-900 dark:text-white input text-sm flex-none"
                            disabled={isUpdating(p.id)}
                          />
                        ) : (
                          <span onClick={() => setStockEdits((s) => ({ ...s, [p.id]: p.stock }))} className="w-12 px-1 py-1 text-center font-medium text-gray-900 dark:text-white cursor-text flex-none">
                            {p.stock}
                          </span>
                        )}
                        <button
                          onClick={() => modifyStock(p.id, p.stock, 1)}
                          disabled={isUpdating(p.id)}
                          className="w-8 h-8 flex items-center justify-center rounded bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 disabled:opacity-50"
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center pl-8">
                      <LanguageFlag code={p.language} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-start gap-4">
                        <div className="flex items-center gap-2">
                          <div className="relative group">
                              <input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                value={discountEdits[p.id] !== undefined ? discountEdits[p.id] : (p.discount ?? '')}
                                  onFocus={() => { if (discountEdits[p.id] === undefined) setDiscountEdits((s) => ({ ...s, [p.id]: p.discount ?? '' })); }}
                                  onChange={(e) => handleDiscountChangeInline(p.id, e.target.value === '' ? '' : e.target.value)}
                                  onKeyDown={(e) => { if (e.key === 'Escape') { setDiscountEdits((s) => { const c = { ...s }; delete c[p.id]; return c; }); } }}
                                  className={`w-20 input text-sm pr-10 ${((discountEdits[p.id] !== undefined && Number(discountEdits[p.id]) > 0) || (p.discount && Number(p.discount) > 0)) ? '!border !border-green-700 !focus:ring-green-500' : ''}`}
                                placeholder="%"
                                disabled={isUpdatingDiscount(p.id)}
                              />
                              <div className={`absolute right-10 top-1/2 -translate-y-1/2 h-4 w-px ${((discountEdits[p.id] !== undefined && Number(discountEdits[p.id]) > 0) || (p.discount && Number(p.discount) > 0)) ? 'bg-green-300 dark:bg-green-900' : 'bg-gray-200 dark:bg-slate-700'}`} aria-hidden="true" />
                              <div className="absolute right-1 top-1/2 -translate-y-1/2 flex flex-col gap-0.5 select-none">
                                <button
                                  type="button"
                                  aria-label="Incrementar descuento"
                                  title="Incrementar"
                                  onClick={() => {
                                    const current = discountEdits[p.id] !== undefined ? discountEdits[p.id] : (p.discount ?? 0);
                                    const next = current === '' ? 0 : Math.min(100, (Number(current) || 0) + 1);
                                    setDiscountEdits((s) => ({ ...s, [p.id]: next }));
                                  }}
                                  className={`w-6 h-4 rounded-sm bg-transparent hover:bg-gray-100 dark:hover:bg-slate-800 flex items-center justify-center focus:outline-none transition ${((discountEdits[p.id] !== undefined && Number(discountEdits[p.id]) > 0) || (p.discount && Number(p.discount) > 0)) ? '!focus:ring-1 !focus:ring-green-500' : 'focus:ring-1 focus:ring-primary-500'}`}
                                >
                                  <svg className={`w-2.5 h-2.5 ${((discountEdits[p.id] !== undefined && Number(discountEdits[p.id]) > 0) || (p.discount && Number(p.discount) > 0)) ? '!text-green-700' : 'text-gray-700 dark:text-gray-200'}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                    <path fillRule="evenodd" d="M5.23 12.21a.75.75 0 001.06.02L10 8.56l3.71 3.67a.75.75 0 001.08-1.04l-4.25-4.2a.75.75 0 00-1.06 0L5.2 11.19a.75.75 0 00.03 1.02z" clipRule="evenodd" />
                                  </svg>
                                </button>
                                <button
                                  type="button"
                                  aria-label="Disminuir descuento"
                                  title="Disminuir"
                                  onClick={() => {
                                    const current = discountEdits[p.id] !== undefined ? discountEdits[p.id] : (p.discount ?? 0);
                                    const next = current === '' ? 0 : Math.max(0, (Number(current) || 0) - 1);
                                    setDiscountEdits((s) => ({ ...s, [p.id]: next }));
                                  }}
                                  className={`w-6 h-4 rounded-sm bg-transparent hover:bg-gray-100 dark:hover:bg-slate-800 flex items-center justify-center focus:outline-none transition ${((discountEdits[p.id] !== undefined && Number(discountEdits[p.id]) > 0) || (p.discount && Number(p.discount) > 0)) ? '!focus:ring-1 !focus:ring-green-500' : 'focus:ring-1 focus:ring-primary-500'}`}
                                >
                                  <svg className={`w-2.5 h-2.5 ${((discountEdits[p.id] !== undefined && Number(discountEdits[p.id]) > 0) || (p.discount && Number(p.discount) > 0)) ? '!text-green-700' : 'text-gray-700 dark:text-gray-200'} rotate-180`} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                    <path fillRule="evenodd" d="M5.23 12.21a.75.75 0 001.06.02L10 8.56l3.71 3.67a.75.75 0 001.08-1.04l-4.25-4.2a.75.75 0 00-1.06 0L5.2 11.19a.75.75 0 00.03 1.02z" clipRule="evenodd" />
                                  </svg>
                                </button>
                              </div>
                          </div>
                          {isUpdatingDiscount(p.id) && <span className="text-xs text-gray-500">Guardando...</span>}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            title={p.isNew ? 'Quitar etiqueta Nuevo' : 'Marcar como Nuevo'}
                            onClick={() => toggleFlag(p.id, 'isNew', p.isNew)}
                            disabled={updatingFlagIds.includes(p.id)}
                            aria-busy={updatingFlagIds.includes(p.id)}
                            className={`text-xs px-2 py-1 rounded font-medium transition-colors ${p.isNew ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400' : 'bg-transparent text-gray-400 opacity-60 dark:text-slate-400'} ${updatingFlagIds.includes(p.id) ? 'opacity-50 cursor-wait' : ''}`}
                          >
                            Nuevo
                          </button>

                          <button
                            title={p.featured ? 'Quitar destacado' : 'Marcar como destacado'}
                            onClick={() => toggleFlag(p.id, 'featured', p.featured)}
                            disabled={updatingFlagIds.includes(p.id)}
                            aria-busy={updatingFlagIds.includes(p.id)}
                            className={`text-xs px-2 py-1 rounded font-medium transition-colors ${p.featured ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' : 'bg-transparent text-gray-400 opacity-60 dark:text-slate-400'} ${updatingFlagIds.includes(p.id) ? 'opacity-50 cursor-wait' : ''}`}
                          >
                            ★
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 items-center">
                        <button
                          onClick={() => saveRow(p.id)}
                          title="Guardar cambios"
                          aria-label="Guardar cambios"
                          disabled={isUpdating(p.id) || isUpdatingDiscount(p.id) || (stockEdits[p.id] === undefined && discountEdits[p.id] === undefined)}
                          className="text-sm px-2 py-1 rounded-lg bg-transparent hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                        >
                          <span style={{ fontSize: '16px' }} aria-hidden>💾</span>
                        </button>

                        <button onClick={() => openEdit(p)} className="text-xs btn-secondary px-2 py-1">Editar</button>
                        <button onClick={() => handleDelete(p.id, p.name)} className="text-xs bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 font-semibold px-2 py-1 rounded-lg transition-colors">Borrar</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal / Formulario */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={(e) => e.target === e.currentTarget && setShowForm(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {editing ? 'Editar producto' : 'Nuevo producto'}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Nombre *</label>
                <input type="text" name="name" className="input" value={form.name} onChange={handleChange} placeholder="Nombre del producto" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Categoría *</label>
                <select name="categoryId" className="input" value={form.categoryId} onChange={handleChange}>
                  <option value="">Seleccionar categoría</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Precio (€) *</label>
                  <input type="number" name="price" className="input" value={form.price} onChange={handleChange} placeholder="0.00" step="0.01" min="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Stock</label>
                  <div className="flex items-center gap-2">
                    <input type="number" name="stock" className="input" value={form.stock} onChange={handleChange} placeholder="0" min="0" disabled={form.outOfStock} />
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" name="outOfStock" checked={form.outOfStock || false} onChange={(e) => setForm({ ...form, outOfStock: e.target.checked, stock: e.target.checked ? 0 : form.stock || 0 })} />
                      <span>Sin stock</span>
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Descuento (%)</label>
                <input type="number" name="discount" className="input" value={form.discount} onChange={handleChange} placeholder="Ej: 10" min="0" max="100" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Descripción</label>
                <textarea name="description" className="input resize-none" rows={3} value={form.description} onChange={handleChange} placeholder="Descripción del producto..." />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Idioma / Estado</label>
                <select name="language" className="input" value={form.language} onChange={handleChange}>
                  <option value="JAPANESE">Japones (jp)</option>
                  <option value="ENGLISH">English (en)</option>
                  <option value="KOREAN">Coreano (kr)</option>
                  <option value="CHINESE">Chino (cn)</option>
                  <option value="SPANISH">Español (es)</option>
                </select>
              </div>

                <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Subir imágenes (opcional)</label>
                <div onDragOver={handleDragOver} onDrop={handleDrop} className="p-4 border-2 border-dashed rounded-lg text-center cursor-pointer">
                  <input type="file" accept="image/*" multiple onChange={handleFilesChange} className="block w-full text-sm text-gray-600" />
                  <div className="text-sm text-gray-500 mt-2">Arrastra y suelta aquí o haz click para seleccionar</div>
                </div>
                {uploadingImages && <div className="mt-2 text-sm text-gray-600">Subiendo imágenes...</div>}

                {/* Preview thumbnails: grid limpio sin scroll lateral */}
                {imagesList.length > 0 && (
                  <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {imagesList.map((item, idx) => (
                      <div key={(item.src ?? '') + idx} className="relative bg-white dark:bg-slate-800 rounded overflow-hidden shadow-sm">
                        <img
                          src={item.file ? item.src : (item.src && item.src.includes('/uploads/') ? deriveThumb(item.src) : item.src)}
                          alt={`img-${idx}`}
                          className={`w-full h-28 object-contain bg-white`}
                        />
                        {/* overlay controls */}
                        <div className="absolute top-2 right-2 flex flex-col gap-2">
                          <button type="button" title="Marcar como principal" onClick={() => {
                            setImagesList((s) => {
                              const copy = [...s];
                              const [it] = copy.splice(idx, 1);
                              copy.unshift(it);
                              return copy;
                            });
                          }} className={`w-8 h-8 rounded-full flex items-center justify-center ${idx === 0 ? 'bg-primary-600 text-white' : 'bg-white/80 dark:bg-slate-900/80 text-gray-700'}`}>
                            ★
                          </button>
                          <button type="button" title="Eliminar" onClick={() => {
                            const toRemove = imagesList[idx];
                            if (toRemove?.file) URL.revokeObjectURL(toRemove.src);
                            setImagesList((s) => s.filter((_, i) => i !== idx));
                          }} className="w-8 h-8 rounded-full bg-white/90 dark:bg-slate-900/80 flex items-center justify-center text-red-600">✕</button>
                        </div>
                        {idx === 0 && (
                          <div className="absolute left-2 bottom-2 px-2 py-0.5 bg-primary-600 text-white text-xs rounded">Principal</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="featured" checked={form.featured} onChange={handleChange} className="w-4 h-4 text-primary-600 rounded" />
                  <span className="text-sm text-gray-700 dark:text-slate-300">Destacado</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="isNew" checked={form.isNew} onChange={handleChange} className="w-4 h-4 text-primary-600 rounded" />
                  <span className="text-sm text-gray-700 dark:text-slate-300">Novedad</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="preorder" checked={form.preorder} onChange={handleChange} className="w-4 h-4 text-amber-600 rounded" />
                  <span className="text-sm text-gray-700 dark:text-slate-300">Reservable (Pre-order)</span>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Fecha de salida (opcional)</label>
                  <input type="datetime-local" name="releaseDate" className="input" value={form.releaseDate} onChange={handleChange} />
                </div>
                <div />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="btn-primary flex-1 py-2.5 disabled:opacity-70">
                  {saving ? 'Guardando...' : editing ? 'Guardar cambios' : 'Crear producto'}
                </button>
                <button type="button" onClick={() => { setShowForm(false); setImagesList([]); }} className="btn-secondary px-6">
                    Cancelar
                  </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsAdmin;
