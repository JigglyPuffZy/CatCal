-- ============================================================
-- CatCal Query 21 — Get Feeding Schedule Query
-- API: GET /api/feeding-schedules
-- Replace: USER_ID

SELECT *
FROM "FeedingSchedule"
WHERE "userId" = 'USER_ID'
ORDER BY "sortOrder" ASC;
