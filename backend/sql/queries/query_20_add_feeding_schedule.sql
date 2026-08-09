-- ============================================================
-- CatCal Query 20 — Add Feeding Schedule Query
-- API: POST /api/feeding-schedules  { "label", "time", "sortOrder" }
-- Replace: SCHEDULE_ID, USER_ID

INSERT INTO "FeedingSchedule" (id, "userId", label, time, "sortOrder")
VALUES ('SCHEDULE_ID', 'USER_ID', 'Evening meal', '20:00', 2);
