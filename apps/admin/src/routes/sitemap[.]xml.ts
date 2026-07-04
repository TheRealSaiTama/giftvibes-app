import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { getPublicSupabase } from "@/lib/public-content.server";
import { cachedResponse, pickLatest } from "@/lib/http-cache.server";

// Fully dynamic sitemap generator — every URL is derived from the database.
// Base URL comes from site_settings.site_url; product/diary slugs come from
// their tables; page routes come from enabled page_sections page_keys.

interface Entry {
  path: string;
  lastmod?: string;
  changefreq?: "daily" | "weekly" | "monthly";
  priority?: string;
}

const STATIC_PAGE_ROUTES: Record<string, string> = {
  home: "/",
  shop: "/shop",
  "custom-design": "/custom-design",
};

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const supabase = getPublicSupabase();

        const [settingsRes, pagesRes, productsRes, diariesRes] = await Promise.all([
          supabase.from("site_settings").select("site_url").eq("id", 1).single(),
          supabase.from("page_sections").select("page_key, updated_at").eq("enabled", true),
          supabase.from("products").select("slug, updated_at").eq("enabled", true),
          supabase.from("diaries").select("slug, updated_at").eq("enabled", true),
        ]);

        const base = (settingsRes.data?.site_url ?? "").replace(/\/+$/, "");

        const entries: Entry[] = [];

        // Static / page routes (deduped by page_key)
        const pageKeys = new Set<string>(["home", "shop", "custom-design"]);
        for (const row of pagesRes.data ?? []) pageKeys.add(row.page_key);
        for (const key of pageKeys) {
          const path = STATIC_PAGE_ROUTES[key] ?? `/${key}`;
          entries.push({
            path,
            changefreq: "weekly",
            priority: key === "home" ? "1.0" : "0.8",
          });
        }

        for (const p of productsRes.data ?? []) {
          if (!p.slug) continue;
          entries.push({
            path: `/products/${p.slug}`,
            lastmod: p.updated_at ? new Date(p.updated_at).toISOString() : undefined,
            changefreq: "weekly",
            priority: "0.7",
          });
        }

        for (const d of diariesRes.data ?? []) {
          if (!d.slug) continue;
          entries.push({
            path: `/diaries/${d.slug}`,
            lastmod: d.updated_at ? new Date(d.updated_at).toISOString() : undefined,
            changefreq: "weekly",
            priority: "0.7",
          });
        }

        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${base}${e.path}</loc>`,
            e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        const lastModified = pickLatest([
          ...(pagesRes.data ?? []).map((r) => r.updated_at),
          ...(productsRes.data ?? []).map((r) => r.updated_at),
          ...(diariesRes.data ?? []).map((r) => r.updated_at),
        ]);

        return cachedResponse({
          request,
          body: xml,
          contentType: "application/xml; charset=utf-8",
          lastModified,
          maxAge: 300,
          sMaxAge: 600,
          swr: 3600,
        });
      },
    },
  },
});
