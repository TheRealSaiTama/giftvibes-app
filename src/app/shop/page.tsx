import Header from '@/components/sections/header';
import Footer from '@/components/sections/footer';
import { Diary } from '@prisma/client';
import ShopClient from './ShopClient';

async function getDiaries(): Promise<Diary[]> {
  const { PrismaClient } = await import('@prisma/client');
  const prisma = new PrismaClient();
  const diaries = await prisma.diary.findMany({
    orderBy: { price: 'asc' }
  });
  await prisma.$disconnect();
  return diaries;
}

export default async function ShopPage() {
  const allDiaries = await getDiaries();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <ShopClient initialDiaries={allDiaries} />
      <Footer />
    </div>
  );
}
