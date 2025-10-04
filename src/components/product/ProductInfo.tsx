'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { EnquiryFormContent } from '@/components/sections/enquiry-modal';
import { useSelectedProducts } from '@/context/ProductContext';

interface Product {
  id: number;
  name: string;
  category: string;
  minPrice: number | null;
  maxPrice: number | null;
  imageUrl: string;
  description: string;
}

interface ProductInfoProps {
  product: Product;
}

export default function ProductInfo({ product }: ProductInfoProps) {
  const [isEnquiryModalOpen, setIsEnquiryModalOpen] = useState(false);
  const { selectProduct, clearSelected } = useSelectedProducts();

  const handleEnquire = () => {
    selectProduct({
      id: product.id,
      name: product.name,
      image: product.imageUrl || '',
      price: product.minPrice || 0,
      currency: 'INR',
      description: '',
      category: product.category,
    });
    setIsEnquiryModalOpen(true);
  };

  const generateSKU = (id: number) => {
    return `71 ${id.toString().slice(-6).toUpperCase()}`;
  };

  const categories = product.category?.split(',').map((c) => c.trim()) || [];
  const mainCategory = categories[0] || 'Shop';
  const subCategory = categories[1] || null;

  const parseHighlights = (description: string): string => {
    if (!description) return '';
    const highlightMatch = description.match(/Product Highlights\s*([\s\S]+?)(?=Size\s*:|$)/);
    if (highlightMatch) {
      return highlightMatch[1].trim();
    }
    return description.split('\n\n')[0] || '';
  };

  const highlights = parseHighlights(product.description);

  return (
    <div className="space-y-4">
      <nav className="flex items-center space-x-2 text-sm text-gray-600">
        <Link href="/" className="hover:text-primary transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-primary transition-colors">
          {mainCategory}
        </Link>
        {subCategory && (
          <>
            <span>/</span>
            <span className="hover:text-primary transition-colors">{subCategory}</span>
          </>
        )}
        <span>/</span>
        <span className="text-gray-900 font-medium line-clamp-1">{product.name}</span>
      </nav>

      <div className="bg-white rounded-2xl shadow-lg p-6 lg:p-8">
        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
          {product.name}
        </h1>

        <div className="flex items-center gap-4 mb-4">
          <p className="text-sm text-gray-600">
            SKU: <span className="font-semibold text-gray-900">{generateSKU(product.id)}</span>
          </p>
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className="w-5 h-5 text-yellow-400 fill-current"
                viewBox="0 0 20 20"
              >
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
              </svg>
            ))}
            <span className="ml-2 text-sm text-gray-600">0 Review(s)</span>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-sm uppercase tracking-wide text-gray-500 mb-1">Our Price</p>
          {(() => {
            const hasRange =
              typeof product.minPrice === 'number' &&
              typeof product.maxPrice === 'number' &&
              product.minPrice !== product.maxPrice;
            const hasSingle =
              typeof product.minPrice === 'number' && product.minPrice !== null;

            if (hasRange) {
              return (
                <p className="text-4xl font-bold text-red-600">
                  ₹{product.minPrice!.toLocaleString()} - ₹{product.maxPrice!.toLocaleString()}
                </p>
              );
            } else if (hasSingle) {
              return (
                <p className="text-4xl font-bold text-red-600">
                  ₹{product.minPrice!.toLocaleString()}
                </p>
              );
            } else {
              return (
                <p className="text-2xl font-semibold text-gray-700">Price on Request</p>
              );
            }
          })()}
        </div>

        {highlights && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Product Highlights</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">{highlights}</p>
          </div>
        )}

        <Dialog open={isEnquiryModalOpen} onOpenChange={setIsEnquiryModalOpen}>
          <DialogTrigger asChild>
            <button
              onClick={handleEnquire}
              className="w-full bg-[#1a5f7a] hover:bg-[#1a5f7a]/90 text-white font-semibold py-4 px-8 rounded-xl transition-colors duration-200"
            >
              Enquire Now
            </button>
          </DialogTrigger>
          <DialogContent>
            <EnquiryFormContent
              open={isEnquiryModalOpen}
              onOpenChange={setIsEnquiryModalOpen}
              selectedProducts={[
                {
                  id: product.id,
                  name: product.name,
                  image: product.imageUrl || '',
                  price: product.minPrice || 0,
                  currency: 'INR',
                  description: '',
                  category: product.category,
                },
              ]}
              onSubmitAfter={clearSelected}
            />
          </DialogContent>
        </Dialog>

        <button className="w-full mt-3 bg-white border-2 border-[#1a5f7a] text-[#1a5f7a] hover:bg-gray-50 font-semibold py-4 px-8 rounded-xl transition-colors duration-200">
          Request Quote
        </button>
      </div>
    </div>
  );
}
