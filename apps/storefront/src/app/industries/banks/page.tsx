import type { Metadata } from "next";
import { MarketingShell } from "@/components/seo/marketing-shell";

export const metadata: Metadata = {
  title: "Corporate Gifts for Banks | BFSI Diaries & Planners",
  description:
    "Executive diaries and New Year planners for banks and NBFCs. Delhi manufacturer, magnetic-flap PU leather, bulk branding, PAN-India delivery.",
  alternates: { canonical: "/industries/banks" },
};

export default function Page() {
  return (
    <MarketingShell title="Corporate gifts for banks & BFSI">
      <p>
        Bank gifting is calendar-driven: New Year diaries for branches, relationship managers and
        valued clients. Specs trend conservative — sober PU colours, magnetic flap, one-date
        format, foil or emboss (rarely loud UV). We manufacture that spec in Delhi every season.
      </p>
      <h2>Typical order</h2>
      <ul>
        <li>B5 executive PU diary for officers / clients</li>
        <li>A5 gift set with pen for wider staff</li>
        <li>Table calendar to match the same artwork family</li>
      </ul>
      <p>
        Start with <a href="/new-year-diaries">New Year diaries</a> and{" "}
        <a href="/pu-leather-diaries">PU leather diaries</a>. Lock artwork using the{" "}
        <a href="/custom-design">custom print options</a>.
      </p>
    </MarketingShell>
  );
}
