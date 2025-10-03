"use client";

import { createContext, useContext, useState, ReactNode } from 'react';
import type { Product } from '@/types/Product';

interface ProductContextType {
  selectedProducts: Product[];
  selectProduct: (productLike: Partial<Product> | any) => void;
  deselectProduct: (id: number) => void;
  clearSelected: () => void;
  isSelected: (id: number) => boolean;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

function normalizeProduct(input: Partial<Product> | any): Product {
  return {
    id: Number(input.id),
    name: String(input.name ?? ""),
    image: String(input.image ?? ""),
    price: Number(input.price ?? 0),
    currency: (input.currency ?? "INR") as Product["currency"],
    rating: input.rating != null ? Number(input.rating) : 0,
  };
}

export function ProductProvider({ children }: { children: ReactNode }) {
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);

  const selectProduct = (productLike: Partial<Product> | any) => {
    const product = normalizeProduct(productLike);
    setSelectedProducts((prev) =>
      prev.some((p) => p.id === product.id) ? prev : [...prev, product]
    );
  };

  const deselectProduct = (id: number) => {
    setSelectedProducts(prev => prev.filter(p => p.id !== id));
  };

  const clearSelected = () => {
    setSelectedProducts([]);
  };

  const isSelected = (id: number) => {
    return selectedProducts.some(p => p.id === id);
  };

  return (
    <ProductContext.Provider value={{
      selectedProducts,
      selectProduct,
      deselectProduct,
      clearSelected,
      isSelected
    }}>
      {children}
    </ProductContext.Provider>
  );
}

export function useSelectedProducts() {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useSelectedProducts must be used within a ProductProvider');
  }
  return context;
}
