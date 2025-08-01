// --- File: lib/prisma.ts ---
// Your Prisma client setup, now with TypeScript.
import { PrismaClient } from '@/app/generated/prisma';
import { PrismaNeon } from '@prisma/adapter-neon';
import { Pool } from '@neondatabase/serverless';

// Extend the global object with a PrismaClient instance
declare global {
  var prisma: PrismaClient | undefined;
}

let prisma: PrismaClient;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn("DATABASE_URL is not set. Prisma will not be initialized.");
  // In development, you might want to throw an error or handle this more gracefully
  // For production, this should always be set.
  // Fallback to a new PrismaClient, but it won't connect without URL
  prisma = new PrismaClient();
} else {
 if (process.env.NODE_ENV === 'production') {
    prisma = new PrismaClient();
  } else {
    if (!global.prisma) {
      global.prisma = new PrismaClient();
    }
    prisma = global.prisma;
  }
}

export default prisma;