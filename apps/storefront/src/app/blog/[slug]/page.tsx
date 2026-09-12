import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MarketingShell } from "@/components/seo/marketing-shell";
import { getPublishedPost, getPublishedPosts, renderBlogHtml } from "@/lib/blog";
import { SITE_ORIGIN } from "@/lib/seo";
import { isRemoteOrDataImage } from "@/lib/product-image";

export const revalidate = 60;

export async function generateStaticParams() {
  const posts = await getPublishedPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }> | { slug: string };
}): Promise<Metadata> {
  const resolved = "then" in params ? await params : params;
  const post = await getPublishedPost(resolved.slug);
  if (!post) return {};
  const title = post.seoTitle || post.title;
  const description = (post.seoDescription || post.excerpt || post.title).slice(0, 200);
  const keywords = post.seoKeywords
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 20);
  const path = `/blog/${post.slug}`;
  return {
    title,
    description,
    keywords: keywords.length ? keywords : undefined,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: `${SITE_ORIGIN}${path}`,
      type: "article",
      images: post.coverUrl ? [{ url: post.coverUrl }] : undefined,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }> | { slug: string };
}) {
  const resolved = "then" in params ? await params : params;
  const post = await getPublishedPost(resolved.slug);
  if (!post) notFound();
  const html = renderBlogHtml(post.body);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.seoDescription || post.excerpt || post.title,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    image: post.coverUrl || undefined,
    keywords: post.seoKeywords || undefined,
    author: { "@type": "Organization", name: "GiftVibes" },
    publisher: { "@type": "Organization", name: "GiftVibes", url: SITE_ORIGIN },
    mainEntityOfPage: `${SITE_ORIGIN}/blog/${post.slug}`,
  };

  return (
    <MarketingShell title={post.title}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <p className="text-sm text-slate-500 !mt-0">
        <Link href="/blog" className="underline">
          Blog
        </Link>
        {post.publishedAt
          ? ` · ${new Date(post.publishedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}`
          : ""}
      </p>
      {post.coverUrl ? (
        <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden bg-slate-50 my-6">
          {isRemoteOrDataImage(post.coverUrl) ? (
            <Image src={post.coverUrl} alt="" fill className="object-contain p-4" sizes="(max-width: 768px) 100vw, 800px" />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={post.coverUrl} alt="" className="w-full h-full object-contain p-4" />
          )}
        </div>
      ) : null}
      {post.excerpt ? <p className="text-lg text-[#333]">{post.excerpt}</p> : null}
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </MarketingShell>
  );
}
