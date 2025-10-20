import express from 'express';
import { 
    getProductos,
    getProductoById,
    getProductosByCategoria

 } from '../../controllers/productos/producto.js';

const productoRoutes = express.Router();

productoRoutes.get('/', getProductos);
productoRoutes.get('/:id', getProductoById);
productoRoutes.get('/categoria/:categoriaId', getProductosByCategoria);

export default productoRoutes;