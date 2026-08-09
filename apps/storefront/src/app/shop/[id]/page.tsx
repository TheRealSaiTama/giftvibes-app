import type { Metadata } from "next";
import Header from '@/components/sections/header';
import Footer from '@/components/sections/footer';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ProductGallery from '@/components/product/ProductGallery';
import ProductInfo from '@/components/product/ProductInfo';
import RelatedProducts from '@/components/product/RelatedProducts';
import { getPriceOverride } from '@/lib/price-overrides';
import { getDiaryRows } from '@/lib/diary-data';
import { getStorefrontData } from "@/lib/site";

// ponytail: revalidate=0 so /api/revalidate can bust this page after admin edits.
export const revalidate = 0;

// M9: SEO meta. Falls back to the product name + highlights if the
// admin didn't fill in the per-product SEO fields.
export async function generateMetadata({ params }: { params: Promise<{ id: string }> | { id: string } }): Promise<Metadata> {
  const resolvedParams = 'then' in params ? await params : params;
  const product = await getProduct(resolvedParams.id);
  if (!product) return {};
  const title = product.seoTitle || product.name;
  const description = product.seoDescription || product.description || product.name;
  return {
    title,
    description: description.slice(0, 200),
    openGraph: {
      title,
      description: description.slice(0, 200),
      images: product.imageUrl ? [{ url: product.imageUrl }] : undefined,
    },
  };
}

function normalizeTags(value?: string | null): string[] {
  if (!value) return [];
  const tags = value
    .split(',')
    .map((tag) => tag.replace(/\s+/g, ' ').trim())
    .filter(Boolean);
  return Array.from(new Set(tags));
}

// ponytail: maps the admin's product feature keys to display labels for the
// storefront render. M8: only features with show=true AND a non-empty value
// get rendered.
const FEATURE_LABELS: Record<string, string> = {
  material: "Material",
  size: "Size",
  color: "Color",
  pages: "Pages",
  cover_type: "Cover type",
  weight: "Weight",
  dimensions: "Dimensions",
};

function pickFeatures(features: any): { key: string; label: string; value: string }[] {
  if (!features || typeof features !== "object") return [];
  return Object.entries(features)
    .filter(([, entry]: [string, any]) => entry && entry.show && typeof entry.value === "string" && entry.value.trim() !== "")
    .map(([key, entry]: [string, any]) => ({
      key,
      label: FEATURE_LABELS[key] ?? key,
      value: entry.value,
    }));
}

async function getProduct(id: string): Promise<any | null> {
  let idCounter = 100000;
  const productId = parseInt(id, 10);

  // If it's a short numeric ID, try the CSV fallback first
  if (id.length < 10 && !Number.isNaN(productId)) {
    for (const record of getDiaryRows()) {
      if (!record['Product Name'] || record['Product Name'].trim() === '') {
        idCounter++;
        continue;
      }
      if (idCounter === productId) {
        const priceText = record['Price Range'] || '0';
        const prices = priceText.match(/\d+/g)?.map(Number) || [0];
        const minPrice = prices[0];
        const maxPrice = prices.length > 1 ? prices[1] : prices[0];
        const override = getPriceOverride(record['Product Name']);
        const computedMin = isNaN(minPrice) ? null : minPrice;
        const computedMax = isNaN(maxPrice) ? null : maxPrice;
        return {
          id: idCounter,
          name: record['Product Name'],
          description: record['Short Description'],
          minPrice: override?.minPrice ?? computedMin,
          maxPrice: override?.maxPrice ?? computedMax,
          imageUrl: record['Product image'],
          category: record['Categories'],
          tags: normalizeTags(record['Tags']),
        };
      }
      idCounter++;
    }
  }

  // Try DB lookup (works for both UUIDs and strings)
  try {
    const { prisma } = await import('@/lib/prisma');
    const dbProduct = await prisma.product.findUnique({ where: { id: id } });
    if (dbProduct) {
      return {
        id: dbProduct.id,
        name: dbProduct.name,
        description: dbProduct.description,
        minPrice: dbProduct.minPrice ?? null,
        maxPrice: dbProduct.maxPrice ?? null,
        imageUrl: dbProduct.imageUrl ?? '',
        category: dbProduct.category,
        tags: dbProduct.tags || [],
        // M6/M8/M9: secondary images, feature flags, SEO meta
        gallery: Array.isArray(dbProduct.gallery) ? (dbProduct.gallery as string[]) : [],
        features: dbProduct.features && typeof dbProduct.features === "object" ? dbProduct.features : {},
        seoTitle: dbProduct.seoTitle ?? null,
        seoDescription: dbProduct.seoDescription ?? null,
      };
    }
  } catch (e) {
    console.error("DB lookup failed", e);
  }

  return null;
}

