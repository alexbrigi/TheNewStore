import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../services/api.js';

// Simple profile sections: Orders, Addresses, Payment Methods, Wishlist (back-in-stock requests)

const Profile = () => {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [section, setSection] = useState('dashboard');
  const [wishlist, setWishlist] = useState([]);
  const [loadingWishlist, setLoadingWishlist] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const res = await api.get('/orders/my'); // assumes endpoint exists
        setOrders(res.data || []);
      } catch (e) {
        // ignore if endpoint not implemented
      } finally {
        setLoading(false);
      }
    };
    const fetchWishlist = async () => {
      setLoadingWishlist(true);
      try {
        const res = await api.get('/back-in-stock-requests/my'); // optional endpoint
        setWishlist(res.data || []);
      } catch (e) {
        // ignore if not available
      } finally {
        setLoadingWishlist(false);
      }
    };
    fetchOrders();
    fetchWishlist();
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-4">Mi perfil</h2>
        <p className="text-gray-600">Debes iniciar sesión para ver tu perfil.</p>
        <Link to="/login" className="btn-primary mt-4 inline-block">Entrar</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <aside className="col-span-1">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-lg shadow">
            <h3 className="font-bold text-lg mb-3">Mi cuenta</h3>
            <nav className="flex flex-col gap-1">
              <button className={`text-left px-3 py-2 rounded ${section === 'dashboard' ? 'bg-slate-100 dark:bg-slate-800' : ''}`} onClick={() => setSection('dashboard')}>Escritorio</button>
              <button className={`text-left px-3 py-2 rounded ${section === 'orders' ? 'bg-slate-100 dark:bg-slate-800' : ''}`} onClick={() => setSection('orders')}>Pedidos</button>
              <button className={`text-left px-3 py-2 rounded ${section === 'addresses' ? 'bg-slate-100 dark:bg-slate-800' : ''}`} onClick={() => setSection('addresses')}>Direcciones</button>
              <button className={`text-left px-3 py-2 rounded ${section === 'payments' ? 'bg-slate-100 dark:bg-slate-800' : ''}`} onClick={() => setSection('payments')}>Métodos de pago</button>
              <button className={`text-left px-3 py-2 rounded ${section === 'wishlist' ? 'bg-slate-100 dark:bg-slate-800' : ''}`} onClick={() => setSection('wishlist')}>Lista de deseos</button>
              <button className="text-left px-3 py-2 rounded" onClick={logout}>Cerrar sesión</button>
            </nav>
          </div>
        </aside>

        <main className="col-span-3">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-slate-800 flex items-center justify-center text-xl font-bold text-gray-700">{(user.username || 'U')[0].toUpperCase()}</div>
              <div>
                <h2 className="text-2xl font-bold">{user.username}</h2>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </div>

            <hr className="my-6 border-slate-100 dark:border-slate-800" />

            {section === 'dashboard' && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Resumen</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded">Pedidos<br/><span className="font-bold">{orders.length}</span></div>
                  <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded">Direcciones<br/><span className="font-bold">—</span></div>
                  <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded">Wishlist<br/><span className="font-bold">{wishlist.length}</span></div>
                </div>
              </div>
            )}

            {section === 'orders' && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Pedidos recientes</h3>
                {loading ? (
                  <p className="text-gray-500">Cargando...</p>
                ) : orders.length === 0 ? (
                  <p className="text-gray-500">No hay pedidos recientes.</p>
                ) : (
                  <ul className="space-y-3">
                    {orders.map((o) => (
                      <li key={o.id} className="p-3 bg-gray-50 dark:bg-slate-800 rounded flex items-center justify-between">
                        <div>
                          <div className="font-medium">Pedido {o.id}</div>
                          <div className="text-sm text-gray-500">{new Date(o.createdAt).toLocaleString()}</div>
                        </div>
                        <div className="font-semibold">{o.total.toFixed(2)}€</div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {section === 'addresses' && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Direcciones</h3>
                <p className="text-gray-500">Gestión de direcciones se puede añadir aquí.</p>
              </div>
            )}

            {section === 'payments' && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Métodos de pago</h3>
                <p className="text-gray-500">Guardar tarjetas o métodos de pago (placeholder).</p>
              </div>
            )}

            {section === 'wishlist' && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Lista de deseos / Avisos de reposición</h3>
                {loadingWishlist ? (
                  <p className="text-gray-500">Cargando...</p>
                ) : wishlist.length === 0 ? (
                  <p className="text-gray-500">No has pedido avisos de reposición todavía.</p>
                ) : (
                  <ul className="space-y-3">
                    {wishlist.map((w) => (
                      <li key={w.id} className="p-3 bg-gray-50 dark:bg-slate-800 rounded flex items-center justify-between">
                        <div>
                          <div className="font-medium">{w.product?.name || 'Producto'}</div>
                          <div className="text-sm text-gray-500">Solicitado: {new Date(w.createdAt).toLocaleString()}</div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={async () => {
                            try { await api.delete(`/back-in-stock-requests/${w.id}`); setWishlist((s) => s.filter(x => x.id !== w.id)); } catch (e) { }
                          }} className="btn-secondary">Eliminar</button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
};

export default Profile;
