import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BADGE_LABELS, type BadgeKind } from "@/lib/badgeScanner";
import { Award } from "lucide-react";

type Props = { profileId: string };

type Row = { id: string; kind: BadgeKind; tier: number };

/** Compact public-facing badge strip rendered above blocks on the profile. */
export const PublicBadgesStrip = ({ profileId }: Props) => {
  const [badges, setBadges] = useState<Row[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("wallet_badges")
        .select("id, kind, tier")
        .eq("profile_id", profileId);
      if (!cancelled) setBadges((data || []) as Row[]);
    })();
    return () => {
      cancelled = true;
    };
  }, [profileId]);

  if (badges.length === 0) return null;

  return (
    <div className="mb-3 flex items-center gap-2 overflow-x-auto rounded-2xl border border-white/10 bg-background/40 px-3 py-2 backdrop-blur">
      <Award className="h-3.5 w-3.5 shrink-0 text-primary" />
      <div className="flex items-center gap-1.5">
        {badges.map((b) => {
          const meta = BADGE_LABELS[b.kind] || { label: b.kind, emoji: "✨", description: "" };
          return (
            <div
              key={b.id}
              title={`${meta.label} · Tier ${b.tier}`}
              className="inline-flex shrink-0 items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary"
            >
              <span>{meta.emoji}</span>
              <span>{meta.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
