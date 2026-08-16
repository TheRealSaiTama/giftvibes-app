import type { Metadata } from "next";
import Link from "next/link";
import { MarketingShell } from "@/components/seo/marketing-shell";
import { getSeo } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeo("corporate-gifting").catch(() => null);
  return {
    title: seo?.title || "Corporate Gifting Company India | Diary Manufacturer Delhi",
    description:
      seo?.description ||
      "GiftVibes (Ravindra Enterprises) is a Delhi manufacturer of corporate diaries, gift sets and promotional products since 1999. Bulk branding, wholesale pricing, PAN-India delivery.",
    alternates: { canonical: "/corporate-gifting" },
  };
}

export default function CorporateGiftingPage() {
  return (
    <MarketingShell title="Corporate diaries & gift sets from the manufacturer">
      <p>
        GiftVibes is the storefront of <strong>Ravindra Enterprises</strong>, a Delhi manufacturer
        (Nai Sarak) making customised diaries, planners, notebooks and desk gifts since 1999. We
        sell wholesale to corporates — not retail hampers. If you need 100 to 10,000 branded
        pieces with a date you can hold us to, this is the page to start.
      </p>
      <h2>What procurement teams actually buy from us</h2>
      <ul>
        <li>
          <Link href="/new-year-diaries">New Year / dated diaries and planners</Link> for the
          calendar cycle
        </li>
        <li>
          <Link href="/pu-leather-diaries">PU leather executive diaries</Link> for clients and
          CXOs
        </li>
        <li>
          <Link href="/corporate-gift-sets">Diary + pen gift sets</Link> and 2-in-1 / 3-in-1
          combos
        </li>
        <li>
          <Link href="/promotional-diaries">Promotional diaries and notebooks</Link> for campaigns
        </li>
        <li>
          <Link href="/industries/joining-kits">Employee joining kits</Link> and{" "}
          <Link href="/exhibition-gifts">exhibition giveaways</Link>
        </li>
      </ul>
      <h2>Branding we do in-house</h2>
      <p>
        Logo emboss, hot foil, screen, laser, cover print and logo-on-each-page. See{" "}
        <Link href="/guides/logo-print-methods">print method guide</Link> and{" "}
        <Link href="/custom-design">custom print</Link>.
      </p>
      <h2>How bulk orders work</h2>
      <p>
        Typical MOQ starts at 100. Share quantity, city, delivery week and branding file. We
        confirm paper, size (usually A5 / B5 executive), box and lead time before you raise a PO.
        Read <Link href="/guides/bulk-diary-specifications">how to spec 500–5,000 diaries</Link>.
      </p>
      <h2>Who we already serve</h2>
      <p>
        Repeat demand comes from <Link href="/industries/pharma">pharma / promo</Link>,{" "}
        <Link href="/industries/banks">banks and BFSI planners</Link>, manufacturing and MNC
        admin teams. We deliver PAN-India from Delhi — we do not need a fake page for every city.
      </p>
    </MarketingShell>
  );
}
