import Header from "@/components/sections/header";
import Hero from "@/components/sections/hero";
import Categories from "@/components/sections/categories";
import BestDealsSection from "@/components/sections/best-deals";
import BrandsSection from "@/components/sections/brands";
import DiscountsSection from "@/components/sections/discounts";
import WeeklyPopularProducts from "@/components/sections/weekly-popular";
import CashBackSection from "@/components/sections/cash-back";
import TabbedProducts from "@/components/sections/tabbed-products";
import CashBackBottom from "@/components/sections/cash-back-bottom";
import MostSellingProducts from "@/components/sections/most-selling";
import TrendingProducts from "@/components/sections/trending-products";
import BestSellingStore from "@/components/sections/best-selling-store";
import ServicesSection from "@/components/sections/services";
import Footer from "@/components/sections/footer";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Header />
      
      <main>
        <Hero />
        <Categories />
        <BestDealsSection />
        <BrandsSection />
        <DiscountsSection />
        <WeeklyPopularProducts />
        <CashBackSection />
        <TabbedProducts />
        <CashBackBottom />
        <MostSellingProducts />
        <TrendingProducts />
        <BestSellingStore />
        <ServicesSection />
      </main>
      
      <Footer />
    </div>
  );
}