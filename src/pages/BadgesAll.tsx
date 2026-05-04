import { useEffect, useMemo, useState } from "react";
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
import { type BadgeCategory, type BadgeTier, type DemoBadge } from "@/lib/demoMode";

type WalletBadgeRow = { id: string; kind: BadgeKind; tier: number; verified_at: string; xion_address: string };

const TIER_NAME: Record<number, BadgeTier> = { 1: "silver", 2: "gold", 3: "diamond" };

const BADGE_KIND_META: Partial<Record<BadgeKind, { category: BadgeCategory; description: string }>> = {
  og_2024: { category: "identity", description: "Early verified member." },
  og_2025: { category: "identity", description: "Verified member from the 2025 cohort." },
  nft_collector: { category: "lifestyle", description: "Collected verified proof." },
  nft_minter: { category: "activity", description: "Created a verified badge record." },
  tipper: { category: "support", description: "Supported others through verified support." },
  dapp_explorer: { category: "activity", description: "Explored partner experiences." },
  campaign_participant: { category: "community", description: "Joined a verified campaign." },
  contest_winner: { category: "community", description: "Recognized for a verified achievement." },
  whale: { category: "identity", description: "Recognized as a high-value supporter." },
  early_adopter: { category: "identity", description: "One of the earliest XIONID adopters." },
};

const toTitle = (kind: string) =>
  kind
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const mapWalletBadgeToUiBadge = (row: WalletBadgeRow): DemoBadge => {
  const known = BADGE_LABELS[row.kind as BadgeKind];
  const meta = BADGE_KIND_META[row.kind as BadgeKind];
  const safeTier = TIER_NAME[row.tier] ?? "silver";

  return {
    id: `wallet-${row.id}`,
    kind: row.kind,
    label: known?.label ?? toTitle(row.kind),
    emoji: known?.emoji ?? "✨",
    description: meta?.description ?? "Imported from your verified badge inventory.",
    tier: row.tier,
    tierName: safeTier,
    category: meta?.category ?? "identity",
    verifiedAt: row.verified_at,
    featured: true,
    privacyNote: row.xion_address ? `Verified source: ${row.xion_address}.` : "Verified record. You control whether this appears on your profile.",
  };
};

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

  const walletUiBadges = useMemo(() => dbBadges.map(mapWalletBadgeToUiBadge), [dbBadges]);

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
        <BadgesPanel onScan={() => setScanOpen(true)} extraBadges={walletUiBadges} />
      </main>
      <BadgeScanWizard open={scanOpen} onOpenChange={setScanOpen} />
    </div>
  );
};

export default BadgesAll;
