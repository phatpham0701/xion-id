import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BrandLogo } from "@/components/BrandLogo";
import { Wordmark } from "@/components/Wordmark";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { SportBadgeThumbnail } from "@/components/badges/SportBadgeThumbnail";
import { VerifyLifestyleDialog } from "@/components/dashboard/VerifyLifestyleDialog";
import { BADGE_TIER_MEANING, SPORT_BADGES, getSportLifestyleState, type SportLifestyleState } from "@/lib/sportLifestyle";
import { BADGE_LABELS, type BadgeKind } from "@/lib/badgeScanner";

type WalletBadgeRow = { id: string; kind: BadgeKind; tier: number; verified_at: string; xion_address: string };

const toTitle = (kind: string) => kind.split("_").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");

const BadgesAll = () => {
  const [verifyOpen, setVerifyOpen] = useState(false);
  const { user } = useAuth();
  const [dbBadges, setDbBadges] = useState<WalletBadgeRow[]>([]);
  const [lifestyle, setLifestyle] = useState<SportLifestyleState>(() => getSportLifestyleState());

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
            <p className="mt-2 text-sm text-muted-foreground max-w-2xl">50 pilot badges turn repeated sport behavior into portable lifestyle reputation. Badges are proof of activity and consistency, not coupons or generic reward stamps.</p>
          </div>
          <div className="grid grid-cols-2 gap-2 min-w-[220px]">
            <div className="rounded-2xl border border-glass-border bg-background/40 p-3 text-center"><div className="font-display text-2xl font-semibold">{SPORT_BADGES.length}</div><div className="text-xs text-muted-foreground">Sport badges</div></div>
            <div className="rounded-2xl border border-glass-border bg-background/40 p-3 text-center"><div className="font-display text-2xl font-semibold">{earnedCount}</div><div className="text-xs text-muted-foreground">In progress</div></div>
          </div>
        </div>

        <section className="glass-strong rounded-3xl p-5 md:p-6">
          <h2 className="font-display text-xl font-semibold mb-3">Five-tier badge system</h2>
          <div className="grid sm:grid-cols-5 gap-2 text-xs">
            {Object.entries(BADGE_TIER_MEANING).map(([tier, meaning]) => <div key={tier} className="rounded-2xl border border-border/50 p-3 bg-background/30"><div className="font-semibold">{tier}</div><div className="text-muted-foreground mt-1">{meaning}</div></div>)}
          </div>
        </section>

        <section className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
          {SPORT_BADGES.map((sportBadge) => {
            const earned = lifestyle.earnedBadges[sportBadge.id];
            return (
              <div key={sportBadge.id} className="rounded-3xl border border-glass-border bg-background/50 p-4">
                <SportBadgeThumbnail
                  badge={sportBadge}
                  earned={Boolean(earned)}
                  progress={earned?.progress ?? 0}
                  size="sm"
                  className="mb-3"
                />
                <div className="space-y-2">
                  <Badge variant="outline">{sportBadge.interest}</Badge>
                  <p className="text-sm text-muted-foreground">{sportBadge.description}</p>
                </div>
                <Progress value={earned?.progress ?? 0} className="h-2 mt-4" />
                <div className="flex items-center justify-between mt-2 text-xs gap-3">
                  <span className="text-muted-foreground">{sportBadge.proofHint}</span>
                  <Badge variant={earned ? "default" : "secondary"}>{earned?.tier ?? sportBadge.tierIntent}</Badge>
                </div>
              </div>
            );
          })}
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

      <VerifyLifestyleDialog open={verifyOpen} onOpenChange={setVerifyOpen} state={lifestyle} onStateChange={setLifestyle} />
    </div>
  );
};

export default BadgesAll;
