ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS site_url TEXT,
  ADD COLUMN IF NOT EXISTS preview_url TEXT;