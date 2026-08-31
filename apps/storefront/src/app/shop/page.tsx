import type { Metadata } from "next";
import { Suspense } from "react";
import Header from "@/components/sections/header";
import Footer from "@/components/sections/footer";
import ShopClient from "./ShopClient";
import { getStorefrontData, getShopChrome } from "@/lib/site";
import { productHref } from "@/lib/seo";
import { getCachedLiveCatalog } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Shop Customised Diaries & Corporate Gift Sets",
  description:
    "Browse PU leather diaries, New Year planners, gift sets and promotional notebooks. Factory-direct from GiftVibes, Delhi. Bulk enquiry welcome.",
  alternates: { canonical: "/shop" },
};

export const revalidate = 60;

export default async function ShopPage() {
  // Catalogue first so it is not starved by header/footer/chrome queries
  // on the same serverless Prisma pool (that race rendered "0 live items").
  const [catalog, storefront, chrome] = await Promise.all([
    getCachedLiveCatalog(),
    getStorefrontData(),
    getShopChrome(),
  ]);

  const allDiaries = catalog.filter((i) => i.kind === "diary");
  const allProducts = catalog.filter((i) => i.kind === "product");
  const heading = chrome.heading?.trim() || "Customised diaries & corporate gift sets";

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        nav={storefront.headerNav}
        megaMenu={storefront.megaMenu}
        logoUrl={storefront.settings?.logoUrl}
        brandName={storefront.settings?.brandName}
      />
      <section className="container pt-10 pb-4">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800">{heading}</h1>
        <p className="mt-3 max-w-3xl text-gray-600">
          Wholesale catalogue from GiftVibes (Ravindra Enterprises), Delhi. PU leather diaries, New
          Year planners, gift sets and promotional notebooks. Minimum order typically 100. Filter
          below or open a product to request a bulk quote.
        </p>
        <p className="mt-2 text-sm text-gray-500">{catalog.length} live items</p>
      </section>
      <Suspense
        fallback={
          <div className="container py-8 text-sm text-muted-foreground">Loading filters…</div>
        }
      >
        <ShopClient
          initialDiaries={allDiaries as any}
          initialProducts={allProducts as any}
          chrome={chrome}
        />
      </Suspense>
      <nav className="container py-10" aria-label="Full catalogue">
        <h2 className="text-xl font-semibold text-[#124559] mb-4">Full catalogue</h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-sm">
          {catalog.map((item) => (
            <li key={item.id}>
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
