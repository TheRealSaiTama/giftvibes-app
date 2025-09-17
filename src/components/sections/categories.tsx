import Image from 'next/image';
import Link from 'next/link';

interface Category {
  name: string;
  image: string;
  bgColor: string;
  alt: string;
}

const categoryData: Category[] = [
  {
    name: 'Furniture',
    image: 'https://cdn.prod.website-files.com/63e857eaeaf853471d5335ff/63e8c4e570738029a725e686_Furniture-min.png',
    bgColor: '#286269',
    alt: 'Modern living room with furniture',
  },
  {
    name: 'Hand Bag',
    image: 'https://cdn.prod.website-files.com/63e857eaeaf853471d5335ff/63e8c4e52d6553668075697e_hand%20bag-min.png',
    bgColor: '#E8923C',
    alt: 'Leather handbags on an orange background',
  },
  {
    name: 'Books',
    image: 'https://cdn.prod.website-files.com/63e857eaeaf853471d5335ff/63e8c4e460afc22b7ea53520_books-min.png',
    bgColor: '#A14144',
    alt: 'Stack of books against a red background',
  },
  {
    name: 'Tech',
    image: 'https://cdn.prod.website-files.com/63e857eaeaf853471d5335ff/63e8c4e754ac2e32897cb53b_tech-min.png',
    bgColor: '#28966E',
    alt: 'Various tech gadgets on a green background',
  },
  {
    name: 'Sneakers',
    image: 'https://cdn.prod.website-files.com/63e857eaeaf853471d5335ff/63e8c4e64b769118272f244f_sneakers-min.png',
    bgColor: '#C68393',
    alt: 'Person wearing white sneakers with one foot on a purple tire',
  },
  {
    name: 'Travel',
    image: 'https://cdn.prod.website-files.com/63e857eaeaf853471d5335ff/63e8c4e71eb4ad6d07e7568f_travel-min.png',
    bgColor: '#E7AA4F',
    alt: 'Travel items including a suitcase, hat, and headphones on a yellow background',
  },
];

const Categories = () => {
  return (
    <section className="bg-white py-[100px]">
      <div className="container">
        <div className="section-title-wrap">
          <h3 className="text-[32px] font-bold text-[#1a1a1a] leading-[48px] mb-10">
            Shop our top categories
          </h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {categoryData.map((category) => (
            <Link href="#" key={category.name} className="block">
              <div 
                className="relative h-[250px] p-5 rounded-[12px] overflow-hidden transition-transform duration-300 ease-in-out hover:scale-105"
                style={{ backgroundColor: category.bgColor }}
              >
                <Image
                  src={category.image}
                  alt={category.alt}
                  fill
                  sizes="(max-width: 767px) 50vw, (max-width: 1024px) 33vw, 16vw"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <h3 className="relative z-10 text-2xl font-semibold leading-7 text-white">
                  {category.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;