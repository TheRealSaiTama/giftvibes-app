"use client";

import * as React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useSelectedProducts } from '@/context/ProductContext';
import { Checkbox } from '@/components/ui/checkbox';
import { Product as DbProduct } from '@prisma/client';
import type { Product } from '@/types/Product';

interface ProductCardProps {
  product: Product;
  className?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, className }) => {
  const { selectProduct, deselectProduct, isSelected } = useSelectedProducts();
  const selected = isSelected(product.id);
  const hasRange =
    typeof product.minPrice === 'number' &&
    typeof product.maxPrice === 'number' &&
    product.minPrice !== product.maxPrice;
  const hasSingle = typeof product.minPrice === 'number' && product.minPrice !== null;
  const priceLabel = hasRange
    ? `₹${product.minPrice!.toLocaleString()} – ₹${product.maxPrice!.toLocaleString()}`
    : hasSingle
      ? `₹${product.minPrice!.toLocaleString()}`
      : 'On request';
  const priceBadgeClass = hasSingle
    ? 'bg-primary/10 text-primary border border-primary/10'
    : 'bg-amber-50 text-amber-600 border border-amber-200';

  return (
    <div
      className={cn(
        "bg-card rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.05)] p-4 flex flex-col transition-shadow hover:shadow-lg relative",
        className
      )}
    >
      <div className="absolute top-2 left-2 z-10">
        <Checkbox
          checked={selected}
          onCheckedChange={(checked) => {
            if (checked) {
              selectProduct({
                ...product,
                price: product.minPrice ?? 0,
              });
            } else {
              deselectProduct(product.id);
            }
          }}
          className="data-[state=checked]:bg-[#124559] data-[state=checked]:border-[#124559]"
        />
      </div>
      <div className="relative bg-white flex items-center justify-center p-5 mb-5 h-[230px] overflow-hidden product-image-container pt-8 pl-8">
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
        <div className="flex justify-between items-start gap-2 mb-4">
          <h3 className="text-base font-semibold text-dark-gray leading-tight">{product.name}</h3>
          <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap ${priceBadgeClass}`}>
            {priceLabel}
          </span>
        </div>
        <Button
          onClick={() => {
            selectProduct(product);
            console.log('Enquire for:', product.name);
          }}
          className="w-full mt-auto bg-[#124559] hover:bg-[#0f3d4a] text-white font-medium text-base border-none rounded-md transition-colors duration-200"
        >
          Enquire Now
        </Button>
      </div>
    </div>
  );
};

function getFileIdFromUrl(url: string): string | null {
  if (!url) return null;
  const regex = /(?:\/d\/|\?id=|&id=)([a-zA-Z0-9_-]{28,})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

export default function TabbedProducts({ products: dbProducts }: { products: DbProduct[] }) {
  const products: Product[] = dbProducts.map(p => {
    const url = p.imageUrl?.trim();
    
    const placeholderSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 800 600">
        <defs>
          <pattern id="p" width="100" height="100" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <path d="M50 0 v100 M0 50 h100" stroke="#e0e0e0" stroke-width="1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="#f5f5f5"/>
        <rect width="100%" height="100%" fill="url(#p)"/>
        <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="24" fill="#9e9e9e">No Image Available</text>
      </svg>
    `;
    let imageUrl = `data:image/svg+xml;base64,${Buffer.from(placeholderSvg).toString('base64')}`;

    if (url) {
      if (url.includes('drive.google.com')) {
        const fileId = getFileIdFromUrl(url);
        if (fileId) {
          imageUrl = `https://drive.google.com/uc?id=${fileId}`;
        }
      } else if (/^https?:\/\//i.test(url)) {
        imageUrl = url;
      }
    }

    return {
      id: p.id,
      name: p.name,
      minPrice: p.minPrice ?? null,
      maxPrice: p.maxPrice ?? null,
      price: p.minPrice ?? undefined,
      description: p.description || '',
      image: imageUrl,
      rating: 5,
      reviewCount: 121,
      currency: 'INR',
      category: p.category,
    };
  });

  const categories = [...new Set(products.map(p => p.category).filter(Boolean))];
  const productsByCategory = categories.reduce((acc, category) => {
    if (category) {
        acc[category] = products.filter(p => p.category === category);
    }
    return acc;
  }, {} as { [key: string]: Product[] });

  const tabs = Object.keys(productsByCategory);

  return (
    <section className="py-20 bg-background">
      <div className="container">
        <h3 className="text-2xl font-semibold text-dark-gray mb-6">
          Todays Best Deals for you!
        </h3>
        <Tabs defaultValue={tabs[0]} className="w-full">
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
                {productsByCategory[tab]?.map((product) => (
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