import { useState } from "react";
import { Award, ChevronRight, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ProofSeal, ProofSealCard } from "@/components/badges/ProofSeal";
import { useDemo } from "./QuickStats";
import { BADGE_CATEGORY_META, BADGE_TIER_META, setBadgeFeatured, setBadgeHidden, type DemoBadge } from "@/lib/demoMode";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

type Props = {
  onScan: () => void;
};

export const FeaturedBadges = ({ onScan }: Props) => {
  const s = useDemo();
  const [openId, setOpenId] = useState<string | null>(null);

  // Featured (max 4) → fall back to most recent.
  const list: DemoBadge[] = (() => {
    const featured = s.badges.filter((b) => b.featured && !b.hidden);
    if (featured.length >= 4) return featured.slice(0, 4);
    const rest = [...s.badges]
      .filter((b) => !b.hidden && !featured.includes(b))
      .sort((a, b) => +new Date(b.verifiedAt) - +new Date(a.verifiedAt));
    return [...featured, ...rest].slice(0, 4);
  })();

  const open = openId ? s.badges.find((b) => b.id === openId) ?? null : null;

  return (
    <div className="glass-strong rounded-3xl p-5 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Award className="h-4 w-4 text-primary" />
          <h2 className="font-display text-base font-semibold">Featured proof</h2>
          <span className="text-[11px] text-muted-foreground">{s.badges.length} total</span>
        </div>
        <Link to="/badges" className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-0.5">
          View all <ChevronRight className="h-3 w-3" />
        </Link>
      </div>

      {list.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/60 p-6 text-center">
          <p className="text-sm text-muted-foreground">No proof yet.</p>
          <Button size="sm" className="mt-3 bg-gradient-primary" onClick={onScan}>Verify a signal</Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
          {list.map((b) => (
            <ProofSealCard
              key={b.id}
              label={b.label}
              emoji={b.emoji}
              tier={b.tierName}
              category={BADGE_CATEGORY_META[b.category].label}
              compact
              onClick={() => setOpenId(b.id)}
            />
          ))}
        </div>
      )}

      <Dialog open={!!open} onOpenChange={(o) => !o && setOpenId(null)}>
        <DialogContent className="max-w-md">
          {open && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-xl flex items-center gap-2">
                  {open.label}
                </DialogTitle>
                <DialogDescription>
                  {BADGE_TIER_META[open.tierName].label} · {BADGE_CATEGORY_META[open.category].label}
                </DialogDescription>
              </DialogHeader>
              <div className="rounded-2xl bg-background/40 border border-glass-border p-6 grid place-items-center">
                <ProofSeal emoji={open.emoji} tier={open.tierName} size="lg" />
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed">{open.description}</p>
              {open.privacyNote && (
                <p className="text-[11px] text-muted-foreground flex items-start gap-1.5 border-t border-border/40 pt-3">
                  <ShieldCheck className="h-3.5 w-3.5 text-accent mt-0.5 shrink-0" />
                  {open.privacyNote}
                </p>
              )}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Button
                  variant={open.featured ? "default" : "outline"}
                  onClick={() => {
                    const next = !open.featured;
                    setBadgeFeatured(open.id, next);
                    toast.success(next ? "Featured on profile" : "Removed from profile");
                  }}
                  className={open.featured ? "bg-gradient-primary" : ""}
                >
                  <Star className="h-4 w-4" />
                  {open.featured ? "Featured" : "Feature on profile"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    const next = !open.hidden;
                    setBadgeHidden(open.id, next);
                    toast.success(next ? "Badge hidden" : "Badge visible");
                  }}
                >
                  {open.hidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  {open.hidden ? "Show" : "Hide"}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
