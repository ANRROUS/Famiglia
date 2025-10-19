import express from 'express';
import morgan from 'morgan';
import cors from 'cors';

const app = express();
app.use(morgan('dev'));
app.use(cors({
    origin: 'http://localhost:5173'
}));
app.use(express.json());

export default app;