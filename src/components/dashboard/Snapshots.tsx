import { Award, Sparkles } from "lucide-react";
import { useDemo } from "./QuickStats";

export const BadgeInventory = () => {
  const s = useDemo();
  return (
    <div className="glass-strong rounded-3xl p-5 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Award className="h-4 w-4 text-primary" />
          <h2 className="font-display text-base font-semibold">Badge inventory</h2>
        </div>
        <span className="text-[11px] text-muted-foreground">{s.badges.length} verified</span>
      </div>
      {s.badges.length === 0 ? (
        <Empty />
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {s.badges.map((b) => (
            <div key={b.id} className="rounded-2xl border border-glass-border bg-background/40 p-3 text-center">
              <div className="text-2xl">{b.emoji}</div>
              <div className="text-xs font-semibold mt-1 truncate">{b.label}</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">Tier {b.tier}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const RewardLocker = () => {
  const s = useDemo();
  return (
    <div className="glass-strong rounded-3xl p-5 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h2 className="font-display text-base font-semibold">Reward locker</h2>
        </div>
        <span className="text-[11px] text-muted-foreground">
          {s.rewards.filter((r) => r.claimed).length}/{s.rewards.length} claimed
        </span>
      </div>
      {s.rewards.length === 0 ? (
        <Empty />
      ) : (
        <ul className="space-y-2">
          {s.rewards.map((r) => (
            <li
              key={r.id}
              className="rounded-2xl border border-glass-border bg-background/30 p-3 flex items-center gap-3"
            >
              <div className="h-8 w-8 rounded-xl bg-primary/15 grid place-items-center text-primary">🎁</div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold truncate">{r.title}</div>
                <div className="text-[11px] text-muted-foreground line-clamp-1">{r.description}</div>
              </div>
              <span
                className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  r.claimed ? "bg-primary/15 text-primary" : "bg-muted/40 text-muted-foreground"
                }`}
              >
                {r.claimed ? "Claimed" : `${r.cost} pts`}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const Empty = () => (
  <div className="rounded-2xl border border-dashed border-border/60 p-5 text-center text-xs text-muted-foreground">
    Nothing here yet — try a quick action above.
  </div>
);
