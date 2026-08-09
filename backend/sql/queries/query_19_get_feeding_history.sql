-- ============================================================
-- CatCal Query 19 — Get Feeding History Query
-- API: GET /api/cats/:id/feeding-logs
-- Replace: CAT_ID

SELECT *
FROM "FeedingLog"
WHERE "catId" = 'CAT_ID'
ORDER BY "fedAt" DESC;
