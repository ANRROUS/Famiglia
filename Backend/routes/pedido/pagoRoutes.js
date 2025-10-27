import express from 'express';
import { procesarPago } from '../../controllers/pedido/pago.js';
import { verifyToken } from '../../middleware/authMiddleware.js';

const pagoRoutes = express.Router();

// Ruta protegida para procesar el pago del carrito actual del usuario
pagoRoutes.post('/procesar', verifyToken, procesarPago);

export default pagoRoutes;