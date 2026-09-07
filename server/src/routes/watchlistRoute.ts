import { Router } from 'express';
import { watchlistController } from '../controllers/watchlistController.js';
import { authenticateJWT } from '../middleware/authenticate.js';

const router = Router();

router.use(authenticateJWT);

/**
 * @route   
 * @desc    
 * @access  
 */
router.post('/', watchlistController.add);

/**
 * @route   
 * @desc    
 * @access  
 */
router.get('/', watchlistController.get);

/**
 * @route   
 * @desc    
 * @access  
 */
router.delete('/:movieId', watchlistController.remove);

export default router;
