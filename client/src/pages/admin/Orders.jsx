import { useEffect, useState } from 'react';
import api from '../../services/api.js';
import ConfirmModal from '../../components/ui/ConfirmModal.jsx';

const STATUS_LABELS = {
  PENDING: { text: 'Pendiente', class: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
  PROCESSING: { text: 'En proceso', class: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
  SHIPPED: { text: 'Enviado', class: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' },
  DELIVERED: { text: 'Entregado', class: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
  CANCELLED: { text: 'Cancelado', class: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [confirm, setConfirm] = useState({ open: false, type: null, id: null });

  useEffect(() => {
    setLoading(true);
    api.get('/orders')
      .then((res) => setOrders(res.data))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  const refresh = () => {
    setLoading(true);
    api.get('/orders')
      .then((res) => setOrders(res.data))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  };

  const handleCancel = async (id) => {
    setConfirm({ open: true, type: 'cancel', id });
  };

  const handleDelete = async (id) => {
    setConfirm({ open: true, type: 'delete', id });
  };

  const handleSimulatePayment = async (id) => {
    setConfirm({ open: true, type: 'simulate', id });
  };

  const handleConfirmOrder = async (id) => {
    setConfirm({ open: true, type: 'confirm', id });
  };

  const closeConfirm = () => setConfirm({ open: false, type: null, id: null });

  const performConfirm = async () => {
    if (!confirm.open || !confirm.type) return;
    const id = confirm.id;
    try {
      setActionLoading(true);
      if (confirm.type === 'cancel') {
        await api.patch(`/orders/${id}/status`, { status: 'CANCELLED' });
      } else if (confirm.type === 'delete') {
        await api.delete(`/orders/${id}`);
      } else if (confirm.type === 'confirm') {
        await api.patch(`/orders/${id}/status`, { status: 'PROCESSING' });
      } else if (confirm.type === 'simulate') {
        await api.post(`/payments/simulate/${id}`);
      }
      refresh();
      setSelectedOrder(null);
      closeConfirm();
    } catch (e) {
      console.error(e);
      alert('Error al ejecutar la acción');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">Pedidos</h1>
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
                  <th className="pb-2 font-medium">Direccion</th>
                  <th className="pb-2 font-medium">Total</th>
                  <th className="pb-2 font-medium">Estado</th>
                  <th className="pb-2 font-medium">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                {orders.map((order) => {
                  const s = STATUS_LABELS[order.status] || STATUS_LABELS.PENDING;
                  return (
                    <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 cursor-pointer" onClick={() => setSelectedOrder(order)}>
                      <td className="py-2.5 font-mono text-xs text-gray-500 dark:text-slate-400">{order.id.slice(0, 8)}…</td>
                      <td className="py-2.5 text-gray-900 dark:text-white">{order.user?.username || 'N/A'}</td>
                      <td className="py-2.5 text-gray-500 dark:text-slate-400">{order.address}, {order.city}</td>
                      <td className="py-2.5 font-semibold text-gray-900 dark:text-white">{order.total.toFixed(2)}€</td>
                      <td className="py-2.5">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${s.class}`}>{s.text}</span>
                      </td>
                      <td className="py-2.5 text-gray-500 dark:text-slate-400">{new Date(order.createdAt).toLocaleString('es-ES')}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de pedido */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSelectedOrder(null)} />
            <div className="bg-white dark:bg-slate-800 rounded-2xl z-10 w-11/12 sm:w-5/6 lg:w-2/3 xl:w-1/2 p-6 sm:p-8 relative shadow-2xl">
            <button aria-label="Cerrar" onClick={() => setSelectedOrder(null)} className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 dark:text-slate-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Pedido {selectedOrder.id.slice(0,8)}…</h3>
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-200">
                {STATUS_LABELS[selectedOrder.status]?.text || 'Pendiente'}
              </span>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.3fr,1fr]">
              <div>
                <div className="mb-4 text-sm text-gray-700 dark:text-slate-300 space-y-1">
                  <p><strong>Cliente:</strong> {selectedOrder.user?.username || 'N/A'} ({selectedOrder.user?.email})</p>
                  <p><strong>Direccion:</strong> {selectedOrder.address}, {selectedOrder.city} {selectedOrder.postalCode}</p>
                  <p><strong>Telefono:</strong> {selectedOrder.phone}</p>
                  {selectedOrder.notes && <p><strong>Notas:</strong> {selectedOrder.notes}</p>}
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Articulos</h4>
                  <div className="space-y-2">
                    {selectedOrder.items.map((it) => (
                      <div key={it.id} className="flex items-start justify-between text-sm text-gray-800 dark:text-slate-200">
                        <div className="pr-4">{it.product?.name || 'Producto eliminado'}</div>
                        <div className="text-right text-gray-600 dark:text-slate-400">
                          {it.price.toFixed(2)}€ x {it.quantity}
                          <div className="font-semibold text-gray-900 dark:text-white">{(it.price * it.quantity).toFixed(2)}€</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 p-4 h-fit">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Resumen</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600 dark:text-slate-400">
                    <span>Subtotal</span>
                    <span>{(selectedOrder.subtotal ?? selectedOrder.total).toFixed(2)}€</span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-slate-400">
                    <span>Envio</span>
                    <span>{(selectedOrder.shipping ?? 0).toFixed(2)}€</span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-gray-900 dark:text-white">
                    <span>Total</span>
                    <span>{selectedOrder.total.toFixed(2)}€</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2 mt-6">
                {selectedOrder.status === 'PENDING' && (
                  <button disabled={actionLoading} onClick={() => handleConfirmOrder(selectedOrder.id)} className="btn-secondary">
                    {actionLoading ? 'Procesando...' : 'Confirmar pedido'}
                  </button>
                )}
                {selectedOrder.status !== 'PAID' && (
                  <button disabled={actionLoading} onClick={() => handleSimulatePayment(selectedOrder.id)} className="btn-primary">{actionLoading ? 'Procesando...' : 'Simular pago'}</button>
                )}
                <button disabled={actionLoading} onClick={() => handleDelete(selectedOrder.id)} className="btn-danger-outline">{actionLoading ? 'Procesando...' : 'Eliminar'}</button>
                {selectedOrder.status !== 'CANCELLED' && (
                  <button disabled={actionLoading} onClick={() => handleCancel(selectedOrder.id)} className="btn-danger">{actionLoading ? 'Procesando...' : 'Cancelar'}</button>
                )}
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        open={confirm.open}
        title={
          confirm.type === 'confirm'
            ? 'Confirmar pedido'
            : confirm.type === 'simulate'
            ? 'Confirmar pago'
            : confirm.type === 'delete'
            ? 'Eliminar pedido'
            : 'Cancelar pedido'
        }
        message={
          confirm.type === 'confirm'
            ? '¿Confirmas este pedido? Se marcara como En proceso.'
            : confirm.type === 'simulate'
            ? '¿Deseas simular el pago y marcar este pedido como procesado?'
            : confirm.type === 'delete'
            ? '¿Eliminar este pedido definitivamente? Se restaurara el stock si procede.'
            : '¿Confirmas cancelar este pedido? Esta accion restaurara el stock.'
        }
        onConfirm={performConfirm}
        onCancel={closeConfirm}
        confirmText={
          confirm.type === 'confirm'
            ? 'Confirmar'
            : confirm.type === 'delete'
            ? 'Eliminar'
            : confirm.type === 'simulate'
            ? 'Simular pago'
            : 'Cancelar'
        }
        loading={actionLoading}
      />
    </div>
  );
};

export default AdminOrders;
