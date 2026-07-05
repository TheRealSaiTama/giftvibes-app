import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/admin/admin-shell";
import { saveProduct, deleteProduct, saveDiary, deleteDiary } from "@/lib/admin.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { MediaPicker } from "@/components/admin/media-picker";
import {
  Plus, Pencil, Trash2, Search, Star, ChevronRight, Home,
  Folder, FolderOpen, ArrowLeft, BookOpen, Package
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/products")({
  component: ProductsPage,
});

type CatalogItem = {
  id: string;
  type: "product" | "diary";
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
  // diary specific metadata
  color?: string | null;
  size?: string | null;
  pages?: number | null;
  cover_type?: string | null;
};

const empty: CatalogItem = {
  id: "",
  type: "product",
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
  color: "",
  size: "",
  pages: null,
  cover_type: "",
};

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

/** Normalise a category string for comparison */
function normCat(s: string) {
  return s.trim().toUpperCase().replace(/\s+/g, " ");
}

/** Match products or diaries against a normalized storefront category */
function matchCategory(productCat: string | null, targetCat: string): boolean {
  if (!productCat) return false;
  const targetNorm = targetCat.trim().toUpperCase();
  const productCats = productCat.split(",").map((c) => c.trim().toUpperCase());
  return productCats.some((pc) => {
    if (pc === targetNorm) return true;
    if (pc + "S" === targetNorm || pc === targetNorm + "S") return true;
    if (targetNorm === "CORPORATE GIFT SETS" && pc === "CORPORATE GIFT SET") return true;
    if (targetNorm === "CUSTOMISED DIARY & NOTE BOOKS" && pc.includes("CUSTOMISED DIARY")) return true;
    return false;
  });
}

/** Determine the subcategory mapping dynamically based on tags and product details */
function getSubcategory(item: CatalogItem, category: string): string {
  const categoryNorm = category.trim().toUpperCase();
  
  // First, check if the item has an explicit subcategory tag saved from the dropdown
  const predefined = STOREFRONT_SUBCATEGORIES[categoryNorm];
  if (predefined) {
    const explicitMatch = predefined.find(sub => (item.tags || []).includes(sub));
    if (explicitMatch) return explicitMatch;
  }

  const nameLower = item.name.toLowerCase();
  const tagsLower = (item.tags || []).map((t) => t.toLowerCase());

  const hasKeyword = (keywords: string[]) =>
    keywords.some((k) => nameLower.includes(k) || tagsLower.some((t) => t.includes(k)));

  if (categoryNorm === "CORPORATE GIFT SETS" || categoryNorm === "CORPORATE GIFT SET") {
    if (hasKeyword(["diary and pen", "diary & pen", "pen set"])) return "Diary & Pen Sets";
    if (hasKeyword(["calendar"])) return "Calendar Sets";
    if (hasKeyword(["gift set", "giftset", "combo"])) return "Giftsets";
    return "General / Others";
  }

  if (categoryNorm === "NEW YEAR DIARY" || categoryNorm === "CUSTOMISED DIARY & NOTE BOOKS") {
    if (hasKeyword(["go green", "eco", "wood", "woody", "green"])) return "Eco-Friendly & Green";
    if (hasKeyword(["leather", "pu leather"])) return "Leather Diaries";
    if (hasKeyword(["hard bound", "hard cover", "hb"])) return "Hard Bound Diaries";
    if (hasKeyword(["planner", "motivation", "theme"])) return "Planners & Themes";
    if (hasKeyword(["economy", "economical", "regular"])) return "Economy & Regular";
    return "General / Others";
  }

  if (categoryNorm === "LEATHER GIFT ITEMS") {
    if (hasKeyword(["bag", "portfolio"])) return "Bags & Portfolios";
    return "Leather Accessories";
  }

  if (categoryNorm === "LEATHER BAGS") {
    return "Executive Bags";
  }

  if (categoryNorm === "JUTE BAGS") {
    return "Eco Jute Bags";
  }

  if (categoryNorm === "BOTTLES GIFT SET" || categoryNorm === "BOTTLE GIFT SETS") {
    return "Bottle & Flask Sets";
  }

  if (categoryNorm === "POWER BANK DIARIES") {
    return "Tech Power Bank Diaries";
  }

  if (categoryNorm === "PEN STANDS") {
    return "Desktop Accessories";
  }

  if (categoryNorm === "PROMOTIONAL UMBRELLAS") {
    return "Umbrellas";
  }

  if (categoryNorm === "CALENDARS") {
    return "Desktop & Wall Calendars";
  }

  if (categoryNorm === "EXHIBITION VISITOR'S GIFT IDEAS") {
    return "Giveaways & Promos";
  }

  return "General / Others";
}

