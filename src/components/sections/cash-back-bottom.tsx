import Image from "next/image";
import Link from "next/link";

const CashBackBottom = () => {
  return (
    <section className="py-[100px]">
      <div className="container">
        <div className="relative h-[416px] w-full rounded-2xl overflow-hidden flex items-center justify-center lg:justify-start lg:pl-[60px] p-8">
          <Image
            src="/footer1.png"
            alt="Promotional banner for corporate gifts"
            fill
            sizes="(max-width: 1200px) 100vw, 1200px"
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative z-10 w-full lg:w-auto text-center lg:text-left">
            <h2 className="text-5xl font-bold text-white leading-tight mb-5">
              Get Special Discounts
              <br />
              on giftvibes.in
            </h2>
            <Link href="#" className="learn-more">
              Learn More
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CashBackBottom;