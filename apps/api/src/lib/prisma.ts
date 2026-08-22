import { PrismaClient } from '@prisma/client';
import { logger } from './logger';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: [
      { level: 'query', emit: 'event' },
      { level: 'error', emit: 'stdout' },
      { level: 'warn', emit: 'stdout' },
    ],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

prisma.$on('query', (e) => {
  logger.trace({ query: e.query, duration: e.duration }, 'DB query');
});

export async function connectDB(): Promise<void> {
  await prisma.$connect();
  logger.info('✅ PostgreSQL bağlantısı kuruldu');
}

export async function disconnectDB(): Promise<void> {
  await prisma.$disconnect();
}
