import type { Metadata } from "next";
import { Suspense } from "react";
import Header from "@/components/sections/header";
import Footer from "@/components/sections/footer";
import ShopClient from "./ShopClient";
import { getStorefrontData, getShopChrome } from "@/lib/site";
import { filterLiveCatalog } from "@/lib/cms/mappers";
import { productHref } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Shop Customised Diaries & Corporate Gift Sets",
  description:
    "Browse PU leather diaries, New Year planners, gift sets and promotional notebooks. Factory-direct from GiftVibes, Delhi. Bulk enquiry welcome.",
  alternates: { canonical: "/shop" },
};

// ponytail: revalidate=0 so /api/revalidate can bust this page after admin edits.
export const revalidate = 0;

/** Live Prisma products only (admin enabled). No CSV. */
async function getProducts() {
  try {
    const { prisma } = await import("@/lib/prisma");
    const products = await prisma.product.findMany({
      where: { enabled: true },
      orderBy: { minPrice: "asc" },
      take: 1000,
    });
    return filterLiveCatalog(products as any[]);
  } catch (err) {
    console.error("shop getProducts failed", err);
    return [];
  }
}

/** Live Prisma diaries only (admin enabled). No CSV — hide/delete is real end-to-end. */
async function getDiaries() {
  try {
    const { prisma } = await import("@/lib/prisma");
    const diaries = await prisma.diary.findMany({
      where: { enabled: true },
      orderBy: { minPrice: "asc" },
      take: 1000,
    });
    return filterLiveCatalog(diaries as any[]);
  } catch (err) {
    console.error("shop getDiaries failed", err);
    return [];
  }
}

export default async function ShopPage() {
  const [allDiaries, allProducts, storefront, chrome] = await Promise.all([
    getDiaries(),
    getProducts(),
    getStorefrontData(),
    getShopChrome(),
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        nav={storefront.headerNav}
        megaMenu={storefront.megaMenu}
        logoUrl={storefront.settings?.logoUrl}
        brandName={storefront.settings?.brandName}
      />
      <Suspense
        fallback={
          <div className="container py-16 text-sm text-muted-foreground">Loading shop…</div>
        }
      >
        <ShopClient
          initialDiaries={allDiaries as any}
          initialProducts={allProducts as any}
          chrome={chrome}
        />
      </Suspense>
      <nav className="container py-8" aria-label="Product index">
        <h2 className="sr-only">All live products and diaries</h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-sm">
          {[...allProducts, ...allDiaries].slice(0, 200).map((item: any) => (
            <li key={String(item.id)}>
              <a className="text-[#124559] hover:underline" href={productHref(item)}>
                {item.name}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <Footer settings={storefront.settings} footerLinks={storefront.footerLinks} />
    </div>
  );
}
