import { Activity, Award, Gift, Heart, ScanLine, Megaphone, User, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useDemo } from "./QuickStats";

const ICONS: Record<string, LucideIcon> = {
  badge: Award,
  reward: Sparkles,
  offer: Gift,
  scan: ScanLine,
  support: Heart,
  campaign: Megaphone,
  profile: User,
};

const timeAgo = (iso: string) => {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86_400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86_400)}d ago`;
};

export const DemoActivity = () => {
  const s = useDemo();
  return (
    <div className="glass-strong rounded-3xl p-5 md:p-6">
      <div className="flex items-center gap-2 mb-3">
        <Activity className="h-4 w-4 text-primary" />
        <h2 className="font-display text-base font-semibold">Recent activity</h2>
      </div>
      {s.activity.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/60 p-5 text-center text-xs text-muted-foreground">
          Nothing yet — run a quick action to see it here.
        </div>
      ) : (
        <ul className="divide-y divide-border/40">
          {s.activity.map((a) => {
            const Icon = ICONS[a.kind] ?? Activity;
            return (
              <li key={a.id} className="flex items-center gap-3 py-2.5">
                <div className="h-7 w-7 rounded-lg bg-primary/15 text-primary grid place-items-center shrink-0">
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium truncate">{a.title}</div>
                  {a.detail && <div className="text-[11px] text-muted-foreground truncate">{a.detail}</div>}
                </div>
                <div className="text-[11px] text-muted-foreground shrink-0 tabular-nums">{timeAgo(a.at)}</div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
