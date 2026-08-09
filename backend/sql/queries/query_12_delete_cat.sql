-- ============================================================
-- CatCal Query 12 — Delete Cat Query
-- API: DELETE /api/cats/:id
-- Replace: CAT_ID, USER_ID

DELETE FROM "Cat"
WHERE id = 'CAT_ID'
  AND "userId" = 'USER_ID';

UPDATE "Profile"
SET "activeCatId" = NULL, "updatedAt" = NOW()
WHERE "userId" = 'USER_ID'
  AND "activeCatId" = 'CAT_ID';
