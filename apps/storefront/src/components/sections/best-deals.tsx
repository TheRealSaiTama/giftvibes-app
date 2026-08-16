"use client";
import Image from 'next/image';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { useSelectedProducts } from '@/context/ProductContext';
import { Checkbox } from '@/components/ui/checkbox';
import type { Product } from '@/types/Product';
import {
  resolveProductImage,
  isRemoteOrDataImage,
  PRODUCT_IMAGE_PLACEHOLDER,
} from "@/lib/product-image";
import {
  DEFAULT_BEST_DEALS_NAMES,
  matchCatalogIdsByNames,
} from "@/lib/cms/mappers";
import { teaserDescription } from "@/lib/teaser";

// Local public assets — Drive hotlinks break on production.
const defaultProducts: Product[] = [
  {
    id: 100000,
    name: 'Management Premium PU Leather Diary 2026',
    price: 240,
    minPrice: 240,
    maxPrice: 300,
    description: 'Magnetic flap executive diary with soft-touch PU cover and premium natural shade paper.',
    image: '/diary/directors.png',
    currency: 'INR',
  },
  {
    id: 100001,
    name: 'DIRECTORS Premium Leather Diary 2026',
    price: 172,
    minPrice: 172,
    maxPrice: 195,
    description: 'Director edition PU leather diary with sponge padding and elegant magnetic flap finish.',
    image: '/diary/regularleather.png',
    currency: 'INR',
  },
  {
    id: 100002,
    name: 'Heritage Leather Executive Diary 2026',
    price: 137,
    minPrice: 137,
    maxPrice: 153,
    description: 'Heritage inspired PU leather diary with foam padding and one-date-per-page layout.',
    image: '/diary/antleather.png',
    currency: 'INR',
  },
  {
    id: 100003,
    name: 'Paipin Brown Executive Leather Diary',
    price: 154,
    minPrice: 154,
    maxPrice: 176,
    description: 'Two-tone brown magnetic flap diary crafted in soft PU with premium writing paper.',
    image: '/diary/papin.png',
    currency: 'INR',
  },
];

const heartIconUrl = "https://cdn.prod.website-files.com/63e857eaeaf853471d5335ff/63e9df775b939f51a0b22f6d_Icon.svg";
const starIconUrl = "https://cdn.prod.website-files.com/63e857eaeaf853471d5335ff/63e9d9ee08987e0ffb064bca_Star.svg";

const ProductCard = ({ product }: { product: Product }) => {
  const { selectProduct, deselectProduct, isSelected } = useSelectedProducts();
  const selected = isSelected(product.id);

  return (
    <div className="bg-card rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col group transition-shadow duration-300 hover:shadow-xl relative">
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
      <Link href={`/shop/${product.id}`} className="relative bg-white aspect-square overflow-hidden product-image-container pt-8 pl-8 block">
        <Image
          src={product.image || PRODUCT_IMAGE_PLACEHOLDER}
          alt={product.name}
          fill
          unoptimized={isRemoteOrDataImage(product.image || "")}
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-contain transition-transform duration-300 group-hover:scale-105"
        />
        <span className="absolute top-4 right-4 bg-white rounded-full p-2.5 shadow-sm transition-all duration-300 opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0">
          <Image src={heartIconUrl} alt="Add to wishlist" width={16} height={16} unoptimized />
        </span>
      </Link>
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-1.5">
          <h3 className="text-[18px] font-semibold text-dark-gray leading-tight mr-2">
            <Link href={`/shop/${product.id}`} className="hover:text-primary transition-colors">
              {product.name}
            </Link>
          </h3>
          <p className="price-text whitespace-nowrap">
            {(() => {
              const hasRange = typeof product.minPrice === 'number' && typeof product.maxPrice === 'number' && product.minPrice !== product.maxPrice;
              const baseValue = typeof product.minPrice === 'number' ? product.minPrice : product.price;
              if (hasRange) {
                return `${product.currency === 'INR' ? '₹' : '$'}${product.minPrice!.toLocaleString()} – ${product.currency === 'INR' ? '₹' : '$'}${product.maxPrice!.toLocaleString()}`;
              }
              if (typeof baseValue === 'number' && !Number.isNaN(baseValue)) {
                return `${product.currency === 'INR' ? '₹' : '$'}${baseValue.toLocaleString()}`;
              }
              return 'On request';
            })()}
          </p>
        </div>
        <p className="text-sm text-medium-gray mb-3.5 line-clamp-2 min-h-[40px]">{product.description}</p>
        <div className="flex items-center mb-5">
          <div className="flex items-center">
            {Array(5).fill(0).map((_, i) => (
              <Image key={i} src={starIconUrl} alt="star" width={16} height={16} className="mr-0.5" />
            ))}
          </div>
          <span className="small ml-2">(121)</span>
        </div>
        <Button
          onClick={() => {
            selectProduct(product);
            console.log('Enquire for:', product.name);
            // TODO: Open modal with this product
          }}
          className="w-full bg-[#124559] hover:bg-[#0f3d4a] text-white font-semibold rounded-md transition-colors duration-200"
          variant="default"
        >
          Enquire Now
        </Button>
      </div>
    </div>
  );
};

// ponytail: map a Prisma products/diaries row to the storefront's Product shape.
// The component only needs name, image, price range, description, id.
function mapDbProduct(p: any): Product {
  return {
    id: p.id,
    name: p.name || "Product",
    image: resolveProductImage(p.imageUrl || p.image_url || p.image),
    minPrice: p.minPrice ?? p.min_price ?? null,
    maxPrice: p.maxPrice ?? p.max_price ?? null,
    description: teaserDescription(p.description),
    currency: "INR",
  };
}

interface BestDealsSectionProps {
  content?: any;
  // ponytail: when the admin has set productIds, we look them up here.
  // Falls back to the hardcoded default set when the admin has not picked yet.
  products?: any[];
}

const BestDealsSection = ({ content, products: dbProducts }: BestDealsSectionProps) => {
  const heading = content?.heading || "Latest 2026 Diaries";
  const selectedIds: string[] = (content?.items || [])
    .map((item: any) => item?.productId)
    .filter((id: unknown): id is string => typeof id === "string" && id.length > 0);

  // Admin picks by id (preserve order). Empty picks → match catalog by default
  // product names so site shows real DB rows (images + /shop/{uuid} links).
  // Offline hardcoded defaults only when catalog has no matches.
  const byId = new Map(
    (dbProducts || []).map((p) => [String(p.id), mapDbProduct(p)]),
  );
  let items: Product[] =
    selectedIds.length > 0
      ? selectedIds.map((id) => byId.get(id)).filter((p): p is Product => !!p)
      : [];
  if (items.length === 0 && (dbProducts || []).length > 0) {
    const matched = matchCatalogIdsByNames(dbProducts || [], DEFAULT_BEST_DEALS_NAMES, 4);
    items = matched
      .map((m) => byId.get(m.productId))
      .filter((p): p is Product => !!p);
  }
  if (items.length === 0) items = defaultProducts;

  return (
    <section className="bg-background py-16">
      <div className="container">
        <h2 className="mb-10">{heading}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {items.map((product, index) => (
            <ProductCard key={product.id || index} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default BestDealsSection;
