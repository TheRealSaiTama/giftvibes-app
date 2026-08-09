import { useState } from "react";
import { ProductPicker } from "@/components/admin/product-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";

type Tab = { name: string; productIds: string[] };

// ponytail: shape matches what the storefront reads in tabbed-products.tsx.
// productIds instead of productId so the picker shape stays the same as the
// single-pick section; the storefront does the .includes() lookup.
export function TabManager({
  value,
  onChange,
  maxProductsPerTab = 8,
}: {
  value: Tab[];
  onChange: (next: Tab[]) => void;
  maxProductsPerTab?: number;
}) {
  const [renamingIndex, setRenamingIndex] = useState<number | null>(null);

  function addTab() {
    const baseName = `Tab ${value.length + 1}`;
    const newTab: Tab = { name: baseName, productIds: [] };
    onChange([...value, newTab]);
    setRenamingIndex(value.length);
  }

  function removeTab(index: number) {
    onChange(value.filter((_, i) => i !== index));
    if (renamingIndex === index) setRenamingIndex(null);
  }

  function updateTabName(index: number, name: string) {
    const next = [...value];
    next[index] = { ...next[index], name };
    onChange(next);
  }

  function updateTabProducts(index: number, productIds: string[]) {
    const next = [...value];
    next[index] = { ...next[index], productIds };
    onChange(next);
  }

  return (
    <div className="space-y-4">
      {value.length === 0 && (
        <div className="rounded-md border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
          No dropdown tabs yet. Add a tab, name it, then choose up to {maxProductsPerTab} products from the catalog.
        </div>
      )}

      {value.map((tab, i) => (
        <div key={i} className="rounded-md border border-border bg-surface/40 p-3 space-y-3">
          <div className="flex items-center gap-2">
            <Label htmlFor={`tab-name-${i}`} className="text-xs uppercase tracking-wider text-muted-foreground shrink-0">
              Tab name
            </Label>
            <Input
              id={`tab-name-${i}`}
              value={tab.name}
              onChange={(e) => updateTabName(i, e.target.value)}
              onFocus={() => setRenamingIndex(i)}
              placeholder="e.g. Corporate Gift Set"
              className="h-8"
              autoFocus={renamingIndex === i}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive hover:text-destructive shrink-0"
              onClick={() => removeTab(i)}
              title="Remove tab"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>

          <div>
            <div className="text-xs text-muted-foreground mb-2">
              Products from catalog ({tab.productIds.length}/{maxProductsPerTab})
            </div>
            <ProductPicker
              value={tab.productIds.map((id) => ({ productId: id }))}
              onChange={(next) => updateTabProducts(i, next.map((n) => n.productId))}
              max={maxProductsPerTab}
            />
          </div>
        </div>
      ))}

      <Button type="button" variant="outline" size="sm" onClick={addTab}>
        <Plus className="h-3.5 w-3.5 mr-1.5" />
        Add tab
      </Button>
    </div>
  );
}
