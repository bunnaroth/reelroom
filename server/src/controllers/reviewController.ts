/// <reference path="../types/express.d.ts" />
import { Request, Response, NextFunction } from 'express';
import { reviewService } from '../services/reviewService.js';
import { isMediaType } from '../types/movie.js';

export const reviewController = {

    async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user!.id;
            const { tmdbMovieId, rating, content } = req.body;
            const mediaType = req.body.mediaType ?? 'movie';

            if (tmdbMovieId === undefined || rating === undefined) {
                res.status(400).json({ error: 'tmdbMovieId and rating parameters are required' });
                return;
            }

            if (!isMediaType(mediaType)) {
                res.status(400).json({ error: 'mediaType must be movie or tv' });
                return;
            }

            const review = await reviewService.addReview(
                Number(userId), 
                Number(tmdbMovieId), 
                mediaType,
                Number(rating), 
                content || ''
            );
            
            res.status(201).json({ message: 'Review dropped successfully', data: review });
        } catch (error) {
            next(error);
        }
    },

    async getByMovie(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const tmdbMovieId = Number(req.params.movieId);
            const mediaType = req.query.mediaType ?? 'movie';

            if (!tmdbMovieId) {
                res.status(400).json({ error: 'Valid TMDB movieId parameter is required' });
                return;
            }

            if (!isMediaType(mediaType)) {
                res.status(400).json({ error: 'mediaType must be movie or tv' });
                return;
            }

            const reviews = await reviewService.getMovieReviews(tmdbMovieId, mediaType);
            res.status(200).json(reviews);
        } catch (error) {
            next(error);
        }
    }
};
