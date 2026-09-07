import { Router } from 'express';
import { reviewController } from '../controllers/reviewController.js';
import { authenticateJWT } from '../middleware/authenticate.js';

const router = Router();

/**
 * @route  
 * @desc    
 */
router.get('/movie/:movieId', reviewController.getByMovie);

/**
 * @route  
 * @desc    
 * @access 
 */
router.post('/', authenticateJWT, reviewController.create);

export default router;
