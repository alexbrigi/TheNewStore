import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useState } from 'react';
import api from '../../services/api.js';

export default function CheckoutForm({ clientSecret, orderId }) {
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
    <form onSubmit={handleSubmit} className="card p-4">
      <label className="block mb-2">Tarjeta</label>
      <div className="border rounded p-3 mb-4">
        <CardElement options={{ hidePostalCode: true }} />
      </div>
      <button disabled={!stripe || loading} className="btn-primary">{loading ? 'Procesando...' : 'Pagar'}</button>
    </form>
  );
}
