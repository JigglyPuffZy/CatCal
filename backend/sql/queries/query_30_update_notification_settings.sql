-- ============================================================
-- CatCal Query 30 — Update Notification Settings Query
-- API: PATCH /api/notification-settings
-- Replace: USER_ID

UPDATE "NotificationSettings"
SET
  "remindersEnabled" = TRUE,
  "notifyBeforeMinutes" = 15,
  "pushEnabled" = TRUE
WHERE "userId" = 'USER_ID';
