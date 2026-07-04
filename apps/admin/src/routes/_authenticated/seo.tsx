import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/admin/admin-shell";
import { upsertSeo } from "@/lib/admin.functions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { MediaPicker } from "@/components/admin/media-picker";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/seo")({
  component: SeoPage,
});

const PAGES = [
  { key: "home", label: "Home" },
  { key: "shop", label: "Shop" },
  { key: "product", label: "Product template" },
  { key: "custom-design", label: "Custom design" },
];

type Seo = { page_key: string; title: string | null; description: string | null; og_image_url: string | null };

function SeoPage() {
  const qc = useQueryClient();
  const { data } = useQuery<Seo[]>({
    queryKey: ["seo"],
    queryFn: async () => {
      const { data, error } = await supabase.from("page_seo").select("*");
      if (error) throw error;
      return data as Seo[];
    },
  });

  return (
    <div>
      <PageHeader title="SEO" description="Per-page title, description and social share image. These become <title>, meta description and og:image on the public site." />
      <div className="space-y-4">
        {PAGES.map((p) => {
          const seo = data?.find((s) => s.page_key === p.key) ?? { page_key: p.key, title: "", description: "", og_image_url: "" };
          return <SeoRow key={p.key} label={p.label} value={seo} onSaved={() => qc.invalidateQueries({ queryKey: ["seo"] })} />;
        })}
      </div>
    </div>
  );
}

function SeoRow({ label, value, onSaved }: { label: string; value: Seo; onSaved: () => void }) {
  const [v, setV] = useState(value);
  const [saving, setSaving] = useState(false);
  const runSave = useServerFn(upsertSeo);
  async function save() {
    setSaving(true);
    try {
      await runSave({ data: { page_key: v.page_key, title: v.title || null, description: v.description || null, og_image_url: v.og_image_url || null } });
      toast.success(`${label} SEO saved`);
      onSaved();
    } catch (e) { toast.error(e instanceof Error ? e.message : "Save failed"); }
    finally { setSaving(false); }
  }
  return (
    <div className="gv-panel p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-medium">{label}</h3>
        <span className="gv-chip font-mono">/{v.page_key === "home" ? "" : v.page_key}</span>
      </div>
      <div className="grid lg:grid-cols-2 gap-4">
        <div>
          <Label>Title (&lt; 60 chars)</Label>
          <Input value={v.title ?? ""} onChange={(e) => setV({ ...v, title: e.target.value })} maxLength={70} className="mt-1.5" />
          <div className="text-xs text-muted-foreground mt-1">{v.title?.length ?? 0}/60</div>
        </div>
        <div>
          <Label>Meta description (&lt; 160 chars)</Label>
          <Textarea rows={2} value={v.description ?? ""} onChange={(e) => setV({ ...v, description: e.target.value })} maxLength={200} className="mt-1.5" />
          <div className="text-xs text-muted-foreground mt-1">{v.description?.length ?? 0}/160</div>
        </div>
        <div className="lg:col-span-2">
          <Label>Social share image (og:image)</Label>
          <div className="mt-1.5"><MediaPicker value={v.og_image_url ?? ""} onChange={(url) => setV({ ...v, og_image_url: url })} /></div>
        </div>
      </div>
      <div className="mt-4 flex justify-end"><Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Save"}</Button></div>
    </div>
  );
}
