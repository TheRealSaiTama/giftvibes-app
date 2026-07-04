import { createFileRoute } from "@tanstack/react-router";
import { getPublicSupabase, jsonResponse, corsPreflight } from "@/lib/public-content.server";

export const Route = createFileRoute("/api/public/products/$slug")({
  server: {
    handlers: {
      OPTIONS: () => corsPreflight(),
      GET: async ({ params }) => {
        const supabase = getPublicSupabase();
        const { data, error } = await supabase
          .from("products")
          .select("id, slug, name, description, min_price, max_price, category, tags, image_url, gallery, featured")
          .eq("slug", params.slug)
          .eq("enabled", true)
          .maybeSingle();
        if (error) return jsonResponse({ error: error.message }, { status: 500 });
        if (!data) return jsonResponse({ error: "not_found" }, { status: 404 });
        return jsonResponse(data);
      },
    },
  },
});
