import express from 'express';
import { getProductos } from '../../controllers/productos/producto.js';

const productoRoutes = express.Router();

productoRoutes.get('/', getProductos);

export default productoRoutes;