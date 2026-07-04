import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader, SaveBar } from "@/components/admin/admin-shell";
import { updateSiteSettings } from "@/lib/admin.functions";
import { useDirty } from "@/hooks/use-dirty";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MediaPicker } from "@/components/admin/media-picker";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/settings")({
  component: SettingsPage,
});

type Settings = {
  brand_name: string;
  tagline: string | null;
  logo_url: string | null;
  favicon_url: string | null;
  primary_color: string | null;
  whatsapp_number: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  site_url: string | null;
  preview_url: string | null;
  socials: Record<string, string>;
};

const emptySettings: Settings = {
  brand_name: "", tagline: "", logo_url: "", favicon_url: "", primary_color: "#c4654a",
  whatsapp_number: "", phone: "", email: "", address: "",
  site_url: "", preview_url: "",
  socials: { instagram: "", facebook: "", linkedin: "" },
};

function SettingsPage() {
  const qc = useQueryClient();
  const runSave = useServerFn(updateSiteSettings);
  const [saving, setSaving] = useState(false);

  const { data } = useQuery<Settings>({
    queryKey: ["site-settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_settings").select("*").eq("id", 1).single();
      if (error) throw error;
      return data as Settings;
    },
  });

  const { draft, setDraft, dirty, reset } = useDirty<Settings>(data ?? emptySettings);

  async function handleSave() {
    setSaving(true);
    try {
      await runSave({
        data: {
          brand_name: draft.brand_name,
          tagline: draft.tagline || null,
          logo_url: draft.logo_url || null,
          favicon_url: draft.favicon_url || null,
          primary_color: draft.primary_color || null,
          whatsapp_number: draft.whatsapp_number || null,
          phone: draft.phone || null,
          email: draft.email || null,
          address: draft.address || null,
          site_url: draft.site_url || null,
          preview_url: draft.preview_url || null,
          socials: draft.socials,
        },
      });
      toast.success("Settings saved");
      qc.invalidateQueries({ queryKey: ["site-settings"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally { setSaving(false); }
  }

  return (
    <div>
      <PageHeader title="Global settings" description="Brand identity, contact and social links used across every page." />
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="gv-panel p-6 space-y-4">
          <h3 className="font-display font-medium">Brand</h3>
          <div><Label>Brand name</Label><Input value={draft.brand_name} onChange={(e) => setDraft({ ...draft, brand_name: e.target.value })} className="mt-1.5" /></div>
          <div><Label>Tagline</Label><Input value={draft.tagline ?? ""} onChange={(e) => setDraft({ ...draft, tagline: e.target.value })} className="mt-1.5" /></div>
          <div><Label>Primary color</Label><div className="flex gap-2 mt-1.5"><Input value={draft.primary_color ?? ""} onChange={(e) => setDraft({ ...draft, primary_color: e.target.value })} className="font-mono" /><div className="h-9 w-9 rounded border border-border" style={{ background: draft.primary_color ?? "" }} /></div></div>
          <div><Label>Logo</Label><div className="mt-1.5"><MediaPicker value={draft.logo_url ?? ""} onChange={(v) => setDraft({ ...draft, logo_url: v })} /></div></div>
          <div><Label>Favicon</Label><div className="mt-1.5"><MediaPicker value={draft.favicon_url ?? ""} onChange={(v) => setDraft({ ...draft, favicon_url: v })} /></div></div>
        </div>

        <div className="gv-panel p-6 space-y-4">
          <h3 className="font-display font-medium">Contact</h3>
          <div><Label>WhatsApp number</Label><Input value={draft.whatsapp_number ?? ""} onChange={(e) => setDraft({ ...draft, whatsapp_number: e.target.value })} placeholder="+91 …" className="mt-1.5" /></div>
          <div><Label>Phone</Label><Input value={draft.phone ?? ""} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} className="mt-1.5" /></div>
          <div><Label>Email</Label><Input type="email" value={draft.email ?? ""} onChange={(e) => setDraft({ ...draft, email: e.target.value })} className="mt-1.5" /></div>
          <div><Label>Address</Label><Textarea rows={3} value={draft.address ?? ""} onChange={(e) => setDraft({ ...draft, address: e.target.value })} className="mt-1.5" /></div>
        </div>

        <div className="gv-panel p-6 space-y-4 lg:col-span-2">
          <h3 className="font-display font-medium">Storefront URLs</h3>
          <p className="text-xs text-muted-foreground -mt-2">
            Used by the sitemap generator (<code className="font-mono">/sitemap.xml</code>) and the live preview iframe. Update these anytime — nothing is hardcoded.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>Public site URL</Label>
              <Input value={draft.site_url ?? ""} onChange={(e) => setDraft({ ...draft, site_url: e.target.value })} placeholder="https://giftvibe.com" className="mt-1.5 font-mono text-sm" />
            </div>
            <div>
              <Label>Live preview URL</Label>
              <Input value={draft.preview_url ?? ""} onChange={(e) => setDraft({ ...draft, preview_url: e.target.value })} placeholder="https://staging.giftvibe.com" className="mt-1.5 font-mono text-sm" />
            </div>
          </div>
        </div>

        <div className="gv-panel p-6 space-y-4 lg:col-span-2">
          <h3 className="font-display font-medium">Social links</h3>
          <div className="grid sm:grid-cols-3 gap-4">
            {["instagram", "facebook", "linkedin"].map((key) => (
              <div key={key}>
                <Label className="capitalize">{key}</Label>
                <Input
                  value={draft.socials?.[key] ?? ""}
                  onChange={(e) => setDraft({ ...draft, socials: { ...draft.socials, [key]: e.target.value } })}
                  className="mt-1.5"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <SaveBar dirty={dirty} onSave={handleSave} onDiscard={reset} saving={saving} />
      <div className="h-16" />
    </div>
  );
}
