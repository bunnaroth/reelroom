import 'dotenv/config';
import express from 'express';
import authRoutes from './routes/authRoute.js';
import movieRoutes from './routes/movieRoute.js';
import watchlistRoutes from './routes/watchlistRoute.js'; 
import reviewRoutes from './routes/reviewRoute.js';
import { globalErrorHandler } from './middleware/errorHandler.js';

const app = express();

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/watchlist', watchlistRoutes);
app.use('/api/reviews', reviewRoutes);

app.use(globalErrorHandler);

export default app;
