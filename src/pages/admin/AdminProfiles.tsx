import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { logAdminAction } from "@/lib/admin";
import { toast } from "@/hooks/use-toast";
import { Search, ExternalLink, Star, StarOff, History } from "lucide-react";

type ProfileRow = {
  id: string;
  user_id: string;
  username: string | null;
  display_name: string | null;
  bio: string | null;
  is_published: boolean;
  is_featured?: boolean | null;
  created_at: string;
};

const AdminProfiles = () => {
  const [rows, setRows] = useState<ProfileRow[]>([]);
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<ProfileRow | null>(null);
  const [draft, setDraft] = useState({ username: "", display_name: "", bio: "" });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("id, user_id, username, display_name, bio, is_published, is_featured, created_at")
      .order("created_at", { ascending: false })
      .limit(500);
    setRows((data as ProfileRow[]) ?? []);
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
        (r.display_name ?? "").toLowerCase().includes(s),
    );
  }, [rows, q]);

  const togglePublish = async (r: ProfileRow) => {
    const next = !r.is_published;
    await supabase.from("profiles").update({ is_published: next }).eq("id", r.id);
    await logAdminAction({ action: "profile.publish", targetType: "profile", targetId: r.id, details: { is_published: next } });
    load();
  };

  const toggleFeature = async (r: ProfileRow) => {
    const next = !r.is_featured;
    await supabase.from("profiles").update({ is_featured: next } as never).eq("id", r.id);
    await logAdminAction({ action: "profile.feature", targetType: "profile", targetId: r.id, details: { is_featured: next } });
    load();
  };

  const openEdit = (r: ProfileRow) => {
    setEditing(r);
    setDraft({ username: r.username ?? "", display_name: r.display_name ?? "", bio: r.bio ?? "" });
  };

  const saveEdit = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      const payload: Partial<ProfileRow> = {
        username: draft.username.trim() || null,
        display_name: draft.display_name.trim() || null,
        bio: draft.bio.trim() || null,
      };
      const { error } = await supabase.from("profiles").update(payload).eq("id", editing.id);
      if (error) throw error;
      await logAdminAction({ action: "profile.update", targetType: "profile", targetId: editing.id, details: payload as never });
      toast({ title: "Profile updated" });
      setEditing(null);
      load();
    } catch (e: unknown) {
      toast({ title: "Failed", description: (e as Error).message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout title="Profiles" description="Edit display info, publish state, and feature flags.">
      <Card className="p-3">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className="pl-9" />
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {filtered.map((r) => (
            <div key={r.id} className="rounded-lg border bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-medium truncate">{r.display_name ?? "—"}</div>
                  <div className="text-xs text-muted-foreground">
                    {r.username ? (
                      <Link to={`/${r.username}`} target="_blank" className="inline-flex items-center gap-1 hover:underline">
                        @{r.username} <ExternalLink className="h-3 w-3" />
                      </Link>
                    ) : (
                      "no username"
                    )}
                  </div>
                  {r.bio && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{r.bio}</p>}
                </div>
                <div className="flex flex-col items-end gap-1">
                  {r.is_featured && <Badge>featured</Badge>}
                  <Badge variant={r.is_published ? "outline" : "secondary"}>{r.is_published ? "published" : "draft"}</Badge>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => openEdit(r)}>Edit</Button>
                <Button size="sm" variant="outline" onClick={() => togglePublish(r)}>
                  {r.is_published ? "Unpublish" : "Publish"}
                </Button>
                <Button size="sm" variant="outline" onClick={() => toggleFeature(r)}>
                  {r.is_featured ? <StarOff className="mr-1 h-3.5 w-3.5" /> : <Star className="mr-1 h-3.5 w-3.5" />}
                  {r.is_featured ? "Unfeature" : "Feature"}
                </Button>
                <Button asChild size="sm" variant="ghost">
                  <Link to={`/admin/profiles/${r.id}/history`}>
                    <History className="mr-1 h-3.5 w-3.5" />
                    History
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Username</Label>
              <Input value={draft.username} onChange={(e) => setDraft({ ...draft, username: e.target.value })} />
            </div>
            <div>
              <Label>Display name</Label>
              <Input value={draft.display_name} onChange={(e) => setDraft({ ...draft, display_name: e.target.value })} />
            </div>
            <div>
              <Label>Bio</Label>
              <Textarea rows={3} value={draft.bio} onChange={(e) => setDraft({ ...draft, bio: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={saveEdit} disabled={saving}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminProfiles;
