import { Eye, ExternalLink, Copy, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useDemo } from "./QuickStats";
import { ProofSeal } from "@/components/badges/ProofSeal";

type Props = {
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  isPublished: boolean;
};

export const PublicProfilePreview = ({ username, displayName, avatarUrl, bio, isPublished }: Props) => {
  const url = typeof window !== "undefined" ? `${window.location.origin}/${username}` : `/${username}`;
  const initial = (displayName || username || "X").slice(0, 1).toUpperCase();
  const demo = useDemo();
  const featured = demo.badges.filter((b) => b.featured && !b.hidden).slice(0, 6);

  const copy = async () => {
    await navigator.clipboard.writeText(url);
    toast.success("Link copied");
  };

  return (
    <div className="glass-strong rounded-3xl p-5 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-primary" />
          <h2 className="font-display text-base font-semibold">Public profile preview</h2>
        </div>
        <span
          className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ${
            isPublished ? "bg-primary/15 text-primary" : "bg-muted/40 text-muted-foreground"
          }`}
        >
          {isPublished ? "Live" : "Hidden"}
        </span>
      </div>

      <div className="rounded-2xl border border-glass-border bg-background/40 p-4">
        <div className="flex items-center gap-3">
          {avatarUrl ? (
            <img src={avatarUrl} alt={displayName ?? username} className="h-12 w-12 rounded-2xl object-cover" />
          ) : (
            <div className="h-12 w-12 rounded-2xl bg-gradient-primary grid place-items-center text-primary-foreground font-display text-lg font-semibold">
              {initial}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="font-display font-semibold truncate">{displayName || username}</div>
            <div className="text-xs text-muted-foreground truncate">@{username}</div>
          </div>
        </div>
        {bio && <p className="text-sm text-foreground/80 mt-3 leading-relaxed line-clamp-3">{bio}</p>}

        {featured.length > 0 && (
          <div className="mt-3 pt-3 border-t border-border/40">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Featured badges</div>
            <div className="flex flex-wrap gap-1.5">
              {featured.map((b) => (
                <div
                  key={b.id}
                  title={`${b.label} · ${BADGE_TIER_META[b.tierName].label}`}
                  className={`h-8 w-8 rounded-xl grid place-items-center text-base bg-gradient-to-br ${BADGE_TIER_META[b.tierName].ring}`}
                >
                  {b.emoji}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-3 glass rounded-2xl px-3 py-2 flex items-center gap-2">
        <Globe className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        <span className="text-xs font-mono truncate flex-1">{url}</span>
        <Button size="sm" variant="ghost" onClick={copy} className="h-7 px-2" aria-label="Copy link">
          <Copy className="h-3.5 w-3.5" />
        </Button>
        <Button size="sm" variant="ghost" asChild className="h-7 px-2" aria-label="Open">
          <a href={`/${username}`} target="_blank" rel="noreferrer">
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </Button>
      </div>
    </div>
  );
};
