import type { MetadataRoute } from "next";
import { CATEGORY_LANDINGS, SITE_ORIGIN, productHref } from "@/lib/seo";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPaths = [
    "",
    "/shop",
    "/custom-design",
    "/corporate-gifting",
    "/guides",
    "/guides/new-year-diary-bulk-order-timeline",
    "/guides/logo-print-methods",
    "/guides/bulk-diary-specifications",
    "/guides/employee-joining-kits",
    "/industries/pharma",
    "/industries/banks",
    "/industries/joining-kits",
    "/industries/exhibition",
    ...CATEGORY_LANDINGS.map((c) => c.href),
  ];

  const now = new Date();
  const entries: MetadataRoute.Sitemap = staticPaths.map((path) => ({
    url: `${SITE_ORIGIN}${path}`,
    lastModified: now,
    changeFrequency: path === "" || path === "/shop" ? "daily" : "weekly",
    priority: path === "" ? 1 : path === "/corporate-gifting" || path === "/shop" ? 0.9 : 0.7,
  }));

  try {
    const { prisma } = await import("@/lib/prisma");
    const [products, diaries] = await Promise.all([
      prisma.product.findMany({
        where: { enabled: true },
        select: { id: true, slug: true, updatedAt: true },
        take: 2000,
      }),
      prisma.diary.findMany({
        where: { enabled: true },
        select: { id: true, slug: true, updatedAt: true },
        take: 2000,
      }),
    ]);
    for (const row of [...products, ...diaries]) {
      entries.push({
        url: `${SITE_ORIGIN}${productHref(row)}`,
        lastModified: row.updatedAt || now,
        changeFrequency: "weekly",
        priority: 0.6,
      });
    }
  } catch (e) {
    console.error("sitemap catalog failed", e);
  }

  return entries;
}