function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<CatalogItem | null>(null);
  const qc = useQueryClient();

  // Query standard products
  const { data: dbProducts, isLoading: loadingProducts } = useQuery<CatalogItem[]>({
    queryKey: ["products-admin-only"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*");
      if (error) throw error;
      return (data || []).map((p) => ({ ...p, type: "product" as const }));
    },
  });

  // Query diaries
  const { data: dbDiaries, isLoading: loadingDiaries } = useQuery<CatalogItem[]>({
    queryKey: ["diaries-admin-only"],
    queryFn: async () => {
      const { data, error } = await supabase.from("diaries").select("*");
      if (error) throw error;
      return (data || []).map((d) => ({ ...d, type: "diary" as const }));
    },
  });

  const isLoading = loadingProducts || loadingDiaries;

  const allItems = useMemo(() => {
    return [...(dbProducts || []), ...(dbDiaries || [])].sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [dbProducts, dbDiaries]);

  // Root level category counts
  const categoryCounts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const cat of STOREFRONT_CATEGORIES) {
      map[cat] = allItems.filter((item) => matchCategory(item.category, cat)).length;
    }
    return map;
  }, [allItems]);

  const uncategorisedCount = useMemo(() => {
    return allItems.filter((item) => {
      if (!item.category || item.category.trim() === "") return true;
      return !STOREFRONT_CATEGORIES.some((cat) => matchCategory(item.category, cat));
    }).length;
  }, [allItems]);

  // Items filtering based on navigation path
  const categoryItems = useMemo(() => {
    if (!selectedCategory) return [];
    if (selectedCategory === "__uncategorised__") {
      return allItems.filter((item) => {
        if (!item.category || item.category.trim() === "") return true;
        return !STOREFRONT_CATEGORIES.some((cat) => matchCategory(item.category, cat));
      });
    }
    return allItems.filter((item) => matchCategory(item.category, selectedCategory));
  }, [allItems, selectedCategory]);

  // Subcategories found in the selected category
  const subcategoryCounts = useMemo(() => {
    if (!selectedCategory) return {};
    const map: Record<string, number> = {};
    for (const item of categoryItems) {
      const subcat = getSubcategory(item, selectedCategory);
      map[subcat] = (map[subcat] || 0) + 1;
    }
    return map;
  }, [categoryItems, selectedCategory]);

  const subcategoriesList = useMemo(() => {
    return Object.keys(subcategoryCounts).sort();
  }, [subcategoryCounts]);

  const subcategoryItems = useMemo(() => {
    if (!selectedCategory || !selectedSubcategory) return [];
    return categoryItems.filter(
      (item) => getSubcategory(item, selectedCategory) === selectedSubcategory
    );
  }, [categoryItems, selectedCategory, selectedSubcategory]);

  // Flat list filtered by search or subcategory items
  const filtered = useMemo(() => {
    if (search) {
      return allItems.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.category?.toLowerCase().includes(search.toLowerCase()) ||
          (p.tags || []).some((t) => t.toLowerCase().includes(search.toLowerCase()))
      );
    }
    if (selectedCategory && selectedSubcategory) {
      return subcategoryItems;
    }
    return [];
  }, [allItems, search, selectedCategory, selectedSubcategory, subcategoryItems]);

  const isRoot = selectedCategory === null;
  const isCategoryOpen = selectedCategory !== null && selectedSubcategory === null;

  return (
    <div>
      <PageHeader title="Products" description="Directory navigation for standard products and diaries.">
        <Button onClick={() => setEditing({ ...empty })}>
          <Plus className="h-4 w-4 mr-1.5" />
          New product / diary
        </Button>
      </PageHeader>

      {/* breadcrumb path bar */}
      <nav className="flex items-center gap-1.5 text-sm mb-4 min-h-[28px] overflow-x-auto whitespace-nowrap scrollbar-none">
        <button
          onClick={() => {
            setSelectedCategory(null);
            setSelectedSubcategory(null);
            setSearch("");
          }}
          className={
            "flex items-center gap-1 px-2 py-1 rounded-md transition-colors shrink-0 " +
            (isRoot
              ? "text-foreground font-medium"
              : "text-muted-foreground hover:text-foreground hover:bg-surface-2")
          }
        >
          <Home className="h-3.5 w-3.5" />
          All Categories
        </button>

        {selectedCategory && (
          <>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <button
              onClick={() => {
                setSelectedSubcategory(null);
                setSearch("");
              }}
              className={
                "flex items-center gap-1 px-2 py-1 rounded-md transition-colors shrink-0 " +
                (isCategoryOpen
                  ? "text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-surface-2")
              }
            >
              <Folder className="h-3.5 w-3.5 shrink-0" />
              {selectedCategory === "__uncategorised__" ? "Uncategorised" : selectedCategory}
            </button>
          </>
        )}

        {selectedCategory && selectedSubcategory && (
          <>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-primary-soft text-primary font-medium shrink-0">
              <FolderOpen className="h-3.5 w-3.5 shrink-0" />
              {selectedSubcategory}
            </span>
          </>
        )}

        <span className="ml-auto text-xs text-muted-foreground shrink-0">
          {search
            ? `${filtered.length} search result${filtered.length === 1 ? "" : "s"}`
            : isRoot
              ? `${allItems.length} total items`
              : isCategoryOpen
                ? `${subcategoriesList.length} subcategories`
                : `${filtered.length} product${filtered.length === 1 ? "" : "s"}`}
        </span>
      </nav>

      {/* ── ROOT VIEW: main categories ── */}
      {isRoot && !search && (
        <div className="gv-panel overflow-hidden mb-4">
          <div className="px-4 py-2.5 border-b border-border bg-surface text-xs uppercase tracking-wider text-muted-foreground font-medium">
            Categories
          </div>
          <div className="divide-y divide-border">
            {isLoading && (
              <div className="py-10 text-center text-sm text-muted-foreground">Loading categories…</div>
            )}
            {!isLoading &&
              STOREFRONT_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-surface/60 transition-colors text-left group"
                >
                  <Folder className="h-4 w-4 text-primary/70 group-hover:text-primary shrink-0" />
                  <span className="flex-1 text-sm font-medium">{cat}</span>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {categoryCounts[cat] ?? 0} items
                  </span>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground shrink-0" />
                </button>
              ))}

            {!isLoading && uncategorisedCount > 0 && (
              <button
                onClick={() => setSelectedCategory("__uncategorised__")}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-surface/60 transition-colors text-left group"
              >
                <Folder className="h-4 w-4 text-muted-foreground/60 group-hover:text-muted-foreground shrink-0" />
                <span className="flex-1 text-sm text-muted-foreground italic">Uncategorised</span>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {uncategorisedCount} items
                </span>
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground shrink-0" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── CATEGORY VIEW: subcategories ── */}
      {isCategoryOpen && !search && (
        <div className="gv-panel overflow-hidden mb-4">
          <div className="px-4 py-2.5 border-b border-border bg-surface flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground font-medium">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedCategory(null)}
              className="h-6 px-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-3 w-3 mr-1" />
              Back
            </Button>
            <span>Subcategories of {selectedCategory === "__uncategorised__" ? "Uncategorised" : selectedCategory}</span>
          </div>
          <div className="divide-y divide-border">
            {subcategoriesList.length === 0 ? (
              <div className="py-10 text-center text-sm text-muted-foreground">
                No subcategories found. Click "New product / diary" to add items to this folder.
              </div>
            ) : (
              subcategoriesList.map((subcat) => (
                <button
                  key={subcat}
                  onClick={() => setSelectedSubcategory(subcat)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-surface/60 transition-colors text-left group"
                >
                  <Folder className="h-4 w-4 text-amber-500/70 group-hover:text-amber-500 shrink-0" />
                  <span className="flex-1 text-sm font-medium">{subcat}</span>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {subcategoryCounts[subcat] ?? 0} items
                  </span>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground shrink-0" />
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* ── LIST VIEW: flat search or subcategory content ── */}
      {(!isRoot && !isCategoryOpen || search) && (
        <>
          <div className="flex items-center gap-2 mb-4">
            {!search && selectedSubcategory && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedSubcategory(null)}
                className="shrink-0"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
            )}
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={selectedSubcategory ? "Search in this directory…" : "Search all catalog…"}
                className="pl-8"
              />
            </div>
          </div>

          <div className="gv-panel overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-surface border-b border-border">
                <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-2.5 w-14"></th>
                  <th className="px-2 py-2.5">Product / Diary</th>
                  <th className="px-2 py-2.5">Category</th>
                  <th className="px-2 py-2.5">Price range</th>
                  <th className="px-2 py-2.5">Type</th>
                  <th className="px-2 py-2.5">Status</th>
                  <th className="px-4 py-2.5 w-24"></th>
                </tr>
              </thead>
              <tbody>
                {isLoading && (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-muted-foreground">
                      Loading items…
                    </td>
                  </tr>
                )}
                {!isLoading && filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-muted-foreground">
                      {search ? "No items match your search." : "No products in this subcategory folder."}
                    </td>
                  </tr>
                )}
                {filtered.map((item) => (
                  <tr key={`${item.type}-${item.id}`} className="border-b border-border last:border-0 hover:bg-surface/60">
                    <td className="px-4 py-2.5">
                      <div className="h-9 w-9 rounded bg-surface-2 overflow-hidden flex items-center justify-center border border-border">
                        {item.image_url ? (
                          <img src={item.image_url} alt="" className="h-full w-full object-cover" />
                        ) : item.type === "diary" ? (
                          <BookOpen className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Package className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </td>
                    <td className="px-2 py-2.5">
                      <div className="font-medium flex items-center gap-1.5">
                        {item.name}
                        {item.featured && <Star className="h-3 w-3 fill-primary text-primary shrink-0" />}
                      </div>
                      <div className="text-xs text-muted-foreground font-mono">/{item.slug}</div>
                    </td>
                    <td className="px-2 py-2.5 text-muted-foreground text-xs max-w-[200px] truncate">
                      {item.category ?? "—"}
                    </td>
                    <td className="px-2 py-2.5 font-mono text-xs">
                      {item.min_price != null && item.max_price != null
                        ? `₹${item.min_price} – ₹${item.max_price}`
                        : item.min_price != null
                          ? `from ₹${item.min_price}`
                          : "—"}
                    </td>
                    <td className="px-2 py-2.5">
                      {item.type === "diary" ? (
                        <span className="gv-chip bg-indigo-500/10 text-indigo-500 border-indigo-500/20 text-[10px]">Diary</span>
                      ) : (
                        <span className="gv-chip bg-sky-500/10 text-sky-500 border-sky-500/20 text-[10px]">Product</span>
                      )}
                    </td>
                    <td className="px-2 py-2.5">
                      {item.enabled ? (
                        <span className="gv-chip bg-success/10 text-success border-success/20 text-[10px]">Live</span>
                      ) : (
                        <span className="gv-chip text-[10px]">Hidden</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <Button variant="ghost" size="icon" onClick={() => setEditing(item)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Global search bar shown at root when no category selected */}
      {isRoot && !search && (
        <div className="mt-4 flex items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search all products & diaries…"
              className="pl-8"
            />
          </div>
        </div>
      )}

      <Sheet open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <SheetContent className="sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{editing?.id ? `Edit ${editing.type}` : "New item"}</SheetTitle>
          </SheetHeader>
          {editing && (
            <ProductForm
              product={editing}
              allCategories={STOREFRONT_CATEGORIES}
              defaultCategory={selectedCategory && selectedCategory !== "__uncategorised__" ? selectedCategory : undefined}
              onClose={() => setEditing(null)}
              onSaved={() => {
                qc.invalidateQueries({ queryKey: ["products-admin-only"] });
                qc.invalidateQueries({ queryKey: ["diaries-admin-only"] });
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
  allCategories,
  defaultCategory,
}: {
  product: CatalogItem;
  onClose: () => void;
  onSaved: () => void;
  allCategories: string[];
  defaultCategory?: string;
}) {
  const [values, setValues] = useState<CatalogItem>(() => ({
    ...empty,
    ...product,
    category: product.category || defaultCategory || "",
  }));
  const [saving, setSaving] = useState(false);
  const [catSearch, setCatSearch] = useState("");

  const runSaveProduct = useServerFn(saveProduct);
  const runDeleteProduct = useServerFn(deleteProduct);
  const runSaveDiary = useServerFn(saveDiary);
  const runDeleteDiary = useServerFn(deleteDiary);

  function set<K extends keyof CatalogItem>(key: K, v: CatalogItem[K]) {
    setValues((prev) => ({ ...prev, [key]: v }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      if (values.type === "diary") {
        await runSaveDiary({
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
              color: values.color || null,
              size: values.size || null,
              pages: values.pages,
              cover_type: values.cover_type || null,
              image_url: values.image_url || null,
              featured: values.featured,
              enabled: values.enabled,
            },
          },
        });
      } else {
        await runSaveProduct({
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
      }
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
      if (values.type === "diary") {
        await runDeleteDiary({ data: { id: product.id } });
      } else {
        await runDeleteProduct({ data: { id: product.id } });
      }
      toast.success("Deleted");
      onSaved();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Delete failed");
    }
  }

  // Category multi-select
  const selectedCats = values.category
    ? values.category.split(",").map((c) => c.trim()).filter(Boolean)
    : [];

  function toggleCat(cat: string) {
    const norm = cat.trim();
    const next = selectedCats.includes(norm)
      ? selectedCats.filter((c) => c !== norm)
      : [...selectedCats, norm];
    set("category", next.join(", "));
  }

  const filteredCats = catSearch
    ? allCategories.filter((c) => c.toLowerCase().includes(catSearch.toLowerCase()))
    : allCategories;

  // Subcategory multi-select
  const availableSubcats = Array.from(new Set(
    selectedCats.flatMap(cat => STOREFRONT_SUBCATEGORIES[cat.toUpperCase()] || [])
  ));

  const selectedSubcats = (values.tags || []).filter(t => availableSubcats.includes(t));

  function toggleSubcat(subcat: string) {
    const nextTags = (values.tags || []).includes(subcat)
      ? (values.tags || []).filter(t => t !== subcat)
      : [...(values.tags || []), subcat];
    set("tags", nextTags);
  }

  return (
    <div className="space-y-5 pt-5">
      {/* Type Selector (only for new items) */}
      {!product.id && (
        <div>
          <Label>Item Type</Label>
          <div className="flex gap-4 mt-1.5">
            <label className="flex items-center gap-1.5 text-sm cursor-pointer font-medium text-foreground">
              <input
                type="radio"
                name="item_type"
                checked={values.type === "product"}
                onChange={() => set("type", "product")}
                className="accent-primary"
              />
              Standard Product
            </label>
            <label className="flex items-center gap-1.5 text-sm cursor-pointer font-medium text-foreground">
              <input
                type="radio"
                name="item_type"
                checked={values.type === "diary"}
                onChange={() => set("type", "diary")}
                className="accent-primary"
              />
              Diary Book
            </label>
          </div>
        </div>
      )}

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

      {/* Diary specific fields */}
      {values.type === "diary" && (
        <div className="grid grid-cols-2 gap-3 border border-border p-3 rounded-md bg-surface/50">
          <div className="col-span-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
            Diary Metadata
          </div>
          <div>
            <Label>Size</Label>
            <Input
              value={values.size ?? ""}
              onChange={(e) => set("size", e.target.value)}
              placeholder="A5, B5…"
              className="mt-1.5 text-sm"
            />
          </div>
          <div>
            <Label>Colour</Label>
            <Input
              value={values.color ?? ""}
              onChange={(e) => set("color", e.target.value)}
              placeholder="Brown, Blue…"
              className="mt-1.5 text-sm"
            />
          </div>
          <div>
            <Label>Cover type</Label>
            <Input
              value={values.cover_type ?? ""}
              onChange={(e) => set("cover_type", e.target.value)}
              placeholder="PU leather…"
              className="mt-1.5 text-sm"
            />
          </div>
          <div>
            <Label>Pages</Label>
            <Input
              type="number"
              value={values.pages ?? ""}
              onChange={(e) => set("pages", e.target.value === "" ? null : Number(e.target.value))}
              placeholder="320…"
              className="mt-1.5 text-sm"
            />
          </div>
        </div>
      )}

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
            value={values.category ?? ""}
            onChange={(e) => set("category", e.target.value)}
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
        <Input
          value={(values.tags || []).join(", ")}
          onChange={(e) => set("tags", e.target.value.split(",").map((t) => t.trim()).filter(Boolean))}
          className="mt-1.5"
        />
      </div>
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
          <Switch checked={values.featured} onCheckedChange={(v) => set("featured", v)} /> Featured
        </label>
        <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
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
            {saving ? "Saving…" : "Save item"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");
}
