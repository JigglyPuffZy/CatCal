-- Fix registered name (replace with YOUR real name from signup)
-- Run in Supabase SQL Editor

-- 1) See current name
SELECT u.email, p."fullName" AS "storedName"
FROM "User" u
LEFT JOIN "Profile" p ON p."userId" = u.id
WHERE u.email ILIKE '%ralphmatthewpunzalan23%';

-- 2) Set your registered display name
UPDATE "Profile" p
SET "fullName" = 'Ralph Matthew', "updatedAt" = NOW()
FROM "User" u
WHERE p."userId" = u.id
  AND u.email ILIKE '%ralphmatthewpunzalan23%';

-- 3) Verify
SELECT u.email, p."fullName"
FROM "User" u
LEFT JOIN "Profile" p ON p."userId" = u.id
WHERE u.email ILIKE '%ralphmatthewpunzalan23%';
