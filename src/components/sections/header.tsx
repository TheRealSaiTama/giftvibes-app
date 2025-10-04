"use client";
import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, Menu, Search, MessageCircle } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent, // Make sure to import DialogContent
} from "@/components/ui/dialog";
import { EnquiryFormContent } from "./enquiry-modal";
import { useSelectedProducts } from '@/context/ProductContext';
import { Badge } from '@/components/ui/badge';

const megaMenuItems = [
  { name: 'CORPORATE GIFT SETS', items: 'Premium Packages Available', image: '/Giftvibes categories/CORPORATE GIFTSETS.png' },
  { name: 'NEW YEAR DIARY BOOKS', items: 'Fresh Designs 2025', image: '/Giftvibes categories/NEW YEAR DIARYpng' },
  { name: 'LEATHER GIFT ITEMS', items: 'Luxury Options', image: '/Giftvibes categories/LEATHER GIFT ITEMS.png' },
  { name: 'LEATHER BAGS', items: 'Elegant Styles', image: '/Giftvibes categories/LEATHER BAGS.png' },
  { name: 'JUTE BAGS', items: 'Eco-Friendly Choices', image: '/Giftvibes categories/JUTE BAGS.png' },
  { name: 'BOTTLES GIFT SET', items: 'Unique Sets', image: '/Giftvibes categories/BOTTLE GIFT SETS.png' },
  { name: 'POWER BANK DIARIES', items: 'Tech-Integrated Gifts', image: '/Giftvibes categories/POWERBANK DIARIES.png' },
  { name: 'PEN STANDS', items: 'Desk Essentials', image: '/Giftvibes categories/PEN STANDS.png' },
  { name: 'PROMOTIONAL UMBRELLAS', items: 'Branded Protection', image: '/Giftvibes categories/PROMOTIONAL UMBRELLAS.jpg' },
  { name: 'CUSTOMISED DIARY & NOTE BOOKS', items: 'Personalized Products', image: '/Giftvibes categories/PROMOTIONAL DIARIES AND NOTEBOOKS.jpg' },
  { name: 'CALENDARS', items: 'Yearly Planners', image: '/Giftvibes categories/CALENDARS.png' },
  { name: "EXHIBITION VISITOR'S GIFT IDEAS", items: 'Event Specials', image: '/Giftvibes categories/EXHIBITION GIVEAWAY IDEAS.png' },
];

const Header = () => {
  const [isEnquiryModalOpen, setIsEnquiryModalOpen] = React.useState(false);
  const { selectedProducts, clearSelected } = useSelectedProducts();

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
            <span className="text-xs">+919899223130</span>
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
                        <div className="w-[60px] h-[60px] bg-gray-100 rounded-md flex-shrink-0 relative overflow-hidden">
                          <Image 
                            src={item.image} 
                            alt={item.name}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-300"
                            sizes="60px"
                          />
                        </div>
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
            <Link href="/shop" className="hover:text-primary transition-colors">Shop</Link>
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

            <Dialog open={isEnquiryModalOpen} onOpenChange={setIsEnquiryModalOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="nav-text flex items-center gap-2 hover:text-primary transition-colors relative">
                  <MessageCircle className="w-5 h-5" />
                  <span className="hidden md:inline">Enquiry</span>
                  {selectedProducts.length > 0 && (
                    <Badge className="absolute -top-2 -right-2 bg-red-500 text-white h-5 w-5 flex items-center justify-center p-0">
                      {selectedProducts.length}
                    </Badge>
                  )}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <EnquiryFormContent 
                  open={isEnquiryModalOpen} 
                  onOpenChange={setIsEnquiryModalOpen} 
                  selectedProducts={selectedProducts} 
                  onSubmitAfter={clearSelected} 
                />
              </DialogContent>
            </Dialog>
            
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
