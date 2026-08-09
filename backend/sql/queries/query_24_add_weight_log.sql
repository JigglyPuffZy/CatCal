-- ============================================================
-- CatCal Query 24 — Add Weight Log Query
-- API: POST /api/cats/:id/weight-logs  { "weightKg", "source" }
-- Replace: CAT_ID, LOG_ID

INSERT INTO "WeightLog" (id, "catId", "weightKg", source)
VALUES ('LOG_ID', 'CAT_ID', 4.15, 'manual');

UPDATE "Cat"
SET "weightKg" = 4.15, "updatedAt" = NOW()
WHERE id = 'CAT_ID';
