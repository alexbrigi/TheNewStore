import { useState } from 'react';

const ReserveModal = ({ product, open, onClose, onConfirm, maxPerPerson = 6 }) => {
  const [qty, setQty] = useState(1);
  const [accepted, setAccepted] = useState(false);
  if (!open || !product) return null;

  const max = Math.min(maxPerPerson, product.stock > 0 ? Math.max(1, product.stock) : maxPerPerson);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white dark:bg-slate-900 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-bold mb-3">Reservar: {product.name}</h3>
        {product.releaseDate && (
          <p className="text-sm italic text-emerald-600 mb-3">Fecha de salida: {new Date(product.releaseDate).toLocaleDateString()}</p>
        )}

        <label className="block text-sm mb-2">Unidades (máx {max})</label>
        <div className="flex items-center gap-2 mb-4">
          <button type="button" className="px-3 py-2 bg-gray-100 rounded" onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
          <input type="number" value={qty} min={1} max={max} onChange={(e) => setQty(Math.max(1, Math.min(max, Number(e.target.value || 1))))} className="input w-20 text-center" />
          <button type="button" className="px-3 py-2 bg-gray-100 rounded" onClick={() => setQty((q) => Math.min(max, q + 1))}>+</button>
        </div>

        <div className="mb-4">
          <h4 className="font-semibold mb-2">Términos y condiciones</h4>
          <div className="text-sm text-gray-600 dark:text-slate-300 mb-2">Al reservar este producto aceptas que el pago se realizará a través del proceso normal de compra. La reserva no garantiza unidades adicionales por encima del límite por persona. Consulta la política de devoluciones y cambios en la pasarela de pago.</div>
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} />
            Acepto los términos y condiciones
          </label>
        </div>

        <div className="flex justify-end gap-3">
          <button className="btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn-primary" disabled={!accepted} onClick={() => { onConfirm(qty); onClose(); }}>Confirmar reserva y añadir al carrito</button>
        </div>
      </div>
    </div>
  );
};

export default ReserveModal;
