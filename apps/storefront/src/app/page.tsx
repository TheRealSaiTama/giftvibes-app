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

async function getProducts() {
  const products = await prisma.product.findMany();
  return products;
}

async function getHomeSections() {
  const sections = await prisma.pageSection.findMany({
    where: { pageKey: 'home', enabled: true },
    orderBy: { sortOrder: 'asc' }
  });
  // Convert array to a keyed object for easy access
  return sections.reduce((acc, curr) => {
    acc[curr.sectionKey] = curr.content;
    return acc;
  }, {} as Record<string, any>);
}

export default async function HomePage() {
  const [products, sections, { settings, headerNav }] = await Promise.all([
    getProducts(),
    getHomeSections(),
    getStorefrontData(),
  ]);

  return (
    <div className="min-h-screen">
      <Header nav={headerNav} />

      <main>
        <Hero content={sections.hero} />
        <GiftVibeAbout content={sections.about} />
        <BestDiscountsBanner content={sections.discounts} />
        <Categories content={sections.categories} />
        <BestDealsSection content={sections.deals} />
        <BrandsSection content={sections.brands} />
        <WeeklyPopularProducts content={sections.popular} />
        <CashBackSection content={sections.cashback} />
        <TabbedProducts products={products} content={sections.tabbed_products} />
        {/* Move these two sections just above the special discount banner */}
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