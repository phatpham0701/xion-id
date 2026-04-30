import { useEffect, useState } from "react";
import { Activity, Eye, MousePointerClick } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Event = {
  id: number;
  created_at: string;
  event_type: string;
  block_id: string | null;
  referrer: string | null;
  blockTitle?: string;
};

const timeAgo = (iso: string) => {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86_400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86_400)}d ago`;
};

const cleanReferrer = (r: string | null): string | null => {
  if (!r) return null;
  try {
    const u = new URL(r);
    return u.hostname.replace(/^www\./, "");
  } catch { return null; }
};

export const RecentActivity = ({ profileId }: { profileId: string }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("analytics_events")
        .select("id, created_at, event_type, block_id, referrer")
        .eq("profile_id", profileId)
        .order("created_at", { ascending: false })
        .limit(15);
      if (cancelled) return;
      const items = (data ?? []) as Event[];

      // Resolve block titles
      const blockIds = [...new Set(items.map((e) => e.block_id).filter(Boolean))] as string[];
      let titleMap = new Map<string, string>();
      if (blockIds.length > 0) {
        const { data: blocks } = await supabase
          .from("blocks").select("id, type, config").in("id", blockIds);
        titleMap = new Map((blocks ?? []).map((b) => {
          const cfg = (b.config ?? {}) as Record<string, string>;
          return [b.id as string, cfg.title || cfg.text || cfg.name || cfg.label || (b.type as string)];
        }));
      }
      setEvents(items.map((e) => ({ ...e, blockTitle: e.block_id ? titleMap.get(e.block_id) : undefined })));
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [profileId]);

  return (
    <div className="glass-strong rounded-3xl p-6 md:p-8">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="h-4 w-4 text-primary" />
        <h2 className="font-display text-lg font-semibold">Recent activity</h2>
      </div>

      {loading ? (
        <div className="text-sm text-muted-foreground">Loading…</div>
      ) : events.length === 0 ? (
        <div className="text-center py-10">
          <div className="text-4xl mb-3">👀</div>
          <div className="font-medium mb-1">No visitors yet</div>
          <div className="text-sm text-muted-foreground">Share your link to start collecting visits.</div>
        </div>
      ) : (
        <ul className="divide-y divide-border/40">
          {events.map((e) => {
            const isClick = e.event_type === "block_click";
            const ref = cleanReferrer(e.referrer);
            return (
              <li key={e.id} className="flex items-center gap-3 py-2.5">
                <div className={`h-7 w-7 rounded-lg grid place-items-center shrink-0 ${isClick ? "bg-primary/15 text-primary" : "bg-secondary/15 text-secondary"}`}>
                  {isClick ? <MousePointerClick className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm truncate">
                    {isClick
                      ? <>Clicked <span className="font-medium">{e.blockTitle ?? "a block"}</span></>
                      : <>Profile viewed{ref ? <> from <span className="font-medium">{ref}</span></> : null}</>}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground shrink-0 tabular-nums">{timeAgo(e.created_at)}</div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
