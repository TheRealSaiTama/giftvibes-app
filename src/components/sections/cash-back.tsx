import Image from "next/image";
import Link from "next/link";

const CashBackSection = () => {
  return (
    <section className="bg-primary py-[100px] overflow-hidden">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div className="text-white">
            <h2 className="text-[40px] leading-[50px] font-bold mb-[30px]">
              Get 5% Cash back on $200
            </h2>
            <p className="text-base leading-7 text-white/70 max-w-[440px] mb-10">
              Shopping is a bit of a relaxing hobby for me, which is sometimes
              troubling for the bank balance.
            </p>
            <Link
              href="#"
              className="inline-block bg-white text-black font-semibold text-base py-[18px] px-[43px] rounded-lg transition-colors hover:bg-gray-200"
            >
              Learn More
            </Link>
          </div>

          {/* Right Images */}
          <div className="relative h-[400px] w-full max-w-[535px] mx-auto lg:ml-auto lg:mr-0">
            <div className="absolute bottom-0 left-0 z-10 -rotate-[8deg]">
              <Image
                src="https://cdn.prod.website-files.com/63e857eaeaf853471d5335ff/63e8c4e768e3260571e48a0c_visa%20card-min.png"
                alt="Dark blue visa card"
                width={380}
                height={239}
                className="w-[380px] max-w-none"
              />
            </div>
            <div className="absolute bottom-0 right-0 z-20 rotate-[8deg]">
              <Image
                src="https://cdn.prod.website-files.com/63e857eaeaf853471d5335ff/63e8c4e71eb4ad08ebe75690_visa%20card%2002-min.png"
                alt="Light blue visa card"
                width={380}
                height={239}
                className="w-[380px] max-w-none"
              />
            </div>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 z-30">
              <Image
                src="https://cdn.prod.website-files.com/63e857eaeaf853471d5335ff/63ea1a963f08a8c3dcd7c945_visa%20card%2003.svg"
                alt="Green visa card"
                width={380}
                height={239}
                className="w-[380px] max-w-none"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CashBackSection;