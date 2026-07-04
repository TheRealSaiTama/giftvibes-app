import { createFileRoute } from "@tanstack/react-router";
import { getPublicSupabase, jsonResponse, corsPreflight } from "@/lib/public-content.server";

export const Route = createFileRoute("/api/public/diaries/")({
  server: {
    handlers: {
      OPTIONS: () => corsPreflight(),
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const limit = Math.min(200, Number(url.searchParams.get("limit") ?? "100"));
        const supabase = getPublicSupabase();
        const { data, error } = await supabase
          .from("diaries")
          .select("id, slug, name, description, min_price, max_price, category, tags, color, size, pages, cover_type, image_url, featured")
          .eq("enabled", true)
          .order("created_at", { ascending: false })
          .limit(limit);
        if (error) return jsonResponse({ error: error.message }, { status: 500 });
        return jsonResponse({ diaries: data ?? [] });
      },
    },
  },
});
