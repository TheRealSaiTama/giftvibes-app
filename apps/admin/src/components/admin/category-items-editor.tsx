import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MediaPicker } from "@/components/admin/media-picker";
import { Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react";

/** Built-in storefront categories — same set as the Categories catalog page. */
export const STOREFRONT_CATEGORY_OPTIONS = [
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
] as const;

export type CategoryCarouselItem = {
  name: string;
  subtitle: string;
  image_url: string;
  bgColor: string;
  alt: string;
  href: string;
  sort_order: number;
};

const DEFAULT_BG = "#124559";

/** Normalize legacy `image` key and missing fields. */
export function normalizeCategoryItem(
  raw: Record<string, any>,
  index: number,
): CategoryCarouselItem {
  const image_url = String(raw.image_url || raw.image || "");
  return {
    name: String(raw.name || ""),
    subtitle: String(raw.subtitle || ""),
    image_url,
    bgColor: String(raw.bgColor || DEFAULT_BG),
    alt: String(raw.alt || raw.name || ""),
    href: String(raw.href || ""),
    sort_order: typeof raw.sort_order === "number" ? raw.sort_order : index + 1,
  };
}

export function defaultCategoryItems(): CategoryCarouselItem[] {
  return STOREFRONT_CATEGORY_OPTIONS.map((name, i) => ({
    name,
    subtitle: "",
    image_url: "",
    bgColor: DEFAULT_BG,
    alt: name,
    href: "",
    sort_order: i + 1,
  }));
}

function loadCustomCategoryNames(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = JSON.parse(localStorage.getItem("gv_custom_categories") || "[]");
    if (!Array.isArray(raw)) return [];
    return raw
      .map((item: unknown) =>
        typeof item === "string" ? item : (item as { name?: string })?.name,
      )
      .filter((n): n is string => typeof n === "string" && n.trim().length > 0);
  } catch {
    return [];
  }
}

function emptyItem(sort_order: number): CategoryCarouselItem {
  return {
    name: "",
    subtitle: "",
    image_url: "",
    bgColor: DEFAULT_BG,
    alt: "",
    href: "",
    sort_order,
  };
}

/**
 * Editor for home → categories → items ("Our Products" carousel).
 * Tile ORDER and which folders appear come from Products folders.
 * Photos/subtitles here are matched by category name (SBI gets a tile
 * even without a photo).
 */
export function CategoryItemsEditor({
  value,
  onChange,
}: {
  value: CategoryCarouselItem[];
  onChange: (next: CategoryCarouselItem[]) => void;
}) {
  const categoryOptions = useMemo(() => {
    const custom = loadCustomCategoryNames();
    return Array.from(new Set([...STOREFRONT_CATEGORY_OPTIONS, ...custom, ...value.map((v) => v.name).filter(Boolean)]));
  }, [value]);

  const sorted = useMemo(
    () =>
      value
        .map((item, i) => ({ item, i }))
        .sort((a, b) => (a.item.sort_order || 0) - (b.item.sort_order || 0)),
    [value],
  );

  function updateAt(index: number, patch: Partial<CategoryCarouselItem>) {
    const next = value.map((item, i) => (i === index ? { ...item, ...patch } : item));
    onChange(next);
  }

  function removeAt(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  function move(index: number, dir: -1 | 1) {
    const ordered = [...sorted];
    const pos = ordered.findIndex((x) => x.i === index);
    const swap = pos + dir;
    if (swap < 0 || swap >= ordered.length) return;
    // Swap sort_order values
    const a = ordered[pos].item;
    const b = ordered[swap].item;
    const next = value.map((item, i) => {
      if (i === ordered[pos].i) return { ...item, sort_order: b.sort_order };
      if (i === ordered[swap].i) return { ...item, sort_order: a.sort_order };
      return item;
    });
    onChange(next);
  }

  function addItem() {
    const maxOrder = value.reduce((m, it) => Math.max(m, it.sort_order || 0), 0);
    onChange([...value, emptyItem(maxOrder + 1)]);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <Label className="block">Category cards</Label>
          <p className="text-xs text-muted-foreground mt-0.5">
            Our Products carousel — cover photo, category, meta text, order, and link.
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={addItem}>
          <Plus className="h-3.5 w-3.5 mr-1" />
          Add card
        </Button>
      </div>

      {sorted.length === 0 && (
        <div className="rounded-md border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          No category cards yet. Add one or re-seed the home sections.
        </div>
      )}

      <div className="space-y-3">
        {sorted.map(({ item, i }, displayIndex) => (
          <div
            key={i}
            className="rounded-md border border-border bg-surface/60 p-3 space-y-3"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="text-xs font-medium text-muted-foreground">
                Card #{displayIndex + 1}
                {item.name ? (
                  <span className="ml-2 font-mono text-foreground/80">{item.name}</span>
                ) : null}
              </div>
              <div className="flex items-center gap-0.5">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  disabled={displayIndex === 0}
                  onClick={() => move(i, -1)}
                  title="Move up"
                >
                  <ChevronUp className="h-3.5 w-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  disabled={displayIndex === sorted.length - 1}
                  onClick={() => move(i, 1)}
                  title="Move down"
                >
                  <ChevronDown className="h-3.5 w-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive hover:text-destructive"
                  onClick={() => removeAt(i)}
                  title="Remove card"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <Label className="text-xs mb-1.5 block">Cover photo</Label>
                <MediaPicker
                  value={item.image_url}
                  onChange={(url) => updateAt(i, { image_url: url })}
                />
              </div>

              <div>
                <Label className="text-xs mb-1.5 block">Category name</Label>
                <Select
                  value={item.name || undefined}
                  onValueChange={(name) =>
                    updateAt(i, {
                      name,
                      alt: item.alt || name,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pick a category…" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-[10px] text-muted-foreground mt-1">
                  From the catalog category list (Categories page + custom).
                </p>
              </div>

              <div>
                <Label className="text-xs mb-1.5 block">Meta text</Label>
                <Input
                  value={item.subtitle}
                  onChange={(e) => updateAt(i, { subtitle: e.target.value })}
                  placeholder="e.g. 120+ Packages Available"
                />
              </div>

              <div>
                <Label className="text-xs mb-1.5 block">Sort order</Label>
                <Input
                  type="number"
                  min={0}
                  value={item.sort_order}
                  onChange={(e) =>
                    updateAt(i, { sort_order: Number(e.target.value) || 0 })
                  }
                />
              </div>

              <div>
                <Label className="text-xs mb-1.5 block">CTA link</Label>
                <Input
                  value={item.href}
                  onChange={(e) => updateAt(i, { href: e.target.value })}
                  placeholder="/shop?category=NEW YEAR DIARY"
                />
                <p className="text-[10px] text-muted-foreground mt-1">
                  Leave blank to use the default shop link for this category.
                </p>
              </div>

              <div className="sm:col-span-2">
                <Label className="text-xs mb-1.5 block">Image alt text</Label>
                <Input
                  value={item.alt}
                  onChange={(e) => updateAt(i, { alt: e.target.value })}
                  placeholder="Describe the cover image for accessibility"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
