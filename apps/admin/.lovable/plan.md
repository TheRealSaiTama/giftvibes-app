
## Goal

A standalone admin panel — living in **this** Lovable (TanStack Start) project — that lets one owner sign in and edit every text, image, product, diary, and global setting of the existing GiftVibes Next.js website. The Next.js site keeps rendering; it just fetches its content from this admin's public read API instead of hardcoded strings.

## Architecture

```text
 ┌──────────────────────────┐       ┌───────────────────────────┐       ┌──────────────────────┐
 │  GiftVibes admin (here)  │──────▶│   Lovable Cloud Postgres  │◀──────│  GiftVibes Next.js   │
 │  TanStack Start + Auth   │ write │  content / products /     │ read  │  public site         │
 │  /admin (owner only)     │       │  diaries / settings /     │       │  fetches JSON from   │
 │                          │       │  media                    │       │  /api/public/*       │
 └──────────────────────────┘       └───────────────────────────┘       └──────────────────────┘
```

- **Admin UI + auth + writes**: server functions with `requireSupabaseAuth`, gated under `_authenticated/`.
- **Public read API**: server routes at `/api/public/content/*` returning JSON, protected by narrow `TO anon` SELECT policies + safe-column projections. This is what the Next.js site calls.
- **Images**: Lovable Cloud Storage bucket `site-media`, served via public URLs; a Media Library page in the admin manages uploads and reuse.
- **Single owner**: no signup UI. The owner account is seeded once; login = email + password.

## Data model (Postgres, via migrations)

```text
site_settings          singleton row: brand name, logo, colors, whatsapp, contact, socials
page_seo               (page_key PK) title, description, og_image
page_sections          (page_key, section_key, order) generic editable section
   └─ content JSONB    typed per section_key: hero, categories, best_deals, brands, ...
nav_links              header + footer link groups
products               name, slug, description, min_price, max_price, category, tags[], image_url
diaries                name, description, min_price, max_price, category, color, size, pages, cover_type, image_url
media_assets           uploaded images: path, url, alt, width, height, uploaded_at
audit_log              who changed what, when (owner-only visibility)
user_roles             app_role enum ('owner'); has_role() SECURITY DEFINER helper
```

Every table gets `GRANT`s + RLS: `authenticated` (owner) read/write, `anon` SELECT only on the public-read columns of `page_sections`, `page_seo`, `nav_links`, `site_settings`, `products`, `diaries`, `media_assets`.

## Admin surface (screens)

- **`/auth`** — email + password sign-in. No signup.
- **`/` (admin dashboard)** — recent edits, quick links, "view site" button.
- **Pages**
  - `/pages/home` — 14 collapsible section editors (Hero, About, BestDiscounts, Categories, BestDeals, Brands, WeeklyPopular, CashBack, TabbedProducts, WhyChooseUs, CustomerSatisfaction, CashBackBottom, Services, CorporateShowcase, Footer) with typed fields per section. Drag to reorder.
  - `/pages/shop` — page copy, filter labels, empty-state text.
  - `/pages/product` — product-detail template copy (related-products heading, enquiry CTA, etc.).
  - `/pages/custom-design` — full editable copy for that page.
- **Catalog**
  - `/products` — dense table (thumbnail, name, category, price range, tags), search + filters, slide-over drawer for edit, image upload, bulk delete.
  - `/diaries` — same shape as Products with diary-specific fields.
- **Media library** — grid of uploaded images with alt text, replace, delete, copy-URL.
- **Global settings** — brand, logo, colors, WhatsApp number, contact info, socials.
- **SEO** — per-page title / description / og-image.
- **Nav & footer** — link groups.

Every editor screen has:
- Sticky top save bar (appears on dirty state) with Save + Discard.
- Right-side inspector / preview toggle.
- Autosave draft to localStorage as a safety net.

## Public read API (what Next.js consumes)

```text
GET /api/public/content/site-settings
GET /api/public/content/page/:pageKey        → sections[] + seo
GET /api/public/content/nav
GET /api/public/products?category=&limit=
GET /api/public/products/:slug
GET /api/public/diaries
```

All read-only, CORS-open, no PII. Backed by the publishable-key Supabase client (server-side) + `TO anon` SELECT policies. Response shape is versioned and stable so the Next.js swap is drop-in.

The plan does NOT modify the Next.js repo — it ships a short integration doc showing exactly which strings/props to replace with `fetch()` calls.

## Design direction

- **Palette (Warm Sand & Terracotta)**: `--background #faf8f5`, `--surface #f0ebe3`, `--foreground #2d2d2d`, `--primary #c4654a` (terracotta), `--accent #8b6f5e`, borders on `oklch` variants of the sand.
- **Type**: Space Grotesk for headings + numbers, DM Sans for body — loaded via `<link>` in `__root.tsx` head (not `@import`).
- **Feel**: boutique CMS. Roomy forms, generous whitespace, thin 1px borders in warm off-white, small terracotta accents on active nav / primary buttons / unsaved-changes pill. Data tables stay dense; editor forms breathe.
- **Motion**: 150–200ms drawer slides, subtle row hover, save-bar slide-up from bottom on dirty state.
- **Shell**: fixed left sidebar (240px, collapsible to 64px), top bar (breadcrumb + save state + view-site + avatar), main scroll area, optional right inspector.

## Build order

1. Enable Lovable Cloud → migrations for `user_roles` + `has_role()`, then all content tables with GRANTs and RLS.
2. Seed the owner account (asked once via secret) + default rows for every page/section/setting (mirrored from current hardcoded Next.js copy so nothing goes blank).
3. Design tokens in `src/styles.css`, font `<link>`s in `__root.tsx`, admin shell (sidebar + topbar + save bar).
4. Auth page, `_authenticated/` gate, sign-out.
5. Pages editor (Home first — all 14 sections), then Shop / Product / Custom Design.
6. Products + Diaries CRUD with slide-over drawer + image upload.
7. Media library, Global settings, SEO, Nav & footer.
8. Public `/api/public/content/*` server routes + a short `NEXTJS_INTEGRATION.md` showing the exact fetch calls to drop into each section component.

## Out of scope for this plan

- Actually editing the Next.js repo (delivered as an integration doc + live API).
- Multi-user roles, editor invites, publish workflow, revisions history beyond a simple audit log.
- Storefront checkout/payments.

Reply "looks good" (or with tweaks) and I'll start with step 1.
