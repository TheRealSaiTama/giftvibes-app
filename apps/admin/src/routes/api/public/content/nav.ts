import { createFileRoute } from "@tanstack/react-router";
import { getPublicSupabase, jsonResponse, corsPreflight } from "@/lib/public-content.server";

export const Route = createFileRoute("/api/public/content/nav")({
  server: {
    handlers: {
      OPTIONS: () => corsPreflight(),
      GET: async () => {
        const supabase = getPublicSupabase();
        const { data, error } = await supabase
          .from("nav_links")
          .select("group_key, label, href, sort_order")
          .eq("enabled", true)
          .order("group_key")
          .order("sort_order");
        if (error) return jsonResponse({ error: error.message }, { status: 500 });
        const grouped: Record<string, { label: string; href: string }[]> = {};
        for (const link of data ?? []) {
          (grouped[link.group_key] ??= []).push({ label: link.label, href: link.href });
        }
        return jsonResponse(grouped);
      },
    },
  },
});
