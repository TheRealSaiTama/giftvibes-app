-- CreateTable
CREATE TABLE "Product" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "imageUrl" TEXT,
    "minPrice" INTEGER,
    "maxPrice" INTEGER,
    "description" TEXT,
    "tags" TEXT,
    "category" TEXT
);
