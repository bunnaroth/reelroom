import { Request, Response, NextFunction } from "express";
import jwt from 'jsonwebtoken'; 

const JWT_SECRET = process.env.JWT_SECRET || ''; 

export const authenticateJWT = (req: Request, res: Response, next: NextFunction): void => { 
    const authHeader = req.headers.authorization; 

    if (!authHeader || !authHeader.startsWith('Bearer ')) { 
        res.status(401).json({error: 'Access denied. No token provided'}); 
        return;
    }

    const token = authHeader.split(' ')[1]; 

    try { 
        const decoded = jwt.verify(token, JWT_SECRET);
        if (typeof decoded !== 'object' || decoded === null) {
            res.status(403).json({ error: 'Invalid or expired token' });
            return;
        }

        const userId = Number(decoded.id);
        if (!Number.isInteger(userId) || userId <= 0) {
            res.status(403).json({ error: 'Invalid token user' });
            return;
        }

        req.user = {
            id: userId,
            role: decoded.role === 'admin' ? 'admin' : 'user'
        };
        next(); 
    } catch (error) { 
        res.status(403).json({error: 'Invalid or expired token'}); 
    }
};