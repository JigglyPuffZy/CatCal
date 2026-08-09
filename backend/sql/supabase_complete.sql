-- ============================================================
-- CatCal - COMPLETE Supabase Setup (ONE FILE)
-- Dashboard → SQL Editor → New query → paste ALL → Run
-- ============================================================
--
-- Includes: schema, catalog, triggers, storage, demo seed,
--           verify checks, and all 31 working queries (no placeholders).
--
-- Matches backend Prisma schema (8 tables + User auth):
--   User, Profile, Cat, CatNutritionPlan, WeightLog,
--   FeedingSchedule, FeedingLog, NotificationSettings, FoodBrand
--   + optional CatFoodProduct catalog
--
-- Demo login: test@catcal.dev / password123
--
-- Backend after run:
--   prisma/schema.prisma → provider = "postgresql"
--   backend/.env → DATABASE_URL = Supabase pooler URL
--   cd backend && npx prisma generate && npm run dev
-- ============================================================


-- ════════════════════════════════════════════════════════════
-- PART 0 - Drop legacy schema + old triggers (safe on fresh DB)
-- ════════════════════════════════════════════════════════════

-- Drop legacy tables first (CASCADE removes their triggers)
DROP TABLE IF EXISTS "UserPreference" CASCADE;
DROP TABLE IF EXISTS "WeightRecord" CASCADE;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'User'
  ) THEN
    DROP TRIGGER IF EXISTS catcal_user_preference_on_signup ON "User";
    DROP TRIGGER IF EXISTS catcal_create_user_preference ON "User";
    ALTER TABLE "User" DROP COLUMN IF EXISTS "fullName";
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'Cat'
  ) THEN
    DROP TRIGGER IF EXISTS catcal_clear_active_cat ON "Cat";
  END IF;
END $$;

DROP FUNCTION IF EXISTS catcal_create_user_preference() CASCADE;

