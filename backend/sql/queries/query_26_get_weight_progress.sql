-- ============================================================
-- CatCal Query 26 — Get Weight Progress Query
-- API: GET /api/cats/:id/weight-progress
-- Replace: CAT_ID

WITH ranked AS (
  SELECT
    *,
    ROW_NUMBER() OVER (ORDER BY "recordedAt" DESC) AS rn
  FROM "WeightLog"
  WHERE "catId" = 'CAT_ID'
)
SELECT
  (SELECT "weightKg" FROM ranked WHERE rn = 1) AS "currentWeightKg",
  (SELECT "weightKg" FROM ranked WHERE rn = 2) AS "previousWeightKg",
  (SELECT "weightKg" FROM ranked WHERE rn = 1)
    - COALESCE((SELECT "weightKg" FROM ranked WHERE rn = 2), 0) AS "changeKg";
