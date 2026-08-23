import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import pinoHttp from 'pino-http';

import { env } from './config/env';
import { logger } from './lib/logger';
import { requestId } from './middleware/requestId';
import { errorHandler } from './middleware/errorHandler';
import { healthRouter } from './modules/health/health.routes';

export function createApp() {
  const app = express();

  // ─────────────────────── Güvenlik ───────────────────────
  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ORIGINS.split(','),
      credentials: true,
    }),
  );

  // ─────────────────────── Genel middleware ───────────────────────
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(requestId);
  app.use(
    pinoHttp({
      logger,
      customLogLevel: (_req, res) => {
        if (res.statusCode >= 500) return 'error';
        if (res.statusCode >= 400) return 'warn';
        return 'info';
      },
      customSuccessMessage: (req, res) =>
        `${req.method} ${req.url} ${res.statusCode}`,
    }),
  );

  // ─────────────────────── Rate limit ───────────────────────
  const limiter = rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      error: { code: 'RATE_LIMITED', message: 'Çok fazla istek, lütfen bekleyin' },
    },
  });
  app.use('/api/', limiter);

  // ─────────────────────── Routes ───────────────────────
  app.use('/api/v1', healthRouter);

  // Modüller buraya eklenecek (Modül 2+)
  // app.use('/api/v1/auth', authRouter);
  // app.use('/api/v1/routes', routesRouter);
  // ...

  // ─────────────────────── 404 ───────────────────────
  app.use((_req, res) => {
    res.status(404).json({
      error: { code: 'NOT_FOUND', message: 'Endpoint bulunamadı' },
    });
  });

  // ─────────────────────── Error handler ───────────────────────
  app.use(errorHandler);

  return app;
}
