-- ============================================================
-- CatCal Query 31 — Get Food Brands Query
-- API: GET /api/food-brands

SELECT value, label, "kcalPer100g"
FROM "FoodBrand"
ORDER BY label ASC;
