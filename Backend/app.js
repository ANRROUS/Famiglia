import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import productoRoutes from './routes/productos/productoRoutes.js';
import categoriaRoutes from './routes/productos/categoriaRoutes.js';
import authRoutes from './routes/usuario/auth.route.js';
import contactRoutes from './routes/contactRoutes.js';
import preferencesRoutes from './routes/preferences/preferencesRoutes.js';
import pedidoRoutes from './routes/pedido/pedidoRoutes.js';
import pagoRoutes from './routes/pedido/pagoRoutes.js';
import carritoRoutes from './routes/pedido/carritoRoutes.js';

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
app.use('/api/preferences', preferencesRoutes);
app.use('/api/pedido/carrito', carritoRoutes);
app.use('/api/pedido/pago', pagoRoutes);
app.use('/pedidos', pedidoRoutes);


export default app;