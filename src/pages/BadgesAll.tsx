import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BadgesPanel } from "@/components/dashboard/BadgesPanel";
import { BadgeScanWizard } from "@/components/dashboard/BadgeScanWizard";
import { BrandLogo } from "@/components/BrandLogo";
import { Wordmark } from "@/components/Wordmark";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { BADGE_LABELS, type BadgeKind } from "@/lib/badgeScanner";
import { Badge } from "@/components/ui/badge";

type WalletBadgeRow = { id: string; kind: BadgeKind; tier: number; verified_at: string; xion_address: string };

const BadgesAll = () => {
  const [scanOpen, setScanOpen] = useState(false);
  const { user } = useAuth();
  const [dbBadges, setDbBadges] = useState<WalletBadgeRow[]>([]);

  useEffect(() => {
    if (!user) {
      setDbBadges([]);
      return;
    }

    (async () => {
      const { data: p, error: profileError } = await supabase.from("profiles").select("id").eq("user_id", user.id).maybeSingle();
      if (profileError) {
        console.warn("Failed to load profile for badges", profileError);
        setDbBadges([]);
        return;
      }
      if (!p?.id) {
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
  }, [user?.id, scanOpen]);
  return (
    <div className="min-h-screen relative overflow-x-hidden">
      <header className="border-b border-border/40 glass sticky top-0 z-40">
        <div className="container flex h-14 items-center justify-between">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/dashboard"><ArrowLeft className="h-4 w-4 mr-1.5" />Dashboard</Link>
          </Button>
          <Link to="/" className="flex items-center gap-2">
            <BrandLogo size={28} />
            <span className="text-sm font-semibold"><Wordmark /> · Badges</span>
          </Link>
          <div className="w-[120px]" />
        </div>
      </header>
      <main className="container py-8 md:py-10 space-y-6">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight">Your <span className="text-gradient-brand">proof</span></h1>
          <p className="mt-2 text-sm text-muted-foreground">Every signal you've verified. Filter by tier or category.</p>
        </div>
        <BadgesPanel onScan={() => setScanOpen(true)} />
        <div className="rounded-2xl border bg-card p-4">
          <h2 className="font-semibold">On-chain badge inventory</h2>
          <p className="text-xs text-muted-foreground mt-1">Issued from wallet_badges (including admin-issued badges).</p>
          <div className="mt-3 space-y-2">
            {dbBadges.map((b) => (
              <div key={b.id} className="flex items-center justify-between rounded-lg border px-3 py-2">
                <div className="text-sm">
                  <span className="mr-2">{BADGE_LABELS[b.kind]?.emoji ?? "✨"}</span>
                  <span className="font-medium">{BADGE_LABELS[b.kind]?.label ?? b.kind}</span>
                  <span className="ml-2 text-xs text-muted-foreground">source: {b.xion_address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Tier {b.tier}</Badge>
                  <span className="text-xs text-muted-foreground">{new Date(b.verified_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
            {dbBadges.length === 0 && <div className="text-sm text-muted-foreground">No on-chain badges yet.</div>}
          </div>
        </div>
      </main>
      <BadgeScanWizard open={scanOpen} onOpenChange={setScanOpen} />
    </div>
  );
};

export default BadgesAll;
