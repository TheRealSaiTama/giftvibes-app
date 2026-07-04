# GiftVibes Ultimate

**GiftVibes.in** — Customised diaries, notebooks, and corporate gifts platform. This monorepo combines a customer-facing Next.js storefront with a TanStack Start admin CMS, both powered by a shared Supabase backend.

## Architecture

```
Admin Panel (TanStack Start)                    Storefront (Next.js 15)
        │                                              │
        │ Write (authenticated)                        │ Read (public API)
        ▼                                              ▼
   ┌─────────────────────────────────────────────────────────┐
   │                    Supabase                              │
   │    PostgreSQL (RLS)  │  Auth (JWT)  │  Storage (media)   │
   └─────────────────────────────────────────────────────────┘
```

- **Admin Panel** manages products, pages, diaries, media, navigation, SEO, and site settings
- **Storefront** renders customer-facing pages by fetching from admin's public REST API
- **Supabase** provides the database, authentication, and media storage

## Folder Structure

```
giftvibes-ultimate/
├── apps/
│   ├── admin/             # TanStack Start + React 19 admin CMS
│   │   ├── src/routes/    # Admin pages + public API endpoints
│   │   ├── src/components/# Admin shell + 45 shadcn/ui components
│   │   ├── src/integrations/supabase/  # Supabase clients + auth
│   │   └── supabase/      # Database migrations
│   └── storefront/        # Next.js 15 App Router storefront
│       ├── src/app/       # Pages (home, shop, product, custom-design)
│       ├── src/components/# UI sections + product components
│       └── prisma/        # Prisma schema + migrations
├── packages/
│   └── shared-types/      # Shared TypeScript type definitions
└── docs/                  # Architecture, setup, API, deployment docs
```

## Quick Start

### Prerequisites
- **bun** (>= 1.0)
- **Node.js** (>= 18)
- **Supabase** project

### Setup

```bash
cd /home/therealsaitama/giftvibes-ultimate
bun install
cp .env.example .env  # Edit with your Supabase credentials
```

### Development

```bash
bun run dev              # Start both apps concurrently
bun run dev:storefront   # Storefront only (port 3000)
bun run dev:admin        # Admin only (port 5174)
```

### Build

```bash
bun run build            # Build both apps
bun run build:storefront # Build storefront only
bun run build:admin      # Build admin only
```

## Tech Stack

### Admin Panel (apps/admin)
- **Framework**: TanStack Start (React 19, Vite 8)
- **Styling**: Tailwind CSS v4 + shadcn/ui (45 components)
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **State**: TanStack React Query + React Hook Form + Zod
- **Deployment**: Cloudflare Workers

### Storefront (apps/storefront)
- **Framework**: Next.js 15 (App Router, Turbopack)
- **Styling**: Tailwind CSS v4 + custom theme
- **ORM**: Prisma (PostgreSQL)
- **Animation**: Framer Motion, Embla Carousel
- **Deployment**: Vercel

## API Overview

The admin panel exposes these public REST endpoints:

| Endpoint | Description |
|----------|-------------|
| `GET /api/public/products` | Product listing with category/featured filters |
| `GET /api/public/products/:slug` | Single product by slug |
| `GET /api/public/diaries` | Diary listing |
| `GET /api/public/content/page/:pageKey` | Page sections + SEO data |
| `GET /api/public/content/nav` | Navigation links (header + footer) |
| `GET /api/public/content/site-settings` | Global site settings |

## Documentation

- [ARCHITECTURE.md](docs/ARCHITECTURE.md) — System design and data flow
- [SETUP.md](docs/SETUP.md) — Local development setup guide
- [API_REFERENCE.md](docs/API_REFERENCE.md) — Public API documentation
- [DEPLOYMENT.md](docs/DEPLOYMENT.md) — Production deployment guide