import type { ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  LayoutDashboard,
  FileText,
  Package,
  BookText,
  Images,
  Settings,
  Search,
  Compass,
  ExternalLink,
  LogOut,
  Gift,
  ChevronRight,
  Home,
  ShoppingBag,
  Sparkles,
  Link2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

type NavItem = {
  label: string;
  to: string;
  icon: typeof LayoutDashboard;
  end?: boolean;
};

type NavGroup = { heading: string; items: NavItem[] };

const NAV: NavGroup[] = [
  {
    heading: "Overview",
    items: [{ label: "Dashboard", to: "/dashboard", icon: LayoutDashboard, end: true }],
  },
  {
    heading: "Pages",
    items: [
      { label: "Home page", to: "/pages/home", icon: Home },
      { label: "Shop page", to: "/pages/shop", icon: ShoppingBag },
      { label: "Product template", to: "/pages/product", icon: FileText },
      { label: "Custom design", to: "/pages/custom-design", icon: Sparkles },
    ],
  },
  {
    heading: "Catalog",
    items: [
      { label: "Products", to: "/products", icon: Package },
      { label: "Diaries", to: "/diaries", icon: BookText },
    ],
  },
  {
    heading: "Site",
    items: [
      { label: "Media library", to: "/media", icon: Images },
      { label: "Global settings", to: "/settings", icon: Settings },
      { label: "SEO", to: "/seo", icon: Search },
      { label: "Navigation & footer", to: "/nav", icon: Link2 },
      { label: "Integration", to: "/integration", icon: Compass },
    ],
  },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: userEmail } = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const { data } = await supabase.auth.getUser();
      return data.user?.email ?? "";
    },
    staleTime: 60_000,
  });

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/auth", replace: true });
  }

  const crumbs = buildBreadcrumbs(pathname);

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-border-strong bg-sidebar">
        <div className="h-16 flex items-center gap-2 px-5 border-b border-border-strong">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <Gift className="h-4 w-4 text-primary-foreground" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-display font-semibold text-sm">GiftVibe</span>
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Admin
            </span>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
          {NAV.map((group) => (
            <div key={group.heading}>
              <p className="px-2 mb-1.5 text-[10px] uppercase tracking-widest font-medium text-muted-foreground">
                {group.heading}
              </p>
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const active = item.end
                    ? pathname === item.to
                    : pathname === item.to || pathname.startsWith(item.to + "/");
                  const Icon = item.icon;
                  return (
                    <li key={item.to}>
                      <Link
                        to={item.to}
                        className={
                          "group flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm transition-colors " +
                          (active
                            ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                            : "text-foreground/75 hover:bg-surface-2 hover:text-foreground")
                        }
                      >
                        <Icon
                          className={
                            "h-4 w-4 " +
                            (active ? "text-primary" : "text-muted-foreground group-hover:text-foreground")
                          }
                        />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
        <div className="p-3 border-t border-border-strong">
          <a
            href="/"
            className="flex items-center justify-between text-xs text-muted-foreground hover:text-foreground rounded-md px-2 py-2 hover:bg-surface-2 transition"
          >
            <span>View storefront</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-border bg-background/95 backdrop-blur sticky top-0 z-30">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground min-w-0">
            {crumbs.map((c, i) => (
              <span key={c.to + i} className="flex items-center gap-1.5 truncate">
                {i > 0 && <ChevronRight className="h-3.5 w-3.5 shrink-0" />}
                {i === crumbs.length - 1 ? (
                  <span className="text-foreground font-medium truncate">{c.label}</span>
                ) : (
                  <Link to={c.to} className="hover:text-foreground truncate">
                    {c.label}
                  </Link>
                )}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <a href="/" target="_blank" rel="noreferrer">
                <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                View site
              </a>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="h-9 w-9 rounded-full bg-surface-2 border border-border flex items-center justify-center text-xs font-medium hover:bg-primary-soft transition">
                  {(userEmail || "?").slice(0, 2).toUpperCase()}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="text-xs text-muted-foreground">Signed in as</div>
                  <div className="truncate text-sm">{userEmail}</div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut} className="text-destructive">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto p-6 lg:p-10">{children}</div>
        </main>
      </div>
    </div>
  );
}

function buildBreadcrumbs(pathname: string): { label: string; to: string }[] {
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length === 0) return [{ label: "Dashboard", to: "/dashboard" }];
  const crumbs: { label: string; to: string }[] = [];
  let acc = "";
  for (const part of parts) {
    acc += "/" + part;
    crumbs.push({ label: prettify(part), to: acc });
  }
  return crumbs;
}

function prettify(seg: string) {
  return seg
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function SaveBar({
  dirty,
  onSave,
  onDiscard,
  saving,
}: {
  dirty: boolean;
  onSave: () => void;
  onDiscard: () => void;
  saving?: boolean;
}) {
  if (!dirty) return null;
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 bg-foreground text-background rounded-full pl-5 pr-2 py-2 shadow-lift animate-in fade-in slide-in-from-bottom-4 duration-200">
      <span className="text-sm">Unsaved changes</span>
      <Button size="sm" variant="ghost" onClick={onDiscard} className="text-background/80 hover:text-background hover:bg-white/10 h-8">
        Discard
      </Button>
      <Button size="sm" onClick={onSave} disabled={saving} className="h-8 bg-primary hover:bg-primary/90 rounded-full">
        {saving ? "Saving…" : "Save changes"}
      </Button>
    </div>
  );
}

export function PageHeader({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">{title}</h1>
        {description && (
          <p className="mt-1.5 text-sm text-muted-foreground max-w-2xl">{description}</p>
        )}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}
