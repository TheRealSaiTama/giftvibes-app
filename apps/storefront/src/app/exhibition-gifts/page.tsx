export const revalidate = 60;

import type { Metadata } from "next";
import { CATEGORY_LANDINGS } from "@/lib/seo";
import {
  MarketingShell,
  ProductMiniList,
  listLiveCatalog,
  matchLandingProducts,
} from "@/components/seo/marketing-shell";

const meta = CATEGORY_LANDINGS[5];
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
        Exhibition gifts have a hard date. We plan production backwards from the stall date:
        diaries, pen stands, notepads that pack flat and still carry a logo. More on the{" "}
        <a href="/industries/exhibition">exhibition industry page</a>.
      </p>
      <ProductMiniList items={items} />
    </MarketingShell>
  );
}
