import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { getPublicSupabase } from "@/lib/public-content.server";
import { cachedResponse, pickLatest } from "@/lib/http-cache.server";

// Dynamic robots.txt — Sitemap directive uses site_settings.site_url so it
// updates whenever the storefront URL changes; no hardcoded host.
export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const supabase = getPublicSupabase();
        const { data } = await supabase
          .from("site_settings")
          .select("site_url, updated_at")
          .eq("id", 1)
          .single();

        const base = (data?.site_url ?? "").replace(/\/+$/, "");
        const lines = [
          "User-agent: *",
          "Allow: /",
          "Disallow: /auth",
          "Disallow: /dashboard",
          "",
        ];
        if (base) lines.push(`Sitemap: ${base}/sitemap.xml`);

        return cachedResponse({
          request,
          body: lines.join("\n"),
          contentType: "text/plain; charset=utf-8",
          lastModified: pickLatest([data?.updated_at]),
          maxAge: 600,
          sMaxAge: 3600,
          swr: 86400,
        });
      },
    },
  },
});
