import { useEffect, useRef, useState } from "react";
import { createFileRoute, notFound, useParams } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader, SaveBar } from "@/components/admin/admin-shell";
import { updateSection, seedHomeSections } from "@/lib/admin.functions";
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
import { ProductPicker } from "@/components/admin/product-picker";
import { TabManager } from "@/components/admin/tab-manager";
import {
  CategoryItemsEditor,
  defaultCategoryItems,
  normalizeCategoryItem,
  type CategoryCarouselItem,
} from "@/components/admin/category-items-editor";

/** Expected home section keys (must match seedHomeSections). */
const HOME_SECTION_KEYS = [
  "hero",
  "about",
  "discounts",
  "categories",
  "best_deals",
  "brands",
  "popular",
  "cashback",
  "tabbed_products",
  "why_choose_us",
  "satisfaction",
  "cashback_bottom",
  "services",
  "corporate_showcase",
] as const;

const PAGE_PREVIEW_PATHS: Record<string, string> = {
  home: "/",
  shop: "/shop",
  product: "/products",
};

const PAGE_TITLES: Record<string, { title: string; description: string }> = {
  home: { title: "Home page", description: "Every section on the storefront home page — expand to edit copy and swap images." },
  shop: { title: "Shop page", description: "Copy shown around the product grid." },
  product: { title: "Product template", description: "Copy shared by every product detail page." },
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

/** Map legacy / partial DB content into the fields the storefront + editor expect. */
function normalizeSectionForEditor(section: Section): Section {
  const c = section.content || {};

  // Hero: expand old single-field rows into full editable schema.
  if (section.section_key === "hero" && !c.heading_1) {
    return {
      ...section,
      content: {
        heading_1: c.headline || c.heading || "Custom Diaries",
        heading_2: c.headline_line2 || c.heading_2 || "Corporate Gifts.",
        subheading_1:
          typeof c.subheading === "string"
            ? c.subheading
            : c.subheading_1 || "Crafting premium customized diaries and",
        subheading_2: c.subheading_2 || "corporate gifts with unmatched quality.",
        primary_cta: c.primary_cta || {
          base_text: c.cta_text || "Come Here",
          hover_text: "Explore More",
          url: c.cta_href || "/shop",
        },
        background_image_url: c.background_image_url || "/headerimage5.png",
      },
    };
  }

  // Shop / product template: ensure default editable keys always exist.
  if (section.page_key === "shop" && section.section_key === "main") {
    return {
      ...section,
      content: {
        heading: c.heading ?? "Our Products",
        subheading: c.subheading ?? "Browse diaries, gift sets, and corporate essentials.",
        empty_state: c.empty_state ?? "No products match your filters. Try clearing filters.",
      },
    };
  }
  if (section.page_key === "product" && section.section_key === "main") {
    return {
      ...section,
      content: {
        related_heading: c.related_heading ?? "You may also like",
        enquiry_cta: c.enquiry_cta ?? "Enquire Now",
        quote_cta: c.quote_cta ?? "Request Quote",
      },
    };
  }

  return section;
}

function PageEditor() {
  const { page } = useParams({ from: "/_authenticated/pages/$page" });
  const meta = PAGE_TITLES[page];
  const qc = useQueryClient();
  const runUpdate = useServerFn(updateSection);
  const runSeed = useServerFn(seedHomeSections);
  const [seeding, setSeeding] = useState(false);
  const autoSeedTried = useRef(false);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [previewNonce, setPreviewNonce] = useState(0);

  const {
    data: sections,
    isLoading,
    isError,
    error: loadError,
    refetch,
  } = useQuery<Section[]>({
    queryKey: ["sections", page],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("page_sections")
        .select("*")
        .eq("page_key", page)
        .order("sort_order");
      if (error) throw new Error(error.message || "Failed to load page sections");
      return (data ?? []) as Section[];
    },
    retry: 1,
  });

  const { data: settings } = useQuery<{ preview_url: string | null; site_url: string | null }>({
    queryKey: ["site-settings-urls"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("preview_url, site_url")
        .eq("id", 1)
        .maybeSingle();
      if (error) throw error;
      return (data as { preview_url: string | null; site_url: string | null }) ?? {
        preview_url: null,
        site_url: "https://www.giftvibes.in",
      };
    },
  });

  const previewBase = (settings?.preview_url || settings?.site_url || "https://www.giftvibes.in").replace(
    /\/+$/,
    "",
  );
  const previewPath = PAGE_PREVIEW_PATHS[page] ?? `/${page}`;
  const previewUrl = previewBase ? `${previewBase}${previewPath}` : "";

  const homeKeysPresent = new Set((sections || []).map((s) => s.section_key));
  const missingHomeCount =
    page === "home"
      ? HOME_SECTION_KEYS.filter((k) => !homeKeysPresent.has(k)).length
      : 0;
  const needsSeed =
    page === "home"
      ? missingHomeCount > 0 || (sections?.length ?? 0) === 0
      : (sections?.length ?? 0) === 0;

  // Legacy hero with only `headline` needs repair even when the row exists.
  const heroNeedsRepair =
    page === "home" &&
    !!sections?.some((s) => {
      if (s.section_key !== "hero") return false;
      const c = s.content || {};
      return !c.heading_1 && !!(c.headline || c.heading);
    });

  const showSeedBanner = needsSeed || heroNeedsRepair;

  async function handleSeed() {
    setSeeding(true);
    try {
      const res = (await runSeed()) as { inserted?: number; repaired?: number } | undefined;
      await qc.invalidateQueries({ queryKey: ["sections"] });
      const inserted = res?.inserted ?? 0;
      const repaired = res?.repaired ?? 0;
      if (inserted > 0 || repaired > 0) {
        toast.success(
          [
            inserted > 0 ? `Added ${inserted} section(s)` : null,
            repaired > 0 ? `repaired ${repaired}` : null,
          ]
            .filter(Boolean)
            .join(", ") + ". Open each accordion to edit.",
        );
      } else {
        toast.success("Sections already complete.");
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Seed failed — are you signed in as owner?";
      toast.error(msg);
    } finally {
      setSeeding(false);
    }
  }

  // Auto-repair once when home/shop/product is incomplete so editors aren't stuck with only Hero.
  useEffect(() => {
    if (isLoading || isError || autoSeedTried.current) return;
    if (!showSeedBanner) return;
    autoSeedTried.current = true;
    void handleSeed();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once when first incomplete load detected
  }, [isLoading, isError, showSeedBanner, page]);

  useEffect(() => {
    if (!isError || !loadError) return;
    toast.error(loadError instanceof Error ? loadError.message : "Failed to load page sections");
  }, [isError, loadError]);

  return (
    <div>
      <PageHeader title={meta.title} description={meta.description}>
        {/* Always available — seed is insert-missing only, never wipes edits */}
        <Button variant={showSeedBanner ? "default" : "outline"} size="sm" onClick={handleSeed} disabled={seeding}>
          <RefreshCw className={`h-4 w-4 mr-1.5 ${seeding ? "animate-spin" : ""}`} />
          {seeding
            ? "Repairing…"
            : page === "home"
              ? showSeedBanner
                ? `Add missing sections${missingHomeCount ? ` (${missingHomeCount})` : ""}`
                : "Repair sections"
              : showSeedBanner
                ? "Create page sections"
                : "Repair sections"}
        </Button>
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

          {isError && (
            <Card className="p-5 mb-4 text-sm border-destructive/40 bg-destructive/5">
              <p className="font-medium text-foreground mb-1">Could not load page sections</p>
              <p className="text-muted-foreground mb-3">
                {loadError instanceof Error ? loadError.message : "Unknown error talking to the database."}
                {" "}If this keeps happening, confirm you signed in with the owner account and that Supabase env vars are set on Vercel.
              </p>
              <Button onClick={() => void refetch()} size="sm" variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </Card>
          )}

          {showSeedBanner && !isError && (
            <Card className="p-5 mb-4 text-sm border-primary/30 bg-primary-soft/30">
              <p className="font-medium text-foreground mb-1">
                {page === "home"
                  ? heroNeedsRepair && missingHomeCount === 0
                    ? "Hero section needs a field repair"
                    : "Home page is missing editable sections"
                  : "This page has no editable sections yet"}
              </p>
              <p className="text-muted-foreground mb-3">
                {page === "home"
                  ? `Only ${sections?.length ?? 0} of ${HOME_SECTION_KEYS.length} sections exist in the database (e.g. just Hero). Click the button to add Categories, Latest Diaries, Trending, Best Deals, etc. Existing edits are kept.`
                  : "Click the button to create default fields you can edit. Existing content is never overwritten."}
              </p>
              <Button onClick={handleSeed} disabled={seeding} size="sm">
                <RefreshCw className={`w-4 h-4 mr-2 ${seeding ? "animate-spin" : ""}`} />
                {seeding ? "Working…" : "Add / repair sections"}
              </Button>
            </Card>
          )}

          {sections && sections.length === 0 && !isLoading && !isError && (
            <Card className="p-8 text-center text-sm text-muted-foreground">
              No sections yet. Use <strong>Add / repair sections</strong> above.
            </Card>
          )}

          <Accordion type="multiple" defaultValue={sections?.slice(0, 2).map((s) => s.id)} className="space-y-3">
            {sections?.map((section) => (
              <SectionEditor
                key={section.id}
                section={normalizeSectionForEditor(section)}
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

          <GenericContentEditor
            content={draft.content}
            sectionKey={section.section_key}
            onChange={patchContent}
          />
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

function GenericContentEditor({
  content,
  sectionKey,
  onChange,
}: {
  content: Record<string, any>;
  sectionKey: string;
  onChange: (patch: Record<string, any>) => void;
}) {
  // Home → categories ("Our Products" carousel): dedicated card editor.
  // Always show items even if the DB row only has a legacy note/heading.
  if (sectionKey === "categories") {
    const rawItems = Array.isArray(content.items) ? content.items : [];
    const items: CategoryCarouselItem[] =
      rawItems.length > 0
        ? rawItems.map((it: Record<string, any>, i: number) => normalizeCategoryItem(it, i))
        : defaultCategoryItems();

    return (
      <div className="space-y-4">
        <div>
          <Label className="mb-2 block">Section heading</Label>
          <Input
            value={content.heading ?? "Our Products"}
            onChange={(e) => onChange({ heading: e.target.value, items })}
            placeholder="Our Products"
          />
        </div>
        <CategoryItemsEditor
          value={items}
          onChange={(next) => {
            // Drop legacy note when editing items; keep heading.
            const { note: _drop, ...rest } = content;
            onChange({ ...rest, heading: content.heading ?? "Our Products", items: next });
          }}
        />
      </div>
    );
  }

  // Home → best_deals ("Latest 2026 Diaries"): editable title + up to 4 catalog picks.
  if (sectionKey === "best_deals") {
    const items: { productId: string }[] = Array.isArray(content.items)
      ? content.items
          .map((it: any) =>
            typeof it?.productId === "string" ? { productId: it.productId } : null,
          )
          .filter((x): x is { productId: string } => !!x)
      : [];

    return (
      <div className="space-y-4">
        <div>
          <Label className="mb-2 block">Section title</Label>
          <Input
            value={content.heading ?? "Latest 2026 Diaries"}
            onChange={(e) => onChange({ heading: e.target.value, items })}
            placeholder="Latest 2026 Diaries"
          />
          <p className="text-xs text-muted-foreground mt-1.5">
            Shown as the heading above the product grid on the home page.
          </p>
        </div>
        <div>
          <Label className="mb-2 block">
            Products <span className="text-muted-foreground font-normal">(up to 4)</span>
          </Label>
          <p className="text-xs text-muted-foreground mb-2">
            Pick from the full catalog (products and diaries). Order is the display order.
          </p>
          <ProductPicker
            value={items}
            onChange={(next) =>
              onChange({
                heading: content.heading ?? "Latest 2026 Diaries",
                items: next,
              })
            }
            max={4}
          />
        </div>
      </div>
    );
  }

  // Home → popular ("Trending Diary Giftsets"): editable title + up to 5 catalog picks.
  if (sectionKey === "popular") {
    const items: { productId: string }[] = Array.isArray(content.items)
      ? content.items
          .map((it: any) =>
            typeof it?.productId === "string" ? { productId: it.productId } : null,
          )
          .filter((x): x is { productId: string } => !!x)
      : [];

    return (
      <div className="space-y-4">
        <div>
          <Label className="mb-2 block">Section title</Label>
          <Input
            value={content.heading ?? "Trending Diary Giftsets"}
            onChange={(e) => onChange({ heading: e.target.value, items })}
            placeholder="Trending Diary Giftsets"
          />
          <p className="text-xs text-muted-foreground mt-1.5">
            Shown as the heading above this product row on the home page.
          </p>
        </div>
        <div>
          <Label className="mb-2 block">
            Products <span className="text-muted-foreground font-normal">(up to 5)</span>
          </Label>
          <p className="text-xs text-muted-foreground mb-2">
            Pick from the full catalog (products and diaries). Order is the display order.
          </p>
          <ProductPicker
            value={items}
            onChange={(next) =>
              onChange({
                heading: content.heading ?? "Trending Diary Giftsets",
                items: next,
              })
            }
            max={5}
          />
        </div>
      </div>
    );
  }

  // Home → tabbed best deals ("Todays Best Deals for you!"): title + named tabs of up to 8 products.
  // DB may use tabbed_products (current) or best_deals_tabbed (legacy migration key).
  if (sectionKey === "tabbed_products" || sectionKey === "best_deals_tabbed") {
    const tabs: { name: string; productIds: string[] }[] = Array.isArray(content.tabs)
      ? content.tabs.map((t: any) => ({
          name: typeof t?.name === "string" ? t.name : "Tab",
          productIds: Array.isArray(t?.productIds)
            ? t.productIds.filter((id: unknown): id is string => typeof id === "string")
            : [],
        }))
      : [];

    return (
      <div className="space-y-4">
        <div>
          <Label className="mb-2 block">Section title</Label>
          <Input
            value={content.heading ?? "Todays Best Deals for you!"}
            onChange={(e) => onChange({ heading: e.target.value, tabs })}
            placeholder="Todays Best Deals for you!"
          />
          <p className="text-xs text-muted-foreground mt-1.5">
            Heading above the tabbed product grid on the home page.
          </p>
        </div>
        <div>
          <Label className="mb-2 block">
            Dropdown tabs{" "}
            <span className="text-muted-foreground font-normal">(name + up to 8 products each)</span>
          </Label>
          <p className="text-xs text-muted-foreground mb-2">
            Create tabs (e.g. Corporate Gift Set), then pick products from the full catalog for each.
          </p>
          <TabManager
            value={tabs}
            onChange={(next) =>
              onChange({
                heading: content.heading ?? "Todays Best Deals for you!",
                tabs: next,
              })
            }
            maxProductsPerTab={8}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {Object.entries(content).map(([key, value]) => (
        <FieldEditor
          key={key}
          fieldKey={key}
          value={value}
          sectionKey={sectionKey}
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
  sectionKey,
}: {
  fieldKey: string;
  value: any;
  onChange: (next: any) => void;
  sectionKey?: string;
}) {
  const label = prettyKey(fieldKey);

  // categories items → dedicated carousel card editor (also handled at section level).
  if (sectionKey === "categories" && fieldKey === "items" && Array.isArray(value)) {
    const items = value.map((it: Record<string, any>, i: number) => normalizeCategoryItem(it, i));
    return <CategoryItemsEditor value={items} onChange={onChange} />;
  }

  // ponytail: best_deals and popular sections use the product picker for items,
  // so the admin can pick from the products table. Caps are per-section.
  if (sectionKey === "best_deals" && fieldKey === "items" && Array.isArray(value)) {
    return (
      <div>
        <Label className="mb-2 block">{label} <span className="text-muted-foreground font-normal">(up to 4)</span></Label>
        <ProductPicker value={value} onChange={onChange} max={4} />
      </div>
    );
  }

  if (sectionKey === "popular" && fieldKey === "items" && Array.isArray(value)) {
    return (
      <div>
        <Label className="mb-2 block">{label} <span className="text-muted-foreground font-normal">(up to 5)</span></Label>
        <ProductPicker value={value} onChange={onChange} max={5} />
      </div>
    );
  }

  // Tabbed best-deals: list of { name, productIds } — also handled at section level.
  if (
    (sectionKey === "best_deals_tabbed" || sectionKey === "tabbed_products") &&
    fieldKey === "tabs" &&
    Array.isArray(value)
  ) {
    return (
      <div>
        <Label className="mb-2 block">{label} <span className="text-muted-foreground font-normal">(up to 8 products per tab)</span></Label>
        <TabManager value={value} onChange={onChange} maxProductsPerTab={8} />
      </div>
    );
  }

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
