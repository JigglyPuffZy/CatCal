import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

export async function pingDatabase(retries = 3): Promise<void> {
  let lastError: unknown;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      await prisma.user.count();
      return;
    } catch (error) {
      lastError = error;
      if (attempt < retries - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1500 * (attempt + 1)));
      }
    }
  }

  throw lastError;
}

export function databaseErrorHint(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);

  if (message.includes("Can't reach database server")) {
    return "Supabase is unreachable. Restart backend (npm run dev), check Wi‑Fi, and confirm the project is not paused in Supabase Dashboard.";
  }

  if (message.includes("password authentication failed")) {
    return "Database password is wrong. Reset it in Supabase → Database → Settings and update backend/.env.";
  }

  if (!process.env.DATABASE_URL?.includes("sslmode=require")) {
    return "Add sslmode=require to DATABASE_URL in backend/.env for Supabase.";
  }

  return "Check backend/.env DATABASE_URL and restart the API server.";
}
