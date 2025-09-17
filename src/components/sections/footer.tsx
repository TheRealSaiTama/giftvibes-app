import Image from 'next/image';

const departmentLinks = [
  "Fashion",
  "Education Product",
  "Frozen Food",
  "Beverages",
  "Organic Grocery",
  "Office Supplies",
  "Beauty Products",
  "Books",
  "Electronics & Gadget",
  "Travel Accessories",
  "Fitness",
  "Sneakers",
  "Toys",
  "Furniture",
];

const aboutUsLinks = [
  "About shopcart",
  "Careers",
  "News & Blog",
  "Help",
  "Press Center",
  "Shop by location",
  "Shopcart brands",
  "Affiliate & Partners",
  "Ideas & Guides",
];

const servicesLinks = [
  "Gift Card",
  "Mobile App",
  "Shipping & Delivery",
  "Order Pickup",
  "Account Signup",
];

const helpLinks = [
  "Shopcart Help",
  "Returns",
  "track orders",
  "contact us",
  "feedback",
  "Security & Fraud",
];

const paymentMethods = [
  { src: "https://cdn.prod.website-files.com/63e857eaeaf853471d5335ff/63eb1ce8816711ebecac46d8_stripe.png", alt: "Stripe" },
  { src: "https://cdn.prod.website-files.com/63e857eaeaf853471d5335ff/63eb1ce82d440b7ab84a993f_visa.png", alt: "Visa" },
  { src: "https://cdn.prod.website-files.com/63e857eaeaf853471d5335ff/63eb1ce8f032504012a5896b_Mastercard.png", alt: "Mastercard" },
  { src: "https://cdn.prod.website-files.com/63e857eaeaf853471d5335ff/63e8c4e48b497e6ce846b7ff_Amazon.png", alt: "Amazon" },
  { src: "https://cdn.prod.website-files.com/63e857eaeaf853471d5335ff/63eb1f054e419e42aca4a9a2_Klarna.png", alt: "Klarna" },
  { src: "https://cdn.prod.website-files.com/63e857eaeaf853471d5335ff/63eb1ce7c4510cf9a55828a0_PayPal.png", alt: "PayPal" },
  { src: "https://cdn.prod.website-files.com/63e857eaeaf853471d5335ff/63e8c4e4707380264b25e680_ApplePay.png", alt: "Apple Pay" },
  { src: "https://cdn.prod.website-files.com/63e857eaeaf853471d5335ff/63eb1f55dc68c5ee83d0cbf8_GooglePay.png", alt: "Google Pay" },
];

const FooterLinkColumn = ({ title, links, doubleColumn = false }: { title: string; links: string[], doubleColumn?: boolean }) => (
  <div>
    <h3 className="text-base font-bold text-foreground mb-6">{title}</h3>
    <ul className={`space-y-5 ${doubleColumn ? 'sm:columns-2' : ''}`}>
      {links.map((link, index) => (
        <li key={index} className="break-inside-avoid">
          <a href="#" className="text-sm text-medium-gray hover:text-primary transition-colors">
            {link}
          </a>
        </li>
      ))}
    </ul>
  </div>
);

const AcceptedPayments = () => (
  <div>
    <h3 className="text-sm font-medium text-foreground mb-4 mt-8">Accepted Payments</h3>
    <div className="grid grid-cols-4 gap-3">
      {paymentMethods.map((method, index) => (
        <div key={index} className="bg-white w-[38px] h-[24px] border border-gray-200 rounded-sm flex items-center justify-center p-1">
          <Image src={method.src} alt={method.alt} width={28} height={9} className="object-contain" />
        </div>
      ))}
    </div>
  </div>
);


export default function Footer() {
  return (
    <footer className="bg-secondary pt-20 pb-[30px]">
      <div className="container">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-[1.5fr_repeat(4,1fr)] gap-8">
          <div>
            <a href="#" className="inline-block mb-4">
              <Image src="https://cdn.prod.website-files.com/63e857eaeaf853471d5335ff/63e86ab4c21faa7bc0bd90dd_Logo.svg" alt="Shopcart Logo" width={140} height={34} />
            </a>
            <p className="text-sm text-medium-gray leading-6">
              Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia consequat duis enim velit mollit.
            </p>
            <div className="hidden lg:block">
              <AcceptedPayments />
            </div>
          </div>

          <FooterLinkColumn title="Department" links={departmentLinks} doubleColumn />
          <FooterLinkColumn title="About us" links={aboutUsLinks} />
          <FooterLinkColumn title="Services" links={servicesLinks} />
          <FooterLinkColumn title="Help" links={helpLinks} />
        </div>
        
        <div className="block lg:hidden mt-8">
          <AcceptedPayments />
        </div>

        <div className="mt-[50px] pt-5 border-t border-border flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-0">
           <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            <a href="#" className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors">
              <Image src="https://cdn.prod.website-files.com/63e857eaeaf853471d5335ff/63eb0ed6e927bdf5bc4309e0_briefcase.svg" alt="" width={24} height={24} />
              <span>Become Seller</span>
            </a>
            <a href="#" className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors">
              <Image src="https://cdn.prod.website-files.com/63e857eaeaf853471d5335ff/63eb0ed6c4510c256356f4cd_gift.svg" alt="" width={24} height={24} />
              <span>Gift Cards</span>
            </a>
            <a href="#" className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors">
              <Image src="https://cdn.prod.website-files.com/63e857eaeaf853471d5335ff/63eb0ed6ae57fd74e0402aa4_help-circle.svg" alt="" width={24} height={24} />
              <span>Help Canter</span>
            </a>
          </div>
          <div className="flex flex-col sm:flex-row items-center flex-wrap justify-center gap-x-5 gap-y-2">
            <a href="#" className="text-sm font-medium text-foreground hover:text-primary transition-colors">Terms of Service</a>
            <a href="#" className="text-sm font-medium text-foreground hover:text-primary transition-colors">Privacy & Policy</a>
            <p className="text-sm text-medium-gray text-center sm:text-left">
              All Right reserved by Musemind <a href="https://musemind.agency/" target="_blank" rel="noopener noreferrer" className="underline text-foreground hover:text-primary transition-colors">ui/ux design</a> agency | 2022
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}