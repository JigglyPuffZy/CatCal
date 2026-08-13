-- CatCal — Supabase SQL Editor reference
-- Paste sections into Supabase → SQL Editor → Run

-- ── 1) Fix your display name ─────────────────────────────────────────────
-- Replace email and fullName with yours

SELECT u.email, p."fullName"
FROM "User" u
LEFT JOIN "Profile" p ON p."userId" = u.id
WHERE u.email = 'your-email@example.com';

UPDATE "Profile" p
SET "fullName" = 'Your Full Name', "updatedAt" = NOW()
FROM "User" u
WHERE p."userId" = u.id
  AND u.email = 'your-email@example.com';

-- ── 2) List all users and cat counts ─────────────────────────────────────

SELECT
  u.email,
  p."fullName",
  u."createdAt",
  (SELECT COUNT(*) FROM "Cat" c WHERE c."userId" = u.id) AS cat_count
FROM "User" u
LEFT JOIN "Profile" p ON p."userId" = u.id
ORDER BY u."createdAt" DESC;

-- ── 3) List cats for a user (by email) ───────────────────────────────────

SELECT
  c.id,
  c.name,
  c."weightKg",
  c."qrCode",
  c."createdAt"
FROM "Cat" c
JOIN "User" u ON u.id = c."userId"
WHERE u.email = 'your-email@example.com'
ORDER BY c."createdAt" DESC;

-- ── 4) Delete a cat manually (also removes logs via CASCADE) ─────────────
-- Replace CAT_ID with the cat id from query above

-- DELETE FROM "Cat" WHERE id = 'CAT_ID';

-- ── 5) View feeding logs for a cat ───────────────────────────────────────

SELECT fl.*
FROM "FeedingLog" fl
JOIN "Cat" c ON c.id = fl."catId"
WHERE c.name = 'Mochi'
ORDER BY fl."fedAt" DESC
LIMIT 20;

-- ── 6) Reset database (DANGER — deletes all data) ────────────────────────
-- Only use on a test project. See supabase_99_reset_all.sql

-- ── 7) Full schema setup (run once on new project) ─────────────────────
-- See supabase_complete.sql
