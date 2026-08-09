-- ============================================================
-- CatCal Query 14 — Get Current Calorie Plan Query
-- API: GET /api/cats/:id/plan
-- Replace: CAT_ID

SELECT *
FROM "CatNutritionPlan"
WHERE "catId" = 'CAT_ID'
  AND "isCurrent" = TRUE
ORDER BY "computedAt" DESC
LIMIT 1;
