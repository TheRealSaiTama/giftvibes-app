# GiftVibes Ultimate — Architecture

## Monorepo Design

GiftVibes Ultimate uses a **bun workspace monorepo** with three packages:
- `apps/admin` — TanStack Start admin CMS (Cloudflare Workers)
- `apps/storefront` — Next.js 15 storefront (Vercel)  
- `packages/shared-types` — Shared TypeScript type definitions

**Why monorepo?** Both apps share the same Supabase backend, share type definitions, and are developed together. A monorepo allows atomic commits across both apps.

## Data Flow

### Write Path (Content Management)
```
Admin User → Admin Panel (browser)
  → TanStack Server Function (RPC)
  → requireSupabaseAuth middleware (validates JWT)
  → Supabase REST API (with user's JWT)
  → Row-Level Security (is_owner() check)
  → PostgreSQL
```

### Read Path (Public API Access)
```
Customer → Storefront (Next.js SSR/ISR)
  → fetch() → Admin Public API (TanStack Start)
  → getPublicSupabase() (publishable key, no auth)
  → Supabase REST API (no RLS on public read)
  → PostgreSQL
```

**Note:** The storefront can also read directly from Supabase via Prisma for performance-critical pages.

## Auth Flow

1. **Admin Login**: User signs up/signs in via Supabase Auth
2. **JWT Storage**: Browser stores JWT in localStorage
3. **First User**: Automatically becomes `owner` via `bootstrap_first_owner()` trigger
4. **Server Validation**: `requireSupabaseAuth` middleware validates JWT each request
5. **RLS**: Database policies check `is_owner()` function before allowing writes

## Component Architecture

### Admin Panel Pattern
- **AdminShell**: Sidebar navigation + breadcrumbs + SaveBar
- **Route pages**: Each route is a TanStack Start page component
- **Server Functions**: Admin CRUD operations as TanStack RPC functions
- **45 shadcn/ui components**: Button, Card, Dialog, Sheet, Table, Form, etc.

### Storefront Pattern  
- **RootLayout**: Fetches nav + site settings from admin API
- **Page components**: Next.js server components fetching from admin API
- **Section components**: 15 reusable home page sections
- **Product components**: ProductGallery, ProductInfo, RelatedProducts

## Routing Architecture

### Admin Routes (TanStack Router)
- `/auth` — Login/signup (SSR disabled)
- `/dashboard` — Admin stats + quick links
- `/pages/$page` — Section editor with live preview iframe
- `/products` — Product CRUD table
- `/diaries` — Diary CRUD table
- `/media` — Media library (Supabase Storage)
- `/seo` — Global SEO defaults
- `/settings` — Site settings
- `/nav` — Navigation links editor
- `/integration` — Integration settings

### Public API Routes
- `GET /api/public/products` — Product listing
- `GET /api/public/products/$slug` — Single product
- `GET /api/public/diaries` — Diary listing
- `GET /api/public/content/page/$pageKey` — Page sections + SEO
- `GET /api/public/content/nav` — Navigation links
- `GET /api/public/content/site-settings` — Global settings

### Storefront Routes (Next.js App Router)
- `/` — Home page (dynamic sections from API)
- `/shop` — Product listing
- `/shop/[id]` — Product detail
- `/custom-design` — Custom design enquiry
- `/api/enquiry` — Enquiry submission
- `/api/search` — Product search
- `/api/images/[fileId]` — Image serving

## Caching Strategy

- **Admin Public API**: 30s client cache, 60s CDN cache, 300s stale-while-revalidate
- **Storefront ISR**: Pages revalidate every 60 seconds (configurable)
- **Supabase Storage**: CDN-cached with immutable URLs

## Error Handling

- **Admin**: Lovable error reporting + capture utility + global error page
- **Storefront**: Next.js error boundaries + custom ErrorReporter component
- **API**: JSON error responses with status codes