-- ============================================================
-- CatCal Query 28 — Recent Activity Query
-- API: GET /api/dashboard/recent-activity?limit=20
-- Replace: USER_ID
-- Note: columns must match in UNION — fl.* and wl.* have different shapes.

SELECT type, at, id, "catId", detail, grams, kcal
FROM (
  SELECT
    'feeding'::text AS type,
    fl."fedAt" AS at,
    fl.id,
    fl."catId",
    fl."mealLabel" AS detail,
    fl.grams,
    fl.kcal
  FROM "FeedingLog" fl
  JOIN "Cat" c ON c.id = fl."catId"
  WHERE c."userId" = 'USER_ID'

  UNION ALL

  SELECT
    'weight'::text,
    wl."recordedAt",
    wl.id,
    wl."catId",
    wl.source,
    NULL::integer,
    NULL::integer
  FROM "WeightLog" wl
  JOIN "Cat" c ON c.id = wl."catId"
  WHERE c."userId" = 'USER_ID'
) activity
ORDER BY at DESC
LIMIT 20;
