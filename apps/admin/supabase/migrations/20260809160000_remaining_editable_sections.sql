-- ============================================================
-- Wipe legacy item shapes on the home sections that are now
-- productId-driven, and add an empty `tabs` array to the tabbed
-- section so the admin's TabManager has somewhere to write.
--
-- Idempotent: every block only runs when the legacy / missing
-- shape is detected.
-- ============================================================

-- 1) home > popular: legacy full product snapshots to []
UPDATE public.page_sections
SET content = content || jsonb_build_object('items', '[]'::jsonb)
WHERE page_key = 'home'
  AND section_key = 'popular'
  AND content ? 'items'
  AND jsonb_typeof(content->'items') = 'array'
  AND jsonb_array_length(content->'items') > 0
  AND NOT ((content->'items'->0) ? 'productId');

-- 2) home > best_deals_tabbed: drop the obsolete `note` and seed empty tabs.
UPDATE public.page_sections
SET content = (content - 'note') || jsonb_build_object('tabs', '[]'::jsonb)
WHERE page_key = 'home'
  AND section_key = 'best_deals_tabbed'
  AND NOT (content ? 'tabs');
