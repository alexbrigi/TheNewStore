import express from 'express';
import { requestNotification } from '../controllers/notifyController.js';

const router = express.Router();

// POST /api/notify - { productId, email }
router.post('/', requestNotification);

export default router;
