import type { Metadata } from "next";
import { MarketingShell } from "@/components/seo/marketing-shell";

export const metadata: Metadata = {
  title: "New Year Diary Bulk Order Timeline | When to Book",
  description:
    "When Indian corporates should lock artwork and POs for New Year diaries. July–December factory calendar from a Delhi manufacturer.",
  alternates: { canonical: "/guides/new-year-diary-bulk-order-timeline" },
};

export default function Page() {
  return (
    <MarketingShell title="New Year diary bulk-order timeline">
      <p>
        Dated diaries have a cliff: paper and binding capacity fills in Q4. Waiting for December
        artwork means undated stock or missed January gifting.
      </p>
      <h2>A working calendar</h2>
      <ul>
        <li>
          <strong>July–August:</strong> shortlist SKU, size, cover. Request samples.
        </li>
        <li>
          <strong>September:</strong> freeze logo and box design. Confirm quantity ±10%.
        </li>
        <li>
          <strong>October:</strong> PO + advance. Production slot locked.
        </li>
        <li>
          <strong>November:</strong> printing and QC. Dispatch plan by city.
        </li>
        <li>
          <strong>December:</strong> last inbound to branches / HO.
        </li>
      </ul>
      <p>
        Catalogue: <a href="/new-year-diaries">New Year diaries</a>.
      </p>
    </MarketingShell>
  );
}
