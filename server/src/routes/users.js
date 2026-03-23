import { Router } from 'express';
import { isAdmin } from '../middleware/admin.js';
import { getAllUsers } from '../controllers/userController.js';

const router = Router();

router.get('/', isAdmin, getAllUsers);

export default router;
