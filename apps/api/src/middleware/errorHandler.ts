import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../lib/errors';
import { logger } from '../lib/logger';
import { env } from '../config/env';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  // Zod doğrulama hatası
  if (err instanceof ZodError) {
    res.status(422).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Doğrulama hatası',
        details: err.flatten().fieldErrors,
      },
    });
    return;
  }

  // Bilinen uygulama hatası
  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      logger.error({ err, requestId: req.id }, 'Uygulama hatası');
    }
    res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        ...(err.details ? { details: err.details } : {}),
      },
    });
    return;
  }

  // Beklenmeyen hata
  logger.error({ err, requestId: req.id }, 'Beklenmeyen hata');
  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Sunucu hatası',
      ...(env.NODE_ENV === 'development' ? { details: { stack: err.stack } } : {}),
    },
  });
}
