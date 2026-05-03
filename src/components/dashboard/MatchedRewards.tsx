import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Gift, ChevronRight, Lock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDemo } from "./QuickStats";
import { findCatalogByKind } from "@/lib/demoMode";

/**
 * Compact reward preview for the dashboard. Shows the 3 best matches —
 * unlocked first. Locked cards become an actionable CTA, not a dead state.
 */
type Props = { onScan: () => void };

export const MatchedRewards = ({ onScan }: Props) => {
  const s = useDemo();
  const userKinds = new Set(s.badges.filter((b) => !b.hidden).map((b) => b.kind));

  const items = useMemo(() => {
    const all = s.rewards
      .filter((r) => !r.claimed)
      .map((r) => ({
        ...r,
        unlocked: !r.requiredBadgeKind || userKinds.has(r.requiredBadgeKind),
      }));
    return all
      .sort((a, b) => Number(b.unlocked) - Number(a.unlocked))
      .slice(0, 3);
  }, [s.rewards, s.badges]);

  return (
    <div className="glass-strong rounded-3xl p-5 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Gift className="h-4 w-4 text-primary" />
          <h2 className="font-display text-base font-semibold">Matched for you</h2>
        </div>
        <Link to="/rewards" className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-0.5">
          Open box <ChevronRight className="h-3 w-3" />
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/60 p-5 text-center text-xs text-muted-foreground">
          No rewards yet — verify a signal to unlock matches.
        </div>
      ) : (
        <ul className="space-y-2.5">
          {items.map((r) => {
            const required = r.requiredBadgeKind ? findCatalogByKind(r.requiredBadgeKind) : null;
            return (
              <li
                key={r.id}
                className={`rounded-2xl p-3.5 border flex items-center gap-3 transition-colors ${
                  r.unlocked
                    ? "border-glass-border bg-background/40"
                    : "border-dashed border-border/60 bg-background/20"
                }`}
              >
                <div className={`h-11 w-11 rounded-xl grid place-items-center text-xl shrink-0 ${
                  r.unlocked ? "bg-accent/15 text-accent" : "bg-muted/40 text-muted-foreground"
                }`}>
                  {r.unlocked ? <Sparkles className="h-5 w-5" /> : <Lock className="h-4 w-4" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground truncate">{r.brand ?? "Partner"}</div>
                  <div className="text-sm font-semibold leading-tight truncate">{r.title}</div>
                  {r.benefit && <div className="text-[11px] text-primary mt-0.5 truncate">{r.benefit}</div>}
                </div>
                {r.unlocked ? (
                  <Button size="sm" asChild className="bg-gradient-primary shrink-0 h-8">
                    <Link to="/rewards">Claim</Link>
                  </Button>
                ) : (
                  <Button size="sm" variant="outline" onClick={onScan} className="shrink-0 h-8 text-xs">
                    Verify {required?.label ? required.label.split(" ")[0] : "signal"}
                  </Button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
