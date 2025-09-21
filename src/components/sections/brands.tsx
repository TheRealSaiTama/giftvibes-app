"use client";
import Image from "next/image";
import { motion } from "motion/react";
import AnimatedShinyText from "@/components/magicui/animated-shiny-text";

type Brand = {
  name: string;
  logo: string;
};

const brandsData: Brand[] = [
  { name: 'GiftVibes', logo: '/brand/gfg.png' },
  { name: 'GiftVibes', logo: '/brand/gfg.png' },
  { name: 'GiftVibes', logo: '/brand/gfg.png' },
  { name: 'GiftVibes', logo: '/brand/gfg.png' },
  { name: 'GiftVibes', logo: '/brand/gfg.png' },
  { name: 'GiftVibes', logo: '/brand/gfg.png' },
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
            Trusted by Brands
          </AnimatedShinyText>
        </h2>
        <div className="relative py-2">
          <motion.div
            className="flex whitespace-nowrap"
            initial={{ x: 0 }}
            animate={{ x: ['0%', '-50%'] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          >
            {[...brandsData, ...brandsData, ...brandsData, ...brandsData].map((brand, idx) => (
              <BrandLogo key={`${brand.name}-${idx}-${Math.random()}`} brand={brand} />
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default BrandsSection;