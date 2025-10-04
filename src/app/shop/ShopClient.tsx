'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Diary, Product } from '@prisma/client';
import { EnquiryFormContent } from '@/components/sections/enquiry-modal'; // Assuming this is the correct path
import { Dialog, DialogTrigger, DialogContent } from '@/components/ui/dialog';
import type { Product as ProductType } from '@/types/Product';
import { useSelectedProducts } from '@/context/ProductContext';

type ShopProduct = {
  id: number;
  name: string;
  description: string | null;
  imageUrl: string | null;
  category: string | null;
  tags: string | null;
  minPrice: number | null;
  maxPrice: number | null;
};

interface Filters {
  category: string[];
  minPrice: number;
  maxPrice: number;
  sortBy: 'name' | 'price';
  sortOrder: 'asc' | 'desc';
}

function getFileIdFromUrl(url: string): string | null {
  if (!url) return null;

  // This single, more robust regex will find the ID in multiple common formats.
  // e.g., /d/ID, /file/d/ID, ?id=ID, &id=ID
  // It also validates a typical ID length of 28+ characters.
  const regex = /(?:\/d\/|\?id=|&id=)([a-zA-Z0-9_-]{28,})/;
  const match = url.match(regex);

  // The ID will be in the first capture group (index 1).
  return match ? match[1] : null;
}

function filterAndSortProducts(products: ShopProduct[], filters: Filters): ShopProduct[] {
  let filtered: ShopProduct[] = products;

  if (filters.category.length > 0) {
    filtered = filtered.filter((product: ShopProduct) => 
      product.category && filters.category.some((cat: string) => product.category!.includes(cat))
    );
  }

  if (filters.minPrice > 0) {
    filtered = filtered.filter((product: ShopProduct) => product.minPrice && product.minPrice >= filters.minPrice);
  }

  if (filters.maxPrice > 0) {
    filtered = filtered.filter((product: ShopProduct) => product.maxPrice && product.maxPrice <= filters.maxPrice);
  }

  return filtered.sort((a: ShopProduct, b: ShopProduct) => {
    let comparison = 0;
    if (filters.sortBy === 'price') {
      comparison = (a.minPrice || 0) - (b.minPrice || 0);
    } else {
      comparison = a.name.localeCompare(b.name);
    }
    return filters.sortOrder === 'asc' ? comparison : -comparison;
  });
}

