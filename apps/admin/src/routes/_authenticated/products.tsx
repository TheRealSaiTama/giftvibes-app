import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useEffect, useRef } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { MediaPicker, MediaGrid, uploadFileToBucket } from "@/components/admin/media-picker";
import {
  Plus, Pencil, Trash2, Search, Star, ChevronRight, Home,
  Folder, FolderOpen, ArrowLeft, BookOpen, Package, Copy
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose
} from "@/components/ui/dialog";
import { toast } from "sonner";

const CUSTOM_CATEGORIES_KEY = "gv_custom_categories";
const CUSTOM_SUBCATEGORIES_KEY = "gv_custom_subcategories";
const CATEGORY_SEO_KEY = "gv_category_seo";
const HIDDEN_CATEGORIES_KEY = "gv_hidden_categories";
const CATEGORY_RENAMES_KEY = "gv_category_renames";
const HIDDEN_SUBCATEGORIES_KEY = "gv_hidden_subcategories";
const SUBCATEGORY_RENAMES_KEY = "gv_subcategory_renames";

function readLs<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = JSON.parse(localStorage.getItem(key) || "null");
    return raw == null ? fallback : (raw as T);
  } catch {
    return fallback;
  }
}

type CustomCategory = {
  name: string;
  seoTitle?: string;
  seoDescription?: string;
};

/** SEO meta for a category (shop filter / landing). */
type CategorySeo = {
  seoTitle: string;
  seoDescription: string;
  ogImageUrl: string;
};

const emptyCategorySeo = (): CategorySeo => ({
  seoTitle: "",
  seoDescription: "",
  ogImageUrl: "",
});

type CategoryFormState = {
  mode: "add" | "edit";
  /** Display name currently shown (before this edit). */
  originalName?: string;
  /** Built-in key, or the custom name. Stable across renames. */
  originalKey?: string;
  name: string;
  seoTitle: string;
  seoDescription: string;
  ogImageUrl: string;
};

type SubFormState = {
  mode: "add" | "edit";
  cat: string;
  originalName?: string;
  name: string;
};

// Spec table on product page. Each row: checkbox + value.
// Only checked + non-empty values render on the storefront.
const PRODUCT_FEATURES: { key: string; label: string; placeholder: string }[] = [
  { key: "size", label: "Size", placeholder: "e.g. 5.1 × 8 Inches. approx" },
  { key: "paper_quality", label: "Paper Quality", placeholder: "e.g. ECONOMY Paper" },
  { key: "page_format", label: "Page Format", placeholder: "e.g. Yearly dated with Two Date a Page Format" },
  { key: "cover_binding", label: "Cover Binding", placeholder: "e.g. Hard Bound" },
  { key: "monthly_planner", label: "Monthly Planner", placeholder: "e.g. YES / NO" },
  { key: "month_cutting", label: "Month Cutting", placeholder: "e.g. YES / NO" },
  { key: "cover_colors", label: "Cover Colors", placeholder: "e.g. 8 Mix Colour cover" },
];

export const Route = createFileRoute("/_authenticated/products")({
  component: ProductsPage,
});

type ProductFeature = { show: boolean; value: string };
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
  // M6: secondary images stored in the existing `gallery` jsonb column.
  gallery: string[];
  // M8: per-feature { show, value }. Only enabled + non-empty values render
  // on the product page.
  features: Record<string, ProductFeature>;
  // M9: SEO meta for generateMetadata on the storefront product page.
  seo_title: string | null;
  seo_description: string | null;
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
  gallery: [],
  features: {},
  seo_title: "",
  seo_description: "",
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
function matchCategory(
  productCat: string | null,
  targetCat: string,
  aliases: Record<string, string> = {},
): boolean {
  if (!productCat) return false;
  const names = new Set<string>([normCat(targetCat)]);
  for (const [orig, renamed] of Object.entries(aliases)) {
    if (normCat(orig) === normCat(targetCat) || normCat(renamed) === normCat(targetCat)) {
      names.add(normCat(orig));
      names.add(normCat(renamed));
    }
  }
  const productCats = productCat.split(",").map((c) => normCat(c));
  return productCats.some((pc) => {
    if (!pc) return false;
    if (names.has(pc)) return true;
    for (const t of names) {
      if (pc + "S" === t || pc === t + "S") return true;
      if (t === "CORPORATE GIFT SETS" && pc === "CORPORATE GIFT SET") return true;
      if (t === "CUSTOMISED DIARY & NOTE BOOKS" && pc.includes("CUSTOMISED DIARY")) return true;
    }
    return false;
  });
}

