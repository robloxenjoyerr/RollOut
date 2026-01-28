import { Request, Response, NextFunction } from "express";
import jwt from 'jsonwebtoken'

export interface AuthRequest extends Request {
    user?: {
        userId: string;
        username: string
    }
}

export function loginAuthentication(req: AuthRequest, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
        return res.status(401).json({ message: "No Token found."})
    }

    try {
    // Geheimes Passwort aus .env nutzen
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string; username: string };
    
    // User an Request hängen
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Token ungültig' });
  }
}