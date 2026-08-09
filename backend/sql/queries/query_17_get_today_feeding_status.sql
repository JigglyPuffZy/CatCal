-- ============================================================
-- CatCal Query 17 — Get Today Feeding Status Query
-- API: GET /api/cats/:id/feeding-status/today
-- Replace: CAT_ID

SELECT
  COUNT(*) AS "mealsDone",
  (SELECT COUNT(*) FROM "FeedingSchedule" fs
   JOIN "Cat" c ON c."userId" = fs."userId"
   WHERE c.id = 'CAT_ID') AS "mealsTotal",
  COALESCE(SUM(fl.kcal), 0) AS "kcalFedToday"
FROM "FeedingLog" fl
WHERE fl."catId" = 'CAT_ID'
  AND fl."fedAt" >= DATE_TRUNC('day', NOW());
