import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';
import type { AuthUser } from '../types/index.js';

type JwtPayload = {
  sub: string;
  email: string;
};

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    throw new AppError('Token não fornecido', 401, 'UNAUTHORIZED');
  }

  const token = header.slice(7);

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    req.user = { id: payload.sub, email: payload.email };
    next();
  } catch {
    throw new AppError('Token inválido ou expirado', 401, 'UNAUTHORIZED');
  }
}