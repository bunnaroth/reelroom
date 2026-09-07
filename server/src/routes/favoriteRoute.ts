import { Router } from 'express';
import { favoriteController } from '../controllers/favoriteController.js';
import { authenticateJWT } from '../middleware/authenticate.js';

const router = Router();

router.use(authenticateJWT);

/**
 * @route   
 * @desc    
 * @access  
 */
router.post('/toggle', favoriteController.toggle);

/**
 * @route   
 * @desc    
 * @access  
 */
router.get('/', favoriteController.get);

export default router;
