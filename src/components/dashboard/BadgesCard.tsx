import { useEffect, useState } from "react";
import { Award, Loader2, Sparkles, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useXionWallet } from "@/hooks/useXionWallet";
import { scanWallet, BADGE_LABELS, type BadgeKind } from "@/lib/badgeScanner";

type BadgeRow = {
  id: string;
  kind: BadgeKind;
  tier: number;
  verified_at: string;
  metadata: Record<string, unknown>;
};

type Props = { profileId: string };

export const BadgesCard = ({ profileId }: Props) => {
  const { address, isConnected } = useXionWallet();
  const [badges, setBadges] = useState<BadgeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);

  const load = async () => {
    const { data, error } = await supabase
      .from("wallet_badges")
      .select("id, kind, tier, verified_at, metadata")
      .eq("profile_id", profileId)
      .order("verified_at", { ascending: false });
    if (error) toast.error("Couldn't load badges", { description: error.message });
    setBadges((data || []) as BadgeRow[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [profileId]);

  const onScan = async () => {
    if (!address) {
      toast.error("Connect your wallet first");
      return;
    }
    setScanning(true);
    try {
      const result = await scanWallet(address, profileId);
      toast.success(`Scanned ${result.txCount} txs`, {
        description: `Awarded ${result.badges.length} badges · ${result.contracts} dApps`,
      });
      await load();
    } catch (err) {
      toast.error("Scan failed", { description: err instanceof Error ? err.message : "Try again" });
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="glass-strong rounded-3xl p-6 animate-fade-in">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-secondary to-primary grid place-items-center shadow-glow-primary glow-primary">
            <Award className="h-4 w-4 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="font-display font-semibold tracking-tight">On-chain Badges</h3>
            <p className="text-xs text-muted-foreground">
              {badges.length === 0 ? "No badges yet — scan to verify" : `${badges.length} verified on-chain`}
            </p>
          </div>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={onScan}
          disabled={!isConnected || scanning}
          className="glass border-glass-border"
        >
          {scanning ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <>
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
              {badges.length === 0 ? "Scan wallet" : "Re-scan"}
            </>
          )}
        </Button>
      </div>

      {!isConnected ? (
        <div className="rounded-2xl border border-dashed border-border/60 bg-background/40 p-5 text-center text-xs text-muted-foreground">
          <Sparkles className="h-4 w-4 mx-auto mb-1.5 text-primary" />
          Connect your XION wallet to scan transaction history and unlock badges.
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center py-6 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
      ) : badges.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/60 bg-background/40 p-5 text-center text-xs text-muted-foreground">
          Tap <strong>Scan wallet</strong> — we'll read your on-chain history and award badges
          like <em>OG 2024</em>, <em>NFT Collector</em>, and <em>dApp Explorer</em>.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {badges.map((b) => {
            const meta = BADGE_LABELS[b.kind] || {
              label: b.kind,
              emoji: "✨",
              description: "On-chain verified",
            };
            return (
              <div
                key={b.id}
                className="rounded-2xl border border-white/10 bg-gradient-to-br from-primary/10 to-secondary/10 p-3"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{meta.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold truncate">{meta.label}</div>
                    <div className="text-[9px] uppercase tracking-wider text-muted-foreground">
                      Tier {b.tier}
                    </div>
                  </div>
                </div>
                <p className="mt-1.5 text-[10px] leading-snug text-muted-foreground line-clamp-2">
                  {meta.description}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
