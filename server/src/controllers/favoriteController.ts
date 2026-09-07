/// <reference path="../types/express.d.ts" />
import { Request, Response, NextFunction } from 'express';
import { favoriteService } from '../services/favoriteService.js';

export const favoriteController = {
    async toggle(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user!.id;
            const { tmdbMovieId } = req.body;

            if (!tmdbMovieId) {
                res.status(400).json({ error: 'tmdbMovieId parameter is required in request body' });
                return;
            }

            const status = await favoriteService.toggleFavorite(Number(userId), Number(tmdbMovieId));
            res.status(200).json({ 
                message: status.favorited ? 'Added to favorites' : 'Removed from favorites', 
                ...status 
            });
        } catch (error) {
            next(error);
        }
    },

    async get(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user!.id;
            const favorites = await favoriteService.getUserFavorites(userId);
            res.status(200).json(favorites);
        } catch (error) {
            next(error);
        }
    }
};
