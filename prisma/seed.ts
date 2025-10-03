import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';

const prisma = new PrismaClient();

async function main() {
  const diaryFiles = [
    'RE Products Page - Hardbound Diaries.csv',
    'RE Products Page - Premium PU Leather Diaries.csv',
  ];

  for (const file of diaryFiles) {
    const csvPath = path.resolve(__dirname, `../csv/${file}`);
    const csvData = fs.readFileSync(csvPath, 'utf-8');
    const records = parse(csvData, {
      columns: true,
      skip_empty_lines: true,
    });

    for (const record of records) {
      const priceRange = record['Price Range'].replace('/-', '').trim().split(' - ');
      const minPrice = parseInt(priceRange[0], 10);
      const maxPrice = parseInt(priceRange[1], 10);

      await prisma.diary.create({
        data: {
          name: record['Product Name'],
          description: record['Short Description'],
          price: isNaN(minPrice) ? 0 : minPrice,
          imageUrl: record['Product image'],
          category: record['Categories'],
          tags: record['Tags'],
        },
      });
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
