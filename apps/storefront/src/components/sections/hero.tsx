"use client";

import { useRouter } from "next/navigation";
import InteractiveHoverButton from '@/components/magicui/interactive-hover-button';

const Hero = ({ content }: { content?: any }) => {
  const router = useRouter();
  const heading_1 = content?.heading_1 || "Custom Diaries";
  const heading_2 = content?.heading_2 || "Corporate Gifts.";
  const subheading_1 = content?.subheading_1 || "Crafting premium customized diaries and";
  const subheading_2 = content?.subheading_2 || "corporate gifts with unmatched quality.";
  const btnBaseText = content?.primary_cta?.base_text || "Come Here";
  const btnHoverText = content?.primary_cta?.hover_text || "Explore More";
  const btnUrl = content?.primary_cta?.url || "/shop";
  const bgImg = content?.background_image_url || "/headerimage5.png";

  return (
    <section className="relative overflow-hidden bg-cover bg-center bg-no-repeat" style={{backgroundImage: `url(${bgImg})`}}>
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-white/0 mix-blend-screen" />
        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-transparent to-[#124559]/20" />
      </div>
      <div className="mx-auto max-w-[1200px] px-[20px] md:px-[0px] py-[60px] md:py-[80px] min-h-[500px] md:min-h-[600px] flex items-center">
        <div className="relative z-10 w-full md:w-3/5 lg:w-1/2">
          <div className="overflow-hidden">
            <h1 className="text-[48px] md:text-[56px] lg:text-[72px] font-bold leading-[1.1] -tracking-[1.8px] text-[#124559] drop-shadow-lg">
              {heading_1}
            </h1>
          </div>
          <div className="overflow-hidden">
            <h1 className="text-[48px] md:text-[56px] lg:text-[72px] font-bold leading-[1.1] -tracking-[1.8px] text-[#124559] drop-shadow-lg">
              {heading_2}
            </h1>
          </div>
          <div className="mt-6 overflow-hidden">
            <p className="max-w-[480px] text-lg font-medium leading-7 text-[#124559] drop-shadow-md">
              {subheading_1}
            </p>
            <p className="max-w-[480px] text-lg font-medium leading-7 text-[#124559] drop-shadow-md">
              {subheading_2}
            </p>
          </div>
          <div className="mt-8">
            <InteractiveHoverButton
              baseText={btnBaseText}
              hoverText={btnHoverText}
              onClick={() => router.push(btnUrl)}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;