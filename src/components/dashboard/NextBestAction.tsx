import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDemo } from "./QuickStats";

/**
 * Calm, single-call-to-action card that always tells the user the best
 * next move based on demo state.
 */
type Props = {
  onPrimary: () => void;
};

export const NextBestAction = ({ onPrimary }: Props) => {
  const s = useDemo();

  const verifiedCount = s.badges.length;
  const claimedCount = s.rewards.filter((r) => r.claimed).length;

  const copy = (() => {
    if (verifiedCount === 0) {
      return {
        eyebrow: "Next best action",
        title: "Verify your first signal to unlock more rewards.",
        sub: "Add a proof you already have — it takes 20 seconds.",
        cta: "Verify a signal",
      };
    }
    if (claimedCount === 0) {
      return {
        eyebrow: "You're eligible",
        title: "Claim your first reward — it's matched to your proof.",
        sub: "Open the box to see what your badges unlock.",
        cta: "Open Offer Box",
      };
    }
    return {
      eyebrow: "Keep going",
      title: "Verify another signal to expand your matches.",
      sub: "More proof means sharper, more relevant offers.",
      cta: "Verify a signal",
    };
  })();

  return (
    <div className="relative overflow-hidden rounded-3xl border border-primary/30 p-5 md:p-6">
      <div
        className="absolute inset-0 opacity-90"
        style={{
          background:
            "radial-gradient(120% 120% at 0% 0%, hsl(246 89% 67% / 0.35), transparent 55%), radial-gradient(120% 120% at 100% 100%, hsl(165 71% 50% / 0.30), transparent 55%), hsl(219 50% 12% / 0.85)",
        }}
        aria-hidden
      />
      <div className="relative flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
        <div className="h-12 w-12 rounded-2xl bg-background/50 border border-glass-border grid place-items-center shrink-0">
          <Sparkles className="h-5 w-5 text-accent" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[10px] uppercase tracking-[0.18em] text-accent font-medium">{copy.eyebrow}</div>
          <h3 className="font-display text-lg md:text-xl font-semibold leading-snug mt-0.5">{copy.title}</h3>
          <p className="text-sm text-muted-foreground mt-1">{copy.sub}</p>
        </div>
        <Button onClick={onPrimary} size="lg" className="bg-gradient-primary shrink-0 group">
          {copy.cta}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Button>
      </div>
    </div>
  );
};
