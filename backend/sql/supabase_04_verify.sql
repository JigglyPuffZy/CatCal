-- DEPRECATED: merged into supabase_complete.sql — do not run separately.

-- ============================================================
-- CatCal â€” Supabase SQL Editor  (STEP 4 of 4)
-- Read-only checks â€” run anytime to confirm setup
-- ============================================================

-- Tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('User', 'UserPreference', 'FoodBrand', 'Cat', 'FeedingLog', 'WeightRecord')
ORDER BY table_name;

-- Constraints & triggers applied
SELECT conname AS constraint_name, conrelid::regclass AS table_name
FROM pg_constraint
WHERE conname IN ('UserPreference_activeCatId_fkey')
ORDER BY conname;

SELECT tgname AS trigger_name, relname AS table_name
FROM pg_trigger t
JOIN pg_class c ON c.oid = t.tgrelid
WHERE tgname LIKE 'catcal_%'
  AND NOT tgisinternal
ORDER BY tgname;

-- Demo account + Mochi
SELECT
  u.email,
  u."fullName",
  c.name       AS cat_name,
  c."weightKg",
  c."qrCode",
  p."activeCatId",
  p."remindersEnabled"
FROM "User" u
LEFT JOIN "UserPreference" p ON p."userId" = u.id
LEFT JOIN "Cat" c            ON c."userId" = u.id
WHERE u.email = 'test@catcal.dev';

-- Today's feeding progress (dashboard uses this pattern)
SELECT
  c.name,
  COUNT(f.id) FILTER (
    WHERE f."fedAt" >= DATE_TRUNC('day', NOW() AT TIME ZONE 'UTC')
      AND f."fedAt" <  DATE_TRUNC('day', NOW() AT TIME ZONE 'UTC') + INTERVAL '1 day'
  ) AS meals_logged_today
FROM "Cat" c
LEFT JOIN "FeedingLog" f ON f."catId" = c.id
WHERE c.id = 'cat_mochi_001'
GROUP BY c.name;

-- Weight history
SELECT "weightKg", source, "recordedAt"
FROM "WeightRecord"
WHERE "catId" = 'cat_mochi_001'
ORDER BY "recordedAt" DESC;

-- Storage bucket (returns 0 rows if step 3 was skipped)
SELECT id, name, public, file_size_limit
FROM storage.buckets
WHERE id = 'cat-photos';
