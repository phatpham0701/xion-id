import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Sparkles, LogOut, LayoutTemplate } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ProfileEditorCard, type EditableProfile } from "@/components/dashboard/ProfileEditorCard";
import { ShareDialog } from "@/components/dashboard/ShareDialog";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";
import { ProfileSummary } from "@/components/dashboard/ProfileSummary";
import { QuickStats } from "@/components/dashboard/QuickStats";
import { QuickActionTiles } from "@/components/dashboard/QuickActionTiles";
import { RecommendedRewards } from "@/components/dashboard/RecommendedRewards";
import { BadgesPanel } from "@/components/dashboard/BadgesPanel";
import { RewardsLocker } from "@/components/dashboard/RewardsLocker";
import { BadgeScanWizard } from "@/components/dashboard/BadgeScanWizard";
import { DemoActivity } from "@/components/dashboard/DemoActivity";
import { PublicProfilePreview } from "@/components/dashboard/PublicProfilePreview";
import { getDemoState } from "@/lib/demoMode";

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<EditableProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [shareOpen, setShareOpen] = useState(false);
  const [scanOpen, setScanOpen] = useState(false);
  const [demoOnboarded, setDemoOnboarded] = useState<boolean>(() => getDemoState().onboarded);

  useEffect(() => {
    const refresh = () => setDemoOnboarded(getDemoState().onboarded);
    window.addEventListener("xionid:demo:change", refresh);
    return () => window.removeEventListener("xionid:demo:change", refresh);
  }, []);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, display_name, avatar_url, bio, is_published")
        .eq("user_id", user.id).maybeSingle();
      if (error) toast.error("Couldn't load profile", { description: error.message });
      setProfile(data as EditableProfile | null);
      setLoading(false);
    })();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen p-6">
        <Skeleton className="h-12 w-64 mb-6" />
        <Skeleton className="h-64 w-full max-w-3xl rounded-3xl" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen grid place-items-center p-6">
        <p className="text-muted-foreground">Profile not found. Try signing out and back in.</p>
      </div>
    );
  }

  // Onboarding only blocks when the user hasn't completed the demo flow.
  // Once onboarded, render the dashboard even if the username isn't claimed yet
  // (Claim Your ID lives as a quick action).
  if (!demoOnboarded) {
    return <OnboardingFlow profile={profile} onSaved={setProfile} />;
  }

  const username = profile.username ?? "you";
  const profileUrl = `${window.location.origin}/${username}`;

  return (
    <div className="min-h-screen relative">
      <div className="aurora-orb h-[460px] w-[460px] -top-40 -left-20 bg-secondary opacity-40 animate-aurora-drift" />
      <div className="aurora-orb h-[420px] w-[420px] top-40 -right-20 bg-primary opacity-30 animate-aurora-drift" style={{ animationDelay: "-7s" }} />

      <header className="border-b border-border/40 glass sticky top-0 z-40">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2" aria-label="XIONID home">
            <BrandLogo size={36} />
            <span className="font-display text-lg font-semibold tracking-tight">
              <Wordmark />
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
              <Link to="/templates"><LayoutTemplate className="h-4 w-4 mr-1.5" />Templates</Link>
            </Button>
            <span className="hidden md:inline text-xs text-muted-foreground mr-2">{user?.email}</span>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-1.5" />
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8 md:py-10 relative space-y-5">
        <div className="animate-fade-in">
          <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
            Your <span className="text-gradient">passport</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">A calm command center for your identity, badges, and rewards.</p>
        </div>

        {/* 1. Profile summary */}
        <ProfileSummary
          displayName={profile.display_name}
          username={username}
          avatarUrl={profile.avatar_url}
          isPublished={profile.is_published}
        />

        {/* 2. Quick stats */}
        <QuickStats />

        {/* 3. Quick actions */}
        <QuickActionTiles onScan={() => setScanOpen(true)} onClaimRewards={() => {
          document.getElementById("rewards-locker")?.scrollIntoView({ behavior: "smooth", block: "start" });
        }} />

        <div className="grid lg:grid-cols-[1.4fr_1fr] gap-5">
          <div className="space-y-5">
            <BadgesPanel onScan={() => setScanOpen(true)} />
            <div id="rewards-locker"><RewardsLocker /></div>
            <DemoActivity />
          </div>
          <div className="space-y-5">
            <PublicProfilePreview
              username={username}
              displayName={profile.display_name}
              avatarUrl={profile.avatar_url}
              bio={profile.bio}
              isPublished={profile.is_published}
            />
            <RecommendedRewards />
            <ProfileEditorCard
              profile={profile}
              onChange={setProfile}
              onShare={() => setShareOpen(true)}
            />
          </div>
        </div>
      </main>

      <BadgeScanWizard open={scanOpen} onOpenChange={setScanOpen} />

      <ShareDialog
        open={shareOpen}
        onOpenChange={setShareOpen}
        profileUrl={profileUrl}
        username={username}
      />
    </div>
  );
};

export default Dashboard;
