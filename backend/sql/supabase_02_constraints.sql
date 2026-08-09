-- DEPRECATED: merged into supabase_complete.sql — do not run separately.

-- ============================================================
-- CatCal â€” Supabase SQL Editor  (STEP 2 of 4)
-- Run AFTER supabase.sql
-- ============================================================
-- Adds integrity rules the Express API expects but Prisma does
-- not enforce at the database layer.
-- Safe to re-run (uses IF NOT EXISTS / DROP IF EXISTS).
-- ============================================================

-- â”€â”€ 1. UNIQUE QR codes (scan lookup must be 1:1) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

CREATE UNIQUE INDEX IF NOT EXISTS "Cat_qrCode_key" ON "Cat"("qrCode");

-- â”€â”€ 2. activeCatId â†’ Cat FK (clears when cat deleted) â”€â”€â”€â”€â”€â”€â”€

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'UserPreference_activeCatId_fkey'
  ) THEN
    ALTER TABLE "UserPreference"
      ADD CONSTRAINT "UserPreference_activeCatId_fkey"
      FOREIGN KEY ("activeCatId") REFERENCES "Cat"(id) ON DELETE SET NULL;
  END IF;
END $$;

-- â”€â”€ 3. activeCatId must belong to the same user â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

CREATE OR REPLACE FUNCTION catcal_validate_active_cat()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW."activeCatId" IS NOT NULL AND NOT EXISTS (
    SELECT 1
    FROM "Cat" c
    WHERE c.id = NEW."activeCatId"
      AND c."userId" = NEW."userId"
  ) THEN
    RAISE EXCEPTION 'activeCatId % does not belong to user %', NEW."activeCatId", NEW."userId";
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS catcal_user_preference_active_cat ON "UserPreference";
CREATE TRIGGER catcal_user_preference_active_cat
  BEFORE INSERT OR UPDATE OF "activeCatId", "userId" ON "UserPreference"
  FOR EACH ROW
  EXECUTE FUNCTION catcal_validate_active_cat();

-- â”€â”€ 4. Auto-maintain updatedAt (matches Prisma @updatedAt) â”€â”€

CREATE OR REPLACE FUNCTION catcal_set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS catcal_user_updated_at ON "User";
CREATE TRIGGER catcal_user_updated_at
  BEFORE UPDATE ON "User"
  FOR EACH ROW
  EXECUTE FUNCTION catcal_set_updated_at();

DROP TRIGGER IF EXISTS catcal_cat_updated_at ON "Cat";
CREATE TRIGGER catcal_cat_updated_at
  BEFORE UPDATE ON "Cat"
  FOR EACH ROW
  EXECUTE FUNCTION catcal_set_updated_at();

-- â”€â”€ 5. Safety net: UserPreference row on every new User â”€â”€â”€â”€â”€
-- Register API creates this via Prisma; trigger covers manual inserts.

CREATE OR REPLACE FUNCTION catcal_create_user_preference()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO "UserPreference" ("userId", "remindersEnabled")
  VALUES (NEW.id, TRUE)
  ON CONFLICT ("userId") DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS catcal_user_preference_on_signup ON "User";
CREATE TRIGGER catcal_user_preference_on_signup
  AFTER INSERT ON "User"
  FOR EACH ROW
  EXECUTE FUNCTION catcal_create_user_preference();

-- â”€â”€ 6. When a cat is deleted, clear stale activeCatId â”€â”€â”€â”€â”€â”€â”€
-- (FK ON DELETE SET NULL handles the reference; this clears
--  preferences that pointed at a cat removed via cascade path)

CREATE OR REPLACE FUNCTION catcal_clear_active_cat_on_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE "UserPreference"
  SET "activeCatId" = NULL
  WHERE "activeCatId" = OLD.id;
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS catcal_clear_active_cat ON "Cat";
CREATE TRIGGER catcal_clear_active_cat
  BEFORE DELETE ON "Cat"
  FOR EACH ROW
  EXECUTE FUNCTION catcal_clear_active_cat_on_delete();
