import type { Metadata } from "next";
import { MarketingShell } from "@/components/seo/marketing-shell";

export const metadata: Metadata = {
  title: "Employee Joining Kit Ideas for Indian Companies",
  description:
    "What to put in a joining kit that HR can reorder: diary, pen, notepad. Repeatable SKUs from a Delhi manufacturer.",
  alternates: { canonical: "/guides/employee-joining-kits" },
};

export default function Page() {
  return (
    <MarketingShell title="Employee joining kit contents">
      <p>
        Skip the mug that chips in transit. A dated or undated diary plus a pen is what new
        joiners actually put on the desk. Keep the SKU frozen for 12 months so January hires and
        July hires match.
      </p>
      <h2>A kit that scales</h2>
      <ul>
        <li>One diary size for everyone, or two grades (staff / manager)</li>
        <li>Undated if hiring is year-round</li>
        <li>Same box so stores can stock it</li>
      </ul>
      <p>
        Product page: <a href="/industries/joining-kits">joining kits</a>. Sets:{" "}
        <a href="/corporate-gift-sets">gift sets</a>.
      </p>
    </MarketingShell>
  );
}
