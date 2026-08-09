-- ============================================================
-- CatCal Query 23 — Delete Feeding Schedule Query
-- API: DELETE /api/feeding-schedules/:id
-- Replace: SCHEDULE_ID, USER_ID

DELETE FROM "FeedingSchedule"
WHERE id = 'SCHEDULE_ID'
  AND "userId" = 'USER_ID';
