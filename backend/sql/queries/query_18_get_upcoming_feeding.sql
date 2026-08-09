-- ============================================================
-- CatCal Query 18 — Get Upcoming Feeding Query
-- API: GET /api/cats/:id/upcoming-feeding
-- Replace: CAT_ID, USER_ID

SELECT fs.*
FROM "FeedingSchedule" fs
WHERE fs."userId" = 'USER_ID'
ORDER BY fs."sortOrder" ASC;

SELECT COUNT(*) AS "mealsDoneToday"
FROM "FeedingLog"
WHERE "catId" = 'CAT_ID'
  AND "fedAt" >= DATE_TRUNC('day', NOW());
