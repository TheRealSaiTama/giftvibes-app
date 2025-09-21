import Image from 'next/image';

interface Product {
  name: string;
  price: number;
  description: string;
  image: string;
  currency?: 'INR' | 'USD';
}

const products: Product[] = [
  {
    name: 'NEXA ECO Paper Diary 2026',
    price: 106.0,
    description: 'Eco‑friendly 2026 diary with premium PU cover, 80 GSM ruled pages, and ribbon bookmark.',
    image: '/diary/image.png',
    currency: 'INR',
  },
  {
    name: 'Prime A5 Premium Leather Diary 2026',
    price: 125.00,
    description: 'Premium A5 leather diary with soft-touch cover, 100 GSM ruled pages, elastic closure, pen loop, and ribbon bookmark.',
    image: '/diary/2026.png',
    currency: 'INR',
  },
  {
    name: 'Regular Leather Engineering Diary 2026',
    price: 140.00,
    description: 'Classic hardbound PU leather engineering diary with 100 GSM ruled pages, monthly planner and index, ribbon bookmark.',
    image: '/diary/regularleather.png',
    currency: 'INR',
  },
  {
    name: 'Blue Ocean Leather Diary With Magnet Flap',
    price: 155.00,
    description: 'Premium blue PU leather diary with magnetic flap closure, stitched edges, 100 GSM ruled pages and ribbon bookmark.',
    image: '/diary/blueocean.png',
    currency: 'INR',
  },
  {
    name: 'SUPRA ECO Natural Paper Diary 2026',
    price: 110.00,
    description: 'Eco-conscious diary with recycled natural paper, soft-touch cover, 80 GSM pages and clean minimal layout.',
    image: '/diary/supereco.png',
    currency: 'INR',
  },
  {
    name: 'Hardy Square PU Leather Sunday Full Diary 2026',
    price: 132.00,
    description: 'Textured square‑pattern PU leather diary with Sunday full page layout, 100 GSM pages and ribbon bookmark.',
    image: '/diary/hardysquare.png',
    currency: 'INR',
  },
];

const heartIconUrl = "https://cdn.prod.website-files.com/63e857eaeaf853471d5335ff/63e9df775b939f51a0b22f6d_Icon.svg";
const starIconUrl = "https://cdn.prod.website-files.com/63e857eaeaf853471d5335ff/63e9d9ee08987e0ffb064bca_Star.svg";

const ProductCard = ({ product }: { product: Product }) => (
  <div className="bg-card rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col group transition-shadow duration-300 hover:shadow-xl">
    <div className="relative bg-light-gray aspect-square rounded-t-lg overflow-hidden">
      <Image 
        src={product.image} 
        alt={product.name} 
        fill
        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" 
        className="object-contain"
      />
      <button className="absolute top-4 right-4 bg-white rounded-full p-2.5 shadow-sm hover:bg-gray-100 transition-all duration-300 opacity-0 translate-y-1 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto">
        <Image src={heartIconUrl} alt="Add to wishlist" width={16} height={16} />
      </button>
    </div>
    <div className="p-6 flex flex-col flex-grow">
      <div className="flex justify-between items-start mb-1.5">
        <h3 className="text-[18px] font-semibold text-dark-gray leading-tight mr-2">{product.name}</h3>
        <p className="price-text whitespace-nowrap">{product.currency === 'INR' ? '₹' : '$'}{product.price.toFixed(2)}</p>
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
        <h2 className="mb-10">Latest Collections 2026</h2>
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