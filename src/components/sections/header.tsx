"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronDown, Menu, Search } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

const megaMenuItems = [
  { name: 'Customized Diaries', items: '150+ Designs Available' },
  { name: 'New Year Diaries', items: '80+ Styles Available' },
  { name: 'Diwali Gift Diaries', items: '60+ Options Available' },
  { name: 'Corporate Gift Sets', items: '120+ Packages Available' },
  { name: 'Logo Printed Diaries', items: '200+ Templates Available' },
  { name: 'Promotional Gifts', items: '90+ Items Available' },
];

const Header = () => {
  return (
    <header className="sticky top-0 z-50 bg-white">
      {/* Top Promotional Bar */}
      <div className="bg-[#124559] py-[7px] text-white hidden lg:block">
        <div className="container flex items-center justify-between px-10">
          <div className="flex items-center gap-1.5">
            <Image 
              src="https://cdn.prod.website-files.com/63e857eaeaf853471d5335ff/63e884fbeaf853f075555d17_Call.svg" 
              alt="Phone" 
              width={16} 
              height={16} 
              className="invert"
            />
            <span className="text-xs">+919311135190</span>
          </div>

          <p className="text-xs text-white">
            Lowest Price Guarantee
            <span className="opacity-50 mx-6">|</span>
            Shop Now
          </p>

          <div></div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="border-b">
        <div className="container flex items-center justify-between h-[88px] px-10">
          <Link href="/">
            <Image 
              src="/logo3.png" 
              alt="Shopcart" 
              width={170} 
              height={40}
            />
          </Link>

          <nav className="hidden lg:flex items-center gap-8 nav-text">
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center hover:text-primary transition-colors">
                Category
                <ChevronDown className="w-4 h-4 ml-1" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="p-6 w-[560px]">
                <div className="font-semibold text-dark-gray mb-4">Our Products</div>
                <div className="grid grid-cols-3 gap-x-6 gap-y-4">
                  {megaMenuItems.map((item) => (
                    <Link href="#" key={item.name} className="group">
                      <div className="flex items-start gap-3">
                        <div className="w-[60px] h-[60px] bg-gray-100 rounded-md flex-shrink-0" />
                        <div>
                          <p className="font-medium text-sm text-dark-gray group-hover:text-primary">{item.name}</p>
                          <p className="text-xs text-medium-gray">{item.items}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
            <Link href="#" className="hover:text-primary transition-colors">Bulk Orders</Link>
            <Link href="#" className="hover:text-primary transition-colors">Custom Design</Link>
            <Link href="#" className="hover:text-primary transition-colors">Quick Delivery</Link>
          </nav>

          <div className="flex items-center gap-6">
            <div className="relative hidden xl:block w-[300px]">
              <Input 
                type="search" 
                placeholder="Search Diaries & Gifts" 
                className="w-full rounded-md pr-10 h-11 border-gray-200 focus:border-ring focus:ring-ring"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>

            <div className="flex items-center gap-4">
              <Link href="#" className="nav-text flex items-center gap-2 hover:text-primary transition-colors">
                <Image 
                  src="https://cdn.prod.website-files.com/63e857eaeaf853471d5335ff/63eb3dec9b865e78d4ff6b8d_shopping-cart-add.png" 
                  alt="Cart" 
                  width={24} 
                  height={24} 
                />
                <span className="hidden md:inline">Cart</span>
              </Link>
            </div>
            
            <button className="lg:hidden">
              <Menu className="h-6 w-6 text-dark-gray" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
export default Header;