/** Shared catalog folder tree. Source of truth is page_sections catalog/folders. */

export const UNSORTED_SUB = "Unsorted";

export type CatalogFolder = {
  name: string;
  aliases: string[];
  subcategories: string[];
  seoTitle: string;
  seoDescription: string;
  ogImageUrl: string;
};

export function normCat(s: string) {
  return s.trim().toUpperCase().replace(/\s+/g, " ");
}

function folder(
  name: string,
  subcategories: string[],
  aliases: string[] = [],
): CatalogFolder {
  return {
    name,
    aliases,
    subcategories,
    seoTitle: "",
    seoDescription: "",
    ogImageUrl: "",
  };
}

/** Built-in GiftVibes folders. Aliases keep legacy product.category strings matching. */
export const DEFAULT_CATALOG_FOLDERS: CatalogFolder[] = [
  folder("CORPORATE GIFT SETS", ["Diary & Pen Sets", "Calendar Sets", "Giftsets", "General / Others"], ["CORPORATE GIFT SET"]),
  folder("NEW YEAR DIARY", ["Eco-Friendly & Green", "Leather Diaries", "Hard Bound Diaries", "Planners & Themes", "Economy & Regular", "General / Others"], ["NEW YEAR DIARIES", "NEW YEAR DIARY BOOKS"]),
  folder("LEATHER GIFT ITEMS", ["Bags & Portfolios", "Leather Accessories"]),
  folder("LEATHER BAGS", ["Executive Bags"]),
  folder("JUTE BAGS", ["Eco Jute Bags"]),
  folder("BOTTLES GIFT SET", ["Bottle & Flask Sets"], ["BOTTLE GIFT SETS", "BOTTLES GIFT SETS"]),
  folder("POWER BANK DIARIES", ["Tech Power Bank Diaries"]),
  folder("PEN STANDS", ["Desktop Accessories"]),
  folder("PROMOTIONAL UMBRELLAS", ["Umbrellas"]),
  folder("CUSTOMISED DIARY & NOTE BOOKS", ["Eco-Friendly & Green", "Leather Diaries", "Hard Bound Diaries", "Planners & Themes", "Economy & Regular", "General / Others"], ["CUSTOMIZED DIARY & NOTE BOOKS"]),
  folder("CALENDARS", ["Desktop & Wall Calendars"]),
  folder("EXHIBITION VISITOR'S GIFT IDEAS", ["Giveaways & Promos"], ["EXHIBITION VISITORS GIFT IDEAS"]),
];

export function normalizeFolder(raw: unknown): CatalogFolder | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const name = typeof r.name === "string" ? r.name.trim() : "";
  if (!name) return null;
  const aliases = Array.isArray(r.aliases)
    ? r.aliases.filter((a): a is string => typeof a === "string" && a.trim().length > 0).map((a) => a.trim())
    : [];
  const subcategories = Array.isArray(r.subcategories)
    ? r.subcategories.filter((s): s is string => typeof s === "string" && s.trim().length > 0).map((s) => s.trim())
    : [];
  return {
    name,
    aliases,
    subcategories,
    seoTitle: typeof r.seoTitle === "string" ? r.seoTitle : "",
    seoDescription: typeof r.seoDescription === "string" ? r.seoDescription : "",
    ogImageUrl: typeof r.ogImageUrl === "string" ? r.ogImageUrl : "",
  };
}

export function parseCatalogTree(content: unknown): CatalogFolder[] {
  const cats = content && typeof content === "object" ? (content as { categories?: unknown }).categories : null;
  if (!Array.isArray(cats) || cats.length === 0) return [];
  return cats.map(normalizeFolder).filter((f): f is CatalogFolder => !!f);
}

export function findFolder(tree: CatalogFolder[], name: string): CatalogFolder | undefined {
  const n = normCat(name);
  return tree.find((f) => normCat(f.name) === n);
}

/** Exact folder name or listed alias only — no keyword / includes matching. */
export function matchCategory(productCat: string | null, folder: CatalogFolder): boolean {
  if (!productCat) return false;
  const needles = new Set<string>([normCat(folder.name), ...folder.aliases.map(normCat)]);
  return productCat
    .split(",")
    .map((c) => normCat(c))
    .some((pc) => !!pc && needles.has(pc));
}

