import type { Metadata } from "next";
import Link from "next/link";
import { MarketingShell } from "@/components/seo/marketing-shell";

export const metadata: Metadata = {
  title: "Corporate Diary Buyer Guides | GiftVibes",
  description:
    "Practical guides for bulk diary orders: New Year timelines, print methods, specifications and employee joining kits. Written for Indian procurement teams.",
  alternates: { canonical: "/guides" },
};

export default function Page() {
  return (
    <MarketingShell title="Buyer guides">
      <p>
        Short notes for people who buy 100+ diaries, not gift-idea listicles.
      </p>
      <ul>
        <li>
          <Link href="/guides/new-year-diary-bulk-order-timeline">
            New Year diary bulk-order timeline
          </Link>
        </li>
        <li>
          <Link href="/guides/logo-print-methods">
            Emboss vs foil vs each-page logo print
          </Link>
        </li>
        <li>
          <Link href="/guides/bulk-diary-specifications">
            How to spec 500–5,000 diaries
          </Link>
        </li>
        <li>
          <Link href="/guides/employee-joining-kits">
            Employee joining kit contents
          </Link>
        </li>
      </ul>
    </MarketingShell>
  );
}
