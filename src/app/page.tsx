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

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Header />
      
      <main>
        <Hero />
        <GiftVibeAbout />
        <BestDiscountsBanner />
        <Categories />
        <BestDealsSection />
        <BrandsSection />
        <WeeklyPopularProducts />
        <CashBackSection />
        <TabbedProducts />
        {/* Move these two sections just above the special discount banner */}
        <WhyChooseUsSection />
        <CustomerSatisfaction />
        <CashBackBottom />
        <ServicesSection />
      </main>
      
      <Footer />
    </div>
  );
}