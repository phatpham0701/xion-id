import { useEffect, useMemo, useState } from "react";
import { BarChart3, MousePointerClick, TrendingUp, Trophy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type DayPoint = { day: string; count: number };
type TopBlock = { block_id: string; title: string; type: string; clicks: number };

type Props = { profileId: string };

const DAYS = 7;

const last7Days = (): string[] => {
  const out: string[] = [];
  for (let i = DAYS - 1; i >= 0; i--) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
};

const Sparkline = ({ data, accent = "primary" }: { data: number[]; accent?: "primary" | "secondary" }) => {
  const max = Math.max(...data, 1);
  const w = 120;
  const h = 32;
  const step = w / Math.max(data.length - 1, 1);
  const pts = data.map((v, i) => `${i * step},${h - (v / max) * h}`).join(" ");
  const color = accent === "primary" ? "hsl(var(--primary))" : "hsl(var(--secondary))";
  return (
    <svg width={w} height={h} className="overflow-visible">
      <polyline fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" points={pts} />
      {data.map((v, i) => (
        <circle key={i} cx={i * step} cy={h - (v / max) * h} r={1.5} fill={color} />
      ))}
    </svg>
  );
};

export const AnalyticsPanel = ({ profileId }: Props) => {
  const [views, setViews] = useState<DayPoint[]>([]);
  const [clicks, setClicks] = useState<DayPoint[]>([]);
  const [top, setTop] = useState<TopBlock[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const since = new Date(Date.now() - DAYS * 86_400_000).toISOString();

      const [{ data: events }, { data: blocks }] = await Promise.all([
        supabase
          .from("analytics_events")
          .select("event_type, block_id, created_at")
          .eq("profile_id", profileId)
          .gte("created_at", since)
          .order("created_at", { ascending: true })
          .limit(5000),
        supabase
          .from("blocks")
          .select("id, type, config")
          .eq("profile_id", profileId),
      ]);
      if (cancelled) return;

      // Aggregate per day
      const days = last7Days();
      const viewMap = new Map(days.map((d) => [d, 0]));
      const clickMap = new Map(days.map((d) => [d, 0]));
      const blockClicks = new Map<string, number>();

      (events ?? []).forEach((e) => {
        const day = (e.created_at as string).slice(0, 10);
        if (e.event_type === "profile_view" && viewMap.has(day)) {
          viewMap.set(day, (viewMap.get(day) ?? 0) + 1);
        } else if (e.event_type === "block_click") {
          if (clickMap.has(day)) clickMap.set(day, (clickMap.get(day) ?? 0) + 1);
          if (e.block_id) blockClicks.set(e.block_id as string, (blockClicks.get(e.block_id as string) ?? 0) + 1);
        }
      });

      setViews(days.map((d) => ({ day: d, count: viewMap.get(d) ?? 0 })));
      setClicks(days.map((d) => ({ day: d, count: clickMap.get(d) ?? 0 })));

      // Top blocks
      const blockMap = new Map((blocks ?? []).map((b) => [b.id as string, b]));
      const ranked: TopBlock[] = [...blockClicks.entries()]
        .map(([block_id, count]) => {
          const b = blockMap.get(block_id);
          const cfg = (b?.config ?? {}) as Record<string, string>;
          const title = cfg.title || cfg.text || cfg.name || cfg.label || (b?.type ?? "Block");
          return { block_id, title: String(title).slice(0, 40), type: String(b?.type ?? "block"), clicks: count };
        })
        .sort((a, b) => b.clicks - a.clicks)
        .slice(0, 5);
      setTop(ranked);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [profileId]);

  const totalViews = useMemo(() => views.reduce((s, d) => s + d.count, 0), [views]);
  const totalClicks = useMemo(() => clicks.reduce((s, d) => s + d.count, 0), [clicks]);
  const ctr = totalViews > 0 ? Math.round((totalClicks / totalViews) * 100) : 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Stat
          icon={BarChart3}
          label="Views (7d)"
          value={totalViews}
          spark={<Sparkline data={views.map((v) => v.count)} accent="secondary" />}
        />
        <Stat
          icon={MousePointerClick}
          label="Clicks (7d)"
          value={totalClicks}
          spark={<Sparkline data={clicks.map((v) => v.count)} accent="primary" />}
        />
      </div>

      <div className="glass rounded-3xl p-5">
        <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground mb-3">
          <TrendingUp className="h-3.5 w-3.5" />
          Click-through rate
        </div>
        <div className="flex items-baseline gap-2">
          <div className="font-display text-3xl font-bold">{ctr}%</div>
          <div className="text-xs text-muted-foreground">{totalClicks} of {totalViews} views</div>
        </div>
      </div>

      <div className="glass rounded-3xl p-5">
        <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground mb-3">
          <Trophy className="h-3.5 w-3.5" />
          Top blocks (7d)
        </div>
        {loading ? (
          <div className="text-xs text-muted-foreground">Loading…</div>
        ) : top.length === 0 ? (
          <div className="text-xs text-muted-foreground">No clicks yet — share your link to start collecting data.</div>
        ) : (
          <ul className="space-y-2">
            {top.map((b, i) => (
              <li key={b.block_id} className="flex items-center gap-3">
                <span className="h-6 w-6 rounded-md glass grid place-items-center text-[10px] font-mono text-muted-foreground shrink-0">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium truncate">{b.title}</div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{b.type}</div>
                </div>
                <div className="text-sm font-semibold tabular-nums">{b.clicks}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

const Stat = ({
  icon: Icon, label, value, spark,
}: {
  icon: typeof BarChart3; label: string; value: number; spark: React.ReactNode;
}) => (
  <div className="glass rounded-3xl p-5">
    <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground mb-2">
      <Icon className="h-3.5 w-3.5" />
      {label}
    </div>
    <div className="flex items-end justify-between gap-2">
      <div className="font-display text-3xl font-bold tabular-nums">{value}</div>
      <div className="opacity-80">{spark}</div>
    </div>
  </div>
);
