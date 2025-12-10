import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Same payload type you used in auth.ts
type JwtPayload = {
  userId: number;
  role: string;
};

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

const JWT_SECRET: jwt.Secret = process.env.JWT_SECRET || 'dev_secret';

// 1. Authenticate: verify JWT and attach user to req
export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res
      .status(401)
      .json({ message: 'No token provided. Authorization denied' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    req.user = decoded;
    next();
  } catch (err) {
    console.error('JWT verify error:', err);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// 2. Authorize: allow only specific roles
export const authorizeRoles = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res
        .status(401)
        .json({ message: 'Not authenticated. No user in request' });
    }

    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: 'You do not have permission to access this resource' });
    }

    next();
  };
};
