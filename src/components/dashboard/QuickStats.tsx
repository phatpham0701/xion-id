import { useEffect, useState } from "react";
import { Award, Gift, Sparkles, Megaphone } from "lucide-react";
import { getDemoState, type DemoState } from "@/lib/demoMode";

const useDemo = (): DemoState => {
  const [s, setS] = useState<DemoState>(() => getDemoState());
  useEffect(() => {
    const refresh = () => setS(getDemoState());
    window.addEventListener("xionid:demo:change", refresh);
    return () => window.removeEventListener("xionid:demo:change", refresh);
  }, []);
  return s;
};

export const QuickStats = () => {
  const s = useDemo();
  const offersAvailable = s.offers.filter((o) => o.unlocked).length;
  const rewardsClaimed = s.rewards.filter((r) => r.claimed).length;
  const activeCampaigns = s.campaigns.filter((c) => c.joined).length;

  const stats = [
    { label: "Badges", value: s.badges.length, icon: Award },
    { label: "Available offers", value: offersAvailable, icon: Gift },
    { label: "Claimed rewards", value: rewardsClaimed, icon: Sparkles },
    { label: "Active campaigns", value: activeCampaigns, icon: Megaphone },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {stats.map((s) => (
        <div key={s.label} className="glass rounded-2xl p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-[11px] uppercase tracking-wider">
            <s.icon className="h-3.5 w-3.5 text-primary" />
            {s.label}
          </div>
          <div className="font-display text-2xl font-bold mt-1.5">{s.value}</div>
        </div>
      ))}
    </div>
  );
};

export { useDemo };
