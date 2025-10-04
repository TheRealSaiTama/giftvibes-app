'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Diary, Product } from '@prisma/client';

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
  if (!url || !url.includes('drive.google.com')) {
    return null;
  }
  const match = url.match(/file\/d\/(.+?)\//);
  return match ? match : null;
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

  const combinedProducts = useMemo(() => {
    const diariesAsProducts: ShopProduct[] = initialDiaries.map(diary => ({
      ...diary,
      minPrice: diary.price,
      maxPrice: diary.price,
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
      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-1/5 order-2 lg:order-1">
          <div className="bg-white rounded-xl shadow-lg p-6 sticky top-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Filters</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-3">Category</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {uniqueCategories.map((cat) => (
                    <label key={cat} className="flex items-center cursor-pointer p-1 rounded hover:bg-gray-50">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                        value={cat}
                        onChange={handleCategoryChange}
                      />
                      <span className="ml-2 text-sm text-gray-600 truncate max-w-[150px]">{cat}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-3">Price Range</h3>
                <div className="space-y-3">
                  <input
                    type="number"
                    placeholder="Min (₹)"
                    name="minPrice"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    value={filters.minPrice || ''}
                    onChange={handlePriceChange}
                  />
                  <input
                    type="number"
                    placeholder="Max (₹)"
                    name="maxPrice"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    value={filters.maxPrice || ''}
                    onChange={handlePriceChange}
                  />
                </div>
              </div>
              <button
                onClick={clearFilters}
                className="w-full py-3 px-4 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors"
              >
                Clear Filters ({filters.category.length + (filters.minPrice > 0 ? 1 : 0) + (filters.maxPrice > 0 ? 1 : 0)} active)
              </button>
            </div>
          </div>
        </aside>
        <div className="lg:w-4/5 order-1 lg:order-2">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
              Our Products ({results.length})
            </h1>
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
                const fileId = product.imageUrl ? getFileIdFromUrl(product.imageUrl) : null;
                const imageUrl = fileId ? `/api/images/${fileId}` : 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

                return (
                  <Link key={product.id} href={`/shop/${product.id}`} className="block group">
                    <article className="bg-white rounded-xl shadow-md hover:shadow-xl overflow-hidden transition-all duration-300 border border-gray-100 hover:border-primary/30">
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
                      <div className="p-5">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
                            {product.category?.split(',').map(c => c.trim())}
                          </span>
                        </div>
                        <h3 className="text-base font-semibold text-gray-800 line-clamp-2 mb-2 hover:text-primary transition-colors">
                          {product.name}
                        </h3>
                        {product.description && (
                          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                            {product.description.substring(0, 80)}{product.description.length > 80 ? '...' : ''}
                          </p>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-xl font-bold text-gray-900">₹{product.minPrice?.toLocaleString()}</span>
                          <button className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-1">
                            Add to Cart
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 4.5M7 13l-1.5 4.5m0 0L4 19m0 0l1.5-4.5M17 13l1.5 4.5m0 0L20 19m0 0l-1.5-4.5M17 13l-1.5-4.5" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </article>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
