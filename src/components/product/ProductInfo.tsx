'use client';

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

interface Specification {
  label: string;
  value: string;
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
    return `71 ${id.toString().slice(-6).toUpperCase()} OP | LEATHER`;
  };

  const parseHighlights = (description: string): string => {
    if (!description) return '';
    const highlightMatch = description.match(/Product Highlights\s*([\s\S]+?)(?=Size\s*:|$)/);
    if (highlightMatch) {
      return highlightMatch[1].trim();
    }
    return description.split('\n\n')[0] || '';
  };

  const parseSpecifications = (description: string): Specification[] => {
    if (!description) return [];

    const specs: Specification[] = [];
    const lines = description.split('\n');

    const specPatterns = [
      { pattern: /Size\s*:\s*(.+)/, label: 'Size' },
      { pattern: /Paper Quality\s*:\s*(.+)/, label: 'Paper Quality' },
      { pattern: /Page Format\s*:\s*(.+)/, label: 'Page Format' },
      { pattern: /Cover Binding\s*:\s*(.+)/, label: 'Cover Binding' },
      { pattern: /Monthly Planner\s*:\s*(.+)/, label: 'Monthly Planner' },
      { pattern: /Month Cutting\s*:\s*(.+)/, label: 'Month Cutting' },
      { pattern: /Cover Colours?\s*:\s*(.+)/, label: 'Cover Colors' },
    ];

    for (const line of lines) {
      for (const { pattern, label } of specPatterns) {
        const match = line.match(pattern);
        if (match && match[1]) {
          const value = match[1].trim();
          if (!specs.some((s) => s.label === label)) {
            specs.push({ label, value });
          }
        }
      }
    }

    return specs;
  };

  const parseNotes = (description: string): string[] => {
    if (!description) return [];
    const notes: string[] = [];

    if (description.includes('COD facility not available')) {
      notes.push('* COD facility not available for this product *');
    }
    if (description.includes('minimum order quantity restriction')) {
      notes.push('*This product has minimum order quantity restriction.');
    }
    if (description.includes('Pen Charges Extra')) {
      notes.push('** Pen Charges Extra');
    }
    if (description.includes('less than MOQ')) {
      notes.push('** If your order quantity is little less than MOQ then please write us.');
    }

    return notes;
  };

  const highlights = parseHighlights(product.description);
  const specifications = parseSpecifications(product.description);
  const notes = parseNotes(product.description);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
          {product.name}
        </h1>

        <div className="flex items-center gap-3 mb-4">
          <p className="text-sm text-gray-600">
            SKU: <span className="font-semibold text-gray-900">{generateSKU(product.id)}</span>
          </p>
        </div>

        <div className="flex items-center gap-2 mb-6">
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
          </div>
          <span className="text-sm text-gray-600">0 Review(s)</span>
          <span className="text-gray-400">|</span>
          <button className="text-sm text-[#1a5f7a] hover:underline">
            Write a review
          </button>
        </div>

        <div className="mb-8 pb-6 border-b border-gray-200">
          <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">Our Price</p>
          {(() => {
            const hasRange =
              typeof product.minPrice === 'number' &&
              typeof product.maxPrice === 'number' &&
              product.minPrice !== product.maxPrice;
            const hasSingle =
              typeof product.minPrice === 'number' && product.minPrice !== null;

            if (hasRange) {
              return (
                <p className="text-4xl lg:text-5xl font-bold text-red-600">
                  ₹{product.minPrice!.toLocaleString()} - ₹{product.maxPrice!.toLocaleString()}
                </p>
              );
            } else if (hasSingle) {
              return (
                <p className="text-4xl lg:text-5xl font-bold text-red-600">
                  ₹{product.minPrice!.toLocaleString()}
                </p>
              );
            } else {
              return (
                <p className="text-3xl font-bold text-gray-700">Price on Request</p>
              );
            }
          })()}
        </div>

        {highlights && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Product Highlights</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line text-base">
              {highlights}
            </p>
          </div>
        )}

        {specifications.length > 0 && (
          <div className="mb-8 bg-gray-50 rounded-lg p-6">
            <div className="divide-y divide-gray-200">
              {specifications.map((spec, idx) => (
                <div key={idx} className="grid grid-cols-3 gap-4 py-3">
                  <dt className="text-sm font-semibold text-gray-700">{spec.label} :</dt>
                  <dd className="text-sm text-gray-900 col-span-2">{spec.value}</dd>
                </div>
              ))}
            </div>
          </div>
        )}

        {notes.length > 0 && (
          <div className="space-y-2 mb-6">
            {notes.map((note, idx) => (
              <p key={idx} className="text-xs text-red-600">
                {note}
              </p>
            ))}
          </div>
        )}

        <Dialog open={isEnquiryModalOpen} onOpenChange={setIsEnquiryModalOpen}>
          <DialogTrigger asChild>
            <button
              onClick={handleEnquire}
              className="w-full bg-[#1a5f7a] hover:bg-[#1a5f7a]/90 text-white font-semibold py-4 px-8 rounded-lg transition-colors duration-200 text-base"
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

        <button className="w-full mt-3 bg-white border-2 border-[#1a5f7a] text-[#1a5f7a] hover:bg-gray-50 font-semibold py-4 px-8 rounded-lg transition-colors duration-200 text-base">
          Request Quote
        </button>
      </div>
    </div>
  );
}
