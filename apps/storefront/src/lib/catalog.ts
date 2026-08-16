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
    seoTitle: row.seoTitle ?? null,
    seoDescription: row.seoDescription ?? null,
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

export async function listLiveCatalog(take = 200) {
  try {
    const { prisma } = await import("@/lib/prisma");
    const [products, diaries] = await Promise.all([
      prisma.product.findMany({
        where: { enabled: true },
        orderBy: { minPrice: "asc" },
        take,
        select: SAFE_SELECT,
      }),
      prisma.diary.findMany({
        where: { enabled: true },
        orderBy: { minPrice: "asc" },
        take,
        select: SAFE_SELECT,
      }),
    ]);
    return [
      ...products.map((p) => mapRow(p, "product")),
      ...diaries.map((d) => mapRow(d, "diary")),
    ];
  } catch (e) {
    console.error("listLiveCatalog failed", e);
    return [];
  }
}
