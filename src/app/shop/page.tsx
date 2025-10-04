import Header from '@/components/sections/header';
import Footer from '@/components/sections/footer';
import { Diary, Product } from '@prisma/client';
import ShopClient from './ShopClient';

async function getDiaries(): Promise<Diary[]> {
  const { prisma } = await import('@/lib/prisma');
  const diaries = await prisma.diary.findMany({
    orderBy: { price: 'asc' },
    take: 1000,
  });
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
