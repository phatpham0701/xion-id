import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { toast } from "@/hooks/use-toast";
import { getDemoState, resetDemoState, updateDemoState } from "@/lib/demoMode";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const AdminDemoControls = () => {
  const [handle, setHandle] = useState("paulus");
  const [demoSnapshot, setDemoSnapshot] = useState(() => getDemoState());

  const refreshSnapshot = () => setDemoSnapshot(getDemoState());

  useEffect(() => {
    refreshSnapshot();
    const onDemoChange = () => refreshSnapshot();
    window.addEventListener("xionid:demo:change", onDemoChange);
    return () => window.removeEventListener("xionid:demo:change", onDemoChange);
  }, []);

  const seedProfile = (notify = true) => {
    updateDemoState((s) => {
      s.profile.username = handle.trim() || "paulus";
      s.profile.displayName = "Paulus Pham";
      s.profile.bio = "A privacy-first lifestyle passport for selected proof, badges, and relevant rewards.";
      s.profile.avatarEmoji = "✅";
      s.profile.identityClaimed = true;
    });
    refreshSnapshot();
    if (notify) toast({ title: "Seeded Paulus sample profile" });
  };

  const seedBadges = (notify = true) => {
    updateDemoState((s) => {
      s.badges = [
        { id: `b-${Date.now()}-1`, kind: "founding_member", label: "Founding Member", emoji: "🏛️", description: "Early foundation collaborator.", tier: 3, tierName: "diamond", category: "community", verifiedAt: new Date().toISOString(), featured: true },
        { id: `b-${Date.now()}-2`, kind: "ecosystem_builder", label: "Ecosystem Builder", emoji: "🧱", description: "Contributed to ecosystem growth.", tier: 2, tierName: "gold", category: "creator", verifiedAt: new Date().toISOString() },
      ];
    });
    refreshSnapshot();
    if (notify) toast({ title: "Seeded sample badges" });
  };

  const seedRewards = (notify = true) => {
    updateDemoState((s) => {
      s.rewards = [
        { id: `demo-r-${Date.now()}-1`, title: "VIP Demo Access", description: "Priority access to next foundation briefing.", cost: 150, claimed: false, status: "available", brand: "Foundation" },
        { id: `demo-r-${Date.now()}-2`, title: "Community Grant Pass", description: "Fast-track review for pilot grants.", cost: 300, claimed: false, status: "available", brand: "Foundation" },
      ];
    });
    refreshSnapshot();
    if (notify) toast({ title: "Seeded sample rewards" });
  };

  const seedCampaigns = (notify = true) => {
    updateDemoState((s) => {
      s.campaigns = [
        { id: `demo-c-${Date.now()}-1`, title: "Foundation Builder Sprint", blurb: "Fund core contributors for a 6-week sprint.", goalAmount: 10000, raised: 2500, participants: 42, endsAt: "2026-08-01T00:00:00Z", joined: false, coverEmoji: "🚀" },
      ];
    });
    refreshSnapshot();
    if (notify) toast({ title: "Seeded sample campaigns" });
  };

  const prepareFoundationDemo = () => {
    seedProfile(false);
    seedBadges(false);
    seedRewards(false);
    seedCampaigns(false);
    toast({ title: "Foundation demo prepared" });
  };

  return (
    <AdminLayout title="Demo controls" description="Seed and reset browser-local demo content for presentations.">
      <Card className="p-4 space-y-4">
        <div className="space-y-2">
          <Label>Sample username</Label>
          <Input value={handle} onChange={(e) => setHandle(e.target.value)} placeholder="paulus" />
        </div>

        <div className="grid gap-2 md:grid-cols-2">
          <Button variant="outline" onClick={() => seedProfile()}>Seed Paulus sample profile</Button>
          <Button variant="outline" onClick={() => seedBadges()}>Seed sample badges</Button>
          <Button variant="outline" onClick={() => seedRewards()}>Seed sample rewards</Button>
          <Button variant="outline" onClick={() => seedCampaigns()}>Seed sample campaigns</Button>
        </div>

        <div className="flex flex-wrap gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Reset local demo state</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Reset demo state?</AlertDialogTitle>
                <AlertDialogDescription>This will overwrite all demo data stored in this browser.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => { resetDemoState(); refreshSnapshot(); toast({ title: "Demo state reset" }); }}>Reset</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button>Prepare Foundation Demo</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Prepare foundation demo data?</AlertDialogTitle>
                <AlertDialogDescription>This will replace current demo profile, badges, rewards, and campaigns.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={prepareFoundationDemo}>Prepare</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <div className="text-xs text-muted-foreground">Current demo snapshot: {demoSnapshot.profile.displayName} (@{demoSnapshot.profile.username})</div>
      </Card>
    </AdminLayout>
  );
};

export default AdminDemoControls;
