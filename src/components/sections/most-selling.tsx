import Image from 'next/image';
import { Button } from '@/components/ui/button';

interface Product {
  name: string;
  price: string;
  description: string;
  imageUrl: string;
  reviews: number;
}

const products: Product[] = [
  {
    name: 'Instax Mini 11',
    price: '89.00',
    description: 'Selfie mode and selfie mirror, Macro mode',
    imageUrl: 'https://cdn.prod.website-files.com/63e857eaeaf853471d5335ff/63e8c4e6eaf85336ce58cf03_instax%20mini%2011-min.png',
    reviews: 121,
  },
  {
    name: 'Hand Watch',
    price: '59.00',
    description: 'Citizen 650M, W-69g',
    imageUrl: 'https://cdn.prod.website-files.com/63e857eaeaf853471d5335ff/63e8c4e74b76916e072f2466_watch-min.png',
    reviews: 121,
  },
  {
    name: 'adidas Sneakers',
    price: '159.00',
    description: 'x Sean Wotherspoon Superstar sneakers',
    imageUrl: 'https://cdn.prod.website-files.com/63e857eaeaf853471d5335ff/63e8c4e4037f3ba53bcf2021_adidas%20sneakers-min.png',
    reviews: 121,
  },
  {
    name: 'Pendleton Water Bottle',
    price: '89.00',
    description: 'Stainless steel, Food safe, Hand wash',
    imageUrl: 'https://cdn.prod.website-files.com/63e857eaeaf853471d5335ff/63e8c4e65cc936826acce6d9_pendleton%20water%20bottle-min.png',
    reviews: 121,
  },
  {
    name: 'Cabin',
    price: '239.00',
    description: 'Table with air purifier, stained veneer/black',
    imageUrl: 'https://cdn.prod.website-files.com/63e857eaeaf853471d5335ff/63e8c4e5bc6a9ac192b3d597_cabin-min.png',
    reviews: 121,
  },
];

const StarIcon = (props: { className?: string }) => (
  <Image
    src="https://cdn.prod.website-files.com/63e857eaeaf853471d5335ff/63e9d9ee08987e0ffb064bca_Star.svg"
    alt="star rating"
    width={16}
    height={16}
    className={props.className}
  />
);

const ProductCard = ({ product }: { product: Product }) => (
  <div className="bg-white rounded-lg p-4 flex flex-col h-full shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-transform duration-300 hover:-translate-y-1">
    <div className="relative bg-light-gray rounded-lg p-5 mb-4 aspect-square flex items-center justify-center">
      <Image
        src={product.imageUrl}
        alt={product.name}
        width={200}
        height={200}
        className="object-contain w-full h-full"
      />
      <Button
        size="icon"
        variant="ghost"
        className="absolute top-2.5 right-2.5 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm transition-transform hover:scale-110 hover:bg-white"
      >
        <Image
          src="https://cdn.prod.website-files.com/63e857eaeaf853471d5335ff/63e9df775b939f51a0b22f6d_Icon.svg"
          alt="Add to wishlist"
          width={16}
          height={16}
        />
      </Button>
    </div>
    <div className="flex flex-col flex-grow">
      <div className="flex justify-between items-start mb-1">
        <h3 className="font-semibold text-dark-gray text-base leading-tight">{product.name}</h3>
        <p className="price-text shrink-0 ml-2">${product.price}</p>
      </div>
      <p className="text-muted-foreground text-sm mb-3">{product.description}</p>
      <div className="flex items-center mb-4">
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <StarIcon key={i} />
          ))}
        </div>
        <span className="text-sm text-muted-foreground ml-2">({product.reviews})</span>
      </div>
      <div className="mt-auto">
        <Button
          variant="outline"
          className="w-full rounded-md border-primary btn-text text-dark-gray hover:bg-primary hover:text-primary-foreground"
        >
          Add to Cart
        </Button>
      </div>
    </div>
  </div>
);

const MostSellingProducts = () => {
  return (
    <section className="bg-[#fdf6ed] py-24">
      <div className="container">
        <h3 className="text-3xl font-bold text-dark-gray text-left mb-10">
          Most Selling Products
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {products.map((product) => (
            <ProductCard key={product.name} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default MostSellingProducts;