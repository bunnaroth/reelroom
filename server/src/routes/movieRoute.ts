import { Router, Request, Response, NextFunction } from 'express';
import { movieController } from '../controllers/movieController.js';
import { tmdbService } from '../services/tmdbService.js';

const router = Router();

router.get('/home', movieController.home);
router.get('/discover', movieController.discover);

/**
 * @route   GET /api/movies/popular
 */
router.get('/popular', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const movies = await tmdbService.getPopular();
        res.status(200).json(movies);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/movies/search?query=Batman
 */
router.get('/search', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const query = req.query.query as string;

        if (!query || query.trim() === '') {
            res.status(400).json({ error: 'Search query parameter is required' });
            return;
        }

        const movies = await tmdbService.searchMovies(query);
        res.status(200).json(movies);
    } catch (error) {
        next(error);
    }
});

export default router;