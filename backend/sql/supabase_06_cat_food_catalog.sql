-- DEPRECATED: merged into supabase_complete.sql — do not run separately.

-- ============================================================
-- CatCal â€” Supabase SQL Editor  (STEP 6)
-- Global Cat Food Calorie Catalog (verified seed)
-- ============================================================
--
-- IMPORTANT: This is Phase 1 â€” officially sourced products only.
-- A 10,000+ SKU catalog requires automated manufacturer ingestion
-- (see backend/scripts/INGESTION.md). Do NOT bulk-insert unverified data.
--
-- Run AFTER steps 1â€“2 (and 5 if upgrading an older database).
-- Safe to re-run (uses ON CONFLICT).
-- ============================================================

-- â”€â”€ 1. Catalog table â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

UPDATE "FeedingLog"
SET grams = 43, kcal = 151
WHERE id = 'feed_001';

-- â”€â”€ 4. Verify â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

SELECT brand, product_name, flavor, category,
       me_kcal_per_kg, me_kcal_per_100g, calculation_method, confidence_score
FROM "CatFoodProduct"
ORDER BY brand, product_name;

SELECT value, label, "kcalPer100g", "catalogProductId"
FROM "FoodBrand"
ORDER BY label;
