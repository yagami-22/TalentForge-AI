import "server-only";

import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

class PrismaConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PrismaConfigurationError";
  }
}

function getDatabaseUrlIssue(connectionString: string | undefined) {
  if (!connectionString) {
    return "DATABASE_URL is missing.";
  }

  try {
    const parsedUrl = new URL(connectionString);

    if (parsedUrl.protocol !== "postgresql:" && parsedUrl.protocol !== "postgres:") {
      return "DATABASE_URL must be a PostgreSQL connection string.";
    }

    if (!parsedUrl.hostname || !parsedUrl.username || !parsedUrl.pathname) {
      return "DATABASE_URL is incomplete. It must include user, host, database, and password details.";
    }
  } catch {
    return "DATABASE_URL is not a valid connection string.";
  }

  return null;
}

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL?.trim();
  const databaseUrlIssue = getDatabaseUrlIssue(connectionString);

  if (databaseUrlIssue || !connectionString) {
    throw new PrismaConfigurationError(
      `${databaseUrlIssue} Add the Neon pooled connection string in Vercel Project Settings and redeploy.`
    );
  }

  // `databaseUrlIssue` guarantees this is defined without exposing the secret.
  const adapter = new PrismaNeon({ connectionString });

  return new PrismaClient({
    adapter,
  });
}

export function getPrismaClient() {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }

  return globalForPrisma.prisma;
}

export function isPrismaConfigurationError(error: unknown) {
  return error instanceof PrismaConfigurationError;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, property, receiver) {
    const client = getPrismaClient();
    const value = Reflect.get(client, property, receiver);

    return typeof value === "function" ? value.bind(client) : value;
  },
});
