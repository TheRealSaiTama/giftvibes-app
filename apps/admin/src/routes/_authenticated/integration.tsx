import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Copy } from "lucide-react";

export const Route = createFileRoute("/_authenticated/integration")({
  component: IntegrationPage,
});

const ORIGIN_HINT =
  typeof window !== "undefined" ? window.location.origin : "https://your-admin.lovable.app";

function IntegrationPage() {
  const base = `${ORIGIN_HINT}/api/public/content`;

  const snippets: { label: string; url: string; note: string }[] = [
    { label: "Site settings (brand, WhatsApp, contact, socials)", url: `${base}/site-settings`, note: "Use once, cache; feed footer, header, contact widgets." },
    { label: "Home page (all sections + SEO)", url: `${base}/page/home`, note: "Returns { sections: [...], seo }. Sections come pre-ordered." },
    { label: "Shop page", url: `${base}/page/shop`, note: "" },
    { label: "Product page template copy", url: `${base}/page/product`, note: "" },
    { label: "Custom design page", url: `${base}/page/custom-design`, note: "" },
    { label: "Header + footer nav links", url: `${base}/nav`, note: "Grouped by header / footer_shop / footer_company / footer_support." },
    { label: "Products list", url: `${ORIGIN_HINT}/api/public/products`, note: "?category=&limit= optional." },
    { label: "Single product", url: `${ORIGIN_HINT}/api/public/products/{slug}`, note: "" },
    { label: "Diaries list", url: `${ORIGIN_HINT}/api/public/diaries`, note: "" },
  ];

  const example = `// Next.js — src/app/page.tsx
async function getHome() {
  const res = await fetch("${base}/page/home", { next: { revalidate: 60 } });
  if (!res.ok) throw new Error("failed");
  return res.json();
}

export default async function HomePage() {
  const { sections } = await getHome();
  const hero = sections.find((s: any) => s.section_key === "hero")?.content;

  return (
    <section>
      <p className="eyebrow">{hero?.eyebrow}</p>
      <h1>{hero?.heading}</h1>
      <p>{hero?.subheading}</p>
      <a href={hero?.primary_cta?.href}>{hero?.primary_cta?.label}</a>
    </section>
  );
}`;

  function copy(text: string) {
    navigator.clipboard.writeText(text);
    toast.success("Copied");
  }

  return (
    <div>
      <PageHeader
        title="Connect the storefront"
        description="Copy these endpoints into the Next.js site. They're public, JSON-only, CORS-open, cached for 60 s at the edge. All endpoints return only enabled content."
      />

      <div className="gv-panel p-6 mb-6">
        <h3 className="font-display font-medium mb-2">1 · Available endpoints</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Paste any of these into a Next.js server component with <code className="font-mono text-xs bg-surface px-1.5 py-0.5 rounded">fetch(url, {"{"} next: {"{"} revalidate: 60 {"}"} {"}"})</code>.
        </p>
        <div className="space-y-2">
          {snippets.map((s) => (
            <div key={s.url} className="flex items-center gap-3 border-b border-border last:border-0 py-2">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">{s.label}</div>
                <code className="text-xs font-mono text-muted-foreground truncate block">{s.url}</code>
                {s.note && <div className="text-xs text-muted-foreground mt-0.5">{s.note}</div>}
              </div>
              <Button size="sm" variant="ghost" onClick={() => copy(s.url)}>
                <Copy className="h-3.5 w-3.5 mr-1.5" /> Copy
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="gv-panel p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display font-medium">2 · Drop-in Next.js example</h3>
          <Button size="sm" variant="ghost" onClick={() => copy(example)}>
            <Copy className="h-3.5 w-3.5 mr-1.5" /> Copy code
          </Button>
        </div>
        <pre className="text-xs font-mono bg-surface border border-border rounded-md p-4 overflow-x-auto leading-relaxed">
          {example}
        </pre>
        <p className="text-xs text-muted-foreground mt-3">
          Replace hardcoded strings in each <code className="font-mono">src/components/sections/*.tsx</code> with these <code className="font-mono">hero</code>, <code className="font-mono">categories</code>, etc. objects. The response shape mirrors the JSONB you edit under Pages.
        </p>
      </div>
    </div>
  );
}
