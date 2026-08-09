-- ============================================================
-- Product + diary form enhancements: SEO, secondary gallery, and
-- per-product feature flags.
--
-- Backwards compatible: every new column is nullable / has a
-- default, so existing rows keep working without code changes.
--
--   seo_title        text       nullable. Used by storefront generateMetadata.
--   seo_description  text       nullable.
--   features         jsonb      default '{}'. Per-feature { show, value }.
--                                Only enabled + non-empty values render
--                                on the product page (M8).
--
-- The `gallery` jsonb column already exists on both tables
-- (Prisma models it as @default("[]")). This migration doesn't
-- touch it; secondary images just store URL strings into it.
-- ============================================================

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS seo_title       text,
  ADD COLUMN IF NOT EXISTS seo_description text;

-- features column was never migrated; add it now.
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS features jsonb NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE public.diaries
  ADD COLUMN IF NOT EXISTS seo_title       text,
  ADD COLUMN IF NOT EXISTS seo_description text;

ALTER TABLE public.diaries
  ADD COLUMN IF NOT EXISTS features jsonb NOT NULL DEFAULT '{}'::jsonb;
