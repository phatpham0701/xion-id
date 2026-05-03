import { useEffect, useState } from "react";
import { Sparkles, BadgeCheck } from "lucide-react";
import { getDemoState, getProfileCompleteness } from "@/lib/demoMode";

type Props = {
  displayName: string | null;
  username: string;
  avatarUrl: string | null;
  isPublished: boolean;
};

export const ProfileSummary = ({ displayName, username, avatarUrl, isPublished }: Props) => {
  const [pct, setPct] = useState<number>(() => getProfileCompleteness());
  const [identityClaimed, setIdentityClaimed] = useState<boolean>(() => getDemoState().profile.identityClaimed);

  useEffect(() => {
    const refresh = () => {
      const s = getDemoState();
      setPct(getProfileCompleteness(s));
      setIdentityClaimed(s.profile.identityClaimed);
    };
    window.addEventListener("xionid:demo:change", refresh);
    return () => window.removeEventListener("xionid:demo:change", refresh);
  }, []);

  const initial = (displayName || username || "X").slice(0, 1).toUpperCase();

  return (
    <div className="glass-strong rounded-3xl p-5 md:p-6">
      <div className="flex items-center gap-4">
        {avatarUrl ? (
          <img src={avatarUrl} alt={displayName ?? username} className="h-16 w-16 rounded-2xl object-cover" />
        ) : (
          <div className="h-16 w-16 rounded-2xl bg-gradient-primary grid place-items-center text-primary-foreground font-display text-2xl font-semibold">
            {initial}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="font-display text-xl font-semibold truncate">{displayName || username}</div>
            {identityClaimed && (
              <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider rounded-full bg-primary/15 text-primary px-2 py-0.5">
                <BadgeCheck className="h-3 w-3" /> Verified
              </span>
            )}
          </div>
          <div className="text-sm text-muted-foreground">@{username}</div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-[11px] glass rounded-full px-2.5 py-1">
          <span className={`h-1.5 w-1.5 rounded-full ${isPublished ? "bg-primary animate-pulse" : "bg-muted-foreground"}`} />
          <span className={isPublished ? "text-primary" : "text-muted-foreground"}>
            {isPublished ? "Visible" : "Hidden"}
          </span>
        </div>
      </div>

      <div className="mt-5">
        <div className="flex items-center justify-between mb-1.5 text-xs">
          <span className="inline-flex items-center gap-1.5 text-muted-foreground">
            <Sparkles className="h-3 w-3 text-primary" /> Profile completeness
          </span>
          <span className="font-medium text-foreground">{pct}%</span>
        </div>
        <div className="h-2 rounded-full bg-muted/40 overflow-hidden">
          <div
            className="h-full bg-gradient-primary transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
};
