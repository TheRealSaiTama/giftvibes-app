export const revalidate = 60;

import type { Metadata } from "next";
import { CATEGORY_LANDINGS } from "@/lib/seo";
import {
  MarketingShell,
  ProductMiniList,
  listLiveCatalog,
  matchLandingProducts,
} from "@/components/seo/marketing-shell";

const meta = CATEGORY_LANDINGS[0];

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
        New Year diaries are a seasonal factory product, not a last-week marketplace SKU. Corporates
        in India typically lock artwork between July and November for January dispatch. GiftVibes
        manufactures dated and undated planners in Delhi with your logo on the cover, spine or
        every page.
      </p>
      <h2>What to decide before you raise a PO</h2>
      <ul>
        <li>Size: A5 vs B5 executive</li>
        <li>Dated 2027 vs undated (undated ships faster late in the season)</li>
        <li>Cover: PU leather, art cover, or gift-set with pen</li>
        <li>Print: emboss / foil / each-page logo</li>
      </ul>
      <p>
        For a bulk quote, use the enquiry form on any product.
      </p>
      <h2>Live catalogue matches</h2>
      <ProductMiniList items={items} />
    </MarketingShell>
  );
}
