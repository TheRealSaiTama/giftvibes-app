'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

interface Product {
  id: number;
  name: string;
  imageUrl: string;
  minPrice: number | null;
  maxPrice: number | null;
}

interface RelatedProductsProps {
  products: Product[];
}

function getFileIdFromUrl(url: string): string | null {
  if (!url) return null;
  const regex = /(?:\/d\/|\?id=|&id=)([a-zA-Z0-9_-]{28,})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

export default function RelatedProducts({ products }: RelatedProductsProps) {
  const [startIndex, setStartIndex] = useState(0);
  const itemsPerView = 5;

  const handleNext = () => {
    if (startIndex + itemsPerView < products.length) {
      setStartIndex(startIndex + 1);
    }
  };

  const handlePrev = () => {
    if (startIndex > 0) {
      setStartIndex(startIndex - 1);
    }
  };

  const visibleProducts = products.slice(startIndex, startIndex + itemsPerView);

  return (
    <section className="mt-16 mb-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">You May Also Like</h2>
        <p className="text-gray-600">Explore more products from our collection</p>
      </div>

      <div className="relative">
        {startIndex > 0 && (
          <button
            onClick={handlePrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white hover:bg-gray-50 p-3 rounded-full shadow-lg border border-gray-200 transition-all"
            aria-label="Previous products"
          >
            <svg
              className="w-6 h-6 text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {visibleProducts.map((product) => {
            const url = product.imageUrl?.trim();
            let imageUrl = '/placeholder-product.jpg';

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

            const hasRange =
              typeof product.minPrice === 'number' &&
              typeof product.maxPrice === 'number' &&
              product.minPrice !== product.maxPrice;
            const hasSingle =
              typeof product.minPrice === 'number' && product.minPrice !== null;

            return (
              <Link
                key={product.id}
                href={`/shop/${product.id}`}
                className="group bg-white rounded-xl shadow-md hover:shadow-xl overflow-hidden transition-all duration-300 border border-gray-100 hover:border-primary/30"
              >
                <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-white overflow-hidden">
                  <Image
                    src={imageUrl}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 50vw, 20vw"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 mb-3 group-hover:text-primary transition-colors">
                    {product.name}
                  </h3>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {[...Array(4)].map((_, i) => (
                        <svg
                          key={i}
                          className="w-3 h-3 text-yellow-400 fill-current"
                          viewBox="0 0 20 20"
                        >
                          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                  <div className="mt-3">
                    {hasRange ? (
                      <p className="text-base font-bold text-red-600">
                        ₹{product.minPrice} - ₹{product.maxPrice}
                      </p>
                    ) : hasSingle ? (
                      <p className="text-base font-bold text-red-600">
                        ₹{product.minPrice}
                      </p>
                    ) : (
                      <p className="text-sm font-semibold text-gray-700">On Request</p>
                    )}
                  </div>
                  <button className="w-full mt-3 bg-white border border-[#1a5f7a] text-[#1a5f7a] hover:bg-[#1a5f7a] hover:text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm">
                    View Details
                  </button>
                </div>
              </Link>
            );
          })}
        </div>

        {startIndex + itemsPerView < products.length && (
          <button
            onClick={handleNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white hover:bg-gray-50 p-3 rounded-full shadow-lg border border-gray-200 transition-all"
            aria-label="Next products"
          >
            <svg
              className="w-6 h-6 text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        )}
      </div>
    </section>
  );
}
