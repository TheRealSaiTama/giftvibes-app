import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/admin/admin-shell";
import { saveDiary, deleteDiary } from "@/lib/admin.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { MediaPicker } from "@/components/admin/media-picker";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/diaries")({
  component: DiariesPage,
});

type Diary = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  min_price: number | null;
  max_price: number | null;
  category: string | null;
  tags: string[];
  color: string | null;
  size: string | null;
  pages: number | null;
  cover_type: string | null;
  image_url: string | null;
  featured: boolean;
  enabled: boolean;
};

const empty: Diary = {
  id: "", slug: "", name: "", description: "", min_price: null, max_price: null,
  category: "", tags: [], color: "", size: "", pages: null, cover_type: "",
  image_url: "", featured: false, enabled: true,
};

function DiariesPage() {
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Diary | null>(null);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery<Diary[]>({
    queryKey: ["diaries-admin"],
    queryFn: async () => {
      const { data, error } = await supabase.from("diaries").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Diary[];
    },
  });

  const filtered = (data ?? []).filter((d) => !search || d.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <PageHeader title="Diaries" description="Diary catalog with cover, pages, size and colour metadata.">
        <Button onClick={() => setEditing({ ...empty })}>
          <Plus className="h-4 w-4 mr-1.5" /> New diary
        </Button>
      </PageHeader>

      <div className="flex items-center gap-2 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search diaries" className="pl-8" />
        </div>
        <span className="text-xs text-muted-foreground ml-auto">{filtered.length} diaries</span>
      </div>

      <div className="gv-panel overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface border-b border-border">
            <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-2.5 w-14"></th>
              <th className="px-2 py-2.5">Diary</th>
              <th className="px-2 py-2.5">Size</th>
              <th className="px-2 py-2.5">Cover</th>
              <th className="px-2 py-2.5">Price</th>
              <th className="px-2 py-2.5">Status</th>
              <th className="px-4 py-2.5 w-16"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={7} className="py-10 text-center text-muted-foreground">Loading…</td></tr>}
            {!isLoading && filtered.length === 0 && <tr><td colSpan={7} className="py-10 text-center text-muted-foreground">No diaries yet.</td></tr>}
            {filtered.map((d) => (
              <tr key={d.id} className="border-b border-border last:border-0 hover:bg-surface/60">
                <td className="px-4 py-2.5"><div className="h-9 w-9 rounded bg-surface-2 overflow-hidden">{d.image_url && <img src={d.image_url} alt="" className="h-full w-full object-cover" />}</div></td>
                <td className="px-2 py-2.5"><div className="font-medium">{d.name}</div><div className="text-xs text-muted-foreground font-mono">/{d.slug}</div></td>
                <td className="px-2 py-2.5 text-muted-foreground">{d.size ?? "—"}</td>
                <td className="px-2 py-2.5 text-muted-foreground">{d.cover_type ?? "—"}</td>
                <td className="px-2 py-2.5 font-mono text-xs">{d.min_price != null ? `₹${d.min_price}${d.max_price ? " – ₹" + d.max_price : ""}` : "—"}</td>
                <td className="px-2 py-2.5">{d.enabled ? <span className="gv-chip bg-success/10 text-success border-success/20">Live</span> : <span className="gv-chip">Hidden</span>}</td>
                <td className="px-4 py-2.5 text-right"><Button variant="ghost" size="icon" onClick={() => setEditing(d)}><Pencil className="h-4 w-4" /></Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Sheet open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <SheetContent className="sm:max-w-xl overflow-y-auto">
          <SheetHeader><SheetTitle>{editing?.id ? "Edit diary" : "New diary"}</SheetTitle></SheetHeader>
          {editing && (
            <DiaryForm
              diary={editing}
              onClose={() => setEditing(null)}
              onSaved={() => { qc.invalidateQueries({ queryKey: ["diaries-admin"] }); setEditing(null); }}
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

const STOREFRONT_CATEGORIES = [
  "CORPORATE GIFT SETS",
  "NEW YEAR DIARY",
  "LEATHER GIFT ITEMS",
  "LEATHER BAGS",
  "JUTE BAGS",
  "BOTTLES GIFT SET",
  "POWER BANK DIARIES",
  "PEN STANDS",
  "PROMOTIONAL UMBRELLAS",
  "CUSTOMISED DIARY & NOTE BOOKS",
  "CALENDARS",
  "EXHIBITION VISITOR'S GIFT IDEAS",
];

const STOREFRONT_SUBCATEGORIES: Record<string, string[]> = {
  "CORPORATE GIFT SETS": ["Diary & Pen Sets", "Calendar Sets", "Giftsets", "General / Others"],
  "NEW YEAR DIARY": ["Eco-Friendly & Green", "Leather Diaries", "Hard Bound Diaries", "Planners & Themes", "Economy & Regular", "General / Others"],
  "LEATHER GIFT ITEMS": ["Bags & Portfolios", "Leather Accessories"],
  "LEATHER BAGS": ["Executive Bags"],
  "JUTE BAGS": ["Eco Jute Bags"],
  "BOTTLES GIFT SET": ["Bottle & Flask Sets"],
  "POWER BANK DIARIES": ["Tech Power Bank Diaries"],
  "PEN STANDS": ["Desktop Accessories"],
  "PROMOTIONAL UMBRELLAS": ["Umbrellas"],
  "CUSTOMISED DIARY & NOTE BOOKS": ["Eco-Friendly & Green", "Leather Diaries", "Hard Bound Diaries", "Planners & Themes", "Economy & Regular", "General / Others"],
  "CALENDARS": ["Desktop & Wall Calendars"],
  "EXHIBITION VISITOR'S GIFT IDEAS": ["Giveaways & Promos"],
};

function DiaryForm({ diary, onClose, onSaved }: { diary: Diary; onClose: () => void; onSaved: () => void }) {
  const [v, setV] = useState(diary);
  const [saving, setSaving] = useState(false);
  const [catSearch, setCatSearch] = useState("");
  const runSave = useServerFn(saveDiary);
  const runDelete = useServerFn(deleteDiary);
  const s = <K extends keyof Diary>(k: K, val: Diary[K]) => setV((p) => ({ ...p, [k]: val }));

  async function handleSave() {
    setSaving(true);
    try {
      await runSave({
        data: {
          id: diary.id || undefined,
          values: {
            slug: v.slug || slugify(v.name),
            name: v.name,
            description: v.description || null,
            min_price: v.min_price, max_price: v.max_price,
            category: v.category || null, tags: v.tags,
            color: v.color || null, size: v.size || null,
            pages: v.pages, cover_type: v.cover_type || null,
            image_url: v.image_url || null,
            featured: v.featured, enabled: v.enabled,
          },
        },
      });
      toast.success("Saved");
      onSaved();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally { setSaving(false); }
  }

  async function handleDelete() {
    if (!diary.id) return onClose();
    if (!confirm(`Delete "${diary.name}"?`)) return;
    try { await runDelete({ data: { id: diary.id } }); toast.success("Deleted"); onSaved(); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Delete failed"); }
  }

  // Category multi-select
  const selectedCats = v.category
    ? v.category.split(",").map((c) => c.trim()).filter(Boolean)
    : [];

  function toggleCat(cat: string) {
    const norm = cat.trim();
    const next = selectedCats.includes(norm)
      ? selectedCats.filter((c) => c !== norm)
      : [...selectedCats, norm];
    s("category", next.join(", "));
  }

  const filteredCats = catSearch
    ? STOREFRONT_CATEGORIES.filter((c) => c.toLowerCase().includes(catSearch.toLowerCase()))
    : STOREFRONT_CATEGORIES;

  // Subcategory multi-select
  const availableSubcats = Array.from(new Set(
    selectedCats.flatMap(cat => STOREFRONT_SUBCATEGORIES[cat.toUpperCase()] || [])
  ));

  const selectedSubcats = (v.tags || []).filter(t => availableSubcats.includes(t));

  function toggleSubcat(subcat: string) {
    const nextTags = (v.tags || []).includes(subcat)
      ? (v.tags || []).filter(t => t !== subcat)
      : [...(v.tags || []), subcat];
    s("tags", nextTags);
  }

  return (
    <div className="space-y-5 pt-5">
      <div><Label>Name</Label><Input value={v.name} onChange={(e) => s("name", e.target.value)} className="mt-1.5" /></div>
      <div><Label>Slug</Label><Input value={v.slug} onChange={(e) => s("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))} placeholder={slugify(v.name)} className="mt-1.5 font-mono text-xs" /></div>
      <div><Label>Image</Label><div className="mt-1.5"><MediaPicker value={v.image_url ?? ""} onChange={(url) => s("image_url", url)} /></div></div>
      <div><Label>Description</Label><Textarea rows={4} value={v.description ?? ""} onChange={(e) => s("description", e.target.value)} className="mt-1.5" /></div>
      
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Min price (₹)</Label><Input type="number" value={v.min_price ?? ""} onChange={(e) => s("min_price", e.target.value === "" ? null : Number(e.target.value))} className="mt-1.5" /></div>
        <div><Label>Max price (₹)</Label><Input type="number" value={v.max_price ?? ""} onChange={(e) => s("max_price", e.target.value === "" ? null : Number(e.target.value))} className="mt-1.5" /></div>
        
        <div><Label>Size</Label><Input value={v.size ?? ""} onChange={(e) => s("size", e.target.value)} placeholder="A5, B5…" className="mt-1.5" /></div>
        <div><Label>Colour</Label><Input value={v.color ?? ""} onChange={(e) => s("color", e.target.value)} className="mt-1.5" /></div>
        <div><Label>Cover type</Label><Input value={v.cover_type ?? ""} onChange={(e) => s("cover_type", e.target.value)} placeholder="PU leather…" className="mt-1.5" /></div>
        <div><Label>Pages</Label><Input type="number" value={v.pages ?? ""} onChange={(e) => s("pages", e.target.value === "" ? null : Number(e.target.value))} className="mt-1.5" /></div>
      </div>

      {/* Category selector */}
      <div>
        <Label>Category</Label>
        <p className="text-xs text-muted-foreground mt-0.5 mb-2">Select one or more categories this item belongs to.</p>

        {/* Selected pills */}
        {selectedCats.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {selectedCats.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => toggleCat(cat)}
                className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-primary text-primary-foreground hover:bg-primary/80 transition-colors"
              >
                {cat}
                <span className="ml-0.5 opacity-70">×</span>
              </button>
            ))}
          </div>
        )}

        {/* Search + list */}
        <div className="rounded-md border border-border overflow-hidden">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={catSearch}
              onChange={(e) => setCatSearch(e.target.value)}
              placeholder="Filter categories…"
              className="pl-8 border-0 border-b border-border rounded-none focus-visible:ring-0 text-xs h-8"
            />
          </div>
          <div className="max-h-48 overflow-y-auto divide-y divide-border">
            {filteredCats.map((cat) => {
              const checked = selectedCats.includes(cat);
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => toggleCat(cat)}
                  className={
                    "w-full flex items-center gap-2.5 px-3 py-2 text-xs text-left transition-colors " +
                    (checked
                      ? "bg-primary-soft text-primary font-medium"
                      : "hover:bg-surface/60 text-foreground")
                  }
                >
                  <span
                    className={
                      "h-3.5 w-3.5 rounded border flex items-center justify-center shrink-0 " +
                      (checked ? "bg-primary border-primary text-primary-foreground" : "border-border")
                    }
                  >
                    {checked && (
                      <svg viewBox="0 0 12 12" fill="none" className="h-2.5 w-2.5">
                        <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </span>
                  {cat}
                </button>
              );
            })}
            {filteredCats.length === 0 && (
              <div className="px-3 py-3 text-xs text-muted-foreground text-center">No categories match</div>
            )}
          </div>
        </div>

        {/* Raw value override */}
        <details className="mt-2">
          <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">Edit raw value</summary>
          <Input
            value={v.category ?? ""}
            onChange={(e) => s("category", e.target.value)}
            className="mt-1.5 font-mono text-xs"
            placeholder="comma-separated categories"
          />
        </details>
      </div>

      {availableSubcats.length > 0 && (
        <div>
          <Label>Sub Category</Label>
          <p className="text-xs text-muted-foreground mt-0.5 mb-2">Select one or more subcategories for this item.</p>

          {/* Selected pills */}
          {selectedSubcats.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {selectedSubcats.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => toggleSubcat(cat)}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-amber-500 text-amber-950 hover:bg-amber-500/80 transition-colors"
                >
                  {cat}
                  <span className="ml-0.5 opacity-70">×</span>
                </button>
              ))}
            </div>
          )}

          {/* List */}
          <div className="rounded-md border border-border overflow-hidden">
            <div className="max-h-48 overflow-y-auto divide-y divide-border">
              {availableSubcats.map((cat) => {
                const checked = selectedSubcats.includes(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleSubcat(cat)}
                    className={
                      "w-full flex items-center gap-2.5 px-3 py-2 text-xs text-left transition-colors " +
                      (checked
                        ? "bg-amber-500/10 text-amber-500 font-medium"
                        : "hover:bg-surface/60 text-foreground")
                    }
                  >
                    <span
                      className={
                        "h-3.5 w-3.5 rounded border flex items-center justify-center shrink-0 " +
                        (checked ? "bg-amber-500 border-amber-500 text-amber-950" : "border-border")
                      }
                    >
                      {checked && (
                        <svg viewBox="0 0 12 12" fill="none" className="h-2.5 w-2.5">
                          <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </span>
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div>
        <Label>Tags (comma-separated)</Label>
        <Input value={v.tags.join(", ")} onChange={(e) => s("tags", e.target.value.split(",").map((t) => t.trim()).filter(Boolean))} className="mt-1.5" />
      </div>
      
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 text-sm"><Switch checked={v.featured} onCheckedChange={(val) => s("featured", val)} /> Featured</label>
        <label className="flex items-center gap-2 text-sm"><Switch checked={v.enabled} onCheckedChange={(val) => s("enabled", val)} /> Live on site</label>
      </div>
      
      <div className="flex items-center justify-between pt-4 border-t border-border">
        {diary.id ? <Button variant="ghost" onClick={handleDelete} className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4 mr-1.5" /> Delete</Button> : <span />}
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving || !v.name}>{saving ? "Saving…" : "Save diary"}</Button>
        </div>
      </div>
    </div>
  );
}

function slugify(s: string) { return s.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-"); }
