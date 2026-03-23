import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const stripeKey = process.env.STRIPE_SECRET_KEY;
const stripe = stripeKey ? Stripe(stripeKey) : null;

// POST /api/payments/create-intent
export const createPaymentIntent = async (req, res, next) => {
  try {
    const { orderId } = req.body;
    if (!orderId) return res.status(400).json({ message: 'orderId requerido' });

    if (!stripe) return res.status(500).json({ message: 'STRIPE_SECRET_KEY no configurada en el servidor' });

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return res.status(404).json({ message: 'Pedido no encontrado' });

    // Ensure the user owns the order or is admin
    if (order.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'No autorizado' });
    }

    const amount = Math.round(order.total * 100); // euros -> cents

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'eur',
      metadata: { orderId: order.id },
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    next(err);
  }
};

// POST /api/payments/webhook
export const webhook = async (req, res, next) => {
  try {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;
    if (webhookSecret) {
      try {
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
      } catch (err) {
        console.error('Webhook signature verification failed.', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
      }
    } else {
      // If no webhook secret provided, parse body directly
      event = req.body;
    }

    if (event.type === 'payment_intent.succeeded' || event.type === 'payment_intent.payment_failed') {
      const pi = event.data.object;
      const orderId = pi.metadata?.orderId;
      if (orderId) {
        if (event.type === 'payment_intent.succeeded') {
          await prisma.order.update({ where: { id: orderId }, data: { status: 'PROCESSING' } });
        } else if (event.type === 'payment_intent.payment_failed') {
          await prisma.order.update({ where: { id: orderId }, data: { status: 'PENDING' } });
        }
      }
    }

    res.json({ received: true });
  } catch (err) {
    next(err);
  }
};

export default { createPaymentIntent, webhook };

// Dev helper: simular el pago de un pedido (marca PAID) — solo admin
export const simulatePayment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) return res.status(404).json({ message: 'Pedido no encontrado' });
    // Solo admin puede usar esta ruta
    if (req.user.role !== 'ADMIN') return res.status(403).json({ message: 'No autorizado' });

    await prisma.order.update({ where: { id }, data: { status: 'PROCESSING' } });
    res.json({ message: 'Pago simulado: pedido marcado como PAID' });
  } catch (err) {
    next(err);
  }
};
