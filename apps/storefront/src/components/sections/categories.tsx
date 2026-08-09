"use client";
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'motion/react';
import { getCategoryHref } from '@/lib/category-links';

interface Category {
  name: string;
  subtitle: string;
  image_url: string;
  bgColor: string;
  alt: string;
  href?: string;
  sort_order?: number;
}

const categoryData: Category[] = [
  {
    name: 'CORPORATE GIFT SETS',
    subtitle: '120+ Packages Available',
    image_url: '/Giftvibes categories/CORPORATE GIFTSETS.png',
    bgColor: '#124559',
    alt: 'Professional corporate gift sets and custom diaries',
    sort_order: 1,
  },
  {
    name: 'NEW YEAR DIARY',
    subtitle: '80+ Styles Available',
    image_url: '/Giftvibes categories/NEW YEAR DIARY.png',
    bgColor: '#1a5d73',
    alt: 'Premium New Year themed diaries and planners',
    sort_order: 2,
  },
  {
    name: 'LEATHER GIFT ITEMS',
    subtitle: 'Premium Collection',
    image_url: '/Giftvibes categories/LEATHER GIFT ITEMS.png',
    bgColor: '#2c3e50',
    alt: 'High-quality leather gift items and accessories',
    sort_order: 3,
  },
  {
    name: 'LEATHER BAGS',
    subtitle: 'Executive Collection',
    image_url: '/Giftvibes categories/LEATHER BAGS.png',
    bgColor: '#E8923C',
    alt: 'Premium leather bags and accessories',
    sort_order: 4,
  },
  {
    name: 'JUTE BAGS',
    subtitle: 'Eco-Friendly Options',
    image_url: '/Giftvibes categories/JUTE BAGS.png',
    bgColor: '#28966E',
    alt: 'Sustainable jute bags for promotional use',
    sort_order: 5,
  },
  {
    name: 'BOTTLES GIFT SET',
    subtitle: 'Premium Combos',
    image_url: '/Giftvibes categories/BOTTLE GIFT SETS.png',
    bgColor: '#124559',
    alt: 'Gift sets with premium bottles and accessories',
    sort_order: 6,
  },
  {
    name: 'POWER BANK DIARIES',
    subtitle: 'Tech-Integrated',
    image_url: '/Giftvibes categories/POWERBANK DIARIES.png',
    bgColor: '#1a5d73',
    alt: 'Diaries with built-in power bank functionality',
    sort_order: 7,
  },
  {
    name: 'PEN STANDS',
    subtitle: 'Desktop Essentials',
    image_url: '/Giftvibes categories/PEN STANDS.png',
    bgColor: '#2c3e50',
    alt: 'Elegant pen stands and desk accessories',
    sort_order: 8,
  },
  {
    name: 'PROMOTIONAL UMBRELLAS',
    subtitle: 'Branded Solutions',
    image_url: '/Giftvibes categories/PROMOTIONAL UMBRELLAS.jpg',
    bgColor: '#8b4513',
    alt: 'Custom promotional umbrellas for marketing',
    sort_order: 9,
  },
  {
    name: 'CUSTOMISED DIARY & NOTE BOOKS',
    subtitle: '150+ Designs Available',
    image_url: '/Giftvibes categories/PROMOTIONAL DIARIES AND NOTEBOOKS.jpg',
    bgColor: '#E8923C',
    alt: 'Fully customized diaries and notebooks',
    sort_order: 10,
  },
  {
    name: 'CALENDARS',
    subtitle: 'Desktop & Wall Options',
    image_url: '/Giftvibes categories/CALENDARS.png',
    bgColor: '#28966E',
    alt: 'Custom table and wall calendars',
    sort_order: 11,
  },
  {
    name: "EXHIBITION VISITOR'S GIFT IDEAS",
    subtitle: 'Trade Show Specials',
    image_url: '/Giftvibes categories/EXHIBITION GIVEAWAY IDEAS.png',
    bgColor: '#124559',
    alt: 'Special gift ideas for exhibition visitors',
    sort_order: 12,
  },
];

const Categories = ({ content }: { content?: any }) => {
  const heading = content?.heading || "Our Products";
  // ponytail: sort by sort_order asc, then drop items with no name. The DB
  // drives the visible list now; categoryData is just the first-install seed.
  // Accept legacy `image` key from older seeds as image_url.
  const items: Category[] = (content?.items || categoryData)
    .map((c: any, i: number) => ({
      name: c.name || "",
      subtitle: c.subtitle || "",
      image_url: c.image_url || c.image || "",
      bgColor: c.bgColor || "#124559",
      alt: c.alt || c.name || "",
      href: c.href || "",
      sort_order: typeof c.sort_order === "number" ? c.sort_order : i + 1,
    }))
    .filter((c: Category) => c.name)
    .slice()
    .sort((a: Category, b: Category) => (a.sort_order || 0) - (b.sort_order || 0));

  return (
    <section id="our-products" className="bg-white py-[100px]">
      <div className="container">
        <div className="section-title-wrap">
          <motion.h3
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="text-[32px] font-bold text-[#1a1a1a] leading-[48px] mb-10"
          >
            {heading}
          </motion.h3>
        </div>
        <div className="flex overflow-x-auto gap-6 pb-4 custom-scrollbar">
          {items.map((category, index) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
              className="w-[240px] flex-shrink-0"
            >
            <Link
              href={
                category.href && category.href.trim()
                  ? category.href.trim()
                  : getCategoryHref(category.name)
              }
              className="block group"
            >
              <div
                className="relative h-[280px] rounded-[16px] overflow-hidden transition-all duration-500 ease-out hover:scale-105 hover:shadow-2xl hover:shadow-black/20"
                style={{ backgroundColor: category.bgColor }}
              >
                {category.image_url ? (
                  <Image
                    src={category.image_url}
                    alt={category.alt || category.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : null}
                
                {/* Modern overlay with gradient */}
                <div className="absolute inset-0 z-[5] bg-gradient-to-br from-black/20 via-transparent to-black/80" />
                
                {/* Corner badge design */}
                <div className="absolute top-4 right-4 z-10">
                  <div className="bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg border border-white/20 transition-all duration-300 group-hover:bg-white group-hover:scale-105">
                    <div className="text-center">
                      <span className="text-[#124559] font-bold text-xs uppercase tracking-widest block">
                        {category.name}
                      </span>
                      <span className="text-gray-600 text-[10px] mt-1 block">
                        {category.subtitle}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Bottom accent line */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/60 to-transparent z-10 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
              </div>
            </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;