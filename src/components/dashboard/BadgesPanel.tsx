import { useMemo, useState } from "react";
import { Award, Plus, Eye, EyeOff, Star, ShieldCheck, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ProofSeal, ProofSealCard } from "@/components/badges/ProofSeal";
import { useDemo } from "./QuickStats";
import {
  BADGE_CATEGORY_META,
  BADGE_TIER_META,
  setBadgeFeatured,
  setBadgeHidden,
  type BadgeCategory,
  type BadgeTier,
} from "@/lib/demoMode";
import { persistBadgeToPublicProfile, persistBadgeVisibility, removeBadgeFromPublicProfile } from "@/lib/publicBadges";
import { toast } from "sonner";

type Props = {
  onScan: () => void;
};

const ALL = "all" as const;
type Filter<T extends string> = typeof ALL | T;

export const BadgesPanel = ({ onScan }: Props) => {
  const s = useDemo();
  const [cat, setCat] = useState<Filter<BadgeCategory>>(ALL);
  const [tier, setTier] = useState<Filter<BadgeTier>>(ALL);
  const [openId, setOpenId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return s.badges.filter((b) => {
      if (cat !== ALL && b.category !== cat) return false;
      if (tier !== ALL && b.tierName !== tier) return false;
      return true;
    });
  }, [s.badges, cat, tier]);

  const recent = [...s.badges]
    .sort((a, b) => +new Date(b.verifiedAt) - +new Date(a.verifiedAt))
    .slice(0, 3);

  const open = openId ? s.badges.find((b) => b.id === openId) ?? null : null;

  return (
    <div className="glass-strong rounded-3xl p-5 md:p-6">
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Award className="h-4 w-4 text-primary" />
          <h2 className="font-display text-base font-semibold">Badges</h2>
          <Badge variant="secondary" className="text-[10px]">{s.badges.length}</Badge>
        </div>
        <Button size="sm" onClick={onScan} className="bg-gradient-primary">
          <Plus className="h-3.5 w-3.5" /> Verify a signal
        </Button>
      </div>

      {/* Recently issued */}
      {recent.length > 0 && (
        <div className="mb-4">
          <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-2">Recently issued</div>
          <div className="flex gap-2.5 overflow-x-auto pb-1">
            {recent.map((b) => (
              <button
                key={b.id}
                onClick={() => setOpenId(b.id)}
                className="shrink-0 rounded-2xl border border-glass-border bg-background/40 hover:border-primary/40 transition-all px-3 py-2 flex items-center gap-2.5 min-w-[200px]"
              >
                <ProofSeal emoji={b.emoji} tier={b.tierName} size="sm" />
                <div className="text-left min-w-0">
                  <div className="text-xs font-semibold truncate">{b.label}</div>
                  <div className="text-[10px] text-muted-foreground">{BADGE_TIER_META[b.tierName].label}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <Filter className="h-3.5 w-3.5 text-muted-foreground" />
        <FilterChip label="All" active={cat === ALL} onClick={() => setCat(ALL)} />
        {(Object.keys(BADGE_CATEGORY_META) as BadgeCategory[]).map((k) => (
          <FilterChip
            key={k}
            label={`${BADGE_CATEGORY_META[k].emoji} ${BADGE_CATEGORY_META[k].label}`}
            active={cat === k}
            onClick={() => setCat(k)}
          />
        ))}
      </div>
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <FilterChip label="All tiers" active={tier === ALL} onClick={() => setTier(ALL)} />
        {(Object.keys(BADGE_TIER_META) as BadgeTier[]).map((k) => (
          <FilterChip
            key={k}
            label={`${BADGE_TIER_META[k].emoji} ${BADGE_TIER_META[k].label}`}
            active={tier === k}
            onClick={() => setTier(k)}
          />
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/60 p-6 text-center">
          <p className="text-sm text-muted-foreground">No badges in this filter yet.</p>
          <Button size="sm" variant="outline" className="mt-3" onClick={onScan}>Scan for a badge</Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
          {filtered.map((b) => (
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

      {/* Detail modal */}
      <Dialog open={!!open} onOpenChange={(o) => !o && setOpenId(null)}>
        <DialogContent className="max-w-md">
          {open && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-xl">{open.label}</DialogTitle>
                <DialogDescription className="flex items-center gap-2 flex-wrap">
                  <Badge variant="secondary" className="text-[10px]">
                    {BADGE_TIER_META[open.tierName].label}
                  </Badge>
                  <Badge variant="outline" className="text-[10px]">
                    {BADGE_CATEGORY_META[open.category].label}
                  </Badge>
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
                  onClick={async () => {
                    const next = !open.featured;
                    setBadgeFeatured(open.id, next);
                    try {
                      if (next) await persistBadgeToPublicProfile(open, { featured: true, hidden: false });
                      else await persistBadgeVisibility(open, { featured: false });
                    } catch {
                      toast.error("Could not update public profile. Please try again.");
                      return;
                    }
                    toast.success(next ? "Badge added to public profile" : "Removed from public profile");
                  }}
                  className={open.featured ? "bg-gradient-primary" : ""}
                >
                  <Star className="h-4 w-4" />
                  {open.featured ? "Featured" : "Feature on profile"}
                </Button>
                <Button
                  variant="outline"
                  onClick={async () => {
                    const next = !open.hidden;
                    setBadgeHidden(open.id, next);
                    try {
                      if (next) await removeBadgeFromPublicProfile(open.id);
                      else await persistBadgeToPublicProfile(open, { featured: open.featured ?? false, hidden: false });
                    } catch {
                      toast.error("Could not update public profile. Please try again.");
                      return;
                    }
                    toast.success(next ? "Badge hidden from public profile" : "Badge visible");
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

const FilterChip = ({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`text-[11px] px-2.5 py-1 rounded-full border transition-colors ${
      active
        ? "bg-primary text-primary-foreground border-primary"
        : "bg-background/40 border-glass-border text-muted-foreground hover:text-foreground hover:border-border"
    }`}
  >
    {label}
  </button>
);
