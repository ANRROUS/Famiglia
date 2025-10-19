import express from 'express';
import { 
    getCategorias,
    getCategoriaById
 } from '../../controllers/productos/categoria.js';

const categoriaRoutes = express.Router();

categoriaRoutes.get('/', getCategorias);
categoriaRoutes.get('/:id', getCategoriaById);

export default categoriaRoutes;