/**
 * Subfolder is the product's tag that matches this folder's subcategory list.
 * No name heuristics — that was moving products between folders by themselves.
 */
export function getSubcategory(item: { tags?: string[] | null }, folder: CatalogFolder): string {
  const tags = item.tags || [];
  const hit = folder.subcategories.find((s) => tags.includes(s));
  return hit || UNSORTED_SUB;
}

export function folderMatchesAny(productCat: string | null, tree: CatalogFolder[]): boolean {
  return tree.some((f) => matchCategory(productCat, f));
}

/** One-time: lift this browser's old localStorage overlays onto the default tree. */
export function mergeLegacyLocalStorage(base: CatalogFolder[] = DEFAULT_CATALOG_FOLDERS): CatalogFolder[] {
  if (typeof window === "undefined") return base.map((f) => ({ ...f, aliases: [...f.aliases], subcategories: [...f.subcategories] }));
  const read = <T,>(key: string, fallback: T): T => {
    try {
      const raw = JSON.parse(localStorage.getItem(key) || "null");
      return raw == null ? fallback : (raw as T);
    } catch {
      return fallback;
    }
  };

  const hidden = new Set((read<string[]>("gv_hidden_categories", [])).map(normCat));
  const renames = read<Record<string, string>>("gv_category_renames", {});
  const customSubs = read<Record<string, string[]>>("gv_custom_subcategories", {});
  const hiddenSubs = read<Record<string, string[]>>("gv_hidden_subcategories", {});
  const subRenames = read<Record<string, Record<string, string>>>("gv_subcategory_renames", {});
  const customCats = read<unknown[]>("gv_custom_categories", []);
  const seo = read<Record<string, { seoTitle?: string; seoDescription?: string; ogImageUrl?: string }>>("gv_category_seo", {});

  const out: CatalogFolder[] = [];
  for (const f of base) {
    if (hidden.has(normCat(f.name))) continue;
    const renamed = renames[f.name] || renames[normCat(f.name)];
    const name = renamed || f.name;
    const aliases = [...f.aliases];
    if (renamed && normCat(renamed) !== normCat(f.name) && !aliases.map(normCat).includes(normCat(f.name))) {
      aliases.push(f.name);
    }
    const hideSub = new Set([...(hiddenSubs[f.name] || []), ...(hiddenSubs[normCat(f.name)] || [])]);
    const renameMap = { ...(subRenames[f.name] || {}), ...(subRenames[normCat(f.name)] || {}) };
    const subs: string[] = [];
    for (const s of [...f.subcategories, ...(customSubs[f.name] || []), ...(customSubs[normCat(f.name)] || [])]) {
      if (hideSub.has(s) || hideSub.has(renameMap[s] || "")) continue;
      const label = renameMap[s] || s;
      if (!subs.includes(label)) subs.push(label);
    }
    const meta = seo[name] || seo[f.name] || {};
    out.push({
      ...f,
      name,
      aliases,
      subcategories: subs,
      seoTitle: meta.seoTitle || f.seoTitle,
      seoDescription: meta.seoDescription || f.seoDescription,
      ogImageUrl: meta.ogImageUrl || f.ogImageUrl,
    });
  }

  for (const item of customCats) {
    const name =
      typeof item === "string"
        ? item
        : item && typeof item === "object" && typeof (item as { name?: string }).name === "string"
          ? (item as { name: string }).name
          : "";
    if (!name || out.some((f) => normCat(f.name) === normCat(name))) continue;
    const meta = seo[name] || {};
    const extra = typeof item === "object" && item ? (item as { seoTitle?: string; seoDescription?: string }) : {};
    out.push({
      name,
      aliases: [],
      subcategories: customSubs[name] || customSubs[normCat(name)] || [],
      seoTitle: meta.seoTitle || extra.seoTitle || "",
      seoDescription: meta.seoDescription || extra.seoDescription || "",
      ogImageUrl: meta.ogImageUrl || "",
    });
  }
  return out;
}
