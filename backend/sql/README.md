# CatCal — Supabase SQL files

| File | When to use |
|------|-------------|
| `supabase_complete.sql` | **Run once** on a new Supabase project (full schema + seed) |
| `profile_supabase_editor.sql` | Fix your account display name |
| `delete_cat_supabase_editor.sql` | Delete a cat profile from the database |
| `supabase_editor_reference.sql` | Extra admin queries (list users, logs, etc.) |
| `supabase_99_reset_all.sql` | **Danger:** wipe all data on a test project only |

Run scripts in **Supabase → SQL Editor**.

The app uses **Prisma** for all API queries — no per-query `.sql` files are needed at runtime.
