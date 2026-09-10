import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/AppError.js';
import { env } from '../config/env.js';

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  console.error(`[ERRO] ${req.method} ${req.url}`, err);

  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: 'Dados inválidos',
      code: 'VALIDATION_ERROR',
      errors: err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      code: err.code,
    });
    return;
  }

  res.status(500).json({
    success: false,
    message: 'Erro interno do servidor',
    code: 'INTERNAL_ERROR',
    ...(env.NODE_ENV === 'development' && {
      detail: err instanceof Error ? err.message : String(err),
    }),
  });
}