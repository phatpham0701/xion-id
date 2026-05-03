import { useState } from "react";
import { Award, ChevronRight, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useDemo } from "./QuickStats";
import { BADGE_CATEGORY_META, BADGE_TIER_META, setBadgeFeatured, setBadgeHidden, type DemoBadge } from "@/lib/demoMode";
import { persistBadgeToPublicProfile, persistBadgeVisibility, removeBadgeFromPublicProfile } from "@/lib/publicBadges";
import { toast } from "sonner";

type Props = {
  onScan: () => void;
};

const getTierStyle = (tierName: DemoBadge["tierName"]) => {
  if (tierName === "gold") {
    return {
      card: "border-amber-300/35 bg-gradient-to-br from-amber-300/10 via-card/70 to-card/90",
      seal: "from-amber-200 via-amber-400 to-amber-600 text-amber-950",
      chip: "border-amber-300/30 bg-amber-300/15 text-amber-100",
    };
  }

  if (tierName === "diamond") {
    return {
      card: "border-cyan-300/35 bg-gradient-to-br from-cyan-300/10 via-card/70 to-card/90",
      seal: "from-cyan-200 via-sky-300 to-violet-400 text-slate-950",
      chip: "border-cyan-300/30 bg-cyan-300/15 text-cyan-100",
    };
  }

  return {
    card: "border-slate-300/25 bg-gradient-to-br from-slate-200/8 via-card/70 to-card/90",
    seal: "from-slate-100 via-slate-300 to-slate-500 text-slate-950",
    chip: "border-slate-300/25 bg-slate-300/10 text-slate-200",
  };
};

const FeaturedProofCard = ({ badge, onClick }: { badge: DemoBadge; onClick: () => void }) => {
  const tierMeta = BADGE_TIER_META[badge.tierName];
  const categoryMeta = BADGE_CATEGORY_META[badge.category];
  const style = getTierStyle(badge.tierName);

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group w-full rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:bg-card/80 focus:outline-none focus:ring-2 focus:ring-primary/40 ${style.card}`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-xl font-black shadow-lg ${style.seal}`}
        >
          {badge.emoji}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold leading-tight text-foreground">{badge.label}</h3>

            <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase ${style.chip}`}>
              {tierMeta.label}
            </span>
          </div>

          <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {categoryMeta.label}
          </p>

          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{badge.description}</p>

          <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-300">
            <ShieldCheck className="h-3.5 w-3.5" />
            Proof verified
          </p>
        </div>
      </div>
    </button>
  );
};

export const FeaturedBadges = ({ onScan }: Props) => {
  const s = useDemo();
  const [openId, setOpenId] = useState<string | null>(null);

  const list: DemoBadge[] = (() => {
    const featured = s.badges.filter((b) => b.featured && !b.hidden);

    if (featured.length >= 4) return featured.slice(0, 4);

    const rest = [...s.badges]
      .filter((b) => !b.hidden && !featured.includes(b))
      .sort((a, b) => +new Date(b.verifiedAt) - +new Date(a.verifiedAt));

    return [...featured, ...rest].slice(0, 4);
  })();

  const open = openId ? (s.badges.find((badge) => badge.id === openId) ?? null) : null;

  return (
    <section className="rounded-3xl border border-glass-border bg-card/55 p-5 shadow-soft backdrop-blur-xl">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Award className="h-4 w-4 text-primary" />

          <h2 className="font-display text-lg font-semibold">Featured proof</h2>

          <span className="text-sm text-muted-foreground">{s.badges.length} total</span>
        </div>

        <Button variant="ghost" size="sm" asChild className="gap-1 text-muted-foreground">
          <Link to="/badges">
            View all
            <ChevronRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      {list.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-glass-border bg-background/30 p-5 text-center">
          <p className="text-sm font-medium text-foreground">No proof yet.</p>

          <p className="mt-1 text-sm text-muted-foreground">Verify your first signal to add a badge.</p>

          <Button onClick={onScan} className="mt-4 bg-gradient-primary text-primary-foreground">
            Verify a signal
          </Button>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {list.map((badge) => (
            <FeaturedProofCard key={badge.id} badge={badge} onClick={() => setOpenId(badge.id)} />
          ))}
        </div>
      )}

      <Dialog open={Boolean(open)} onOpenChange={(next) => !next && setOpenId(null)}>
        <DialogContent className="border-glass-border bg-card/95 text-foreground backdrop-blur-xl">
          {open ? (
            <>
              <DialogHeader>
                <DialogTitle>{open.label}</DialogTitle>

                <DialogDescription>
                  {BADGE_TIER_META[open.tierName].label} · {BADGE_CATEGORY_META[open.category].label}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="rounded-2xl border border-glass-border bg-background/40 p-4">
                  <p className="text-sm leading-relaxed text-muted-foreground">{open.description}</p>

                  {open.privacyNote ? (
                    <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{open.privacyNote}</p>
                  ) : null}
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button
                    className={open.featured ? "bg-gradient-primary" : ""}
                    onClick={async () => {
                      const next = !open.featured;
                      setBadgeFeatured(open.id, next);

                      try {
                        if (next) {
                          await persistBadgeToPublicProfile(open, {
                            featured: true,
                            hidden: false,
                          });
                        } else {
                          await persistBadgeVisibility(open, {
                            featured: false,
                          });
                        }
                      } catch {
                        toast.error("Could not update public profile. Please try again.");
                        return;
                      }

                      toast.success(next ? "Badge added to public profile" : "Removed from public profile");
                    }}
                  >
                    {open.featured ? "Featured" : "Feature on profile"}
                  </Button>

                  <Button
                    variant="outline"
                    onClick={async () => {
                      const next = !open.hidden;
                      setBadgeHidden(open.id, next);

                      try {
                        if (next) {
                          await removeBadgeFromPublicProfile(open.id);
                        } else {
                          await persistBadgeToPublicProfile(open, {
                            featured: open.featured ?? false,
                            hidden: false,
                          });
                        }
                      } catch {
                        toast.error("Could not update public profile. Please try again.");
                        return;
                      }

                      toast.success(next ? "Badge hidden from public profile" : "Badge visible");
                    }}
                  >
                    {open.hidden ? <Eye className="mr-2 h-4 w-4" /> : <EyeOff className="mr-2 h-4 w-4" />}
                    {open.hidden ? "Show" : "Hide"}
                  </Button>
                </div>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </section>
  );
};
