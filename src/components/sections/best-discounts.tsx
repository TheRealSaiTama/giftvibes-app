import React from 'react';
import ComicText from '@/components/ui/comic-text';

const BestDiscountsBanner: React.FC = () => {
  return (
    <section className="py-7">
      <div className="container mx-auto px-6 flex items-center justify-center">
        <div className="inline-flex items-center gap-6">
          <ComicText fontSize={4.0}>BEST DISCOUNTS</ComicText>
          <span className="h-22 w-px bg-[#124559]/30" />
          <ComicText fontSize={4.0}>ONLY WHOLESALE</ComicText>
        </div>
      </div>
    </section>
  );
};

export default BestDiscountsBanner;


