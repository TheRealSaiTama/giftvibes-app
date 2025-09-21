"use client";

import * as React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

type Product = {
  id: number;
  name: string;
  price: number;
  description: string;
  image: string;
  rating: number;
  reviewCount: number;
  currency?: string;
};

const gadgetProducts: Product[] = [
  {
    id: 1,
    name: "Go Green Leather Diary 2026 With Planner",
    price: 138.00,
    description: "Eco-friendly PU leather diary with weekly/monthly planner, 120 GSM pages, pen loop and bookmark.",
    image: "/diary/gogreen.png",
    rating: 5,
    reviewCount: 121,
    currency: "INR",
  },
  {
    id: 2,
    name: "A5 ANT Leather Planner Diary 2026",
    price: 110.00,
    description: "Organic Cotton, fairtrade certified",
    image: "/diary/antleather.png",
    rating: 5,
    reviewCount: 121,
    currency: "INR",
  },
  {
    id: 3,
    name: "Lino A5 Leather Diary 2026",
    price: 120.00,
    description: "A perfect balance of high-fidelity audio",
    image: "/diary/lino.png",
    rating: 5,
    reviewCount: 121,
    currency: "INR",
  },
  {
    id: 4,
    name: "DIRECTORS Premium Leather Diary 2026",
    price: 172.0,
    description: "15 in. x 10 in. -Flap top closure",
    image: "/diary/directors.png",
    rating: 5,
    reviewCount: 121,
    currency: "INR",
  },
  {
    id: 5,
    name: "Primo A5 Corporate Diary And Pen Set",
    price: 225.0,
    description: "Table with air purifier, stained veneer/black",
    image: "/diary/2025.png",
    rating: 5,
    reviewCount: 121,
    currency: "INR",
  },
  {
    id: 6,
    name: "Wooden A5 Corporate Diary And Pen Set",
    price: 230.0,
    description: "Organic Cotton, fairtrade certified",
    image: "/diary/woodendiary.png",
    rating: 5,
    reviewCount: 121,
    currency: "INR",
  },
  {
    id: 7,
    name: "50-50 B5 Diary Calendar With Pen Combo Set",
    price:  315.00,
    description: "256, 8 core GPU, 8 GB",
    image: "/diary/5050.png",
    rating: 5,
    reviewCount: 121,
    currency: "INR",
  },
  {
    id: 8,
    name: "Ovel Leather B5 Diary Calendar With Pen Combo Set",
    price: 300.00,
    description: "5 Colors Available",
    image: "/diary/ovel.png",
    rating: 5,
    reviewCount: 121,
    currency: "INR",
  },
  {
    id: 9,
    name: "Paipin Brown Executive Leather Diary",
    price: 154.00,
    description: "Table with air purifier, stained veneer/black",
    image: "/diary/papin.png",
    rating: 5,
    reviewCount: 121,
    currency: "INR",
  },
];

const tabs = [
  "Diaries",
  "Gift Sets",
  "Planners",
  "Notebooks",
  "Logo Printed",
  "Eco Series",
  "Corporate Combos",
  "Accessories",
];

const productsByCategory: { [key: string]: Product[] } = {
  Diaries: gadgetProducts,
  "Gift Sets": [...gadgetProducts].reverse(),
  Planners: gadgetProducts,
  Notebooks: [...gadgetProducts].reverse(),
  "Logo Printed": gadgetProducts,
  "Eco Series": [...gadgetProducts].reverse(),
  "Corporate Combos": gadgetProducts,
  Accessories: [...gadgetProducts].reverse(),
};

interface ProductCardProps {
  product: Product;
  className?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, className }) => {
  return (
    <div
      className={cn(
        "bg-card rounded-lg border border-border shadow-[0_2px_8px_rgba(0,0,0,0.05)] p-4 flex flex-col transition-shadow hover:shadow-lg",
        className
      )}
    >
      <div className="relative bg-secondary rounded-md flex items-center justify-center p-5 mb-5 h-[230px] overflow-hidden">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-contain transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 22vw"
        />
        <button className="absolute top-2.5 right-2.5 bg-white rounded-full w-8 h-8 flex items-center justify-center cursor-pointer shadow-sm z-10 transition-transform hover:scale-110">
          <Image
            src="https://cdn.prod.website-files.com/63e857eaeaf853471d5335ff/63e9df775b939f51a0b22f6d_Icon.svg"
            alt="wishlist"
            width={16}
            height={16}
          />
        </button>
      </div>
      <div className="flex flex-col flex-grow">
        <div className="flex justify-between items-start gap-2 mb-1">
          <h3 className="text-base font-semibold text-dark-gray leading-tight">{product.name}</h3>
          <p className="text-lg font-bold text-dark-gray whitespace-nowrap">{product.currency === 'INR' ? '₹' : '$'}{product.price.toFixed(2)}</p>
        </div>
        <p className="text-sm text-medium-gray mb-2">{product.description}</p>
        <div className="flex items-center mb-4">
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, index) => (
              <Image
                key={index}
                src="https://cdn.prod.website-files.com/63e857eaeaf853471d5335ff/63e9d9ee08987e0ffb064bca_Star.svg"
                alt="star"
                width={16}
                height={16}
                className={index < product.rating ? "" : "opacity-20"}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground ml-2">({product.reviewCount})</span>
        </div>
        <Button variant="outline" className="w-full mt-auto font-medium text-dark-gray text-base border-border hover:bg-primary hover:text-primary-foreground">
          Add to Cart
        </Button>
      </div>
    </div>
  );
};

export default function TabbedProducts() {
  return (
    <section className="py-20 bg-background">
      <div className="container">
        <h3 className="text-2xl font-semibold text-dark-gray mb-6">
          Todays Best Deals for you!
        </h3>
        <Tabs defaultValue="Diaries" className="w-full">
          <TabsList className="flex flex-wrap justify-start gap-x-3 gap-y-2 mb-10 bg-transparent p-0 h-auto">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab}
                className="px-4 py-2 rounded-md text-base font-medium text-medium-gray data-[state=active]:bg-secondary data-[state=active]:text-foreground data-[state=active]:shadow-sm"
              >
                {tab}
              </TabsTrigger>
            ))}
          </TabsList>
          {tabs.map((tab) => (
            <TabsContent key={tab} value={tab}>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {productsByCategory[tab].map((product) => (
                  <ProductCard key={`${tab}-${product.id}`} product={product} />
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
}