-- ============================================================
-- CatCal Query 09 — Get Cat By ID Query
-- API: GET /api/cats/:id
-- Replace: CAT_ID, USER_ID

SELECT *
FROM "Cat"
WHERE id = 'CAT_ID'
  AND "userId" = 'USER_ID';
