-- ============================================================
-- CatCal Query 22 — Update Feeding Schedule Query
-- API: PATCH /api/feeding-schedules/:id  { "label", "time", "sortOrder" }
-- Replace: SCHEDULE_ID, USER_ID

UPDATE "FeedingSchedule"
SET label = 'Dinner', time = '19:30', "sortOrder" = 2
WHERE id = 'SCHEDULE_ID'
  AND "userId" = 'USER_ID';
