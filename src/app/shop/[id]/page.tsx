import Header from '@/components/sections/header';
import Footer from '@/components/sections/footer';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ProductGallery from '@/components/product/ProductGallery';
import ProductInfo from '@/components/product/ProductInfo';
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
    <div className="min-h-screen bg-white">
      <Header />
      <main className="container mx-auto px-4 py-4">
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <Link href="/" className="hover:text-primary transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-primary transition-colors">
            {product.category?.split(',')[0]?.trim() || 'Shop'}
          </Link>
          {product.category?.split(',')[1] && (
            <>
              <span>/</span>
              <span className="hover:text-primary transition-colors">
                {product.category.split(',')[1].trim()}
              </span>
            </>
          )}
          <span>/</span>
          <span className="text-gray-900 font-medium truncate max-w-xs">
            {product.name}
          </span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          <ProductGallery imageUrl={product.imageUrl} productName={product.name} />
          <ProductInfo product={product} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-12 border-t border-gray-100">
          <div className="flex flex-col items-center text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl">
            <div className="w-14 h-14 bg-[#1a5f7a] text-white rounded-full flex items-center justify-center mb-4">
              <span className="text-xs font-bold uppercase tracking-wider">New Year</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Customized Diary & Note Books</h3>
            <p className="text-sm text-gray-600">Perfect for corporate gifting and personal use</p>
          </div>

          <div className="flex flex-col items-center text-center p-6 bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl">
            <div className="w-14 h-14 bg-green-600 text-white rounded-full flex items-center justify-center mb-4">
              <span className="text-xs font-bold uppercase tracking-wider">Bulk</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Special Pricing</h3>
            <p className="text-sm text-gray-600">Contact us for bulk orders and custom designs</p>
          </div>

          <div className="flex flex-col items-center text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl">
            <div className="w-14 h-14 bg-purple-600 text-white rounded-full flex items-center justify-center mb-4">
              <span className="text-xs font-bold uppercase tracking-wider">Quick</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Fast Shipping</h3>
            <p className="text-sm text-gray-600">Quick delivery options available across India</p>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <RelatedProducts products={relatedProducts} />
        )}
      </main>
      <Footer />
    </div>
  );
}
