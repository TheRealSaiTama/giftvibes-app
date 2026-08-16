import type { Metadata } from "next";
import { MarketingShell } from "@/components/seo/marketing-shell";

export const metadata: Metadata = {
  title: "Diary Logo Print: Emboss vs Foil vs Each-Page",
  description:
    "Which branding method to pick for corporate diaries: emboss, hot foil, screen, laser and logo-on-each-page. From a Delhi print floor.",
  alternates: { canonical: "/guides/logo-print-methods" },
};

export default function Page() {
  return (
    <MarketingShell title="Emboss vs foil vs each-page logo">
      <p>
        The method should match the cover and the budget, not a catalogue buzzword.
      </p>
      <h2>Cover</h2>
      <ul>
        <li>
          <strong>Emboss / deboss:</strong> quiet, lasts the year, best on PU.
        </li>
        <li>
          <strong>Hot foil:</strong> gold/silver hit for banks and CXO gifts.
        </li>
        <li>
          <strong>Screen / digital cover:</strong> multi-colour marks and full-bleed art.
        </li>
        <li>
          <strong>Laser:</strong> fine marks on some covers; less colour.
        </li>
      </ul>
      <h2>Inside</h2>
      <p>
        <strong>Logo on each page</strong> is a pharma / promo favourite. It costs more in plates
        and time — lock it early. Details: <a href="/custom-design">custom print</a>.
      </p>
    </MarketingShell>
  );
}
