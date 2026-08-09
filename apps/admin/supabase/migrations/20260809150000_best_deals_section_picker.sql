-- ============================================================
-- Convert home > best_deals section to productId-driven items.
-- The old content stored full product snapshots (name, image,
-- min_price, max_price, description). The new shape is a lean
-- [{ productId: "<uuid>" }, ...] list; the storefront looks each
-- one up in the products table.
--
-- Behavior: this migration only fires if the section's items
-- array is not already in the new shape. If items[0] has a
-- productId key, we leave it alone (idempotent). If items[0] is
-- the legacy object shape, we wipe items to [] so the admin's
-- picker takes over (the storefront falls back to the hardcoded
-- "Latest 2026 Diaries" set until the user picks).
--
-- Why wipe instead of auto-mapping: the legacy rows held Google
-- Drive URLs and ad-hoc fields that don't reliably match a row
-- in the products table. Silently mapping would risk duplicates
-- and wrong products. Cleaner to make the admin re-pick once.
-- ============================================================

UPDATE public.page_sections
SET content = content || jsonb_build_object('items', '[]'::jsonb)
WHERE page_key = 'home'
  AND section_key = 'best_deals'
  AND content ? 'items'
  AND jsonb_typeof(content->'items') = 'array'
  AND jsonb_array_length(content->'items') > 0
  AND NOT (
    (content->'items'->0) ? 'productId'
  );
