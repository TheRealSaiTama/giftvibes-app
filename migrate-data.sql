INSERT INTO public.products (slug, name, description, min_price, max_price, category, tags, image_url, gallery, featured, enabled)
SELECT 
  trim(both '-' from regexp_replace(lower(name), '[^a-z0-9]+', '-', 'g')) as slug,
  name,
  description,
  "minPrice",
  "maxPrice",
  category,
  COALESCE(
    (SELECT array_agg(trim(t)) FROM unnest(string_to_array(tags, ',')) as t WHERE t != ''), 
    '{}'::text[]
  ) as tags,
  "imageUrl",
  '[]'::jsonb,
  false,
  true
FROM public."Product"
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.diaries (slug, name, description, min_price, max_price, category, tags, color, size, pages, cover_type, image_url, gallery, featured, enabled)
SELECT 
  trim(both '-' from regexp_replace(lower(name), '[^a-z0-9]+', '-', 'g')) as slug,
  name,
  description,
  "minPrice",
  "maxPrice",
  category,
  COALESCE(
    (SELECT array_agg(trim(t)) FROM unnest(string_to_array(tags, ',')) as t WHERE t != ''), 
    '{}'::text[]
  ) as tags,
  color,
  size,
  pages,
  "coverType",
  "imageUrl",
  '[]'::jsonb,
  false,
  true
FROM public."Diary"
ON CONFLICT (slug) DO NOTHING;
