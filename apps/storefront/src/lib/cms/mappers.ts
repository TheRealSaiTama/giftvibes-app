/**
 * Pure CMS mappers — admin content shapes → storefront props / visibility.
 * No I/O. Unit-tested; storefront and seed-repair depend on these.
 */

// ─── Settings / chrome ───────────────────────────────────────────────────────

export type SiteSettingsInput = {
  brandName?: string | null;
  tagline?: string | null;
  logoUrl?: string | null;
  faviconUrl?: string | null;
  primaryColor?: string | null;
  whatsappNumber?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  socials?: unknown;
  siteUrl?: string | null;
};

export type SiteSettingsOut = {
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

const SETTINGS_FALLBACK: SiteSettingsOut = {
  brandName: "GiftVibes",
  tagline: "Customised Diaries, Notebooks & Corporate Gifts",
  // logo3.png is the wide header mark (438×125). logo.png is a 2048² square with
  // white padding and must not be the default chrome logo.
  logoUrl: "/logo3.png",
  faviconUrl: "/favicon/favicon.png",
  primaryColor: "#c4654a",
  whatsappNumber: null,
  phone: "+91 9899223130",
  email: "support@giftvibes.in",
  address: "4487, Roshan Pura(Daiwara), Near Metro Station, Nai Sarak, Delhi 110006",
  socials: {},
  siteUrl: "https://www.giftvibes.in",
};

export function normalizeSocials(raw: unknown): Record<string, string> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof v === "string" && v.trim()) out[k] = v.trim();
  }
  return out;
}

/** Prefer admin values; only use fallbacks when field is null/empty. */
export function mapSiteSettings(row: SiteSettingsInput | null | undefined): SiteSettingsOut {
  if (!row) return { ...SETTINGS_FALLBACK };
  return {
    brandName: row.brandName?.trim() || SETTINGS_FALLBACK.brandName,
    tagline: row.tagline?.trim() || null,
    logoUrl: row.logoUrl?.trim() || SETTINGS_FALLBACK.logoUrl,
    faviconUrl: row.faviconUrl?.trim() || SETTINGS_FALLBACK.faviconUrl,
    primaryColor: row.primaryColor?.trim() || SETTINGS_FALLBACK.primaryColor,
    whatsappNumber: row.whatsappNumber?.trim() || null,
    phone: row.phone?.trim() || SETTINGS_FALLBACK.phone,
    email: row.email?.trim() || SETTINGS_FALLBACK.email,
    address: row.address?.trim() || SETTINGS_FALLBACK.address,
    socials: normalizeSocials(row.socials),
    siteUrl: normalizePublicSiteUrl(row.siteUrl),
  };
}

export function normalizePublicSiteUrl(raw: string | null | undefined): string {
  const fallback = "https://www.giftvibes.in";
  const t = (raw || "").trim();
  if (!t) return fallback;
  try {
    const u = new URL(t);
    // Repair known typo giftvibe.in (missing s)
    if (u.hostname === "giftvibe.in" || u.hostname === "www.giftvibe.in") {
      return "https://www.giftvibes.in";
    }
    return u.origin;
  } catch {
    return fallback;
  }
}

// ─── Navigation ──────────────────────────────────────────────────────────────

export type NavLinkRow = {
  label: string;
  href: string;
  enabled?: boolean;
  sort_order?: number;
  sortOrder?: number;
};

export type NavLinkOut = { label: string; href: string };

/** Enabled links only, stable sort by sort_order then label. */
export function mapEnabledNavLinks(rows: NavLinkRow[] | null | undefined): NavLinkOut[] {
  if (!rows?.length) return [];
  return rows
    .filter((r) => r.enabled !== false && r.label?.trim() && r.href?.trim())
    .slice()
    .sort((a, b) => {
      const sa = a.sort_order ?? a.sortOrder ?? 0;
      const sb = b.sort_order ?? b.sortOrder ?? 0;
      if (sa !== sb) return sa - sb;
      return a.label.localeCompare(b.label);
    })
    .map((r) => ({ label: r.label.trim(), href: r.href.trim() }));
}

// ─── Mega menu ───────────────────────────────────────────────────────────────

export type MegaMenuItemIn = {
  name?: string;
  label?: string;
  subtitle?: string;
  items?: string; // legacy subtitle field name in header
  image_url?: string;
  image?: string;
  href?: string;
  sort_order?: number;
  enabled?: boolean;
};

export type MegaMenuItemOut = {
  name: string;
  subtitle: string;
  image: string;
  href: string;
  sort_order: number;
};

