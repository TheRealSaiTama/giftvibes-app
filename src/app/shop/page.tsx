import Header from '@/components/sections/header';
import Footer from '@/components/sections/footer';
import { Diary, Product } from '@prisma/client';
import ShopClient from './ShopClient';

async function getDiaries(): Promise<any[]> {
  const fs = await import('fs');
  const path = await import('path');
  const { parse } = await import('csv-parse/sync');

  try {
    const csvPath = path.resolve(process.cwd(), 'csv/RE Products Page - Premium PU Leather Diaries.csv');
    if (!fs.existsSync(csvPath)) {
      console.warn('Diary CSV file not found');
      return [];
    }
    const csvData = fs.readFileSync(csvPath, 'utf-8');
    const records = parse(csvData, {
      columns: true,
      skip_empty_lines: true,
    }) as Record<string, string>[];

    return records.map((record, index) => {
      if (!record['Product Name'] || record['Product Name'].trim() === '') {
        return null;
      }

      const priceText = record['Price Range'] || '0';
      const prices = priceText.match(/\d+/g)?.map(Number) || [0];
      const minPrice = prices[0];
      const maxPrice = prices.length > 1 ? prices[1] : prices[0];

      return {
        id: `diary-${index}`,
        name: record['Product Name'],
        description: record['Short Description'],
        minPrice: isNaN(minPrice) ? null : minPrice,
        maxPrice: isNaN(maxPrice) ? null : maxPrice,
        imageUrl: record['Product image'],
        category: record['Categories'],
        tags: record['Tags'],
      };
    }).filter(Boolean);
  } catch (error) {
    console.error('Error reading diary CSV:', error);
    return [];
  }
}

async function getProducts(): Promise<Product[]> {
  const { prisma } = await import('@/lib/prisma');
  const products = await prisma.product.findMany({
    orderBy: { minPrice: 'asc' },
    take: 1000,
  });
  return products;
}

// Re-trigger build to fetch latest seeded data
export default async function ShopPage() {
  const allDiaries = await getDiaries();
  const allProducts = await getProducts();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <ShopClient initialDiaries={allDiaries} initialProducts={allProducts} />
      <Footer />
    </div>
  );
}
