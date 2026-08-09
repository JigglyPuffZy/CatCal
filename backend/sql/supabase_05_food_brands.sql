-- DEPRECATED: merged into supabase_complete.sql — do not run separately.

-- ============================================================
-- CatCal â€” Supabase SQL Editor  (STEP 5 of 5)
-- Run AFTER supabase_04_verify.sql (or after step 2 if skipping 3â€“4)
-- ============================================================
-- Adds FoodBrand reference table, links Cat.foodBrandValue,
-- seeds brands, and aligns demo feeding log with live math.
-- Safe to re-run.
-- ============================================================

-- â”€â”€ 1. FoodBrand table â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

CREATE TABLE IF NOT EXISTS "FoodBrand" (
  value         TEXT PRIMARY KEY,
  label         TEXT NOT NULL,
  "kcalPer100g" INTEGER NOT NULL CHECK ("kcalPer100g" > 0)
);

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

-- â”€â”€ 2. Drop old CHECK on Cat.foodBrandValue (from step 1) â”€â”€

ALTER TABLE "Cat" DROP CONSTRAINT IF EXISTS "Cat_foodBrandValue_check";

-- â”€â”€ 3. FK: Cat â†’ FoodBrand â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Cat_foodBrandValue_fkey'
  ) THEN
    ALTER TABLE "Cat"
      ADD CONSTRAINT "Cat_foodBrandValue_fkey"
      FOREIGN KEY ("foodBrandValue") REFERENCES "FoodBrand"(value);
  END IF;
END $$;

-- â”€â”€ 4. Align demo feeding log with current plan (4.1 kg Mochi) â”€

UPDATE "FeedingLog"
SET grams = 43, kcal = 151
WHERE id = 'feed_001';

-- â”€â”€ 5. Verify â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

SELECT value, label, "kcalPer100g"
FROM "FoodBrand"
ORDER BY label;

SELECT c.name, c."foodBrandValue", f.label, f."kcalPer100g"
FROM "Cat" c
JOIN "FoodBrand" f ON f.value = c."foodBrandValue"
WHERE c.id = 'cat_mochi_001';
