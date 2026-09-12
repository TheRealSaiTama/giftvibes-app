/** Blog posts live in page_sections (page_key=blog). Isolated from catalog/folders. */

export const BLOG_PAGE_KEY = "blog";

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  coverUrl: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  publishedAt: string;
  enabled: boolean;
};

export function slugifyBlog(s: string) {
  return s
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function buildBlogKeywords(title: string) {
  const bits = [title, "GiftVibes", "corporate diaries", "Delhi manufacturer", "bulk order", "wholesale"]
    .map((s) => s.trim())
    .filter(Boolean);
  return [...new Set(bits)].join(", ");
}

export function parseBlogContent(content: unknown): {
  excerpt: string;
  body: string;
  coverUrl: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  publishedAt: string;
} {
  const c = content && typeof content === "object" ? (content as Record<string, unknown>) : {};
  const str = (k: string) => (typeof c[k] === "string" ? (c[k] as string) : "");
  return {
    excerpt: str("excerpt"),
    body: str("body"),
    coverUrl: str("coverUrl"),
    seoTitle: str("seoTitle"),
    seoDescription: str("seoDescription"),
    seoKeywords: str("seoKeywords"),
    publishedAt: str("publishedAt"),
  };
}

export function rowToPost(row: {
  id: string;
  section_key?: string;
  sectionKey?: string;
  title?: string | null;
  enabled?: boolean;
  content?: unknown;
  updated_at?: string;
}): BlogPost | null {
  const slug = String(row.section_key || row.sectionKey || "").trim();
  if (!slug) return null;
  const parsed = parseBlogContent(row.content);
  return {
    id: row.id,
    slug,
    title: (row.title || "").trim() || slug,
    enabled: row.enabled !== false,
    ...parsed,
    publishedAt: parsed.publishedAt || row.updated_at || new Date().toISOString(),
  };
}
