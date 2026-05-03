import { useMemo, useState } from "react";
import { Gift, Lock, Check, Clock, Archive, Sparkles, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useDemo } from "./QuickStats";
import { upsertAndClaimReward, findCatalogByKind, type DemoReward } from "@/lib/demoMode";
import { toast } from "sonner";

const SAMPLE_PARTNER_REWARDS: DemoReward[] = [
  { id: "pr1", title: "20% off wellness gear",   brand: "Premium Fitness Partner", benefit: "20% off any item",       description: "Show your verified Athlete badge in-store.", cost: 0, claimed: false, status: "available", requiredBadgeKind: "athlete" },
  { id: "pr2", title: "Priority event access",    brand: "Travel Partner",          benefit: "Skip-the-line access",   description: "Available at 40+ partner venues.",            cost: 0, claimed: false, status: "available", requiredBadgeKind: "frequent_traveler" },
  { id: "pr3", title: "Course discount",          brand: "Education Partner",       benefit: "30% off any course",     description: "For verified Course Completers.",             cost: 0, claimed: false, status: "available", requiredBadgeKind: "course_done" },
  { id: "pr4", title: "Supporter-only post pack", brand: "Creator Partner",         benefit: "5 private posts",        description: "Backstage feed for your top fans.",           cost: 0, claimed: false, status: "available", requiredBadgeKind: "supporter" },
  { id: "pr5", title: "VIP shopping voucher",     brand: "Lumen Apparel",           benefit: "$25 voucher",            description: "For verified Premium Shoppers only.",         cost: 0, claimed: false, status: "expiring", expiresAt: new Date(Date.now() + 5 * 86400000).toISOString(), requiredBadgeKind: "premium_shopper" },
  { id: "pr6", title: "Verified attendee perk",   brand: "Sound District",          benefit: "Free drink at door",     description: "For ticket-verified attendees.",              cost: 0, claimed: false, status: "available", requiredBadgeKind: "ticket_verified" },
];

type Tab = "recommended" | "available" | "claimed" | "expiring" | "archived";

const TABS: { key: Tab; label: string; emoji: string }[] = [
  { key: "recommended", label: "For you",      emoji: "✨" },
  { key: "available",   label: "Available",    emoji: "🎁" },
  { key: "claimed",     label: "Claimed",      emoji: "✅" },
  { key: "expiring",    label: "Expiring",     emoji: "⏳" },
  { key: "archived",    label: "Archived",     emoji: "🗂️" },
];

