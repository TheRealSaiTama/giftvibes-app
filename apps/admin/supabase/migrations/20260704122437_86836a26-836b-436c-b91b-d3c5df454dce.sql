-- 1) media_assets: remove public read; keep owner-only read/write
DROP POLICY IF EXISTS "public read media" ON public.media_assets;
REVOKE SELECT ON public.media_assets FROM anon;

CREATE POLICY "owner read media"
  ON public.media_assets
  FOR SELECT
  TO authenticated
  USING (public.is_owner());

-- 2) site_settings: restrict anon column access so contact info is not exposed
REVOKE SELECT ON public.site_settings FROM anon;
GRANT SELECT
  (id, brand_name, tagline, logo_url, favicon_url, primary_color,
   site_url, socials, updated_at)
  ON public.site_settings TO anon;

-- 3) storage.objects for site-media: remove anon read
DROP POLICY IF EXISTS "public read site-media" ON storage.objects;

CREATE POLICY "owner read site-media"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'site-media' AND public.is_owner());