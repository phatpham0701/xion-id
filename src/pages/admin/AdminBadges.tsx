import { useEffect, useMemo, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { logAdminAction } from "@/lib/admin";
import { toast } from "@/hooks/use-toast";
import { Plus, Trash2, Search } from "lucide-react";

type BadgeRow = {
  id: string;
  profile_id: string;
  xion_address: string;
  kind: string;
  tier: number;
  verified_at: string;
  metadata: any;
};
type ProfileLite = { id: string; username: string | null; display_name: string | null };

const KINDS = [
  "og_2024",
  "og_2025",
  "nft_collector",
  "nft_minter",
  "tipper",
  "dapp_explorer",
  "campaign_participant",
  "contest_winner",
  "whale",
  "early_adopter",
];

const AdminBadges = () => {
  const [rows, setRows] = useState<BadgeRow[]>([]);
  const [profiles, setProfiles] = useState<Record<string, ProfileLite>>({});
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState({ profile_id: "", kind: "og_2024", tier: 1, xion_address: "" });

  const load = async () => {
    const { data } = await supabase
      .from("wallet_badges")
      .select("id, profile_id, xion_address, kind, tier, verified_at, metadata")
      .order("verified_at", { ascending: false })
      .limit(500);
    setRows((data as BadgeRow[]) ?? []);
    const ids = Array.from(new Set((data ?? []).map((b: any) => b.profile_id)));
    if (ids.length) {
      const { data: ps } = await supabase.from("profiles").select("id, username, display_name").in("id", ids);
      const map: Record<string, ProfileLite> = {};
      (ps as ProfileLite[] | null)?.forEach((p) => (map[p.id] = p));
      setProfiles(map);
    }
  };
  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter((r) => r.kind.includes(s) || (profiles[r.profile_id]?.username ?? "").toLowerCase().includes(s));
  }, [rows, q, profiles]);

  const issue = async () => {
    if (!draft.profile_id) {
      toast({ title: "Profile id required", variant: "destructive" });
      return;
    }
    const { data, error } = await supabase
      .from("wallet_badges")
      .insert({
        profile_id: draft.profile_id,
        kind: draft.kind as never,
        tier: draft.tier,
        xion_address: draft.xion_address || "demo",
        metadata: { issued_by: "admin" } as never,
      })
      .select("id")
      .maybeSingle();
    if (error) {
      toast({ title: "Failed", description: error.message, variant: "destructive" });
      return;
    }
    await logAdminAction({ action: "badge.issue", targetType: "badge", targetId: data?.id, details: draft as never });
    toast({ title: "Badge issued" });
    setOpen(false);
    load();
  };

  const remove = async (r: BadgeRow) => {
    const { error } = await supabase.from("wallet_badges").delete().eq("id", r.id);
    if (error) {
      toast({ title: "Failed", description: error.message, variant: "destructive" });
      return;
    }
    await logAdminAction({ action: "badge.remove", targetType: "badge", targetId: r.id, details: { kind: r.kind } });
    load();
  };

  return (
    <AdminLayout title="Badges" description="Issue and remove signal badges across user profiles.">
      <Card className="p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by kind or @username" className="pl-9" />
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="mr-1 h-4 w-4" /> Issue badge</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Issue demo badge</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label>Profile ID</Label>
                  <Input value={draft.profile_id} onChange={(e) => setDraft({ ...draft, profile_id: e.target.value })} placeholder="profiles.id (uuid)" />
                </div>
                <div>
                  <Label>Kind</Label>
                  <Select value={draft.kind} onValueChange={(v) => setDraft({ ...draft, kind: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {KINDS.map((k) => <SelectItem key={k} value={k}>{k}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Tier</Label>
                    <Input type="number" min={1} max={3} value={draft.tier} onChange={(e) => setDraft({ ...draft, tier: Number(e.target.value) || 1 })} />
                  </div>
                  <div>
                    <Label>XION address (optional)</Label>
                    <Input value={draft.xion_address} onChange={(e) => setDraft({ ...draft, xion_address: e.target.value })} />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={issue}>Issue</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-muted-foreground">
              <tr className="border-b">
                <th className="px-3 py-2">Owner</th>
                <th className="px-3 py-2">Kind</th>
                <th className="px-3 py-2">Tier</th>
                <th className="px-3 py-2">Verified</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const p = profiles[r.profile_id];
                return (
                  <tr key={r.id} className="border-b last:border-0">
                    <td className="px-3 py-2">
                      <div className="font-medium">{p?.display_name ?? "—"}</div>
                      <div className="text-xs text-muted-foreground">{p?.username ? `@${p.username}` : r.profile_id.slice(0, 8)}</div>
                    </td>
                    <td className="px-3 py-2"><Badge variant="outline">{r.kind}</Badge></td>
                    <td className="px-3 py-2">{r.tier}</td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">{new Date(r.verified_at).toLocaleDateString()}</td>
                    <td className="px-3 py-2 text-right">
                      <Button size="sm" variant="outline" onClick={() => remove(r)}>
                        <Trash2 className="mr-1 h-3.5 w-3.5" /> Remove
                      </Button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="px-3 py-8 text-center text-sm text-muted-foreground">No badges.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </AdminLayout>
  );
};

export default AdminBadges;
