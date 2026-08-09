const DEV_JWT_FALLBACK = "dev-secret-change-me";

export function validateEnv(): void {
  const isProd = process.env.NODE_ENV === "production";
  const missing: string[] = [];

  if (!process.env.DATABASE_URL) {
    missing.push("DATABASE_URL");
  }

  const jwtSecret = process.env.JWT_SECRET?.trim();
  if (isProd && !jwtSecret) {
    missing.push("JWT_SECRET");
  } else if (isProd && jwtSecret === DEV_JWT_FALLBACK) {
    throw new Error(
      "JWT_SECRET must be set to a strong random value in production."
    );
  }

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }

  if (isProd && !process.env.DATABASE_URL?.includes("sslmode=require")) {
    console.warn(
      "DATABASE_URL should include sslmode=require for Supabase Postgres."
    );
  }
}

export function getJwtSecret(): string {
  return process.env.JWT_SECRET?.trim() ?? DEV_JWT_FALLBACK;
}
