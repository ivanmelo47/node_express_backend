import AuthService from '@/modules/auth/services/AuthService';
import { Request, Response, NextFunction } from 'express';

const authMiddleware = async (req: any, res: any, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.errorResponse('Unauthorized: No token provided', 401);
    }

    const token = authHeader.split(' ')[1];
    const result = await AuthService.validateToken(token);

    if (result === 'expired') {
      return res.errorResponse('Token expired', 401);
    }

    if (!result) {
      return res.errorResponse('Unauthorized: Invalid token', 401);
    }

    const accessToken: any = result;

    // Attach user and token info to request
    req.user = accessToken.User;
    req.token = accessToken;
    
    next();
  } catch (error: any) {
    console.error('Auth Middleware Error:', error);
    res.errorResponse('Internal Server Error', 500, error.message);
  }
};

export default authMiddleware;
