import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/admin/admin-shell";
import { saveBlogPost, deleteBlogPost } from "@/lib/admin.functions";
import {
  type BlogPost,
  slugifyBlog,
  buildBlogKeywords,
  rowToPost,
} from "@/lib/blog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { MediaPicker } from "@/components/admin/media-picker";
import { Plus, Pencil, Trash2, Search, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/blog")({
  component: BlogPage,
});

const empty: BlogPost = {
  id: "",
  slug: "",
  title: "",
  excerpt: "",
  body: "",
  coverUrl: "",
  seoTitle: "",
  seoDescription: "",
  seoKeywords: "",
  publishedAt: "",
  enabled: true,
};

function BlogPage() {
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery<BlogPost[]>({
    queryKey: ["blog-admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("page_sections")
        .select("id, section_key, title, enabled, content, updated_at")
        .eq("page_key", "blog")
        .order("sort_order", { ascending: false });
      if (error) throw error;
      return (data || []).map(rowToPost).filter((p): p is BlogPost => !!p);
    },
  });

  const filtered = (data ?? []).filter(
    (p) =>
      !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.slug.toLowerCase().includes(search.toLowerCase()) ||
      p.seoKeywords.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div>
      <PageHeader
        title="Blog"
        description="Articles on giftvibes.in/blog. Isolated from Products — this does not move catalogue items. Write for buyers (bulk, print, bank/tender), not generic gift-idea lists."
      >
        <Button onClick={() => setEditing({ ...empty, publishedAt: new Date().toISOString() })}>
          <Plus className="h-4 w-4 mr-1.5" />
          New article
        </Button>
      </PageHeader>

      <div className="flex items-center gap-2 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search articles"
            className="pl-8"
          />
        </div>
        <span className="text-xs text-muted-foreground ml-auto">{filtered.length} articles</span>
      </div>

      <div className="gv-panel overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface border-b border-border">
            <tr>
              <th className="text-left px-4 py-2.5 font-medium">Title</th>
              <th className="text-left px-4 py-2.5 font-medium hidden md:table-cell">Slug</th>
              <th className="text-left px-4 py-2.5 font-medium hidden lg:table-cell">Status</th>
              <th className="w-24" />
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                  Loading…
                </td>
              </tr>
            )}
            {!isLoading && filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                  No articles yet. New article → write (or paste an AI draft) → Live on site.
                </td>
              </tr>
            )}
            {filtered.map((p) => (
              <tr key={p.id} className="border-t border-border hover:bg-surface/50">
                <td className="px-4 py-3">
                  <div className="font-medium">{p.title}</div>
                  {p.excerpt ? (
                    <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{p.excerpt}</div>
                  ) : null}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground hidden md:table-cell">
                  /blog/{p.slug}
                </td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  <span
                    className={
                      "text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded border " +
                      (p.enabled
                        ? "bg-primary/10 text-primary border-primary/20"
                        : "bg-surface text-muted-foreground border-border")
                    }
                  >
                    {p.enabled ? "Live" : "Draft"}
                  </span>
                </td>
                <td className="px-2 py-2 text-right">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setEditing(p)}
                    aria-label={`Edit ${p.title}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Sheet open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <SheetContent className="sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{editing?.id ? "Edit article" : "New article"}</SheetTitle>
          </SheetHeader>
          {editing && (
            <BlogForm
              post={editing}
              onClose={() => setEditing(null)}
              onSaved={() => {
                qc.invalidateQueries({ queryKey: ["blog-admin"] });
                setEditing(null);
              }}
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function BlogForm({
  post,
  onClose,
  onSaved,
}: {
  post: BlogPost;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [v, setV] = useState<BlogPost>(post);
  const [saving, setSaving] = useState(false);
  const runSave = useServerFn(saveBlogPost);
  const runDelete = useServerFn(deleteBlogPost);
  const slugTouched = useRef(!!post.slug);
  const seoTitleTouched = useRef(!!post.seoTitle);
  const seoKwTouched = useRef(!!post.seoKeywords);

  useEffect(() => {
    if (slugTouched.current) return;
    const auto = slugifyBlog(v.title);
    setV((prev) => (prev.slug === auto ? prev : { ...prev, slug: auto }));
  }, [v.title]);
  useEffect(() => {
    if (seoTitleTouched.current) return;
    const auto = v.title ? `${v.title} | GiftVibes` : "";
    setV((prev) => (prev.seoTitle === auto ? prev : { ...prev, seoTitle: auto }));
  }, [v.title]);
  useEffect(() => {
    if (seoKwTouched.current) return;
    const auto = buildBlogKeywords(v.title);
    setV((prev) => (prev.seoKeywords === auto ? prev : { ...prev, seoKeywords: auto }));
  }, [v.title]);

  const s = <K extends keyof BlogPost>(k: K, val: BlogPost[K]) => setV((p) => ({ ...p, [k]: val }));

  async function handleSave() {
    if (!v.title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (v.enabled && !v.body.trim()) {
      toast.error("Live articles need a body");
      return;
    }
    setSaving(true);
    try {
      await runSave({
        data: {
          id: post.id || undefined,
          values: {
            slug: v.slug || slugifyBlog(v.title),
            title: v.title.trim(),
            excerpt: v.excerpt,
            body: v.body,
            coverUrl: v.coverUrl || null,
            seoTitle: v.seoTitle || null,
            seoDescription: v.seoDescription || null,
            seoKeywords: v.seoKeywords || null,
            publishedAt: v.publishedAt || new Date().toISOString(),
            enabled: v.enabled,
          },
        },
      });
      toast.success("Saved");
      onSaved();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!post.id) return onClose();
    if (!confirm(`Delete "${post.title}"? This cannot be undone.`)) return;
    try {
      await runDelete({ data: { id: post.id } });
      toast.success("Deleted");
      onSaved();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Delete failed");
    }
  }

  return (
    <div className="space-y-5 pt-5">
      <div>
        <Label>Title</Label>
        <Input value={v.title} onChange={(e) => s("title", e.target.value)} className="mt-1.5" />
      </div>
      <div>
        <Label>URL slug</Label>
        <Input
          value={v.slug}
          onChange={(e) => {
            slugTouched.current = true;
            s("slug", e.target.value);
          }}
          className="mt-1.5 font-mono text-sm"
        />
        <p className="text-[10px] text-muted-foreground mt-1">giftvibes.in/blog/{v.slug || "…"}</p>
      </div>
      <div>
        <Label>Excerpt</Label>
        <Textarea
          rows={2}
          value={v.excerpt}
          onChange={(e) => s("excerpt", e.target.value)}
          placeholder="One or two lines for the blog list and Google snippet."
          className="mt-1.5"
        />
      </div>
      <div>
        <Label>Body</Label>
        <p className="text-xs text-muted-foreground mt-0.5 mb-1.5">
          Paste an AI draft here, then edit. Use ## heading, - bullets, **bold**, [text](/shop) links.
        </p>
        <Textarea
          rows={14}
          value={v.body}
          onChange={(e) => s("body", e.target.value)}
          className="mt-0 font-mono text-sm"
        />
      </div>
      <div>
        <Label>Cover image</Label>
        <div className="mt-1.5">
          <MediaPicker value={v.coverUrl} onChange={(url) => s("coverUrl", url || "")} />
        </div>
      </div>
      <div className="space-y-3 rounded-md border border-border p-3">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">SEO</p>
        <div>
          <Label className="text-xs">SEO title</Label>
          <Input
            value={v.seoTitle}
            onChange={(e) => {
              seoTitleTouched.current = true;
              s("seoTitle", e.target.value);
            }}
            maxLength={70}
            className="mt-1.5"
          />
        </div>
        <div>
          <Label className="text-xs">SEO description</Label>
          <Textarea
            rows={2}
            value={v.seoDescription}
            onChange={(e) => s("seoDescription", e.target.value)}
            className="mt-1.5"
          />
        </div>
        <div>
          <Label className="text-xs">SEO keywords</Label>
          <Textarea
            rows={2}
            value={v.seoKeywords}
            onChange={(e) => {
              seoKwTouched.current = true;
              s("seoKeywords", e.target.value);
            }}
            placeholder="SBI diary bulk, corporate diary manufacturer Delhi…"
            className="mt-1.5"
          />
          <p className="text-[10px] text-muted-foreground mt-1">
            Auto-filled from the title. Comma-separated. Aim at buyer searches, not “gift ideas”.
          </p>
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
        <Switch checked={v.enabled} onCheckedChange={(on) => s("enabled", on)} />
        Live on site
      </label>
      <div className="flex items-center justify-between pt-4 border-t border-border">
        {post.id ? (
          <Button variant="ghost" onClick={handleDelete} className="text-destructive hover:text-destructive">
            <Trash2 className="h-4 w-4 mr-1.5" /> Delete
          </Button>
        ) : (
          <span />
        )}
        <div className="flex items-center gap-2">
          {post.id && v.enabled && v.slug ? (
            <Button variant="ghost" size="sm" asChild>
              <a href={`https://www.giftvibes.in/blog/${v.slug}`} target="_blank" rel="noreferrer">
                <ExternalLink className="h-3.5 w-3.5 mr-1" />
                View
              </a>
            </Button>
          ) : null}
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || !v.title}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );
}
