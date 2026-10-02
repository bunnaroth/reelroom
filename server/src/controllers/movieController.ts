import { Request, Response, NextFunction } from 'express';
import { movieService } from '../services/movieService.js';

export const movieController = {
    async home(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            res.status(200).json(await movieService.getHomeMovies());
        } catch (error) {
            next(error);
        }
    },

    async discover(req: Request, res: Response, next: NextFunction): Promise<void> {
        const category = req.query.category ?? 'all';
        const requestedPage = req.query.page ?? '1';

        if (!movieService.isDiscoverCategory(category)) {
            res.status(400).json({ error: 'Invalid movie category.' });
            return;
        }

        if (typeof requestedPage !== 'string' || !/^[1-9]\d*$/.test(requestedPage) || Number(requestedPage) > 500) {
            res.status(400).json({ error: 'Page must be an integer between 1 and 500.' });
            return;
        }

        try {
            const result = await movieService.getDiscoverMovies(category, Number(requestedPage));
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }
};