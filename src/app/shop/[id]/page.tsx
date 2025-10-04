import Header from '@/components/sections/header';
import Footer from '@/components/sections/footer';
import { notFound } from 'next/navigation';
import ProductGallery from '@/components/product/ProductGallery';
import ProductInfo from '@/components/product/ProductInfo';
import ProductSpecifications from '@/components/product/ProductSpecifications';
import RelatedProducts from '@/components/product/RelatedProducts';

async function getProduct(id: string): Promise<any | null> {
  const fs = await import('fs');
  const path = await import('path');
  const { parse } = await import('csv-parse/sync');

  const diaryFiles = [
    'RE Products Page - Premium PU Leather Diaries.csv',
    'RE Products Page - Hardbound Diaries.csv',
  ];

  let idCounter = 100000;
  const productId = parseInt(id, 10);

  for (const file of diaryFiles) {
    try {
      const csvPath = path.resolve(process.cwd(), `csv/${file}`);
      if (!fs.existsSync(csvPath)) {
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

        if (idCounter === productId) {
          const priceText = record['Price Range'] || '0';
          const prices = priceText.match(/\d+/g)?.map(Number) || [0];
          const minPrice = prices[0];
          const maxPrice = prices.length > 1 ? prices[1] : prices[0];

          return {
            id: idCounter,
            name: record['Product Name'],
            description: record['Short Description'],
            minPrice: isNaN(minPrice) ? null : minPrice,
            maxPrice: isNaN(maxPrice) ? null : maxPrice,
            imageUrl: record['Product image'],
            category: record['Categories'],
            tags: record['Tags'],
          };
        }

        idCounter++;
      }
    } catch (error) {
      console.error(`Error reading diary CSV (${file}):`, error);
    }
  }

  return null;
}

async function getRelatedProducts(category: string, currentId: number): Promise<any[]> {
  const fs = await import('fs');
  const path = await import('path');
  const { parse } = await import('csv-parse/sync');

  const diaryFiles = [
    'RE Products Page - Premium PU Leather Diaries.csv',
    'RE Products Page - Hardbound Diaries.csv',
  ];

  const relatedProducts: any[] = [];
  let idCounter = 100000;

  for (const file of diaryFiles) {
    try {
      const csvPath = path.resolve(process.cwd(), `csv/${file}`);
      if (!fs.existsSync(csvPath)) {
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

        if (idCounter !== currentId && record['Categories']?.includes(category)) {
          const priceText = record['Price Range'] || '0';
          const prices = priceText.match(/\d+/g)?.map(Number) || [0];
          const minPrice = prices[0];
          const maxPrice = prices.length > 1 ? prices[1] : prices[0];

          relatedProducts.push({
            id: idCounter,
            name: record['Product Name'],
            description: record['Short Description'],
            minPrice: isNaN(minPrice) ? null : minPrice,
            maxPrice: isNaN(maxPrice) ? null : maxPrice,
            imageUrl: record['Product image'],
            category: record['Categories'],
            tags: record['Tags'],
          });

          if (relatedProducts.length >= 8) {
            return relatedProducts;
          }
        }

        idCounter++;
      }
    } catch (error) {
      console.error(`Error reading diary CSV (${file}):`, error);
    }
  }

  return relatedProducts;
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const resolvedParams = 'then' in params ? await params : params;
  const product = await getProduct(resolvedParams.id);

  if (!product) {
    notFound();
  }

  const relatedProducts = await getRelatedProducts(product.category || '', product.id);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <ProductInfo product={product} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          <ProductGallery imageUrl={product.imageUrl} productName={product.name} />
          <ProductSpecifications product={product} />
        </div>
        {relatedProducts.length > 0 && (
          <RelatedProducts products={relatedProducts} />
        )}
      </main>
      <Footer />
    </div>
  );
}
