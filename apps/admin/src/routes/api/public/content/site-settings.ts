import { createFileRoute } from "@tanstack/react-router";
import { getPublicSupabase, jsonResponse, corsPreflight } from "@/lib/public-content.server";

export const Route = createFileRoute("/api/public/content/site-settings")({
  server: {
    handlers: {
      OPTIONS: () => corsPreflight(),
      GET: async () => {
        const supabase = getPublicSupabase();
        const { data, error } = await supabase
          .from("site_settings")
          .select("brand_name, tagline, logo_url, favicon_url, primary_color, site_url, socials")
          .eq("id", 1)
          .single();
        if (error) return jsonResponse({ error: error.message }, { status: 500 });
        return jsonResponse(data);
      },
    },
  },
});
