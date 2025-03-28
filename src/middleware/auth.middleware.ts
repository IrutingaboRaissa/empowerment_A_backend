import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
      };
    }
  }
}

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    displayName: string;
  };
}

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        message: 'Authentication required',
        errors: {
          auth: 'No authentication token provided'
        }
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'amasimbi-super-secret-key-2024') as { id: string };
    
    // Fetch user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true }
    });

    if (!user) {
      return res.status(401).json({
        message: 'Authentication failed',
        errors: {
          auth: 'User not found'
        }
      });
    }

    // Set user in request
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({
      message: 'Authentication failed',
      errors: {
        auth: 'Invalid or expired token'
      }
    });
  }
}; 