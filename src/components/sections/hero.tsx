import React from 'react';
import InteractiveHoverButton from '@/components/magicui/interactive-hover-button';

const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-cover bg-center bg-no-repeat" style={{backgroundImage: 'url(/headerimage5.png)'}}>
      {/* Dark overlay for better text visibility */}
      <div className="absolute inset-0 bg-black/30 z-0"></div>
      <div className="mx-auto max-w-[1200px] px-[20px] md:px-[0px] py-[60px] md:py-[80px] min-h-[500px] md:min-h-[600px] flex items-center">
        <div className="relative z-10 w-full md:w-3/5 lg:w-1/2">
          <div className="overflow-hidden">
            <h1 className="text-[48px] md:text-[56px] lg:text-[72px] font-bold leading-[1.1] -tracking-[1.8px] text-[#124559] drop-shadow-lg">
              Custom Diaries
            </h1>
          </div>
          <div className="overflow-hidden">
            <h1 className="text-[48px] md:text-[56px] lg:text-[72px] font-bold leading-[1.1] -tracking-[1.8px] text-[#124559] drop-shadow-lg">
              Corporate Gifts.
            </h1>
          </div>
          <div className="mt-6 overflow-hidden">
            <p className="max-w-[480px] text-lg font-medium leading-7 text-[#124559] drop-shadow-md">
              Crafting premium customized diaries and
            </p>
            <p className="max-w-[480px] text-lg font-medium leading-7 text-[#124559] drop-shadow-md">
              corporate gifts with unmatched quality.
            </p>
          </div>
          <div className="mt-8">
            <InteractiveHoverButton baseText="Come Here" hoverText="Explore  More" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;