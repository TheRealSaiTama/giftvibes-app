import type { Metadata } from "next";
import { MarketingShell } from "@/components/seo/marketing-shell";

export const metadata: Metadata = {
  title: "Employee Joining Kits India | Corporate Welcome Diaries",
  description:
    "Employee joining and onboarding kits: branded diary, pen and desk set from a Delhi manufacturer. Repeatable SKUs for HR / admin.",
  alternates: { canonical: "/industries/joining-kits" },
};

export default function Page() {
  return (
    <MarketingShell title="Employee joining kits">
      <p>
        Joining kits fail when every batch looks different. HR needs a repeatable SKU: same diary,
        same pen, same box, logo that does not change mid-year. We keep that spec on file so
        top-ups match the first lot.
      </p>
      <h2>A kit that actually gets used</h2>
      <ul>
        <li>A5 or B5 diary (undated if hiring is year-round)</li>
        <li>Metal pen</li>
        <li>Optional notepad or pen stand</li>
      </ul>
      <p>
        Practical packing list via bulk enquiry.
        Sets: <a href="/corporate-gift-sets">corporate gift sets</a>.
      </p>
    </MarketingShell>
  );
}
