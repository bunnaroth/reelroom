/// <reference path="../types/express.d.ts" />
import { Request, Response, NextFunction } from 'express';
import { watchlistService } from '../services/watchlistService.js';

export const watchlistController = {
    async add(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = Number(req.user!.id);
            const { tmdbMovieId } = req.body;

            const movieId = Number(tmdbMovieId);
            if (!Number.isInteger(movieId) || movieId <= 0) {
                res.status(400).json({ error: 'tmdbMovieId parameter is required in request body' });
                return;
            }

            const item = await watchlistService.addToWatchlist(userId, movieId);
            res.status(201).json({ message: 'Movie added to your watchlist successfully', data: item });
        } catch (error: any) {
            if (error.message === 'Movie not found on TMDB') {
                res.status(404).json({ error: error.message });
                return;
            }
            next(error);
        }
    },

    async get(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = Number(req.user!.id);
            const watchlist = await watchlistService.getUserWatchlistIDs(userId);
            res.status(200).json(watchlist);
        } catch (error) {
            next(error);
        }
    },

    async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = Number(req.user!.id);
            const tmdbMovieId = Number(req.params.movieId);

            if (!Number.isInteger(tmdbMovieId) || tmdbMovieId <= 0) {
                res.status(400).json({ error: 'A valid movieId parameter is required' });
                return;
            }

            const success = await watchlistService.removeFromWatchlist(userId, tmdbMovieId);
            
            if (!success) {
                res.status(404).json({ error: 'Movie item not found inside your profile watchlist collection' });
                return;
            }

            res.status(200).json({ message: 'Movie successfully dropped from your watchlist profile' });
        } catch (error) {
            next(error);
        }
    }
};
