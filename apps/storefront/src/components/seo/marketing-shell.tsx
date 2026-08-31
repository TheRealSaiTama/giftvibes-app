import Link from "next/link";
import Header from "@/components/sections/header";
import Footer from "@/components/sections/footer";
import { getStorefrontData } from "@/lib/site";
import { CATEGORY_LANDINGS, productHref } from "@/lib/seo";
import { getCachedLiveCatalog, type CatalogItem } from "@/lib/catalog";

export async function MarketingShell({
  children,
  title,
}: {
  children: React.ReactNode;
  title?: string;
}) {
  const data = await getStorefrontData();
  return (
    <div className="min-h-screen bg-white">
      <Header
        nav={data.headerNav}
        megaMenu={data.megaMenu}
        logoUrl={data.settings?.logoUrl}
        brandName={data.settings?.brandName}
      />
      <main className="container max-w-4xl py-12 md:py-16">
        {title ? (
          <h1 className="text-3xl md:text-4xl font-bold text-[#124559] mb-6">{title}</h1>
        ) : null}
        <div className="prose prose-neutral max-w-none text-[#333] [&_h2]:text-[#124559] [&_h2]:text-2xl [&_h2]:mt-10 [&_h2]:mb-3 [&_p]:leading-7 [&_ul]:my-4 [&_li]:my-1">
          {children}
        </div>
        <CtaBlock />
        <RelatedSeoLinks />
      </main>
      <Footer settings={data.settings} footerLinks={data.footerLinks} />
    </div>
  );
}

function CtaBlock() {
  return (
    <div className="mt-12 rounded-xl border border-[#124559]/20 bg-[#124559]/5 p-6">
      <h2 className="text-xl font-semibold text-[#124559] mb-2">Get a bulk quote</h2>
      <p className="text-sm text-[#444] mb-4">
        Tell us quantity, city, delivery date and branding (emboss, foil, page print). Factory in
        Nai Sarak, Delhi. PAN-India dispatch.
      </p>
      <div className="flex flex-wrap gap-3">
        <Link
          href="/shop"
          className="inline-flex rounded-md bg-[#124559] px-4 py-2 text-sm font-semibold text-white"
        >
          Browse catalogue
        </Link>
        <Link
          href="/custom-design"
          className="inline-flex rounded-md border border-[#124559] px-4 py-2 text-sm font-semibold text-[#124559]"
        >
          Custom print options
        </Link>
        <a
          href="https://wa.me/919899223130"
          className="inline-flex rounded-md px-4 py-2 text-sm font-semibold text-[#124559] underline"
        >
          WhatsApp +91 98992 23130
        </a>
      </div>
    </div>
  );
}

function RelatedSeoLinks() {
  return (
    <nav className="mt-10 border-t pt-6" aria-label="Related GiftVibes pages">
      <p className="text-sm font-semibold text-[#124559] mb-3">Explore</p>
      <ul className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
        <li>
          <Link className="underline" href="/corporate-gifting">
            Corporate gifting
          </Link>
        </li>
        {CATEGORY_LANDINGS.map((c) => (
          <li key={c.href}>
            <Link className="underline" href={c.href}>
              {c.h1}
            </Link>
          </li>
        ))}
        <li>
          <Link className="underline" href="/industries/pharma">
            Pharma
          </Link>
        </li>
        <li>
          <Link className="underline" href="/industries/banks">
            Banks
          </Link>
        </li>
      </ul>
    </nav>
  );
}

export function matchLandingProducts(items: CatalogItem[], needles: readonly string[]) {
  const n = needles.map((s) => s.toLowerCase());
  return items.filter((item) => {
    const hay = `${item.name} ${item.category || ""} ${item.description || ""}`.toLowerCase();
    return n.some((k) => hay.includes(k));
  });
}

export function ProductMiniList({ items }: { items: CatalogItem[] }) {
  if (!items.length) return null;
  return (
    <ul className="mt-6 grid gap-2 not-prose">
      {items.slice(0, 12).map((p) => (
        <li key={p.id}>
          <Link href={productHref(p)} className="text-[#124559] underline font-medium">
            {p.name}
          </Link>
          {p.minPrice != null ? (
            <span className="text-sm text-[#666]">
              {" "}
              · from ₹{p.minPrice}
              {p.maxPrice && p.maxPrice !== p.minPrice ? `–₹${p.maxPrice}` : ""}
            </span>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

export { getCachedLiveCatalog as listLiveCatalog };
