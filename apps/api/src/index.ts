import 'dotenv/config';
import { createApp } from './app';
import { env } from './config/env';
import { logger } from './lib/logger';
import { connectDB, disconnectDB } from './lib/prisma';
import { connectRedis, disconnectRedis } from './lib/redis';

async function bootstrap() {
  // Bağlantıları kur
  await connectDB();
  await connectRedis();

  const app = createApp();

  const server = app.listen(env.PORT, () => {
    logger.info(`🚀 API sunucusu http://localhost:${env.PORT} adresinde çalışıyor`);
    logger.info(`📋 Ortam: ${env.NODE_ENV}`);
  });

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    logger.info(`${signal} alındı, kapatılıyor...`);
    server.close(async () => {
      await disconnectDB();
      await disconnectRedis();
      logger.info('✅ Sunucu kapatıldı');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('unhandledRejection', (reason) => {
    logger.fatal({ reason }, 'İşlenmemiş promise reddi');
    process.exit(1);
  });

  process.on('uncaughtException', (err) => {
    logger.fatal({ err }, 'Yakalanmamış hata');
    process.exit(1);
  });
}

bootstrap().catch((err) => {
  console.error('Bootstrap hatası:', err);
  process.exit(1);
});
