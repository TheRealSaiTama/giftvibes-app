import { prisma } from "@/lib/prisma";

// ponytail: read-through cache of admin-owned content with hardcoded fallbacks.
// If the DB is unreachable or a row is missing, the storefront still renders
// with sensible defaults rather than whitescreening. Ceiling: defaults are a
// snapshot — they will drift from admin edits over time. Acceptable for a
// single-owner site; revisit if/when those defaults actually mislead users.

export type StorefrontSettings = {
  brandName: string;
  tagline: string | null;
  logoUrl: string | null;
  faviconUrl: string | null;
  primaryColor: string | null;
  whatsappNumber: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  socials: Record<string, string>;
  siteUrl: string | null;
};

const FALLBACK: StorefrontSettings = {
  brandName: "GiftVibes",
  tagline: "Customised Diaries, Notebooks & Corporate Gifts",
  logoUrl: "/logo.png",
  faviconUrl: "/favicon/favicon.png",
  primaryColor: "#c4654a",
  whatsappNumber: null,
  phone: "+91 9899223130",
  email: "support@giftvibes.in",
  address: "4487, Roshan Pura(Daiwara), Near Metro Station, Nai Sarak, Delhi 110006",
  socials: {},
  siteUrl: "https://www.giftvibes.in",
};

export async function getSettings(): Promise<StorefrontSettings> {
  try {
    const row = await prisma.siteSetting.findUnique({ where: { id: 1 } });
    if (!row) return FALLBACK;
    return {
      brandName: row.brandName || FALLBACK.brandName,
      tagline: row.tagline,
      logoUrl: row.logoUrl || FALLBACK.logoUrl,
      faviconUrl: row.faviconUrl || FALLBACK.faviconUrl,
      primaryColor: row.primaryColor || FALLBACK.primaryColor,
      whatsappNumber: row.whatsappNumber,
      phone: row.phone || FALLBACK.phone,
      email: row.email || FALLBACK.email,
      address: row.address || FALLBACK.address,
      socials: (row.socials as Record<string, string>) || {},
      siteUrl: row.siteUrl || FALLBACK.siteUrl,
    };
  } catch {
    return FALLBACK;
  }
}

export type StorefrontNavLink = {
  label: string;
  href: string;
};

const FALLBACK_HEADER_NAV: StorefrontNavLink[] = [
  { label: "Shop", href: "/shop" },
  { label: "Bulk Orders", href: "/custom-design" },
  { label: "Custom Print", href: "/custom-design" },
  { label: "About Us", href: "#about" },
];

export async function getHeaderNav(): Promise<StorefrontNavLink[]> {
  try {
    const rows = await prisma.navLink.findMany({
      where: { groupKey: "header", enabled: true },
      orderBy: { sortOrder: "asc" },
      select: { label: true, href: true },
    });
    return rows.length ? rows : FALLBACK_HEADER_NAV;
  } catch {
    return FALLBACK_HEADER_NAV;
  }
}

export async function getFooterNav(): Promise<StorefrontNavLink[]> {
  try {
    const rows = await prisma.navLink.findMany({
      where: { groupKey: "footer", enabled: true },
      orderBy: { sortOrder: "asc" },
      select: { label: true, href: true },
    });
    return rows; // empty array is fine — footer falls back to its existing inline links
  } catch {
    return [];
  }
}

export type StorefrontSeo = {
  title: string | null;
  description: string | null;
  ogImageUrl: string | null;
};

export async function getSeo(pageKey: string): Promise<StorefrontSeo | null> {
  try {
    const row = await prisma.pageSeo.findUnique({ where: { pageKey } });
    if (!row) return null;
    return {
      title: row.title,
      description: row.description,
      ogImageUrl: row.ogImageUrl,
    };
  } catch {
    return null;
  }
}

/** One-shot bundle for pages — single `Promise.all` instead of N awaits. */
export async function getStorefrontData() {
  const [settings, headerNav, footerNav] = await Promise.all([
    getSettings(),
    getHeaderNav(),
    getFooterNav(),
  ]);
  return { settings, headerNav, footerNav };
}
