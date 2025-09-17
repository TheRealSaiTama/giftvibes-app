import Image from "next/image";

const TrendingProducts = () => {
  return (
    <section className="bg-light-gray py-[100px]">
      <div className="container">
        <div className="text-center">
          <h3 className="mb-10 text-[32px] font-bold text-dark-gray">
            Trending Products for you!
          </h3>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="relative flex h-[344px] flex-col items-start justify-end overflow-hidden rounded-lg py-[55px] px-10 text-white">
            <Image
              src="https://cdn.prod.website-files.com/63e857eaeaf853471d5335ff/63e8c4e6cd3678e82164f755_furniture%20village-min.png"
              alt="Furniture Village promotion"
              fill
              className="absolute inset-0 -z-10 h-full w-full object-cover"
            />
            <h3 className="mb-[5px] text-2xl font-semibold">
              Furniture Village
            </h3>
            <p className="mb-5 text-base">Delivery with in 24 hours</p>
            <a
              href="#"
              className="inline-flex items-center justify-center rounded-[6px] bg-white px-[30px] py-[19px] text-base font-medium text-dark-gray no-underline"
            >
              Shop Now
            </a>
          </div>
          <div className="relative flex h-[344px] flex-col items-start justify-end overflow-hidden rounded-lg py-[55px] px-10 text-white">
            <Image
              src="https://cdn.prod.website-files.com/63e857eaeaf853471d5335ff/63e8c4e6037f3b456acf2024_Fashion%20world-min.png"
              alt="Fashion World promotion"
              fill
              className="absolute inset-0 -z-10 h-full w-full object-cover"
            />
            <h3 className="mb-[5px] text-2xl font-semibold">Fashion World</h3>
            <p className="mb-5 text-base">Delivery with in 24 hours</p>
            <a
              href="#"
              className="inline-flex items-center justify-center rounded-[6px] bg-white px-[30px] py-[19px] text-base font-medium text-dark-gray no-underline"
            >
              Shop Now
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrendingProducts;