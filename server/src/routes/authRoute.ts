import { Router } from 'express';
import { authController } from '../controllers/authController.js';
import { authenticateJWT } from '../middleware/authenticate.js';

const router = Router();

router.post('/register', authController.register);

router.post('/login', authController.login);

router.get('/profile', authenticateJWT, (req, res) => {
    res.status(200).json({
        message: "Welcome to your secure dashboard!",
        sessionUser: req.user
    });
});

export default router;
