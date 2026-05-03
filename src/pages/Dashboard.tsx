import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Eye, EyeOff, Gift, LayoutTemplate, Loader2, LogOut, ShieldCheck } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

import { ProfileEditorCard, type EditableProfile } from "@/components/dashboard/ProfileEditorCard";
import { ShareDialog } from "@/components/dashboard/ShareDialog";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";
import { ProfileSummary } from "@/components/dashboard/ProfileSummary";
import { QuickStats } from "@/components/dashboard/QuickStats";
import { QuickActionTiles } from "@/components/dashboard/QuickActionTiles";
import { FeaturedBadges } from "@/components/dashboard/FeaturedBadges";
import { MatchedRewards } from "@/components/dashboard/MatchedRewards";
import { NextBestAction } from "@/components/dashboard/NextBestAction";
import { BadgeScanWizard } from "@/components/dashboard/BadgeScanWizard";
import { DemoActivity } from "@/components/dashboard/DemoActivity";
import { PublicProfilePreview } from "@/components/dashboard/PublicProfilePreview";

import { getDemoState } from "@/lib/demoMode";

type DashboardProfile = EditableProfile & {
  settings?: unknown;
};

const getSettingsObject = (settings: unknown): Record<string, unknown> => {
  if (!settings || typeof settings !== "object" || Array.isArray(settings)) {
    return {};
  }

  return settings as Record<string, unknown>;
};

const getNestedObject = (object: Record<string, unknown>, key: string): Record<string, unknown> => {
  const value = object[key];

  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return value as Record<string, unknown>;
};

const getShowOfferBox = (settings: unknown): boolean => {
  const settingsObject = getSettingsObject(settings);
  const publicProfileSettings = getNestedObject(settingsObject, "xionidPublicProfile");

  return publicProfileSettings.showOfferBox !== false;
};

const buildUpdatedSettings = (settings: unknown, showOfferBox: boolean): Record<string, unknown> => {
  const root = getSettingsObject(settings);
  const publicProfileSettings = getNestedObject(root, "xionidPublicProfile");

  return {
    ...root,
    xionidPublicProfile: {
      ...publicProfileSettings,
      showOfferBox,
    },
  };
};

