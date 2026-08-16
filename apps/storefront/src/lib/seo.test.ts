import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { isUuid, productHref, slugifyName } from "./seo.ts";

describe("seo helpers", () => {
  it("detects uuids", () => {
    assert.equal(isUuid("1e7cad7c-dd7e-4ace-8dd9-bfa4c9af720b"), true);
    assert.equal(isUuid("directors-premium-leather-diary"), false);
  });
  it("prefers slug in product href", () => {
    assert.equal(
      productHref({ id: "abc", slug: "directors-diary" }),
      "/shop/directors-diary",
    );
    assert.equal(productHref({ id: "abc", slug: "" }), "/shop/abc");
  });
  it("slugifies names", () => {
    assert.equal(slugifyName("PU Leather & Pen Set"), "pu-leather-and-pen-set");
  });
});
