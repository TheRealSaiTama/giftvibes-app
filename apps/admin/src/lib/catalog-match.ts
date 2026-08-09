/**
 * Match storefront default section product names to live Supabase catalog IDs.
 * Mirrors storefront mappers matchCatalogIdsByNames (keep in sync).
 */

export const DEFAULT_BEST_DEALS_NAMES = [
  "Management Premium PU Leather Diary 2026",
  "DIRECTORS Premium Leather Diary 2026",
  "Heritage Leather Executive Diary 2026",
  "Paipin Brown Executive Leather Diary",
] as const;

export const DEFAULT_POPULAR_NAMES = [
  "Primo A5 Corporate Diary and Pen Set",
  "Wooden A5 Corporate Diary and Pen Set",
  "Polo A5 Corporate Diary and Pen Set",
  "50-50 B5 Diary Calendar with Pen Combo Set",
  "Oval Leather B5 Diary with Pen Gift Set",
] as const;

export function normalizeCatalogName(name: string): string {
  return String(name || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function matchCatalogIdsByNames(
  catalog: { id: string | number; name?: string | null }[] | null | undefined,
  wantedNames: readonly string[],
  max: number,
): { productId: string }[] {
  if (!catalog?.length || max <= 0) return [];
  const used = new Set<string>();
  const out: { productId: string }[] = [];

  for (const want of wantedNames) {
    if (out.length >= max) break;
    const nw = normalizeCatalogName(want);
    if (!nw) continue;
    const hit = catalog.find((c) => {
      const id = String(c.id);
      if (!id || used.has(id)) return false;
      const nc = normalizeCatalogName(c.name || "");
      if (!nc) return false;
      return nc === nw || nc.includes(nw) || nw.includes(nc);
    });
    if (hit) {
      const id = String(hit.id);
      used.add(id);
      out.push({ productId: id });
    }
  }

  if (out.length === 0) {
    for (const c of catalog) {
      if (out.length >= max) break;
      const id = String(c.id);
      if (!id || used.has(id)) continue;
      used.add(id);
      out.push({ productId: id });
    }
  }

  return out;
}

export function sectionItemsEmpty(content: unknown): boolean {
  if (!content || typeof content !== "object") return true;
  const items = (content as { items?: unknown }).items;
  if (!Array.isArray(items) || items.length === 0) return true;
  return !items.some(
    (it) => it && typeof it === "object" && typeof (it as { productId?: string }).productId === "string",
  );
}
