-- ============================================================
-- CatCal Query 04 — Update Profile (registered name + email)
-- API: PATCH /api/profile  { "fullName", "email", "password", "currentPassword" }
-- Replace: YOUR_EMAIL_HERE, NEW_FULL_NAME, NEW_EMAIL

UPDATE "Profile" p
SET "fullName" = 'NEW_FULL_NAME', "updatedAt" = NOW()
FROM "User" u
WHERE p."userId" = u.id
  AND u.email = 'YOUR_EMAIL_HERE';

UPDATE "User"
SET email = 'NEW_EMAIL', "updatedAt" = NOW()
WHERE email = 'YOUR_EMAIL_HERE';

-- Verify after update:
SELECT u.id, u.email, p."fullName", p."activeCatId", u."createdAt"
FROM "User" u
LEFT JOIN "Profile" p ON p."userId" = u.id
WHERE u.email = 'NEW_EMAIL';
