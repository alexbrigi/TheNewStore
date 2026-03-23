import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import categoryRoutes from './routes/categories.js';
import orderRoutes from './routes/orders.js';
import cartRoutes from './routes/cart.js';
import uploadRoutes from './routes/upload.js';
import userRoutes from './routes/users.js';
import notifyRoutes from './routes/notify.js';
import paymentsRoutes from './routes/payments.js';
import bodyParser from 'body-parser';
import { webhook } from './controllers/paymentController.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middlewares ────────────────────────────────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));

// Stripe webhook needs the raw body to verify signature. We mount the webhook
// before the generic JSON parser and handle the route with raw body parser.
app.post('/api/payments/webhook', bodyParser.raw({ type: 'application/json' }), webhook);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Servir imágenes subidas localmente
app.use('/uploads', express.static('uploads'));

// ─── Rutas ────────────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => res.json({ status: 'ok', message: 'The New Store API funcionando' }));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notify', notifyRoutes);
app.use('/api/payments', paymentsRoutes);

// ─── Error handler ───────────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Inicio ───────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
