"use client";

import Image from "next/image";

const popularProducts = [
  {
    name: "Black Note Book With Pen Gift Set RE 570",
    price: "198.00",
    currency: "INR",
    description: "Hardcover black notebook with matching metal pen, 100 GSM ruled pages and gift-ready box.",
    image: "/diary/trendingdiary.png",
  },
  {
    name: "Blue Note Book With Pen Gift Set RE 571",
    price: "198.00",
    currency: "INR",
    description: "Matte blue finish, elastic closure, ribbon bookmark and premium ball pen included.",
    image: "/diary/trendingdiary2.png",
  },
  {
    name: "Brown Note Book With Pen Gift Set RE 572",
    price: "200.00",
    currency: "INR",
    description: "Classic brown PU cover, 120 ruled sheets, pen loop and pocket sleeve for notes.",
    image: "/diary/trendingdiary3.png",
  },
  {
    name: "Soft Cover Note Book With Pen Gift Set RE 578",
    price: "230.00",
    currency: "INR",
    description: "Flexible soft‑touch cover with lay‑flat binding, smooth pen and kraft gift packaging.",
    image: "/diary/trendingdiary41.png",
  },
  {
    name: "Grey Note Book With Pen Gift Set RE 579",
    price: "230.00",
    currency: "INR",
    description: "Elegant grey textured cover, date header pages, metal clip pen and magnetic clasp.",
    image: "/diary/trendingdiary5.png",
  },
];

const RATING = 5;
const REVIEWS = 121;

const WeeklyPopularProducts = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container">
        <h3 className="text-2xl font-semibold text-[#333333] mb-10">Trending Diary Collections</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {popularProducts.map((product) => (
            <div key={product.name} className="flex flex-col group">
              <div className="relative bg-white p-6 flex items-center justify-center aspect-square overflow-hidden product-image-container">
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
                  <p className="text-lg font-bold text-[#333333] whitespace-nowrap">{product.currency === 'INR' ? '₹' : '$'}{product.price}</p>
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
                <a href="#" className="w-full mt-auto block text-center py-2.5 px-4 rounded-md border border-[#e5e5e5] text-sm font-medium text-[#333333] bg-white hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors duration-200">
                  Add to Cart
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WeeklyPopularProducts;