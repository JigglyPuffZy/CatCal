-- ============================================================
-- CatCal Query 27 — Dashboard Summary Query
-- API: GET /api/dashboard/summary
-- Replace: USER_ID

SELECT
  p."activeCatId",
  (SELECT COUNT(*) FROM "Cat" WHERE "userId" = 'USER_ID') AS "catCount",
  c.name AS "activeCatName",
  np."dailyKcal",
  np."gramsPerDay",
  np."kcalPerMeal"
FROM "Profile" p
LEFT JOIN "Cat" c ON c.id = p."activeCatId"
LEFT JOIN "CatNutritionPlan" np ON np."catId" = c.id AND np."isCurrent" = TRUE
WHERE p."userId" = 'USER_ID';
