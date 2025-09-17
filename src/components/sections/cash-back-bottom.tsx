import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const CashBackBottom = () => {
  return (
    <section className="bg-background py-[100px]">
      <div className="container">
        <div className="relative flex flex-col lg:flex-row items-center justify-between rounded-[20px] bg-[#F5EBE0] p-8 lg:p-0 lg:pl-[60px] overflow-hidden">
          <div className="relative z-20 w-full lg:w-auto text-center lg:text-left mb-12 lg:mb-0">
            <h2 className="text-5xl font-bold text-dark-gray leading-tight mb-5">
              Get 5% Cash back
              <br />
              on Shopcart.com
            </h2>
            <Button
              asChild
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-[6px] h-auto px-8 py-4 text-base font-medium"
            >
              <Link href="#">Learn More</Link>
            </Button>
          </div>

          <div className="relative w-full max-w-[450px] h-[250px] lg:w-[711px] lg:h-[388px]">
            {/* Blue Card */}
            <div className="absolute top-1/2 left-0 -translate-y-1/2 -rotate-15 z-10 w-[60%] lg:w-auto">
              <img
                src="https://cdn.prod.website-files.com/63e857eaeaf853471d5335ff/63e8c4e71eb4ad08ebe75690_visa%20card%2002-min.png"
                alt="Visa card 2"
                width="380"
                height="240"
                className="w-full lg:w-[380px]"
              />
            </div>
            {/* SVG Card */}
            <div className="absolute top-[10%] left-1/2 -translate-x-1/2 lg:top-0 lg:right-[50px] lg:left-auto lg:translate-x-0 z-20 w-[60%] lg:w-auto">
              <img
                src="https://cdn.prod.website-files.com/63e857eaeaf853471d5335ff/63ea1a963f08a8c3dcd7c945_visa%20card%2003.svg"
                alt="Visa card 3"
                width="319"
                height="201"
                className="w-full lg:w-[319px]"
              />
            </div>
            {/* Beige Card */}
            <div className="absolute bottom-0 right-0 rotate-15 z-30 w-[60%] lg:w-auto">
              <img
                src="https://cdn.prod.website-files.com/63e857eaeaf853471d5335ff/63e8c4e768e3260571e48a0c_visa%20card-min.png"
                alt="Visa card 1"
                width="380"
                height="240"
                className="w-full lg:w-[380px]"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CashBackBottom;