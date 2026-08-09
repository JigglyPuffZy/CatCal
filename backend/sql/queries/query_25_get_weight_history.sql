-- ============================================================
-- CatCal Query 25 — Get Weight History Query
-- API: GET /api/cats/:id/weight-logs
-- Replace: CAT_ID

SELECT *
FROM "WeightLog"
WHERE "catId" = 'CAT_ID'
ORDER BY "recordedAt" DESC;
