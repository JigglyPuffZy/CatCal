-- ============================================================
-- CatCal Query 01 — Login Query
-- API: POST /api/auth/login  { "email", "password" }
-- Password check happens in the Node app (bcrypt). This is the DB lookup step.
-- Replace: YOUR_EMAIL

SELECT
  u.id,
  u.email,
  u."passwordHash",
  p."fullName",
  p."activeCatId"
FROM "User" u
LEFT JOIN "Profile" p ON p."userId" = u.id
WHERE u.email = 'YOUR_EMAIL';
