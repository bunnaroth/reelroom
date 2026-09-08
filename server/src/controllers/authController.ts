import { Request, Response, NextFunction} from 'express'; 
import { authService } from '../services/authService';
import { CreateUserInput } from '../types/user';

export const authController = { 
    async register(req: Request, res: Response, next: NextFunction): Promise<void> { 
        try { 
            const registrationData: CreateUserInput = req.body; 

            if (!registrationData.email || !registrationData.password || !registrationData.username) { 
                res.status(400).json({error: 'Username, email, and password are required'});
                return;
            }

            const result = await authService.register(registrationData); 

            res.status(201).json(result); 
        } catch (error: any) { 
            if (error.message === 'Email is already registered') { 
                res.status(409).json({ error: error.message}); 
                return;
            }

            next(error);
        }
    },

    async login(req: Request, res: Response, next: NextFunction): Promise<void> { 
        try { 
            const { email, password} = req.body;

            if (!email || !password) { 
                res.status(400).json({error: 'Email and password are required'});
                return; 
            }

            const result = await authService.login(email, password); 

            res.status(200).json(result); 
        } catch(error: any) { 
            if (error.message === 'Invalid email or password combination' || error.message === 'User not found with this email') { 
                res.status(401).json({error: 'Invalid email or password combination'});
                return;
            }

            next(error);
        }
    },

    async profile(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({ error: 'Authentication required' });
                return;
            }

            const user = await authService.getProfile(req.user.id);
            res.status(200).json({ user });
        } catch (error) {
            next(error);
        }
    }
}