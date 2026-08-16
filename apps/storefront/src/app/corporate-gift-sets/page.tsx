export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { CATEGORY_LANDINGS } from "@/lib/seo";
import {
  MarketingShell,
  ProductMiniList,
  listLiveCatalog,
  matchLandingProducts,
} from "@/components/seo/marketing-shell";

const meta = CATEGORY_LANDINGS[2];
export const metadata: Metadata = {
  title: meta.title,
  description: meta.description,
  alternates: { canonical: meta.href },
};

export default async function Page() {
  const items = matchLandingProducts(await listLiveCatalog(), meta.match);
  return (
    <MarketingShell title={meta.h1}>
      <p>
        A diary alone is a tool. A diary + pen in a printed box is what most banks, pharma field
        teams and admin departments actually issue. We manufacture the set — diary, metal pen,
        optional calendar or bottle — and brand the box lid.
      </p>
      <h2>Common set types</h2>
      <ul>
        <li>A5 PU diary + metal pen</li>
        <li>B5 diary + table calendar + pen</li>
        <li>2-in-1 / 3-in-1 joining or Diwali kits</li>
      </ul>
      <h2>From the catalogue</h2>
      <ProductMiniList items={items} />
    </MarketingShell>
  );
}
