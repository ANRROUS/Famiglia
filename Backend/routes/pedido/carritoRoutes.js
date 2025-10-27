import { Router } from 'express';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart
} from '../../controllers/pedido/carrito.js';
import { verifyToken } from '../../middleware/authMiddleware.js';

const router = Router();

// Todas las rutas del carrito requieren autenticación
router.get('/', verifyToken, getCart);
router.post('/add', verifyToken, addToCart);
router.put('/update', verifyToken, updateCartItem);
router.delete('/remove/:id', verifyToken, removeFromCart);

export default router;
