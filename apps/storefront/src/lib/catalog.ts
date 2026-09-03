import { unstable_cache } from "next/cache";
import { isUuid } from "@/lib/seo";

/** Columns that exist on the original products/diaries tables (no seo/features). */
const SAFE_SELECT = {
  id: true,
  slug: true,
  name: true,
  description: true,
  minPrice: true,
  maxPrice: true,
  imageUrl: true,
  category: true,
  tags: true,
  gallery: true,
  enabled: true,
  featured: true,
} as const;

/** Homepage-proven columns. No gallery / orderBy / enabled-where. */
const LIST_SELECT = {
  id: true,
  slug: true,
  name: true,
  description: true,
  minPrice: true,
  maxPrice: true,
  imageUrl: true,
  category: true,
  tags: true,
  enabled: true,
  featured: true,
} as const;

const MIN_SELECT = {
  id: true,
  slug: true,
  name: true,
  description: true,
  minPrice: true,
  maxPrice: true,
  imageUrl: true,
  category: true,
  enabled: true,
} as const;

export type CatalogItem = {
  id: string;
  slug: string | null;
  name: string;
  description: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  imageUrl: string;
  category: string | null;
  tags: string[];
  gallery: string[];
  features: Record<string, any>;
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string | null;
  enabled: boolean;
  kind: "product" | "diary";
};

function mapRow(row: any, kind: "product" | "diary"): CatalogItem {
  return {
    id: String(row.id),
    slug: row.slug || null,
    name: row.name,
    description: row.description,
    minPrice: row.minPrice ?? null,
    maxPrice: row.maxPrice ?? null,
    imageUrl: row.imageUrl ?? "",
    category: row.category,
    tags: row.tags || [],
    gallery: Array.isArray(row.gallery) ? row.gallery : [],
    features: row.features && typeof row.features === "object" ? row.features : {},
    seoTitle: row.seoTitle ?? row.seo_title ?? null,
    seoDescription: row.seoDescription ?? row.seo_description ?? null,
    seoKeywords: row.seoKeywords ?? row.seo_keywords ?? null,
    enabled: row.enabled !== false,
    kind,
  };
}

/** Resolve a product or diary by slug or UUID. */
export async function findCatalogItem(param: string): Promise<CatalogItem | null> {
  const { prisma } = await import("@/lib/prisma");
  const key = decodeURIComponent(param).trim();
  if (!key) return null;

  const bySlug = async () => {
    const [p, d] = await Promise.all([
      prisma.product.findUnique({ where: { slug: key }, select: SAFE_SELECT }).catch(() => null),
      prisma.diary.findUnique({ where: { slug: key }, select: SAFE_SELECT }).catch(() => null),
    ]);
    if (p && p.enabled !== false) return mapRow(p, "product");
    if (d && d.enabled !== false) return mapRow(d, "diary");
    return null;
  };

  const hit = await bySlug();
  if (hit) return hit;

  if (!isUuid(key)) return null;

  const [p, d] = await Promise.all([
    prisma.product.findUnique({ where: { id: key }, select: SAFE_SELECT }).catch(() => null),
    prisma.diary.findUnique({ where: { id: key }, select: SAFE_SELECT }).catch(() => null),
  ]);
  if (p && p.enabled !== false) return mapRow(p, "product");
  if (d && d.enabled !== false) return mapRow(d, "diary");
  return null;
}

async function listTable(kind: "product" | "diary", take: number) {
  const { prisma } = await import("@/lib/prisma");
  const model = kind === "product" ? prisma.product : prisma.diary;
  try {
    return await model.findMany({ select: LIST_SELECT, take });
  } catch (e) {
    console.error(`listLiveCatalog ${kind} failed`, e);
    try {
      return await model.findMany({ select: MIN_SELECT, take });
    } catch (e2) {
      console.error(`listLiveCatalog ${kind} retry failed`, e2);
      return [] as any[];
    }
  }
}

export async function listLiveCatalog(take = 200) {
  const [products, diaries] = await Promise.all([
    listTable("product", take),
    listTable("diary", take),
  ]);
  const rows = [
    ...products.map((p) => mapRow(p, "product")),
    ...diaries.map((d) => mapRow(d, "diary")),
  ].filter((item) => item.enabled);
  rows.sort((a, b) => (a.minPrice ?? Number.POSITIVE_INFINITY) - (b.minPrice ?? Number.POSITIVE_INFINITY));
  return rows;
}

/** 60s cache so shop/home/SEO pages do not query Postgres on every click. */
export const getCachedLiveCatalog = unstable_cache(
  async () => listLiveCatalog(200),
  ["live-catalog-v2"],
  { revalidate: 60, tags: ["catalog"] },
);
