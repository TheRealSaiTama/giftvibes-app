import Image from 'next/image';

const discountData = [
  {
    amount: "100",
    bgColor: "bg-[#f6eee6]",
    textColor: "text-[#ceaf2d]",
    imageUrl: "https://cdn.prod.website-files.com/63e857eaeaf853471d5335ff/63e8c4e6cd367817e964f756_sofa-min.png",
    alt: "Sofa",
  },
  {
    amount: "29",
    bgColor: "bg-[#fce1e8]",
    textColor: "text-[#d72f2f]",
    imageUrl: "https://cdn.prod.website-files.com/63e857eaeaf853471d5335ff/63e8c4e4e006822af104db61_book-min.png",
    alt: "Book",
  },
  {
    amount: "67",
    bgColor: "bg-[#eee6dd]",
    textColor: "text-[#b88933]",
    imageUrl: "https://cdn.prod.website-files.com/63e857eaeaf853471d5335ff/63e8c4e61a7c20076aec5fe7_shirt-min.png",
    alt: "Shirt",
  },
  {
    amount: "59",
    bgColor: "bg-[#def6ec]",
    textColor: "text-[#003d29]",
    imageUrl: "https://cdn.prod.website-files.com/63e857eaeaf853471d5335ff/63e8c4e53f7127592743f6be_bug%20%26%20book-min.png",
    alt: "Bag and Book",
  },
];

const DiscountsSection = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container px-6 md:px-10">
        <div className="mb-10">
          <h3 className="text-3xl font-bold text-[#1a1a1a]">
            Get Up to 70% off
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {discountData.map((item, index) => (
            <a
              key={index}
              href="#"
              className={`relative flex items-center justify-between p-6 rounded-xl overflow-hidden ${item.bgColor}`}
            >
              <div className="relative z-10 flex flex-col">
                <h3 className="text-lg font-semibold text-[#1a1a1a]">
                  Save
                </h3>
                <div className={`text-4xl font-bold leading-tight ${item.textColor}`}>
                  <span className="text-4xl font-bold leading-tight">$</span>{item.amount}
                </div>
                <p className="mt-2 text-sm font-medium text-[#1a1a1a] max-w-[140px] leading-5">
                  Explore Our Furniture & Home Furnishing Range
                </p>
              </div>
              <div className="absolute right-0 bottom-0 z-0">
                <Image
                  src={item.imageUrl}
                  alt={item.alt}
                  width={250}
                  height={250}
                  className="w-[250px] h-auto max-w-none"
                />
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DiscountsSection;