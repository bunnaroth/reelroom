/// <reference path="../types/express.d.ts" />
import { Request, Response, NextFunction } from 'express';
import { watchlistService } from '../services/watchlistService.js';
import { isMediaType } from '../types/movie.js';

export const watchlistController = {
    async add(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = Number(req.user!.id);
            const { tmdbMovieId } = req.body;
            const mediaType = req.body.mediaType ?? 'movie';

            const movieId = Number(tmdbMovieId);
            if (!Number.isInteger(movieId) || movieId <= 0) {
                res.status(400).json({ error: 'tmdbMovieId parameter is required in request body' });
                return;
            }

            if (!isMediaType(mediaType)) {
                res.status(400).json({ error: 'mediaType must be movie or tv' });
                return;
            }

            const item = await watchlistService.addToWatchlist(userId, movieId, mediaType);
            res.status(201).json({ message: 'Item added to your watchlist successfully', data: item });
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
            const mediaType = req.query.mediaType ?? 'movie';

            if (!Number.isInteger(tmdbMovieId) || tmdbMovieId <= 0) {
                res.status(400).json({ error: 'A valid movieId parameter is required' });
                return;
            }

            if (!isMediaType(mediaType)) {
                res.status(400).json({ error: 'mediaType must be movie or tv' });
                return;
            }

            const success = await watchlistService.removeFromWatchlist(userId, tmdbMovieId, mediaType);
            
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
