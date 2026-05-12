import { useEffect, useMemo, useState, lazy, Suspense, memo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Award,
  CheckCircle2,
  Dumbbell,
  Eye,
  Flag,
  Inbox,
  Medal,
  RefreshCcw,
  Sparkles,
  Target,
  Trophy,
} from "lucide-react";
import { useIsAdmin } from "@/lib/admin";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ProfileEditorCard,
  type EditableProfile,
} from "@/components/dashboard/ProfileEditorCard";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";
import { ProfileSummary } from "@/components/dashboard/ProfileSummary";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { needsOnboarding } from "@/lib/onboarding";
import {
  BADGE_TIER_MEANING,
  SPORT_BADGES,
  SPORT_INTERESTS,
  demoLeaderboard,
  getCountdown,
  getMatchedOpportunities,
  getRankScore,
  getSportLifestyleState,
  getSuggestedBadges,
  resetSportLifestyleState,
  saveSportLifestyleState,
  type BadgeTier,
  type SportBadgeDefinition,
  type SportInterest,
  type SportLifestyleState,
} from "@/lib/sportLifestyle";

const ShareDialog = lazy(() =>
  import("@/components/dashboard/ShareDialog").then((m) => ({
    default: m.ShareDialog,
  })),
);
const VerifyLifestyleDialog = lazy(() =>
  import("@/components/dashboard/VerifyLifestyleDialog").then((m) => ({
    default: m.VerifyLifestyleDialog,
  })),
);
const ChallengeCreatorDialog = lazy(() =>
  import("@/components/dashboard/ChallengeCreatorDialog").then((m) => ({
    default: m.ChallengeCreatorDialog,
  })),
);

const BADGE_TIER_PRIORITY: Record<BadgeTier, number> = {
  Elite: 5,
  Diamond: 4,
  Gold: 3,
  Silver: 2,
  Bronze: 1,
};

type DashboardBadge = SportBadgeDefinition & {
  tier: BadgeTier;
  progress: number;
  proofs: number;
  proofItems: SportLifestyleState["proofs"];
  status: "Earned" | "In progress";
};

