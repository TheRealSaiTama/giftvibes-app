export const revalidate = 60;

import type { Metadata } from "next";
import { CATEGORY_LANDINGS } from "@/lib/seo";
import {
  MarketingShell,
  ProductMiniList,
  listLiveCatalog,
  matchLandingProducts,
} from "@/components/seo/marketing-shell";

const meta = CATEGORY_LANDINGS[4];
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
        Table and wall calendars sit on the desk next to the diary. We print them in Delhi for the
        same New Year cycle — same artwork family, same dispatch plan.
      </p>
      <ProductMiniList items={items} />
    </MarketingShell>
  );
}
