-- DEPRECATED: merged into supabase_complete.sql — do not run separately.

-- ============================================================
-- CatCal â€” Supabase SQL Editor  (STEP 3 of 4 â€” optional)
-- Run AFTER supabase_02_constraints.sql
-- ============================================================
-- Prepares Supabase Storage for cat profile photos.
-- The app currently stores local file:// URIs; when you add
-- cloud upload, photoUri will become a public storage URL.
-- Safe to re-run.
-- ============================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'cat-photos',
  'cat-photos',
  TRUE,
  5242880,  -- 5 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Public read (profile photos shown in the app)
DROP POLICY IF EXISTS "cat_photos_public_read" ON storage.objects;
CREATE POLICY "cat_photos_public_read"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'cat-photos');

-- Authenticated upload (for future Supabase Auth or signed uploads)
DROP POLICY IF EXISTS "cat_photos_auth_insert" ON storage.objects;
CREATE POLICY "cat_photos_auth_insert"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'cat-photos');

DROP POLICY IF EXISTS "cat_photos_auth_update" ON storage.objects;
CREATE POLICY "cat_photos_auth_update"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'cat-photos');

DROP POLICY IF EXISTS "cat_photos_auth_delete" ON storage.objects;
CREATE POLICY "cat_photos_auth_delete"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'cat-photos');

-- Folder layout (convention only â€” enforced in app/backend later):
--   cat-photos/{userId}/{catId}.jpg
