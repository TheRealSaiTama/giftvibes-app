import type { Metadata } from "next";
import { MarketingShell } from "@/components/seo/marketing-shell";

export const metadata: Metadata = {
  title: "Exhibition Visitor Gifts | Trade Show Diaries India",
  description:
    "Exhibition and visitor gifts with a stall deadline. Diaries, pen stands and notepads manufactured in Delhi for events across India.",
  alternates: { canonical: "/industries/exhibition" },
};

export default function Page() {
  return (
    <MarketingShell title="Exhibition & visitor gifts">
      <p>
        Stall dates do not move. We schedule print and carton dispatch from the event date
        backwards, then courier to the venue city. Products stay light and logo-forward: diaries,
        notepads, pen stands — see <a href="/exhibition-gifts">exhibition catalogue slice</a>.
      </p>
      <h2>What to send us</h2>
      <ul>
        <li>Event date and city</li>
        <li>Quantity (plus 5–10% spare)</li>
        <li>Vector logo and brand colours</li>
      </ul>
    </MarketingShell>
  );
}
