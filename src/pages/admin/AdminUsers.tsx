import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { logAdminAction } from "@/lib/admin";
import { getPublicBadgesFromSettings, type PublicProfileBadge } from "@/lib/publicBadges";
import { toast } from "@/hooks/use-toast";
import { Search, Shield, ShieldOff, ExternalLink, EyeOff, Star } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type ProfileRow = {
  id: string;
  user_id: string;
  username: string | null;
  display_name: string | null;
  is_published: boolean;
  is_suspended?: boolean | null;
  created_at: string;
  settings?: Record<string, unknown> | null;
};

type RoleRow = { user_id: string; role: "admin" | "user" };
type UserBadgeRow = { id: string; profile_id: string; kind: string; tier: number; verified_at: string; xion_address: string };

const AdminUsers = () => {
  const [rows, setRows] = useState<ProfileRow[]>([]);
  const [roles, setRoles] = useState<Record<string, "admin" | "user">>({});
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [badgeViewer, setBadgeViewer] = useState<ProfileRow | null>(null);
  const [badgeRows, setBadgeRows] = useState<UserBadgeRow[]>([]);
  const [publicBadgeRows, setPublicBadgeRows] = useState<PublicProfileBadge[]>([]);

  const load = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("id, user_id, username, display_name, is_published, is_suspended, created_at, settings")
      .order("created_at", { ascending: false })
      .limit(500);
    setRows((data as ProfileRow[]) ?? []);
    const { data: r } = await supabase.from("user_roles").select("user_id, role");
    const map: Record<string, "admin" | "user"> = {};
    (r as RoleRow[] | null)?.forEach((x) => (map[x.user_id] = x.role));
    setRoles(map);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter(
      (r) =>
        (r.username ?? "").toLowerCase().includes(s) ||
        (r.display_name ?? "").toLowerCase().includes(s) ||
        r.user_id.toLowerCase().includes(s),
    );
  }, [rows, q]);

  const toggleAdmin = async (userId: string, currentlyAdmin: boolean) => {
    setBusy(userId);
    try {
      if (currentlyAdmin) {
        await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", "admin");
        await logAdminAction({ action: "role.revoke", targetType: "user", targetId: userId, details: { role: "admin" } });
      } else {
        await supabase.from("user_roles").insert({ user_id: userId, role: "admin" });
        await logAdminAction({ action: "role.grant", targetType: "user", targetId: userId, details: { role: "admin" } });
      }
      await load();
      toast({ title: "Role updated" });
    } catch (e: any) {
      toast({ title: "Failed", description: e.message, variant: "destructive" });
    } finally {
      setBusy(null);
    }
  };

  const toggleSuspend = async (row: ProfileRow) => {
    setBusy(row.user_id);
    try {
      const next = !row.is_suspended;
      await supabase.from("profiles").update({ is_suspended: next } as never).eq("id", row.id);
      await logAdminAction({
        action: "profile.suspend",
        targetType: "profile",
        targetId: row.id,
        details: { suspended: next },
      });
      await load();
    } finally {
      setBusy(null);
    }
  };

  const openBadges = async (row: ProfileRow) => {
    setBadgeViewer(row);
    const [{ data: walletData }, { data: profileData }] = await Promise.all([
      supabase
        .from("wallet_badges")
        .select("id, profile_id, kind, tier, verified_at, xion_address")
        .eq("profile_id", row.id)
        .order("verified_at", { ascending: false }),
      supabase.from("profiles").select("settings").eq("id", row.id).maybeSingle(),
    ]);
    setBadgeRows((walletData as UserBadgeRow[]) ?? []);
    const settings = (profileData?.settings ?? row.settings) as Record<string, unknown> | null;
    setPublicBadgeRows(getPublicBadgesFromSettings(settings).badges);
  };

  const removeBadge = async (badge: UserBadgeRow) => {
    const { data, error } = await supabase.from("wallet_badges").delete().eq("id", badge.id).select("id");

    if (error || !data || data.length === 0) {
      console.warn("Failed to remove badge", { badgeId: badge.id, error, deletedCount: data?.length ?? 0 });
      toast({
        title: "Failed to remove badge",
        description: "The badge was not removed. Please try again.",
        variant: "destructive",
      });
      return;
    }

    await logAdminAction({ action: "badge.remove", targetType: "badge", targetId: badge.id, details: { kind: badge.kind } });
    if (badgeViewer) await openBadges(badgeViewer);
  };

  const removePublicBadge = async (badge: PublicProfileBadge) => {
    if (!badgeViewer) return;
    const next = publicBadgeRows.filter((b) => b.id !== badge.id);
    const current = getPublicBadgesFromSettings(badgeViewer.settings);
    const merged = current.badges.filter((b) => b.id !== badge.id);
    const nextSettings = {
      ...(badgeViewer.settings ?? {}),
      xionidPublicBadges: {
        enabled: merged.some((b) => b.featured && !b.hidden),
        badges: merged,
      },
    };
    const { error } = await supabase.from("profiles").update({ settings: nextSettings as never }).eq("id", badgeViewer.id);
    if (error) {
      toast({ title: "Failed to update public badges", description: error.message, variant: "destructive" });
      return;
    }
    try {
      await logAdminAction({ action: "public_badge.remove", targetType: "profile", targetId: badgeViewer.id, details: { badgeId: badge.id, badgeKind: badge.kind } });
    } catch (err) {
      console.warn("Failed to log admin action", err);
    }
    setBadgeViewer({ ...badgeViewer, settings: nextSettings });
    setPublicBadgeRows(next);
    toast({ title: "Public badge removed" });
  };

  return (
    <AdminLayout title="Users" description="Search accounts, manage roles, suspend if needed.">
      <Card className="p-3">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search username, name, id…" className="pl-9" />
        </div>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-muted-foreground">
              <tr className="border-b">
                <th className="px-3 py-2">User</th>
                <th className="px-3 py-2">Username</th>
                <th className="px-3 py-2">Role</th>
                <th className="px-3 py-2">Profile</th>
                <th className="px-3 py-2">Joined</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>{/* unchanged rows/actions */}
              {filtered.map((r) => {
                const isAdmin = roles[r.user_id] === "admin";
                return (
                  <tr key={r.id} className="border-b last:border-0">
                    <td className="px-3 py-2"><div className="font-medium">{r.display_name ?? "—"}</div><div className="text-xs text-muted-foreground">{r.user_id.slice(0, 8)}…</div></td>
                    <td className="px-3 py-2">{r.username ? <Link className="inline-flex items-center gap-1 text-primary hover:underline" to={`/${r.username}`} target="_blank">@{r.username} <ExternalLink className="h-3 w-3" /></Link> : <span className="text-muted-foreground">—</span>}</td>
                    <td className="px-3 py-2"><Badge variant={isAdmin ? "default" : "secondary"}>{isAdmin ? "admin" : "user"}</Badge></td>
                    <td className="px-3 py-2">{r.is_suspended ? <Badge variant="destructive">suspended</Badge> : r.is_published ? <Badge variant="outline">published</Badge> : <Badge variant="secondary">draft</Badge>}</td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</td>
                    <td className="px-3 py-2"><div className="flex justify-end gap-2">
                      {isAdmin ? <AlertDialog><AlertDialogTrigger asChild><Button size="sm" variant="outline" disabled={busy === r.user_id}><ShieldOff className="mr-1 h-3.5 w-3.5" /> Revoke admin</Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Revoke admin access?</AlertDialogTitle><AlertDialogDescription>This user will lose admin access immediately.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => toggleAdmin(r.user_id, true)}>Revoke</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog> : <Button size="sm" variant="outline" disabled={busy === r.user_id} onClick={() => toggleAdmin(r.user_id, false)}><Shield className="mr-1 h-3.5 w-3.5" /> Make admin</Button>}
                      {r.is_suspended ? <Button size="sm" variant="default" disabled={busy === r.user_id} onClick={() => toggleSuspend(r)}>Unsuspend</Button> : <AlertDialog><AlertDialogTrigger asChild><Button size="sm" variant="outline" disabled={busy === r.user_id}>Suspend</Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Suspend this user?</AlertDialogTitle><AlertDialogDescription>The user profile will be marked suspended until manually reversed.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => toggleSuspend(r)}>Suspend</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>}
                      <Button size="sm" variant="outline" onClick={() => openBadges(r)}>View badges</Button>
                    </div></td>
                  </tr>
                );
              })}
              {filtered.length === 0 && <tr><td colSpan={6} className="px-3 py-8 text-center text-sm text-muted-foreground">No accounts found.</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>
      <Dialog open={!!badgeViewer} onOpenChange={(o) => !o && setBadgeViewer(null)}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Badges · {badgeViewer?.display_name ?? "Unknown"} {badgeViewer?.username ? `(@${badgeViewer.username})` : ""}
            </DialogTitle>
          </DialogHeader>
          <p className="text-xs text-muted-foreground">Demo-only badges stored only in a user&apos;s browser cannot be viewed here unless they were saved to the public profile.</p>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Verified badge records ({badgeRows.length})</h3>
            {badgeRows.length === 0 ? <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">No verified badge records.</div> : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {badgeRows.map((b) => (
                  <Card key={b.id} className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-medium">{b.kind}</div>
                        <div className="text-xs text-muted-foreground">Tier {b.tier}</div>
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild><Button size="sm" variant="outline">Remove</Button></AlertDialogTrigger>
                        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Remove verified badge?</AlertDialogTitle><AlertDialogDescription>This removes the verified badge record for this user.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => removeBadge(b)}>Remove</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
                      </AlertDialog>
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">Verified: {new Date(b.verified_at).toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">Source: {b.xion_address}</div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-3 mt-4">
            <h3 className="text-sm font-semibold">Public profile badges ({publicBadgeRows.length})</h3>
            {publicBadgeRows.length === 0 ? <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">No public profile badges.</div> : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {publicBadgeRows.map((b) => (
                  <Card key={b.id} className="p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-medium">{b.emoji} {b.label}</div>
                        <div className="text-xs text-muted-foreground">{b.kind} · {b.category} · {b.tierName}</div>
                      </div>
                      <div className="flex gap-1">
                        {b.featured && <Badge variant="secondary"><Star className="h-3 w-3 mr-1"/>Featured</Badge>}
                        {b.hidden && <Badge variant="outline"><EyeOff className="h-3 w-3 mr-1"/>Hidden</Badge>}
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">Verified: {new Date(b.verifiedAt).toLocaleString()}</div>
                    <div className="mt-2 text-right">
                      <AlertDialog>
                        <AlertDialogTrigger asChild><Button size="sm" variant="outline">Remove from public profile</Button></AlertDialogTrigger>
                        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Remove public badge?</AlertDialogTitle><AlertDialogDescription>This removes the badge from the user&apos;s public profile badges only.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => removePublicBadge(b)}>Remove</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminUsers;
