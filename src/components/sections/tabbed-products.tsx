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
};

const gadgetProducts: Product[] = [
  {
    id: 1,
    name: "Laptop sleeve MacBook",
    price: 59.0,
    description: "Organic Cotton, fairtrade certified",
    image: "https://cdn.prod.website-files.com/63e857eaeaf853471d5335ff/63e8c4e68b497e229146b818_leptop%20sleeve-min.png",
    rating: 5,
    reviewCount: 121,
  },
  {
    id: 2,
    name: "AirPods Max",
    price: 559.0,
    description: "A perfect balance of high-fidelity audio",
    image: "https://cdn.prod.website-files.com/63e857eaeaf853471d5335ff/63e8c4e4aed3c6720e446aa1_airpod%20max-min.png",
    rating: 5,
    reviewCount: 121,
  },
  {
    id: 3,
    name: "Flower Laptop Sleeve",
    price: 39.0,
    description: "15 in. x 10 in. -Flap top closure",
    image: "https://cdn.prod.website-files.com/63e857eaeaf853471d5335ff/63e8c4e55cc9361a8ecce6d4_flower%20leptop%20sleeve-min.png",
    rating: 5,
    reviewCount: 121,
  },
  {
    id: 4,
    name: "Supreme Water Bottle",
    price: 19.0,
    description: "Table with air purifier, stained veneer/black",
    image: "https://cdn.prod.website-files.com/63e857eaeaf853471d5335ff/63e8c4e78b497e3a5646b82f_water%20pot-min.png",
    rating: 5,
    reviewCount: 121,
  },
  {
    id: 5,
    name: "Laptop sleeve MacBook",
    price: 59.0,
    description: "Organic Cotton, fairtrade certified",
    image: "https://cdn.prod.website-files.com/63e857eaeaf853471d5335ff/63e8c4e563db5560c31bbfce_leptop%20sleeve%20macbook-min.png",
    rating: 5,
    reviewCount: 121,
  },
  {
    id: 6,
    name: "Macbook pro 13\"",
    price: 1099.0,
    description: "256, 8 core GPU, 8 GB",
    image: "https://cdn.prod.website-files.com/63e857eaeaf853471d5335ff/63e8c4e61eb4ad4af6e75689_macbook%2013-min.png",
    rating: 5,
    reviewCount: 121,
  },
  {
    id: 7,
    name: "HomePod mini",
    price: 59.0,
    description: "5 Colors Available",
    image: "https://cdn.prod.website-files.com/63e857eaeaf853471d5335ff/63e8c4e563db5507951bbfbe_homepad-mini-min.png",
    rating: 5,
    reviewCount: 121,
  },
  {
    id: 8,
    name: "Ipad Mini",
    price: 539.0,
    description: "Table with air purifier, stained veneer/black",
    image: "https://cdn.prod.website-files.com/63e857eaeaf853471d5335ff/63e8c4e64bd907adafd35b46_ipad%20mini-min.png",
    rating: 5,
    reviewCount: 121,
  },
];

const tabs = [
  "Gadgets",
  "Fashion",
  "Toys",
  "Education",
  "Beauty",
  "Fitness",
  "Furniture",
  "Sneakers",
];

const productsByCategory: { [key: string]: Product[] } = {
  Gadgets: gadgetProducts,
  Fashion: [...gadgetProducts].reverse(),
  Toys: gadgetProducts,
  Education: [...gadgetProducts].reverse(),
  Beauty: gadgetProducts,
  Fitness: [...gadgetProducts].reverse(),
  Furniture: gadgetProducts,
  Sneakers: [...gadgetProducts].reverse(),
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
          <p className="text-lg font-bold text-dark-gray whitespace-nowrap">${product.price.toFixed(2)}</p>
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
        <Tabs defaultValue="Gadgets" className="w-full">
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