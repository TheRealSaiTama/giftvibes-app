import Header from '@/components/sections/header';
import Footer from '@/components/sections/footer';
import { Product } from '@prisma/client';
import ShopClient from './ShopClient';
import { getPriceOverride } from '@/lib/price-overrides';

async function getDiaries(): Promise<any[]> {
  const fs = await import('fs');
  const path = await import('path');
  const { parse } = await import('csv-parse/sync');

  const diaryFiles = [
    'RE Products Page - Premium PU Leather Diaries.csv',
    'RE Products Page - Hardbound Diaries.csv',
  ];

  const diaries: any[] = [];
  let idCounter = 100000;

  for (const file of diaryFiles) {
    try {
      const csvPath = path.resolve(process.cwd(), `csv/${file}`);
      if (!fs.existsSync(csvPath)) {
        console.warn(`Diary CSV file not found: ${file}`);
        continue;
      }

      const csvData = fs.readFileSync(csvPath, 'utf-8');
      const records = parse(csvData, {
        columns: true,
        skip_empty_lines: true,
      }) as Record<string, string>[];

      for (const record of records) {
        if (!record['Product Name'] || record['Product Name'].trim() === '') {
          continue;
        }

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
    } catch (error) {
      console.error(`Error reading diary CSV (${file}):`, error);
    }
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