-- PART 1 - CORE TABLES (8 spec tables + auth)
-- ════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS "User" (
  id             TEXT PRIMARY KEY,
  email          TEXT NOT NULL UNIQUE,
  "passwordHash" TEXT NOT NULL,
  "createdAt"    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "FoodBrand" (
  value         TEXT PRIMARY KEY,
  label         TEXT NOT NULL,
  "kcalPer100g" INTEGER NOT NULL CHECK ("kcalPer100g" > 0)
);

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

CREATE TABLE IF NOT EXISTS "Cat" (
  id                TEXT PRIMARY KEY,
  "userId"          TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  name              TEXT NOT NULL,
  "photoUri"        TEXT,
  "birthDate"       TIMESTAMPTZ NOT NULL,
  "weightKg"        DOUBLE PRECISION NOT NULL,
  sex               TEXT NOT NULL CHECK (sex IN ('male', 'female')),
  "activityLevel"   TEXT NOT NULL CHECK ("activityLevel" IN ('sedentary', 'light', 'moderate', 'active')),
  "healthCondition" TEXT NOT NULL CHECK ("healthCondition" IN ('healthy', 'overweight', 'underweight', 'senior', 'kitten')),
  "foodBrandValue"  TEXT NOT NULL REFERENCES "FoodBrand"(value),
  "qrCode"          TEXT NOT NULL,
  "createdAt"       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "Cat_userId_idx" ON "Cat"("userId");
CREATE UNIQUE INDEX IF NOT EXISTS "Cat_qrCode_key" ON "Cat"("qrCode");

CREATE TABLE IF NOT EXISTS "CatNutritionPlan" (
  id               TEXT PRIMARY KEY,
  "catId"          TEXT NOT NULL REFERENCES "Cat"(id) ON DELETE CASCADE,
  "dailyKcal"      INTEGER NOT NULL,
  "kcalPerMeal"    INTEGER NOT NULL,
  "gramsPerDay"    INTEGER NOT NULL,
  "gramsPerMeal"   INTEGER NOT NULL,
  "foodBrandLabel" TEXT NOT NULL,
  rer              INTEGER NOT NULL,
  "activityFactor" DOUBLE PRECISION NOT NULL,
  "healthFactor"   DOUBLE PRECISION NOT NULL,
  "kcalPer100g"    INTEGER NOT NULL,
  "isCurrent"      BOOLEAN NOT NULL DEFAULT TRUE,
  "computedAt"     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "CatNutritionPlan_catId_isCurrent_idx"
  ON "CatNutritionPlan"("catId", "isCurrent");

CREATE TABLE IF NOT EXISTS "FeedingLog" (
  id          TEXT PRIMARY KEY,
  "catId"     TEXT NOT NULL REFERENCES "Cat"(id) ON DELETE CASCADE,
  "mealLabel" TEXT NOT NULL,
  grams       INTEGER NOT NULL CHECK (grams >= 0),
  kcal        INTEGER NOT NULL CHECK (kcal >= 0),
  "fedAt"     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "FeedingLog_catId_fedAt_idx"
  ON "FeedingLog"("catId", "fedAt" DESC);

CREATE TABLE IF NOT EXISTS "WeightLog" (
  id           TEXT PRIMARY KEY,
  "catId"      TEXT NOT NULL REFERENCES "Cat"(id) ON DELETE CASCADE,
  "weightKg"   DOUBLE PRECISION NOT NULL CHECK ("weightKg" > 0),
  "recordedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  source       TEXT NOT NULL CHECK (source IN ('registration', 'profile_update', 'manual'))
);

CREATE INDEX IF NOT EXISTS "WeightLog_catId_recordedAt_idx"
  ON "WeightLog"("catId", "recordedAt" DESC);

CREATE TABLE IF NOT EXISTS "PasswordResetToken" (
  id          TEXT PRIMARY KEY,
  "userId"    TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  "codeHash"  TEXT NOT NULL,
  "expiresAt" TIMESTAMPTZ NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "PasswordResetToken_userId_idx"
  ON "PasswordResetToken"("userId");

-- Profile.activeCatId → Cat FK
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Profile_activeCatId_fkey') THEN
    ALTER TABLE "Profile"
      ADD CONSTRAINT "Profile_activeCatId_fkey"
      FOREIGN KEY ("activeCatId") REFERENCES "Cat"(id) ON DELETE SET NULL;
  END IF;
END $$;


-- ════════════════════════════════════════════════════════════
-- PART 2 - FOOD BRAND SEED
-- ════════════════════════════════════════════════════════════

INSERT INTO "FoodBrand" (value, label, "kcalPer100g")
VALUES
  ('royal-canin-indoor', 'Royal Canin Indoor', 353),
  ('purina-pro-plan',    'Purina Pro Plan Adult', 436),
  ('hills-science',      'Hill''s Science Diet', 352),
  ('whiskas-dry',        'Whiskas Dry Adult', 340),
  ('blue-buffalo',       'Blue Buffalo Indoor', 372)
ON CONFLICT (value) DO UPDATE SET
  label = EXCLUDED.label,
  "kcalPer100g" = EXCLUDED."kcalPer100g";



-- ════════════════════════════════════════════════════════════
-- ════════════════════════════════════════════════════════════
-- PART 3 - CAT FOOD CATALOG
-- =================================================================

CREATE TABLE IF NOT EXISTS "CatFoodProduct" (
  id                    TEXT PRIMARY KEY,
  brand                 TEXT NOT NULL,
  product_name          TEXT NOT NULL,
  flavor                TEXT,
  life_stage            TEXT,
  food_type             TEXT NOT NULL,
  category              TEXT NOT NULL,
  package_weight_g      INTEGER,
  calories_per_serving  NUMERIC(10, 2),
  serving_size          TEXT,
  serving_weight_g      NUMERIC(10, 2),
  kcal_per_g            NUMERIC(10, 4),
  me_kcal_per_kg        INTEGER NOT NULL,
  me_kcal_per_100g      NUMERIC(10, 2) NOT NULL,
  protein_pct           NUMERIC(5, 2),
  fat_pct               NUMERIC(5, 2),
  fiber_pct             NUMERIC(5, 2),
  ash_pct               NUMERIC(5, 2),
  moisture_pct          NUMERIC(5, 2),
  carbohydrate_pct      NUMERIC(5, 2),
  country               TEXT,
  manufacturer          TEXT,
  official_product_url  TEXT,
  image_url             TEXT,
  source_url            TEXT NOT NULL,
  date_verified         DATE NOT NULL,
  confidence_score      INTEGER NOT NULL CHECK (confidence_score BETWEEN 0 AND 100),
  calculation_method    TEXT NOT NULL CHECK (calculation_method IN ('Official', 'Estimated')),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "CatFoodProduct_unique_sku"
    UNIQUE (brand, product_name, flavor, food_type, package_weight_g)
);

CREATE INDEX IF NOT EXISTS "CatFoodProduct_brand_idx"
  ON "CatFoodProduct"(brand);

CREATE INDEX IF NOT EXISTS "CatFoodProduct_category_idx"
  ON "CatFoodProduct"(category);

CREATE INDEX IF NOT EXISTS "CatFoodProduct_me_idx"
  ON "CatFoodProduct"(me_kcal_per_100g);

-- Optional link from simplified app picker â†’ full catalog row
ALTER TABLE "FoodBrand"
  ADD COLUMN IF NOT EXISTS "catalogProductId" TEXT
  REFERENCES "CatFoodProduct"(id) ON DELETE SET NULL;

-- â”€â”€ 2. Verified products (Official sources only) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- ME conversions: kcal/g = me_kcal_per_kg / 1000
--                  kcal/100g = me_kcal_per_kg / 10

INSERT INTO "CatFoodProduct" (
  id, brand, product_name, flavor, life_stage, food_type, category,
  package_weight_g, calories_per_serving, serving_size, serving_weight_g,
  kcal_per_g, me_kcal_per_kg, me_kcal_per_100g,
  protein_pct, fat_pct, fiber_pct, ash_pct, moisture_pct, carbohydrate_pct,
  country, manufacturer, official_product_url, image_url, source_url,
  date_verified, confidence_score, calculation_method
) VALUES

-- Royal Canin â€” Indoor Adult Dry (US official product page)
(
  'rc-indoor-adult-dry',
  'Royal Canin',
  'Indoor Adult',
  'Chicken meal',
  'Adult (1â€“7 years)',
  'Dry',
  'Dry Food',
  NULL,
  325,
  '1 cup',
  NULL,
  3.534,
  3534,
  353.40,
  27.0,
  11.0,
  5.7,
  NULL,
  8.0,
  NULL,
  'United States',
  'Royal Canin SAS',
  'https://www.royalcanin.com/us/cats/products/retail-products/indoor-adult-2529',
  NULL,
  'https://www.royalcanin.com/us/cats/products/retail-products/indoor-adult-2529',
  '2026-08-01',
  100,
  'Official'
),
(
  'rc-indoor-adult-dry-1588g',
  'Royal Canin',
  'Indoor Adult',
  'Chicken meal',
  'Adult (1â€“7 years)',
  'Dry',
  'Dry Food',
  1588,
  NULL,
  NULL,
  NULL,
  3.534,
  3534,
  353.40,
  27.0,
  11.0,
  5.7,
  NULL,
  8.0,
  NULL,
  'United States',
  'Royal Canin SAS',
  'https://www.royalcanin.com/us/cats/products/retail-products/indoor-adult-2529',
  NULL,
  'https://www.royalcanin.com/us/cats/products/retail-products/indoor-adult-2529',
  '2026-08-01',
  100,
  'Official'
),
(
  'rc-indoor-adult-dry-3175g',
  'Royal Canin',
  'Indoor Adult',
  'Chicken meal',
  'Adult (1â€“7 years)',
  'Dry',
  'Dry Food',
  3175,
  NULL,
  NULL,
  NULL,
  3.534,
  3534,
  353.40,
  27.0,
  11.0,
  5.7,
  NULL,
  8.0,
  NULL,
  'United States',
  'Royal Canin SAS',
  'https://www.royalcanin.com/us/cats/products/retail-products/indoor-adult-2529',
  NULL,
  'https://www.royalcanin.com/us/cats/products/retail-products/indoor-adult-2529',
  '2026-08-01',
  100,
  'Official'
),

-- Purina Pro Plan â€” LiveClear Chicken & Rice Dry (official PDF)
(
  'pp-liveclear-chicken-rice-dry',
  'Purina Pro Plan',
  'LiveClear Chicken & Rice Formula',
  'Chicken & rice',
  'Adult',
  'Dry',
  'Dry Food',
  NULL,
  494,
  '1 cup',
  113,
  4.358,
  4358,
  435.80,
  36.0,
  16.0,
  2.0,
  NULL,
  12.0,
  NULL,
  'United States',
  'NestlÃ© Purina PetCare',
  'https://www.purina.com/cats/shop/pro-plan-liveclear-chicken-rice-dry-cat-food',
  NULL,
  'https://www.purina.com/sites/default/files/products/files/4601_-_A460119_Pro_Plan_Cat_Food_Adult_LiveClear_Chicken_Rice_Formula.pdf',
  '2026-08-01',
  100,
  'Official'
),

-- Purina Pro Plan â€” Complete Essentials Chicken & Rice Dry (Purina shop listing)
(
  'pp-ce-chicken-rice-dry',
  'Purina Pro Plan',
  'Complete Essentials Chicken & Rice Formula',
  'Chicken & rice',
  'Adult',
  'Dry',
  'Dry Food',
  NULL,
  494,
  '1 cup',
  NULL,
  4.358,
  4358,
  435.80,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'United States',
  'NestlÃ© Purina PetCare',
  'https://www.purina.com/cats/shop/pro-plan-complete-essentials-chicken-rice-probiotics-dry-cat-food',
  NULL,
  'https://shop.purina.com/feline-pro-plan-chicken-rice-formula-adult',
  '2026-08-01',
  95,
  'Official'
),

-- Purina Pro Plan â€” Complete Essentials Salmon & Rice Dry (Purina shop)
(
  'pp-ce-salmon-rice-dry',
  'Purina Pro Plan',
  'Complete Essentials Salmon & Rice Formula',
  'Salmon & rice',
  'Adult',
  'Dry',
  'Dry Food',
  NULL,
  561,
  '1 cup',
  NULL,
  4.225,
  4225,
  422.50,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'United States',
  'NestlÃ© Purina PetCare',
  'https://www.purina.com/cats/shop/pro-plan-complete-essentials-salmon-rice-dry-cat-food',
  NULL,
  'https://shop.purina.com/feline-pro-plan-salmon-rice-formula-adult',
  '2026-08-01',
  95,
  'Official'
),

-- Purina Pro Plan â€” Natural Chicken & Egg Dry (official PDF)
(
  'pp-natural-chicken-egg-dry',
  'Purina Pro Plan',
  'Complete Essentials Natural Chicken & Egg Formula',
  'Chicken & egg',
  'Adult',
  'Dry',
  'Dry Food',
  NULL,
  504,
  '1 cup',
  122,
  4.119,
  4119,
  411.90,
  40.0,
  16.0,
  3.0,
  NULL,
  12.0,
  NULL,
  'United States',
  'NestlÃ© Purina PetCare',
  'https://www.purina.com/cats/shop/pro-plan-natural-chicken-egg-dry-cat-food',
  NULL,
  'https://www.purina.com/sites/default/files/products/files/4642_-_B464219_Pro_Plan_Cat_Food_Complete_Essentials_Natural_Chicken_Egg_Formula.pdf',
  '2026-08-01',
  100,
  'Official'
),

-- Fancy Feast â€” Chicken Feast Classic PatÃ© Senior 7+ (official PDF)
(
  'ff-chicken-classic-pate-senior-wet',
  'Fancy Feast',
  'Chicken Feast Classic PatÃ©',
  'Chicken',
  'Senior (7+)',
  'Wet',
  'Senior Food',
  NULL,
  95,
  '1 can',
  NULL,
  1.128,
  1128,
  112.80,
  11.0,
  5.0,
  1.5,
  3.25,
  78.0,
  NULL,
  'United States',
  'NestlÃ© Purina PetCare',
  'https://www.purina.com/cats/shop/fancy-feast-chicken-feast-classic-pate-senior-7-wet-cat-food',
  NULL,
  'https://www.purina.com/sites/default/files/product-label-deck-file/2023-07/6626-b662622-fancy-feast-chicken-feast-classic-pate-senior-7-wet-cat-food-tm1.pdf',
  '2026-08-01',
  100,
  'Official'
),

-- Fancy Feast â€” Chicken Feast In Gravy Minced Senior 7+ (official PDF)
(
  'ff-chicken-gravy-minced-senior-wet',
  'Fancy Feast',
  'Chicken Feast In Gravy Minced',
  'Chicken',
  'Senior (7+)',
  'Wet',
  'Senior Food',
  NULL,
  77,
  '1 can',
  NULL,
  0.909,
  909,
  90.90,
  12.0,
  2.0,
  1.5,
  3.0,
  79.0,
  NULL,
  'United States',
  'NestlÃ© Purina PetCare',
  'https://www.purina.com/cats/shop/fancy-feast-chicken-feast-gravy-minced-senior-7-wet-cat-food',
  NULL,
  'https://www.purina.com/sites/default/files/product-label-deck-file/2023-07/6629-b662922-fancy-feast-chicken-feast-in-gravy-minced-senior-7-wet-cat-food-tm6.pdf',
  '2026-08-01',
  100,
  'Official'
),

-- Fancy Feast â€” Gourmet Naturals Beef (official PDF)
(
  'ff-gn-beef-wet',
  'Fancy Feast',
  'Gourmet Naturals',
  'Beef',
  'Adult',
  'Wet',
  'Wet Food',
  NULL,
  99,
  '1 can',
  NULL,
  1.168,
  1168,
  116.80,
  9.0,
  5.0,
  1.5,
  3.5,
  78.0,
  NULL,
  'United States',
  'NestlÃ© Purina PetCare',
  'https://www.purina.com/cats/shop/fancy-feast-gourmet-naturals-beef-wet-cat-food',
  NULL,
  'https://www.purina.com/sites/default/files/product-label-deck-file/2022-12/6507-b650721-fancy-feast-gourmet-naturals-beef-recipe-cat-wet-nt6-1.pdf',
  '2026-08-01',
  100,
  'Official'
),

-- Fancy Feast â€” Gourmet Naturals Rainbow Trout In Gravy (official PDF)
(
  'ff-gn-trout-gravy-wet',
  'Fancy Feast',
  'Gourmet Naturals In Gravy',
  'Rainbow trout',
  'Adult',
  'Wet',
  'Wet Food',
  NULL,
  65,
  '1 can',
  NULL,
  0.769,
  769,
  76.90,
  11.0,
  2.0,
  1.5,
  2.5,
  82.0,
  NULL,
  'United States',
  'NestlÃ© Purina PetCare',
  'https://www.purina.com/cats/shop/fancy-feast-gourmet-naturals-rainbow-trout-gravy-wet-cat-food',
  NULL,
  'https://www.purina.com/sites/default/files/product-label-deck-file/2022-12/6538-b653821-fancy-feast-gourmet-naturals-rainbow-trout-recipe-cat-wet-tk4.pdf',
  '2026-08-01',
  100,
  'Official'
),

-- Purina ONE â€” Grain Free Chicken PatÃ© Wet (official PDF)
(
  'pone-gf-chicken-pate-wet',
  'Purina ONE',
  'Grain Free Chicken Recipe Premium PatÃ©',
  'Chicken',
  'All life stages',
  'Wet',
  'Grain Free',
  NULL,
  94,
  '1 can',
  NULL,
  1.111,
  1111,
  111.10,
  11.0,
  5.0,
  1.5,
  3.4,
  78.0,
  NULL,
  'United States',
  'NestlÃ© Purina PetCare',
  'https://www.purina.com/cats/shop/purina-one-grain-free-chicken-pate-wet-cat-food',
  NULL,
  'https://www.purina.com/sites/default/files/products/files/F432121_PONE_GF_Chicken_Pate_Wet_Cat_LD.pdf',
  '2026-08-01',
  100,
  'Official'
)

ON CONFLICT (id) DO UPDATE SET
  me_kcal_per_kg = EXCLUDED.me_kcal_per_kg,
  me_kcal_per_100g = EXCLUDED.me_kcal_per_100g,
  calories_per_serving = EXCLUDED.calories_per_serving,
  protein_pct = EXCLUDED.protein_pct,
  fat_pct = EXCLUDED.fat_pct,
  fiber_pct = EXCLUDED.fiber_pct,
  ash_pct = EXCLUDED.ash_pct,
  moisture_pct = EXCLUDED.moisture_pct,
  source_url = EXCLUDED.source_url,
  date_verified = EXCLUDED.date_verified,
  confidence_score = EXCLUDED.confidence_score,
  calculation_method = EXCLUDED.calculation_method,
  updated_at = NOW();

-- â”€â”€ 3. Fix simplified FoodBrand table to match official ME â”€â”€â”€â”€
-- Royal Canin Indoor was 364 (incorrect); official ME = 3534 kcal/kg â†’ 353 kcal/100g

UPDATE "FoodBrand"
SET
  "kcalPer100g" = 353,
  "catalogProductId" = 'rc-indoor-adult-dry'
WHERE value = 'royal-canin-indoor';

UPDATE "FoodBrand"
SET "kcalPer100g" = 436, "catalogProductId" = 'pp-ce-chicken-rice-dry'
WHERE value = 'purina-pro-plan';

UPDATE "FoodBrand"
SET "kcalPer100g" = 352, "catalogProductId" = NULL
WHERE value = 'hills-science';
-- Hill's: no single SKU linked yet â€” keep placeholder until verified per-formula rows added

UPDATE "FoodBrand"
SET "kcalPer100g" = 340, "catalogProductId" = NULL
WHERE value = 'whiskas-dry';

UPDATE "FoodBrand"
SET "kcalPer100g" = 372, "catalogProductId" = NULL
WHERE value = 'blue-buffalo';

-- =================================================================
-- PART 4 - CONSTRAINTS & TRIGGERS
-- =================================================================

-- Ensure legacy signup trigger is gone before creating the new one
DROP TRIGGER IF EXISTS catcal_user_preference_on_signup ON "User";
DROP FUNCTION IF EXISTS catcal_create_user_preference() CASCADE;

CREATE OR REPLACE FUNCTION catcal_validate_active_cat()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW."activeCatId" IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM "Cat" c
    WHERE c.id = NEW."activeCatId" AND c."userId" = NEW."userId"
  ) THEN
    RAISE EXCEPTION 'activeCatId % does not belong to user %', NEW."activeCatId", NEW."userId";
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS catcal_profile_active_cat ON "Profile";
CREATE TRIGGER catcal_profile_active_cat
  BEFORE INSERT OR UPDATE OF "activeCatId", "userId" ON "Profile"
  FOR EACH ROW EXECUTE FUNCTION catcal_validate_active_cat();

CREATE OR REPLACE FUNCTION catcal_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS catcal_user_updated_at ON "User";
CREATE TRIGGER catcal_user_updated_at
  BEFORE UPDATE ON "User"
  FOR EACH ROW EXECUTE FUNCTION catcal_set_updated_at();

DROP TRIGGER IF EXISTS catcal_cat_updated_at ON "Cat";
CREATE TRIGGER catcal_cat_updated_at
  BEFORE UPDATE ON "Cat"
  FOR EACH ROW EXECUTE FUNCTION catcal_set_updated_at();

DROP TRIGGER IF EXISTS catcal_profile_updated_at ON "Profile";
CREATE TRIGGER catcal_profile_updated_at
  BEFORE UPDATE ON "Profile"
  FOR EACH ROW EXECUTE FUNCTION catcal_set_updated_at();

CREATE OR REPLACE FUNCTION catcal_on_user_signup()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO "Profile" ("userId", "fullName", "updatedAt")
  VALUES (NEW.id, 'CatCal User', NOW())
  ON CONFLICT ("userId") DO NOTHING;

  INSERT INTO "NotificationSettings" ("userId")
  VALUES (NEW.id)
  ON CONFLICT ("userId") DO NOTHING;

  IF NOT EXISTS (SELECT 1 FROM "FeedingSchedule" WHERE "userId" = NEW.id) THEN
    INSERT INTO "FeedingSchedule" (id, "userId", label, time, "sortOrder") VALUES
      ('sched_' || NEW.id || '_morning', NEW.id, 'Morning meal', '08:00', 0),
      ('sched_' || NEW.id || '_evening', NEW.id, 'Evening meal', '18:30', 1);
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS catcal_on_user_signup ON "User";
CREATE TRIGGER catcal_on_user_signup
  AFTER INSERT ON "User"
  FOR EACH ROW EXECUTE FUNCTION catcal_on_user_signup();

CREATE OR REPLACE FUNCTION catcal_clear_active_cat_on_delete()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  UPDATE "Profile" SET "activeCatId" = NULL, "updatedAt" = NOW()
  WHERE "activeCatId" = OLD.id;
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS catcal_clear_active_cat ON "Cat";
CREATE TRIGGER catcal_clear_active_cat
  BEFORE DELETE ON "Cat"
  FOR EACH ROW EXECUTE FUNCTION catcal_clear_active_cat_on_delete();


-- ════════════════════════════════════════════════════════════
-- PART 5 - STORAGE (cat photos bucket)
-- ════════════════════════════════════════════════════════════

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('cat-photos', 'cat-photos', TRUE, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "cat_photos_public_read" ON storage.objects;
CREATE POLICY "cat_photos_public_read" ON storage.objects FOR SELECT USING (bucket_id = 'cat-photos');

DROP POLICY IF EXISTS "cat_photos_auth_insert" ON storage.objects;
CREATE POLICY "cat_photos_auth_insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'cat-photos');

DROP POLICY IF EXISTS "cat_photos_auth_update" ON storage.objects;
CREATE POLICY "cat_photos_auth_update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'cat-photos');

DROP POLICY IF EXISTS "cat_photos_auth_delete" ON storage.objects;
CREATE POLICY "cat_photos_auth_delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'cat-photos');


-- ════════════════════════════════════════════════════════════
-- PART 6 - DEMO SEED (safe to re-run)
-- ════════════════════════════════════════════════════════════

INSERT INTO "User" (id, email, "passwordHash")
VALUES (
  'user_demo_001',
  'test@catcal.dev',
  '$2b$12$YhmRvlN4DUDxxT0IyfaACeoYzFZE1U4Fp9.8zsuKvKwsZCbZOyvp6'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO "Profile" ("userId", "fullName", "updatedAt")
VALUES ('user_demo_001', 'Jan Leianelle', NOW())
ON CONFLICT ("userId") DO UPDATE SET
  "fullName" = EXCLUDED."fullName",
  "updatedAt" = NOW();

INSERT INTO "NotificationSettings" ("userId")
VALUES ('user_demo_001')
ON CONFLICT ("userId") DO NOTHING;

INSERT INTO "FeedingSchedule" (id, "userId", label, time, "sortOrder")
VALUES
  ('sched_demo_morning', 'user_demo_001', 'Morning meal', '08:00', 0),
  ('sched_demo_evening', 'user_demo_001', 'Evening meal', '18:30', 1)
ON CONFLICT (id) DO NOTHING;

INSERT INTO "Cat" (
  id, "userId", name, "birthDate", "weightKg",
  sex, "activityLevel", "healthCondition", "foodBrandValue", "qrCode"
)
VALUES (
  'cat_mochi_001', 'user_demo_001', 'Mochi',
  '2022-06-15T00:00:00Z', 4.1, 'female', 'light', 'healthy',
  'royal-canin-indoor', 'catcal://cat/cat_mochi_001'
)
ON CONFLICT (id) DO NOTHING;

-- Set active cat AFTER Cat row exists (trigger validates ownership)
UPDATE "Profile"
SET "activeCatId" = 'cat_mochi_001', "updatedAt" = NOW()
WHERE "userId" = 'user_demo_001';

INSERT INTO "CatNutritionPlan" (
  id, "catId", "dailyKcal", "kcalPerMeal", "gramsPerDay", "gramsPerMeal",
  "foodBrandLabel", rer, "activityFactor", "healthFactor", "kcalPer100g", "isCurrent"
)
VALUES (
  'plan_mochi_001', 'cat_mochi_001', 252, 126, 71, 35,
  'Royal Canin Indoor', 180, 1.4, 1.0, 353, TRUE
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO "WeightLog" (id, "catId", "weightKg", "recordedAt", source)
VALUES
  ('weight_001', 'cat_mochi_001', 4.1, NOW(), 'profile_update'),
  ('weight_002', 'cat_mochi_001', 4.2, NOW() - INTERVAL '14 days', 'profile_update'),
  ('weight_003', 'cat_mochi_001', 4.3, NOW() - INTERVAL '30 days', 'registration')
ON CONFLICT (id) DO NOTHING;

INSERT INTO "FeedingLog" (id, "catId", "mealLabel", grams, kcal, "fedAt")
VALUES (
  'feed_001', 'cat_mochi_001', 'Morning meal', 35, 126,
  DATE_TRUNC('day', NOW() AT TIME ZONE 'UTC') + INTERVAL '8 hours 15 minutes'
)
ON CONFLICT (id) DO NOTHING;


-- ════════════════════════════════════════════════════════════
-- PART 7 - VERIFY SETUP
-- ════════════════════════════════════════════════════════════

SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'User', 'Profile', 'NotificationSettings', 'FeedingSchedule',
    'Cat', 'CatNutritionPlan', 'FeedingLog', 'WeightLog', 'FoodBrand', 'CatFoodProduct'
  )
ORDER BY table_name;

SELECT u.email, p."fullName", p."activeCatId", n."remindersEnabled",
       c.name AS cat_name, np."dailyKcal", np."gramsPerDay"
FROM "User" u
LEFT JOIN "Profile" p ON p."userId" = u.id
LEFT JOIN "NotificationSettings" n ON n."userId" = u.id
LEFT JOIN "Cat" c ON c.id = p."activeCatId"
LEFT JOIN "CatNutritionPlan" np ON np."catId" = c.id AND np."isCurrent" = TRUE
WHERE u.email = 'test@catcal.dev';

SELECT id, label, time, "sortOrder" FROM "FeedingSchedule"
WHERE "userId" = 'user_demo_001' ORDER BY "sortOrder";

SELECT id, name, public FROM storage.buckets WHERE id = 'cat-photos';



-- ================================================================
-- PART 8 - ALL 31 APP QUERIES (working SQL, demo IDs)
-- Uses: user_demo_001, cat_mochi_001, test@catcal.dev
-- ================================================================

-- QUERY 01 - Login (API: POST /api/auth/login)
SELECT u.id, u.email, p."fullName", p."activeCatId"
FROM "User" u
LEFT JOIN "Profile" p ON p."userId" = u.id
WHERE u.email = 'test@catcal.dev';

-- QUERY 02 -
INSERT INTO "User" (id, email, "passwordHash")
VALUES (
  'user_demo_002',
  'demo2@catcal.dev',
  '$2b$12$YhmRvlN4DUDxxT0IyfaACeoYzFZE1U4Fp9.8zsuKvKwsZCbZOyvp6'
)
ON CONFLICT (id) DO NOTHING;

UPDATE "Profile"
SET "fullName" = 'Demo User Two', "updatedAt" = NOW()
WHERE "userId" = 'user_demo_002';

-- QUERY 03 - Get user profile (API: GET /api/profile, GET /api/auth/me)
SELECT u.id, u.email, u."createdAt", p."fullName", p."activeCatId"
FROM "User" u
LEFT JOIN "Profile" p ON p."userId" = u.id
WHERE u.email = 'test@catcal.dev';

-- QUERY 04 - Update profile name (API: PATCH /api/profile)
UPDATE "Profile" p
SET "fullName" = 'Jan Leianelle', "updatedAt" = NOW()
FROM "User" u
WHERE p."userId" = u.id AND u.email = 'test@catcal.dev';

-- QUERY 05 -
UPDATE "Profile"
SET "activeCatId" = 'cat_mochi_001', "updatedAt" = NOW()
WHERE "userId" = 'user_demo_001';

-- QUERY 06 -
SELECT 'Logout clears token on phone only. No SQL write needed.' AS query_06_logout;

-- QUERY 07 -
INSERT INTO "Cat" (
  id, "userId", name, "birthDate", "weightKg",
  sex, "activityLevel", "healthCondition", "foodBrandValue", "qrCode"
)
VALUES (
  'cat_mochi_002', 'user_demo_001', 'Luna',
  '2023-01-10T00:00:00Z', 3.8, 'female', 'moderate', 'healthy',
  'purina-pro-plan', 'catcal://cat/cat_mochi_002'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO "WeightLog" (id, "catId", "weightKg", source)
VALUES ('weight_cat_mochi_002_reg', 'cat_mochi_002', 3.8, 'registration')
ON CONFLICT (id) DO NOTHING;

-- QUERY 08 -
SELECT * FROM "Cat"
WHERE "userId" = 'user_demo_001'
ORDER BY "createdAt" ASC;

-- QUERY 09 -
SELECT * FROM "Cat"
WHERE id = 'cat_mochi_001' AND "userId" = 'user_demo_001';

-- QUERY 10 -
SELECT * FROM "Cat"
WHERE id = 'cat_mochi_001' AND "userId" = 'user_demo_001';

-- QUERY 11 -
UPDATE "Cat"
SET name = 'Mochi', "weightKg" = 4.15, "updatedAt" = NOW()
WHERE id = 'cat_mochi_001' AND "userId" = 'user_demo_001';

INSERT INTO "WeightLog" (id, "catId", "weightKg", source)
VALUES ('weight_q11_update', 'cat_mochi_001', 4.15, 'profile_update')
ON CONFLICT (id) DO NOTHING;

-- QUERY 12 -
DELETE FROM "Cat"
WHERE id = 'cat_mochi_002' AND "userId" = 'user_demo_001';

-- QUERY 13 -
UPDATE "CatNutritionPlan"
SET "isCurrent" = FALSE
WHERE "catId" = 'cat_mochi_001' AND "isCurrent" = TRUE;

INSERT INTO "CatNutritionPlan" (
  id, "catId", "dailyKcal", "kcalPerMeal", "gramsPerDay", "gramsPerMeal",
  "foodBrandLabel", rer, "activityFactor", "healthFactor", "kcalPer100g", "isCurrent"
)
VALUES (
  'plan_mochi_001_v2', 'cat_mochi_001', 258, 129, 73, 36,
  'Royal Canin Indoor', 180, 1.4, 1.0, 353, TRUE
)
ON CONFLICT (id) DO NOTHING;

-- QUERY 14 -
SELECT * FROM "CatNutritionPlan"
WHERE "catId" = 'cat_mochi_001' AND "isCurrent" = TRUE
ORDER BY "computedAt" DESC
LIMIT 1;

-- QUERY 15 -
SELECT
  c.id AS "catId",
  c."weightKg",
  ROUND(70 * POWER(c."weightKg", 0.75) * 1.4 * 1.0)::integer AS "dailyKcal",
  fb.label AS "foodBrandLabel",
  fb."kcalPer100g"
FROM "Cat" c
JOIN "FoodBrand" fb ON fb.value = c."foodBrandValue"
WHERE c.id = 'cat_mochi_001';

-- QUERY 16 -
INSERT INTO "FeedingLog" (id, "catId", "mealLabel", grams, kcal)
VALUES ('feed_q16_afternoon', 'cat_mochi_001', 'Evening meal', 36, 129)
ON CONFLICT (id) DO NOTHING;

-- QUERY 17 -
SELECT
  COUNT(*) AS "mealsDone",
  (SELECT COUNT(*) FROM "FeedingSchedule" WHERE "userId" = 'user_demo_001') AS "mealsTotal",
  COALESCE(SUM(fl.kcal), 0) AS "kcalFedToday"
FROM "FeedingLog" fl
WHERE fl."catId" = 'cat_mochi_001'
  AND fl."fedAt" >= DATE_TRUNC('day', NOW());

-- QUERY 18 -
SELECT * FROM "FeedingSchedule"
WHERE "userId" = 'user_demo_001'
ORDER BY "sortOrder" ASC;

-- QUERY 19 -
SELECT * FROM "FeedingLog"
WHERE "catId" = 'cat_mochi_001'
ORDER BY "fedAt" DESC;

-- QUERY 20 -
INSERT INTO "FeedingSchedule" (id, "userId", label, time, "sortOrder")
VALUES ('sched_query20_snack', 'user_demo_001', 'Snack', '15:00', 2)
ON CONFLICT (id) DO NOTHING;

-- QUERY 21 -
SELECT * FROM "FeedingSchedule"
WHERE "userId" = 'user_demo_001'
ORDER BY "sortOrder" ASC;

-- QUERY 22 -
UPDATE "FeedingSchedule"
SET label = 'Afternoon snack', time = '15:30', "sortOrder" = 2
WHERE id = 'sched_query20_snack' AND "userId" = 'user_demo_001';

-- QUERY 23 -
DELETE FROM "FeedingSchedule"
WHERE id = 'sched_query20_snack' AND "userId" = 'user_demo_001';

-- QUERY 24 -
INSERT INTO "WeightLog" (id, "catId", "weightKg", source)
VALUES ('weight_q24_manual', 'cat_mochi_001', 4.15, 'manual')
ON CONFLICT (id) DO NOTHING;

-- QUERY 25 -
SELECT * FROM "WeightLog"
WHERE "catId" = 'cat_mochi_001'
ORDER BY "recordedAt" DESC;

-- QUERY 26 -
WITH ranked AS (
  SELECT *, ROW_NUMBER() OVER (ORDER BY "recordedAt" DESC) AS rn
  FROM "WeightLog" WHERE "catId" = 'cat_mochi_001'
)
SELECT
  (SELECT "weightKg" FROM ranked WHERE rn = 1) AS "currentWeightKg",
  (SELECT "weightKg" FROM ranked WHERE rn = 2) AS "previousWeightKg",
  (SELECT "weightKg" FROM ranked WHERE rn = 1)
    - COALESCE((SELECT "weightKg" FROM ranked WHERE rn = 2), 0) AS "changeKg";

-- QUERY 27 -
SELECT
  p."activeCatId",
  (SELECT COUNT(*) FROM "Cat" WHERE "userId" = 'user_demo_001') AS "catCount",
  c.name AS "activeCatName",
  np."dailyKcal",
  np."gramsPerDay"
FROM "Profile" p
LEFT JOIN "Cat" c ON c.id = p."activeCatId"
LEFT JOIN "CatNutritionPlan" np ON np."catId" = c.id AND np."isCurrent" = TRUE
WHERE p."userId" = 'user_demo_001';

-- QUERY 28 -
SELECT type, at, id, "catId", detail, grams, kcal
FROM (
  SELECT 'feeding'::text AS type, fl."fedAt" AS at, fl.id, fl."catId",
         fl."mealLabel" AS detail, fl.grams, fl.kcal
  FROM "FeedingLog" fl
  JOIN "Cat" c ON c.id = fl."catId"
  WHERE c."userId" = 'user_demo_001'
  UNION ALL
  SELECT 'weight'::text, wl."recordedAt", wl.id, wl."catId",
         wl.source, NULL::integer, NULL::integer
  FROM "WeightLog" wl
  JOIN "Cat" c ON c.id = wl."catId"
  WHERE c."userId" = 'user_demo_001'
) activity
ORDER BY at DESC
LIMIT 20;

-- QUERY 29 -
SELECT * FROM "NotificationSettings"
WHERE "userId" = 'user_demo_001';

-- QUERY 30 -
UPDATE "NotificationSettings"
SET "remindersEnabled" = TRUE, "notifyBeforeMinutes" = 15, "pushEnabled" = TRUE
WHERE "userId" = 'user_demo_001';

-- QUERY 31 -
SELECT value, label, "kcalPer100g"
FROM "FoodBrand"
ORDER BY label ASC;

-- ════════════════════════════════════════════════════════════
-- PART 9 - RESET ALL DATA (run separately when you want a wipe)
-- Copy this block to a new SQL Editor query - do NOT run with setup
-- ════════════════════════════════════════════════════════════

-- DO $$
-- DECLARE t TEXT; existing TEXT[] := ARRAY[]::TEXT[];
--   tables TEXT[] := ARRAY[
--     'CatNutritionPlan','FeedingLog','WeightLog','Cat','FeedingSchedule',
--     'NotificationSettings','Profile','CatFoodProduct','FoodBrand','User'
--   ];
-- BEGIN
--   FOREACH t IN ARRAY tables LOOP
--     IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name=t) THEN
--       existing := array_append(existing, t);
--     END IF;
--   END LOOP;
--   IF array_length(existing,1) IS NOT NULL THEN
--     EXECUTE format('TRUNCATE TABLE %s RESTART IDENTITY CASCADE',
--       (SELECT string_agg(format('%I',x),', ') FROM unnest(existing) AS x));
--   END IF;
-- END $$;