async function getRelatedProducts(category: string, currentId: string | number): Promise<any[]> {
  const relatedProducts: any[] = [];
  let idCounter = 100000;

  for (const record of getDiaryRows()) {
    if (!record['Product Name'] || record['Product Name'].trim() === '') { idCounter++; continue; }
    if (idCounter !== currentId && record['Categories']?.includes(category)) {
      const priceText = record['Price Range'] || '0';
      const prices = priceText.match(/\d+/g)?.map(Number) || [0];
      const minPrice = prices[0];
      const maxPrice = prices.length > 1 ? prices[1] : prices[0];
      const override = getPriceOverride(record['Product Name']);
      const computedMin = isNaN(minPrice) ? null : minPrice;
      const computedMax = isNaN(maxPrice) ? null : maxPrice;
      relatedProducts.push({
        id: idCounter,
        name: record['Product Name'],
        description: record['Short Description'],
        minPrice: override?.minPrice ?? computedMin,
        maxPrice: override?.maxPrice ?? computedMax,
        imageUrl: record['Product image'],
        category: record['Categories'],
        tags: normalizeTags(record['Tags']),
      });
      if (relatedProducts.length >= 8) return relatedProducts;
    }
    idCounter++;
  }

  if (relatedProducts.length < 8 && category) {
    const { prisma } = await import('@/lib/prisma');
    const remaining = 8 - relatedProducts.length;
    const dbRelated = await prisma.product.findMany({
      where: {
        id: { not: currentId },
        category: { contains: category, mode: 'insensitive' },
      },
      take: remaining,
    });

    for (const item of dbRelated) {
      relatedProducts.push({
        id: item.id,
        name: item.name,
        description: item.description,
        minPrice: item.minPrice ?? null,
        maxPrice: item.maxPrice ?? null,
        imageUrl: item.imageUrl ?? '',
        category: item.category,
        tags: normalizeTags(item.tags),
      });
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
  const [product, { settings, headerNav }] = await Promise.all([
    getProduct(resolvedParams.id),
    getStorefrontData(),
  ]);

  if (!product) {
    notFound();
  }

  const relatedProducts = await getRelatedProducts(product.category || '', product.id);
  const visibleFeatures = pickFeatures(product.features);

  return (
    <div className="min-h-screen bg-white">
      <Header nav={headerNav} />
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
          <ProductGallery
            imageUrl={product.imageUrl}
            productName={product.name}
            gallery={product.gallery}
          />
          <ProductInfo product={product} />
        </div>

        {/* M8: per-feature render. Only checked + non-empty values show. */}
        {visibleFeatures.length > 0 && (
          <section className="border-t border-gray-100 py-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Specifications</h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 max-w-2xl">
              {visibleFeatures.map((f) => (
                <div key={f.key} className="flex items-baseline gap-3">
                  <dt className="text-sm font-medium text-muted-foreground min-w-32">{f.label}</dt>
                  <dd className="text-sm text-gray-900">{f.value}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}

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
      <Footer settings={settings} />
    </div>
  );
}
