import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useState } from 'react';
import api from '../../services/api.js';

const CheckoutForm = ({ clientSecret, orderId, uiOnly = false, containerClassName, buttonClassName }) => {
  if (uiOnly) return <CheckoutFormUiOnly containerClassName={containerClassName} buttonClassName={buttonClassName} />;

  return (
    <StripeCheckoutForm
      clientSecret={clientSecret}
      orderId={orderId}
      containerClassName={containerClassName}
      buttonClassName={buttonClassName}
    />
  );
};

const StripeCheckoutForm = ({ clientSecret, orderId, containerClassName, buttonClassName }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    const card = elements.getElement(CardElement);
    try {
      const res = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card },
      });
      if (res.error) {
        alert(res.error.message || 'Error en el pago');
      } else if (res.paymentIntent && res.paymentIntent.status === 'succeeded') {
        // Optionally inform backend via webhook; also mark order as PROCESSING via simulate for tests
        await api.post(`/payments/simulate/${orderId}`);
        alert('Pago realizado correctamente');
      }
    } catch (err) {
      console.error(err);
      alert('Error al procesar el pago');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={containerClassName || 'card p-4'}>
      <label className="block mb-2">Tarjeta</label>
      <div className="border rounded p-3 mb-4">
        <CardElement options={{ hidePostalCode: true }} />
      </div>
      <button
        disabled={!stripe || loading}
        className={buttonClassName || 'btn-primary'}
      >
        {loading ? 'Procesando...' : 'Pagar'}
      </button>
    </form>
  );
};

const CheckoutFormUiOnly = ({ containerClassName, buttonClassName }) => (
  <form className={containerClassName || 'card p-4'}>
    <label className="block mb-2">Tarjeta</label>
    <div className="border border-white/10 rounded p-3 mb-4 bg-slate-900">
      <div className="grid gap-3">
        <input
          type="text"
          placeholder="Numero de tarjeta"
          className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder-slate-500"
          disabled
        />
        <div className="grid grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="MM/AA"
            className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder-slate-500"
            disabled
          />
          <input
            type="text"
            placeholder="CVC"
            className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder-slate-500"
            disabled
          />
        </div>
      </div>
    </div>
    <button
      disabled
      className={buttonClassName || 'btn-primary opacity-60'}
    >
      Pago en pruebas
    </button>
  </form>
);

export default CheckoutForm;
