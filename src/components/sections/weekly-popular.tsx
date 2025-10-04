"use client";

import Image from "next/image";
import { useSelectedProducts } from '@/context/ProductContext';
import { Checkbox } from '@/components/ui/checkbox';

const popularProducts = [
  {
    id: 2001,
    name: "Primo A5 Corporate Diary and Pen Set",
    price: 225,
    minPrice: 225,
    maxPrice: 255,
    currency: "INR" as const,
    description: "Soft-touch PU diary with matching metal pen and premium planner pages in an elegant gift box.",
    image: "https://drive.google.com/uc?id=1UcB8Gmh4knL15Su_DsD5D0WihKEFN6pH",
  },
  {
    id: 2002,
    name: "Wooden A5 Corporate Diary and Pen Set",
    price: 230,
    minPrice: 230,
    maxPrice: 250,
    currency: "INR" as const,
    description: "Wood grain inspired diary with smooth pen, monthly planner inserts and custom branding ready box.",
    image: "https://drive.google.com/uc?id=1gfUUIhJoA_fhUtO5q8cosOqV9I8fGkVV",
  },
  {
    id: 2003,
    name: "Polo A5 Corporate Diary and Pen Set",
    price: 220,
    minPrice: 220,
    maxPrice: 245,
    currency: "INR" as const,
    description: "Premium PU diary combo with elastic closure, satin ribbon and logo-ready keepsake packaging.",
    image: "https://drive.google.com/uc?id=11pKAL_jh7Af3IQxxa49_MIbMXOT0tx7e",
  },
  {
    id: 2004,
    name: "50-50 B5 Diary Calendar with Pen Combo Set",
    price: 315,
    minPrice: 315,
    maxPrice: 332,
    currency: "INR" as const,
    description: "Executive B5 diary with detachable desk calendar, heavyweight pen and luxe presentation box.",
    image: "https://drive.google.com/uc?id=1ZHcdURpLfDV5ZQsoXlrRjttX_d5IT_86",
  },
  {
    id: 2005,
    name: "Oval Leather B5 Diary with Pen Gift Set",
    price: 300,
    minPrice: 300,
    maxPrice: 310,
    currency: "INR" as const,
    description: "Oval motif B5 diary in plush leatherette with premium metal pen and foil-ready gift box.",
    image: "https://drive.google.com/uc?id=1jIxlNwdi-E1f_-LyXT5eoP7g_JECd3JM",
  },
];

const RATING = 5;
const REVIEWS = 121;

const WeeklyPopularProducts = () => {
  const { selectProduct, deselectProduct, isSelected } = useSelectedProducts();

  return (
    <section className="py-16 bg-white">
      <div className="container">
        <h3 className="text-2xl font-semibold text-[#333333] mb-10">Trending Diary Giftsets</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {popularProducts.map((product) => {
            const selected = isSelected(product.id);
            const displayPrice = (() => {
              const hasRange = typeof product.minPrice === "number" && typeof product.maxPrice === "number" && product.minPrice !== product.maxPrice;
              if (hasRange) {
                return `${product.currency === 'INR' ? '₹' : '$'}${product.minPrice!.toLocaleString()} – ${product.currency === 'INR' ? '₹' : '$'}${product.maxPrice!.toLocaleString()}`;
              }
              const base = typeof product.minPrice === "number" ? product.minPrice : product.price;
              return typeof base === "number" && !Number.isNaN(base)
                ? `${product.currency === 'INR' ? '₹' : '$'}${base.toLocaleString()}`
                : 'On request';
            })();
            return (
              <div key={product.id} className="flex flex-col group relative">
                <div className="absolute top-2 left-2 z-10">
                  <Checkbox
                    checked={selected}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        selectProduct(product);
                      } else {
                        deselectProduct(product.id);
                      }
                    }}
                    className="data-[state=checked]:bg-[#124559] data-[state=checked]:border-[#124559]"
                  />
                </div>
                <div className="relative bg-white p-6 flex items-center justify-center aspect-square overflow-hidden product-image-container pt-8 pl-8">
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={200}
                    height={200}
                    className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                  <button className="absolute top-4 right-4 bg-white w-9 h-9 flex items-center justify-center rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                     <Image 
                      src="https://cdn.prod.website-files.com/63e857eaeaf853471d5335ff/63e9df775b939f51a0b22f6d_Icon.svg" 
                      alt="wishlist icon" 
                      width={16} 
                      height={16} 
                    />
                  </button>
                </div>
                <div className="pt-4 flex flex-col flex-grow">
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="text-base font-semibold text-[#333333] leading-tight">{product.name}</h4>
                    <p className="text-lg font-bold text-[#333333] whitespace-nowrap">{displayPrice}</p>
                  </div>
                  <p className="text-sm text-[#666666] mt-2 min-h-[40px]">{product.description}</p>
                  <div className="flex items-center gap-1.5 mt-2 mb-4">
                    <div className="flex gap-0.5">
                      {[...Array(RATING)].map((_, i) => (
                         <Image 
                          key={i}
                          src="https://cdn.prod.website-files.com/63e857eaeaf853471d5335ff/63e9d9ee08987e0ffb064bca_Star.svg" 
                          alt="star icon" 
                          width={16} 
                          height={16}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-[#888888]">({REVIEWS})</span>
                  </div>
                  <a 
                    href="#"
                    onClick={(e) => { 
                      e.preventDefault(); 
                      selectProduct(product);
                      console.log('Enquire for:', product.name); 
                    }}
                    className="w-full mt-auto block text-center py-2.5 px-4 rounded-md border border-[#e5e5e5] text-sm font-medium text-white bg-[#124559] hover:bg-[#0f3d4a] transition-colors duration-200"
                  >
                    Enquire Now
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WeeklyPopularProducts;