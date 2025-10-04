import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';

const prisma = new PrismaClient();

async function seedDiaries() {
  const diaryFiles = [
    'RE Products Page - Hardbound Diaries.csv',
    'RE Products Page - Premium PU Leather Diaries.csv',
  ];

  console.log('Seeding diaries from:', diaryFiles);

  for (const file of diaryFiles) {
    try {
      const csvPath = path.resolve(__dirname, `../csv/${file}`);
      if (!fs.existsSync(csvPath)) {
        console.warn(`CSV file not found: ${csvPath}. Skipping.`);
        continue;
      }
      const csvData = fs.readFileSync(csvPath, 'utf-8');
      const records = parse(csvData, {
        columns: true,
        skip_empty_lines: true,
      }) as Record<string, string>[];

      for (const record of records) {
        if (!record['Product Name'] || record['Product Name'].trim() === '') {
            console.warn('Skipping record with empty Product Name in', file);
            continue;
        }

        const priceRange = record['Price Range'] ? record['Price Range'].replace('/-', '').trim().split(' - ') : ['0'];
        const minPrice = parseInt(priceRange[0], 10);
        
        await prisma.diary.upsert({
          where: { name: record['Product Name'] },
          update: {
            description: record['Short Description'],
            price: isNaN(minPrice) ? 0 : minPrice,
            imageUrl: record['Product image'],
            category: record['Categories'],
            tags: record['Tags'],
          },
          create: {
            name: record['Product Name'],
            description: record['Short Description'],
            price: isNaN(minPrice) ? 0 : minPrice,
            imageUrl: record['Product image'],
            category: record['Categories'],
            tags: record['Tags'],
          },
        });
      }
      console.log(`Successfully seeded diaries from ${file}`);
    } catch (error) {
      console.error(`Error seeding diaries from ${file}:`, error);
    }
  }
}

async function seedProducts() {
    const productFiles = [
        'RE Products Page - Corporate Gift Sets.csv',
        'RE Products Page - SBI Gift Items.csv',
    ];

    console.log('Seeding products from:', productFiles);

    for (const file of productFiles) {
        try {
            const csvPath = path.resolve(__dirname, `../csv/${file}`);
            if (!fs.existsSync(csvPath)) {
                console.warn(`CSV file not found: ${csvPath}. Skipping.`);
                continue;
            }
            const csvData = fs.readFileSync(csvPath, 'utf-8');
            const records = parse(csvData, {
                columns: true,
                skip_empty_lines: true,
            }) as Record<string, string>[];

            for (const record of records) {
                if (!record['Product Name'] || record['Product Name'].trim() === '') {
                    console.warn('Skipping record with empty Product Name in', file);
                    continue;
                }

                const priceRange = record['Price Range'] ? record['Price Range'].replace('/-', '').trim().split(' - ') : ['0', '0'];
                const minPrice = parseInt(priceRange[0], 10);
                const maxPrice = parseInt(priceRange[1] || priceRange[0], 10);

                await prisma.product.upsert({
                    where: { name: record['Product Name'] },
                    update: {
                        description: record['Short Description'],
                        minPrice: isNaN(minPrice) ? null : minPrice,
                        maxPrice: isNaN(maxPrice) ? null : maxPrice,
                        imageUrl: record['Product image'],
                        tags: record['Tags'],
                        category: record['Categories'] || 'Corporate Gift Set',
                    },
                    create: {
                        name: record['Product Name'],
                        description: record['Short Description'],
                        minPrice: isNaN(minPrice) ? null : minPrice,
                        maxPrice: isNaN(maxPrice) ? null : maxPrice,
                        imageUrl: record['Product image'],
                        tags: record['Tags'],
                        category: record['Categories'] || 'Corporate Gift Set',
                    },
                });
            }
            console.log(`Successfully seeded products from ${file}`);
        } catch (error) {
            console.error(`Error seeding products from ${file}:`, error);
        }
    }
}


async function main() {
  console.log('Start seeding...');
  
  // By using upsert, we no longer need to delete all data.
  // console.log('Clearing existing data...');
  // await prisma.diary.deleteMany({});
  // await prisma.product.deleteMany({});
  
  await seedDiaries();
  await seedProducts();
  
  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error('An error occurred during seeding:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('Prisma client disconnected.');
  });
