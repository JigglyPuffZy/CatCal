-- ============================================================
-- CatCal Query 06 — Logout Query
-- API: POST /api/auth/logout
-- No SQL needed — JWT is cleared on the phone. Server returns 204.

SELECT 'Logout is handled by the app (remove auth token). No database write.' AS note;
