-- ============================================================
-- CatCal Query 03 — Get User Profile
-- API: GET /api/profile  or  GET /api/auth/me
-- Replace: YOUR_EMAIL_HERE

SELECT
  u.id,
  u.email,
  u."createdAt",
  u."updatedAt",
  p."fullName",
  p."activeCatId"
FROM "User" u
LEFT JOIN "Profile" p ON p."userId" = u.id
WHERE u.email = 'YOUR_EMAIL_HERE';
