import type { Metadata } from "next";
import dynamic from "next/dynamic";
import Header from "@/components/sections/header";
import Hero from "@/components/sections/hero";
import Categories from "@/components/sections/categories";
import BestDiscountsBanner from "@/components/sections/best-discounts";
import GiftVibeAbout from "@/components/sections/giftvibe-about";
import Footer from "@/components/sections/footer";
import { prisma } from "@/lib/prisma";
import { getStorefrontData, getSeo, getCatalogFolders } from "@/lib/site";
import { getCachedLiveCatalog } from "@/lib/catalog";
import {
  mapEnabledSections,
  mapCatalogFolders,
  parseCustomTabs,
  normalizeTabProductIds,
} from "@/lib/cms/mappers";

const BestDealsSection = dynamic(() => import("@/components/sections/best-deals"));
const WhyChooseUsSection = dynamic(() => import("@/components/sections/why-choose-us"));
const CustomerSatisfaction = dynamic(() => import("@/components/sections/customer-satisfaction"));
const BrandsSection = dynamic(() => import("@/components/sections/brands"));
const WeeklyPopularProducts = dynamic(() => import("@/components/sections/weekly-popular"));
const CashBackSection = dynamic(() => import("@/components/sections/cash-back"));
const TabbedProducts = dynamic(() => import("@/components/sections/tabbed-products"));
const CashBackBottom = dynamic(() => import("@/components/sections/cash-back-bottom"));
const ServicesSection = dynamic(() => import("@/components/sections/services"));
const CorporateShowcase = dynamic(() => import("@/components/sections/corporate-showcase"));

// Admin /api/revalidate still busts this. 60s ISR so visitors are not hitting Postgres every click.
export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeo("home").catch(() => null);
  return {
    title: seo?.title || "Customised Corporate Diaries Manufacturer Delhi",
    description:
      seo?.description ||
      "GiftVibes (Ravindra Enterprises) manufactures customised diaries, planners and corporate gift sets in Delhi since 1999. Bulk logo branding. PAN-India delivery.",
    alternates: { canonical: "/" },
    openGraph: {
      title: seo?.title || "Customised Corporate Diaries Manufacturer Delhi | GiftVibes",
      url: "/",
    },
  };
}

