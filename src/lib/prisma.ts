import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// null когда DATABASE_URL не задан (например, превью-деплой без env) —
// интейк лидов при этом не падает, просто пишет только в телеграм.
export const prisma: PrismaClient | null = process.env.DATABASE_URL
  ? (globalForPrisma.prisma ?? (globalForPrisma.prisma = new PrismaClient()))
  : null;
