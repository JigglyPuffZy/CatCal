-- Delete a cat profile (Supabase SQL Editor)
-- Run in Supabase → SQL Editor
--
-- This removes the cat AND related data (feeding logs, weight logs, nutrition plans)
-- because those tables use ON DELETE CASCADE.

-- 1) List your cats (copy the id of the cat you want to delete)
SELECT
  c.id,
  c.name,
  c."weightKg",
  c."qrCode",
  c."createdAt"
FROM "Cat" c
JOIN "User" u ON u.id = c."userId"
WHERE u.email ILIKE '%ralphmatthewpunzalan23%'
ORDER BY c."createdAt" DESC;

-- 2) Delete by cat name (change 'Mochi' to your cat's name)
-- DELETE FROM "Cat" c
-- USING "User" u
-- WHERE c."userId" = u.id
--   AND u.email ILIKE '%ralphmatthewpunzalan23%'
--   AND c.name = 'Mochi';

-- 3) OR delete by cat id (paste id from step 1 — safer)
-- DELETE FROM "Cat"
-- WHERE id = 'PASTE_CAT_ID_HERE';

-- 4) If deleted cat was your active cat, clear it on Profile
-- UPDATE "Profile" p
-- SET "activeCatId" = NULL, "updatedAt" = NOW()
-- FROM "User" u
-- WHERE p."userId" = u.id
--   AND u.email ILIKE '%ralphmatthewpunzalan23%'
--   AND p."activeCatId" = 'PASTE_CAT_ID_HERE';

-- 5) Verify — should show remaining cats only
SELECT c.id, c.name
FROM "Cat" c
JOIN "User" u ON u.id = c."userId"
WHERE u.email ILIKE '%ralphmatthewpunzalan23%';
