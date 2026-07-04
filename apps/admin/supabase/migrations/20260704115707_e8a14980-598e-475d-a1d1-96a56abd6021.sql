
-- ============ ROLES ============
CREATE TYPE public.app_role AS ENUM ('owner');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user can read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) $$;

CREATE OR REPLACE FUNCTION public.is_owner()
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT public.has_role(auth.uid(), 'owner'::public.app_role) $$;

-- ============ updated_at trigger ============
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public
AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

-- ============ SITE SETTINGS ============
CREATE TABLE public.site_settings (
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  brand_name TEXT NOT NULL DEFAULT 'GiftVibe',
  tagline TEXT,
  logo_url TEXT,
  favicon_url TEXT,
  primary_color TEXT DEFAULT '#c4654a',
  whatsapp_number TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  socials JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_settings TO anon, authenticated;
GRANT INSERT, UPDATE ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read settings" ON public.site_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "owner write settings" ON public.site_settings FOR ALL TO authenticated USING (public.is_owner()) WITH CHECK (public.is_owner());
CREATE TRIGGER set_site_settings_updated BEFORE UPDATE ON public.site_settings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ PAGE SEO ============
CREATE TABLE public.page_seo (
  page_key TEXT PRIMARY KEY,
  title TEXT,
  description TEXT,
  og_image_url TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.page_seo TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.page_seo TO authenticated;
GRANT ALL ON public.page_seo TO service_role;
ALTER TABLE public.page_seo ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read seo" ON public.page_seo FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "owner write seo" ON public.page_seo FOR ALL TO authenticated USING (public.is_owner()) WITH CHECK (public.is_owner());
CREATE TRIGGER set_page_seo_updated BEFORE UPDATE ON public.page_seo FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ PAGE SECTIONS ============
CREATE TABLE public.page_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_key TEXT NOT NULL,
  section_key TEXT NOT NULL,
  title TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  enabled BOOLEAN NOT NULL DEFAULT true,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (page_key, section_key)
);
CREATE INDEX page_sections_page_order_idx ON public.page_sections (page_key, sort_order);
GRANT SELECT ON public.page_sections TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.page_sections TO authenticated;
GRANT ALL ON public.page_sections TO service_role;
ALTER TABLE public.page_sections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read sections" ON public.page_sections FOR SELECT TO anon, authenticated USING (enabled = true);
CREATE POLICY "owner read all sections" ON public.page_sections FOR SELECT TO authenticated USING (public.is_owner());
CREATE POLICY "owner write sections" ON public.page_sections FOR INSERT TO authenticated WITH CHECK (public.is_owner());
CREATE POLICY "owner update sections" ON public.page_sections FOR UPDATE TO authenticated USING (public.is_owner()) WITH CHECK (public.is_owner());
CREATE POLICY "owner delete sections" ON public.page_sections FOR DELETE TO authenticated USING (public.is_owner());
CREATE TRIGGER set_page_sections_updated BEFORE UPDATE ON public.page_sections FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ NAV LINKS ============
CREATE TABLE public.nav_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_key TEXT NOT NULL,
  label TEXT NOT NULL,
  href TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX nav_links_group_order_idx ON public.nav_links (group_key, sort_order);
GRANT SELECT ON public.nav_links TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.nav_links TO authenticated;
GRANT ALL ON public.nav_links TO service_role;
ALTER TABLE public.nav_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read nav" ON public.nav_links FOR SELECT TO anon, authenticated USING (enabled = true);
CREATE POLICY "owner read all nav" ON public.nav_links FOR SELECT TO authenticated USING (public.is_owner());
CREATE POLICY "owner write nav" ON public.nav_links FOR ALL TO authenticated USING (public.is_owner()) WITH CHECK (public.is_owner());
CREATE TRIGGER set_nav_links_updated BEFORE UPDATE ON public.nav_links FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ PRODUCTS ============
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  min_price INT,
  max_price INT,
  category TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  image_url TEXT,
  gallery JSONB NOT NULL DEFAULT '[]'::jsonb,
  featured BOOLEAN NOT NULL DEFAULT false,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX products_category_idx ON public.products (category);
CREATE INDEX products_featured_idx ON public.products (featured) WHERE featured = true;
GRANT SELECT ON public.products TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read products" ON public.products FOR SELECT TO anon, authenticated USING (enabled = true);
CREATE POLICY "owner read all products" ON public.products FOR SELECT TO authenticated USING (public.is_owner());
CREATE POLICY "owner write products" ON public.products FOR ALL TO authenticated USING (public.is_owner()) WITH CHECK (public.is_owner());
CREATE TRIGGER set_products_updated BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ DIARIES ============
CREATE TABLE public.diaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  min_price INT,
  max_price INT,
  category TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  color TEXT,
  size TEXT,
  pages INT,
  cover_type TEXT,
  image_url TEXT,
  gallery JSONB NOT NULL DEFAULT '[]'::jsonb,
  featured BOOLEAN NOT NULL DEFAULT false,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX diaries_category_idx ON public.diaries (category);
GRANT SELECT ON public.diaries TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.diaries TO authenticated;
GRANT ALL ON public.diaries TO service_role;
ALTER TABLE public.diaries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read diaries" ON public.diaries FOR SELECT TO anon, authenticated USING (enabled = true);
CREATE POLICY "owner read all diaries" ON public.diaries FOR SELECT TO authenticated USING (public.is_owner());
CREATE POLICY "owner write diaries" ON public.diaries FOR ALL TO authenticated USING (public.is_owner()) WITH CHECK (public.is_owner());
CREATE TRIGGER set_diaries_updated BEFORE UPDATE ON public.diaries FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ MEDIA ============
CREATE TABLE public.media_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  path TEXT NOT NULL UNIQUE,
  url TEXT NOT NULL,
  alt TEXT,
  width INT,
  height INT,
  size_bytes INT,
  mime_type TEXT,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.media_assets TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.media_assets TO authenticated;
GRANT ALL ON public.media_assets TO service_role;
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read media" ON public.media_assets FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "owner write media" ON public.media_assets FOR ALL TO authenticated USING (public.is_owner()) WITH CHECK (public.is_owner());

-- ============ AUDIT ============
CREATE TABLE public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  entity TEXT NOT NULL,
  entity_id TEXT,
  action TEXT NOT NULL,
  diff JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX audit_log_created_idx ON public.audit_log (created_at DESC);
GRANT SELECT, INSERT ON public.audit_log TO authenticated;
GRANT ALL ON public.audit_log TO service_role;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner read audit" ON public.audit_log FOR SELECT TO authenticated USING (public.is_owner());
CREATE POLICY "owner insert audit" ON public.audit_log FOR INSERT TO authenticated WITH CHECK (public.is_owner());
