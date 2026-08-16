export const SITE_ORIGIN = "https://www.giftvibes.in";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: string): boolean {
  return UUID_RE.test(value);
}

export function productHref(item: { slug?: string | null; id: string | number }): string {
  const slug = typeof item.slug === "string" ? item.slug.trim() : "";
  return `/shop/${slug || String(item.id)}`;
}

export function slugifyName(name: string): string {
  return name
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export const SEO_NAV = [
  { label: "Shop", href: "/shop" },
  { label: "Corporate Gifting", href: "/corporate-gifting" },
  { label: "Custom Print", href: "/custom-design" },
  { label: "Guides", href: "/guides" },
];

export const CATEGORY_LANDINGS = [
  {
    slug: "new-year-diaries",
    href: "/new-year-diaries",
    title: "New Year Diaries 2027 — Bulk Customised Diaries",
    h1: "New Year Diaries 2027",
    description:
      "Bulk New Year diaries and planners from a Delhi manufacturer. Logo emboss, foil and page print. PAN-India delivery for corporates.",
    match: ["new year", "2026", "2027", "planner"],
    categoryHint: "NEW YEAR DIARY",
  },
  {
    slug: "pu-leather-diaries",
    href: "/pu-leather-diaries",
    title: "PU Leather Diaries Wholesale | Corporate Executive Diaries",
    h1: "PU Leather Corporate Diaries",
    description:
      "Wholesale PU leather and executive diaries manufactured in Delhi. Magnetic flap, sponge padding, custom branding for bulk corporate orders.",
    match: ["leather", "pu", "executive", "directors"],
    categoryHint: "LEATHER GIFT ITEMS",
  },
  {
    slug: "corporate-gift-sets",
    href: "/corporate-gift-sets",
    title: "Corporate Gift Sets Manufacturer India | Diary + Pen Combos",
    h1: "Corporate Gift Sets",
    description:
      "Diary and pen gift sets, 2-in-1 and 3-in-1 combos from GiftVibes (Ravindra Enterprises). Factory pricing for banks, pharma and MNCs.",
    match: ["gift set", "pen set", "combo", "giftset"],
    categoryHint: "CORPORATE GIFT SETS",
  },
  {
    slug: "promotional-diaries",
    href: "/promotional-diaries",
    title: "Promotional Diaries with Logo | Customised Notebooks Bulk",
    h1: "Promotional Diaries & Notebooks",
    description:
      "Customised promotional diaries and notebooks with your logo. Emboss, foil, screen and each-page print. Minimum order friendly for campaigns.",
    match: ["promotional", "notebook", "customis", "customiz"],
    categoryHint: "CUSTOMISED DIARY",
  },
  {
    slug: "calendars",
    href: "/calendars",
    title: "Custom Calendars Bulk | Table & Wall Calendars Delhi",
    h1: "Custom Calendars",
    description:
      "Branded table and wall calendars for corporate New Year gifting. Printed in Delhi, shipped PAN-India.",
    match: ["calendar"],
    categoryHint: "CALENDARS",
  },
  {
    slug: "exhibition-gifts",
    href: "/exhibition-gifts",
    title: "Exhibition Visitor Gifts | Trade Show Giveaways India",
    h1: "Exhibition & Visitor Gifts",
    description:
      "Trade-show diaries, pen stands and giveaways with on-time Delhi production for exhibitions across India.",
    match: ["exhibition", "visitor", "giveaway"],
    categoryHint: "EXHIBITION",
  },
] as const;

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "GiftVibes",
    legalName: "Ravindra Enterprises",
    url: SITE_ORIGIN,
    logo: `${SITE_ORIGIN}/logo3.png`,
    foundingDate: "1999",
    telephone: "+91-9899223130",
    email: "support@giftvibes.in",
    address: {
      "@type": "PostalAddress",
      streetAddress: "4487, Roshan Pura (Daiwara), Near Metro Station, Nai Sarak",
      addressLocality: "Delhi",
      postalCode: "110006",
      addressCountry: "IN",
    },
    areaServed: "IN",
    sameAs: ["https://www.giftvibes.in"],
  };
}

export function productJsonLd(p: {
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  slug?: string | null;
  id: string;
  minPrice?: number | null;
  maxPrice?: number | null;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: (p.description || p.name).replace(/\s+/g, " ").slice(0, 300),
    image: p.imageUrl || `${SITE_ORIGIN}/logo3.png`,
    brand: { "@type": "Brand", name: "GiftVibes" },
    manufacturer: { "@type": "Organization", name: "Ravindra Enterprises" },
    url: `${SITE_ORIGIN}${productHref(p)}`,
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "INR",
      lowPrice: p.minPrice ?? undefined,
      highPrice: p.maxPrice ?? p.minPrice ?? undefined,
      availability: "https://schema.org/InStock",
    },
  };
}
