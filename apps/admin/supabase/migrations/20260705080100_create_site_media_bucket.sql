-- Create the site-media storage bucket if it does not already exist.
-- This is idempotent: the DO block catches the duplicate name error.
DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  VALUES (
    'site-media',
    'site-media',
    true,
    52428800,   -- 50 MB per file
    ARRAY['image/jpeg','image/png','image/webp','image/gif','image/svg+xml','image/avif']
  )
  ON CONFLICT (id) DO NOTHING;
END $$;
