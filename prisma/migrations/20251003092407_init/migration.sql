/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Product` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateTable
CREATE TABLE "Diary" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" INTEGER NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "tags" TEXT,
    "color" TEXT,
    "size" TEXT,
    "pages" INTEGER,
    "coverType" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "Diary_name_key" ON "Diary"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Product_name_key" ON "Product"("name");
