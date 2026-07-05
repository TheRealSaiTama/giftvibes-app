import { useState } from "react";
import { createFileRoute, notFound, useParams } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader, SaveBar } from "@/components/admin/admin-shell";
import { updateSection } from "@/lib/admin.functions";
import { useDirty } from "@/hooks/use-dirty";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from "sonner";
import { Eye, EyeOff, Plus, Trash2, Monitor, Smartphone, RefreshCw, ExternalLink } from "lucide-react";
import { MediaPicker } from "@/components/admin/media-picker";

const PAGE_PREVIEW_PATHS: Record<string, string> = {
  home: "/",
  shop: "/shop",
  product: "/products",
  "custom-design": "/custom-design",
};

const PAGE_TITLES: Record<string, { title: string; description: string }> = {
  home: { title: "Home page", description: "Every section on the storefront home page — expand to edit copy and swap images." },
  shop: { title: "Shop page", description: "Copy shown around the product grid." },
  product: { title: "Product template", description: "Copy shared by every product detail page." },
  "custom-design": { title: "Custom design page", description: "The full custom-design landing page." },
};

export const Route = createFileRoute("/_authenticated/pages/$page")({
  beforeLoad: ({ params }) => {
    if (!PAGE_TITLES[params.page]) throw notFound();
  },
  component: PageEditor,
});

type Section = {
  id: string;
  page_key: string;
  section_key: string;
  title: string | null;
  sort_order: number;
  enabled: boolean;
  content: Record<string, any>;
};

