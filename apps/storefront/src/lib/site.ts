import { prisma } from "@/lib/prisma";
import {
  mapSiteSettings,
  mapEnabledNavLinks,
  mapMegaMenuItems,
  type SiteSettingsOut,
  type NavLinkOut,
  type MegaMenuItemOut,
} from "@/lib/cms/mappers";

export type StorefrontSettings = SiteSettingsOut;
export type StorefrontNavLink = NavLinkOut;
export type StorefrontMegaItem = MegaMenuItemOut;

export async function getSettings(): Promise<StorefrontSettings> {
  try {
    const row = await prisma.siteSetting.findUnique({ where: { id: 1 } });
    if (!row) return mapSiteSettings(null);
    return mapSiteSettings({
      brandName: row.brandName,
      tagline: row.tagline,
      logoUrl: row.logoUrl,
      faviconUrl: row.faviconUrl,
      primaryColor: row.primaryColor,
      whatsappNumber: row.whatsappNumber,
      phone: row.phone,
      email: row.email,
      address: row.address,
      socials: row.socials,
      siteUrl: row.siteUrl,
    });
  } catch {
    return mapSiteSettings(null);
  }
}

export async function getHeaderNav(): Promise<StorefrontNavLink[]> {
  try {
    const rows = await prisma.navLink.findMany({
      where: { groupKey: "header", enabled: true },
      orderBy: { sortOrder: "asc" },
      select: { label: true, href: true, enabled: true, sortOrder: true },
    });
    const mapped = mapEnabledNavLinks(
      rows.map((r) => ({
        label: r.label,
        href: r.href,
        enabled: r.enabled,
        sortOrder: r.sortOrder,
      })),
    );
    // Offline fallback only when CMS has zero enabled header links
    if (mapped.length) return mapped;
    return mapEnabledNavLinks([
      { label: "Shop", href: "/shop", enabled: true, sort_order: 0 },
      { label: "Bulk Orders", href: "#our-products", enabled: true, sort_order: 1 },
      { label: "Custom Print", href: "/custom-design", enabled: true, sort_order: 2 },
      { label: "About Us", href: "#about", enabled: true, sort_order: 3 },
    ]);
  } catch {
    return mapEnabledNavLinks([
      { label: "Shop", href: "/shop", enabled: true, sort_order: 0 },
      { label: "Bulk Orders", href: "#our-products", enabled: true, sort_order: 1 },
      { label: "Custom Print", href: "/custom-design", enabled: true, sort_order: 2 },
      { label: "About Us", href: "#about", enabled: true, sort_order: 3 },
    ]);
  }
}

export async function getFooterNav(groupKey = "footer"): Promise<StorefrontNavLink[]> {
  try {
    const rows = await prisma.navLink.findMany({
      where: { groupKey, enabled: true },
      orderBy: { sortOrder: "asc" },
      select: { label: true, href: true, enabled: true, sortOrder: true },
    });
    return mapEnabledNavLinks(
      rows.map((r) => ({
        label: r.label,
        href: r.href,
        enabled: r.enabled,
        sortOrder: r.sortOrder,
      })),
    );
  } catch {
    return [];
  }
}

/** Category mega-menu stored as page_sections page_key=site section_key=mega_menu. */
export async function getMegaMenu(): Promise<MegaMenuItemOut[]> {
  try {
    const row = await prisma.pageSection.findFirst({
      where: { pageKey: "site", sectionKey: "mega_menu", enabled: true },
    });
    const items = (row?.content as any)?.items;
    const mapped = mapMegaMenuItems(Array.isArray(items) ? items : []);
    if (mapped.length) return mapped;
  } catch {
    /* fall through */
  }
  // Offline fallback defaults (clearable once admin saves mega menu)
  return mapMegaMenuItems([
    { name: "CORPORATE GIFT SETS", subtitle: "Premium Packages Available", image_url: "/Giftvibes categories/CORPORATE GIFTSETS.png", enabled: true, sort_order: 1 },
    { name: "NEW YEAR DIARY BOOKS", subtitle: "Fresh Designs 2025", image_url: "/Giftvibes categories/NEW YEAR DIARY.png", enabled: true, sort_order: 2 },
    { name: "LEATHER GIFT ITEMS", subtitle: "Luxury Options", image_url: "/Giftvibes categories/LEATHER GIFT ITEMS.png", enabled: true, sort_order: 3 },
    { name: "LEATHER BAGS", subtitle: "Elegant Styles", image_url: "/Giftvibes categories/LEATHER BAGS.png", enabled: true, sort_order: 4 },
    { name: "JUTE BAGS", subtitle: "Eco-Friendly Choices", image_url: "/Giftvibes categories/JUTE BAGS.png", enabled: true, sort_order: 5 },
    { name: "BOTTLES GIFT SET", subtitle: "Unique Sets", image_url: "/Giftvibes categories/BOTTLE GIFT SETS.png", enabled: true, sort_order: 6 },
    { name: "POWER BANK DIARIES", subtitle: "Tech-Integrated Gifts", image_url: "/Giftvibes categories/POWERBANK DIARIES.png", enabled: true, sort_order: 7 },
    { name: "PEN STANDS", subtitle: "Desk Essentials", image_url: "/Giftvibes categories/PEN STANDS.png", enabled: true, sort_order: 8 },
    { name: "PROMOTIONAL UMBRELLAS", subtitle: "Branded Protection", image_url: "/Giftvibes categories/PROMOTIONAL UMBRELLAS.jpg", enabled: true, sort_order: 9 },
    { name: "CUSTOMISED DIARY & NOTE BOOKS", subtitle: "Personalized Products", image_url: "/Giftvibes categories/PROMOTIONAL DIARIES AND NOTEBOOKS.jpg", enabled: true, sort_order: 10 },
    { name: "CALENDARS", subtitle: "Yearly Planners", image_url: "/Giftvibes categories/CALENDARS.png", enabled: true, sort_order: 11 },
    { name: "EXHIBITION VISITOR'S GIFT IDEAS", subtitle: "Event Specials", image_url: "/Giftvibes categories/EXHIBITION GIVEAWAY IDEAS.png", enabled: true, sort_order: 12 },
  ]);
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

export async function getStorefrontData() {
  const [settings, headerNav, footerNav, megaMenu] = await Promise.all([
    getSettings(),
    getHeaderNav(),
    getFooterNav("footer_shop"),
    getMegaMenu(),
  ]);
  return { settings, headerNav, footerNav, megaMenu };
}
