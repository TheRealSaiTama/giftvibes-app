"use client";
import Image from "next/image";
import { motion } from "motion/react";
import AnimatedShinyText from "@/components/magicui/animated-shiny-text";

type Brand = {
  name: string;
  logo: string;
};

// Point to all brand logos placed in public/brand
const brandsData: Brand[] = [
  { name: 'Brand 1', logo: '/brand/image_2025-09-23_00-54-08.png' },
  { name: 'Brand 2', logo: '/brand/image_2025-09-23_00-54-22.png' },
  { name: 'Brand 3', logo: '/brand/image_2025-09-23_00-55-13.png' },
  { name: 'Brand 4', logo: '/brand/image_2025-09-23_00-55-35.png' },
  { name: 'Brand 5', logo: '/brand/image_2025-09-23_00-55-50.png' },
  { name: 'Brand 6', logo: '/brand/image_2025-09-23_00-56-12.png' },
  { name: 'Brand 7', logo: '/brand/image_2025-09-23_00-56-33.png' },
];

const BrandLogo = ({ brand }: { brand: Brand }) => (
  <div className="mx-16 min-w-[200px] flex items-center justify-center py-2">
    <Image
      src={brand.logo}
      alt={`${brand.name} logo`}
      width={240}
      height={240}
      className="h-24 w-auto object-contain opacity-90 hover:opacity-100 transition-opacity"
    />
  </div>
);

const BrandsSection = () => {
  return (
    <section className="py-[100px]">
      <div className="container overflow-hidden">
        <h2 className="mb-10 text-3xl font-bold">
          <AnimatedShinyText 
            className="!text-[#161c2d] !bg-gradient-to-r !from-transparent !via-[#161c2d]/80 !via-50% !to-transparent !max-w-none !mx-0"
            shimmerWidth={150}
          >
            Trusted by Leading Brands
          </AnimatedShinyText>
        </h2>
        {/* Seamless marquee */}
        <div className="relative py-10 mt-6">
          <motion.div
            className="flex whitespace-nowrap"
            initial={{ x: 0 }}
            animate={{ x: ['0%', '-50%'] }}
            transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          >
            {[...brandsData, ...brandsData].map((brand, idx) => (
              <BrandLogo key={`marquee-${brand.name}-${idx}`} brand={brand} />
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default BrandsSection;