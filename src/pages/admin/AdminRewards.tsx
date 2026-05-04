import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getDemoState, updateDemoState, type DemoReward } from "@/lib/demoMode";
import { logAdminAction } from "@/lib/admin";
import { toast } from "@/hooks/use-toast";
import { Plus, Trash2, Power } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const empty: DemoReward = {
  id: "",
  title: "",
  description: "",
  cost: 50,
  claimed: false,
  brand: "",
  benefit: "",
  status: "available",
};

const AdminRewards = () => {
  const [rewards, setRewards] = useState<DemoReward[]>([]);
  const [editing, setEditing] = useState<DemoReward | null>(null);
  const [open, setOpen] = useState(false);

  const refresh = () => setRewards(getDemoState().rewards);
  useEffect(() => {
    refresh();
    const h = () => refresh();
    window.addEventListener("xionid:demo:change", h);
    return () => window.removeEventListener("xionid:demo:change", h);
  }, []);

  const startNew = () => {
    setEditing({ ...empty, id: `r-${Date.now()}` });
    setOpen(true);
  };
  const startEdit = (r: DemoReward) => {
    setEditing({ ...r });
    setOpen(true);
  };

  const save = async () => {
    if (!editing) return;
    if (!editing.title.trim()) {
      toast({ title: "Title required", variant: "destructive" });
      return;
    }
    const isNew = !rewards.find((x) => x.id === editing.id);
    updateDemoState((s) => {
      const idx = s.rewards.findIndex((x) => x.id === editing.id);
      if (idx >= 0) s.rewards[idx] = editing;
      else s.rewards.unshift(editing);
    });
    await logAdminAction({
      action: isNew ? "reward.create" : "reward.update",
      targetType: "reward",
      targetId: editing.id,
      details: { title: editing.title, cost: editing.cost } as never,
    });
    setOpen(false);
    setEditing(null);
    refresh();
  };

  const toggleActive = async (r: DemoReward) => {
    const next = r.status === "archived" ? "available" : "archived";
    updateDemoState((s) => {
      const x = s.rewards.find((y) => y.id === r.id);
      if (x) x.status = next;
    });
    await logAdminAction({ action: "reward.activate", targetType: "reward", targetId: r.id, details: { status: next } });
    refresh();
  };

  const remove = async (r: DemoReward) => {
    updateDemoState((s) => {
      s.rewards = s.rewards.filter((x) => x.id !== r.id);
    });
    await logAdminAction({ action: "reward.delete", targetType: "reward", targetId: r.id });
    refresh();
  };

  return (
    <AdminLayout title="Rewards" description="Demo rewards locker. Backed by local pitch data.">
      <Card className="p-3">
        <div className="mb-3 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-100">
          Demo data stored locally in this browser.
        </div>
        <div className="flex justify-end">
          <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setEditing(null); }}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={startNew}><Plus className="mr-1 h-4 w-4" /> New reward</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{editing && rewards.find((r) => r.id === editing.id) ? "Edit reward" : "New reward"}</DialogTitle></DialogHeader>
              {editing && (
                <div className="space-y-3">
                  <div><Label>Title</Label><Input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} /></div>
                  <div><Label>Description</Label><Textarea rows={2} value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Brand</Label><Input value={editing.brand ?? ""} onChange={(e) => setEditing({ ...editing, brand: e.target.value })} /></div>
                    <div><Label>Benefit</Label><Input value={editing.benefit ?? ""} onChange={(e) => setEditing({ ...editing, benefit: e.target.value })} /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Cost (points)</Label><Input type="number" value={editing.cost} onChange={(e) => setEditing({ ...editing, cost: Number(e.target.value) || 0 })} /></div>
                    <div><Label>Required badge kind (optional)</Label><Input value={editing.requiredBadgeKind ?? ""} onChange={(e) => setEditing({ ...editing, requiredBadgeKind: e.target.value || undefined })} /></div>
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={save}>Save</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {rewards.map((r) => (
            <div key={r.id} className="rounded-lg border bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-medium truncate">{r.title}</div>
                  <div className="text-xs text-muted-foreground">{r.brand} · {r.cost} pts</div>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{r.description}</p>
                </div>
                <Badge variant={r.status === "archived" ? "secondary" : r.claimed ? "outline" : "default"}>
                  {r.status ?? (r.claimed ? "claimed" : "available")}
                </Badge>
              </div>
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="outline" onClick={() => startEdit(r)}>Edit</Button>
                <Button size="sm" variant="outline" onClick={() => toggleActive(r)}>
                  <Power className="mr-1 h-3.5 w-3.5" /> {r.status === "archived" ? "Activate" : "Deactivate"}
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="outline">
                      <Trash2 className="mr-1 h-3.5 w-3.5" /> Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete reward?</AlertDialogTitle>
                      <AlertDialogDescription>This action removes the reward from local demo state.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => remove(r)}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
          {rewards.length === 0 && (
            <div className="md:col-span-2 py-10 text-center text-sm text-muted-foreground">No rewards yet.</div>
          )}
        </div>
      </Card>
    </AdminLayout>
  );
};

export default AdminRewards;
