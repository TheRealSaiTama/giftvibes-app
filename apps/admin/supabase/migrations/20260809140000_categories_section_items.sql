-- ============================================================
-- Add editable items array to the home > categories section
-- (the "Our Products" carousel on the storefront).
--
-- Each item has:
--   name        - category label (matches STOREFRONT_CATEGORIES on the admin)
--   subtitle    - meta text under the label
--   image_url   - cover photo (drives the MediaPicker in the admin editor)
--   bgColor     - fallback tile color while image loads
--   alt         - alt text
--   href        - optional CTA link; falls back to getCategoryHref(name)
--   sort_order  - display order; lower = first
--
-- Idempotent: only updates the row if items is not already present,
-- so re-running after the admin seeds its own list is a no-op.
-- ============================================================

UPDATE public.page_sections
SET content = content - 'note' || jsonb_build_object(
  'items',
  '[
    {"name": "CORPORATE GIFT SETS", "subtitle": "120+ Packages Available", "image_url": "/Giftvibes categories/CORPORATE GIFTSETS.png", "bgColor": "#124559", "alt": "Professional corporate gift sets and custom diaries", "href": "", "sort_order": 1},
    {"name": "NEW YEAR DIARY", "subtitle": "80+ Styles Available", "image_url": "/Giftvibes categories/NEW YEAR DIARY.png", "bgColor": "#1a5d73", "alt": "Premium New Year themed diaries and planners", "href": "", "sort_order": 2},
    {"name": "LEATHER GIFT ITEMS", "subtitle": "Premium Collection", "image_url": "/Giftvibes categories/LEATHER GIFT ITEMS.png", "bgColor": "#2c3e50", "alt": "High-quality leather gift items and accessories", "href": "", "sort_order": 3},
    {"name": "LEATHER BAGS", "subtitle": "Executive Collection", "image_url": "/Giftvibes categories/LEATHER BAGS.png", "bgColor": "#E8923C", "alt": "Premium leather bags and accessories", "href": "", "sort_order": 4},
    {"name": "JUTE BAGS", "subtitle": "Eco-Friendly Options", "image_url": "/Giftvibes categories/JUTE BAGS.png", "bgColor": "#28966E", "alt": "Sustainable jute bags for promotional use", "href": "", "sort_order": 5},
    {"name": "BOTTLES GIFT SET", "subtitle": "Premium Combos", "image_url": "/Giftvibes categories/BOTTLE GIFT SETS.png", "bgColor": "#124559", "alt": "Gift sets with premium bottles and accessories", "href": "", "sort_order": 6},
    {"name": "POWER BANK DIARIES", "subtitle": "Tech-Integrated", "image_url": "/Giftvibes categories/POWERBANK DIARIES.png", "bgColor": "#1a5d73", "alt": "Diaries with built-in power bank functionality", "href": "", "sort_order": 7},
    {"name": "PEN STANDS", "subtitle": "Desktop Essentials", "image_url": "/Giftvibes categories/PEN STANDS.png", "bgColor": "#2c3e50", "alt": "Elegant pen stands and desk accessories", "href": "", "sort_order": 8},
    {"name": "PROMOTIONAL UMBRELLAS", "subtitle": "Branded Solutions", "image_url": "/Giftvibes categories/PROMOTIONAL UMBRELLAS.jpg", "bgColor": "#8b4513", "alt": "Custom promotional umbrellas for marketing", "href": "", "sort_order": 9},
    {"name": "CUSTOMISED DIARY & NOTE BOOKS", "subtitle": "150+ Designs Available", "image_url": "/Giftvibes categories/PROMOTIONAL DIARIES AND NOTEBOOKS.jpg", "bgColor": "#E8923C", "alt": "Fully customized diaries and notebooks", "href": "", "sort_order": 10},
    {"name": "CALENDARS", "subtitle": "Desktop & Wall Options", "image_url": "/Giftvibes categories/CALENDARS.png", "bgColor": "#28966E", "alt": "Custom table and wall calendars", "href": "", "sort_order": 11},
    {"name": "EXHIBITION VISITOR''S GIFT IDEAS", "subtitle": "Trade Show Specials", "image_url": "/Giftvibes categories/EXHIBITION GIVEAWAY IDEAS.png", "bgColor": "#124559", "alt": "Special gift ideas for exhibition visitors", "href": "", "sort_order": 12}
  ]'::jsonb
)
WHERE page_key = 'home'
  AND section_key = 'categories'
  AND NOT (content ? 'items');
