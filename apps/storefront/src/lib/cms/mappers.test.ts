/**
 * Unit tests for pure CMS mappers — drive real shipped functions, no mocks of logic.
 * Run: npx tsx --test apps/storefront/src/lib/cms/mappers.test.ts
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  mapSiteSettings,
  normalizePublicSiteUrl,
  mapEnabledNavLinks,
  mapMegaMenuItems,
  mapEnabledSections,
  missingSectionKeys,
  shouldRepairHeroContent,
  repairHeroContent,
  pickVisibleFeatures,
  filterLiveCatalog,
  filterFeaturedCatalog,
  REQUIRED_HOME_SECTION_KEYS,
} from "./mappers.ts";

describe("mapSiteSettings", () => {
  it("uses fallbacks when row is null", () => {
    const s = mapSiteSettings(null);
    assert.equal(s.brandName, "GiftVibes");
    assert.ok(s.logoUrl);
    assert.ok(s.faviconUrl);
  });

  it("prefers admin brand/logo when set", () => {
    const s = mapSiteSettings({
      brandName: "Acme Gifts",
      logoUrl: "/custom-logo.png",
      faviconUrl: "/custom.ico",
      siteUrl: "https://www.giftvibes.in",
      socials: { instagram: "https://ig.com/x" },
    });
    assert.equal(s.brandName, "Acme Gifts");
    assert.equal(s.logoUrl, "/custom-logo.png");
    assert.equal(s.faviconUrl, "/custom.ico");
    assert.equal(s.socials.instagram, "https://ig.com/x");
  });
});

describe("normalizePublicSiteUrl", () => {
  it("repairs giftvibe.in typo", () => {
    assert.equal(normalizePublicSiteUrl("https://giftvibe.in"), "https://www.giftvibes.in");
  });
  it("accepts valid giftvibes origin", () => {
    assert.equal(normalizePublicSiteUrl("https://www.giftvibes.in/path"), "https://www.giftvibes.in");
  });
  it("falls back on empty/invalid", () => {
    assert.equal(normalizePublicSiteUrl(""), "https://www.giftvibes.in");
    assert.equal(normalizePublicSiteUrl("not-a-url"), "https://www.giftvibes.in");
  });
});

describe("mapEnabledNavLinks", () => {
  it("drops disabled and empty labels", () => {
    const out = mapEnabledNavLinks([
      { label: "Shop", href: "/shop", enabled: true, sort_order: 1 },
      { label: "Hidden", href: "/x", enabled: false, sort_order: 0 },
      { label: "  ", href: "/y", enabled: true, sort_order: 2 },
    ]);
    assert.deepEqual(out, [{ label: "Shop", href: "/shop" }]);
  });
  it("sorts by sort_order", () => {
    const out = mapEnabledNavLinks([
      { label: "B", href: "/b", enabled: true, sort_order: 2 },
      { label: "A", href: "/a", enabled: true, sort_order: 1 },
    ]);
    assert.deepEqual(
      out.map((x) => x.label),
      ["A", "B"],
    );
  });
});

describe("mapMegaMenuItems", () => {
  it("filters disabled and builds category href", () => {
    const out = mapMegaMenuItems([
      { name: "CORPORATE GIFT SETS", image_url: "/a.png", subtitle: "Premium", enabled: true, sort_order: 1 },
      { name: "HIDDEN", image: "/b.png", enabled: false },
    ]);
    assert.equal(out.length, 1);
    assert.equal(out[0].name, "CORPORATE GIFT SETS");
    assert.ok(out[0].href.includes("category="));
    assert.ok(out[0].href.includes(encodeURIComponent("CORPORATE GIFT SETS")));
  });
});

describe("mapEnabledSections", () => {
  it("keys by section_key and skips disabled", () => {
    const out = mapEnabledSections([
      { section_key: "hero", enabled: true, content: { heading_1: "Hi" }, sort_order: 1 },
      { section_key: "about", enabled: false, content: { x: 1 }, sort_order: 2 },
    ]);
    assert.deepEqual(Object.keys(out), ["hero"]);
    assert.equal(out.hero.heading_1, "Hi");
  });
});

describe("missingSectionKeys / hero repair", () => {
  it("lists missing required home keys", () => {
    const missing = missingSectionKeys(["hero", "about"]);
    assert.ok(missing.includes("categories"));
    assert.ok(missing.includes("best_deals"));
    assert.ok(!missing.includes("hero"));
    assert.equal(missingSectionKeys([...REQUIRED_HOME_SECTION_KEYS]).length, 0);
  });

  it("detects and repairs broken hero content without wiping unknown keys when already good", () => {
    assert.equal(shouldRepairHeroContent({ headline: "Welcome" }), true);
    assert.equal(shouldRepairHeroContent({ heading_1: "Custom" }), false);
    const fixed = repairHeroContent({ headline: "Welcome to Giftvibes" });
    assert.equal(fixed.heading_1, "Welcome to Giftvibes");
    assert.ok(fixed.primary_cta?.url);
    assert.ok(fixed.background_image_url);
  });
});

describe("pickVisibleFeatures", () => {
  it("only returns show=true with non-empty values in order", () => {
    const out = pickVisibleFeatures({
      size: { show: true, value: "A5" },
      paper_quality: { show: false, value: "Hidden" },
      page_format: { show: true, value: "  " },
      cover_binding: { show: true, value: "Hard Bound" },
    });
    assert.deepEqual(
      out.map((x) => x.label),
      ["Size", "Cover Binding"],
    );
    assert.equal(out[0].value, "A5");
  });
});

describe("filterLiveCatalog / filterFeaturedCatalog", () => {
  const items = [
    { id: "1", name: "A", enabled: true, featured: true },
    { id: "2", name: "B", enabled: false, featured: true },
    { id: "3", name: "C", enabled: true, featured: false },
  ];
  it("hides disabled items", () => {
    assert.deepEqual(
      filterLiveCatalog(items).map((i) => i.id),
      ["1", "3"],
    );
  });
  it("featured subset of live only", () => {
    assert.deepEqual(
      filterFeaturedCatalog(items).map((i) => i.id),
      ["1"],
    );
  });
});
