import Image from 'next/image';

interface Store {
  name: string;
  bgImage: string;
  avatar: string;
  categories: string[];
}

const storesData: Store[] = [
  {
    name: 'Staples',
    bgImage: 'https://cdn.prod.website-files.com/63e857eaeaf853471d5335ff/63e8c4e62d65536b6a75698f_store%20one-min.png',
    avatar: 'https://cdn.prod.website-files.com/63e857eaeaf853471d5335ff/63ea2d253f08a89912d90709_Ellipse%20287.png',
    categories: ['Bag', 'Perfume'],
  },
  {
    name: 'Now Delivery',
    bgImage: 'https://cdn.prod.website-files.com/63e857eaeaf853471d5335ff/63e8c4e74bd907803dd35b4f_store%20two-min.png',
    avatar: 'https://cdn.prod.website-files.com/63e857eaeaf853471d5335ff/63ea2d253a093c1dea9a21c7_Ellipse%20287-1.png',
    categories: ['Bag', 'Perfume'],
  },
  {
    name: 'Bevmo',
    bgImage: 'https://cdn.prod.website-files.com/63e857eaeaf853471d5335ff/63e8c4e668e3265021e48a0b_store%20three-min.png',
    avatar: 'https://cdn.prod.website-files.com/63e857eaeaf853471d5335ff/63ea2d25fbba384ffd156e76_Ellipse%20287-2.png',
    categories: ['Bag', 'Perfume'],
  },
  {
    name: 'Quicklly',
    bgImage: 'https://cdn.prod.website-files.com/63e857eaeaf853471d5335ff/63e8c4e6eaf8537c8058cf04_store%20four-min.png',
    avatar: 'https://cdn.prod.website-files.com/63e857eaeaf853471d5335ff/63ea2d25dddbd27c9eda91b5_Ellipse%20287-3.png',
    categories: ['Bag', 'Perfume'],
  },
];

const DELIVERY_ICON_URL = 'https://cdn.prod.website-files.com/63e857eaeaf853471d5335ff/63ea2eeefd8efb290e2d7d78_Icon.png';
const DELIVERY_TEXT = 'Delivery with in 24 hours';

const StoreCard = ({ store }: { store: Store }) => {
  return (
    <a href="#" className="block bg-white rounded-lg border border-[#F5F5F5] overflow-hidden transition-shadow duration-200 hover:shadow-md">
      <div className="relative w-full h-[120px]">
        <Image 
          src={store.bgImage} 
          alt={`${store.name} store background`} 
          layout="fill" 
          objectFit="cover"
        />
      </div>
      
      <div className="p-5">
        <div className="flex items-start gap-4">
          <Image 
            src={store.avatar} 
            alt={`${store.name} logo`} 
            width={50} 
            height={50} 
            className="rounded-full flex-shrink-0"
          />
          <div>
            <h3 className="text-lg font-semibold text-[#333333]">{store.name}</h3>
            <div className="flex items-center gap-x-2.5 mt-1">
              <span className="text-xs text-[#666666]">{store.categories[0]}</span>
              <span className="text-xs text-[#666666]">{store.categories[1]}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-[#F5F5F5] py-2.5 px-5 flex items-center gap-2.5">
        <Image 
          src={DELIVERY_ICON_URL} 
          alt="Delivery icon" 
          width={16} 
          height={16} 
        />
        <p className="text-xs text-[#666666]">{DELIVERY_TEXT}</p>
      </div>
    </a>
  );
};


const BestSellingStore = () => {
  return (
    <section className="bg-white pt-[100px] pb-20">
      <div className="container">
        <div className="mb-10">
          <h3 className="text-3xl font-bold text-[#333333]">Best Selling Store</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {storesData.map((store) => (
            <StoreCard key={store.name} store={store} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default BestSellingStore;