-- ============================================================
-- CatCal Query 13 — Save Calorie Plan Query
-- API: POST /api/cats/:id/plan
-- Replace: CAT_ID, PLAN_ID, and calorie values (normally computed by backend)

UPDATE "CatNutritionPlan"
SET "isCurrent" = FALSE
WHERE "catId" = 'CAT_ID'
  AND "isCurrent" = TRUE;

INSERT INTO "CatNutritionPlan" (
  id, "catId", "dailyKcal", "kcalPerMeal", "gramsPerDay", "gramsPerMeal",
  "foodBrandLabel", rer, "activityFactor", "healthFactor", "kcalPer100g", "isCurrent"
)
VALUES (
  'PLAN_ID',
  'CAT_ID',
  210,
  105,
  60,
  30,
  'Royal Canin Indoor',
  180,
  1.4,
  1.0,
  353,
  TRUE
);
