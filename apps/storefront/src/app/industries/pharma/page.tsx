import type { Metadata } from "next";
import { MarketingShell } from "@/components/seo/marketing-shell";

export const metadata: Metadata = {
  title: "Corporate Gifts for Pharmaceutical Companies | Promotional Diaries",
  description:
    "Promotional diaries and field-force gift sets for pharma companies in India. Logo-on-page print, bulk Delhi production, PAN-India dispatch.",
  alternates: { canonical: "/industries/pharma" },
};

export default function Page() {
  return (
    <MarketingShell title="Corporate gifts for pharmaceutical companies">
      <p>
        Pharma gifting in India is mostly field-force and doctor-facing stationery — not luxury
        hampers. A branded diary with a logo on every page stays on the desk after the detailing
        bag is empty. That is the product we already make for promotional programmes.
      </p>
      <h2>What works in this industry</h2>
      <ul>
        <li>A5 / B5 promotional diaries with each-page logo</li>
        <li>Notepads and sticky sets for camp / CME giveaways</li>
        <li>Pen + diary sets that survive courier to upcountry stockists</li>
      </ul>
      <h2>Procurement notes</h2>
      <p>
        Share expected quantity by SKU, artwork in vector, and the camp or FY start date. We
        confirm paper and print method before production — see{" "}
        <a href="/guides/logo-print-methods">print methods</a>. Browse{" "}
        <a href="/promotional-diaries">promotional diaries</a>.
      </p>
    </MarketingShell>
  );
}
