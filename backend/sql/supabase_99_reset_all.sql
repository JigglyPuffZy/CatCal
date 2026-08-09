-- DEPRECATED: merged into supabase_complete.sql — do not run separately.

-- ============================================================
-- CatCal â€” RESET ALL (Supabase SQL Editor)
-- Dashboard â†’ SQL Editor â†’ New query â†’ paste â†’ Run
-- ============================================================
--
-- OPTION A (default below): delete all rows, keep tables
-- OPTION B (bottom, commented): drop all CatCal tables completely
--
-- After full drop (B), re-run: supabase.sql â†’ 02 â†’ 03 â†’ 08
-- ============================================================


-- â”€â”€ OPTION A â€” DELETE ALL DATA â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- Skips tables that do not exist yet. Safe to re-run.

DO $$
DECLARE
  t TEXT;
  existing TEXT[] := ARRAY[]::TEXT[];
  tables TEXT[] := ARRAY[
    'CatNutritionPlan',
    'FeedingLog',
    'WeightLog',
    'WeightRecord',
    'Cat',
    'FeedingSchedule',
    'NotificationSettings',
    'Profile',
    'UserPreference',
    'CatFoodProduct',
    'FoodBrand',
    'User'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    IF EXISTS (
      SELECT 1
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name = t
    ) THEN
      existing := array_append(existing, t);
    END IF;
  END LOOP;

  IF array_length(existing, 1) IS NULL THEN
    RAISE NOTICE 'No CatCal tables found â€” nothing to clear.';
    RETURN;
  END IF;

  EXECUTE format(
    'TRUNCATE TABLE %s RESTART IDENTITY CASCADE',
    (
      SELECT string_agg(format('%I', x), ', ')
      FROM unnest(existing) AS x
    )
  );

  RAISE NOTICE 'Truncated: %', array_to_string(existing, ', ');
END $$;

-- Verify (only shows tables that exist):
SELECT 'User' AS tbl, COUNT(*)::bigint AS rows FROM "User"
UNION ALL
SELECT 'Cat', COUNT(*)::bigint FROM "Cat"
UNION ALL
SELECT 'FeedingLog', COUNT(*)::bigint FROM "FeedingLog";


-- â”€â”€ OPTION B â€” DROP ALL TABLES (uncomment to use) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- Comment out OPTION A above, then uncomment this entire block.

/*
DROP TRIGGER IF EXISTS catcal_user_preference_active_cat ON "UserPreference";
DROP TRIGGER IF EXISTS catcal_user_updated_at ON "User";
DROP TRIGGER IF EXISTS catcal_cat_updated_at ON "Cat";
DROP TRIGGER IF EXISTS catcal_user_preference_on_signup ON "User";
DROP TRIGGER IF EXISTS catcal_clear_active_cat ON "Cat";

DROP FUNCTION IF EXISTS catcal_validate_active_cat() CASCADE;
DROP FUNCTION IF EXISTS catcal_set_updated_at() CASCADE;
DROP FUNCTION IF EXISTS catcal_create_user_preference() CASCADE;
DROP FUNCTION IF EXISTS catcal_clear_active_cat_on_delete() CASCADE;

DROP TABLE IF EXISTS "CatNutritionPlan" CASCADE;
DROP TABLE IF EXISTS "FeedingLog" CASCADE;
DROP TABLE IF EXISTS "WeightLog" CASCADE;
DROP TABLE IF EXISTS "WeightRecord" CASCADE;
DROP TABLE IF EXISTS "Cat" CASCADE;
DROP TABLE IF EXISTS "FeedingSchedule" CASCADE;
DROP TABLE IF EXISTS "NotificationSettings" CASCADE;
DROP TABLE IF EXISTS "Profile" CASCADE;
DROP TABLE IF EXISTS "UserPreference" CASCADE;
DROP TABLE IF EXISTS "CatFoodProduct" CASCADE;
DROP TABLE IF EXISTS "FoodBrand" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;

SELECT 'All CatCal tables dropped. Re-run supabase.sql â†’ 02 â†’ 03 â†’ 08.' AS status;
*/
