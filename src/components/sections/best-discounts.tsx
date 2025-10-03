import * as React from "react";

const BestDiscountsBanner: React.FC = () => {
  return (
    <section className="py-7">
      <div className="container mx-auto px-6 flex items-center justify-center">
        <div className="inline-flex items-center gap-6">
          <span className="text-4xl font-bold text-[#124559]">BEST DISCOUNTS</span>
          <span className="h-22 w-px bg-[#124559]/30" />
          <span className="text-4xl font-bold text-[#124559]">ONLY WHOLESALE</span>
        </div>
      </div>
    </section>
  );
};

export default BestDiscountsBanner;


