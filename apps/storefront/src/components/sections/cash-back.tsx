import Image from "next/image";
import Link from "next/link";

const CashBackSection = ({ content }: { content?: any }) => {
  const heading = content?.heading || "Corporate Diaries & Premium Gift Sets from GiftVibes.in";
  const description = content?.description || "From logo‑embossed planners to curated gift combos, We help promote your brand that leaves a long lasting impression on your clients and builds a sense of trust among your employees. Customised Diaries, Customised Notebooks, Customised Gifts, Executive Diaries, Leather Diaries and Gift sets at best price.   delivered on time.";
  const btnText = content?.cta?.text || "Learn More";
  const btnUrl = content?.cta?.url || "/shop";
  const imgUrl = content?.image_url || "/removebg2.png";

  return (
    <section className="bg-primary py-[100px] overflow-hidden">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div className="text-white">
            <h2 className="text-[40px] leading-[50px] font-bold mb-[30px] text-white">
              {heading}
            </h2>
            <p className="text-base leading-7 text-white/80 max-w-[520px] mb-10">
              {description}
            </p>
            <Link href={btnUrl} className="neumorphic-btn">
              <div className="button-outer">
                <div className="button-inner">
                  <span>{btnText}</span>
                </div>
              </div>
            </Link>
          </div>

          {/* Right Visual */}
          <div className="relative h-[420px] w-full max-w-[560px] mx-auto lg:ml-auto lg:mr-0">
            <Image
              src={imgUrl}
              alt="Premium diaries and corporate gift sets"
              fill
              sizes="(max-width: 1024px) 80vw, 560px"
              className="object-contain"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default CashBackSection;