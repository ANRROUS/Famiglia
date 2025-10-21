import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import productoRoutes from './routes/productos/productoRoutes.js';
import categoriaRoutes from './routes/productos/categoriaRoutes.js';
import authRoutes from './routes/usuario/auth.route.js';
import contactRoutes from './routes/contactRoutes.js';

const app = express();
app.use(morgan('dev'));
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

app.use('/productos', productoRoutes);
app.use('/categorias', categoriaRoutes);
app.use('/auth', authRoutes);
app.use('/contact', contactRoutes);

export default app;