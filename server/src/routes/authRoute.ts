import { Router } from 'express';
import { authController } from '../controllers/authController.js';
import { authenticateJWT } from '../middleware/authenticate.js';

const router = Router();

router.post('/register', authController.register);

router.post('/login', authController.login);

router.get('/profile', authenticateJWT, authController.profile);

export default router;
