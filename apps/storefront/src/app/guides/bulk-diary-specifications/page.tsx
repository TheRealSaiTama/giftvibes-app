import type { Metadata } from "next";
import { MarketingShell } from "@/components/seo/marketing-shell";

export const metadata: Metadata = {
  title: "How to Spec 500–5,000 Corporate Diaries",
  description:
    "A buyer checklist for bulk diaries: size, paper, binding, box, MOQ, lead time and branding. Written for Indian procurement.",
  alternates: { canonical: "/guides/bulk-diary-specifications" },
};

export default function Page() {
  return (
    <MarketingShell title="How to spec 500–5,000 diaries">
      <p>Send this list with your RFQ and we can quote without a week of back-and-forth.</p>
      <h2>Checklist</h2>
      <ul>
        <li>Quantity and ship-to city (or multi-city split)</li>
        <li>Size: A5 or B5 executive</li>
        <li>Dated year vs undated</li>
        <li>Cover material and colour</li>
        <li>Paper (we typically run natural shade writing stock)</li>
        <li>Branding method and logo file (vector)</li>
        <li>Box: plain, printed lid, or gift set with pen</li>
        <li>Need-by date (not “ASAP”)</li>
      </ul>
      <p>
        Start on <a href="/corporate-gifting">corporate gifting</a> or the{" "}
        <a href="/shop">catalogue</a>.
      </p>
    </MarketingShell>
  );
}
