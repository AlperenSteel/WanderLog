import { Router, Request, Response } from 'express';
import { prisma } from '../../lib/prisma';
import { redis } from '../../lib/redis';
import { logger } from '../../lib/logger';

export const healthRouter = Router();

healthRouter.get('/health', async (_req: Request, res: Response) => {
  const health: {
    status: 'ok' | 'degraded';
    timestamp: string;
    services: {
      database: 'ok' | 'error';
      redis: 'ok' | 'error';
    };
    version: string;
  } = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      database: 'ok',
      redis: 'ok',
    },
    version: process.env.npm_package_version ?? '0.0.1',
  };

  // DB kontrolü
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (err) {
    logger.error({ err }, 'Health check: DB hatası');
    health.services.database = 'error';
    health.status = 'degraded';
  }

  // Redis kontrolü
  try {
    await redis.ping();
  } catch (err) {
    logger.error({ err }, 'Health check: Redis hatası');
    health.services.redis = 'error';
    health.status = 'degraded';
  }

  const statusCode = health.status === 'ok' ? 200 : 503;
  res.status(statusCode).json({ data: health });
});
