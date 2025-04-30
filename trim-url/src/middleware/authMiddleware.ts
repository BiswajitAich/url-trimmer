import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

export interface AuthRequest extends Request {
    user?: { id: string; email: string };
}

export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        res.status(401).json({ message: "No token" });
        return;
    }
    
    console.log("token", token);

    try {
        console.log("SECRET_KEY", process.env.SECRET_KEY);
        
        const decoded = jwt.verify(token, process.env.SECRET_KEY!);
        console.log("decoded", process.env.SECRET_KEY);
        req.user = decoded as { id: string; email: string };
        next();
    } catch (err) {
        res.status(403).json({ message: "Invalid or expired token" });
        return;
    }
};
