-- ============================================================
-- CatCal Query 02 — Create Account Query
-- API: POST /api/auth/register  { "fullName", "email", "password" }
-- Replace: USER_ID, FULL_NAME, EMAIL, PASSWORD_HASH (bcrypt from backend)

INSERT INTO "User" (id, email, "passwordHash")
VALUES ('USER_ID', 'EMAIL', 'PASSWORD_HASH');

INSERT INTO "Profile" ("userId", "fullName", "activeCatId", "updatedAt")
VALUES ('USER_ID', 'FULL_NAME', NULL, NOW());

INSERT INTO "NotificationSettings" ("userId")
VALUES ('USER_ID')
ON CONFLICT ("userId") DO NOTHING;

INSERT INTO "FeedingSchedule" (id, "userId", label, time, "sortOrder")
VALUES
  ('sched_morning_USER_ID', 'USER_ID', 'Morning meal', '08:00', 0),
  ('sched_evening_USER_ID', 'USER_ID', 'Evening meal', '18:30', 1)
ON CONFLICT (id) DO NOTHING;
