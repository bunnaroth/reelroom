import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import authRoutes from './routes/authRoute.js';
import movieRoutes from './routes/movieRoute.js';
import watchlistRoutes from './routes/watchlistRoute.js'; 
import reviewRoutes from './routes/reviewRoute.js';
import { globalErrorHandler } from './middleware/errorHandler.js';

const app = express();
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

app.use(cors({
    origin: allowedOrigins,
    methods: ['GET', 'HEAD', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/watchlist', watchlistRoutes);
app.use('/api/reviews', reviewRoutes);

app.use(globalErrorHandler);

export default app;
