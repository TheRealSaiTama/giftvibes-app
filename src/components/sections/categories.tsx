"use client";
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'motion/react';

interface Category {
  name: string;
  image: string;
  bgColor: string;
  alt: string;
}

const categoryData: Category[] = [
  {
    name: 'CUSTOM',
    image: '/customdiary.jpg',
    bgColor: '#124559',
    alt: 'Beautiful customized diaries with personal designs',
  },
  {
    name: 'NEW YEAR',
    image: '/unnamed.png',
    bgColor: '#1a5d73',
    alt: 'Elegant New Year themed diaries',
  },
  {
    name: 'DIWALI',
    image: '/diwali.png',
    bgColor: '#E8923C',
    alt: 'Premium Diwali gift diaries and sets',
  },
  {
    name: 'CORPORATE',
    image: '/corporate.png',
    bgColor: '#2c3e50',
    alt: 'Professional corporate gift sets and diaries',
  },
  {
    name: 'LOGO PRINT',
    image: '/logodiary.png',
    bgColor: '#8b4513',
    alt: 'Custom logo printed diaries for businesses',
  },
  {
    name: 'PROMO',
    image: '/promodiary.png',
    bgColor: '#28966E',
    alt: 'Promotional gifts and diary sets',
  },
];

const Categories = () => {
  return (
    <section className="bg-white py-[100px]">
      <div className="container">
        <div className="section-title-wrap">
          <motion.h3
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="text-[32px] font-bold text-[#1a1a1a] leading-[48px] mb-10"
          >
            Explore Our Product Categories
          </motion.h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {categoryData.map((category, index) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
            >
            <Link href="#" className="block group">
              <div 
                className="relative h-[250px] rounded-[16px] overflow-hidden transition-all duration-500 ease-out hover:scale-105 hover:shadow-2xl hover:shadow-black/20"
                style={{ backgroundColor: category.bgColor }}
              >
                <Image
                  src={category.image}
                  alt={category.alt}
                  fill
                  sizes="(max-width: 767px) 50vw, (max-width: 1024px) 33vw, 16vw"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                
                {/* Modern overlay with gradient */}
                <div className="absolute inset-0 z-[5] bg-gradient-to-br from-black/20 via-transparent to-black/80" />
                
                {/* Corner badge design */}
                <div className="absolute top-4 right-4 z-10">
                  <div className="bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg border border-white/20 transition-all duration-300 group-hover:bg-white group-hover:scale-105">
                    <span className="text-[#124559] font-bold text-xs uppercase tracking-widest">
                      {category.name}
                    </span>
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