const getBadgeIconLabel = (badge: DashboardBadge) =>
  badge.name.charAt(0).toUpperCase();

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const { isAdmin } = useIsAdmin();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<EditableProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [shareOpen, setShareOpen] = useState(false);
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [challengeOpen, setChallengeOpen] = useState(false);
  const [badgesOpen, setBadgesOpen] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<DashboardBadge | null>(
    null,
  );
  const [lifestyle, setLifestyle] = useState<SportLifestyleState>(() =>
    getSportLifestyleState(),
  );

  useEffect(() => {
    const refresh = () => setLifestyle(getSportLifestyleState());
    window.addEventListener("xionid:sport-lifestyle:change", refresh);
    return () =>
      window.removeEventListener("xionid:sport-lifestyle:change", refresh);
  }, []);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, display_name, avatar_url, bio, is_published")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error)
        toast.error("Couldn't load profile", { description: error.message });
      setProfile(data as EditableProfile | null);
      setLoading(false);
    })();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const selectInterest = (interest: SportInterest) => {
    const next = { ...lifestyle, selectedInterest: interest };
    saveSportLifestyleState(next);
    setLifestyle(next);
  };

  const resetPilotState = () => {
    const fresh = resetSportLifestyleState();
    setLifestyle(fresh);
    toast.success("Sport lifestyle demo state reset.");
  };

  const suggestedBadges = useMemo(
    () => getSuggestedBadges(lifestyle.selectedInterest),
    [lifestyle.selectedInterest],
  );
  const earnedBadgeDetails = useMemo<DashboardBadge[]>(() => {
    const mappedEarned = Object.entries(lifestyle.earnedBadges)
      .map(([badgeId, earnedBadge]) => {
        const definition = SPORT_BADGES.find((badge) => badge.id === badgeId);
        if (!definition) return null;

        const proofItems = lifestyle.proofs.filter(
          (proof) => proof.badgeId === badgeId,
        );
        return {
          ...definition,
          tier: earnedBadge.tier,
          progress: earnedBadge.progress,
          proofs: earnedBadge.proofs,
          proofItems,
          status: "Earned" as DashboardBadge["status"],
        };
      })
      .filter((badge): badge is DashboardBadge => Boolean(badge))
      .sort(
        (a, b) =>
          BADGE_TIER_PRIORITY[b.tier] - BADGE_TIER_PRIORITY[a.tier] ||
          b.progress - a.progress,
      );

    if (mappedEarned.length > 0) return mappedEarned;

    return suggestedBadges.map((badge) => ({
      ...badge,
      tier: badge.tierIntent,
      progress: 0,
      proofs: 0,
      proofItems: [],
      status: "In progress" as const,
    }));
  }, [lifestyle.earnedBadges, lifestyle.proofs, suggestedBadges]);
  const opportunities = useMemo(
    () => getMatchedOpportunities(lifestyle.selectedInterest),
    [lifestyle.selectedInterest],
  );
  const leaderboard = useMemo(() => demoLeaderboard(lifestyle), [lifestyle]);
  const rankScore = getRankScore(lifestyle);
  const earned = Object.entries(lifestyle.earnedBadges);
  const hasEarnedBadges = earned.length > 0;
  const activeBadge =
    earnedBadgeDetails.find((badge) => badge.id === selectedBadge?.id) ??
    earnedBadgeDetails[0] ??
    null;
  const primaryChallenge = lifestyle.challenges[0];
  const primaryOpportunity = opportunities[0];

  const openBadgeDetails = (badge: DashboardBadge) => {
    setSelectedBadge(badge);
    setBadgesOpen(true);
  };

  const openAllBadges = () => {
    setSelectedBadge(earnedBadgeDetails[0] ?? null);
    setBadgesOpen(true);
  };

  const openVerifyFromBadges = () => {
    setBadgesOpen(false);
    setVerifyOpen(true);
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
        <p className="text-muted-foreground">
          Profile not found. Try signing out and back in.
        </p>
      </div>
    );
  }

  if (needsOnboarding(profile)) {
    return <OnboardingFlow profile={profile} onSaved={setProfile} />;
  }

  const username = profile.username ?? "you";
  const profileUrl = `${window.location.origin}/${username}`;

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      <div
        className="aurora-orb h-[460px] w-[460px] -top-40 -left-20 bg-secondary opacity-20 motion-reduce:hidden animate-aurora-drift"
        aria-hidden
      />
      <div
        className="aurora-orb h-[420px] w-[420px] top-40 -right-20 bg-primary opacity-15 motion-reduce:hidden animate-aurora-drift"
        style={{ animationDelay: "-7s" }}
        aria-hidden
      />

      <DashboardHeader
        email={user?.email}
        isAdmin={isAdmin}
        onSignOut={handleSignOut}
        onVerify={() => setVerifyOpen(true)}
      />

      <main className="container py-8 md:py-10 relative space-y-6">
        <section className="grid lg:grid-cols-[1.25fr_0.75fr] gap-5 items-stretch">
          <div className="relative overflow-hidden rounded-3xl border border-primary/30 p-6 md:p-8 bg-background/70">
            <div
              className="absolute inset-0 opacity-80"
              style={{
                background:
                  "radial-gradient(120% 120% at 0% 0%, hsl(246 89% 67% / 0.28), transparent 55%), radial-gradient(120% 120% at 100% 100%, hsl(165 71% 50% / 0.24), transparent 55%)",
              }}
              aria-hidden
            />
            <div className="relative max-w-3xl">
              <Badge
                className="mb-4 bg-primary/15 text-primary border-primary/30"
                variant="outline"
              >
                Sport Lifestyle Engine
              </Badge>
              <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight leading-tight">
                Prove your lifestyle. Build your rank. Unlock opportunities.
              </h1>
              <p className="mt-3 text-sm md:text-base text-muted-foreground max-w-2xl">
                Start with one useful action: submit lifestyle proof or create
                one challenge. Deeper badges, opportunities, and leaderboard
                details live below.
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-2">
                <span className="text-xs uppercase tracking-wider text-muted-foreground mr-1">
                  Focus
                </span>
                {SPORT_INTERESTS.map((interest) => (
                  <Button
                    key={interest}
                    size="sm"
                    variant={
                      interest === lifestyle.selectedInterest
                        ? "default"
                        : "outline"
                    }
                    className={
                      interest === lifestyle.selectedInterest
                        ? "bg-gradient-primary"
                        : ""
                    }
                    onClick={() => selectInterest(interest)}
                  >
                    {interest}
                  </Button>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetPilotState}
                  className="text-xs"
                >
                  <RefreshCcw className="h-3.5 w-3.5 mr-1" />
                  Reset
                </Button>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Button
                  size="lg"
                  className="bg-gradient-primary shadow-glow-primary"
                  onClick={() => setVerifyOpen(true)}
                >
                  <Sparkles className="h-4 w-4" /> Verify your lifestyle
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => setChallengeOpen(true)}
                >
                  <Target className="h-4 w-4" /> Create challenge
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <ProfileSummary
              displayName={profile.display_name}
              username={username}
              avatarUrl={profile.avatar_url}
              isPublished={profile.is_published}
            />
            <div className="grid grid-cols-3 gap-2">
              <SignalStat
                label="Rank score"
                value={rankScore.toString()}
                onClick={() => navigate("/badges")}
              />
              <SignalStat
                label="Proofs"
                value={lifestyle.proofs.length.toString()}
                onClick={() => setVerifyOpen(true)}
              />
              <SignalStat
                label="Badges"
                value={earned.length.toString()}
                onClick={openAllBadges}
              />
            </div>

            <div className="glass-strong rounded-3xl p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-display text-xl font-semibold">
                    My Badges
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your verified effort badges and rank progress.
                  </p>
                </div>
                <div className="h-10 w-10 rounded-2xl bg-primary/10 text-primary grid place-items-center shrink-0">
                  <Award className="h-5 w-5" />
                </div>
              </div>

              {!hasEarnedBadges ? (
                <div className="mt-4 rounded-2xl border border-dashed border-glass-border bg-background/30 p-4 text-center">
                  <div className="mx-auto h-10 w-10 rounded-2xl bg-primary/10 grid place-items-center mb-3">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-sm font-medium">
                    No earned badges yet
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Verify lifestyle proof to start building badge progress.
                  </p>
                </div>
              ) : null}

              {earnedBadgeDetails.length > 0 ? (
                <div className="mt-4 space-y-2">
                  {earnedBadgeDetails.slice(0, 4).map((badge) => (
                    <button
                      key={badge.id}
                      type="button"
                      onClick={() => openBadgeDetails(badge)}
                      className="w-full rounded-2xl border border-glass-border bg-background/40 p-3 text-left transition hover:border-primary/40 hover:bg-background/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary grid place-items-center text-sm font-semibold">
                          {getBadgeIconLabel(badge)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-semibold truncate">
                              {badge.name}
                            </span>
                            <Badge variant="secondary" className="shrink-0">
                              {badge.tier}
                            </Badge>
                          </div>
                          <div className="mt-2 flex items-center gap-2">
                            <Progress value={badge.progress} className="h-2" />
                            <span className="text-[11px] text-muted-foreground shrink-0">
                              {badge.progress}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : null}

              <Button
                className="mt-4 w-full bg-gradient-primary"
                onClick={openAllBadges}
              >
                <Eye className="h-4 w-4 mr-1.5" />
                View all Badges
              </Button>
            </div>
          </div>
        </section>

        <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          <div className="glass-strong rounded-3xl p-5 md:p-6 lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-xl font-semibold">
                  Next best actions
                </h2>
                <p className="text-sm text-muted-foreground">
                  Three focused cards replace the old wall of information.
                </p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link to="/badges">Open badges</Link>
              </Button>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {suggestedBadges.slice(0, 3).map((badge) => {
                const earnedBadge = lifestyle.earnedBadges[badge.id];
                return (
                  <div
                    key={badge.id}
                    className="rounded-2xl border border-glass-border bg-background/40 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <Badge variant="outline" className="mb-2">
                          Target {badge.tierIntent}
                        </Badge>
                        <div className="text-sm font-semibold">
                          {badge.name}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {badge.description}
                        </div>
                      </div>
                    </div>
                    <Progress
                      value={earnedBadge?.progress ?? 0}
                      className="h-2 mt-3"
                    />
                    <div className="flex items-center justify-between gap-2 mt-2 text-[11px] text-muted-foreground">
                      <span className="truncate">{badge.proofHint}</span>
                      <Badge variant={earnedBadge ? "default" : "secondary"}>
                        {earnedBadge?.tier ?? "Not started"}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="glass-strong rounded-3xl p-5 md:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-xl font-semibold">
                  Main challenge
                </h2>
                <p className="text-sm text-muted-foreground">
                  One visible challenge keeps the Dashboard calm.
                </p>
              </div>
              <Button
                size="sm"
                className="bg-gradient-primary"
                onClick={() => setChallengeOpen(true)}
              >
                New
              </Button>
            </div>
            {primaryChallenge ? (
              (() => {
                const pct = Math.min(
                  100,
                  Math.round(
                    (primaryChallenge.currentProgress /
                      Math.max(1, primaryChallenge.target)) *
                      100,
                  ),
                );
                return (
                  <div className="rounded-2xl border border-glass-border bg-background/40 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold">
                          {primaryChallenge.title}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {primaryChallenge.sportType} ·{" "}
                          {primaryChallenge.targetMetric}
                        </div>
                      </div>
                      <Badge variant="outline">
                        {getCountdown(primaryChallenge.deadline)}
                      </Badge>
                    </div>
                    <Progress value={pct} className="h-2 mt-3" />
                    <div className="text-xs text-muted-foreground mt-2">
                      {primaryChallenge.currentProgress}/
                      {primaryChallenge.target} by {primaryChallenge.deadline}
                    </div>
                  </div>
                );
              })()
            ) : (
              <Button variant="outline" onClick={() => setChallengeOpen(true)}>
                Create your first challenge
              </Button>
            )}
            <Button variant="ghost" size="sm" asChild>
              <Link to="/challenges">View all challenges</Link>
            </Button>
          </div>
        </section>

        <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          <div className="glass-strong rounded-3xl p-5 md:p-6 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-display text-xl font-semibold">
                  Matched opportunity
                </h2>
                <p className="text-sm text-muted-foreground">
                  Show one high-quality match here; keep the full list in
                  Opportunities.
                </p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link to="/opportunities">Open all</Link>
              </Button>
            </div>
            {primaryOpportunity && (
              <div className="rounded-2xl border border-glass-border bg-background/40 p-4">
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="secondary">
                    {primaryOpportunity.category}
                  </Badge>
                  <Badge variant="outline">{primaryOpportunity.status}</Badge>
                </div>
                <h3 className="font-display text-xl font-semibold mt-3">
                  {primaryOpportunity.title}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {primaryOpportunity.reason}
                </p>
                <div className="text-xs font-medium mt-3">
                  Readiness: {primaryOpportunity.readiness}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Pilot match only — no guaranteed compensation, sponsorship,
                  employment, or income is implied.
                </p>
              </div>
            )}
          </div>

          <div className="glass-strong rounded-3xl p-5 md:p-6">
            <h2 className="font-display text-xl font-semibold mb-1">
              Hall of Fame
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Secondary signal, based on proof, badge tier progression,
              challenge completion, and referrals.
            </p>
            <div className="space-y-2">
              {leaderboard.slice(0, 4).map((entry) => {
                const isYou = entry.name === "You";
                return (
                  <div
                    key={entry.name}
                    className={`rounded-2xl border p-3 flex items-center gap-3 ${
                      isYou
                        ? "border-primary/40 bg-primary/10 ring-1 ring-primary/30"
                        : "border-glass-border bg-background/40"
                    }`}
                  >
                    <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary grid place-items-center font-semibold">
                      #{entry.rank}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold flex items-center gap-1">
                        {isYou ? (
                          <Medal className="h-3.5 w-3.5 text-primary" />
                        ) : null}
                        {entry.name}
                      </div>
                      <div className="text-[11px] text-muted-foreground truncate">
                        {entry.sport} · {entry.topBadge}
                      </div>
                    </div>
                    <div className="text-sm font-semibold">{entry.signal}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="grid md:grid-cols-2 lg:grid-cols-[0.9fr_1.1fr] gap-5">
          <div className="glass-strong rounded-3xl p-5 md:p-6">
            <h2 className="font-display text-xl font-semibold mb-3">
              Recent proof
            </h2>
            {lifestyle.proofs.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-glass-border bg-background/30 p-6 text-center">
                <div className="mx-auto h-10 w-10 rounded-2xl bg-primary/10 grid place-items-center mb-3">
                  <Inbox className="h-5 w-5 text-primary" />
                </div>
                <div className="text-sm font-medium">
                  No proof submitted yet
                </div>
                <p className="text-xs text-muted-foreground mt-1 mb-4">
                  Submit your first lifestyle proof to start building rank.
                </p>
                <Button
                  size="sm"
                  className="bg-gradient-primary"
                  onClick={() => setVerifyOpen(true)}
                >
                  <Sparkles className="h-4 w-4 mr-1.5" />
                  Verify lifestyle
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {lifestyle.proofs.slice(0, 3).map((proof) => (
                  <div
                    key={proof.id}
                    className="rounded-2xl border border-glass-border bg-background/40 p-3 flex items-center gap-3"
                  >
                    <Award className="h-4 w-4 text-primary" />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium">
                        {proof.interest} · {proof.proofType}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(proof.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <Badge variant="outline">{proof.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
          <ProfileEditorCard
            profile={profile}
            onChange={setProfile}
            onShare={() => setShareOpen(true)}
          />
        </section>
      </main>

      <Dialog open={badgesOpen} onOpenChange={setBadgesOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-5xl">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">
              My Badges
            </DialogTitle>
            <DialogDescription>
              Review your earned badges, proof progress, and visibility-ready
              details.
            </DialogDescription>
          </DialogHeader>

          {!hasEarnedBadges ? (
            <div className="rounded-3xl border border-dashed border-glass-border bg-background/40 p-6 text-center">
              <div className="mx-auto h-12 w-12 rounded-2xl bg-primary/10 grid place-items-center mb-3">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-display text-xl font-semibold">
                Start your badge stack
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                Submit a simple proof to turn your verified effort into badge
                progress, rank signal, and future visibility.
              </p>
              <Button
                className="mt-4 bg-gradient-primary"
                onClick={openVerifyFromBadges}
              >
                Verify lifestyle
              </Button>
            </div>
          ) : null}

          <div className="grid gap-5 lg:grid-cols-[1fr_0.8fr]">
            <div className="grid gap-3 sm:grid-cols-2">
              {earnedBadgeDetails.map((badge) => {
                const isSelected = activeBadge?.id === badge.id;
                return (
                  <button
                    key={badge.id}
                    type="button"
                    onClick={() => setSelectedBadge(badge)}
                    className={`rounded-3xl border p-4 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                      isSelected
                        ? "border-primary/50 bg-primary/10 ring-1 ring-primary/30"
                        : "border-glass-border bg-background/40 hover:border-primary/40 hover:bg-background/60"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-semibold truncate">
                          {badge.name}
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {badge.interest}
                        </div>
                      </div>
                      <Badge
                        variant={
                          badge.status === "Earned" ? "default" : "secondary"
                        }
                      >
                        {badge.status}
                      </Badge>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <Badge variant="outline">{badge.tier}</Badge>
                      <Badge variant="secondary">
                        {badge.proofs} proof{badge.proofs === 1 ? "" : "s"}
                      </Badge>
                    </div>
                    <Progress value={badge.progress} className="h-2 mt-4" />
                    <div className="mt-2 text-xs text-muted-foreground">
                      {badge.progress}% progress
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="rounded-3xl border border-glass-border bg-background/50 p-5 lg:sticky lg:top-4 lg:self-start">
              {activeBadge ? (
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary grid place-items-center text-lg font-semibold">
                      {getBadgeIconLabel(activeBadge)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-display text-xl font-semibold">
                        {activeBadge.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {activeBadge.interest}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Badge>{activeBadge.tier}</Badge>
                    <Badge variant="outline">{activeBadge.status}</Badge>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    {activeBadge.description}
                  </p>

                  <div className="rounded-2xl border border-glass-border bg-background/40 p-4 space-y-3">
                    <div>
                      <div className="text-xs uppercase tracking-wider text-muted-foreground">
                        Proof hint
                      </div>
                      <div className="text-sm font-medium mt-1">
                        {activeBadge.proofHint}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Progress</span>
                        <span className="font-semibold">
                          {activeBadge.progress}%
                        </span>
                      </div>
                      <Progress
                        value={activeBadge.progress}
                        className="h-2 mt-2"
                      />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Proofs count
                      </span>
                      <span className="font-semibold">
                        {activeBadge.proofs}
                      </span>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-primary/20 bg-primary/10 p-4">
                    <div className="text-sm font-semibold flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      Tier meaning
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {BADGE_TIER_MEANING[activeBadge.tier]}
                    </p>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    You control whether this badge appears publicly.
                  </p>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  Select a badge to review its visibility-ready details.
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Suspense fallback={null}>
        {verifyOpen && (
          <VerifyLifestyleDialog
            open={verifyOpen}
            onOpenChange={setVerifyOpen}
            state={lifestyle}
            onStateChange={setLifestyle}
          />
        )}
        {challengeOpen && (
          <ChallengeCreatorDialog
            open={challengeOpen}
            onOpenChange={setChallengeOpen}
            state={lifestyle}
            onStateChange={setLifestyle}
          />
        )}
        {shareOpen && (
          <ShareDialog
            open={shareOpen}
            onOpenChange={setShareOpen}
            profileUrl={profileUrl}
            username={username}
          />
        )}
      </Suspense>
    </div>
  );
};

const SignalStat = memo(
  ({
    label,
    value,
    onClick,
  }: {
    label: string;
    value: string;
    onClick?: () => void;
  }) => {
    const Icon =
      label === "Rank score" ? Trophy : label === "Proofs" ? Flag : Dumbbell;
    return (
      <button
        type="button"
        onClick={onClick}
        className="w-full rounded-2xl border border-glass-border bg-background/40 p-3 text-center transition hover:bg-background/60 hover:border-primary/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <div className="text-lg font-display font-semibold flex items-center justify-center gap-1">
          <Icon className="h-3.5 w-3.5 text-primary" />
          {value}
        </div>
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">
          {label}
        </div>
      </button>
    );
  },
);
SignalStat.displayName = "SignalStat";

export default Dashboard;
