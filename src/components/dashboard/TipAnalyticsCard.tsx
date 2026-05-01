import { useEffect, useState } from "react";
import { Heart, ExternalLink, Loader2, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { XION_CONFIG, truncateAddress } from "@/lib/xion";
import { formatXion } from "@/lib/tipJar";

type Tip = {
  id: string;
  sender_address: string;
  amount_uxion: number;
  message: string | null;
  tx_hash: string;
  created_at: string;
};

export const TipAnalyticsCard = ({ profileId }: { profileId: string }) => {
  const [tips, setTips] = useState<Tip[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data, error } = await supabase
        .from("tips")
        .select("id, sender_address, amount_uxion, message, tx_hash, created_at")
        .eq("profile_id", profileId)
        .order("created_at", { ascending: false })
        .limit(8);
      if (!active) return;
      if (!error) setTips((data || []) as Tip[]);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [profileId]);

  const totalUxion = (tips ?? []).reduce((sum, t) => sum + Number(t.amount_uxion), 0);
  const tipCount = tips?.length ?? 0;

  return (
    <div className="glass-strong rounded-3xl p-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-10 w-10 rounded-2xl bg-primary/15 grid place-items-center text-primary">
          <Heart className="h-4 w-4" strokeWidth={2.5} />
        </div>
        <div className="flex-1">
          <h3 className="font-display font-semibold tracking-tight">On-chain tips</h3>
          <p className="text-xs text-muted-foreground">Verified XION transactions</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="rounded-2xl border border-border/50 bg-background/40 p-3">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Total received</div>
          <div className="mt-1 font-display text-xl font-bold">
            {loading ? "—" : `${formatXion(totalUxion)} XION`}
          </div>
        </div>
        <div className="rounded-2xl border border-border/50 bg-background/40 p-3">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Tips count</div>
          <div className="mt-1 font-display text-xl font-bold flex items-center gap-1">
            {loading ? "—" : tipCount}
            {tipCount > 0 ? <TrendingUp className="h-3.5 w-3.5 text-primary" /> : null}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-6 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
      ) : tipCount === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/50 bg-background/30 p-4 text-center">
          <p className="text-xs text-muted-foreground">
            No tips yet. Add a Tip Jar block to your profile and share your link.
          </p>
        </div>
      ) : (
        <ul className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {tips!.map((t) => (
            <li
              key={t.id}
              className="rounded-2xl border border-border/40 bg-background/40 p-3 hover:border-primary/30 transition-colors"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="font-display text-sm font-bold text-foreground">
                  +{formatXion(t.amount_uxion)} XION
                </div>
                <a
                  href={XION_CONFIG.explorerTx(t.tx_hash)}
                  target="_blank"
                  rel="noreferrer"
                  className="text-muted-foreground hover:text-primary"
                  aria-label="View transaction"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
              <div className="mt-1 flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
                <span className="font-mono truncate">
                  from {truncateAddress(t.sender_address, 6, 4)}
                </span>
                <span className="shrink-0">
                  {new Date(t.created_at).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
              {t.message ? (
                <p className="mt-1.5 text-xs text-foreground/80 italic line-clamp-2">"{t.message}"</p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