/** Determine the subcategory mapping dynamically based on tags and product details */
function getSubcategory(
  item: CatalogItem,
  category: string,
  ctx?: { key: string; subs: string[]; subRenames: Record<string, string> },
): string {
  const categoryNorm = (ctx?.key || category).trim().toUpperCase();
  const tags = item.tags || [];

  if (ctx?.subs?.length) {
    const reverse: Record<string, string> = {};
    for (const [orig, renamed] of Object.entries(ctx.subRenames || {})) reverse[renamed] = orig;
    const explicit = ctx.subs.find((sub) => tags.includes(sub) || tags.includes(reverse[sub] || ""));
    if (explicit) return explicit;
    for (const [orig, renamed] of Object.entries(ctx.subRenames || {})) {
      if (tags.includes(orig)) return renamed;
    }
  }

  // First, check if the item has an explicit subcategory tag saved from the dropdown
  const predefined = STOREFRONT_SUBCATEGORIES[categoryNorm];
  if (predefined) {
    const explicitMatch = predefined.find(sub => (item.tags || []).includes(sub));
    if (explicitMatch) return ctx?.subRenames?.[explicitMatch] || explicitMatch;
  }

  const nameLower = item.name.toLowerCase();
  const tagsLower = (item.tags || []).map((t) => t.toLowerCase());

  const hasKeyword = (keywords: string[]) =>
    keywords.some((k) => nameLower.includes(k) || tagsLower.some((t) => t.includes(k)));
  const label = (s: string) => ctx?.subRenames?.[s] || s;

  if (categoryNorm === "CORPORATE GIFT SETS" || categoryNorm === "CORPORATE GIFT SET") {
    if (hasKeyword(["diary and pen", "diary & pen", "pen set"])) return label("Diary & Pen Sets");
    if (hasKeyword(["calendar"])) return label("Calendar Sets");
    if (hasKeyword(["gift set", "giftset", "combo"])) return label("Giftsets");
    return label("General / Others");
  }

  if (categoryNorm === "NEW YEAR DIARY" || categoryNorm === "CUSTOMISED DIARY & NOTE BOOKS") {
    if (hasKeyword(["go green", "eco", "wood", "woody", "green"])) return label("Eco-Friendly & Green");
    if (hasKeyword(["leather", "pu leather"])) return label("Leather Diaries");
    if (hasKeyword(["hard bound", "hard cover", "hb"])) return label("Hard Bound Diaries");
    if (hasKeyword(["planner", "motivation", "theme"])) return label("Planners & Themes");
    if (hasKeyword(["economy", "economical", "regular"])) return label("Economy & Regular");
    return label("General / Others");
  }

  if (categoryNorm === "LEATHER GIFT ITEMS") {
    if (hasKeyword(["bag", "portfolio"])) return label("Bags & Portfolios");
    return label("Leather Accessories");
  }

  if (categoryNorm === "LEATHER BAGS") {
    return label("Executive Bags");
  }

  if (categoryNorm === "JUTE BAGS") {
    return label("Eco Jute Bags");
  }

  if (categoryNorm === "BOTTLES GIFT SET" || categoryNorm === "BOTTLE GIFT SETS") {
    return label("Bottle & Flask Sets");
  }

  if (categoryNorm === "POWER BANK DIARIES") {
    return label("Tech Power Bank Diaries");
  }

  if (categoryNorm === "PEN STANDS") {
    return label("Desktop Accessories");
  }

  if (categoryNorm === "PROMOTIONAL UMBRELLAS") {
    return label("Umbrellas");
  }

  if (categoryNorm === "CALENDARS") {
    return label("Desktop & Wall Calendars");
  }

  if (categoryNorm === "EXHIBITION VISITOR'S GIFT IDEAS") {
    return label("Giveaways & Promos");
  }

  return label("General / Others");
}

