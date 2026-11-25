import { Router } from 'express';
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
} from '../controllers/products.controller.js';
import {
  authenticateToken,
  authorizeRoles,
} from '../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticateToken);
router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.post('/create', authorizeRoles('admin'), createProduct);
router.delete('/:id', authorizeRoles('admin'), deleteProduct);

export default router;
