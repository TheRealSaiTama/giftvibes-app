
CREATE POLICY "public read site-media" ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'site-media');
CREATE POLICY "owner upload site-media" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'site-media' AND public.is_owner());
CREATE POLICY "owner update site-media" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'site-media' AND public.is_owner()) WITH CHECK (bucket_id = 'site-media' AND public.is_owner());
CREATE POLICY "owner delete site-media" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'site-media' AND public.is_owner());