export const RewardsLocker = () => {
  const s = useDemo();
  const [tab, setTab] = useState<Tab>("recommended");
  const [confirm, setConfirm] = useState<DemoReward | null>(null);

  const all = useMemo<DemoReward[]>(() => {
    // Merge user state rewards with sample partner rewards (sample only if not already present).
    const map = new Map<string, DemoReward>();
    s.rewards.forEach((r) => map.set(r.id, { ...r, status: r.status ?? (r.claimed ? "claimed" : "available") }));
    SAMPLE_PARTNER_REWARDS.forEach((r) => { if (!map.has(r.id)) map.set(r.id, r); });
    return Array.from(map.values());
  }, [s.rewards]);

  const userBadgeKinds = new Set(s.badges.filter((b) => !b.hidden).map((b) => b.kind));

  const isUnlocked = (r: DemoReward) =>
    !r.requiredBadgeKind || userBadgeKinds.has(r.requiredBadgeKind);

  const filtered = useMemo(() => {
    switch (tab) {
      case "claimed":   return all.filter((r) => r.status === "claimed" || r.claimed);
      case "expiring":  return all.filter((r) => r.status === "expiring" && !r.claimed);
      case "archived":  return all.filter((r) => r.status === "archived");
      case "available": return all.filter((r) => r.status === "available" && !r.claimed && isUnlocked(r));
      case "recommended":
      default:          return all.filter((r) => !r.claimed).slice(0, 6);
    }
  }, [all, tab, userBadgeKinds]);

  const onClaim = (r: DemoReward) => {
    if (!isUnlocked(r)) {
      toast.message("Locked", { description: "Earn the required badge first." });
      return;
    }
    setConfirm(r);
  };

  const confirmClaim = () => {
    if (!confirm) return;
    upsertAndClaimReward(confirm);
    toast.success(`Claimed: ${confirm.title}`, { description: "Added to your reward locker." });
    setConfirm(null);
  };

  return (
    <div className="glass-strong rounded-3xl p-5 md:p-6">
      <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <Gift className="h-4 w-4 text-primary" />
          <h2 className="font-display text-base font-semibold">Reward locker</h2>
          <Badge variant="outline" className="text-[10px]">Offer Box</Badge>
        </div>
        <span className="text-[11px] text-muted-foreground">
          {all.filter((r) => r.claimed).length} claimed · {all.filter((r) => isUnlocked(r) && !r.claimed).length} unlocked
        </span>
      </div>

      <div className="flex items-center gap-1.5 mb-4 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`text-[11px] px-2.5 py-1 rounded-full border transition-colors shrink-0 ${
              tab === t.key
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background/40 border-glass-border text-muted-foreground hover:text-foreground hover:border-border"
            }`}
          >
            {t.emoji} {t.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/60 p-6 text-center text-xs text-muted-foreground">
          Nothing here yet — try another tab or scan for new badges.
        </div>
      ) : (
        <ul className="grid sm:grid-cols-2 gap-2.5">
          {filtered.map((r) => {
            const unlocked = isUnlocked(r);
            const required = r.requiredBadgeKind ? findCatalogByKind(r.requiredBadgeKind) : null;
            return (
              <li
                key={r.id}
                className={`rounded-2xl border p-3.5 flex flex-col gap-2 ${
                  r.claimed
                    ? "border-glass-border bg-primary/5"
                    : unlocked
                    ? "border-glass-border bg-background/40"
                    : "border-dashed border-border/60 bg-background/20"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 grid place-items-center text-xl shrink-0">🎁</div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] uppercase tracking-wider text-muted-foreground truncate">{r.brand ?? "Partner"}</div>
                    <div className="text-sm font-semibold leading-tight">{r.title}</div>
                    {r.benefit && <div className="text-[11px] text-primary mt-0.5">{r.benefit}</div>}
                  </div>
                  {r.claimed ? (
                    <Check className="h-4 w-4 text-primary shrink-0" />
                  ) : !unlocked ? (
                    <Lock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  ) : r.status === "expiring" ? (
                    <Clock className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                  ) : null}
                </div>

                <p className="text-[11px] text-muted-foreground line-clamp-2">{r.description}</p>

                <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/40 mt-auto">
                  <div className="text-[10px] text-muted-foreground truncate">
                    {required ? `Requires ${required.emoji} ${required.label}` : "No badge required"}
                  </div>
                  {r.claimed ? (
                    <Badge variant="secondary" className="text-[10px]">Claimed</Badge>
                  ) : (
                    <Button size="sm" variant={unlocked ? "default" : "outline"} className={`h-7 text-xs ${unlocked ? "bg-gradient-primary" : ""}`} onClick={() => onClaim(r)}>
                      {unlocked ? "Claim" : "Locked"}
                    </Button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <Dialog open={!!confirm} onOpenChange={(o) => !o && setConfirm(null)}>
        <DialogContent className="max-w-md">
          {confirm && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-xl">Claim this reward?</DialogTitle>
                <DialogDescription>
                  {confirm.brand ? `${confirm.brand} · ` : ""}{confirm.title}
                </DialogDescription>
              </DialogHeader>
              <div className="rounded-2xl border border-glass-border bg-background/40 p-4 space-y-2">
                {confirm.benefit && (
                  <div className="flex items-center gap-2 text-sm">
                    <Sparkles className="h-4 w-4 text-primary" /> <strong>{confirm.benefit}</strong>
                  </div>
                )}
                <p className="text-xs text-muted-foreground">{confirm.description}</p>
                {confirm.requiredBadgeKind && (
                  <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                    Eligibility verified by your{" "}
                    {findCatalogByKind(confirm.requiredBadgeKind)?.label ?? "badge"}.
                  </div>
                )}
              </div>
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setConfirm(null)}>Cancel</Button>
                <Button onClick={confirmClaim} className="bg-gradient-primary">
                  <Check className="h-4 w-4" /> Confirm claim
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
