import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/admin/admin-shell";
import { saveNavLinks } from "@/lib/admin.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/nav")({
  component: NavPage,
});

const GROUPS = [
  { key: "header", label: "Header navigation" },
  { key: "footer_shop", label: "Footer — Shop" },
  { key: "footer_company", label: "Footer — Company" },
  { key: "footer_support", label: "Footer — Support" },
];

type Link = { id?: string; group_key: string; label: string; href: string; sort_order: number; enabled: boolean; _new?: boolean };

function NavPage() {
  return (
    <div>
      <PageHeader title="Navigation & footer" description="Links shown in the header nav and each footer column." />
      <div className="space-y-4">
        {GROUPS.map((g) => <GroupEditor key={g.key} groupKey={g.key} label={g.label} />)}
      </div>
    </div>
  );
}

function GroupEditor({ groupKey, label }: { groupKey: string; label: string }) {
  const qc = useQueryClient();
  const runSave = useServerFn(saveNavLinks);
  const { data } = useQuery<Link[]>({
    queryKey: ["nav", groupKey],
    queryFn: async () => {
      const { data, error } = await supabase.from("nav_links").select("*").eq("group_key", groupKey).order("sort_order");
      if (error) throw error;
      return data as Link[];
    },
  });

  const [items, setItems] = useState<Link[]>([]);
  const [deleted, setDeleted] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (data) { setItems(data); setDeleted([]); } }, [data]);

  function update(i: number, patch: Partial<Link>) {
    setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  }
  function remove(i: number) {
    const target = items[i];
    if (target.id) setDeleted((d) => [...d, target.id!]);
    setItems((prev) => prev.filter((_, idx) => idx !== i));
  }
  function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    setItems(next.map((it, idx) => ({ ...it, sort_order: idx })));
  }
  function add() {
    setItems((prev) => [...prev, { group_key: groupKey, label: "New link", href: "/", sort_order: prev.length, enabled: true, _new: true }]);
  }

  async function save() {
    setSaving(true);
    try {
      await runSave({
        data: {
          group_key: groupKey,
          links: items.map((it, i) => ({
            id: it.id, group_key: groupKey, label: it.label, href: it.href, sort_order: i, enabled: it.enabled,
          })),
          deleted_ids: deleted,
        },
      });
      toast.success(`${label} saved`);
      qc.invalidateQueries({ queryKey: ["nav", groupKey] });
    } catch (e) { toast.error(e instanceof Error ? e.message : "Save failed"); }
    finally { setSaving(false); }
  }

  return (
    <div className="gv-panel p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-medium">{label}</h3>
        <Button size="sm" variant="outline" onClick={add}><Plus className="h-3.5 w-3.5 mr-1" />Add link</Button>
      </div>
      <div className="space-y-2">
        {items.map((it, i) => (
          <div key={it.id ?? `new-${i}`} className="grid grid-cols-[auto_1fr_1fr_auto_auto] gap-2 items-center">
            <div className="flex flex-col">
              <button onClick={() => move(i, -1)} className="h-4 hover:text-primary" disabled={i === 0}><ArrowUp className="h-3 w-3" /></button>
              <button onClick={() => move(i, 1)} className="h-4 hover:text-primary" disabled={i === items.length - 1}><ArrowDown className="h-3 w-3" /></button>
            </div>
            <Input value={it.label} onChange={(e) => update(i, { label: e.target.value })} placeholder="Label" />
            <Input value={it.href} onChange={(e) => update(i, { href: e.target.value })} placeholder="/href" className="font-mono text-xs" />
            <Switch checked={it.enabled} onCheckedChange={(v) => update(i, { enabled: v })} />
            <Button variant="ghost" size="icon" onClick={() => remove(i)}><Trash2 className="h-4 w-4" /></Button>
          </div>
        ))}
      </div>
      <div className="mt-4 flex justify-end"><Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Save changes"}</Button></div>
    </div>
  );
}
