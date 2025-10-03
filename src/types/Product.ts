// src/types/Product.ts
export interface Product {
  id: number;
  name: string;
  image: string;
  price: number;
  currency: 'INR' | 'USD'; // keep strict enum for safety
  description?: string;    // optional (not always needed in context)
  rating?: number;         // optional rating for display
  reviewCount?: number;    // optional review count for display
  category?: string | null; // optional category for filtering
}
