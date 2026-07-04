# Wiring the Next.js GiftVibes site to the admin

Your admin lives at **this Lovable project**. Every text field, image, product and
setting you edit here is instantly readable through the public API below. The
Next.js storefront calls those endpoints from its Server Components — no
credentials required, JSON only, CORS open, cached ~60s at the edge.

## Endpoints

Replace `ADMIN_BASE` in the snippets with your Lovable URL, e.g.
`https://project--21a8b950-77cc-4fb7-a4a9-a73c178b6983.lovable.app`.

| Purpose               | URL                                                           |
| --------------------- | ------------------------------------------------------------- |
| Global site settings  | `ADMIN_BASE/api/public/content/site-settings`                 |
| Home page             | `ADMIN_BASE/api/public/content/page/home`                     |
| Shop page             | `ADMIN_BASE/api/public/content/page/shop`                     |
| Product template copy | `ADMIN_BASE/api/public/content/page/product`                  |
| Custom design page    | `ADMIN_BASE/api/public/content/page/custom-design`            |
| Header + footer nav   | `ADMIN_BASE/api/public/content/nav`                           |
| Products list         | `ADMIN_BASE/api/public/products?category=&featured=&limit=`   |
| Single product        | `ADMIN_BASE/api/public/products/{slug}`                       |
| Diaries list          | `ADMIN_BASE/api/public/diaries`                               |

## Response shape

`/api/public/content/page/home` returns:

```json
{
  "page_key": "home",
  "sections": [
    { "section_key": "hero", "title": "Hero", "sort_order": 1, "content": {
        "eyebrow": "…", "heading": "…", "subheading": "…",
        "primary_cta": { "label": "…", "href": "…" },
        "secondary_cta": { "label": "…", "href": "…" },
        "image_url": "…"
    }},
    { "section_key": "categories", "content": { "heading": "…", "items": [...] } }
    // …
  ],
  "seo": { "title": "…", "description": "…", "og_image_url": "…" }
}
```

Only enabled sections come back, already ordered.

## Drop-in helper (`lib/gv-content.ts`)

```ts
const BASE = process.env.NEXT_PUBLIC_ADMIN_BASE!;

async function get<T>(path: string, revalidate = 60): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { next: { revalidate } });
  if (!res.ok) throw new Error(`${res.status} ${path}`);
  return res.json();
}

export const getSiteSettings = () => get("/api/public/content/site-settings");
export const getPage = (key: string) =>
  get<{ sections: any[]; seo: { title: string; description: string; og_image_url: string | null } | null }>(`/api/public/content/page/${key}`);
export const getNav = () => get<Record<string, { label: string; href: string }[]>>("/api/public/content/nav");
export const getProducts = () => get<{ products: any[] }>("/api/public/products");
```

## Replacing a hardcoded section (Hero example)

Before — `src/components/sections/hero.tsx`:

```tsx
export default function Hero() {
  return (
    <section>
      <p>Corporate Gifting</p>
      <h1>Premium Diaries & Gift Sets that Speak Your Brand</h1>
      <a href="/shop">Shop the collection</a>
    </section>
  );
}
```

After:

```tsx
import { getPage } from "@/lib/gv-content";

export default async function Hero() {
  const { sections } = await getPage("home");
  const hero = sections.find(s => s.section_key === "hero")?.content;
  if (!hero) return null;
  return (
    <section>
      <p>{hero.eyebrow}</p>
      <h1>{hero.heading}</h1>
      <p>{hero.subheading}</p>
      <a href={hero.primary_cta.href}>{hero.primary_cta.label}</a>
      {hero.secondary_cta?.label && <a href={hero.secondary_cta.href}>{hero.secondary_cta.label}</a>}
    </section>
  );
}
```

Repeat for every section under `src/components/sections/*.tsx`. Fields are
1:1 with what you see in the admin under **Pages → Home**.

## Products & Diaries

Swap your Prisma calls (`prisma.product.findMany`, `prisma.diary.findMany`) for
the two list endpoints. The response shape covers every field currently used in
the storefront (`slug`, `name`, `min_price`, `max_price`, `image_url`, `tags`,
`category`, `featured`).

## SEO

`getPage(key).seo` gives you `{ title, description, og_image_url }`. Feed those
into Next.js `generateMetadata()` for each page.

## Global settings

`getSiteSettings()` returns brand name, WhatsApp, phone, email, address, logo
URL, and socials — perfect for `<Footer />`, `<WhatsAppButton />`, and the
header logo.

That's it — the admin owns every piece of copy, image, product and setting;
the storefront just reads.
