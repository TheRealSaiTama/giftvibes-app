"use client";
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'motion/react';

interface Category {
  name: string;
  subtitle: string;
  image: string;
  bgColor: string;
  alt: string;
}

const categoryData: Category[] = [
  {
    name: 'CORPORATE GIFT SETS',
    subtitle: '120+ Packages Available',
    image: '/Giftvibes categories/CORPORATE GIFTSETS.png',
    bgColor: '#124559',
    alt: 'Professional corporate gift sets and custom diaries',
  },
  {
    name: 'NEW YEAR DIARY',
    subtitle: '80+ Styles Available',
    image: '/Giftvibes categories/NEW YEAR DIARYpng',
    bgColor: '#1a5d73',
    alt: 'Premium New Year themed diaries and planners',
  },
  {
    name: 'LEATHER GIFT ITEMS',
    subtitle: 'Premium Collection',
    image: '/Giftvibes categories/LEATHER GIFT ITEMS.png',
    bgColor: '#2c3e50',
    alt: 'High-quality leather gift items and accessories',
  },
  {
    name: 'LEATHER BAGS',
    subtitle: 'Executive Collection',
    image: '/Giftvibes categories/LEATHER BAGS.png',
    bgColor: '#E8923C',
    alt: 'Premium leather bags and accessories',
  },
  {
    name: 'JUTE BAGS',
    subtitle: 'Eco-Friendly Options',
    image: '/Giftvibes categories/JUTE BAGS.png',
    bgColor: '#28966E',
    alt: 'Sustainable jute bags for promotional use',
  },
  {
    name: 'BOTTLES GIFT SET',
    subtitle: 'Premium Combos',
    image: '/Giftvibes categories/BOTTLE GIFT SETS.png',
    bgColor: '#124559',
    alt: 'Gift sets with premium bottles and accessories',
  },
  {
    name: 'POWER BANK DIARIES',
    subtitle: 'Tech-Integrated',
    image: '/Giftvibes categories/POWERBANK DIARIES.png',
    bgColor: '#1a5d73',
    alt: 'Diaries with built-in power bank functionality',
  },
  {
    name: 'PEN STANDS',
    subtitle: 'Desktop Essentials',
    image: '/Giftvibes categories/PEN STANDS.png',
    bgColor: '#2c3e50',
    alt: 'Elegant pen stands and desk accessories',
  },
  {
    name: 'PROMOTIONAL UMBRELLAS',
    subtitle: 'Branded Solutions',
    image: '/Giftvibes categories/PROMOTIONAL UMBRELLAS.jpg',
    bgColor: '#8b4513',
    alt: 'Custom promotional umbrellas for marketing',
  },
  {
    name: 'CUSTOMISED DIARY & NOTE BOOKS',
    subtitle: '150+ Designs Available',
    image: '/Giftvibes categories/PROMOTIONAL DIARIES AND NOTEBOOKS.jpg',
    bgColor: '#E8923C',
    alt: 'Fully customized diaries and notebooks',
  },
  {
    name: 'CALENDARS',
    subtitle: 'Desktop & Wall Options',
    image: '/Giftvibes categories/CALENDARS.png',
    bgColor: '#28966E',
    alt: 'Custom table and wall calendars',
  },
  {
    name: "EXHIBITION VISITOR'S GIFT IDEAS",
    subtitle: 'Trade Show Specials',
    image: '/Giftvibes categories/EXHIBITION GIVEAWAY IDEAS.png',
    bgColor: '#124559',
    alt: 'Special gift ideas for exhibition visitors',
  },
];

const Categories = () => {
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
            Our Products
          </motion.h3>
        </div>
        <div className="flex overflow-x-auto gap-6 pb-4 custom-scrollbar">
          {categoryData.map((category, index) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
              className="w-[240px] flex-shrink-0"
            >
            <Link href="#" className="block group">
              <div
                className="relative h-[280px] rounded-[16px] overflow-hidden transition-all duration-500 ease-out hover:scale-105 hover:shadow-2xl hover:shadow-black/20"
                style={{ backgroundColor: category.bgColor }}
              >
                <Image
                  src={category.image}
                  alt={category.alt}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                
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