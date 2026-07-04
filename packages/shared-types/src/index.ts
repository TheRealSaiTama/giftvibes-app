// Shared Types

export interface GalleryImage { url: string; alt: string; }

export interface Product {
  id: string; name: string; slug: string; description: string;
  category: string; image_url: string; gallery: GalleryImage[];
  min_price: number; max_price: number; featured: boolean;
  enabled: boolean; tags: string[]; created_at: string; updated_at: string;
}

export type CoverType = "hardcover" | "softcover" | "leather" | "pu_leather" | "other";

export interface Diary {
  id: string; name: string; slug: string; description: string;
  category: string; image_url: string; gallery: GalleryImage[];
  cover_type: CoverType; size: string; pages: number; color: string;
  min_price: number; max_price: number; featured: boolean;
  enabled: boolean; tags: string[]; created_at: string; updated_at: string;
}
