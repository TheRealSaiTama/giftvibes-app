import Image from 'next/image';

const products = [
  {
    name: 'HomePod mini',
    price: 239.00,
    description: 'Table with air purifier, stained veneer/black',
    image: 'https://cdn.prod.website-files.com/63e857eaeaf853471d5335ff/63e8c4e563db5507951bbfbe_homepad-mini-min.png',
  },
  {
    name: 'Instax Mini 9',
    price: 99.00,
    description: 'Selfie mode and selfie mirror, Macro mode',
    image: 'https://cdn.prod.website-files.com/63e857eaeaf853471d5335ff/63e8c4e563db5537881bbfcf_instax%20mini%209-min.png',
  },
  {
    name: 'Base Camp Duffel M',
    price: 159.00,
    description: 'Table with air purifier, stained veneer/black',
    image: 'https://cdn.prod.website-files.com/63e857eaeaf853471d5335ff/63e8c4e48b497e63cc46b800_base%20camp%20duffel%2002-min.png',
  },
  {
    name: 'Tote Medium',
    price: 239.00,
    description: 'Canvas, full grain leather',
    image: 'https://cdn.prod.website-files.com/63e857eaeaf853471d5335ff/63e8c4e7e006821d3b04db74_Tote%20Medium-min.png',
  },
  {
    name: 'Gaming Headphone',
    price: 239.00,
    description: 'Table with air purifier, stained veneer/black',
    image: 'https://cdn.prod.website-files.com/63e857eaeaf853471d5335ff/63e8c4e54b76914b262f2448_headphone-min.png',
  },
  {
    name: 'Tomford Watch',
    price: 39.00,
    description: 'Table with air purifier, stained veneer/black',
    image: 'https://cdn.prod.website-files.com/63e857eaeaf853471d5335ff/63e8c4e74b769109fd2f245a_tomford%20watch-min.png',
  },
];

const heartIconUrl = "https://cdn.prod.website-files.com/63e857eaeaf853471d5335ff/63e9df775b939f51a0b22f6d_Icon.svg";
const starIconUrl = "https://cdn.prod.website-files.com/63e857eaeaf853471d5335ff/63e9d9ee08987e0ffb064bca_Star.svg";

type Product = typeof products[0];

const ProductCard = ({ product }: { product: Product }) => (
  <div className="bg-card rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col group transition-shadow duration-300 hover:shadow-xl">
    <div className="relative bg-light-gray flex items-center justify-center p-5 aspect-square rounded-t-lg">
      <Image 
        src={product.image} 
        alt={product.name} 
        width={180} 
        height={180} 
        className="object-contain h-auto max-h-full max-w-full"
      />
      <button className="absolute top-4 right-4 bg-white rounded-full p-2.5 shadow-sm hover:bg-gray-100 transition-colors">
        <Image src={heartIconUrl} alt="Add to wishlist" width={16} height={16} />
      </button>
    </div>
    <div className="p-6 flex flex-col flex-grow">
      <div className="flex justify-between items-start mb-1.5">
        <h3 className="text-[18px] font-semibold text-dark-gray leading-tight mr-2">{product.name}</h3>
        <p className="price-text whitespace-nowrap">${product.price.toFixed(2)}</p>
      </div>
      <p className="text-sm text-medium-gray mb-3.5 h-10">{product.description}</p>
      <div className="flex items-center mb-5">
        <div className="flex items-center">
          {Array(5).fill(0).map((_, i) => (
            <Image key={i} src={starIconUrl} alt="star" width={16} height={16} className="mr-0.5" />
          ))}
        </div>
        <span className="small ml-2">(121)</span>
      </div>
      <a href="#" className="w-full text-center py-3.5 px-6 bg-white border border-border text-dark-gray btn-text rounded-md transition-colors duration-200 ease-in-out hover:bg-primary hover:text-primary-foreground hover:border-primary">
        Add to Cart
      </a>
    </div>
  </div>
);

const BestDealsSection = () => {
  return (
    <section className="bg-background py-16">
      <div className="container">
        <h2 className="mb-10">Todays Best Deals for you!</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard key={product.name} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default BestDealsSection;