import React from 'react';

const ConfirmModal = ({ open, title, message, onConfirm, onCancel, confirmText = 'Aceptar', cancelText = 'Cancelar', loading = false }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onCancel} />
      <div className="bg-white dark:bg-slate-800 rounded-lg z-[10000] w-11/12 sm:w-3/4 md:w-1/2 lg:w-1/3 p-6">
        <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">{title}</h3>
        <p className="text-sm text-gray-700 dark:text-slate-300 mb-4">{message}</p>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="btn-secondary">{cancelText}</button>
          <button onClick={onConfirm} disabled={loading} className="btn-danger">{loading ? 'Procesando...' : confirmText}</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
