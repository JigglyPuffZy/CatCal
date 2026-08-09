-- ============================================================
-- CatCal Query 07 — Add Cat Query
-- API: POST /api/cats
--
-- ERROR FIX: "Cat_userId_fkey" means USER_ID was not replaced.
-- Do NOT paste the text USER_ID — use a real id from "User".
--
-- OPTION A — find your user id first (run alone):
--   SELECT id, email FROM "User" ORDER BY "createdAt" DESC;
--
-- OPTION B — run the block below (change OWNER_EMAIL + cat fields)
-- ============================================================

DO $$
DECLARE
  v_user_id   TEXT;
  v_cat_id    TEXT := 'cat_mochi_002';          -- change if this id already exists
  v_owner_email TEXT := 'test@catcal.dev';    -- <-- YOUR login email here
BEGIN
  SELECT id INTO v_user_id
  FROM "User"
  WHERE email = v_owner_email
  LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION
      'No user with email %. Create an account first (query_02 or app register), then re-run.',
      v_owner_email;
  END IF;

  IF EXISTS (SELECT 1 FROM "Cat" WHERE id = v_cat_id) THEN
    RAISE EXCEPTION 'Cat id % already exists. Change v_cat_id in this script.', v_cat_id;
  END IF;

  INSERT INTO "Cat" (
    id, "userId", name, "photoUri", "birthDate", "weightKg",
    sex, "activityLevel", "healthCondition", "foodBrandValue", "qrCode"
  )
  VALUES (
    v_cat_id,
    v_user_id,
    'Mochi',
    NULL,
    '2022-06-15T00:00:00Z',
    4.1,
    'female',
    'light',
    'healthy',
    'royal-canin-indoor',
    'catcal://cat/' || v_cat_id
  );

  INSERT INTO "WeightLog" (id, "catId", "weightKg", source)
  VALUES ('weight_' || v_cat_id || '_reg', v_cat_id, 4.1, 'registration');

  INSERT INTO "Profile" ("userId", "fullName", "activeCatId", "updatedAt")
  VALUES (v_user_id, 'CatCal User', v_cat_id, NOW())
  ON CONFLICT ("userId") DO UPDATE
  SET "activeCatId" = COALESCE("Profile"."activeCatId", EXCLUDED."activeCatId"),
      "updatedAt" = NOW();

  RAISE NOTICE 'Cat added: % for user %', v_cat_id, v_user_id;
END $$;

-- Optional: run query_13_save_calorie_plan.sql next for nutrition plan row.