function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<CatalogItem | null>(null);
  const [catForm, setCatForm] = useState<CategoryFormState | null>(null);
  const [subForm, setSubForm] = useState<SubFormState | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const qc = useQueryClient();
  const runDeleteProduct = useServerFn(deleteProduct);
  const runDeleteDiary = useServerFn(deleteDiary);

  // ponytail: client-side custom categories + subcategories + SEO. localStorage
  // is enough for now; promote to a Supabase table when the catalog team needs
  // shared editing.
  const [customCategories, setCustomCategories] = useState<CustomCategory[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = JSON.parse(localStorage.getItem(CUSTOM_CATEGORIES_KEY) || "[]");
      if (!Array.isArray(raw)) return [];
      // ponytail: accept legacy string[] entries from the previous commit;
      // drop the helper once no live users have the old shape.
      return raw.map((item: unknown) =>
        typeof item === "string" ? { name: item } : (item as CustomCategory)
      );
    } catch { return []; }
  });

  const [customSubcategories, setCustomSubcategories] = useState<Record<string, string[]>>(() =>
    readLs<Record<string, string[]>>(CUSTOM_SUBCATEGORIES_KEY, {}),
  );
  const [hiddenCategories, setHiddenCategories] = useState<string[]>(() =>
    readLs<string[]>(HIDDEN_CATEGORIES_KEY, []),
  );
  const [categoryRenames, setCategoryRenames] = useState<Record<string, string>>(() =>
    readLs<Record<string, string>>(CATEGORY_RENAMES_KEY, {}),
  );
  const [hiddenSubcategories, setHiddenSubcategories] = useState<Record<string, string[]>>(() =>
    readLs<Record<string, string[]>>(HIDDEN_SUBCATEGORIES_KEY, {}),
  );
  const [subcategoryRenames, setSubcategoryRenames] = useState<Record<string, Record<string, string>>>(() =>
    readLs<Record<string, Record<string, string>>>(SUBCATEGORY_RENAMES_KEY, {}),
  );

  // SEO keyed by category name (works for built-in + custom).
  const [categorySeo, setCategorySeo] = useState<Record<string, CategorySeo>>(() => {
    if (typeof window === "undefined") return {};
    try {
      const stored = JSON.parse(localStorage.getItem(CATEGORY_SEO_KEY) || "{}") as Record<string, Partial<CategorySeo>>;
      const map: Record<string, CategorySeo> = {};
      for (const [k, v] of Object.entries(stored || {})) {
        map[k] = {
          seoTitle: v.seoTitle ?? "",
          seoDescription: v.seoDescription ?? "",
          ogImageUrl: v.ogImageUrl ?? "",
        };
      }
      // Migrate SEO that used to live only on customCategories entries.
      try {
        const raw = JSON.parse(localStorage.getItem(CUSTOM_CATEGORIES_KEY) || "[]");
        if (Array.isArray(raw)) {
          for (const item of raw) {
            if (item && typeof item === "object" && typeof item.name === "string") {
              const name = item.name as string;
              if (!map[name] && (item.seoTitle || item.seoDescription)) {
                map[name] = {
                  seoTitle: item.seoTitle || "",
                  seoDescription: item.seoDescription || "",
                  ogImageUrl: "",
                };
              }
            }
          }
        }
      } catch { /* ignore */ }
      return map;
    } catch { return {}; }
  });

  useEffect(() => {
    localStorage.setItem(CUSTOM_CATEGORIES_KEY, JSON.stringify(customCategories));
  }, [customCategories]);

  useEffect(() => {
    localStorage.setItem(CUSTOM_SUBCATEGORIES_KEY, JSON.stringify(customSubcategories));
  }, [customSubcategories]);

  useEffect(() => {
    localStorage.setItem(HIDDEN_CATEGORIES_KEY, JSON.stringify(hiddenCategories));
  }, [hiddenCategories]);

  useEffect(() => {
    localStorage.setItem(CATEGORY_RENAMES_KEY, JSON.stringify(categoryRenames));
  }, [categoryRenames]);

  useEffect(() => {
    localStorage.setItem(HIDDEN_SUBCATEGORIES_KEY, JSON.stringify(hiddenSubcategories));
  }, [hiddenSubcategories]);

  useEffect(() => {
    localStorage.setItem(SUBCATEGORY_RENAMES_KEY, JSON.stringify(subcategoryRenames));
  }, [subcategoryRenames]);

  useEffect(() => {
    localStorage.setItem(CATEGORY_SEO_KEY, JSON.stringify(categorySeo));
  }, [categorySeo]);

  function categoryKey(display: string): string {
    const n = normCat(display);
    if (STOREFRONT_CATEGORIES.includes(display) || STOREFRONT_CATEGORIES.includes(n)) return n;
    for (const [orig, renamed] of Object.entries(categoryRenames)) {
      if (normCat(renamed) === n || normCat(orig) === n) return orig;
    }
    return display;
  }

  function displayCategoryName(key: string): string {
    return categoryRenames[key] || categoryRenames[normCat(key)] || key;
  }

  const allCategories = useMemo(
    () => [
      ...STOREFRONT_CATEGORIES.filter((c) => !hiddenCategories.includes(c) && !hiddenCategories.includes(normCat(c))).map(
        (c) => categoryRenames[c] || c,
      ),
      ...customCategories.map((c) => c.name),
    ],
    [customCategories, hiddenCategories, categoryRenames],
  );

  function openAddCategoryForm() {
    setCatForm({
      mode: "add",
      name: "",
      ...emptyCategorySeo(),
    });
  }

  function openEditCategoryForm(cat: string) {
    const key = categoryKey(cat);
    const seo = categorySeo[cat] ?? categorySeo[key] ?? emptyCategorySeo();
    const legacy = customCategories.find((c) => c.name === cat || c.name === key);
    setCatForm({
      mode: "edit",
      originalName: cat,
      originalKey: key,
      name: cat,
      seoTitle: seo.seoTitle || legacy?.seoTitle || "",
      seoDescription: seo.seoDescription || legacy?.seoDescription || "",
      ogImageUrl: seo.ogImageUrl || "",
    });
  }

  function migrateKeyed<T>(map: Record<string, T>, from: string, to: string): Record<string, T> {
    if (from === to || !(from in map)) return map;
    const next = { ...map, [to]: map[from] };
    delete next[from];
    return next;
  }

  async function retagCategoryOnItems(oldName: string, newName: string) {
    if (normCat(oldName) === normCat(newName)) return;
    for (const table of ["products", "diaries"] as const) {
      const { data, error } = await supabase.from(table).select("id, category");
      if (error) {
        console.error(error);
        continue;
      }
      for (const row of data || []) {
        if (!matchCategory(row.category, oldName, categoryRenames)) continue;
        const next = (row.category || "")
          .split(",")
          .map((c: string) => (normCat(c) === normCat(oldName) ? newName : c.trim()))
          .filter(Boolean)
          .join(", ");
        if (next !== (row.category || "")) {
          const { error: upErr } = await supabase.from(table).update({ category: next }).eq("id", row.id);
          if (upErr) console.error(upErr);
        }
      }
    }
    qc.invalidateQueries({ queryKey: ["products-admin-only"] });
    qc.invalidateQueries({ queryKey: ["diaries-admin-only"] });
  }

  async function retagSubcategoryOnItems(oldName: string, newName: string) {
    if (oldName === newName) return;
    for (const table of ["products", "diaries"] as const) {
      const { data, error } = await supabase.from(table).select("id, tags");
      if (error) {
        console.error(error);
        continue;
      }
      for (const row of data || []) {
        const tags: string[] = Array.isArray(row.tags) ? row.tags : [];
        if (!tags.includes(oldName)) continue;
        const next = tags.map((t) => (t === oldName ? newName : t));
        const { error: upErr } = await supabase.from(table).update({ tags: next }).eq("id", row.id);
        if (upErr) console.error(upErr);
      }
    }
    qc.invalidateQueries({ queryKey: ["products-admin-only"] });
    qc.invalidateQueries({ queryKey: ["diaries-admin-only"] });
  }

  async function saveCategoryForm() {
    if (!catForm) return;
    const name = catForm.name.trim().toUpperCase().replace(/\s+/g, " ");
    if (!name) {
      toast.error("Category name is required");
      return;
    }

    const seo: CategorySeo = {
      seoTitle: catForm.seoTitle.trim(),
      seoDescription: catForm.seoDescription.trim(),
      ogImageUrl: catForm.ogImageUrl.trim(),
    };

    if (catForm.mode === "add") {
      const hiddenHit = hiddenCategories.find((h) => normCat(h) === name);
      if (hiddenHit) {
        setHiddenCategories((prev) => prev.filter((h) => normCat(h) !== name));
        setCategorySeo((prev) => ({ ...prev, [hiddenHit]: seo, [name]: seo }));
        setCatForm(null);
        toast.success(`Restored "${displayCategoryName(hiddenHit)}"`);
        return;
      }
      if (allCategories.some((c) => normCat(c) === name)) {
        toast.error("Category already exists");
        return;
      }
      setCustomCategories((prev) => [
        ...prev,
        {
          name,
          seoTitle: seo.seoTitle || undefined,
          seoDescription: seo.seoDescription || undefined,
        },
      ]);
      setCategorySeo((prev) => ({ ...prev, [name]: seo }));
      setCatForm(null);
      toast.success(`Added "${name}"`);
      return;
    }

    const origKey = catForm.originalKey || catForm.originalName || name;
    const oldDisplay = catForm.originalName || origKey;
    const isBuiltIn = STOREFRONT_CATEGORIES.includes(origKey);

    if (normCat(name) !== normCat(oldDisplay) && allCategories.some((c) => normCat(c) === name && normCat(c) !== normCat(oldDisplay))) {
      toast.error("Category already exists");
      return;
    }

    if (isBuiltIn) {
      setCategoryRenames((prev) => {
        const next = { ...prev };
        if (name === origKey) delete next[origKey];
        else next[origKey] = name;
        return next;
      });
    } else {
      setCustomCategories((prev) =>
        prev.map((c) =>
          c.name === origKey || c.name === oldDisplay
            ? {
                ...c,
                name,
                seoTitle: seo.seoTitle || undefined,
                seoDescription: seo.seoDescription || undefined,
              }
            : c,
        ),
      );
      setCustomSubcategories((prev) => migrateKeyed(prev, origKey, name));
      setHiddenSubcategories((prev) => migrateKeyed(prev, origKey, name));
      setSubcategoryRenames((prev) => migrateKeyed(prev, origKey, name));
    }

    setCategorySeo((prev) => {
      const next = { ...prev, [name]: seo };
      if (oldDisplay !== name) delete next[oldDisplay];
      if (origKey !== name && origKey !== oldDisplay) delete next[origKey];
      return next;
    });

    if (selectedCategory === oldDisplay) setSelectedCategory(name);
    if (expandedCategory === oldDisplay) setExpandedCategory(name);

    setCatForm(null);
    toast.success(`Saved "${name}"`);
    if (normCat(oldDisplay) !== name) {
      retagCategoryOnItems(oldDisplay, name).catch((e) => console.error(e));
    }
  }

  function deleteCategory(cat: string) {
    const key = categoryKey(cat);
    const count = categoryCounts[cat] ?? 0;
    const ok = confirm(
      count > 0
        ? `Delete category "${cat}"? ${count} item(s) stay in the catalog and will show under Uncategorised until you recategorise them.`
        : `Delete category "${cat}"?`,
    );
    if (!ok) return;

    const isBuiltIn = STOREFRONT_CATEGORIES.includes(key);
    if (isBuiltIn) {
      setHiddenCategories((prev) => (prev.includes(key) ? prev : [...prev, key]));
    } else {
      setCustomCategories((prev) => prev.filter((c) => c.name !== cat && c.name !== key));
      setCustomSubcategories((prev) => {
        const next = { ...prev };
        delete next[cat];
        delete next[key];
        return next;
      });
    }
    setCategorySeo((prev) => {
      const next = { ...prev };
      delete next[cat];
      delete next[key];
      return next;
    });
    if (selectedCategory === cat) {
      setSelectedCategory(null);
      setSelectedSubcategory(null);
    }
    if (expandedCategory === cat) setExpandedCategory(null);
    toast.success(`Deleted "${cat}"`);
  }

  function getSubcategoriesFor(cat: string): string[] {
    const key = categoryKey(cat);
    const hidden = new Set([
      ...(hiddenSubcategories[key] || []),
      ...(hiddenSubcategories[cat] || []),
    ]);
    const renames = { ...(subcategoryRenames[key] || {}), ...(subcategoryRenames[cat] || {}) };
    const raw = [
      ...(STOREFRONT_SUBCATEGORIES[key] || STOREFRONT_SUBCATEGORIES[normCat(key)] || []),
      ...(customSubcategories[key] || []),
      ...(customSubcategories[cat] || []),
    ];
    const out: string[] = [];
    for (const s of raw) {
      if (hidden.has(s) || hidden.has(renames[s] || "")) continue;
      const label = renames[s] || s;
      if (!out.includes(label)) out.push(label);
    }
    return out;
  }

  function subCtx(cat: string) {
    return {
      key: categoryKey(cat),
      subs: getSubcategoriesFor(cat),
      subRenames: subcategoryRenames[categoryKey(cat)] || {},
    };
  }

  function saveSubcategory() {
    if (!subForm) return;
    const name = subForm.name.trim();
    if (!name) {
      toast.error("Subcategory name is required");
      return;
    }
    const key = categoryKey(subForm.cat);
    const existing = getSubcategoriesFor(subForm.cat);

    if (subForm.mode === "add") {
      if (existing.some((s) => s.toLowerCase() === name.toLowerCase())) {
        toast.error("Subcategory already exists");
        return;
      }
      const hiddenList = hiddenSubcategories[key] || [];
      const hiddenHit = hiddenList.find((h) => h.toLowerCase() === name.toLowerCase());
      if (hiddenHit) {
        setHiddenSubcategories((prev) => ({
          ...prev,
          [key]: (prev[key] || []).filter((h) => h !== hiddenHit),
        }));
      } else {
        setCustomSubcategories((prev) => ({
          ...prev,
          [key]: [...(prev[key] || []), name],
        }));
      }
      setSubForm(null);
      toast.success(`Added "${name}"`);
      return;
    }

    const oldName = subForm.originalName || name;
    if (oldName.toLowerCase() !== name.toLowerCase() && existing.some((s) => s.toLowerCase() === name.toLowerCase())) {
      toast.error("Subcategory already exists");
      return;
    }

    const builtIn = STOREFRONT_SUBCATEGORIES[key] || [];
    const reverseRename = Object.entries(subcategoryRenames[key] || {}).find(([, v]) => v === oldName)?.[0];
    const origSub = builtIn.includes(oldName) ? oldName : reverseRename || oldName;
    const isBuiltInSub = builtIn.includes(origSub);

    if (isBuiltInSub) {
      setSubcategoryRenames((prev) => {
        const forCat = { ...(prev[key] || {}) };
        if (name === origSub) delete forCat[origSub];
        else forCat[origSub] = name;
        return { ...prev, [key]: forCat };
      });
    } else {
      setCustomSubcategories((prev) => ({
        ...prev,
        [key]: (prev[key] || []).map((s) => (s === oldName || s === origSub ? name : s)),
      }));
    }

    if (selectedSubcategory === oldName) setSelectedSubcategory(name);
    setSubForm(null);
    toast.success(`Renamed to "${name}"`);
    if (oldName !== name) {
      retagSubcategoryOnItems(oldName, name).catch((e) => console.error(e));
    }
  }

  function deleteSubcategory(cat: string, subcat: string) {
    const key = categoryKey(cat);
    const count = allItems.filter(
      (item) => matchCategory(item.category, cat, categoryRenames) && getSubcategory(item, cat, subCtx(cat)) === subcat,
    ).length;
    const ok = confirm(
      count > 0
        ? `Delete subcategory "${subcat}"? ${count} item(s) stay in the catalog; recategorise them if needed.`
        : `Delete subcategory "${subcat}"?`,
    );
    if (!ok) return;

    const builtIn = STOREFRONT_SUBCATEGORIES[key] || [];
    const reverseRename = Object.entries(subcategoryRenames[key] || {}).find(([, v]) => v === subcat)?.[0];
    const origSub = builtIn.includes(subcat) ? subcat : reverseRename || subcat;
    const isBuiltInSub = builtIn.includes(origSub);

    if (isBuiltInSub) {
      setHiddenSubcategories((prev) => ({
        ...prev,
        [key]: Array.from(new Set([...(prev[key] || []), origSub])),
      }));
    } else {
      setCustomSubcategories((prev) => ({
        ...prev,
        [key]: (prev[key] || []).filter((s) => s !== subcat && s !== origSub),
      }));
    }

    if (selectedSubcategory === subcat) setSelectedSubcategory(null);
    toast.success(`Deleted "${subcat}"`);
  }

  // ponytail: open the edit Sheet in create mode with the source item's
  // fields copied. Empty id tells ProductForm this is a new row, the server
  // functions handle the insert.
  function duplicateItem(item: CatalogItem) {
    // Open create form prefilled from this row; empty id → insert on save.
    const baseSlug = (item.slug || item.name || "item")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    setEditing({
      ...item,
      id: "",
      name: `${item.name} (Copy)`,
      slug: `${baseSlug}-copy`,
      // Keep current folder category/tags so the copy lands in the same list.
      category: item.category,
      tags: [...(item.tags || [])],
    });
    toast.message("Duplicating — review and save to create the copy");
  }

  async function deleteItem(item: CatalogItem) {
    if (!item.id) return;
    if (!confirm(`Delete "${item.name}"? This cannot be undone.`)) return;
    setDeletingId(item.id);
    try {
      if (item.type === "diary") {
        await runDeleteDiary({ data: { id: item.id } });
      } else {
        await runDeleteProduct({ data: { id: item.id } });
      }
      toast.success(`Deleted "${item.name}"`);
      qc.invalidateQueries({ queryKey: ["products-admin-only"] });
      qc.invalidateQueries({ queryKey: ["diaries-admin-only"] });
      if (editing?.id === item.id) setEditing(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setDeletingId(null);
    }
  }

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
    for (const cat of allCategories) {
      map[cat] = allItems.filter((item) => matchCategory(item.category, cat, categoryRenames)).length;
    }
    return map;
  }, [allItems, allCategories, categoryRenames]);

  const uncategorisedCount = useMemo(() => {
    return allItems.filter((item) => {
      if (!item.category || item.category.trim() === "") return true;
      return !allCategories.some((cat) => matchCategory(item.category, cat, categoryRenames));
    }).length;
  }, [allItems, allCategories, categoryRenames]);

  // Items filtering based on navigation path
  const categoryItems = useMemo(() => {
    if (!selectedCategory) return [];
    if (selectedCategory === "__uncategorised__") {
      return allItems.filter((item) => {
        if (!item.category || item.category.trim() === "") return true;
        return !allCategories.some((cat) => matchCategory(item.category, cat, categoryRenames));
      });
    }
    return allItems.filter((item) => matchCategory(item.category, selectedCategory, categoryRenames));
  }, [allItems, selectedCategory, allCategories, categoryRenames]);

  // Subcategories found in the selected category
  const subcategoryCounts = useMemo(() => {
    if (!selectedCategory) return {};
    const ctx = subCtx(selectedCategory);
    const map: Record<string, number> = {};
    for (const item of categoryItems) {
      const subcat = getSubcategory(item, selectedCategory, ctx);
      map[subcat] = (map[subcat] || 0) + 1;
    }
    return map;
  }, [categoryItems, selectedCategory, subcategoryRenames, hiddenSubcategories, customSubcategories, categoryRenames]);

  const subcategoriesList = useMemo(() => {
    return Object.keys(subcategoryCounts).sort();
  }, [subcategoryCounts]);

  const subcategoryItems = useMemo(() => {
    if (!selectedCategory || !selectedSubcategory) return [];
    const ctx = subCtx(selectedCategory);
    return categoryItems.filter(
      (item) => getSubcategory(item, selectedCategory, ctx) === selectedSubcategory
    );
  }, [categoryItems, selectedCategory, selectedSubcategory, subcategoryRenames, hiddenSubcategories, customSubcategories, categoryRenames]);

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
  // Product list = inside a subcategory folder (or global search results).
  const isInProductList =
    !!search || (selectedCategory !== null && selectedSubcategory !== null);

  function openNewProduct() {
    const cat =
      selectedCategory && selectedCategory !== "__uncategorised__"
        ? selectedCategory
        : "";
    const tags =
      selectedSubcategory && selectedCategory !== "__uncategorised__"
        ? [selectedSubcategory]
        : [];
    setEditing({
      ...empty,
      category: cat,
      tags,
      // Diaries dominate several folders; form still lets the user switch type.
      type: cat.toUpperCase().includes("DIARY") ? "diary" : "product",
    });
  }

  return (
    <div>
      <PageHeader
        title={isInProductList && selectedSubcategory ? selectedSubcategory : "Categories"}
        description={
          isInProductList
            ? selectedCategory && selectedSubcategory
              ? `Products and diaries in ${selectedCategory} → ${selectedSubcategory}.`
              : "Search results across the catalog."
            : "Category management — add categories here, then open one to manage products and diaries inside it."
        }
      >
        {isRoot && !search && (
          <Button onClick={openAddCategoryForm}>
            <Plus className="h-4 w-4 mr-1.5" />
            Add new category
          </Button>
        )}
        {isInProductList && (
          <Button onClick={openNewProduct}>
            <Plus className="h-4 w-4 mr-1.5" />
            New product / diary
          </Button>
        )}
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
                setExpandedCategory(selectedCategory);
                setSelectedCategory(null);
                setSelectedSubcategory(null);
                setSearch("");
              }}
              className="flex items-center gap-1 px-2 py-1 rounded-md transition-colors shrink-0 text-muted-foreground hover:text-foreground hover:bg-surface-2"
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
              : `${filtered.length} product${filtered.length === 1 ? "" : "s"}`}
        </span>
      </nav>

      {/* ── ROOT VIEW: main categories (Accordion/Dropdown format) ── */}
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
              allCategories.map((cat) => {
                const isExpanded = expandedCategory === cat;
                const subcats = getSubcategoriesFor(cat);
                const isCustom = customCategories.some((c) => c.name === cat);
                return (
                  <div key={cat} className="transition-all">
                    <div className="w-full flex items-center gap-2 px-4 py-3 hover:bg-surface/60 transition-colors group">
                      <button
                        onClick={() => setExpandedCategory(isExpanded ? null : cat)}
                        className="flex-1 flex items-center gap-3 text-left min-w-0"
                      >
                        <Folder className={`h-4 w-4 transition-colors shrink-0 ${isExpanded ? "text-amber-500" : "text-primary/70 group-hover:text-primary"}`} />
                        <span className="flex-1 text-sm font-semibold flex items-center gap-2 min-w-0 truncate">
                          {cat}
                          {isCustom && (
                            <span className="text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-600 border border-amber-500/25 shrink-0">
                              custom
                            </span>
                          )}
                          {(categorySeo[cat]?.seoTitle || categorySeo[cat]?.seoDescription) && (
                            <span className="text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 shrink-0">
                              SEO
                            </span>
                          )}
                        </span>
                        <span className="text-xs text-muted-foreground tabular-nums shrink-0">
                          {categoryCounts[cat] ?? 0} items
                        </span>
                        <ChevronRight className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 shrink-0 ${isExpanded ? "rotate-90" : ""}`} />
                      </button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 shrink-0 text-muted-foreground hover:text-foreground"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditCategoryForm(cat);
                        }}
                        title={`Edit category: ${cat}`}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 shrink-0 text-muted-foreground hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteCategory(cat);
                        }}
                        title={`Delete category: ${cat}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                      {isExpanded && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-7 shrink-0 gap-1 px-2 text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSubForm({ mode: "add", cat, name: "" });
                          }}
                          title={`Add subcategory to ${cat}`}
                        >
                          <Plus className="h-3.5 w-3.5" />
                          Subcategory
                        </Button>
                      )}
                    </div>
                    {isExpanded && (
                      <div className="bg-surface/30 pl-10 pr-4 py-1 divide-y divide-border/20 border-t border-b border-border/10">
                        {subcats.map((subcat) => {
                          const count = allItems.filter(
                            (item) =>
                              matchCategory(item.category, cat, categoryRenames) &&
                              getSubcategory(item, cat, subCtx(cat)) === subcat,
                          ).length;
                          return (
                            <div
                              key={subcat}
                              className="w-full flex items-center gap-1 py-1.5 text-xs text-muted-foreground hover:bg-surface-2/10 transition-all group/sub"
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedCategory(cat);
                                  setSelectedSubcategory(subcat);
                                }}
                                className="flex-1 flex items-center justify-between py-1 text-left min-w-0 hover:text-primary"
                              >
                                <span className="truncate group-hover/sub:translate-x-1 transition-transform">{subcat}</span>
                                <span className="text-[10px] bg-surface-2 px-1.5 py-0.5 rounded border border-border/85 text-muted-foreground font-mono shrink-0 ml-2">
                                  {count} items
                                </span>
                              </button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 shrink-0 text-muted-foreground hover:text-foreground"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSubForm({ mode: "edit", cat, originalName: subcat, name: subcat });
                                }}
                                title={`Rename subcategory: ${subcat}`}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 shrink-0 text-muted-foreground hover:text-destructive"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteSubcategory(cat, subcat);
                                }}
                                title={`Delete subcategory: ${subcat}`}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          );
                        })}
                        {subcats.length === 0 && (
                          <div className="py-3 text-xs text-muted-foreground italic">No subcategories yet — use + Subcategory above</div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

            {!isLoading && uncategorisedCount > 0 && (
              <button
                onClick={() => {
                  setSelectedCategory("__uncategorised__");
                  setSelectedSubcategory("General / Others");
                }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface/60 transition-colors text-left group"
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

      {/* ── LIST VIEW: subcategory product list or search results ── */}
      {isInProductList && (
        <>
          <div className="flex items-center gap-2 mb-4">
            {!search && selectedSubcategory && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  // Return to category accordion with this parent expanded.
                  if (selectedCategory && selectedCategory !== "__uncategorised__") {
                    setExpandedCategory(selectedCategory);
                  }
                  setSelectedCategory(null);
                  setSelectedSubcategory(null);
                }}
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
            {/* Same add-product action next to the list toolbar */}
            <Button onClick={openNewProduct} className="shrink-0">
              <Plus className="h-4 w-4 mr-1.5" />
              New product / diary
            </Button>
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
                  <th className="px-4 py-2.5 w-36 text-right">Actions</th>
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
                      <div className="flex flex-col items-center gap-3">
                        <span>
                          {search
                            ? "No items match your search."
                            : "No products in this subcategory folder yet."}
                        </span>
                        {!search && (
                          <Button size="sm" onClick={openNewProduct}>
                            <Plus className="h-4 w-4 mr-1.5" />
                            New product / diary
                          </Button>
                        )}
                      </div>
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
                    <td className="px-3 py-2.5 text-right">
                      <div className="flex items-center justify-end gap-0.5">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          onClick={(e) => {
                            e.stopPropagation();
                            duplicateItem(item);
                          }}
                          title="Duplicate"
                          aria-label={`Duplicate ${item.name}`}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditing(item);
                          }}
                          title="Edit"
                          aria-label={`Edit ${item.name}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          disabled={deletingId === item.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteItem(item);
                          }}
                          title="Delete"
                          aria-label={`Delete ${item.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
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
              allCategories={allCategories}
              getSubcategoriesFor={getSubcategoriesFor}
              defaultCategory={selectedCategory && selectedCategory !== "__uncategorised__" ? selectedCategory : undefined}
              defaultSubcategory={search || !selectedSubcategory || selectedCategory === "__uncategorised__" ? undefined : selectedSubcategory}
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

      <Dialog open={!!catForm} onOpenChange={(o) => !o && setCatForm(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {catForm?.mode === "edit" ? "Edit category" : "Add new category"}
            </DialogTitle>
          </DialogHeader>
          {catForm && (
            <div className="py-2 space-y-4">
              <div>
                <Label htmlFor="cat-form-name">Name</Label>
                <Input
                  id="cat-form-name"
                  autoFocus={catForm.mode === "add"}
                  value={catForm.name}
                  onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                  placeholder="e.g. WOODEN GIFTS"
                  className="mt-1.5"
                />
                <p className="text-xs text-muted-foreground mt-1.5">
                  Saved in uppercase to match existing category style. Renaming also updates products in this folder.
                </p>
              </div>

              <div className="border-t border-border pt-4 space-y-3">
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1">
                    SEO
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">
                    Meta for this category on the shop (title, description, social image). Used when the storefront filters by this category.
                  </p>
                </div>
                <div>
                  <Label htmlFor="cat-seo-title">Meta title</Label>
                  <Input
                    id="cat-seo-title"
                    value={catForm.seoTitle}
                    onChange={(e) => setCatForm({ ...catForm, seoTitle: e.target.value })}
                    placeholder={`${catForm.name || "Category"} | GiftVibes`}
                    maxLength={70}
                    className="mt-1.5"
                  />
                  <div className="text-xs text-muted-foreground mt-1">
                    {catForm.seoTitle.length}/60 recommended
                  </div>
                </div>
                <div>
                  <Label htmlFor="cat-seo-desc">Meta description</Label>
                  <Textarea
                    id="cat-seo-desc"
                    rows={3}
                    value={catForm.seoDescription}
                    onChange={(e) => setCatForm({ ...catForm, seoDescription: e.target.value })}
                    placeholder="Short summary for search results and social shares."
                    maxLength={200}
                    className="mt-1.5"
                  />
                  <div className="text-xs text-muted-foreground mt-1">
                    {catForm.seoDescription.length}/160 recommended
                  </div>
                </div>
                <div>
                  <Label>Social share image (og:image)</Label>
                  <div className="mt-1.5">
                    <MediaPicker
                      value={catForm.ogImageUrl}
                      onChange={(url) => setCatForm({ ...catForm, ogImageUrl: url })}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2 sm:justify-between">
            {catForm?.mode === "edit" && catForm.originalName ? (
              <Button
                type="button"
                variant="ghost"
                className="text-destructive hover:text-destructive"
                onClick={() => {
                  const name = catForm.originalName!;
                  setCatForm(null);
                  deleteCategory(name);
                }}
              >
                <Trash2 className="h-4 w-4 mr-1.5" />
                Delete
              </Button>
            ) : (
              <span />
            )}
            <div className="flex gap-2">
              <DialogClose asChild>
                <Button variant="ghost">Cancel</Button>
              </DialogClose>
              <Button
                onClick={saveCategoryForm}
                disabled={catForm?.mode === "add" && !catForm.name.trim()}
              >
                {catForm?.mode === "edit" ? "Save category" : (
                  <>
                    <Plus className="h-4 w-4 mr-1.5" />
                    Add category
                  </>
                )}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!subForm} onOpenChange={(o) => !o && setSubForm(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {subForm?.mode === "edit"
                ? `Rename subcategory${subForm.cat ? ` in ${subForm.cat}` : ""}`
                : `Add subcategory${subForm?.cat ? ` to ${subForm.cat}` : ""}`}
            </DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <Label htmlFor="sub-form-name">Name</Label>
            <Input
              id="sub-form-name"
              autoFocus
              value={subForm?.name ?? ""}
              onChange={(e) => subForm && setSubForm({ ...subForm, name: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === "Enter") saveSubcategory();
              }}
              placeholder="e.g. Premium Leather"
              className="mt-1.5"
            />
            <p className="text-xs text-muted-foreground mt-2">
              {subForm?.mode === "edit"
                ? "Renaming updates this folder and products tagged with the old name."
                : "Subcategory appears in this category's expanded list and in product/diary subcategory selectors."}
            </p>
          </div>
          <DialogFooter className="gap-2 sm:justify-between">
            {subForm?.mode === "edit" && subForm.originalName ? (
              <Button
                type="button"
                variant="ghost"
                className="text-destructive hover:text-destructive"
                onClick={() => {
                  const { cat, originalName } = subForm;
                  setSubForm(null);
                  deleteSubcategory(cat, originalName);
                }}
              >
                <Trash2 className="h-4 w-4 mr-1.5" />
                Delete
              </Button>
            ) : (
              <span />
            )}
            <div className="flex gap-2">
              <DialogClose asChild>
                <Button variant="ghost">Cancel</Button>
              </DialogClose>
              <Button onClick={saveSubcategory} disabled={!subForm?.name.trim()}>
                {subForm?.mode === "edit" ? "Save name" : (
                  <>
                    <Plus className="h-4 w-4 mr-1.5" />
                    Add subcategory
                  </>
                )}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ProductForm({
  product,
  onClose,
  onSaved,
  allCategories,
  getSubcategoriesFor,
  defaultCategory,
  defaultSubcategory,
}: {
  product: CatalogItem;
  onClose: () => void;
  onSaved: () => void;
  allCategories: string[];
  getSubcategoriesFor: (cat: string) => string[];
  defaultCategory?: string;
  defaultSubcategory?: string;
}) {
  const [values, setValues] = useState<CatalogItem>(() => {
    // Normalize gallery: accept string[] or [{url}] from older rows.
    const rawGallery = (product as any).gallery;
    let gallery: string[] = [];
    if (Array.isArray(rawGallery)) {
      gallery = rawGallery
        .map((g) => (typeof g === "string" ? g : g?.url))
        .filter((u): u is string => typeof u === "string" && u.length > 0);
    }
    return {
      ...empty,
      ...product,
      gallery,
      category: product.category || defaultCategory || "",
      tags:
        product.tags && product.tags.length > 0
          ? product.tags
          : defaultSubcategory
            ? [defaultSubcategory]
            : [],
    };
  });
  const [saving, setSaving] = useState(false);
  const [catSearch, setCatSearch] = useState("");

  // Auto-slug from name until the user edits the slug field manually.
  const slugTouched = useRef(false);
  useEffect(() => {
    if (slugTouched.current) return;
    const auto = slugify(values.name);
    setValues((prev) => (prev.slug === auto ? prev : { ...prev, slug: auto }));
  }, [values.name]);

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
              gallery: values.gallery || [],
              features: values.features || {},
              seo_title: values.seo_title || null,
              seo_description: values.seo_description || null,
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
              gallery: values.gallery || [],
              features: values.features || {},
              seo_title: values.seo_title || null,
              seo_description: values.seo_description || null,
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
    selectedCats.flatMap((cat) => getSubcategoriesFor(cat)),
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
        <Input
          value={values.name}
          onChange={(e) => set("name", e.target.value)}
          className="mt-1.5"
          placeholder="Product name"
        />
      </div>
      <div>
        <Label>Slug</Label>
        <Input
          value={values.slug}
          onChange={(e) => {
            slugTouched.current = true;
            set("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"));
          }}
          placeholder={slugify(values.name) || "auto-from-name"}
          className="mt-1.5 font-mono text-xs"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Auto-detected from the name. Edit manually only if you need a custom URL.
        </p>
      </div>

      {/* Primary image — library / local upload only, no URL field */}
      <div>
        <Label>Primary image</Label>
        <p className="text-xs text-muted-foreground mt-0.5 mb-1.5">
          Main product photo. Upload from your computer or pick from the media library.
        </p>
        <div className="mt-1.5">
          <MediaPicker
            value={values.image_url ?? ""}
            onChange={(v) => set("image_url", v)}
            hideUrl
          />
        </div>
      </div>

      {/* Secondary images — multi grid with corner remove */}
      <SecondaryImagesField
        value={(values.gallery || []).filter(Boolean)}
        onChange={(next) => set("gallery", next)}
      />

      <div>
        <Label htmlFor="product-highlights">Product Highlights</Label>
        <p className="text-xs text-muted-foreground mt-0.5 mb-1.5">
          Short selling points shown on the product page.
        </p>
        <Textarea
          id="product-highlights"
          rows={4}
          value={values.description ?? ""}
          onChange={(e) => set("description", e.target.value)}
          className="mt-1.5"
          placeholder="Key features and highlights for this product…"
        />
      </div>

      {/* Specs table: checkbox + value. Only checked rows render on the product page. */}
      <div>
        <Label>Specifications</Label>
        <p className="text-xs text-muted-foreground mt-0.5 mb-2">
          Tick a property to enable it, then fill the value. Unchecked properties are hidden on the website.
        </p>
        <div className="rounded-md border border-border divide-y divide-border overflow-hidden bg-surface/30">
          {PRODUCT_FEATURES.map((f) => {
            const entry = (values.features || {})[f.key] || { show: false, value: "" };
            return (
              <div key={f.key} className="flex items-center gap-3 px-3 py-2.5">
                <Checkbox
                  checked={entry.show}
                  onCheckedChange={(checked) => {
                    set("features", {
                      ...(values.features || {}),
                      [f.key]: { ...entry, show: Boolean(checked) },
                    });
                  }}
                  id={`feat-${f.key}`}
                />
                <label
                  htmlFor={`feat-${f.key}`}
                  className="text-sm font-medium w-36 shrink-0 cursor-pointer"
                >
                  {f.label}
                </label>
                <Input
                  value={entry.value}
                  onChange={(e) => {
                    set("features", {
                      ...(values.features || {}),
                      [f.key]: { ...entry, show: entry.show, value: e.target.value },
                    });
                  }}
                  placeholder={f.placeholder}
                  disabled={!entry.show}
                  className="flex-1 text-sm"
                />
              </div>
            );
          })}
        </div>
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
          placeholder="best corporate gift, diary with pen…"
        />
      </div>

      {/* SEO — product page title / meta description for search engines */}
      <div className="rounded-md border border-border p-4 space-y-3 bg-surface/40">
        <div>
          <Label className="text-sm">SEO</Label>
          <p className="text-xs text-muted-foreground mt-0.5">
            Search listing for this product. Blank fields fall back to the product name and highlights.
          </p>
        </div>
        <div>
          <Label htmlFor="seo-title" className="text-xs">Meta title</Label>
          <Input
            id="seo-title"
            value={values.seo_title ?? ""}
            onChange={(e) => set("seo_title", e.target.value)}
            placeholder={`${values.name || "Product"} | GiftVibes`}
            maxLength={70}
            className="mt-1.5"
          />
          <div className="text-[10px] text-muted-foreground mt-1">
            {(values.seo_title ?? "").length}/60 recommended
          </div>
        </div>
        <div>
          <Label htmlFor="seo-desc" className="text-xs">Meta description</Label>
          <Textarea
            id="seo-desc"
            rows={3}
            value={values.seo_description ?? ""}
            onChange={(e) => set("seo_description", e.target.value)}
            placeholder="Short summary for Google and social shares."
            maxLength={200}
            className="mt-1.5"
          />
          <div className="text-[10px] text-muted-foreground mt-1">
            {(values.seo_description ?? "").length}/160 recommended
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-6">
        <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
          <Switch checked={values.featured} onCheckedChange={(v) => set("featured", v)} />
          Featured
        </label>
        <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
          <Switch checked={values.enabled} onCheckedChange={(v) => set("enabled", v)} />
          Live on site
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
  return s
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Secondary product images: tile grid, local/library pick, corner remove on each frame.
 * Shared by product + diary edit form.
 */
function SecondaryImagesField({
  value,
  onChange,
}: {
  value: string[];
  onChange: (next: string[]) => void;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const qc = useQueryClient();

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        const { url } = await uploadFileToBucket(file);
        urls.push(url);
      }
      onChange([...value, ...urls]);
      toast.success(urls.length === 1 ? "Image added" : `${urls.length} images added`);
      qc.invalidateQueries({ queryKey: ["media"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <div>
          <Label>Secondary images</Label>
          <p className="text-xs text-muted-foreground mt-0.5">
            Extra product shots for the gallery. Upload from your computer or pick from the library.
          </p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={(e) => handleFiles(e.target.files)}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploading}
            onClick={() => fileRef.current?.click()}
          >
            {uploading ? "Uploading…" : (
              <>
                <Plus className="h-3.5 w-3.5 mr-1" />
                Upload
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setPickerOpen(true)}
          >
            Library
          </Button>
        </div>
      </div>

      <div className="mt-2 grid grid-cols-3 sm:grid-cols-4 gap-2">
        {value.map((url, i) => (
          <div
            key={`${url}-${i}`}
            className="relative aspect-square rounded-md border border-border bg-surface-2 overflow-hidden group"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              title="Remove image"
              onClick={() => onChange(value.filter((_, j) => j !== i))}
              className="absolute top-1.5 right-1.5 h-7 w-7 rounded-full bg-black/70 text-white flex items-center justify-center shadow-sm opacity-90 hover:opacity-100 hover:bg-destructive transition"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="aspect-square rounded-md border border-dashed border-border bg-surface/40 flex flex-col items-center justify-center gap-1 text-xs text-muted-foreground hover:border-primary/40 hover:text-primary transition"
        >
          <Plus className="h-5 w-5" />
          Add
        </button>
      </div>

      {value.length === 0 && (
        <p className="text-xs text-muted-foreground italic mt-1.5">
          No secondary images yet.
        </p>
      )}

      <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Add secondary image from library</DialogTitle>
          </DialogHeader>
          <div className="py-2 max-h-[60vh] overflow-y-auto">
            <MediaGrid
              onPick={(url) => {
                if (url) {
                  onChange([...value, url]);
                  setPickerOpen(false);
                  toast.success("Image added");
                }
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
