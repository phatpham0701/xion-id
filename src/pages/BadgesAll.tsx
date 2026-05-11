import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BrandLogo } from "@/components/BrandLogo";
import { Wordmark } from "@/components/Wordmark";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { SportBadgeThumbnail } from "@/components/badges/SportBadgeThumbnail";
import { VerifyLifestyleDialog } from "@/components/dashboard/VerifyLifestyleDialog";
import {
  BADGE_TIER_MEANING,
  SPORT_BADGES,
  getSportLifestyleState,
  type BadgeTier,
  type SportBadgeDefinition,
  type SportLifestyleState,
} from "@/lib/sportLifestyle";
import { BADGE_LABELS, type BadgeKind } from "@/lib/badgeScanner";
import { cn } from "@/lib/utils";

type WalletBadgeRow = { id: string; kind: BadgeKind; tier: number; verified_at: string; xion_address: string };

const toTitle = (kind: string) => kind.split("_").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");

const tierOrder = Object.keys(BADGE_TIER_MEANING) as BadgeTier[];

const BadgesAll = () => {
  const [verifyOpen, setVerifyOpen] = useState(false);
  const { user } = useAuth();
  const [dbBadges, setDbBadges] = useState<WalletBadgeRow[]>([]);
  const [lifestyle, setLifestyle] = useState<SportLifestyleState>(() => getSportLifestyleState());
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [selectedBadge, setSelectedBadge] = useState<SportBadgeDefinition | null>(null);

  useEffect(() => {
    const refresh = () => setLifestyle(getSportLifestyleState());
    window.addEventListener("xionid:sport-lifestyle:change", refresh);
    return () => window.removeEventListener("xionid:sport-lifestyle:change", refresh);
  }, []);

  useEffect(() => {
    if (!user) {
      setDbBadges([]);
      return;
    }

    (async () => {
      const { data: p, error: profileError } = await supabase.from("profiles").select("id").eq("user_id", user.id).maybeSingle();
      if (profileError || !p?.id) {
        if (profileError) console.warn("Failed to load profile for badges", profileError);
        setDbBadges([]);
        return;
      }

      const { data, error } = await supabase
        .from("wallet_badges")
        .select("id, kind, tier, verified_at, xion_address")
        .eq("profile_id", p.id)
        .order("verified_at", { ascending: false });

      if (error) {
        console.warn("Failed to load wallet badges", error);
        setDbBadges([]);
        return;
      }

      setDbBadges((data as WalletBadgeRow[]) ?? []);
    })();
  }, [user?.id, verifyOpen]);

  const earnedCount = useMemo(() => Object.keys(lifestyle.earnedBadges).length, [lifestyle.earnedBadges]);
  const visibleSportBadges = useMemo(
    () => SPORT_BADGES.filter((sportBadge) => !selectedTier || sportBadge.tierIntent === selectedTier),
    [selectedTier],
  );

  const handleTierClick = (tier: BadgeTier) => {
    setSelectedTier((current) => (current === tier ? null : tier));
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      <header className="border-b border-border/40 glass sticky top-0 z-40">
        <div className="container flex h-14 items-center justify-between">
          <Button variant="ghost" size="sm" asChild><Link to="/dashboard"><ArrowLeft className="h-4 w-4 mr-1.5" />Dashboard</Link></Button>
          <Link to="/" className="flex items-center gap-2"><BrandLogo size={28} /><span className="text-sm font-semibold"><Wordmark /> · Badges</span></Link>
          <Button size="sm" className="bg-gradient-primary" onClick={() => setVerifyOpen(true)}>Verify</Button>
        </div>
      </header>

      <main className="container py-8 md:py-10 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl md:text-5xl font-bold tracking-tight">Sport lifestyle <span className="text-gradient-brand">badges</span></h1>
            <p className="mt-2 text-sm text-muted-foreground max-w-2xl">50 pilot badges turn repeated sport behavior into portable lifestyle reputation. Badges are proof of activity and consistency, not generic reward stamps.</p>
          </div>
          <div className="grid grid-cols-2 gap-2 min-w-[220px]">
            <div className="rounded-2xl border border-glass-border bg-background/40 p-3 text-center"><div className="font-display text-2xl font-semibold">{SPORT_BADGES.length}</div><div className="text-xs text-muted-foreground">Sport badges</div></div>
            <div className="rounded-2xl border border-glass-border bg-background/40 p-3 text-center"><div className="font-display text-2xl font-semibold">{earnedCount}</div><div className="text-xs text-muted-foreground">In progress</div></div>
          </div>
        </div>

        <section className="glass-strong rounded-3xl p-5 md:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-display text-xl font-semibold">Five-tier badge system</h2>
              <p className="mt-1 text-xs text-muted-foreground">Tap a tier to filter. Tap again to show all.</p>
            </div>
            <Button
              type="button"
              variant={selectedTier ? "outline" : "secondary"}
              size="sm"
              className="self-start sm:self-auto"
              onClick={() => setSelectedTier(null)}
            >
              Show all
            </Button>
          </div>
          <div className="mt-4 grid sm:grid-cols-5 gap-2 text-xs">
            {tierOrder.map((tier) => {
              const active = selectedTier === tier;
              const tierCount = SPORT_BADGES.filter((sportBadge) => sportBadge.tierIntent === tier).length;

              return (
                <button
                  key={tier}
                  type="button"
                  aria-pressed={active}
                  onClick={() => handleTierClick(tier)}
                  className={cn(
                    "rounded-2xl border p-3 text-left transition-all hover:-translate-y-0.5 hover:bg-background/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 motion-reduce:transform-none",
                    active
                      ? "border-primary/60 bg-primary/10 shadow-[0_0_30px_rgba(255,255,255,0.08)]"
                      : "border-border/40 bg-background/25",
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold">{tier}</span>
                    <Badge variant={active ? "default" : "outline"} className="text-[10px]">{tierCount}</Badge>
                  </div>
                  <div className="text-muted-foreground mt-1">{BADGE_TIER_MEANING[tier]}</div>
                </button>
              );
            })}
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="font-display text-xl font-semibold">Sport badge showcase</h2>
            <p className="text-sm text-muted-foreground">Showing {visibleSportBadges.length} of {SPORT_BADGES.length} badges{selectedTier ? ` · ${selectedTier}` : ""}</p>
          </div>
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
            {visibleSportBadges.map((sportBadge) => {
              const earned = lifestyle.earnedBadges[sportBadge.id];
              const progress = earned?.progress ?? 0;

              return (
                <button
                  key={sportBadge.id}
                  type="button"
                  onClick={() => setSelectedBadge(sportBadge)}
                  className="group rounded-3xl border border-white/10 bg-background/35 p-4 text-left transition-all hover:-translate-y-0.5 hover:border-white/20 hover:bg-background/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 motion-reduce:transform-none"
                >
                  <SportBadgeThumbnail
                    badge={sportBadge}
                    earned={Boolean(earned)}
                    progress={progress}
                    size="sm"
                    variant="showcase"
                    className="mb-3"
                  />
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline">{sportBadge.interest}</Badge>
                      <Badge variant={earned ? "default" : "secondary"}>{earned?.tier ?? sportBadge.tierIntent}</Badge>
                    </div>
                    <p className="text-sm font-medium text-foreground">{sportBadge.description}</p>
                    <p className="text-xs text-muted-foreground"><span className="font-semibold text-foreground/80">Proof focus:</span> {sportBadge.proofHint}</p>
                  </div>
                  <Progress value={progress} className="h-2 mt-4" />
                  <div className="flex items-center justify-between mt-2 text-xs gap-3 text-muted-foreground">
                    <span>{earned ? "Verified lifestyle signal in progress" : "Ready for proof"}</span>
                    <span>{progress}%</span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {dbBadges.length > 0 && (
          <section className="glass-strong rounded-3xl p-5 md:p-6">
            <h2 className="font-display text-xl font-semibold">Existing issued badge inventory</h2>
            <p className="text-sm text-muted-foreground mb-4">Admin-issued badges from the existing Supabase badge inventory remain available.</p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
              {dbBadges.map((row) => <div key={row.id} className="rounded-2xl border border-glass-border bg-background/40 p-4"><div className="font-semibold">{BADGE_LABELS[row.kind]?.label ?? toTitle(row.kind)}</div><div className="text-xs text-muted-foreground">Inventory tier {row.tier} · {new Date(row.verified_at).toLocaleDateString()}</div></div>)}
            </div>
          </section>
        )}
      </main>

      <Dialog open={Boolean(selectedBadge)} onOpenChange={(open) => !open && setSelectedBadge(null)}>
        <DialogContent className="max-h-[92vh] overflow-y-auto border-white/10 bg-slate-950 p-0 text-white shadow-2xl sm:max-w-3xl">
          {selectedBadge && (
            <div className="relative isolate overflow-hidden rounded-lg">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_22%,rgba(255,255,255,0.16),transparent_34%),radial-gradient(circle_at_15%_15%,rgba(59,130,246,0.24),transparent_28%),radial-gradient(circle_at_85%_5%,rgba(168,85,247,0.20),transparent_26%)]" />
              <div className="absolute -left-16 bottom-0 h-40 w-40 rounded-full bg-cyan-400/20 blur-3xl" />
              <div className="absolute -right-20 top-10 h-48 w-48 rounded-full bg-fuchsia-400/15 blur-3xl" />
              <div className="relative grid gap-6 p-5 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:p-7">
                <div className="flex items-center justify-center rounded-[2rem] bg-black/20 p-3">
                  <SportBadgeThumbnail
                    badge={selectedBadge}
                    earned={Boolean(lifestyle.earnedBadges[selectedBadge.id])}
                    progress={lifestyle.earnedBadges[selectedBadge.id]?.progress ?? 0}
                    size="lg"
                    variant="showcase"
                    className="w-full"
                  />
                </div>
                <div className="flex min-w-0 flex-col justify-center space-y-4">
                  <DialogHeader>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className="border-white/20 bg-white/5 text-white">{selectedBadge.interest}</Badge>
                      <Badge className="bg-white text-slate-950 hover:bg-white">{selectedBadge.tierIntent}</Badge>
                    </div>
                    <DialogTitle className="font-display text-2xl text-white md:text-3xl">{selectedBadge.name}</DialogTitle>
                    <DialogDescription className="text-sm text-slate-300">
                      Verified lifestyle signal for {selectedBadge.interest.toLowerCase()} behavior, consistency, and proof quality.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="grid gap-3 text-sm">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">What it represents</div>
                      <p className="mt-2 text-slate-100">{selectedBadge.description}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Proof focus</div>
                      <p className="mt-2 text-slate-100">{selectedBadge.proofHint}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Earned status</span>
                        <Badge variant={lifestyle.earnedBadges[selectedBadge.id] ? "default" : "secondary"}>
                          {lifestyle.earnedBadges[selectedBadge.id] ? "In progress" : "Ready for proof"}
                        </Badge>
                      </div>
                      <Progress value={lifestyle.earnedBadges[selectedBadge.id]?.progress ?? 0} className="h-2 bg-white/15" />
                      <p className="mt-2 text-xs text-slate-300">
                        {lifestyle.earnedBadges[selectedBadge.id]?.progress ?? 0}% proof progress · {lifestyle.earnedBadges[selectedBadge.id]?.proofs ?? 0} proof signal(s)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <VerifyLifestyleDialog open={verifyOpen} onOpenChange={setVerifyOpen} state={lifestyle} onStateChange={setLifestyle} />
    </div>
  );
};

export default BadgesAll;
