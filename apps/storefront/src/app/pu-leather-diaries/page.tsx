export const revalidate = 60;

import type { Metadata } from "next";
import { CATEGORY_LANDINGS } from "@/lib/seo";
import {
  MarketingShell,
  ProductMiniList,
  listLiveCatalog,
  matchLandingProducts,
} from "@/components/seo/marketing-shell";

const meta = CATEGORY_LANDINGS[1];
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
        PU leather diaries are the default executive gift in Indian corporates: sponge padding,
        magnetic flap, natural-shade paper, room for a logo that will be seen every working day.
        We make them in Delhi and sell wholesale — not as single-piece Amazon gifts.
      </p>
      <h2>Typical spec</h2>
      <ul>
        <li>B5 executive (~7.4 × 9.75 in) or A5</li>
        <li>One-date-per-page or weekly planner</li>
        <li>Leatherette bound with foam padding</li>
        <li>Emboss or foil on the cover; optional box print</li>
      </ul>
      <h2>From the catalogue</h2>
      <ProductMiniList items={items} />
    </MarketingShell>
  );
}
