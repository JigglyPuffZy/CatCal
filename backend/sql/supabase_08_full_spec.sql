-- DEPRECATED: merged into supabase_complete.sql — do not run separately.

-- ============================================================
-- CatCal â€” Full spec schema migration (run after earlier steps)
-- Maps to: profiles, cats, cat_nutrition_plans, weight_logs,
-- feeding_schedules, feeding_logs, notification_settings, food_brands
-- Safe to re-run where noted.
-- ============================================================

CREATE TABLE IF NOT EXISTS "Profile" (
  "userId"      TEXT PRIMARY KEY REFERENCES "User"(id) ON DELETE CASCADE,
  "fullName"    TEXT NOT NULL,
  "activeCatId" TEXT,
  "updatedAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "NotificationSettings" (
  "userId"              TEXT PRIMARY KEY REFERENCES "User"(id) ON DELETE CASCADE,
  "remindersEnabled"    BOOLEAN NOT NULL DEFAULT TRUE,
  "notifyBeforeMinutes" INTEGER NOT NULL DEFAULT 15,
  "pushEnabled"         BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS "FeedingSchedule" (
  id          TEXT PRIMARY KEY,
  "userId"    TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  label       TEXT NOT NULL,
  time        TEXT NOT NULL,
  "sortOrder" INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS "FeedingSchedule_userId_sortOrder_idx"
  ON "FeedingSchedule"("userId", "sortOrder");

CREATE TABLE IF NOT EXISTS "CatNutritionPlan" (
  id              TEXT PRIMARY KEY,
  "catId"         TEXT NOT NULL REFERENCES "Cat"(id) ON DELETE CASCADE,
  "dailyKcal"     INTEGER NOT NULL,
  "kcalPerMeal"   INTEGER NOT NULL,
  "gramsPerDay"   INTEGER NOT NULL,
  "gramsPerMeal"  INTEGER NOT NULL,
  "foodBrandLabel" TEXT NOT NULL,
  rer             INTEGER NOT NULL,
  "activityFactor" DOUBLE PRECISION NOT NULL,
  "healthFactor"  DOUBLE PRECISION NOT NULL,
  "kcalPer100g"   INTEGER NOT NULL,
  "isCurrent"     BOOLEAN NOT NULL DEFAULT TRUE,
  "computedAt"    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "CatNutritionPlan_catId_isCurrent_idx"
  ON "CatNutritionPlan"("catId", "isCurrent");

-- Rename WeightRecord â†’ WeightLog if old table exists (manual step on Postgres)
-- ALTER TABLE "WeightRecord" RENAME TO "WeightLog";

CREATE TABLE IF NOT EXISTS "WeightLog" (
  id           TEXT PRIMARY KEY,
  "catId"      TEXT NOT NULL REFERENCES "Cat"(id) ON DELETE CASCADE,
  "weightKg"   DOUBLE PRECISION NOT NULL CHECK ("weightKg" > 0),
  "recordedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  source       TEXT NOT NULL CHECK (source IN ('registration', 'profile_update', 'manual'))
);

CREATE INDEX IF NOT EXISTS "WeightLog_catId_recordedAt_idx"
  ON "WeightLog"("catId", "recordedAt" DESC);

-- Migrate UserPreference data if present
INSERT INTO "Profile" ("userId", "fullName", "activeCatId", "updatedAt")
SELECT u.id, u."fullName", p."activeCatId", NOW()
FROM "User" u
LEFT JOIN "UserPreference" p ON p."userId" = u.id
ON CONFLICT ("userId") DO NOTHING;

INSERT INTO "NotificationSettings" ("userId")
SELECT id FROM "User"
ON CONFLICT ("userId") DO NOTHING;
