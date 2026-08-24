import Redis from 'ioredis';
import { env } from '../config/env';
import { logger } from './logger';

export const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  lazyConnect: true,
});

redis.on('connect', () => logger.info('✅ Redis bağlantısı kuruldu'));
redis.on('error', (err) => logger.error({ err }, 'Redis bağlantı hatası'));
redis.on('close', () => logger.warn('Redis bağlantısı kapandı'));

export async function connectRedis(): Promise<void> {
  await redis.connect();
}

export async function disconnectRedis(): Promise<void> {
  await redis.quit();
}
