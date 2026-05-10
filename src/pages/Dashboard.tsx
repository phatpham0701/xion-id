import { BrandLogo } from "@/components/BrandLogo";
import { Wordmark } from "@/components/Wordmark";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Award, Dumbbell, Flag, LayoutTemplate, LogOut, Medal, RefreshCcw, Shield, Sparkles, Target, Trophy, UserRound } from "lucide-react";
import { useIsAdmin } from "@/lib/admin";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { ProfileEditorCard, type EditableProfile } from "@/components/dashboard/ProfileEditorCard";
import { ShareDialog } from "@/components/dashboard/ShareDialog";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";
import { ProfileSummary } from "@/components/dashboard/ProfileSummary";
import { VerifyLifestyleDialog } from "@/components/dashboard/VerifyLifestyleDialog";
import { ChallengeCreatorDialog } from "@/components/dashboard/ChallengeCreatorDialog";
import { needsOnboarding } from "@/lib/onboarding";
import {
  SPORT_INTERESTS,
  demoLeaderboard,
  getCountdown,
  getMatchedOpportunities,
  getRankScore,
  getSportLifestyleState,
  getSuggestedBadges,
  resetSportLifestyleState,
  saveSportLifestyleState,
  type SportInterest,
  type SportLifestyleState,
} from "@/lib/sportLifestyle";

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const { isAdmin } = useIsAdmin();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<EditableProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [shareOpen, setShareOpen] = useState(false);
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [challengeOpen, setChallengeOpen] = useState(false);
  const [lifestyle, setLifestyle] = useState<SportLifestyleState>(() => getSportLifestyleState());

  useEffect(() => {
    const refresh = () => setLifestyle(getSportLifestyleState());
    window.addEventListener("xionid:sport-lifestyle:change", refresh);
    return () => window.removeEventListener("xionid:sport-lifestyle:change", refresh);
  }, []);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, display_name, avatar_url, bio, is_published")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) toast.error("Couldn't load profile", { description: error.message });
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

  const suggestedBadges = useMemo(() => getSuggestedBadges(lifestyle.selectedInterest), [lifestyle.selectedInterest]);
  const opportunities = useMemo(() => getMatchedOpportunities(lifestyle.selectedInterest), [lifestyle.selectedInterest]);
  const leaderboard = useMemo(() => demoLeaderboard(lifestyle), [lifestyle]);
  const rankScore = getRankScore(lifestyle);
  const earned = Object.entries(lifestyle.earnedBadges);
  const primaryChallenge = lifestyle.challenges[0];
  const primaryOpportunity = opportunities[0];

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

  if (needsOnboarding(profile)) {
    return <OnboardingFlow profile={profile} onSaved={setProfile} />;
  }

  const username = profile.username ?? "you";
  const profileUrl = `${window.location.origin}/${username}`;

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      <div className="aurora-orb h-[460px] w-[460px] -top-40 -left-20 bg-secondary opacity-40 animate-aurora-drift" />
      <div className="aurora-orb h-[420px] w-[420px] top-40 -right-20 bg-primary opacity-30 animate-aurora-drift" style={{ animationDelay: "-7s" }} />

      <header className="border-b border-border/40 glass sticky top-0 z-40">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2" aria-label="XIONID dashboard">
            <BrandLogo size={36} />
            <span className="font-display text-lg font-semibold tracking-tight"><Wordmark /></span>
          </Link>
          <nav className="hidden lg:flex items-center gap-1 text-sm">
            <Button variant="ghost" size="sm" asChild><Link to="/dashboard">Dashboard</Link></Button>
            <Button variant="ghost" size="sm" onClick={() => setVerifyOpen(true)}>Verify Lifestyle</Button>
            <Button variant="ghost" size="sm" asChild><Link to="/badges">Badges</Link></Button>
            <Button variant="ghost" size="sm" asChild><Link to="/challenges">Challenges</Link></Button>
            <Button variant="ghost" size="sm" asChild><Link to="/opportunities">Opportunities</Link></Button>
            <Button variant="ghost" size="sm" asChild><Link to="/editor"><LayoutTemplate className="h-4 w-4 mr-1.5" />Studio</Link></Button>
          </nav>
          <div className="flex items-center gap-2">
            {isAdmin && <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex"><Link to="/admin"><Shield className="h-4 w-4 mr-1.5" />Admin</Link></Button>}
            <span className="hidden md:inline text-xs text-muted-foreground mr-2">{user?.email}</span>
            <Button variant="ghost" size="sm" onClick={handleSignOut}><LogOut className="h-4 w-4 mr-1.5" />Sign out</Button>
          </div>
        </div>
      </header>

      <main className="container py-8 md:py-10 relative space-y-6">
        <section className="grid lg:grid-cols-[1.25fr_0.75fr] gap-5 items-stretch">
          <div className="relative overflow-hidden rounded-3xl border border-primary/30 p-6 md:p-8 bg-background/70">
            <div className="absolute inset-0 opacity-80" style={{ background: "radial-gradient(120% 120% at 0% 0%, hsl(246 89% 67% / 0.28), transparent 55%), radial-gradient(120% 120% at 100% 100%, hsl(165 71% 50% / 0.24), transparent 55%)" }} aria-hidden />
            <div className="relative max-w-3xl">
              <Badge className="mb-4 bg-primary/15 text-primary border-primary/30" variant="outline">Sport Lifestyle Engine</Badge>
              <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight leading-tight">
                Prove your lifestyle. Build your rank. Unlock opportunities.
              </h1>
              <p className="mt-3 text-sm md:text-base text-muted-foreground max-w-2xl">
                Start with one useful action: submit lifestyle proof or create one challenge. Deeper badges, opportunities, and leaderboard details live below.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Button size="lg" className="bg-gradient-primary shadow-glow-primary" onClick={() => setVerifyOpen(true)}>
                  <Sparkles className="h-4 w-4" /> Verify your lifestyle
                </Button>
                <Button size="lg" variant="outline" onClick={() => setChallengeOpen(true)}>
                  <Target className="h-4 w-4" /> Create challenge
                </Button>
              </div>
            </div>
          </div>

          <div className="glass-strong rounded-3xl p-5 md:p-6 space-y-4">
            <ProfileSummary displayName={profile.display_name} username={username} avatarUrl={profile.avatar_url} isPublished={profile.is_published} />
            <div className="grid grid-cols-3 gap-2">
              <SignalStat label="Rank score" value={rankScore.toString()} />
              <SignalStat label="Proofs" value={lifestyle.proofs.length.toString()} />
              <SignalStat label="Badges" value={earned.length.toString()} />
            </div>
            <div className="rounded-2xl border border-dashed border-primary/30 p-3 flex items-center gap-3 bg-primary/5">
              <div className="h-12 w-12 rounded-2xl bg-background/60 grid place-items-center text-2xl"><UserRound className="h-5 w-5 text-primary" /></div>
              <div>
                <div className="text-sm font-medium">AI/3D avatar placeholder</div>
                <div className="text-xs text-muted-foreground">Optional identity layer; not required to enter the Dashboard.</div>
              </div>
            </div>
          </div>
        </section>

        <section className="glass-strong rounded-3xl p-5 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
            <div>
              <h2 className="font-display text-xl font-semibold">Focus your current sport lifestyle</h2>
              <p className="text-sm text-muted-foreground">Keep the command center focused. Change this anytime to personalize proof, badges, challenges, and opportunities.</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Selected: {lifestyle.selectedInterest}</Badge>
              <Button variant="ghost" size="sm" onClick={resetPilotState}><RefreshCcw className="h-3.5 w-3.5 mr-1" />Reset</Button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {SPORT_INTERESTS.map((interest) => (
              <Button key={interest} variant={interest === lifestyle.selectedInterest ? "default" : "outline"} className={interest === lifestyle.selectedInterest ? "bg-gradient-primary" : ""} onClick={() => selectInterest(interest)}>
                {interest}
              </Button>
            ))}
          </div>
        </section>

        <section className="grid lg:grid-cols-3 gap-5">
          <div className="glass-strong rounded-3xl p-5 md:p-6 lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-xl font-semibold">Next best actions</h2>
                <p className="text-sm text-muted-foreground">Three focused cards replace the old wall of information.</p>
              </div>
              <Button variant="outline" size="sm" asChild><Link to="/badges">Open badges</Link></Button>
            </div>
            <div className="grid md:grid-cols-3 gap-3">
              {suggestedBadges.slice(0, 3).map((badge) => {
                const earnedBadge = lifestyle.earnedBadges[badge.id];
                return (
                  <div key={badge.id} className="rounded-2xl border border-glass-border bg-background/40 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <Badge variant="outline" className="mb-2">Target {badge.tierIntent}</Badge>
                        <div className="text-sm font-semibold">{badge.name}</div>
                        <div className="text-xs text-muted-foreground mt-1">{badge.description}</div>
                      </div>
                    </div>
                    <Progress value={earnedBadge?.progress ?? 0} className="h-2 mt-3" />
                    <div className="flex items-center justify-between gap-2 mt-2 text-[11px] text-muted-foreground">
                      <span className="truncate">{badge.proofHint}</span>
                      <Badge variant={earnedBadge ? "default" : "secondary"}>{earnedBadge?.tier ?? "Not started"}</Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="glass-strong rounded-3xl p-5 md:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-xl font-semibold">Main challenge</h2>
                <p className="text-sm text-muted-foreground">One visible challenge keeps the Dashboard calm.</p>
              </div>
              <Button size="sm" className="bg-gradient-primary" onClick={() => setChallengeOpen(true)}>New</Button>
            </div>
            {primaryChallenge ? (() => {
              const pct = Math.min(100, Math.round((primaryChallenge.currentProgress / Math.max(1, primaryChallenge.target)) * 100));
              return (
                <div className="rounded-2xl border border-glass-border bg-background/40 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold">{primaryChallenge.title}</div>
                      <div className="text-xs text-muted-foreground">{primaryChallenge.sportType} · {primaryChallenge.targetMetric}</div>
                    </div>
                    <Badge variant="outline">{getCountdown(primaryChallenge.deadline)}</Badge>
                  </div>
                  <Progress value={pct} className="h-2 mt-3" />
                  <div className="text-xs text-muted-foreground mt-2">{primaryChallenge.currentProgress}/{primaryChallenge.target} by {primaryChallenge.deadline}</div>
                </div>
              );
            })() : <Button variant="outline" onClick={() => setChallengeOpen(true)}>Create your first challenge</Button>}
            <Button variant="ghost" size="sm" asChild><Link to="/challenges">View all challenges</Link></Button>
          </div>
        </section>

        <section className="grid lg:grid-cols-3 gap-5">
          <div className="glass-strong rounded-3xl p-5 md:p-6 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-display text-xl font-semibold">Matched opportunity</h2>
                <p className="text-sm text-muted-foreground">Show one high-quality match here; keep the full list in Opportunities.</p>
              </div>
              <Button variant="outline" size="sm" asChild><Link to="/opportunities">Open all</Link></Button>
            </div>
            {primaryOpportunity && (
              <div className="rounded-2xl border border-glass-border bg-background/40 p-4">
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="secondary">{primaryOpportunity.category}</Badge>
                  <Badge variant="outline">{primaryOpportunity.status}</Badge>
                </div>
                <h3 className="font-display text-xl font-semibold mt-3">{primaryOpportunity.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{primaryOpportunity.reason}</p>
                <div className="text-xs font-medium mt-3">Readiness: {primaryOpportunity.readiness}</div>
                <p className="text-xs text-muted-foreground mt-2">Pilot match only — no guaranteed compensation, sponsorship, employment, or income is implied.</p>
              </div>
            )}
          </div>

          <div className="glass-strong rounded-3xl p-5 md:p-6">
            <h2 className="font-display text-xl font-semibold mb-1">Hall of Fame</h2>
            <p className="text-sm text-muted-foreground mb-4">Secondary signal, based on proof, badge tier progression, challenge completion, and referrals.</p>
            <div className="space-y-2">
              {leaderboard.slice(0, 4).map((entry) => (
                <div key={entry.name} className="rounded-2xl border border-glass-border bg-background/40 p-3 flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary grid place-items-center font-semibold">#{entry.rank}</div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold flex items-center gap-1">{entry.name === "You" ? <Medal className="h-3.5 w-3.5 text-primary" /> : null}{entry.name}</div>
                    <div className="text-[11px] text-muted-foreground truncate">{entry.sport} · {entry.topBadge}</div>
                  </div>
                  <div className="text-sm font-semibold">{entry.signal}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid lg:grid-cols-[0.9fr_1.1fr] gap-5">
          <div className="glass-strong rounded-3xl p-5 md:p-6">
            <h2 className="font-display text-xl font-semibold mb-3">Recent proof</h2>
            <div className="space-y-2">
              {lifestyle.proofs.slice(0, 3).map((proof) => (
                <div key={proof.id} className="rounded-2xl border border-glass-border bg-background/40 p-3 flex items-center gap-3">
                  <Award className="h-4 w-4 text-primary" />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium">{proof.interest} · {proof.proofType}</div>
                    <div className="text-xs text-muted-foreground">{new Date(proof.createdAt).toLocaleDateString()}</div>
                  </div>
                  <Badge variant="outline">{proof.status}</Badge>
                </div>
              ))}
            </div>
          </div>
          <ProfileEditorCard profile={profile} onChange={setProfile} onShare={() => setShareOpen(true)} />
        </section>
      </main>

      <VerifyLifestyleDialog open={verifyOpen} onOpenChange={setVerifyOpen} state={lifestyle} onStateChange={setLifestyle} />
      <ChallengeCreatorDialog open={challengeOpen} onOpenChange={setChallengeOpen} state={lifestyle} onStateChange={setLifestyle} />
      <ShareDialog open={shareOpen} onOpenChange={setShareOpen} profileUrl={profileUrl} username={username} />
    </div>
  );
};

const SignalStat = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-2xl border border-glass-border bg-background/40 p-3 text-center">
    <div className="text-lg font-display font-semibold flex items-center justify-center gap-1">
      {label === "Rank score" && <Trophy className="h-3.5 w-3.5 text-primary" />}
      {label === "Proofs" && <Flag className="h-3.5 w-3.5 text-primary" />}
      {label === "Badges" && <Dumbbell className="h-3.5 w-3.5 text-primary" />}
      {value}
    </div>
    <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">{label}</div>
  </div>
);

export default Dashboard;