function PageEditor() {
  const { page } = useParams({ from: "/_authenticated/pages/$page" });
  const meta = PAGE_TITLES[page];
  const qc = useQueryClient();
  const runUpdate = useServerFn(updateSection);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [previewNonce, setPreviewNonce] = useState(0);

  const { data: sections, isLoading } = useQuery<Section[]>({
    queryKey: ["sections", page],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("page_sections")
        .select("*")
        .eq("page_key", page)
        .order("sort_order");
      if (error) throw error;
      return data as Section[];
    },
  });

  const { data: settings } = useQuery<{ preview_url: string | null; site_url: string | null }>({
    queryKey: ["site-settings-urls"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("preview_url, site_url")
        .eq("id", 1)
        .single();
      if (error) throw error;
      return data as { preview_url: string | null; site_url: string | null };
    },
  });

  const previewBase = (settings?.preview_url || settings?.site_url || "").replace(/\/+$/, "");
  const previewPath = PAGE_PREVIEW_PATHS[page] ?? `/${page}`;
  const previewUrl = previewBase ? `${previewBase}${previewPath}` : "";

  return (
    <div>
      <PageHeader title={meta.title} description={meta.description}>
        <Button
          variant={previewOpen ? "default" : "outline"}
          size="sm"
          onClick={() => setPreviewOpen((v) => !v)}
        >
          <Eye className="h-4 w-4 mr-1.5" />
          {previewOpen ? "Hide preview" : "Live preview"}
        </Button>
      </PageHeader>

      <div className={previewOpen ? "grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-6" : ""}>
        <div>
          {isLoading && <div className="text-sm text-muted-foreground">Loading sections…</div>}

          {sections && sections.length === 0 && (
            <Card className="p-8 text-center text-sm text-muted-foreground flex flex-col items-center justify-center gap-4">
              <p>No sections defined for this page yet.</p>
              {page === 'home' && (
                <Button 
                  onClick={async () => {
                    const { seedHomeSections } = await import('@/lib/admin.functions');
                    try {
                      await seedHomeSections();
                      qc.invalidateQueries({ queryKey: ["sections", page] });
                      toast.success("Home sections seeded successfully.");
                    } catch (e) {
                      toast.error(e instanceof Error ? e.message : "Seed failed");
                    }
                  }}
                  variant="outline"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Seed Default Home Sections
                </Button>
              )}
            </Card>
          )}

          <Accordion type="multiple" defaultValue={sections?.slice(0, 2).map((s) => s.id)} className="space-y-3">
            {sections?.map((section) => (
              <SectionEditor
                key={section.id}
                section={section}
                onSaved={() => {
                  qc.invalidateQueries({ queryKey: ["sections", page] });
                  setPreviewNonce((n) => n + 1);
                }}
                runUpdate={runUpdate}
              />
            ))}
          </Accordion>
        </div>

        {previewOpen && (
          <div className="xl:sticky xl:top-4 xl:self-start">
            <div className="gv-panel overflow-hidden">
              <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-border bg-surface/60">
                <div className="flex items-center gap-1">
                  <Button
                    variant={previewDevice === "desktop" ? "secondary" : "ghost"}
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setPreviewDevice("desktop")}
                    title="Desktop"
                  >
                    <Monitor className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant={previewDevice === "mobile" ? "secondary" : "ghost"}
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setPreviewDevice("mobile")}
                    title="Mobile"
                  >
                    <Smartphone className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <div className="flex-1 text-xs font-mono text-muted-foreground truncate px-2">
                  {previewUrl || "Set preview URL in Settings"}
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setPreviewNonce((n) => n + 1)} title="Reload">
                    <RefreshCw className="h-3.5 w-3.5" />
                  </Button>
                  {previewUrl && (
                    <Button asChild variant="ghost" size="icon" className="h-7 w-7">
                      <a href={previewUrl} target="_blank" rel="noreferrer" title="Open in new tab">
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>
              <div className="bg-surface/40 flex items-start justify-center p-3" style={{ height: "calc(100vh - 200px)", minHeight: 520 }}>
                {previewUrl ? (
                  <iframe
                    key={previewNonce}
                    src={previewUrl}
                    className="bg-background border border-border rounded-md shadow-sm"
                    style={{
                      width: previewDevice === "mobile" ? 390 : "100%",
                      height: "100%",
                      maxWidth: "100%",
                    }}
                    title="Live preview"
                  />
                ) : (
                  <div className="text-sm text-muted-foreground text-center max-w-sm py-16">
                    Add your storefront URL under <strong>Settings → Storefront URLs</strong> to enable live preview.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SectionEditor({
  section,
  onSaved,
  runUpdate,
}: {
  section: Section;
  onSaved: () => void;
  runUpdate: ReturnType<typeof useServerFn<typeof updateSection>>;
}) {
  const { draft, setDraft, dirty, reset } = useDirty(section);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await runUpdate({
        data: {
          id: draft.id,
          title: draft.title,
          content: draft.content,
          enabled: draft.enabled,
        },
      });
      toast.success(`${draft.title || draft.section_key} saved`);
      onSaved();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  function patchContent(patch: Record<string, any>) {
    setDraft({ ...draft, content: { ...draft.content, ...patch } });
  }

  return (
    <AccordionItem value={section.id} className="gv-panel border overflow-hidden">
      <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-surface/60">
        <div className="flex items-center gap-3 flex-1">
          <div className="flex-1 text-left">
            <div className="font-display font-medium text-sm flex items-center gap-2">
              {draft.title || prettyKey(section.section_key)}
              {!draft.enabled && <span className="gv-chip">Hidden</span>}
              {dirty && <span className="gv-chip bg-primary-soft text-primary border-primary/20">Unsaved</span>}
            </div>
            <div className="text-xs text-muted-foreground font-mono">{section.section_key}</div>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="px-5 pb-5 pt-1 border-t border-border space-y-5">
          <div className="flex items-center justify-between pt-4">
            <div className="flex items-center gap-2 text-sm">
              <Switch
                checked={draft.enabled}
                onCheckedChange={(v) => setDraft({ ...draft, enabled: v })}
                id={`enabled-${section.id}`}
              />
              <Label htmlFor={`enabled-${section.id}`} className="flex items-center gap-1.5">
                {draft.enabled ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                {draft.enabled ? "Visible on the site" : "Hidden"}
              </Label>
            </div>
            <div className="flex items-center gap-2">
              {dirty && (
                <Button variant="ghost" size="sm" onClick={reset}>
                  Discard
                </Button>
              )}
              <Button size="sm" onClick={handleSave} disabled={!dirty || saving}>
                {saving ? "Saving…" : "Save section"}
              </Button>
            </div>
          </div>

          <GenericContentEditor content={draft.content} onChange={patchContent} />
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

function GenericContentEditor({
  content,
  onChange,
}: {
  content: Record<string, any>;
  onChange: (patch: Record<string, any>) => void;
}) {
  return (
    <div className="space-y-4">
      {Object.entries(content).map(([key, value]) => (
        <FieldEditor
          key={key}
          fieldKey={key}
          value={value}
          onChange={(next) => onChange({ [key]: next })}
        />
      ))}
    </div>
  );
}

function FieldEditor({
  fieldKey,
  value,
  onChange,
}: {
  fieldKey: string;
  value: any;
  onChange: (next: any) => void;
}) {
  const label = prettyKey(fieldKey);

  // image_url / *_image_url / *image_url → media picker
  if (typeof value === "string" && /image_url|logo_url|favicon_url/.test(fieldKey)) {
    return (
      <div>
        <Label className="mb-2 block">{label}</Label>
        <MediaPicker value={value} onChange={onChange} />
      </div>
    );
  }

  // Simple string
  if (typeof value === "string") {
    const long = value.length > 80 || /body|description|subheading|copy|tagline/.test(fieldKey);
    return (
      <div>
        <Label className="mb-2 block">{label}</Label>
        {long ? (
          <Textarea rows={3} value={value} onChange={(e) => onChange(e.target.value)} />
        ) : (
          <Input value={value} onChange={(e) => onChange(e.target.value)} />
        )}
      </div>
    );
  }

  if (typeof value === "number") {
    return (
      <div>
        <Label className="mb-2 block">{label}</Label>
        <Input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
        />
      </div>
    );
  }

  if (typeof value === "boolean") {
    return (
      <div className="flex items-center gap-2">
        <Switch checked={value} onCheckedChange={onChange} />
        <Label>{label}</Label>
      </div>
    );
  }

  // Array of primitives (e.g. tabs, tags, corporate_showcase items, logos)
  if (Array.isArray(value) && value.every((v) => typeof v === "string")) {
    return (
      <div>
        <Label className="mb-2 block">{label}</Label>
        <div className="space-y-2">
          {value.map((v, i) => (
            <div key={i} className="flex gap-2">
              <Input
                value={v}
                onChange={(e) => {
                  const next = [...value];
                  next[i] = e.target.value;
                  onChange(next);
                }}
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onChange(value.filter((_, j) => j !== i))}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onChange([...value, ""])}
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add {label.replace(/s$/, "").toLowerCase()}
          </Button>
        </div>
      </div>
    );
  }

  // Array of objects (items, stats, steps, etc.)
  if (Array.isArray(value)) {
    return (
      <div>
        <Label className="mb-2 block">{label}</Label>
        <div className="space-y-3">
          {value.map((item, i) => (
            <div key={i} className="rounded-md border border-border bg-surface/60 p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-medium text-muted-foreground">
                  {label.replace(/s$/, "")} #{i + 1}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => onChange(value.filter((_, j) => j !== i))}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
              <div className="space-y-3">
                {Object.entries(item as Record<string, any>).map(([k, v]) => (
                  <FieldEditor
                    key={k}
                    fieldKey={k}
                    value={v}
                    onChange={(next) => {
                      const arr = [...value];
                      arr[i] = { ...(arr[i] as any), [k]: next };
                      onChange(arr);
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const template = value[0]
                ? Object.fromEntries(
                    Object.entries(value[0] as Record<string, any>).map(([k, v]) => [
                      k,
                      typeof v === "string" ? "" : typeof v === "number" ? 0 : v,
                    ]),
                  )
                : {};
              onChange([...value, template]);
            }}
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add {label.replace(/s$/, "").toLowerCase()}
          </Button>
        </div>
      </div>
    );
  }

  // Nested object (cta, primary_cta, column_headings, socials)
  if (value && typeof value === "object") {
    return (
      <div>
        <Label className="mb-2 block">{label}</Label>
        <div className="rounded-md border border-border bg-surface/60 p-3 space-y-3">
          {Object.entries(value).map(([k, v]) => (
            <FieldEditor
              key={k}
              fieldKey={k}
              value={v}
              onChange={(next) => onChange({ ...value, [k]: next })}
            />
          ))}
        </div>
      </div>
    );
  }

  return null;
}

function prettyKey(k: string) {
  return k
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// Kept exported for any future use.
export { SaveBar };
