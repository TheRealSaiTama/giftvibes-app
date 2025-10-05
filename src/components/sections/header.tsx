"use client";
import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, Menu, Search, MessageCircle } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogTrigger,
  DialogContent, // Make sure to import DialogContent
} from "@/components/ui/dialog";
import { EnquiryFormContent } from "./enquiry-modal";
import { useSelectedProducts } from '@/context/ProductContext';
import { Badge } from '@/components/ui/badge';
import { getCategoryHref } from '@/lib/category-links';

type SearchResultItem = {
  id: number;
  name: string;
  minPrice: number | null;
  maxPrice: number | null;
  imageUrl: string;
  path: string;
  source: "diary" | "product";
};

const megaMenuItems = [
  { name: 'CORPORATE GIFT SETS', items: 'Premium Packages Available', image: '/Giftvibes categories/CORPORATE GIFTSETS.png' },
  { name: 'NEW YEAR DIARY BOOKS', items: 'Fresh Designs 2025', image: '/Giftvibes categories/NEW YEAR DIARY.png' },
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
  const router = useRouter();

  const [searchTerm, setSearchTerm] = React.useState("");
  const [searchResults, setSearchResults] = React.useState<SearchResultItem[]>([]);
  const [searchLoading, setSearchLoading] = React.useState(false);
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const searchAbortRef = React.useRef<AbortController | null>(null);
  const blurTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    return () => {
      searchAbortRef.current?.abort();
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
      }
    };
  }, []);

  React.useEffect(() => {
    if (searchAbortRef.current) {
      searchAbortRef.current.abort();
      searchAbortRef.current = null;
    }

    const trimmed = searchTerm.trim();
    if (!trimmed) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }

    setSearchLoading(true);
    const timer = setTimeout(async () => {
      const controller = new AbortController();
      searchAbortRef.current = controller;

      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`, {
          signal: controller.signal,
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(`Search request failed: ${response.status}`);
        }

        const data = await response.json();
        setSearchResults(Array.isArray(data?.results) ? data.results : []);
      } catch (error: any) {
        if (error?.name !== "AbortError") {
          console.error("Search request error", error);
          setSearchResults([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setSearchLoading(false);
        }
      }
    }, 250);

    return () => {
      clearTimeout(timer);
    };
  }, [searchTerm]);

  const handleResultSelect = React.useCallback((item: SearchResultItem) => {
    setIsSearchOpen(false);
    setSearchTerm("");
    setSearchResults([]);
    router.push(item.path);
  }, [router]);

  const formatPriceLabel = React.useCallback((item: Pick<SearchResultItem, "minPrice" | "maxPrice">) => {
    const { minPrice, maxPrice } = item;
    if (typeof minPrice === "number" && typeof maxPrice === "number" && minPrice !== maxPrice) {
      return `₹${minPrice.toLocaleString()} – ₹${maxPrice.toLocaleString()}`;
    }
    if (typeof minPrice === "number") {
      return `₹${minPrice.toLocaleString()}`;
    }
    if (typeof maxPrice === "number") {
      return `₹${maxPrice.toLocaleString()}`;
    }
    return "Price on request";
  }, []);

  const handleSearchSubmit = React.useCallback((event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (searchResults.length > 0) {
      handleResultSelect(searchResults[0]);
      return;
    }
    const trimmed = searchTerm.trim();
    if (trimmed) {
      setIsSearchOpen(false);
      router.push(`/shop?search=${encodeURIComponent(trimmed)}`);
    }
  }, [handleResultSelect, router, searchResults, searchTerm]);

  const handleInputBlur = React.useCallback(() => {
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
    }
    blurTimeoutRef.current = setTimeout(() => setIsSearchOpen(false), 150);
  }, []);

  const handleInputFocus = React.useCallback(() => {
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
    }
    setIsSearchOpen(true);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white">
      {/* Top Promotional Bar */}
      <div className="bg-[#124559] py-[7px] text-white hidden lg:block">
        <div className="container flex items-center justify-center px-10">
          <p className="text-xs text-white">
            Lowest Price Guarantee
            <span className="opacity-50 mx-6">|</span>
            Shop Now
          </p>
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
                    <Link href={getCategoryHref(item.name)} key={item.name} className="group">
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
                <div className="mt-4 flex justify-end">
                  <Link href="/shop" className="text-sm font-medium text-primary hover:underline">
                    View All Products
                  </Link>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
            <Link href="/shop" className="hover:text-primary transition-colors">Shop</Link>
            <Link href="#our-products" className="hover:text-primary transition-colors">Bulk Orders</Link>
            <Link href="/custom-design" className="hover:text-primary transition-colors">Custom Print</Link>
            <Link href="#about" className="hover:text-primary transition-colors">About Us</Link>
          </nav>

          <div className="flex items-center gap-6">
            <div className="relative hidden xl:block w-[300px]">
              <form onSubmit={handleSearchSubmit} className="relative">
                <Input
                  type="search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  placeholder="Search Diaries & Gifts"
                  className="w-full rounded-md pr-10 h-11 border-gray-200 focus:border-ring focus:ring-ring"
                  aria-label="Search diaries and gifts"
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-primary transition-colors"
                  aria-label="Submit search"
                >
                  <Search className="w-5 h-5" />
                </button>
              </form>

              {isSearchOpen && (searchLoading || searchResults.length > 0 || searchTerm.trim().length > 0) && (
                <div
                  className="absolute left-0 right-0 mt-2 rounded-lg border border-gray-200 bg-white shadow-lg overflow-hidden"
                  onMouseDown={(event) => event.preventDefault()}
                >
                  <div className="max-h-80 overflow-y-auto">
                    {searchLoading && (
                      <div className="flex items-center justify-center py-6 text-sm text-gray-500">
                        Searching…
                      </div>
                    )}

                    {!searchLoading && searchResults.length === 0 && searchTerm.trim().length > 0 && (
                      <div className="px-4 py-6 text-sm text-gray-500">No results found</div>
                    )}

                    {!searchLoading && searchResults.map((item) => (
                      <button
                        key={`${item.source}-${item.id}`}
                        type="button"
                        onClick={() => handleResultSelect(item)}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                      >
                        <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-md bg-gray-100">
                          <Image
                            src={item.imageUrl || "/file.svg"}
                            alt={item.name}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-sm font-medium text-gray-900">{item.name}</p>
                          <p className="text-xs text-gray-500">{formatPriceLabel(item)}</p>
                        </div>
                        <span className="text-[10px] uppercase tracking-wide text-gray-400">
                          {item.source === "product" ? "Product" : "Diary"}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
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
