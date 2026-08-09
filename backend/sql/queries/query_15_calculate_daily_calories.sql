-- ============================================================
-- CatCal Query 15 — Calculate Daily Calories Query
-- API: GET /api/cats/:id/calculate-calories
-- Formula: RER = 70 * weight_kg^0.75, then * activity * health factors
-- Replace: CAT_ID

SELECT
  c.id AS "catId",
  c."weightKg",
  c."activityLevel",
  c."healthCondition",
  fb.label AS "foodBrandLabel",
  fb."kcalPer100g",
  ROUND(70 * POWER(c."weightKg", 0.75)) AS rer,
  ROUND(70 * POWER(c."weightKg", 0.75) *
    CASE c."activityLevel"
      WHEN 'sedentary' THEN 1.2
      WHEN 'light' THEN 1.4
      WHEN 'moderate' THEN 1.6
      WHEN 'active' THEN 1.8
      ELSE 1.4
    END *
    CASE c."healthCondition"
      WHEN 'healthy' THEN 1.0
      WHEN 'overweight' THEN 0.85
      WHEN 'underweight' THEN 1.15
      WHEN 'senior' THEN 1.1
      WHEN 'kitten' THEN 2.0
      ELSE 1.0
    END
  ) AS "dailyKcal"
FROM "Cat" c
JOIN "FoodBrand" fb ON fb.value = c."foodBrandValue"
WHERE c.id = 'CAT_ID';
