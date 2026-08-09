/** Always return a plain string href — safest for Next.js App Router <Link>. */
function shopCategoryHref(category: string): string {
  return `/shop?category=${encodeURIComponent(category)}`;
}

/**
 * Navbar mega-menu + home carousel labels → shop filter values.
 * Prefer the same labels used on product/diary `category` fields so filters match.
 */
const categoryHrefMap: Record<string, string> = {
  // Navbar: CORPORATE GIFT SETS
  "CORPORATE GIFT SETS": shopCategoryHref("CORPORATE GIFT SETS"),
  "Corporate Gift Sets": shopCategoryHref("CORPORATE GIFT SETS"),
  "Corporate Gift Set": shopCategoryHref("CORPORATE GIFT SETS"),
  "Best Seller Corporate Gifts": shopCategoryHref("CORPORATE GIFT SETS"),
  // Navbar: NEW YEAR DIARY BOOKS
  "NEW YEAR DIARY BOOKS": shopCategoryHref("NEW YEAR DIARY"),
  "NEW YEAR DIARY": shopCategoryHref("NEW YEAR DIARY"),
  "New Year Diary": shopCategoryHref("NEW YEAR DIARY"),
  "CUSTOMISED DIARY & NOTE BOOKS": shopCategoryHref("CUSTOMISED DIARY & NOTE BOOKS"),
  "CUSTOMISED DIARY AND NOTE BOOKS": shopCategoryHref("CUSTOMISED DIARY & NOTE BOOKS"),
  "Premium Diary": shopCategoryHref("CUSTOMISED DIARY & NOTE BOOKS"),
  "LEATHER GIFT ITEMS": shopCategoryHref("LEATHER GIFT ITEMS"),
  "LEATHER BAGS": shopCategoryHref("LEATHER BAGS"),
  "JUTE BAGS": shopCategoryHref("JUTE BAGS"),
  "BOTTLES GIFT SET": shopCategoryHref("BOTTLES GIFT SET"),
  "BOTTLE GIFT SETS": shopCategoryHref("BOTTLES GIFT SET"),
  "POWER BANK DIARIES": shopCategoryHref("POWER BANK DIARIES"),
  "PEN STANDS": shopCategoryHref("PEN STANDS"),
  "PROMOTIONAL UMBRELLAS": shopCategoryHref("PROMOTIONAL UMBRELLAS"),
  "CALENDARS": shopCategoryHref("CALENDARS"),
  "EXHIBITION VISITOR'S GIFT IDEAS": shopCategoryHref("EXHIBITION VISITOR'S GIFT IDEAS"),
};

const fallbackHref = "/shop";

export function getCategoryHref(label: string): string {
  const normalized = label.trim();
  if (categoryHrefMap[normalized]) return categoryHrefMap[normalized];
  // Unknown CMS category name → still deep-link by that label so shop can filter.
  if (normalized) return shopCategoryHref(normalized);
  return fallbackHref;
}

export function hasCategoryProducts(label: string): boolean {
  return getCategoryHref(label) !== fallbackHref;
}