/** Only enabled items with a name; href falls back to /shop?category=Name. */
export function mapMegaMenuItems(raw: MegaMenuItemIn[] | null | undefined): MegaMenuItemOut[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((it) => it && it.enabled !== false)
    .map((it, i) => {
      const name = String(it.name || it.label || "").trim();
      const image = String(it.image_url || it.image || "").trim();
      const subtitle = String(it.subtitle || it.items || "").trim();
      const href =
        String(it.href || "").trim() ||
        (name ? `/shop?category=${encodeURIComponent(name)}` : "/shop");
      return {
        name,
        subtitle,
        image: image || "/logo.png",
        href,
        sort_order: typeof it.sort_order === "number" ? it.sort_order : i + 1,
      };
    })
    .filter((it) => it.name)
    .sort((a, b) => a.sort_order - b.sort_order);
}

// ─── Page sections ───────────────────────────────────────────────────────────

export type SectionRow = {
  section_key?: string;
  sectionKey?: string;
  enabled?: boolean;
  content?: unknown;
  sort_order?: number;
  sortOrder?: number;
};

/** Enabled sections keyed by section_key, content as plain object. */
export function mapEnabledSections(
  rows: SectionRow[] | null | undefined,
): Record<string, Record<string, any>> {
  if (!rows?.length) return {};
  const out: Record<string, Record<string, any>> = {};
  const sorted = rows
    .filter((r) => r.enabled !== false)
    .slice()
    .sort((a, b) => (a.sort_order ?? a.sortOrder ?? 0) - (b.sort_order ?? b.sortOrder ?? 0));
  for (const r of sorted) {
    const key = r.section_key || r.sectionKey;
    if (!key) continue;
    const content =
      r.content && typeof r.content === "object" && !Array.isArray(r.content)
        ? (r.content as Record<string, any>)
        : {};
    out[key] = content;
  }
  return out;
}

export const REQUIRED_HOME_SECTION_KEYS = [
  "hero",
  "about",
  "discounts",
  "categories",
  "best_deals",
  "brands",
  "popular",
  "cashback",
  "tabbed_products",
  "why_choose_us",
  "satisfaction",
  "cashback_bottom",
  "services",
  "corporate_showcase",
] as const;

export function missingSectionKeys(
  existingKeys: string[],
  required: readonly string[] = REQUIRED_HOME_SECTION_KEYS,
): string[] {
  const have = new Set(existingKeys);
  return required.filter((k) => !have.has(k));
}

export function shouldRepairHeroContent(content: unknown): boolean {
  if (!content || typeof content !== "object" || Array.isArray(content)) return true;
  const c = content as Record<string, any>;
  return !c.heading_1 && !!(c.headline || c.heading);
}

export function repairHeroContent(content: unknown): Record<string, any> {
  const c =
    content && typeof content === "object" && !Array.isArray(content)
      ? (content as Record<string, any>)
      : {};
  if (c.heading_1) return { ...c };
  return {
    heading_1: c.headline || c.heading || "Custom Diaries",
    heading_2: c.headline_line2 || c.heading_2 || "Corporate Gifts.",
    subheading_1:
      typeof c.subheading === "string"
        ? c.subheading
        : c.subheading_1 || "Crafting premium customized diaries and",
    subheading_2: c.subheading_2 || "corporate gifts with unmatched quality.",
    primary_cta: c.primary_cta || {
      base_text: c.cta_text || "Come Here",
      hover_text: "Explore More",
      url: c.cta_href || "/shop",
    },
    background_image_url: c.background_image_url || "/headerimage5.png",
  };
}

// ─── Product specifications ──────────────────────────────────────────────────

export type FeatureEntry = { show?: boolean; value?: string };

const FEATURE_ORDER: { key: string; label: string }[] = [
  { key: "size", label: "Size" },
  { key: "paper_quality", label: "Paper Quality" },
  { key: "page_format", label: "Page Format" },
  { key: "cover_binding", label: "Cover Binding" },
  { key: "monthly_planner", label: "Monthly Planner" },
  { key: "month_cutting", label: "Month Cutting" },
  { key: "cover_colors", label: "Cover Colors" },
  { key: "material", label: "Material" },
  { key: "color", label: "Color" },
  { key: "pages", label: "Pages" },
  { key: "cover_type", label: "Cover Binding" },
  { key: "weight", label: "Weight" },
  { key: "dimensions", label: "Size" },
];

