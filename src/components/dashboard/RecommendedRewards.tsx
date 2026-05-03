import { Gift, ChevronRight, Lock } from "lucide-react";
import { useDemo } from "./QuickStats";
import { toast } from "sonner";

export const RecommendedRewards = () => {
  const s = useDemo();
  const items = s.offers.slice(0, 4);

  return (
    <div className="glass-strong rounded-3xl p-5 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Gift className="h-4 w-4 text-primary" />
          <h2 className="font-display text-base font-semibold">Recommended for you</h2>
        </div>
        <button className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-0.5">
          See all <ChevronRight className="h-3 w-3" />
        </button>
      </div>

      <div className="grid sm:grid-cols-2 gap-2.5">
        {items.map((o) => (
          <button
            key={o.id}
            onClick={() =>
              o.unlocked
                ? toast.success(`Offer redeemed: ${o.title}`, { description: `${o.brand} · demo` })
                : toast.message(`Locked — keep collecting badges`, { description: o.blurb })
            }
            className={`text-left rounded-2xl p-3.5 border transition-all ${
              o.unlocked
                ? "border-glass-border bg-background/30 hover:border-primary/40"
                : "border-dashed border-border/60 bg-background/20 hover:border-border"
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 grid place-items-center text-xl">{o.emoji}</div>
              <div className="min-w-0 flex-1">
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{o.brand}</div>
                <div className="text-sm font-semibold leading-tight">{o.title}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{o.blurb}</div>
              </div>
              {!o.unlocked && <Lock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
