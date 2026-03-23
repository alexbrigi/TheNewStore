import { useEffect, useState } from 'react';
import api from '../../services/api.js';

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get('/users')
      .then((res) => setClients(res.data))
      .catch(() => setClients([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">Clientes</h1>
      </div>

      <div className="card p-6">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-10 bg-gray-100 dark:bg-slate-700 rounded animate-pulse" />
            ))}
          </div>
        ) : clients.length === 0 ? (
          <p className="text-gray-500 dark:text-slate-400 text-center py-8">No hay clientes</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 dark:text-slate-400 border-b border-gray-100 dark:border-slate-700">
                  <th className="pb-2 font-medium">ID</th>
                  <th className="pb-2 font-medium">Usuario</th>
                  <th className="pb-2 font-medium">Email</th>
                  <th className="pb-2 font-medium">Rol</th>
                  <th className="pb-2 font-medium">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                {clients.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50">
                    <td className="py-2.5 font-mono text-xs text-gray-500 dark:text-slate-400">{u.id.slice(0,8)}…</td>
                    <td className="py-2.5 text-gray-900 dark:text-white">{u.username}</td>
                    <td className="py-2.5 text-gray-500 dark:text-slate-400">{u.email}</td>
                    <td className="py-2.5 text-gray-500 dark:text-slate-400">{u.role}</td>
                    <td className="py-2.5 text-gray-500 dark:text-slate-400">{new Date(u.createdAt).toLocaleDateString('es-ES')}</td>
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

export default Clients;
