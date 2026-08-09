import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Search, X, Plus, Package } from "lucide-react";

type PickerItem = { productId: string };

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  min_price: number | null;
  max_price: number | null;
  category: string | null;
  kind: "product" | "diary";
};

// Full catalog: products + diaries (same directory the Categories admin uses).
async function fetchProductsForPicker(): Promise<ProductRow[]> {
  const [productsRes, diariesRes] = await Promise.all([
    supabase
      .from("products")
      .select("id, name, slug, image_url, min_price, max_price, category")
      .eq("enabled", true)
      .order("name"),
    supabase
      .from("diaries")
      .select("id, name, slug, image_url, min_price, max_price, category")
      .eq("enabled", true)
      .order("name"),
  ]);
  if (productsRes.error) throw productsRes.error;
  if (diariesRes.error) throw diariesRes.error;
  const products: ProductRow[] = (productsRes.data || []).map((p) => ({
    ...(p as Omit<ProductRow, "kind">),
    kind: "product" as const,
  }));
  const diaries: ProductRow[] = (diariesRes.data || []).map((d) => ({
    ...(d as Omit<ProductRow, "kind">),
    kind: "diary" as const,
  }));
  return [...products, ...diaries].sort((a, b) => a.name.localeCompare(b.name));
}

function priceLabel(p: ProductRow): string {
  if (p.min_price != null && p.max_price != null && p.min_price !== p.max_price) {
    return `₹${p.min_price} – ₹${p.max_price}`;
  }
  if (p.min_price != null) return `from ₹${p.min_price}`;
  return "—";
}

export function ProductPicker({
  value,
  onChange,
  max = 4,
}: {
  value: PickerItem[];
  onChange: (next: PickerItem[]) => void;
  max?: number;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const { data: products, isLoading } = useQuery({
    queryKey: ["product-picker-list"],
    queryFn: fetchProductsForPicker,
  });

  const selectedIds = useMemo(() => value.map((v) => v.productId), [value]);
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const selectedProducts = useMemo(
    () =>
      (products || [])
        .filter((p) => selectedSet.has(p.id))
        .sort((a, b) => selectedIds.indexOf(a.id) - selectedIds.indexOf(b.id)),
    [products, selectedSet, selectedIds],
  );

  const filtered = useMemo(() => {
    const all = products || [];
    if (!search.trim()) return all;
    const q = search.toLowerCase();
    return all.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.category || "").toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q),
    );
  }, [products, search]);

  function add(id: string) {
    if (selectedIds.length >= max) return;
    if (selectedSet.has(id)) return;
    onChange([...value, { productId: id }]);
  }

  function remove(id: string) {
    onChange(value.filter((v) => v.productId !== id));
  }

  return (
    <div className="space-y-3">
      {/* Selected chips */}
      {selectedProducts.length > 0 && (
        <div className="space-y-2">
          {selectedProducts.map((p, i) => (
            <div
              key={p.id}
              className="flex items-center gap-3 rounded-md border border-border bg-surface/60 p-2"
            >
              <div className="h-12 w-12 rounded bg-surface-2 overflow-hidden flex items-center justify-center border border-border shrink-0">
                {p.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.image_url} alt={p.name} className="h-full w-full object-cover" />
                ) : (
                  <Package className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{p.name}</div>
                <div className="text-xs text-muted-foreground font-mono flex items-center gap-2">
                  <span>{priceLabel(p)}</span>
                  <span className="uppercase tracking-wider text-[9px] opacity-70">{p.kind}</span>
                </div>
              </div>
              <span className="text-[10px] text-muted-foreground tabular-nums">#{i + 1}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => remove(p.id)}
                title="Remove"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {selectedProducts.length === 0 && (
        <div className="text-xs text-muted-foreground italic px-1">
          No products selected yet.
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            disabled={selectedIds.length >= max}
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            {selectedIds.length >= max
              ? `Max ${max} selected`
              : selectedIds.length === 0
                ? "Choose products"
                : `Add another (${selectedIds.length}/${max})`}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Choose from catalog</DialogTitle>
          </DialogHeader>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products & diaries by name or category…"
              className="pl-8 h-9"
            />
          </div>
          <div className="max-h-80 overflow-y-auto rounded-md border border-border divide-y divide-border">
            {isLoading && (
              <div className="py-6 text-center text-sm text-muted-foreground">Loading…</div>
            )}
            {!isLoading && filtered.length === 0 && (
              <div className="py-6 text-center text-sm text-muted-foreground">No products match.</div>
            )}
            {filtered.map((p) => {
              const isSelected = selectedSet.has(p.id);
              return (
                <div
                  key={p.id}
                  className="flex items-center gap-3 p-2.5"
                >
                  <div className="h-10 w-10 rounded bg-surface-2 overflow-hidden flex items-center justify-center border border-border shrink-0">
                    {p.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.image_url} alt={p.name} className="h-full w-full object-cover" />
                    ) : (
                      <Package className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{p.name}</div>
                    <div className="text-xs text-muted-foreground font-mono flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      <span>{priceLabel(p)}</span>
                      {p.category && (
                        <span className="truncate max-w-[140px] opacity-80">{p.category}</span>
                      )}
                      <span className="uppercase tracking-wider text-[9px] opacity-70">{p.kind}</span>
                    </div>
                  </div>
                  {isSelected ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(p.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <X className="h-3.5 w-3.5 mr-1" />
                      Remove
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => add(p.id)}
                      disabled={selectedIds.length >= max}
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" />
                      Add
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
          <div className="text-xs text-muted-foreground">
            {selectedIds.length} of {max} selected.
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button>Done</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
