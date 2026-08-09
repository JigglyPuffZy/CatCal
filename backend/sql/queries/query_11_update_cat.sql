-- ============================================================
-- CatCal Query 11 — Update Cat Query
-- API: PATCH /api/cats/:id
-- Replace: CAT_ID, USER_ID

UPDATE "Cat"
SET
  name = 'Mochi',
  "weightKg" = 4.2,
  "activityLevel" = 'moderate',
  "healthCondition" = 'healthy',
  "foodBrandValue" = 'royal-canin-indoor',
  "updatedAt" = NOW()
WHERE id = 'CAT_ID'
  AND "userId" = 'USER_ID';

INSERT INTO "WeightLog" (id, "catId", "weightKg", source)
VALUES ('weight_CAT_ID_upd', 'CAT_ID', 4.2, 'profile_update');
