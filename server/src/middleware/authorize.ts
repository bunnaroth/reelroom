import { Request, Response, NextFunction } from "express";
import { UserRole } from "../types/user.js";

export const authorizeRoles = ( ...allowedRoles: UserRole[]) => { 
    return (req: Request, res: Response, next: NextFunction): void => { 
        if (!req.user || !allowedRoles.includes(req.user.role)) { 
            res.status(403).json({error: 'Forbidden. Access restricted to authorized roles.'});
            return; 
        }
        next();
    }
}