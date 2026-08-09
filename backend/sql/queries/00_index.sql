-- ============================================================
-- CatCal — All 31 queries (one file each)
-- Folder: backend/sql/queries/
--
-- PREREQUISITE: Run schema first
--   supabase.sql → 02 → 03 → 08
--
-- Replace USER_ID, CAT_ID, YOUR_EMAIL, etc. before testing.
-- ============================================================

-- ── AUTH / PROFILE (1–6) ─────────────────────────────────────
-- 01  query_01_login.sql              [API+partial SQL] bcrypt in app, SQL = email lookup
-- 02  query_02_create_account.sql     [SQL needed]      User + Profile + defaults
-- 03  query_03_get_user_profile.sql   [SQL needed]      SELECT User JOIN Profile
-- 04  query_04_update_profile.sql     [SQL needed]      UPDATE User + Profile
-- 05  query_05_update_settings.sql    [SQL needed]      UPDATE Profile.activeCatId
-- 06  query_06_logout.sql             [NOT SQL]         JWT cleared on phone only

-- ── CATS (7–12) ────────────────────────────────────────────
-- 07  query_07_add_cat.sql            [SQL needed]      INSERT Cat + WeightLog
-- 08  query_08_get_all_cats.sql       [SQL needed]      SELECT by userId
-- 09  query_09_get_cat_by_id.sql      [SQL needed]      SELECT one cat
-- 10  query_10_get_cat_by_qr.sql      [SQL needed]      SELECT by id (from QR payload)
-- 11  query_11_update_cat.sql         [SQL needed]      UPDATE Cat + weight log
-- 12  query_12_delete_cat.sql         [SQL needed]      DELETE Cat (cascade logs)

-- ── NUTRITION (13–15) ────────────────────────────────────────
-- 13  query_13_save_calorie_plan.sql  [SQL needed]      INSERT CatNutritionPlan
-- 14  query_14_get_current_calorie_plan.sql [SQL needed] SELECT isCurrent = TRUE
-- 15  query_15_calculate_daily_calories.sql  [API mainly] Formula runs in Node, SQL is reference

-- ── FEEDING (16–19) ──────────────────────────────────────────
-- 16  query_16_mark_cat_as_fed.sql    [SQL needed]      INSERT FeedingLog
-- 17  query_17_get_today_feeding_status.sql [API mainly] Status computed in Node
-- 18  query_18_get_upcoming_feeding.sql     [API mainly] Overlaps query 17
-- 19  query_19_get_feeding_history.sql      [SQL needed] SELECT FeedingLog

-- ── FEEDING SCHEDULE (20–23) ─────────────────────────────────
-- 20  query_20_add_feeding_schedule.sql     [SQL needed] INSERT FeedingSchedule
-- 21  query_21_get_feeding_schedule.sql     [SQL needed] SELECT by userId
-- 22  query_22_update_feeding_schedule.sql  [SQL needed] UPDATE one row
-- 23  query_23_delete_feeding_schedule.sql  [SQL needed] DELETE one row

-- ── WEIGHT (24–26) ───────────────────────────────────────────
-- 24  query_24_add_weight_log.sql    [SQL needed]      INSERT WeightLog
-- 25  query_25_get_weight_history.sql [SQL needed]     SELECT WeightLog
-- 26  query_26_get_weight_progress.sql [API mainly]    Trend computed in Node

-- ── DASHBOARD (27–28) ────────────────────────────────────────
-- 27  query_27_dashboard_summary.sql [API mainly]     Aggregation in Node
-- 28  query_28_recent_activity.sql    [SQL reference]   UNION feeding + weight logs

-- ── NOTIFICATIONS + BRANDS (29–31) ───────────────────────────
-- 29  query_29_get_notification_settings.sql   [SQL needed] SELECT
-- 30  query_30_update_notification_settings.sql [SQL needed] UPDATE
-- 31  query_31_get_food_brands.sql              [SQL needed] SELECT FoodBrand

-- ── MOBILE APP STATUS (as of audit) ──────────────────────────
-- Directly called: 1, 2, 6, 7, 10, 11, 16, 30, 31
-- Via api.sync() only: 8, 14, 19, 21, 25, 29
-- Backend exists, no UI yet: 4, 12, 15, 17, 18, 20–23, 26, 27, 28
-- Server side-effect only: 13 (auto on cat create/update), 24 (auto on cat CRUD)
