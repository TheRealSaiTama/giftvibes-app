import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { teaserDescription } from "./teaser.ts";

describe("teaserDescription", () => {
  it("keeps a short sentence", () => {
    assert.equal(
      teaserDescription("Soft-touch PU diary with matching metal pen."),
      "Soft-touch PU diary with matching metal pen.",
    );
  });
  it("strips Product Highlights prefix and spec tail", () => {
    const raw =
      "Product Highlights Best PU Leather Diary with Pen at best price, stylish design. Size : A5 Binding : PU Leather COD facility not available";
    const out = teaserDescription(raw);
    assert.ok(!/product highlights/i.test(out));
    assert.ok(!/COD facility/i.test(out));
    assert.ok(!/Size\s*:/i.test(out));
    assert.ok(out.length <= 120);
  });
});
