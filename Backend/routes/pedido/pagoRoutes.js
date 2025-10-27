import express from 'express';
import { procesarPago } from '../../controllers/pedido/pago.js';

const pagoRoutes = express.Router();

pagoRoutes.post('/:id_pedido/pago', procesarPago);
export default pagoRoutes;