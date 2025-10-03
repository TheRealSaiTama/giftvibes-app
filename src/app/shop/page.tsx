import Header from "@/components/sections/header";
import Hero from "@/components/sections/hero";
import Categories from "@/components/sections/categories";
import BestDeals from "@/components/sections/best-deals";
import WeeklyPopular from "@/components/sections/weekly-popular";
import Footer from "@/components/sections/footer";

export default function ShopPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Hero />
      <main className="container mx-auto px-4 py-8 space-y-12">
        <Categories />
        <BestDeals />
        <WeeklyPopular />
      </main>
      <Footer />
    </div>
  );
}