export default function ShopClient({ initialDiaries, initialProducts }: { initialDiaries: Diary[], initialProducts: Product[] }) {
  const [filters, setFilters] = useState<Filters>({
    category: [],
    minPrice: 0,
    maxPrice: 0,
    sortBy: 'price',
    sortOrder: 'asc',
  });
  const pricePresets = useMemo(
    () => [
      { label: 'Under ₹200', min: 0, max: 200 },
      { label: '₹200 - ₹350', min: 200, max: 350 },
      { label: '₹350 - ₹500', min: 350, max: 500 },
      { label: '₹500+', min: 500, max: 0 },
    ],
    []
  );

  const {
    selectedProducts,
    selectProduct,
    deselectProduct,
    isSelected,
    clearSelected,
  } = useSelectedProducts();
  const [isEnquiryModalOpen, setIsEnquiryModalOpen] = useState(false);

  const handleProductSelect = (product: ShopProduct) => {
    if (isSelected(product.id)) {
      deselectProduct(product.id);
    } else {
      selectProduct({
        id: product.id,
        name: product.name,
        image: product.imageUrl || '',
        price: product.minPrice || 0,
        currency: 'INR',
        description: product.description || '',
        category: product.category,
      });
    }
  };

  const formattedSelectedProducts: ProductType[] = useMemo(() => {
    return selectedProducts.map(p => ({
      id: p.id,
      name: p.name,
      image: p.image || '',
      price: p.price,
      currency: 'INR', // Assuming INR, adjust if needed
      description: p.description || '',
      category: p.category,
    }));
  }, [selectedProducts]);

  const combinedProducts = useMemo(() => {
    const diariesAsProducts: ShopProduct[] = initialDiaries.map(diary => ({
      ...diary,
      minPrice: diary.minPrice,
      maxPrice: diary.maxPrice,
    }));
    const productsAsShopProducts: ShopProduct[] = initialProducts.map(product => ({
        ...product,
        minPrice: product.minPrice,
        maxPrice: product.maxPrice,
    }));
    return [...diariesAsProducts, ...productsAsShopProducts];
  }, [initialDiaries, initialProducts]);

  const results = useMemo(() => filterAndSortProducts(combinedProducts, filters), [combinedProducts, filters]);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setFilters((prevFilters: Filters) => ({
      ...prevFilters,
      category: checked 
        ? [...prevFilters.category, value as string]
        : prevFilters.category.filter((c: string) => c !== value),
    }));
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters((prevFilters: Filters) => ({
      ...prevFilters,
      [name]: Number(value) || 0,
    }));
  };

  const handlePresetSelect = (min: number, max: number) => {
    setFilters((prev) => ({
      ...prev,
      minPrice: min,
      maxPrice: max,
    }));
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [sortBy, sortOrder] = e.target.value.split('-') as ['name' | 'price', 'asc' | 'desc'];
    setFilters((prevFilters: Filters) => ({ ...prevFilters, sortBy, sortOrder }));
  };

  const clearFilters = () => {
    setFilters({
      category: [],
      minPrice: 0,
      maxPrice: 0,
      sortBy: 'price',
      sortOrder: 'asc',
    });
  };

  const uniqueCategories = useMemo(() => Array.from(new Set(combinedProducts.map((p: ShopProduct) => p.category).filter(Boolean) as string[])), [combinedProducts]);

  return (
    <main className="container mx-auto px-4 py-12">
      <Dialog open={isEnquiryModalOpen} onOpenChange={setIsEnquiryModalOpen}>
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-72 order-2 lg:order-1">
            <div className="sticky top-4 space-y-6">
              <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-md">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Refine</p>
                <h2 className="mt-2 text-xl font-semibold text-slate-800">Curate your picks</h2>
                <p className="mt-1 text-sm text-slate-500">Mix and match diaries that suit your gifting mood.</p>

                <div className="mt-6 space-y-6">
                  <div>
                    <p className="text-sm font-medium text-slate-600 mb-3">Categories</p>
                    <div className="space-y-2 max-h-44 overflow-y-auto pr-1 custom-scrollbar">
                      {uniqueCategories.map((cat) => (
                        <label
                          key={cat}
                          className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2 text-sm text-slate-600 transition hover:border-primary/30 hover:bg-primary/5"
                        >
                          <span className="truncate pr-3">{cat}</span>
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                            value={cat}
                            onChange={handleCategoryChange}
                          />
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-slate-600">Price range</p>
                      <span className="text-xs uppercase tracking-wide text-primary/70">Crafted in ₹</span>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-3">
                      <div className="relative">
                        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">Min</span>
                        <input
                          type="number"
                          name="minPrice"
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 pt-5 pb-2 text-sm font-semibold text-slate-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                          value={filters.minPrice || ''}
                          onChange={handlePriceChange}
                        />
                      </div>
                      <div className="relative">
                        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">Max</span>
                        <input
                          type="number"
                          name="maxPrice"
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 pt-5 pb-2 text-sm font-semibold text-slate-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                          value={filters.maxPrice || ''}
                          onChange={handlePriceChange}
                        />
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {pricePresets.map((preset) => {
                        const isActive =
                          filters.minPrice === preset.min &&
                          (preset.max === 0 ? filters.maxPrice === 0 : filters.maxPrice === preset.max);
                        return (
                          <button
                            key={preset.label}
                            type="button"
                            onClick={() => handlePresetSelect(preset.min, preset.max)}
                            className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition ${
                              isActive
                                ? 'border-primary bg-primary text-white shadow-sm'
                                : 'border-slate-200 bg-white text-slate-500 hover:border-primary/40 hover:text-primary'
                            }`}
                          >
                            {preset.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    onClick={clearFilters}
                    className="w-full rounded-xl border border-primary px-5 py-3 text-sm font-semibold text-primary transition hover:bg-primary hover:text-white"
                  >
                    Reset filters
                    <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                      {filters.category.length + (filters.minPrice > 0 ? 1 : 0) + (filters.maxPrice > 0 ? 1 : 0)} active
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </aside>
          <div className="lg:w-4/5 order-1 lg:order-2">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
                Our Products ({results.length})
              </h1>
              <div className="flex items-center gap-4">
                <DialogTrigger asChild>
                  <button className="px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors">
                    Enquire ({selectedProducts.length})
                  </button>
                </DialogTrigger>
                <select
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary min-w-[180px]"
                  onChange={handleSortChange}
                  defaultValue="price-asc"
                >
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="name-asc">Name: A to Z</option>
                  <option value="name-desc">Name: Z to A</option>
                </select>
              </div>
            </div>
            {results.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl shadow-sm">
                <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <span className="text-3xl">📓</span>
                </div>
                <h2 className="text-2xl font-semibold text-gray-600 mb-2">No products match your search</h2>
                <p className="text-gray-500 mb-6">Try adjusting your filters or clearing them to see all products.</p>
                <button 
                  onClick={clearFilters} 
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {results.map((product) => {
                  const url = product.imageUrl?.trim();

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

                  return (
                    <article key={product.id} className="bg-white rounded-xl shadow-md hover:shadow-xl overflow-hidden transition-all duration-300 border border-gray-100 hover:border-primary/30">
                      <Link href={`/shop/${product.id}`} className="block group">
                        <div className="relative h-56 bg-gradient-to-br from-gray-50 to-white overflow-hidden">
                          <Image
                            src={imageUrl}
                            alt={product.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                          />
                          <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded-full text-xs font-medium opacity-0 group-hover:opacity-100 transition-all duration-300">
                            View Details
                          </div>
                        </div>
                      </Link>
                      <div className="p-5">
                        <h3 className="text-base font-semibold text-gray-800 line-clamp-2 mb-4 hover:text-primary transition-colors">
                          <Link href={`/shop/${product.id}`}>{product.name}</Link>
                        </h3>
                        <div className="flex items-center justify-between">
                          {(() => {
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
                            const badgeClass = hasSingle
                              ? 'bg-primary/10 text-primary border border-primary/10'
                              : 'bg-amber-50 text-amber-600 border border-amber-200';
                            return (
                              <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold ${badgeClass}`}>
                                {priceLabel}
                              </span>
                            );
                          })()}
                          <button
                            onClick={() => handleProductSelect(product)}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-1 ${
                              isSelected(product.id)
                                ? 'bg-green-600 text-white hover:bg-green-700'
                                : 'bg-primary text-white hover:bg-primary/90'
                            }`}
                          >
                            {isSelected(product.id) ? 'Selected' : 'Enquire Now'}
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        <DialogContent>
          <EnquiryFormContent 
            open={isEnquiryModalOpen} 
            onOpenChange={setIsEnquiryModalOpen} 
            selectedProducts={selectedProducts}
            onSubmitAfter={clearSelected}
          />
        </DialogContent>
      </Dialog>
    </main>
  );
}
