import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { logAdminAction } from "@/lib/admin";
import { toast } from "@/hooks/use-toast";
import { Search, Shield, ShieldOff, ExternalLink } from "lucide-react";
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

  const load = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("id, user_id, username, display_name, is_published, is_suspended, created_at")
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
    const { data } = await supabase
      .from("wallet_badges")
      .select("id, profile_id, kind, tier, verified_at, xion_address")
      .eq("profile_id", row.id)
      .order("verified_at", { ascending: false });
    setBadgeRows((data as UserBadgeRow[]) ?? []);
  };

  const removeBadge = async (badge: UserBadgeRow) => {
    await supabase.from("wallet_badges").delete().eq("id", badge.id);
    await logAdminAction({ action: "badge.remove", targetType: "badge", targetId: badge.id, details: { kind: badge.kind } });
    if (badgeViewer) await openBadges(badgeViewer);
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
            <tbody>
              {filtered.map((r) => {
                const isAdmin = roles[r.user_id] === "admin";
                return (
                  <tr key={r.id} className="border-b last:border-0">
                    <td className="px-3 py-2">
                      <div className="font-medium">{r.display_name ?? "—"}</div>
                      <div className="text-xs text-muted-foreground">{r.user_id.slice(0, 8)}…</div>
                    </td>
                    <td className="px-3 py-2">
                      {r.username ? (
                        <Link className="inline-flex items-center gap-1 text-primary hover:underline" to={`/${r.username}`} target="_blank">
                          @{r.username} <ExternalLink className="h-3 w-3" />
                        </Link>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <Badge variant={isAdmin ? "default" : "secondary"}>{isAdmin ? "admin" : "user"}</Badge>
                    </td>
                    <td className="px-3 py-2">
                      {r.is_suspended ? (
                        <Badge variant="destructive">suspended</Badge>
                      ) : r.is_published ? (
                        <Badge variant="outline">published</Badge>
                      ) : (
                        <Badge variant="secondary">draft</Badge>
                      )}
                    </td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">
                      {new Date(r.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex justify-end gap-2">
                        {isAdmin ? (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="outline" disabled={busy === r.user_id}>
                                <ShieldOff className="mr-1 h-3.5 w-3.5" /> Revoke admin
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Revoke admin access?</AlertDialogTitle>
                                <AlertDialogDescription>This user will lose admin access immediately.</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => toggleAdmin(r.user_id, true)}>Revoke</AlertDialogAction></AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        ) : (
                          <Button size="sm" variant="outline" disabled={busy === r.user_id} onClick={() => toggleAdmin(r.user_id, false)}>
                            <Shield className="mr-1 h-3.5 w-3.5" /> Make admin
                          </Button>
                        )}
                        {r.is_suspended ? (
                          <Button size="sm" variant="default" disabled={busy === r.user_id} onClick={() => toggleSuspend(r)}>Unsuspend</Button>
                        ) : (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="outline" disabled={busy === r.user_id}>Suspend</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Suspend this user?</AlertDialogTitle>
                                <AlertDialogDescription>The user profile will be marked suspended until manually reversed.</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => toggleSuspend(r)}>Suspend</AlertDialogAction></AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                        <Button size="sm" variant="outline" onClick={() => openBadges(r)}>View badges</Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-center text-sm text-muted-foreground">
                    No accounts found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
      <Dialog open={!!badgeViewer} onOpenChange={(o) => !o && setBadgeViewer(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Badges · {badgeViewer?.display_name ?? "Unknown"} {badgeViewer?.username ? `(@${badgeViewer.username})` : ""}
            </DialogTitle>
          </DialogHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-muted-foreground">
                <tr className="border-b">
                  <th className="px-2 py-2">Kind</th>
                  <th className="px-2 py-2">Tier</th>
                  <th className="px-2 py-2">Verified</th>
                  <th className="px-2 py-2">Source</th>
                  <th className="px-2 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {badgeRows.map((b) => (
                  <tr key={b.id} className="border-b last:border-0">
                    <td className="px-2 py-2">{b.kind}</td>
                    <td className="px-2 py-2">{b.tier}</td>
                    <td className="px-2 py-2">{new Date(b.verified_at).toLocaleString()}</td>
                    <td className="px-2 py-2">{b.xion_address}</td>
                    <td className="px-2 py-2 text-right">
                      <AlertDialog>
                        <AlertDialogTrigger asChild><Button size="sm" variant="outline">Remove</Button></AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader><AlertDialogTitle>Remove badge?</AlertDialogTitle><AlertDialogDescription>This badge will be removed from the user profile.</AlertDialogDescription></AlertDialogHeader>
                          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => removeBadge(b)}>Remove</AlertDialogAction></AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </td>
                  </tr>
                ))}
                {badgeRows.length === 0 && <tr><td colSpan={5} className="px-2 py-8 text-center text-muted-foreground">No badges found for this profile.</td></tr>}
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminUsers;