/** Fields home sections need for product cards + ID lookup (avoid full-row schema drift). */
const catalogSelect = {
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

async function getCatalog() {
  try {
    const live = await getCachedLiveCatalog();
    return live.map((row) => ({ ...row, id: String(row.id) }));
  } catch (e) {
    console.error("home getCatalog failed", e);
    return [] as any[];
  }
}

async function getHomeSections() {
  try {
    const sections = await prisma.pageSection.findMany({
      where: { pageKey: "home" },
      orderBy: { sortOrder: "asc" },
    });
    return mapEnabledSections(
      sections.map((s) => ({
        sectionKey: s.sectionKey,
        enabled: s.enabled,
        content: s.content,
        sortOrder: s.sortOrder,
      })),
    );
  } catch (e) {
    console.error("home getHomeSections failed", e);
    return {} as Record<string, any>;
  }
}

/** Pull every admin-picked product/diary id from home section content. */
function collectPickedIds(sections: Record<string, any>): string[] {
  const ids: string[] = [];
  for (const key of ["best_deals", "popular", "tabbed_products", "best_deals_tabbed"]) {
    const c = sections[key];
    if (!c) continue;
    if (Array.isArray(c.items)) {
      ids.push(...normalizeTabProductIds(c.items));
    }
    for (const tab of parseCustomTabs(c)) {
      ids.push(...tab.productIds);
    }
  }
  return [...new Set(ids.map(String))];
}

/** Ensure admin-picked UUIDs exist in the catalog even if a bulk list missed them. */
async function hydrateCatalogPicks(catalog: any[], sections: Record<string, any>) {
  const wanted = collectPickedIds(sections);
  if (!wanted.length) return catalog;
  const have = new Set(catalog.map((r) => String(r.id).toLowerCase()));
  const missing = wanted.filter((id) => !have.has(id.toLowerCase()));
  if (!missing.length) return catalog;

  try {
    const [extraProducts, extraDiaries] = await Promise.all([
      prisma.product
        .findMany({ where: { id: { in: missing } }, select: catalogSelect })
        .catch(() => [] as any[]),
      prisma.diary
        .findMany({ where: { id: { in: missing } }, select: catalogSelect })
        .catch(() => [] as any[]),
    ]);
    const extra = filterLiveCatalog(
      JSON.parse(JSON.stringify([...extraProducts, ...extraDiaries])) as any[],
    ).map((row: any) => ({ ...row, id: String(row.id) }));
    if (!extra.length) return catalog;
    return [...catalog, ...extra];
  } catch (e) {
    console.error("home hydrateCatalogPicks failed", e);
    return catalog;
  }
}

export default async function HomePage() {
  // Isolate failures: one bad query must not blank the whole homepage.
  const [catalogRaw, sections, storefront, catalogFolders] = await Promise.all([
    getCatalog(),
    getHomeSections(),
    getStorefrontData().catch((e) => {
      console.error("home getStorefrontData failed", e);
      return {
        settings: undefined as any,
        headerNav: undefined as any,
        megaMenu: undefined as any,
        footerLinks: undefined as any,
      };
    }),
    getCatalogFolders().catch((e) => {
      console.error("home getCatalogFolders failed", e);
      return [] as { name: string; subcategories: string[] }[];
    }),
  ]);

  // Second pass: fetch any tab/picker IDs missing from the bulk catalog (diaries often).
  const catalog = await hydrateCatalogPicks(catalogRaw, sections);

  const settings = storefront?.settings;
  const headerNav = storefront?.headerNav;
  const megaMenu = storefront?.megaMenu;
  const footerLinks = storefront?.footerLinks;
  const liveMega = mapCatalogFolders(catalogFolders);
  const headerMega = liveMega.length ? liveMega : megaMenu;

  return (
    <div className="min-h-screen">
      <Header
        nav={headerNav}
        megaMenu={headerMega}
        logoUrl={settings?.logoUrl}
        brandName={settings?.brandName}
      />

      <main>
        {sections.hero !== undefined && <Hero content={sections.hero} />}
        {sections.about !== undefined && <GiftVibeAbout content={sections.about} />}
        {sections.discounts !== undefined && <BestDiscountsBanner content={sections.discounts} />}
        {sections.categories !== undefined && (
          <Categories content={sections.categories} folders={catalogFolders} />
        )}
        {sections.best_deals !== undefined && (
          <BestDealsSection content={sections.best_deals} products={catalog} />
        )}
        {sections.brands !== undefined && <BrandsSection content={sections.brands} />}
        {sections.popular !== undefined && (
          <WeeklyPopularProducts content={sections.popular} products={catalog} />
        )}
        {sections.cashback !== undefined && <CashBackSection content={sections.cashback} />}
        {(sections.tabbed_products !== undefined || sections.best_deals_tabbed !== undefined) && (
          <TabbedProducts
            products={catalog}
            content={sections.tabbed_products || sections.best_deals_tabbed}
          />
        )}
        {sections.why_choose_us !== undefined && (
          <WhyChooseUsSection content={sections.why_choose_us} />
        )}
        {sections.satisfaction !== undefined && (
          <CustomerSatisfaction content={sections.satisfaction} />
        )}
        {sections.cashback_bottom !== undefined && (
          <CashBackBottom content={sections.cashback_bottom} />
        )}
        {sections.services !== undefined && <ServicesSection content={sections.services} />}
        {sections.corporate_showcase !== undefined && (
          <CorporateShowcase content={sections.corporate_showcase} />
        )}
      </main>

      <Footer settings={settings} footerLinks={footerLinks} />
    </div>
  );
}