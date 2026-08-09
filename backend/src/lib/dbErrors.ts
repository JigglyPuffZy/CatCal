import { Prisma } from "@prisma/client";

export function isDatabaseUnavailable(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientInitializationError ||
    error instanceof Prisma.PrismaClientKnownRequestError ||
    error instanceof Prisma.PrismaClientUnknownRequestError
  );
}

export function databaseErrorMessage(): string {
  return "Server could not reach the database. Check backend DATABASE_URL and try again.";
}
