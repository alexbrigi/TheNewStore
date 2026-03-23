import { useEffect, useState } from 'react';
import api from '../../services/api.js';

const Revenue = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get('/orders')
      .then((res) => setOrders(res.data))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  const totalRevenue = orders.reduce((acc, o) => acc + (o.total || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">Ingresos</h1>
        <div className="text-lg font-bold">{totalRevenue.toFixed(2)}€</div>
      </div>

      <div className="card p-6">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-10 bg-gray-100 dark:bg-slate-700 rounded animate-pulse" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <p className="text-gray-500 dark:text-slate-400 text-center py-8">No hay pedidos</p>
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
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50">
                    <td className="py-2.5 font-mono text-xs text-gray-500 dark:text-slate-400">{order.id.slice(0,8)}…</td>
                    <td className="py-2.5 text-gray-900 dark:text-white">{order.user?.username || 'N/A'}</td>
                    <td className="py-2.5 font-semibold text-gray-900 dark:text-white">{order.total.toFixed(2)}€</td>
                    <td className="py-2.5">{order.status}</td>
                    <td className="py-2.5 text-gray-500 dark:text-slate-400">{new Date(order.createdAt).toLocaleDateString('es-ES')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Revenue;