/** Only show=true + non-empty value. Stable label order. */
export function pickVisibleFeatures(
  features: Record<string, FeatureEntry> | null | undefined,
): { key: string; label: string; value: string }[] {
  if (!features || typeof features !== "object") return [];
  const seen = new Set<string>();
  const out: { key: string; label: string; value: string }[] = [];
  for (const { key, label } of FEATURE_ORDER) {
    const entry = features[key];
    if (!entry?.show) continue;
    const value = typeof entry.value === "string" ? entry.value.trim() : "";
    if (!value) continue;
    if (seen.has(label)) continue;
    seen.add(label);
    out.push({ key, label, value });
  }
  for (const [key, entry] of Object.entries(features)) {
    if (FEATURE_ORDER.some((f) => f.key === key)) continue;
    if (!entry?.show) continue;
    const value = typeof entry.value === "string" ? entry.value.trim() : "";
    if (!value) continue;
    out.push({ key, label: key.replace(/_/g, " "), value });
  }
  return out;
}

// ─── Catalog visibility ──────────────────────────────────────────────────────

export type CatalogItemLike = {
  id: string | number;
  enabled?: boolean;
  featured?: boolean;
  name?: string;
};

/** Live-on-site items only (enabled !== false). */
export function filterLiveCatalog<T extends CatalogItemLike>(items: T[] | null | undefined): T[] {
  if (!items?.length) return [];
  return items.filter((it) => it.enabled !== false);
}

export function filterFeaturedCatalog<T extends CatalogItemLike>(items: T[] | null | undefined): T[] {
  return filterLiveCatalog(items).filter((it) => it.featured === true);
}

// ─── Shop / product template chrome ──────────────────────────────────────────

export type ShopChromeOut = {
  heading: string;
  subheading: string;
  empty_state: string;
};

const SHOP_CHROME_DEFAULTS: ShopChromeOut = {
  heading: "Our Products",
  subheading: "Browse diaries, gift sets, and corporate essentials.",
  empty_state: "No products match your filters. Try clearing filters.",
};

/** Admin page_sections shop/main content → shop page chrome. */
export function mapShopChrome(content: unknown): ShopChromeOut {
  const c =
    content && typeof content === "object" && !Array.isArray(content)
      ? (content as Record<string, unknown>)
      : {};
  return {
    heading:
      typeof c.heading === "string" && c.heading.trim()
        ? c.heading.trim()
        : SHOP_CHROME_DEFAULTS.heading,
    subheading:
      typeof c.subheading === "string" && c.subheading.trim()
        ? c.subheading.trim()
        : SHOP_CHROME_DEFAULTS.subheading,
    empty_state:
      typeof c.empty_state === "string" && c.empty_state.trim()
        ? c.empty_state.trim()
        : SHOP_CHROME_DEFAULTS.empty_state,
  };
}

export type ProductChromeOut = {
  related_heading: string;
  enquiry_cta: string;
  quote_cta: string;
};

const PRODUCT_CHROME_DEFAULTS: ProductChromeOut = {
  related_heading: "You may also like",
  enquiry_cta: "Enquire Now",
  quote_cta: "Request Quote",
};

/** Admin page_sections product/main content → PDP chrome. */
export function mapProductChrome(content: unknown): ProductChromeOut {
  const c =
    content && typeof content === "object" && !Array.isArray(content)
      ? (content as Record<string, unknown>)
      : {};
  return {
    related_heading:
      typeof c.related_heading === "string" && c.related_heading.trim()
        ? c.related_heading.trim()
        : PRODUCT_CHROME_DEFAULTS.related_heading,
    enquiry_cta:
      typeof c.enquiry_cta === "string" && c.enquiry_cta.trim()
        ? c.enquiry_cta.trim()
        : PRODUCT_CHROME_DEFAULTS.enquiry_cta,
    quote_cta:
      typeof c.quote_cta === "string" && c.quote_cta.trim()
        ? c.quote_cta.trim()
        : PRODUCT_CHROME_DEFAULTS.quote_cta,
  };
}

/** Names used by storefront offline defaults for Latest Diaries (best_deals). */
export const DEFAULT_BEST_DEALS_NAMES = [
  "Management Premium PU Leather Diary 2026",
  "DIRECTORS Premium Leather Diary 2026",
  "Heritage Leather Executive Diary 2026",
  "Paipin Brown Executive Leather Diary",
] as const;

