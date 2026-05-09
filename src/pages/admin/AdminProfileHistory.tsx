import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { logAdminAction } from "@/lib/admin";
import { toast } from "@/hooks/use-toast";
import {
  computeDiff,
  fetchProfileHistory,
  restoreProfileSnapshot,
  type DiffEntry,
  type ProfileHistoryRow,
} from "@/lib/profileHistory";
import { ArrowLeft, History, RotateCcw, ExternalLink } from "lucide-react";

type ProfileMeta = {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
};

const eventColor: Record<string, string> = {
  insert: "bg-green-500/15 text-green-600",
  update: "bg-blue-500/15 text-blue-600",
  delete: "bg-red-500/15 text-red-600",
  restore: "bg-amber-500/15 text-amber-600",
  demo_seed: "bg-purple-500/15 text-purple-600",
};

const formatValue = (v: unknown): string => {
  if (v === null || v === undefined) return "—";
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  try {
    return JSON.stringify(v, null, 2);
  } catch {
    return String(v);
  }
};

const AdminProfileHistory = () => {
  const { profileId } = useParams<{ profileId: string }>();
  const [profile, setProfile] = useState<ProfileMeta | null>(null);
  const [rows, setRows] = useState<ProfileHistoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ProfileHistoryRow | null>(null);
  const [restoring, setRestoring] = useState(false);

  const load = async () => {
    if (!profileId) return;
    setLoading(true);
    try {
      const [{ data: p }, history] = await Promise.all([
        supabase
          .from("profiles")
          .select("id, username, display_name, avatar_url")
          .eq("id", profileId)
          .maybeSingle(),
        fetchProfileHistory(profileId),
      ]);
      setProfile((p as ProfileMeta) ?? null);
      setRows(history);
    } catch (e) {
      toast({
        title: "Failed to load history",
        description: (e as Error).message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileId]);

  const diff: DiffEntry[] = useMemo(
    () =>
      selected
        ? computeDiff(selected.before, selected.after, selected.changed_keys)
        : [],
    [selected],
  );

  const restoreTo = async (row: ProfileHistoryRow, target: "before" | "after") => {
    if (!profileId) return;
    const snapshot = target === "before" ? row.before : row.after;
    if (!snapshot) {
      toast({ title: "Nothing to restore", variant: "destructive" });
      return;
    }
    setRestoring(true);
    try {
      await restoreProfileSnapshot(profileId, snapshot);
      await logAdminAction({
        action: "profile.restore",
        targetType: "profile",
        targetId: profileId,
        details: { history_id: row.id, target },
      });
      toast({ title: "Profile restored" });
      setSelected(null);
      await load();
    } catch (e) {
      toast({
        title: "Restore failed",
        description: (e as Error).message,
        variant: "destructive",
      });
    } finally {
      setRestoring(false);
    }
  };

  return (
    <AdminLayout
      title="Profile history"
      description="Every recorded change to this profile, with diff and restore."
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <Button asChild variant="outline" size="sm">
          <Link to="/admin/profiles">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to profiles
          </Link>
        </Button>
        {profile?.username && (
          <Button asChild variant="ghost" size="sm">
            <Link to={`/${profile.username}`} target="_blank">
              View public profile <ExternalLink className="ml-1 h-3.5 w-3.5" />
            </Link>
          </Button>
        )}
      </div>

      <Card className="p-4">
        <div className="mb-3 flex items-center gap-3">
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt=""
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
              <History className="h-5 w-5 text-muted-foreground" />
            </div>
          )}
          <div className="min-w-0">
            <div className="font-medium truncate">
              {profile?.display_name ?? "Untitled profile"}
            </div>
            <div className="text-xs text-muted-foreground truncate">
              {profile?.username ? `@${profile.username}` : profileId}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            Loading…
          </div>
        ) : rows.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            No history recorded yet for this profile.
          </div>
        ) : (
          <ol className="relative space-y-2 border-l border-border pl-4">
            {rows.map((r) => (
              <li key={r.id}>
                <button
                  onClick={() => setSelected(r)}
                  className="w-full rounded-lg border bg-card p-3 text-left transition hover:border-primary"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className={eventColor[r.event] ?? "bg-muted"}>
                      {r.event}
                    </Badge>
                    <Badge variant="outline">{r.source}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(r.created_at).toLocaleString()}
                    </span>
                  </div>
                  <div className="mt-1 text-sm">
                    <span className="text-muted-foreground">by </span>
                    <span className="font-medium">
                      {r.actor_email ?? r.actor_id ?? "system"}
                    </span>
                  </div>
                  {r.changed_keys.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {r.changed_keys.map((k) => (
                        <Badge key={k} variant="secondary" className="font-mono text-[10px]">
                          {k}
                        </Badge>
                      ))}
                    </div>
                  )}
                </button>
              </li>
            ))}
          </ol>
        )}
      </Card>

      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              {selected && (
                <Badge className={eventColor[selected.event] ?? "bg-muted"}>
                  {selected.event}
                </Badge>
              )}
              Diff
            </SheetTitle>
            <SheetDescription>
              {selected
                ? `${new Date(selected.created_at).toLocaleString()} · ${selected.actor_email ?? "system"}`
                : ""}
            </SheetDescription>
          </SheetHeader>

          <div className="mt-4 space-y-3">
            {diff.length === 0 && (
              <div className="text-sm text-muted-foreground">No changes.</div>
            )}
            {diff.map((d) => (
              <div key={d.key} className="rounded-md border">
                <div className="border-b bg-muted/40 px-3 py-1.5 font-mono text-xs">
                  {d.key}
                </div>
                <div className="grid grid-cols-1 gap-px bg-border md:grid-cols-2">
                  <div className="bg-card p-2">
                    <div className="mb-1 text-[10px] uppercase tracking-wide text-red-600">
                      Before
                    </div>
                    <pre className="whitespace-pre-wrap break-words font-mono text-xs">
                      {formatValue(d.before)}
                    </pre>
                  </div>
                  <div className="bg-card p-2">
                    <div className="mb-1 text-[10px] uppercase tracking-wide text-green-600">
                      After
                    </div>
                    <pre className="whitespace-pre-wrap break-words font-mono text-xs">
                      {formatValue(d.after)}
                    </pre>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <SheetFooter className="mt-4 flex-col gap-2 sm:flex-row">
            {selected?.before && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" disabled={restoring}>
                    <RotateCcw className="mr-1 h-4 w-4" />
                    Restore "Before" state
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Restore profile?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will overwrite the profile with the values from BEFORE this change.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => selected && restoreTo(selected, "before")}>
                      Restore
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            {selected?.after && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button disabled={restoring}>
                    <RotateCcw className="mr-1 h-4 w-4" />
                    Restore "After" state
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Restore profile?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will overwrite the profile with the values from AFTER this change.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => selected && restoreTo(selected, "after")}>
                      Restore
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </AdminLayout>
  );
};

export default AdminProfileHistory;
