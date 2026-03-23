import { Router } from 'express';
import { createPaymentIntent, simulatePayment } from '../controllers/paymentController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Crear PaymentIntent para un pedido existente
router.post('/create-intent', authenticate, createPaymentIntent);

// Ruta de ayuda en dev: simular pago (admin)
router.post('/simulate/:id', authenticate, simulatePayment);

export default router;
