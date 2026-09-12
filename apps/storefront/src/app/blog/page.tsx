import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/sections/header";
import Footer from "@/components/sections/footer";
import { getStorefrontData, getSeo } from "@/lib/site";
import { getPublishedPosts } from "@/lib/blog";
import { SITE_ORIGIN } from "@/lib/seo";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeo("blog").catch(() => null);
  const title = seo?.title || "Blog | GiftVibes — Corporate diary notes from the factory";
  const description =
    seo?.description ||
    "Notes from GiftVibes (Ravindra Enterprises, Delhi) on bulk diaries, print methods, bank and corporate gifting. Written for procurement teams.";
  return {
    title,
    description,
    alternates: { canonical: "/blog" },
    openGraph: {
      title,
      description,
      url: `${SITE_ORIGIN}/blog`,
      images: seo?.ogImageUrl ? [{ url: seo.ogImageUrl }] : undefined,
    },
  };
}

export default async function BlogIndexPage() {
  const [data, posts] = await Promise.all([getStorefrontData(), getPublishedPosts()]);
  return (
    <div className="min-h-screen bg-white">
      <Header
        nav={data.headerNav}
        megaMenu={data.megaMenu}
        logoUrl={data.settings?.logoUrl}
        brandName={data.settings?.brandName}
      />
      <main className="container max-w-4xl py-12 md:py-16">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">From the factory</p>
        <h1 className="mt-2 text-3xl md:text-4xl font-bold text-[#124559]">Blog</h1>
        <p className="mt-3 text-[#444] max-w-2xl">
          Short notes for people who order 100+ diaries — print, timelines, specs. Not gift-idea listicles.
        </p>

        {posts.length === 0 ? (
          <p className="mt-10 text-sm text-slate-500">
            No articles live yet.{" "}
            <Link href="/shop" className="underline text-[#124559]">
              Browse the catalogue
            </Link>
            .
          </p>
        ) : (
          <ul className="mt-10 space-y-6">
            {posts.map((p) => (
              <li key={p.id} className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
                <p className="text-xs text-slate-400">
                  {p.publishedAt
                    ? new Date(p.publishedAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : ""}
                </p>
                <h2 className="mt-1 text-xl font-semibold text-[#124559]">
                  <Link href={`/blog/${p.slug}`} className="hover:underline">
                    {p.title}
                  </Link>
                </h2>
                {p.excerpt ? <p className="mt-2 text-sm text-[#444] leading-6">{p.excerpt}</p> : null}
                <Link
                  href={`/blog/${p.slug}`}
                  className="inline-block mt-3 text-sm font-semibold text-[#124559] underline"
                >
                  Read
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
      <Footer settings={data.settings} footerLinks={data.footerLinks} />
    </div>
  );
}
