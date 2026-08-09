import Header from "@/components/sections/header";
import Hero from "@/components/sections/hero";
import Categories from "@/components/sections/categories";
import BestDealsSection from "@/components/sections/best-deals";
import BestDiscountsBanner from "@/components/sections/best-discounts";
import WhyChooseUsSection from "@/components/sections/why-choose-us";
import CustomerSatisfaction from "@/components/sections/customer-satisfaction";
import BrandsSection from "@/components/sections/brands";
import WeeklyPopularProducts from "@/components/sections/weekly-popular";
import CashBackSection from "@/components/sections/cash-back";
import TabbedProducts from "@/components/sections/tabbed-products";
import CashBackBottom from "@/components/sections/cash-back-bottom";
import ServicesSection from "@/components/sections/services";
import GiftVibeAbout from "@/components/sections/giftvibe-about";
import Footer from "@/components/sections/footer";
import CorporateShowcase from "@/components/sections/corporate-showcase";
import { prisma } from '@/lib/prisma';
import { getStorefrontData } from "@/lib/site";

// ponytail: revalidate=0 → page re-renders on every request after admin calls /api/revalidate.
// Without this the webhook no-ops (page would be fully static).
export const revalidate = 0;

async function getCatalog() {
  // Products + diaries so home sections can resolve admin-picked IDs from either table.
  // Never throw — a missing DB column/migration must not take down the whole site.
  try {
    const [products, diaries] = await Promise.all([
      prisma.product.findMany({ where: { enabled: true } }).catch((e) => {
        console.error("home getCatalog products failed", e);
        return [] as Awaited<ReturnType<typeof prisma.product.findMany>>;
      }),
      prisma.diary.findMany({ where: { enabled: true } }).catch((e) => {
        console.error("home getCatalog diaries failed", e);
        return [] as Awaited<ReturnType<typeof prisma.diary.findMany>>;
      }),
    ]);
    // Serialize to plain JSON so RSC never chokes on Prisma special types.
    return JSON.parse(JSON.stringify([...products, ...diaries])) as any[];
  } catch (e) {
    console.error("home getCatalog failed", e);
    return [] as any[];
  }
}

async function getHomeSections() {
  try {
    const sections = await prisma.pageSection.findMany({
      where: { pageKey: "home", enabled: true },
      orderBy: { sortOrder: "asc" },
    });
    return sections.reduce(
      (acc, curr) => {
        acc[curr.sectionKey] = curr.content;
        return acc;
      },
      {} as Record<string, any>,
    );
  } catch (e) {
    console.error("home getHomeSections failed", e);
    return {} as Record<string, any>;
  }
}

export default async function HomePage() {
  // Isolate failures: one bad query must not blank the whole homepage.
  const [catalog, sections, storefront] = await Promise.all([
    getCatalog(),
    getHomeSections(),
    getStorefrontData().catch((e) => {
      console.error("home getStorefrontData failed", e);
      return { settings: undefined as any, headerNav: undefined as any };
    }),
  ]);

  const settings = storefront?.settings;
  const headerNav = storefront?.headerNav;

  return (
    <div className="min-h-screen">
      <Header nav={headerNav} />

      <main>
        <Hero content={sections.hero} />
        <GiftVibeAbout content={sections.about} />
        <BestDiscountsBanner content={sections.discounts} />
        <Categories content={sections.categories} />
        <BestDealsSection content={sections.best_deals} products={catalog} />
        <BrandsSection content={sections.brands} />
        <WeeklyPopularProducts content={sections.popular} products={catalog} />
        <CashBackSection content={sections.cashback} />
        <TabbedProducts
          products={catalog}
          content={sections.tabbed_products || sections.best_deals_tabbed}
        />
        <WhyChooseUsSection content={sections.why_choose_us} />
        <CustomerSatisfaction content={sections.satisfaction} />
        <CashBackBottom content={sections.cashback_bottom} />
        <ServicesSection content={sections.services} />
        <CorporateShowcase content={sections.corporate_showcase} />
      </main>

      <Footer settings={settings} />
    </div>
  );
}