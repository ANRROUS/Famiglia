import express from 'express';
import { 
    getProductos,
    getProductoById,
    getProductosByCategoria

 } from '../../controllers/productos/producto.js';

const productoRoutes = express.Router();

productoRoutes.get('/', getProductos);
// categoria route must come before :id to avoid collision and param name must match controller
productoRoutes.get('/categoria/:id_categoria', getProductosByCategoria);
productoRoutes.get('/:id', getProductoById);

export default productoRoutes;