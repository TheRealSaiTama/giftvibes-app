import { prisma } from "@/lib/prisma";

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
  updatedAt: string;
};

function parseContent(content: unknown) {
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

function rowToPost(row: {
  id: string;
  sectionKey: string;
  title: string | null;
  enabled: boolean;
  content: unknown;
  updatedAt: Date;
}): BlogPost | null {
  const slug = (row.sectionKey || "").trim();
  if (!slug) return null;
  const parsed = parseContent(row.content);
  return {
    id: row.id,
    slug,
    title: (row.title || "").trim() || slug,
    enabled: row.enabled,
    updatedAt: row.updatedAt.toISOString(),
    ...parsed,
    publishedAt: parsed.publishedAt || row.updatedAt.toISOString(),
  };
}

export async function getPublishedPosts(): Promise<BlogPost[]> {
  try {
    const rows = await prisma.pageSection.findMany({
      where: { pageKey: BLOG_PAGE_KEY, enabled: true },
      orderBy: { sortOrder: "desc" },
    });
    return rows
      .map(rowToPost)
      .filter((p): p is BlogPost => !!p && p.body.trim().length + p.excerpt.trim().length > 0);
  } catch (e) {
    console.error("getPublishedPosts failed", e);
    return [];
  }
}

export async function getPublishedPost(slug: string): Promise<BlogPost | null> {
  const key = slug.trim();
  if (!key) return null;
  try {
    const row = await prisma.pageSection.findFirst({
      where: { pageKey: BLOG_PAGE_KEY, sectionKey: key, enabled: true },
    });
    if (!row) return null;
    return rowToPost(row);
  } catch (e) {
    console.error("getPublishedPost failed", e);
    return null;
  }
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function inline(s: string) {
  let out = escapeHtml(s);
  out = out.replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+|\/[^)\s]*)\)/g, '<a href="$2">$1</a>');
  out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  return out;
}

/** Small markdown subset: headings, lists, paragraphs, bold, links. Body is escaped first. */
export function renderBlogHtml(src: string): string {
  const lines = (src || "").replace(/\r\n/g, "\n").split("\n");
  const out: string[] = [];
  let para: string[] = [];
  let list: string[] = [];
  const flushP = () => {
    if (!para.length) return;
    out.push(`<p>${inline(para.join(" "))}</p>`);
    para = [];
  };
  const flushL = () => {
    if (!list.length) return;
    out.push(`<ul>${list.map((li) => `<li>${inline(li)}</li>`).join("")}</ul>`);
    list = [];
  };
  for (const raw of lines) {
    const line = raw.trimEnd();
    const trimmed = line.trim();
    if (!trimmed) {
      flushP();
      flushL();
      continue;
    }
    if (trimmed.startsWith("### ")) {
      flushP();
      flushL();
      out.push(`<h3>${inline(trimmed.slice(4))}</h3>`);
      continue;
    }
    if (trimmed.startsWith("## ")) {
      flushP();
      flushL();
      out.push(`<h2>${inline(trimmed.slice(3))}</h2>`);
      continue;
    }
    if (trimmed.startsWith("# ")) {
      flushP();
      flushL();
      out.push(`<h2>${inline(trimmed.slice(2))}</h2>`);
      continue;
    }
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      flushP();
      list.push(trimmed.slice(2));
      continue;
    }
    flushL();
    para.push(trimmed);
  }
  flushP();
  flushL();
  return out.join("\n");
}
