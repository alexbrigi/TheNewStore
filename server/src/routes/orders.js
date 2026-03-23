import { Router } from 'express';
import { createOrder, getMyOrders, getAllOrders, updateOrderStatus, deleteOrder } from '../controllers/orderController.js';
import { authenticate } from '../middleware/auth.js';
import { isAdmin } from '../middleware/admin.js';

const router = Router();

router.use(authenticate);

router.post('/', createOrder);
router.get('/mine', getMyOrders);

// Admin only
router.get('/', isAdmin, getAllOrders);
router.patch('/:id/status', isAdmin, updateOrderStatus);
router.delete('/:id', isAdmin, deleteOrder);

export default router;
