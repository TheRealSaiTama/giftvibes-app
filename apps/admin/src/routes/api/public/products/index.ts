import { createFileRoute } from "@tanstack/react-router";
import { getPublicSupabase, jsonResponse, corsPreflight } from "@/lib/public-content.server";

export const Route = createFileRoute("/api/public/products/")({
  server: {
    handlers: {
      OPTIONS: () => corsPreflight(),
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const category = url.searchParams.get("category");
        const featured = url.searchParams.get("featured");
        const limit = Math.min(100, Number(url.searchParams.get("limit") ?? "50"));
        const supabase = getPublicSupabase();
        let q = supabase
          .from("products")
          .select("id, slug, name, description, min_price, max_price, category, tags, image_url, featured")
          .eq("enabled", true)
          .order("created_at", { ascending: false })
          .limit(limit);
        if (category) q = q.eq("category", category);
        if (featured === "true") q = q.eq("featured", true);
        const { data, error } = await q;
        if (error) return jsonResponse({ error: error.message }, { status: 500 });
        return jsonResponse({ products: data ?? [] });
      },
    },
  },
});
