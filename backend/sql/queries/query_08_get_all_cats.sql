-- ============================================================
-- CatCal Query 08 — Get All Cats Query
-- API: GET /api/cats
-- Replace: USER_ID

SELECT *
FROM "Cat"
WHERE "userId" = 'USER_ID'
ORDER BY "createdAt" ASC;
