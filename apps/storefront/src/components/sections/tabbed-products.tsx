"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useSelectedProducts } from '@/context/ProductContext';
import { Checkbox } from '@/components/ui/checkbox';
import type { Product } from '@/types/Product';
import {
  resolveProductImage,
  isRemoteOrDataImage,
  PRODUCT_IMAGE_PLACEHOLDER,
} from "@/lib/product-image";

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
      <Link href={`/shop/${product.id}`} className="relative bg-white flex items-center justify-center p-5 mb-5 h-[230px] overflow-hidden product-image-container pt-8 pl-8 block">
        <Image
          src={product.image || PRODUCT_IMAGE_PLACEHOLDER}
          alt={product.name}
          fill
          unoptimized={isRemoteOrDataImage(product.image || "")}
          className="object-contain transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 22vw"
        />
        <span className="absolute top-2.5 right-2.5 bg-white rounded-full w-8 h-8 flex items-center justify-center cursor-pointer shadow-sm z-10 transition-transform group-hover:scale-110">
          <Image
            src="https://cdn.prod.website-files.com/63e857eaeaf853471d5335ff/63e9df775b939f51a0b22f6d_Icon.svg"
            alt="wishlist"
            width={16}
            height={16}
            unoptimized
          />
        </span>
      </Link>
      <div className="flex flex-col flex-grow">
        <div className="flex justify-between items-start gap-2 mb-4">
          <Link href={`/shop/${product.id}`} className="text-base font-semibold text-dark-gray leading-tight hover:text-primary transition-colors">
            {product.name}
          </Link>
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

export default function TabbedProducts({
  products: dbProducts,
  content,
}: {
  products: any[];
  content?: any;
}) {
  const heading = content?.heading || "Todays Best Deals for you!";

  // ponytail: if the admin has set custom tabs in the section content, use
  // those. Each tab has a name and a list of productIds. The storefront
  // looks each id up in dbProducts (products + diaries catalog). Otherwise
  // fall back to grouping products by their `category` field.
  const customTabs: { name: string; productIds: string[] }[] = Array.isArray(content?.tabs)
    ? content.tabs.map((t: any) => ({
        name: typeof t?.name === "string" && t.name.trim() ? t.name.trim() : "Tab",
        productIds: Array.isArray(t?.productIds)
          ? t.productIds.filter((id: unknown): id is string => typeof id === "string" && id.length > 0)
          : [],
      }))
    : [];

  const products: Product[] = (dbProducts || []).map((p) => {
    const minPrice = p.minPrice ?? p.min_price ?? null;
    const maxPrice = p.maxPrice ?? p.max_price ?? null;

    return {
      id: p.id,
      name: p.name || "Product",
      minPrice,
      maxPrice,
      price: minPrice ?? undefined,
      description: p.description || "",
      image: resolveProductImage(p.imageUrl || p.image_url || p.image),
      rating: 5,
      reviewCount: 121,
      currency: "INR" as const,
      category: p.category,
    };
  });

  const byId = new Map(products.map((p) => [String(p.id), p]));

  const categories = [...new Set(products.map((p) => p.category).filter(Boolean))];
  const productsByCategory = categories.reduce(
    (acc, category) => {
      if (category) {
        acc[category] = products.filter((p) => p.category === category);
      }
      return acc;
    },
    {} as { [key: string]: Product[] },
  );

  // ponytail: render custom tabs if defined, otherwise fall back to category grouping.
  const tabKeys: string[] =
    customTabs.length > 0 ? customTabs.map((t) => t.name) : Object.keys(productsByCategory);

  const productsForTab = (tabKey: string): Product[] => {
    if (customTabs.length > 0) {
      const t = customTabs.find((ct) => ct.name === tabKey);
      if (!t) return [];
      // Preserve admin picker order
      return t.productIds.map((id) => byId.get(String(id))).filter((p): p is Product => !!p);
    }
    return productsByCategory[tabKey] || [];
  };

  if (tabKeys.length === 0) return null;

  return (
    <section className="py-20 bg-background">
      <div className="container">
        <h3 className="text-2xl font-semibold text-dark-gray mb-6">
          {heading}
        </h3>
        <Tabs defaultValue={tabKeys[0]} className="w-full">
          <TabsList className="flex flex-wrap justify-start gap-x-3 gap-y-2 mb-10 bg-transparent p-0 h-auto">
            {tabKeys.map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab}
                className="px-4 py-2 rounded-md text-base font-medium text-medium-gray data-[state=active]:bg-secondary data-[state=active]:text-foreground data-[state=active]:shadow-sm"
              >
                {tab}
              </TabsTrigger>
            ))}
          </TabsList>
          {tabKeys.map((tab) => (
            <TabsContent key={tab} value={tab}>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {productsForTab(tab).map((product) => (
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