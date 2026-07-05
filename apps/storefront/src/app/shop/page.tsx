import Header from '@/components/sections/header';
import Footer from '@/components/sections/footer';
import { Product } from '@prisma/client';
import ShopClient from './ShopClient';
import { getPriceOverride } from '@/lib/price-overrides';
import { getDiaryRows } from '@/lib/diary-data';
import { getStorefrontData } from "@/lib/site";

// ponytail: revalidate=0 so /api/revalidate can bust this page after admin edits.
export const revalidate = 0;

async function getDiaries(): Promise<any[]> {
  const diaries: any[] = [];
  let idCounter = 100000;
  for (const record of getDiaryRows()) {
    if (!record['Product Name'] || record['Product Name'].trim() === '') continue;
    const priceText = record['Price Range'] || '0';
    const prices = priceText.match(/\d+/g)?.map(Number) || [0];
    const minPrice = prices[0];
    const maxPrice = prices.length > 1 ? prices[1] : prices[0];
    const override = getPriceOverride(record['Product Name']);
    const computedMin = isNaN(minPrice) ? null : minPrice;
    const computedMax = isNaN(maxPrice) ? null : maxPrice;
    diaries.push({
      id: idCounter++,
      name: record['Product Name'],
      description: record['Short Description'],
      minPrice: override?.minPrice ?? computedMin,
      maxPrice: override?.maxPrice ?? computedMax,
      imageUrl: record['Product image'],
      category: record['Categories'],
      tags: record['Tags'],
    });
  }

  return diaries;
}

async function getProducts(): Promise<Product[]> {
  const { prisma } = await import('@/lib/prisma');
  const products = await prisma.product.findMany({
    orderBy: { minPrice: 'asc' },
    take: 1000,
  });
  return products;
}

// ponytail: revalidate=0 above + admin webhook means no more "re-trigger build" dance.
export default async function ShopPage() {
  const [allDiaries, allProducts, { settings, headerNav }] = await Promise.all([
    getDiaries(),
    getProducts(),
    getStorefrontData(),
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header nav={headerNav} />
      <ShopClient initialDiaries={allDiaries} initialProducts={allProducts} />
      <Footer settings={settings} />
    </div>
  );
}
