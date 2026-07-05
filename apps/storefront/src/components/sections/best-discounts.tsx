import * as React from "react";

const BestDiscountsBanner = ({ content }: { content?: any }) => {
  const text_1 = content?.text_1 || "BEST DISCOUNTS";
  const text_2 = content?.text_2 || "ONLY WHOLESALE";

  return (
    <section className="py-7">
      <div className="container mx-auto px-6 flex items-center justify-center">
        <div className="inline-flex items-center gap-6">
          <span className="text-4xl font-bold text-[#124559]">{text_1}</span>
          <span className="h-22 w-px bg-[#124559]/30" />
          <span className="text-4xl font-bold text-[#124559]">{text_2}</span>
        </div>
      </div>
    </section>
  );
};

export default BestDiscountsBanner;


