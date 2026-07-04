const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addColumns() {
  try {
    // Add minPrice column
    await prisma.$queryRaw`ALTER TABLE Diary ADD COLUMN IF NOT EXISTS "minPrice" INTEGER;`;
    console.log('Added minPrice column');

    // Add maxPrice column
    await prisma.$queryRaw`ALTER TABLE Diary ADD COLUMN IF NOT EXISTS "maxPrice" INTEGER;`;
    console.log('Added maxPrice column');

    console.log('Columns added successfully!');
  } catch (error) {
    console.error('Error adding columns:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addColumns();
