import { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from '../components/ui/CheckoutForm.jsx';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

export default function Checkout() {
  const { user } = useAuth();
  const [clientSecret, setClientSecret] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Create an order from the current user's cart first (server will use cart items)
    const createOrder = async () => {
      try {
        setLoading(true);
        const res = await api.post('/orders', { address: 'N/D', city: 'N/D', postalCode: '00000', phone: '000000000' });
        setOrderId(res.data.id);
        // Then request PaymentIntent clientSecret
        const pi = await api.post('/payments/create-intent', { orderId: res.data.id });
        setClientSecret(pi.data.clientSecret);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    if (user) createOrder();
  }, [user]);

  if (!user) return <div className="max-w-4xl mx-auto p-6">Debes iniciar sesión para pagar.</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Checkout</h2>
      {loading && <div>Creando pedido...</div>}
      {!loading && !clientSecret && <div>No se pudo crear PaymentIntent.</div>}
      {clientSecret && (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <CheckoutForm clientSecret={clientSecret} orderId={orderId} />
        </Elements>
      )}
    </div>
  );
}
