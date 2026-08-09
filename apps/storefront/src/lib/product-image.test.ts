/**
 * Product image resolver tests.
 * Run: npx tsx --test src/lib/product-image.test.ts
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  extractGoogleDriveFileId,
  resolveProductImage,
  PRODUCT_IMAGE_PLACEHOLDER,
} from "./product-image.ts";

describe("extractGoogleDriveFileId", () => {
  it("parses uc?id= links", () => {
    assert.equal(
      extractGoogleDriveFileId("https://drive.google.com/uc?id=1UcB8Gmh4knL15Su_DsD5D0WihKEFN6pH"),
      "1UcB8Gmh4knL15Su_DsD5D0WihKEFN6pH",
    );
  });
  it("parses /file/d/ links", () => {
    assert.equal(
      extractGoogleDriveFileId("https://drive.google.com/file/d/1UcB8Gmh4knL15Su_DsD5D0WihKEFN6pH/view"),
      "1UcB8Gmh4knL15Su_DsD5D0WihKEFN6pH",
    );
  });
});

describe("resolveProductImage", () => {
  it("never returns brand logo as product image", () => {
    assert.equal(resolveProductImage("/logo.png"), PRODUCT_IMAGE_PLACEHOLDER);
    assert.equal(resolveProductImage(""), PRODUCT_IMAGE_PLACEHOLDER);
    assert.equal(resolveProductImage(null), PRODUCT_IMAGE_PLACEHOLDER);
  });
  it("rewrites Drive uc links to thumbnail", () => {
    const out = resolveProductImage(
      "https://drive.google.com/uc?id=1UcB8Gmh4knL15Su_DsD5D0WihKEFN6pH",
    );
    assert.ok(out.includes("thumbnail"));
    assert.ok(out.includes("1UcB8Gmh4knL15Su_DsD5D0WihKEFN6pH"));
  });
  it("keeps site-relative product paths", () => {
    assert.equal(resolveProductImage("/diary/trendingdiary.png"), "/diary/trendingdiary.png");
  });
});
