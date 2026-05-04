import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getDemoState, updateDemoState, type DemoCampaign } from "@/lib/demoMode";
import { logAdminAction } from "@/lib/admin";
import { Star, StarOff, Archive, RefreshCw } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

type WithFlags = DemoCampaign & { featured?: boolean; status?: "live" | "archived" };

const AdminCampaigns = () => {
  const [items, setItems] = useState<WithFlags[]>([]);
  const refresh = () => setItems(getDemoState().campaigns as WithFlags[]);
  useEffect(() => {
    refresh();
    const h = () => refresh();
    window.addEventListener("xionid:demo:change", h);
    return () => window.removeEventListener("xionid:demo:change", h);
  }, []);

  const toggleFeature = async (c: WithFlags) => {
    const next = !c.featured;
    updateDemoState((s) => {
      const x = s.campaigns.find((y) => y.id === c.id) as WithFlags | undefined;
      if (x) x.featured = next;
    });
    await logAdminAction({ action: "campaign.feature", targetType: "campaign", targetId: c.id, details: { featured: next } });
    refresh();
  };

  const toggleStatus = async (c: WithFlags) => {
    const next = c.status === "archived" ? "live" : "archived";
    updateDemoState((s) => {
      const x = s.campaigns.find((y) => y.id === c.id) as WithFlags | undefined;
      if (x) x.status = next;
    });
    await logAdminAction({ action: "campaign.status", targetType: "campaign", targetId: c.id, details: { status: next } });
    refresh();
  };

  return (
    <AdminLayout title="Campaigns" description="Curate and moderate creator campaigns.">
      <div className="mb-3 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-100">
        Demo data stored locally in this browser.
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {items.map((c) => (
          <Card key={c.id} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-2xl">{c.coverEmoji}</div>
                <div className="mt-1 font-medium">{c.title}</div>
                <p className="line-clamp-2 text-sm text-muted-foreground">{c.blurb}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                {c.featured && <Badge>featured</Badge>}
                <Badge variant={c.status === "archived" ? "secondary" : "outline"}>{c.status ?? "live"}</Badge>
              </div>
            </div>
            <div className="mt-3 text-xs text-muted-foreground">
              {c.participants} backers · ${c.raised} / ${c.goalAmount}
            </div>
            <div className="mt-3 flex gap-2">
              <Button size="sm" variant="outline" onClick={() => toggleFeature(c)}>
                {c.featured ? <StarOff className="mr-1 h-3.5 w-3.5" /> : <Star className="mr-1 h-3.5 w-3.5" />}
                {c.featured ? "Unfeature" : "Feature"}
              </Button>
              {c.status === "archived" ? (
                <Button size="sm" variant="outline" onClick={() => toggleStatus(c)}>
                  <RefreshCw className="mr-1 h-3.5 w-3.5" /> Reactivate
                </Button>
              ) : (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="outline">
                      <Archive className="mr-1 h-3.5 w-3.5" /> Archive
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Archive campaign?</AlertDialogTitle>
                      <AlertDialogDescription>This campaign will be hidden from active demo listings.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => toggleStatus(c)}>Archive</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </Card>
        ))}
        {items.length === 0 && (
          <div className="md:col-span-2 py-10 text-center text-sm text-muted-foreground">No campaigns yet.</div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminCampaigns;