const OfferBoxVisibilityCard = ({
  profile,
  onProfileChange,
}: {
  profile: DashboardProfile;
  onProfileChange: (profile: DashboardProfile) => void;
}) => {
  const [saving, setSaving] = useState(false);
  const showOfferBox = getShowOfferBox(profile.settings);

  const updateVisibility = async (next: boolean) => {
    const previousProfile = profile;
    const nextSettings = buildUpdatedSettings(profile.settings, next);

    onProfileChange({
      ...profile,
      settings: nextSettings,
    });

    setSaving(true);

    try {
      const { data, error } = await supabase
        .from("profiles")
        .update({
          settings: nextSettings as any,
        })
        .eq("id", profile.id)
        .select("id, username, display_name, avatar_url, bio, is_published, settings")
        .single();

      if (error) throw error;

      onProfileChange(data as DashboardProfile);

      toast.success("Offer Box visibility updated", {
        description: next
          ? "Offer Box is now visible on your public profile."
          : "Offer Box is now hidden from your public profile.",
      });
    } catch (error) {
      onProfileChange(previousProfile);

      toast.error("Could not update Offer Box visibility", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="rounded-3xl border border-glass-border bg-card/55 p-5 shadow-soft backdrop-blur-xl">
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
            <Gift className="h-5 w-5" />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-display text-lg font-semibold text-foreground">Offer Box visibility</h2>

              <span className="inline-flex items-center rounded-full border border-glass-border bg-background/40 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                Public profile
              </span>
            </div>

            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Control whether matched rewards appear on your public passport. Badges remain visible based on your badge
              visibility settings.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 rounded-2xl border border-glass-border bg-background/35 px-4 py-3 md:min-w-[270px]">
          <div className="flex items-center gap-3">
            {showOfferBox ? (
              <Eye className="h-4 w-4 text-emerald-300" />
            ) : (
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            )}

            <Label htmlFor="offer-box-visibility" className="cursor-pointer text-sm font-medium">
              {showOfferBox ? "Shown on profile" : "Hidden from profile"}
            </Label>
          </div>

          <div className="flex items-center gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /> : null}

            <Switch
              id="offer-box-visibility"
              checked={showOfferBox}
              disabled={saving}
              onCheckedChange={updateVisibility}
            />
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-emerald-300/15 bg-emerald-300/10 px-4 py-3 text-sm text-emerald-50/80">
        <div className="flex items-start gap-2">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
          <p>
            Pitch-safe note: hiding the Offer Box does not delete rewards. It only controls what visitors see on your
            public profile.
          </p>
        </div>
      </div>
    </section>
  );
};

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<DashboardProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [shareOpen, setShareOpen] = useState(false);
  const [scanOpen, setScanOpen] = useState(false);
  const [demoOnboarded, setDemoOnboarded] = useState(() => getDemoState().onboarded);

  useEffect(() => {
    const refresh = () => setDemoOnboarded(getDemoState().onboarded);

    window.addEventListener("xionid:demo:change", refresh);

    return () => window.removeEventListener("xionid:demo:change", refresh);
  }, []);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    setLoading(true);

    (async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, display_name, avatar_url, bio, is_published, settings")
        .eq("user_id", user.id)
        .maybeSingle();

      if (cancelled) return;

      if (error) {
        toast.error("Couldn't load profile", {
          description: error.message,
        });
      }

      setProfile((data as DashboardProfile | null) ?? null);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleProfileChange = (updatedProfile: EditableProfile) => {
    setProfile((current) => ({
      ...updatedProfile,
      settings: current?.settings,
    }));
  };

  const handleFullProfileChange = (updatedProfile: DashboardProfile) => {
    setProfile(updatedProfile);
  };

  const username = profile?.username ?? "you";

  const profileUrl = useMemo(() => {
    if (typeof window === "undefined") return `/${username}`;
    return `${window.location.origin}/${username}`;
  }, [username]);

  if (loading) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <div className="border-b border-glass-border bg-card/50 backdrop-blur-xl">
          <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-6">
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-xl" />
              <Skeleton className="h-5 w-24" />
            </div>

            <Skeleton className="h-9 w-32 rounded-full" />
          </div>
        </div>

        <div className="mx-auto w-full max-w-7xl space-y-6 px-6 py-10">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-40 w-full rounded-3xl" />
          <div className="grid gap-4 md:grid-cols-4">
            <Skeleton className="h-24 rounded-3xl" />
            <Skeleton className="h-24 rounded-3xl" />
            <Skeleton className="h-24 rounded-3xl" />
            <Skeleton className="h-24 rounded-3xl" />
          </div>
          <Skeleton className="h-64 w-full rounded-3xl" />
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
        <div className="w-full max-w-md rounded-3xl border border-glass-border bg-card/60 p-8 text-center shadow-soft">
          <h1 className="font-display text-2xl font-semibold">Sign in required</h1>

          <p className="mt-2 text-sm text-muted-foreground">Please sign in to open your XIONID dashboard.</p>

          <Button asChild className="mt-6 bg-gradient-primary">
            <Link to="/auth">Sign in</Link>
          </Button>
        </div>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
        <div className="w-full max-w-md rounded-3xl border border-glass-border bg-card/60 p-8 text-center shadow-soft">
          <h1 className="font-display text-2xl font-semibold">Profile not found</h1>

          <p className="mt-2 text-sm text-muted-foreground">Try signing out and back in.</p>

          <Button onClick={handleSignOut} className="mt-6 bg-gradient-primary">
            Sign out
          </Button>
        </div>
      </main>
    );
  }

  // Onboarding only blocks when the user has not completed the demo flow.
  // Once onboarded, render the dashboard even if username is not claimed yet.
  // Claim Your ID lives as a quick action.
  if (!demoOnboarded) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <OnboardingFlow profile={profile} onSaved={handleProfileChange} />
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-glass-border bg-card/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-3 font-display text-lg font-semibold tracking-tight"
          >
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-primary text-primary-foreground shadow-glow-primary">
              ✦
            </span>
            <span>
              XION<span className="text-primary">ID</span>
            </span>
          </Link>

          <nav className="flex items-center gap-2 sm:gap-4">
            <Button variant="ghost" asChild className="hidden gap-2 sm:inline-flex">
              <Link to="/templates">
                <LayoutTemplate className="h-4 w-4" />
                Templates
              </Link>
            </Button>

            <span className="hidden max-w-[220px] truncate text-sm text-muted-foreground md:block">{user.email}</span>

            <Button variant="ghost" onClick={handleSignOut} className="gap-2">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign out</span>
            </Button>
          </nav>
        </div>
      </header>

      <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <section className="flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary/80">XIONID Passport</p>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="font-display text-4xl font-black tracking-tight sm:text-5xl">Your passport</h1>

              <p className="mt-2 max-w-2xl text-base leading-relaxed text-muted-foreground">
                Prove what matters. Reveal only what you choose. Unlock what fits you.
              </p>
            </div>

            <Button className="w-fit bg-gradient-primary text-primary-foreground" onClick={() => setScanOpen(true)}>
              Verify a signal
            </Button>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <ProfileSummary
            displayName={profile.display_name}
            username={username}
            avatarUrl={profile.avatar_url}
            isPublished={profile.is_published}
          />

          <NextBestAction onPrimary={() => setScanOpen(true)} />
        </section>

        <QuickStats />

        <QuickActionTiles onScan={() => setScanOpen(true)} onClaimRewards={() => navigate("/rewards")} />

        <OfferBoxVisibilityCard profile={profile} onProfileChange={handleFullProfileChange} />

        <section className="grid gap-6 xl:grid-cols-[1fr_0.85fr]">
          <div className="space-y-6">
            <FeaturedBadges onScan={() => setScanOpen(true)} />

            <MatchedRewards onScan={() => setScanOpen(true)} />

            <DemoActivity />
          </div>

          <div className="space-y-6">
            <PublicProfilePreview
              username={username}
              displayName={profile.display_name}
              avatarUrl={profile.avatar_url}
              bio={profile.bio}
              isPublished={profile.is_published}
            />

            <ProfileEditorCard profile={profile} onChange={handleProfileChange} onShare={() => setShareOpen(true)} />
          </div>
        </section>
      </div>

      <ShareDialog open={shareOpen} onOpenChange={setShareOpen} profileUrl={profileUrl} username={username} />

      <BadgeScanWizard open={scanOpen} onOpenChange={setScanOpen} />
    </main>
  );
};

export default Dashboard;
