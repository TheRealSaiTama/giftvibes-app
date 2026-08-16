"use client";

import Image from "next/image";
import Link from "next/link";
import { useSelectedProducts } from '@/context/ProductContext';
import { Checkbox } from '@/components/ui/checkbox';
import type { Product } from '@/types/Product';
import {
  resolveProductImage,
  isRemoteOrDataImage,
  PRODUCT_IMAGE_PLACEHOLDER,
} from "@/lib/product-image";
import {
  DEFAULT_POPULAR_NAMES,
  matchCatalogIdsByNames,
} from "@/lib/cms/mappers";
import { teaserDescription } from "@/lib/teaser";
import { productHref } from "@/lib/seo";

// Local public assets — Drive hotlinks break on production (HTML interstitial / 403).
const defaultProducts: Product[] = [
  {
    id: 1,
    name: "Primo A5 Corporate Diary and Pen Set",
    price: 225,
    minPrice: 225,
    maxPrice: 255,
    currency: "INR" as const,
    description: "Soft-touch PU diary with matching metal pen and premium planner pages in an elegant gift box.",
    image: "/diary/trendingdiary.png",
  },
  {
    id: 2,
    name: "Wooden A5 Corporate Diary and Pen Set",
    price: 230,
    minPrice: 230,
    maxPrice: 250,
    currency: "INR" as const,
    description: "Wood grain inspired diary with smooth pen, monthly planner inserts and custom branding ready box.",
    image: "/diary/trendingdiary2.png",
  },
  {
    id: 3,
    name: "Polo A5 Corporate Diary and Pen Set",
    price: 220,
    minPrice: 220,
    maxPrice: 245,
    currency: "INR" as const,
    description: "Premium PU diary combo with elastic closure, satin ribbon and logo-ready keepsake packaging.",
    image: "/diary/trendingdiary3.png",
  },
  {
    id: 4,
    name: "50-50 B5 Diary Calendar with Pen Combo Set",
    price: 315,
    minPrice: 315,
    maxPrice: 332,
    currency: "INR" as const,
    description: "Executive B5 diary with detachable desk calendar, heavyweight pen and luxe presentation box.",
    image: "/diary/trendingdiary4.png",
  },
  {
    id: 5,
    name: "Oval Leather B5 Diary with Pen Gift Set",
    price: 300,
    minPrice: 300,
    maxPrice: 310,
    currency: "INR" as const,
    description: "Oval motif B5 diary in plush leatherette with premium metal pen and foil-ready gift box.",
    image: "/diary/trendingdiary5.png",
  },
];

const RATING = 5;
function mapDbProduct(p: any): Product {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name || "Product",
    image: resolveProductImage(p.imageUrl || p.image_url || p.image),
    minPrice: p.minPrice ?? p.min_price ?? null,
    maxPrice: p.maxPrice ?? p.max_price ?? null,
    description: teaserDescription(p.description),
    currency: "INR",
  };
}

interface WeeklyPopularProductsProps {
  content?: any;
  products?: any[];
}

const WeeklyPopularProducts = ({ content, products: dbProducts }: WeeklyPopularProductsProps) => {
  const { selectProduct, deselectProduct, isSelected } = useSelectedProducts();
  const heading = content?.heading || "Trending Diary Giftsets";
  const selectedIds: string[] = (content?.items || [])
    .map((item: any) => item?.productId)
    .filter((id: unknown): id is string => typeof id === "string" && id.length > 0);

  // Admin picks by id. Empty → name-match live catalog (same as best_deals).
  const byId = new Map(
    (dbProducts || []).map((p) => [String(p.id), mapDbProduct(p)]),
  );
  let items: Product[] =
    selectedIds.length > 0
      ? selectedIds.map((id) => byId.get(id)).filter((p): p is Product => !!p)
      : [];
  if (items.length === 0 && (dbProducts || []).length > 0) {
    const matched = matchCatalogIdsByNames(dbProducts || [], DEFAULT_POPULAR_NAMES, 5);
    items = matched
      .map((m) => byId.get(m.productId))
      .filter((p): p is Product => !!p);
  }
  if (items.length === 0) items = defaultProducts;

  return (
    <section className="py-16 bg-white">
      <div className="container">
        <h3 className="text-2xl font-semibold text-[#333333] mb-10">{heading}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {items.map((product, index) => {
            const selected = isSelected(product.id || index);
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
              <div key={product.id || index} className="flex flex-col group relative">
                <div className="absolute top-2 left-2 z-10">
                  <Checkbox
                    checked={selected}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        selectProduct(product);
                      } else {
                        deselectProduct(product.id || index);
                      }
                    }}
                    className="data-[state=checked]:bg-[#124559] data-[state=checked]:border-[#124559]"
                  />
                </div>
                <Link href={productHref(product)} className="relative bg-white p-6 flex items-center justify-center aspect-square overflow-hidden product-image-container pt-8 pl-8 block">
                  <Image
                    src={product.image || PRODUCT_IMAGE_PLACEHOLDER}
                    alt={product.name}
                    width={200}
                    height={200}
                    unoptimized={isRemoteOrDataImage(product.image || "")}
                    className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                  <span className="absolute top-4 right-4 bg-white w-9 h-9 flex items-center justify-center rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                     <Image
                      src="https://cdn.prod.website-files.com/63e857eaeaf853471d5335ff/63e9df775b939f51a0b22f6d_Icon.svg"
                      alt="wishlist icon"
                      width={16}
                      height={16}
                    />
                  </span>
                </Link>
                <div className="pt-4 flex flex-col flex-grow">
                  <div className="flex justify-between items-start gap-2">
                    <Link href={productHref(product)} className="text-base font-semibold text-[#333333] leading-tight hover:text-primary transition-colors">
                      {product.name}
                    </Link>
                    <p className="text-lg font-bold text-[#333333] whitespace-nowrap">{displayPrice}</p>
                  </div>
                  <p className="text-sm text-[#666666] mt-2 line-clamp-2 min-h-[40px]">{product.description}</p>
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

                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      selectProduct(product);
                      console.log('Enquire for:', product.name);
                    }}
                    className="w-full mt-auto block text-center py-2.5 px-4 rounded-md border border-[#e5e5e5] text-sm font-medium text-white bg-[#124559] hover:bg-[#0f3d4a] transition-colors duration-200"
                  >
                    Enquire Now
                  </button>
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
