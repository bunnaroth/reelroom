import { UserDTO } from './user'; 

declare global { 
    namespace Express { 
        interface Request { 
            user?: { 
                id: number; 
                role: 'user' | 'admin';
            };
        }
    }
}