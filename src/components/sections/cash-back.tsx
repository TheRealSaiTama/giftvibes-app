import Image from "next/image";
import Link from "next/link";

const CashBackSection = () => {
  return (
    <section className="bg-primary py-[100px] overflow-hidden">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div className="text-white">
            <h2 className="text-[40px] leading-[50px] font-bold mb-[30px] text-white">
              Corporate Diaries & Premium Gift Sets
            </h2>
            <p className="text-base leading-7 text-white/80 max-w-[520px] mb-10">
              From logo‑embossed planners to curated gift combos, we craft branded stationery that
              elevates your client and employee gifting. Customizable, premium, delivered on time.
            </p>
            <button className="neumorphic-btn">
              <div className="button-outer">
                <div className="button-inner">
                  <span>Learn More</span>
                </div>
              </div>
            </button>
          </div>

          {/* Right Visual */}
          <div className="relative h-[420px] w-full max-w-[560px] mx-auto lg:ml-auto lg:mr-0">
            <Image
              src="/removebg2.png"
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