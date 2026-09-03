import { unstable_cache } from "next/cache";
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

async function loadSettings(): Promise<StorefrontSettings> {
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

export const getSettings = unstable_cache(loadSettings, ["site-settings-v1"], {
  revalidate: 60,
  tags: ["storefront"],
});

function isGuidesLink(label: string, href: string) {
  return /guide/i.test(label) || /\/guides/i.test(href);
}

const HEADER_FALLBACK = [
  { label: "Shop", href: "/shop", enabled: true, sort_order: 0 },
  { label: "Corporate Gifting", href: "/corporate-gifting", enabled: true, sort_order: 1 },
  { label: "Custom Print", href: "/custom-design", enabled: true, sort_order: 2 },
];

/** Drop SEO-era Guides rows that were never a GiftVibes nav item. */
async function purgeGuidesNavFromDb() {
  try {
    const hit = await prisma.navLink.findFirst({
      where: {
        OR: [
          { href: { contains: "guides" } },
          { label: { contains: "Guide", mode: "insensitive" } },
        ],
      },
      select: { id: true },
    });
    if (!hit) return;
    await prisma.navLink.deleteMany({
      where: {
        OR: [
          { href: { contains: "guides" } },
          { label: { contains: "Guide", mode: "insensitive" } },
        ],
      },
    });
    await prisma.pageSeo.deleteMany({
      where: { pageKey: { startsWith: "guides" } },
    });
  } catch (e) {
    console.error("purgeGuidesNavFromDb failed", e);
  }
}

export async function getHeaderNav(): Promise<StorefrontNavLink[]> {
  await purgeGuidesNavFromDb();
  try {
    const rows = await prisma.navLink.findMany({
      where: { groupKey: "header", enabled: true },
      orderBy: { sortOrder: "asc" },
      select: { label: true, href: true, enabled: true, sortOrder: true },
    });
    const mapped = mapEnabledNavLinks(
      rows
        .filter((r) => !isGuidesLink(r.label, r.href))
        .map((r) => ({
          label: r.label,
          href: r.href,
          enabled: r.enabled,
          sortOrder: r.sortOrder,
        })),
    );
    if (mapped.length) return mapped;
    return mapEnabledNavLinks(HEADER_FALLBACK);
  } catch {
    return mapEnabledNavLinks(HEADER_FALLBACK);
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
      rows
        .filter((r) => !isGuidesLink(r.label, r.href))
        .map((r) => ({
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

export type CatalogFolderNav = { name: string; subcategories: string[] };

function parseFolderRows(raw: unknown): CatalogFolderNav[] {
  let content = raw;
  if (typeof content === "string") {
    try {
      content = JSON.parse(content);
    } catch {
      return [];
    }
  }
  const cats = content && typeof content === "object" ? (content as { categories?: unknown }).categories : null;
  if (!Array.isArray(cats)) return [];
  return cats
    .map((c: any) => ({
      name: String(c?.name || "").trim(),
      subcategories: Array.isArray(c?.subcategories)
        ? c.subcategories.filter((s: unknown) => typeof s === "string" && s.trim() && s.trim() !== "Unsorted")
        : [],
    }))
    .filter((c: CatalogFolderNav) => c.name);
}

/** Admin Products folder tree — uncached so new folders (SBI) show in the navbar immediately. */
export async function getCatalogFolders(): Promise<CatalogFolderNav[]> {
  try {
    const row = await prisma.pageSection.findFirst({
      where: { pageKey: "catalog", sectionKey: "folders" },
    });
    const parsed = parseFolderRows(row?.content);
    if (parsed.length) return parsed;
  } catch (e) {
    console.error("getCatalogFolders failed", e);
  }
  return [];
}

/** Navbar Category dropdown: Products folder tree (includes SBI etc.). */
export async function getMegaMenu(): Promise<MegaMenuItemOut[]> {
  const folders = await getCatalogFolders();
  const fromTree = mapCatalogFolders(folders);
  if (fromTree.length) return fromTree;
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

export const getStorefrontData = unstable_cache(
  async () => {
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
  },
  ["storefront-data-v3"],
  { revalidate: 30, tags: ["storefront"] },
);

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

export const getShopChrome = unstable_cache(
  async (): Promise<ShopChromeOut> => {
    const sections = await getPageSections("shop");
    return mapShopChrome(sections.main);
  },
  ["shop-chrome-v1"],
  { revalidate: 60, tags: ["storefront"] },
);

export async function getProductChrome(): Promise<ProductChromeOut> {
  const sections = await getPageSections("product");
  return mapProductChrome(sections.main);
}
