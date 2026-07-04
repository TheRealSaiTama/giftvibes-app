"use client";

import { createContext, useContext, useState, ReactNode } from 'react';

type Product = {
  id: number;
  name: string;
  image: string;
  price: number;
  currency: string;
};

interface ProductContextType {
  selectedProducts: Product[];
  selectProduct: (product: Product) => void;
  deselectProduct: (id: number) => void;
  clearSelected: () => void;
  isSelected: (id: number) => boolean;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: ReactNode }) {
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);

  const selectProduct = (product: Product) => {
    setSelectedProducts(prev => 
      prev.some(p => p.id === product.id) ? prev : [...prev, product]
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
