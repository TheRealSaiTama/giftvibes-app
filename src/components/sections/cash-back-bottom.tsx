import Image from "next/image";
import Link from "next/link";

const CashBackBottom = () => {
  return (
    <section className="py-[100px]">
      <div className="container">
        <div className="relative h-[416px] w-full rounded-2xl overflow-hidden flex items-center">
          <Image
            src="/footer1.png"
            alt="Promotional banner for corporate gifts"
            fill
            sizes="(max-width: 1200px) 100vw, 1200px"
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative z-10 w-full max-w-lg pl-8 lg:pl-16">
            <h2 className="text-xl lg:text-2xl xl:text-3xl font-bold text-white leading-tight mb-6">
              Customised Diaries and Note Books
              <br />
              <span className="text-xl lg:text-2xl xl:text-3xl">Customised Corporate Gifts at Best price</span>
            </h2>
            <Link href="/custom-design" className="learn-more">
              Learn More
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CashBackBottom;