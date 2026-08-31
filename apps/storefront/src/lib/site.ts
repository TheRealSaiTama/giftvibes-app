import { prisma } from "@/lib/prisma";
import {
  mapSiteSettings,
  mapEnabledNavLinks,
  mapMegaMenuItems,
  mapCatalogFolders,
  mapEnabledSections,
  mapShopChrome,
  mapProductChrome,
  type SiteSettingsOut,
  type NavLinkOut,
  type MegaMenuItemOut,
  type ShopChromeOut,
  type ProductChromeOut,
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
      { label: "Corporate Gifting", href: "/corporate-gifting", enabled: true, sort_order: 1 },
      { label: "Custom Print", href: "/custom-design", enabled: true, sort_order: 2 },
      { label: "Guides", href: "/guides", enabled: true, sort_order: 3 },
    ]);
  } catch {
    return mapEnabledNavLinks([
      { label: "Shop", href: "/shop", enabled: true, sort_order: 0 },
      { label: "Corporate Gifting", href: "/corporate-gifting", enabled: true, sort_order: 1 },
      { label: "Custom Print", href: "/custom-design", enabled: true, sort_order: 2 },
      { label: "Guides", href: "/guides", enabled: true, sort_order: 3 },
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

/** Navbar Category dropdown: Products folder tree (includes SBI etc.). */
export async function getMegaMenu(): Promise<MegaMenuItemOut[]> {
  try {
    const row = await prisma.pageSection.findFirst({
      where: { pageKey: "catalog", sectionKey: "folders" },
    });
    const cats = (row?.content as any)?.categories;
    const fromTree = mapCatalogFolders(Array.isArray(cats) ? cats : []);
    if (fromTree.length) return fromTree;
  } catch {
    /* fall through */
  }
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
  return mapCatalogFolders([
    { name: "CORPORATE GIFT SETS", subcategories: ["Diary & Pen Sets", "Calendar Sets", "Giftsets", "General / Others"] },
    { name: "NEW YEAR DIARY", subcategories: ["Eco-Friendly & Green", "Leather Diaries", "Hard Bound Diaries", "Planners & Themes", "Economy & Regular", "General / Others"] },
    { name: "LEATHER GIFT ITEMS", subcategories: ["Bags & Portfolios", "Leather Accessories"] },
    { name: "LEATHER BAGS", subcategories: ["Executive Bags"] },
    { name: "JUTE BAGS", subcategories: ["Eco Jute Bags"] },
    { name: "BOTTLES GIFT SET", subcategories: ["Bottle & Flask Sets"] },
    { name: "POWER BANK DIARIES", subcategories: ["Tech Power Bank Diaries"] },
    { name: "PEN STANDS", subcategories: ["Desktop Accessories"] },
    { name: "PROMOTIONAL UMBRELLAS", subcategories: ["Umbrellas"] },
    { name: "CUSTOMISED DIARY & NOTE BOOKS", subcategories: ["Eco-Friendly & Green", "Leather Diaries", "Hard Bound Diaries", "Planners & Themes", "Economy & Regular", "General / Others"] },
    { name: "CALENDARS", subcategories: ["Desktop & Wall Calendars"] },
    { name: "EXHIBITION VISITOR'S GIFT IDEAS", subcategories: ["Giveaways & Promos"] },
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

export type FooterLinkGroups = {
  company: NavLinkOut[];
  shop: NavLinkOut[];
  support: NavLinkOut[];
};

export async function getStorefrontData() {
  const [settings, headerNav, footerShop, footerCompany, footerSupport, megaMenu] =
    await Promise.all([
      getSettings(),
      getHeaderNav(),
      getFooterNav("footer_shop"),
      getFooterNav("footer_company"),
      getFooterNav("footer_support"),
      getMegaMenu(),
    ]);
  return {
    settings,
    headerNav,
    megaMenu,
    footerLinks: {
      shop: footerShop,
      company: footerCompany,
      support: footerSupport,
    } satisfies FooterLinkGroups,
  };
}

/** Enabled page_sections for a page_key, keyed by section_key. */
export async function getPageSections(
  pageKey: string,
): Promise<Record<string, Record<string, any>>> {
  try {
    const rows = await prisma.pageSection.findMany({
      where: { pageKey },
      orderBy: { sortOrder: "asc" },
    });
    return mapEnabledSections(
      rows.map((s) => ({
        sectionKey: s.sectionKey,
        enabled: s.enabled,
        content: s.content,
        sortOrder: s.sortOrder,
      })),
    );
  } catch {
    return {};
  }
}

export async function getShopChrome(): Promise<ShopChromeOut> {
  const sections = await getPageSections("shop");
  return mapShopChrome(sections.main);
}

export async function getProductChrome(): Promise<ProductChromeOut> {
  const sections = await getPageSections("product");
  return mapProductChrome(sections.main);
}
