import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: any;
}

export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) { res.status(401).json({ error: 'Access denied' }); return; }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET as string);
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({ error: 'Invalid token' });
  }
};


export const isAdmin = (req: any, res: any, next: any) => {
  if (req.user && req.user.role === 'Admin') {
    next(); 
  } else {
    res.status(403).json({ error: 'Access denied. Admin privileges required.' });
  }
};