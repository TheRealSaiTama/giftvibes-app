import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/admin/admin-shell";
import { saveProduct, deleteProduct } from "@/lib/admin.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { MediaPicker } from "@/components/admin/media-picker";
import { Plus, Pencil, Trash2, Search, Star } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/products")({
  component: ProductsPage,
});

type Product = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  min_price: number | null;
  max_price: number | null;
  category: string | null;
  tags: string[];
  image_url: string | null;
  featured: boolean;
  enabled: boolean;
};

const empty: Product = {
  id: "",
  slug: "",
  name: "",
  description: "",
  min_price: null,
  max_price: null,
  category: "",
  tags: [],
  image_url: "",
  featured: false,
  enabled: true,
};

function ProductsPage() {
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Product | null>(null);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery<Product[]>({
    queryKey: ["products-admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Product[];
    },
  });

  const filtered = (data ?? []).filter(
    (p) =>
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div>
      <PageHeader title="Products" description="Everything shown in the catalog and product-detail pages.">
        <Button onClick={() => setEditing({ ...empty })}>
          <Plus className="h-4 w-4 mr-1.5" />
          New product
        </Button>
      </PageHeader>

      <div className="flex items-center gap-2 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or category"
            className="pl-8"
          />
        </div>
        <span className="text-xs text-muted-foreground ml-auto">{filtered.length} products</span>
      </div>

      <div className="gv-panel overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface border-b border-border">
            <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-2.5 w-14"></th>
              <th className="px-2 py-2.5">Product</th>
              <th className="px-2 py-2.5">Category</th>
              <th className="px-2 py-2.5">Price range</th>
              <th className="px-2 py-2.5">Status</th>
              <th className="px-4 py-2.5 w-24"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={6} className="py-10 text-center text-muted-foreground">
                  Loading…
                </td>
              </tr>
            )}
            {!isLoading && filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="py-10 text-center text-muted-foreground">
                  No products yet. Click "New product" to add one.
                </td>
              </tr>
            )}
            {filtered.map((p) => (
              <tr key={p.id} className="border-b border-border last:border-0 hover:bg-surface/60">
                <td className="px-4 py-2.5">
                  <div className="h-9 w-9 rounded bg-surface-2 overflow-hidden">
                    {p.image_url && <img src={p.image_url} alt="" className="h-full w-full object-cover" />}
                  </div>
                </td>
                <td className="px-2 py-2.5">
                  <div className="font-medium flex items-center gap-1.5">
                    {p.name}
                    {p.featured && <Star className="h-3 w-3 fill-primary text-primary" />}
                  </div>
                  <div className="text-xs text-muted-foreground font-mono">/{p.slug}</div>
                </td>
                <td className="px-2 py-2.5 text-muted-foreground">{p.category ?? "—"}</td>
                <td className="px-2 py-2.5 font-mono text-xs">
                  {p.min_price != null && p.max_price != null
                    ? `₹${p.min_price} – ₹${p.max_price}`
                    : p.min_price != null
                      ? `from ₹${p.min_price}`
                      : "—"}
                </td>
                <td className="px-2 py-2.5">
                  {p.enabled ? (
                    <span className="gv-chip bg-success/10 text-success border-success/20">Live</span>
                  ) : (
                    <span className="gv-chip">Hidden</span>
                  )}
                </td>
                <td className="px-4 py-2.5 text-right">
                  <Button variant="ghost" size="icon" onClick={() => setEditing(p)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Sheet open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <SheetContent className="sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{editing?.id ? "Edit product" : "New product"}</SheetTitle>
          </SheetHeader>
          {editing && (
            <ProductForm
              product={editing}
              onClose={() => setEditing(null)}
              onSaved={() => {
                qc.invalidateQueries({ queryKey: ["products-admin"] });
                setEditing(null);
              }}
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function ProductForm({
  product,
  onClose,
  onSaved,
}: {
  product: Product;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [values, setValues] = useState(product);
  const [saving, setSaving] = useState(false);
  const runSave = useServerFn(saveProduct);
  const runDelete = useServerFn(deleteProduct);

  function set<K extends keyof Product>(key: K, v: Product[K]) {
    setValues((prev) => ({ ...prev, [key]: v }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      await runSave({
        data: {
          id: product.id || undefined,
          values: {
            slug: values.slug || slugify(values.name),
            name: values.name,
            description: values.description || null,
            min_price: values.min_price,
            max_price: values.max_price,
            category: values.category || null,
            tags: values.tags,
            image_url: values.image_url || null,
            featured: values.featured,
            enabled: values.enabled,
          },
        },
      });
      toast.success("Saved");
      onSaved();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!product.id) return onClose();
    if (!confirm(`Delete "${product.name}"?`)) return;
    try {
      await runDelete({ data: { id: product.id } });
      toast.success("Deleted");
      onSaved();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Delete failed");
    }
  }

  return (
    <div className="space-y-5 pt-5">
      <div>
        <Label>Name</Label>
        <Input value={values.name} onChange={(e) => set("name", e.target.value)} className="mt-1.5" />
      </div>
      <div>
        <Label>Slug</Label>
        <Input
          value={values.slug}
          onChange={(e) => set("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
          placeholder={slugify(values.name)}
          className="mt-1.5 font-mono text-xs"
        />
      </div>
      <div>
        <Label>Image</Label>
        <div className="mt-1.5">
          <MediaPicker value={values.image_url ?? ""} onChange={(v) => set("image_url", v)} />
        </div>
      </div>
      <div>
        <Label>Description</Label>
        <Textarea rows={4} value={values.description ?? ""} onChange={(e) => set("description", e.target.value)} className="mt-1.5" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Min price (₹)</Label>
          <Input type="number" value={values.min_price ?? ""} onChange={(e) => set("min_price", e.target.value === "" ? null : Number(e.target.value))} className="mt-1.5" />
        </div>
        <div>
          <Label>Max price (₹)</Label>
          <Input type="number" value={values.max_price ?? ""} onChange={(e) => set("max_price", e.target.value === "" ? null : Number(e.target.value))} className="mt-1.5" />
        </div>
      </div>
      <div>
        <Label>Category</Label>
        <Input value={values.category ?? ""} onChange={(e) => set("category", e.target.value)} className="mt-1.5" />
      </div>
      <div>
        <Label>Tags (comma-separated)</Label>
        <Input
          value={values.tags.join(", ")}
          onChange={(e) => set("tags", e.target.value.split(",").map((t) => t.trim()).filter(Boolean))}
          className="mt-1.5"
        />
      </div>
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 text-sm">
          <Switch checked={values.featured} onCheckedChange={(v) => set("featured", v)} /> Featured
        </label>
        <label className="flex items-center gap-2 text-sm">
          <Switch checked={values.enabled} onCheckedChange={(v) => set("enabled", v)} /> Live on site
        </label>
      </div>
      <div className="flex items-center justify-between pt-4 border-t border-border">
        {product.id ? (
          <Button variant="ghost" onClick={handleDelete} className="text-destructive hover:text-destructive">
            <Trash2 className="h-4 w-4 mr-1.5" /> Delete
          </Button>
        ) : (
          <span />
        )}
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving || !values.name}>
            {saving ? "Saving…" : "Save product"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");
}
