-- ============================================================
-- CatCal Query 16 — Mark Cat As Fed Query
-- API: POST /api/cats/:id/feeding-logs  { "mealLabel"?: string }
-- Replace: CAT_ID, LOG_ID

INSERT INTO "FeedingLog" (id, "catId", "mealLabel", grams, kcal)
VALUES ('LOG_ID', 'CAT_ID', 'Morning meal', 43, 151);
