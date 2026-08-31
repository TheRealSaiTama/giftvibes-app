import { CATEGORY_LANDINGS, SITE_ORIGIN, productHref } from "@/lib/seo";

export const dynamic = "force-dynamic";

function urlEl(loc: string, lastmod?: string, changefreq = "weekly", priority = "0.7") {
  return `  <url>
    <loc>${loc}</loc>
    ${lastmod ? `<lastmod>${lastmod}</lastmod>` : ""}
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

export async function GET() {
  const staticPaths = [
    { path: "", freq: "daily", pri: "1.0" },
    { path: "/shop", freq: "daily", pri: "0.9" },
    { path: "/corporate-gifting", freq: "weekly", pri: "0.9" },
    { path: "/custom-design", freq: "weekly", pri: "0.8" },
    { path: "/industries/pharma", freq: "weekly", pri: "0.7" },
    { path: "/industries/banks", freq: "weekly", pri: "0.7" },
    { path: "/industries/joining-kits", freq: "weekly", pri: "0.7" },
    { path: "/industries/exhibition", freq: "weekly", pri: "0.7" },
    ...CATEGORY_LANDINGS.map((c) => ({ path: c.href, freq: "weekly", pri: "0.8" })),
  ];

  const now = new Date().toISOString();
  const chunks = staticPaths.map((p) =>
    urlEl(`${SITE_ORIGIN}${p.path}`, now, p.freq, p.pri),
  );

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
      chunks.push(
        urlEl(
          `${SITE_ORIGIN}${productHref(row)}`,
          (row.updatedAt || new Date()).toISOString(),
          "weekly",
          "0.6",
        ),
      );
    }
  } catch (e) {
    console.error("sitemap catalog failed", e);
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${chunks.join("\n")}
</urlset>
`;

  return new Response(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
