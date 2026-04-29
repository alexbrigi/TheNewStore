import { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from '../components/ui/CheckoutForm.jsx';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

export default function Checkout() {
  const { user } = useAuth();
  const { items, totalPrice } = useCart();
  const [clientSecret, setClientSecret] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [testMessage, setTestMessage] = useState('');
  const [form, setForm] = useState({
    email: '',
    firstName: '',
    lastName: '',
    country: 'Espana',
    address: '',
    address2: '',
    postalCode: '',
    city: '',
    province: 'Madrid',
    phone: '',
    notes: '',
  });
  const uiOnly = true;
  const shipping = totalPrice >= 150 ? 0 : 6;
  const orderTotal = totalPrice + shipping;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

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

    if (user && !uiOnly) createOrder();
  }, [user, uiOnly]);

  if (!user) return <div className="max-w-4xl mx-auto p-6">Debes iniciar sesion para pagar.</div>;

  const handleTestOrder = async () => {
    if (items.length === 0) {
      setTestMessage('No hay productos en el carrito.');
      return;
    }

    try {
      setTestLoading(true);
      setTestMessage('');
      const res = await api.post('/orders', {
        address: form.address || 'N/D',
        city: form.city || 'N/D',
        postalCode: form.postalCode || '00000',
        phone: form.phone || '000000000',
        notes: form.notes || 'Pedido de prueba desde checkout',
      });
      setOrderId(res.data.id);
      setTestMessage('Pedido de prueba creado. Revisa el panel de admin.');
    } catch (e) {
      console.error(e);
      setTestMessage('No se pudo crear el pedido de prueba.');
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <div className="max-w-6xl mx-auto p-6 lg:p-10">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl lg:text-3xl font-bold text-white">Finalizar compra</h2>
          <span className="text-sm text-slate-300">Pago seguro</span>
        </div>

        {uiOnly && (
          <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Modo prueba: el pago esta desactivado. La integracion real se activara mas adelante.
          </div>
        )}

        <div className="mb-6 flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            placeholder="Tienes un cupon? Escribe el codigo"
            className="input flex-1 bg-slate-800 text-slate-100 border-slate-700 placeholder-slate-400"
          />
          <button className="rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 hover:bg-slate-100 disabled:opacity-60" disabled>Aplicar cupon</button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.4fr,1fr]">
          <div className="rounded-2xl border border-slate-700 bg-slate-800 p-6 shadow-sm">
            <h3 className="text-lg font-bold mb-4">Detalles de facturacion</h3>
            <div className="grid gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Correo electronico</label>
                <input
                  className="input bg-slate-900 text-slate-100 border-slate-700 placeholder-slate-400"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="tu@email.com"
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nombre</label>
                  <input
                    className="input bg-slate-900 text-slate-100 border-slate-700 placeholder-slate-400"
                    type="text"
                    name="firstName"
                    value={form.firstName}
                    onChange={handleChange}
                    placeholder="Nombre"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Apellidos</label>
                  <input
                    className="input bg-slate-900 text-slate-100 border-slate-700 placeholder-slate-400"
                    type="text"
                    name="lastName"
                    value={form.lastName}
                    onChange={handleChange}
                    placeholder="Apellidos"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Pais / region</label>
                <select
                  className="input bg-slate-900 text-slate-100 border-slate-700"
                  name="country"
                  value={form.country}
                  onChange={handleChange}
                >
                  <option>Espana</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Direccion de la calle</label>
                <input
                  className="input bg-slate-900 text-slate-100 border-slate-700 placeholder-slate-400"
                  type="text"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Calle y numero"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Apartamento, habitacion, etc. (opcional)</label>
                <input
                  className="input bg-slate-900 text-slate-100 border-slate-700 placeholder-slate-400"
                  type="text"
                  name="address2"
                  value={form.address2}
                  onChange={handleChange}
                  placeholder="Apartamento"
                />
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Codigo postal</label>
                  <input
                    className="input bg-slate-900 text-slate-100 border-slate-700 placeholder-slate-400"
                    type="text"
                    name="postalCode"
                    value={form.postalCode}
                    onChange={handleChange}
                    placeholder="28001"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium mb-1">Poblacion</label>
                  <input
                    className="input bg-slate-900 text-slate-100 border-slate-700 placeholder-slate-400"
                    type="text"
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    placeholder="Ciudad"
                  />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Provincia</label>
                  <select
                    className="input bg-slate-900 text-slate-100 border-slate-700"
                    name="province"
                    value={form.province}
                    onChange={handleChange}
                  >
                    <option>Madrid</option>
                    <option>Barcelona</option>
                    <option>Valencia</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Telefono</label>
                  <input
                    className="input bg-slate-900 text-slate-100 border-slate-700 placeholder-slate-400"
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="600000000"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Notas del pedido (opcional)</label>
                <textarea
                  className="input h-24 bg-slate-900 text-slate-100 border-slate-700 placeholder-slate-400"
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  placeholder="Notas para el repartidor"
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-700 bg-slate-800 p-6 shadow-sm">
              <h3 className="text-lg font-bold mb-4">Tu pedido</h3>
              <div className="space-y-3 text-sm">
                {items.length === 0 ? (
                  <div className="text-slate-400">No hay productos en el carrito.</div>
                ) : (
                  items.map((item) => (
                    <div key={item.id} className="flex justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium text-slate-100 truncate">{item.product.name}</p>
                        <p className="text-slate-400">x{item.quantity}</p>
                      </div>
                      <span className="font-semibold text-slate-100">{(item.product.price * item.quantity).toFixed(2)}€</span>
                    </div>
                  ))
                )}
              </div>
              <div className="mt-4 border-t border-slate-700 pt-4 text-sm space-y-2">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal</span>
                  <span className="text-slate-100">{totalPrice.toFixed(2)}€</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Envio</span>
                  <span className="text-slate-100">{shipping === 0 ? 'Gratis' : `${shipping.toFixed(2)}€`}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-white">
                  <span>Total</span>
                  <span>{orderTotal.toFixed(2)}€</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-700 bg-slate-800 p-6 shadow-sm">
              <h3 className="text-lg font-bold mb-4">Metodo de pago</h3>
              <div className="space-y-3">
                <button type="button" className="w-full rounded-lg border border-white/20 bg-slate-900 px-4 py-3 text-left">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Stripe</span>
                    <span className="text-xs text-slate-300">Seleccionado</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Pago seguro con tarjeta, Apple Pay y Google Pay.</p>
                </button>
                <button type="button" className="w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-3 text-left opacity-70" disabled>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">PayPal</span>
                    <span className="text-xs text-gray-400">Proximamente</span>
                  </div>
                </button>
                <button type="button" className="w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-3 text-left opacity-70" disabled>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Transferencia bancaria</span>
                    <span className="text-xs text-gray-400">Proximamente</span>
                  </div>
                </button>
              </div>

              {uiOnly && (
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={handleTestOrder}
                    disabled={testLoading}
                    className="w-full rounded-lg bg-white px-5 py-2.5 font-semibold text-slate-900 hover:bg-slate-100 disabled:opacity-60"
                  >
                    {testLoading ? 'Creando pedido...' : 'Crear pedido de prueba'}
                  </button>
                  {testMessage && <p className="mt-2 text-xs text-slate-300">{testMessage}</p>}
                </div>
              )}

              {!uiOnly && loading && <div className="mt-4 text-sm">Creando pedido...</div>}
              {!uiOnly && !loading && !clientSecret && <div className="mt-4 text-sm">No se pudo crear PaymentIntent.</div>}
              {uiOnly ? (
                <CheckoutForm
                  uiOnly
                  containerClassName="mt-4 rounded-xl border border-white/10 bg-slate-900 p-4"
                  buttonClassName="w-full rounded-lg bg-white px-5 py-2.5 font-semibold text-slate-900 hover:bg-slate-100 disabled:opacity-60"
                />
              ) : (
                clientSecret && (
                  <Elements stripe={stripePromise} options={{ clientSecret }}>
                    <CheckoutForm
                      clientSecret={clientSecret}
                      orderId={orderId}
                      containerClassName="mt-4 rounded-xl border border-white/10 bg-slate-900 p-4"
                      buttonClassName="w-full rounded-lg bg-white px-5 py-2.5 font-semibold text-slate-900 hover:bg-slate-100 disabled:opacity-60"
                    />
                  </Elements>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
