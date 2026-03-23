import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api.js';

const StatCard = ({ label, value, icon, color, to }) => (
  <a href={to} className="card p-6 block hover:shadow-md">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500 dark:text-slate-400">{label}</p>
        <p className="text-3xl font-black text-gray-900 dark:text-white mt-1">{value}</p>
      </div>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${color}`}>
        {icon}
      </div>
    </div>
  </a>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState({ products: 0, orders: 0, users: 0, revenue: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/products?limit=1'),
      api.get('/orders'),
    ])
      .then(([prodRes, orderRes]) => {
        const orders = orderRes.data;
        setStats({
          products: prodRes.data.total,
          orders: orders.length,
          users: new Set(orders.map((o) => o.userId)).size,
          revenue: orders.filter((o) => o.status !== 'CANCELLED').reduce((acc, o) => acc + o.total, 0),
        });
        setRecentOrders(orders.slice(0, 8));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const STATUS_LABELS = {
    PENDING: { text: 'Pendiente', class: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
    PROCESSING: { text: 'En proceso', class: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
    SHIPPED: { text: 'Enviado', class: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' },
    DELIVERED: { text: 'Entregado', class: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
    CANCELLED: { text: 'Cancelado', class: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white">Panel de Admin</h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1">Resumen de tu tienda</p>
        </div>
        <Link to="/admin/productos" className="btn-primary">
          + Nuevo producto
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard to="/admin/productos" label="Productos" value={loading ? '...' : stats.products} icon="📦" color="bg-blue-100 dark:bg-blue-900/30" />
        <StatCard to="/admin/pedidos" label="Pedidos" value={loading ? '...' : stats.orders} icon="🛒" color="bg-green-100 dark:bg-green-900/30" />
        <StatCard to="/admin/clientes" label="Clientes" value={loading ? '...' : stats.users} icon="👥" color="bg-purple-100 dark:bg-purple-900/30" />
        <StatCard to="/admin/ingresos" label="Ingresos" value={loading ? '...' : `${stats.revenue.toFixed(0)}€`} icon="💰" color="bg-yellow-100 dark:bg-yellow-900/30" />
      </div>

      {/* Accesos rápidos (solo productos y pedidos) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {[
          { title: 'Gestionar productos', desc: 'Añadir, editar y eliminar productos', link: '/admin/productos', icon: '📦' },
          { title: 'Ver pedidos', desc: 'Consultar y gestionar pedidos', link: '/admin/pedidos', icon: '📋' },
        ].map((item) => (
          <Link key={item.link} to={item.link} className="card p-5 hover:scale-[1.02] transition-transform">
            <span className="text-3xl mb-3 block">{item.icon}</span>
            <h3 className="font-bold text-gray-900 dark:text-white">{item.title}</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{item.desc}</p>
          </Link>
        ))}
      </div>

      {/* Pedidos recientes */}
      <div className="card p-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Pedidos recientes</h2>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-10 bg-gray-100 dark:bg-slate-700 rounded animate-pulse" />
            ))}
          </div>
        ) : recentOrders.length === 0 ? (
          <p className="text-gray-500 dark:text-slate-400 text-center py-8">No hay pedidos aún</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 dark:text-slate-400 border-b border-gray-100 dark:border-slate-700">
                  <th className="pb-2 font-medium">ID</th>
                  <th className="pb-2 font-medium">Cliente</th>
                  <th className="pb-2 font-medium">Total</th>
                  <th className="pb-2 font-medium">Estado</th>
                  <th className="pb-2 font-medium">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                {recentOrders.map((order) => {
                  const s = STATUS_LABELS[order.status] || STATUS_LABELS.PENDING;
                  return (
                    <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50">
                      <td className="py-2.5 font-mono text-xs text-gray-500 dark:text-slate-400">{order.id.slice(0, 8)}…</td>
                      <td className="py-2.5 text-gray-900 dark:text-white">{order.user?.username || 'N/A'}</td>
                      <td className="py-2.5 font-semibold text-gray-900 dark:text-white">{order.total.toFixed(2)}€</td>
                      <td className="py-2.5">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${s.class}`}>{s.text}</span>
                      </td>
                      <td className="py-2.5 text-gray-500 dark:text-slate-400">{new Date(order.createdAt).toLocaleDateString('es-ES')}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
