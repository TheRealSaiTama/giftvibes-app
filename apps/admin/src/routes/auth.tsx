import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Gift, Loader2 } from "lucide-react";

export const Route = createFileRoute("/auth")({
  ssr: false,
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/dashboard", replace: true });
    });
  }, [navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "sign-up") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin + "/dashboard" },
        });
        if (error) throw error;
        toast.success("Account created — welcome in.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Signed in.");
      }
      navigate({ to: "/dashboard", replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between p-12 bg-surface border-r border-border-strong">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
            <Gift className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display text-lg font-semibold">GiftVibes Admin</span>
        </div>
        <div className="space-y-4">
          <h1 className="font-display text-4xl font-semibold tracking-tight leading-tight">
            Open the back of the shop.
          </h1>
          <p className="text-muted-foreground max-w-md">
            Every text, image, product and setting on your storefront — one calm,
            labeled panel. Sign in to keep the shelves tidy.
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          © GiftVibes · Internal tool
        </p>
      </div>

      <div className="flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-8 flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
              <Gift className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-lg font-semibold">GiftVibes Admin</span>
          </div>

          <h2 className="font-display text-2xl font-semibold">
            {mode === "sign-in" ? "Sign in" : "First-time setup"}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "sign-in"
              ? "Use the owner email and password."
              : "The very first person to sign up becomes the owner. After that, this form does nothing."}
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={busy} className="w-full">
              {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === "sign-in" ? "Sign in" : "Create owner account"}
            </Button>
          </form>

          <button
            type="button"
            onClick={() => setMode(mode === "sign-in" ? "sign-up" : "sign-in")}
            className="mt-6 text-sm text-muted-foreground hover:text-foreground transition"
          >
            {mode === "sign-in"
              ? "First time here? Create the owner account →"
              : "← Back to sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}
