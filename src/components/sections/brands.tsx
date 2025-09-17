import Image from "next/image";

type Brand = {
  name: string;
  logo: string;
};

const brandsData: Brand[] = [
  {
    name: 'Staples',
    logo: 'https://cdn.prod.website-files.com/63e857eaeaf853471d5335ff/63e8c4e560afc2c49da53521_brand%20(3)-min.png',
  },
  {
    name: 'Sprouts',
    logo: 'https://cdn.prod.website-files.com/63e857eaeaf853471d5335ff/63e8c4e58b497e41aa46b801_brand%20(8)-min.png',
  },
  {
    name: 'Grocery outlet',
    logo: 'https://cdn.prod.website-files.com/63e857eaeaf853471d5335ff/63e8c4e5eaf8533b0958cefe_brand%20(5)-min.png',
  },
  {
    name: 'Mollie stones',
    logo: 'https://cdn.prod.website-files.com/63e857eaeaf853471d5335ff/63e8c4e454ac2e9d497cb531_brand%20(6)-min.png',
  },
  {
    name: 'Sports Basement',
    logo: 'https://cdn.prod.website-files.com/63e857eaeaf853471d5335ff/63e8c4e4707380971125e685_brand%20(4)-min.png',
  },
  {
    name: 'Container Store',
    logo: 'https://cdn.prod.website-files.com/63e857eaeaf853471d5335ff/63e8c4e460afc2193aa53511_brand%20(2)-min.png',
  },
  {
    name: 'Target',
    logo: 'https://cdn.prod.website-files.com/63e857eaeaf853471d5335ff/63e8c4e4c21faa5e03c209c5_brand%20(1)-min.png',
  },
  {
    name: 'Bevmo!',
    logo: 'https://cdn.prod.website-files.com/63e857eaeaf853471d5335ff/63e8c4e51eb4ad92a3e75673_brand%20(7)-min.png',
  },
];

const BrandCard = ({ brand }: { brand: Brand }) => {
  return (
    <a href="#" className="flex items-center p-5 bg-light-gray rounded-lg transition-colors hover:bg-gray-200">
      <Image
        src={brand.logo}
        alt={`${brand.name} logo`}
        width={56}
        height={56}
        className="h-14 w-14 rounded-full object-cover mr-[15px] shrink-0"
      />
      <div>
        <h3 className="text-lg font-semibold text-[#161c2d] leading-7">{brand.name}</h3>
        <p className="text-sm font-normal text-gray-600 leading-6">Delivery with in 24 hours</p>
      </div>
    </a>
  );
};

const BrandsSection = () => {
  return (
    <section className="py-[100px]">
      <div className="container">
        <h2 className="mb-10 text-3xl font-bold text-[#161c2d]">
          Choose by Brand
        </h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {brandsData.map((brand) => (
            <BrandCard key={brand.name} brand={brand} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default BrandsSection;