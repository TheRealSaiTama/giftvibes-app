import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/admin/admin-shell";
import { ArrowUpRight, FileText, Package, BookText, Images, Settings } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
});

function Stat({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="gv-panel p-5">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-2 font-display text-3xl font-semibold">{value}</div>
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}

function QuickLink({ to, label, description, icon: Icon }: { to: string; label: string; description: string; icon: typeof FileText }) {
  return (
    <Link
      to={to}
      className="gv-panel p-5 flex items-start gap-3 group hover:border-primary/40 transition"
    >
      <div className="h-9 w-9 rounded-md bg-primary-soft text-primary flex items-center justify-center shrink-0">
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 font-medium text-sm">
          {label}
          <ArrowUpRight className="h-3.5 w-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition text-primary" />
        </div>
        <div className="mt-0.5 text-xs text-muted-foreground">{description}</div>
      </div>
    </Link>
  );
}

function Dashboard() {
  const { data } = useQuery({
    queryKey: ["dashboard-counts"],
    queryFn: async () => {
      const [products, diaries, sections, media] = await Promise.all([
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("diaries").select("id", { count: "exact", head: true }),
        supabase.from("page_sections").select("id", { count: "exact", head: true }),
        supabase.from("media_assets").select("id", { count: "exact", head: true }),
      ]);
      return {
        products: products.count ?? 0,
        diaries: diaries.count ?? 0,
        sections: sections.count ?? 0,
        media: media.count ?? 0,
      };
    },
  });

  return (
    <div>
      <PageHeader
        title="Welcome back"
        description="Everything on the storefront is editable from here — pages, products, media, settings."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Editable sections" value={data?.sections ?? "—"} hint="Across all pages" />
        <Stat label="Products" value={data?.products ?? "—"} hint="In the catalog" />
        <Stat label="Diaries" value={data?.diaries ?? "—"} hint="In the diary catalog" />
        <Stat label="Media" value={data?.media ?? "—"} hint="Uploaded assets" />
      </div>

      <h2 className="mt-10 mb-4 font-display text-lg font-semibold">Jump back in</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <QuickLink to="/pages/home" label="Edit home page" description="Hero, categories, banners and 15 sections" icon={FileText} />
        <QuickLink to="/products" label="Manage products" description="Add, edit, hide catalog items" icon={Package} />
        <QuickLink to="/diaries" label="Manage diaries" description="Diary-specific fields and images" icon={BookText} />
        <QuickLink to="/media" label="Media library" description="Upload and reuse images" icon={Images} />
        <QuickLink to="/settings" label="Global settings" description="Brand, WhatsApp, contact, socials" icon={Settings} />
        <QuickLink to="/integration" label="Connect the storefront" description="Copy the fetch snippets for the Next.js site" icon={ArrowUpRight} />
      </div>
    </div>
  );
}