/** Names used by storefront offline defaults for Trending Diary Giftsets (popular). */
export const DEFAULT_POPULAR_NAMES = [
  "Primo A5 Corporate Diary and Pen Set",
  "Wooden A5 Corporate Diary and Pen Set",
  "Polo A5 Corporate Diary and Pen Set",
  "50-50 B5 Diary Calendar with Pen Combo Set",
  "Oval Leather B5 Diary with Pen Gift Set",
] as const;

export function normalizeCatalogName(name: string): string {
  return String(name || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Match wanted display names to live catalog IDs (products + diaries).
 * Fuzzy: exact normalize, then includes either way. Prefer first hit; no duplicates.
 * If nothing matches by name, fill remaining slots with first catalog rows.
 */
/**
 * Normalize admin tab product id lists.
 * Accepts string ids, { productId }, { id }, and mixed arrays from older saves.
 */
export function normalizeTabProductIds(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  const out: string[] = [];
  const seen = new Set<string>();
  for (const item of raw) {
    let id = "";
    if (typeof item === "string") id = item.trim();
    else if (item && typeof item === "object") {
      const o = item as Record<string, unknown>;
      const v = o.productId ?? o.product_id ?? o.id;
      if (typeof v === "string") id = v.trim();
    }
    if (!id || seen.has(id)) continue;
    seen.add(id);
    out.push(id);
  }
  return out;
}

/** Parse page_sections tabbed_products content.tabs into stable { name, productIds }. */
export function parseCustomTabs(
  content: unknown,
): { name: string; productIds: string[] }[] {
  if (!content || typeof content !== "object") return [];
  const tabs = (content as { tabs?: unknown }).tabs;
  if (!Array.isArray(tabs)) return [];
  return tabs.map((t, i) => {
    const row = t && typeof t === "object" ? (t as Record<string, unknown>) : {};
    const name =
      typeof row.name === "string" && row.name.trim()
        ? row.name.trim()
        : `Tab ${i + 1}`;
    const rawIds = row.productIds ?? row.product_ids ?? row.items ?? row.products;
    return { name, productIds: normalizeTabProductIds(rawIds) };
  });
}

/**
 * Resolve tab productIds against a catalog map (id → product).
 * Tries exact id, then lowercase id (UUID case drift).
 */
export function resolveProductsByIds<T>(
  productIds: string[],
  byId: Map<string, T>,
): T[] {
  const out: T[] = [];
  for (const id of productIds) {
    const hit =
      byId.get(id) ??
      byId.get(id.toLowerCase()) ??
      byId.get(id.toUpperCase());
    if (hit) out.push(hit);
  }
  return out;
}

export function matchCatalogIdsByNames(
  catalog: { id: string | number; name?: string | null }[] | null | undefined,
  wantedNames: readonly string[],
  max: number,
): { productId: string }[] {
  if (!catalog?.length || max <= 0) return [];
  const used = new Set<string>();
  const out: { productId: string }[] = [];

  for (const want of wantedNames) {
    if (out.length >= max) break;
    const nw = normalizeCatalogName(want);
    if (!nw) continue;
    const hit = catalog.find((c) => {
      const id = String(c.id);
      if (!id || used.has(id)) return false;
      const nc = normalizeCatalogName(c.name || "");
      if (!nc) return false;
      return nc === nw || nc.includes(nw) || nw.includes(nc);
    });
    if (hit) {
      const id = String(hit.id);
      used.add(id);
      out.push({ productId: id });
    }
  }

  // If name-match found nothing, seed first N catalog items so admin/storefront stay in sync.
  if (out.length === 0) {
    for (const c of catalog) {
      if (out.length >= max) break;
      const id = String(c.id);
      if (!id || used.has(id)) continue;
      used.add(id);
      out.push({ productId: id });
    }
  }

  return out;
}

/**
 * Prefer CMS footer groups when non-empty; offline fallback only when empty.
 * company → INFORMATION column; shop → OUR PRODUCT; support merges into INFORMATION.
 */
export function resolveFooterColumns(
  groups: {
    company?: NavLinkOut[] | null;
    shop?: NavLinkOut[] | null;
    support?: NavLinkOut[] | null;
  },
  fallbacks: { company: NavLinkOut[]; shop: NavLinkOut[] },
): { company: NavLinkOut[]; shop: NavLinkOut[]; support: NavLinkOut[] } {
  const company =
    groups.company && groups.company.length > 0 ? groups.company : fallbacks.company;
  const shop = groups.shop && groups.shop.length > 0 ? groups.shop : fallbacks.shop;
  const support = groups.support && groups.support.length > 0 ? groups.support : [];
  return { company, shop, support };
}
