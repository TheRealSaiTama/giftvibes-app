import type { Metadata } from "next";
import { CATEGORY_LANDINGS } from "@/lib/seo";
import {
  MarketingShell,
  ProductMiniList,
  listLiveCatalog,
  matchLandingProducts,
} from "@/components/seo/marketing-shell";

const meta = CATEGORY_LANDINGS[3];
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
        Promotional diaries are campaign inventory: your brand on a notebook that lasts a year,
        not a tote that lasts a week. We print covers and, when needed, a logo on every page —
        useful for pharma reps and bank relationship managers.
      </p>
      <h2>From the catalogue</h2>
      <ProductMiniList items={items} />
    </MarketingShell>
  );
}
