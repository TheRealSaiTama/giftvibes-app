"use client";
import Image from 'next/image';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { useSelectedProducts } from '@/context/ProductContext';
import { Checkbox } from '@/components/ui/checkbox';
import type { Product } from '@/types/Product';

const products: Product[] = [
  {
    id: 100000,
    name: 'Management Premium PU Leather Diary 2026',
    price: 240,
    minPrice: 240,
    maxPrice: 300,
    description: 'Magnetic flap executive diary with soft-touch PU cover and premium natural shade paper.',
    image: 'https://drive.google.com/uc?id=11sbS-XW7D6BsdoMYkXkINTHFsxp2NVx-',
    currency: 'INR',
  },
  {
    id: 100001,
    name: 'DIRECTORS Premium Leather Diary 2026',
    price: 172,
    minPrice: 172,
    maxPrice: 195,
    description: 'Director edition PU leather diary with sponge padding and elegant magnetic flap finish.',
    image: 'https://drive.google.com/uc?id=1YqUkhJ9YX33wuuJcH_qGCaAsZ0GIDNNZ',
    currency: 'INR',
  },
  {
    id: 100002,
    name: 'Heritage Leather Executive Diary 2026',
    price: 137,
    minPrice: 137,
    maxPrice: 153,
    description: 'Heritage inspired PU leather diary with foam padding and one-date-per-page layout.',
    image: 'https://drive.google.com/uc?id=1ntl6n5DQpoF-FkfxYO1Rs49nJHl-NWsF',
    currency: 'INR',
  },
  {
    id: 100003,
    name: 'Paipin Brown Executive Leather Diary',
    price: 154,
    minPrice: 154,
    maxPrice: 176,
    description: 'Two-tone brown magnetic flap diary crafted in soft PU with premium writing paper.',
    image: 'https://drive.google.com/uc?id=1lfIN2mDTjNwAMYX1xbnPBkqkl95OTuzL',
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
          src={product.image} 
          alt={product.name} 
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" 
          className="object-contain transition-transform duration-300 group-hover:scale-105"
        />
        <span className="absolute top-4 right-4 bg-white rounded-full p-2.5 shadow-sm transition-all duration-300 opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0">
          <Image src={heartIconUrl} alt="Add to wishlist" width={16} height={16} />
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
        <p className="text-sm text-medium-gray mb-3.5">{product.description}</p>
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

const BestDealsSection = () => {
  return (
    <section className="bg-background py-16">
      <div className="container">
        <h2 className="mb-10">Latest 2026 Diaries</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default BestDealsSection;
