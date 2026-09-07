/// <reference path="../types/express.d.ts" />
import { Request, Response, NextFunction } from 'express';
import { reviewService } from '../services/reviewService.js';

export const reviewController = {

    async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user!.id;
            const { tmdbMovieId, rating, content } = req.body;

            if (tmdbMovieId === undefined || rating === undefined) {
                res.status(400).json({ error: 'tmdbMovieId and rating parameters are required' });
                return;
            }

            const review = await reviewService.addReview(
                Number(userId), 
                Number(tmdbMovieId), 
                Number(rating), 
                content || ''
            );
            
            res.status(201).json({ message: 'Review dropped successfully', data: review });
        } catch (error: any) {
            if (error.code === '23505') {
                res.status(409).json({ error: 'You have already submitted a review for this movie.' });
                return;
            }
            next(error);
        }
    },

    async getByMovie(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const tmdbMovieId = Number(req.params.movieId);

            if (!tmdbMovieId) {
                res.status(400).json({ error: 'Valid TMDB movieId parameter is required' });
                return;
            }

            const reviews = await reviewService.getMovieReviews(tmdbMovieId);
            res.status(200).json(reviews);
        } catch (error) {
            next(error);
        }
    }
};
