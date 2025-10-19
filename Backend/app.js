import express from 'express';
import morgan from 'morgan';
import cors from 'cors';

import productoRoutes from './routes/productos/productoRoutes.js';
import categoriaRoutes from './routes/productos/categoriaRoutes.js';
import authRoutes from './routes/usuario/auth.route.js';

const app = express();
app.use(morgan('dev'));
app.use(cors({
    origin: 'http://localhost:5173'
}));
app.use(express.json());

app.use('/productos', productoRoutes);
app.use('/categorias', categoriaRoutes);
app.use('/auth', authRoutes);

export default app;