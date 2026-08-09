-- ============================================================
-- CatCal Query 05 — Update Settings Query
-- API: PATCH /api/settings  { "activeCatId" }
-- Replace: USER_ID, CAT_ID (must belong to same user)

UPDATE "Profile"
SET "activeCatId" = 'CAT_ID', "updatedAt" = NOW()
WHERE "userId" = 'USER_ID';
