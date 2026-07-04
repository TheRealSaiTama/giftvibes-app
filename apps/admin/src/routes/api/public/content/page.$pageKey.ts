import { createFileRoute } from "@tanstack/react-router";
import { getPublicSupabase, jsonResponse, corsPreflight } from "@/lib/public-content.server";

export const Route = createFileRoute("/api/public/content/page/$pageKey")({
  server: {
    handlers: {
      OPTIONS: () => corsPreflight(),
      GET: async ({ params }) => {
        const supabase = getPublicSupabase();
        const [sectionsRes, seoRes] = await Promise.all([
          supabase
            .from("page_sections")
            .select("section_key, title, sort_order, content")
            .eq("page_key", params.pageKey)
            .eq("enabled", true)
            .order("sort_order"),
          supabase
            .from("page_seo")
            .select("title, description, og_image_url")
            .eq("page_key", params.pageKey)
            .maybeSingle(),
        ]);
        if (sectionsRes.error) return jsonResponse({ error: sectionsRes.error.message }, { status: 500 });
        return jsonResponse({
          page_key: params.pageKey,
          sections: sectionsRes.data ?? [],
          seo: seoRes.data ?? null,
        });
      },
    },
  },
});
