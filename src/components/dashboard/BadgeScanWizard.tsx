import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Check, Loader2, Sparkles, ShieldCheck, ChevronRight } from "lucide-react";
import {
  SCAN_SIGNALS,
  SCAN_SOURCES,
  BADGE_CATEGORY_META,
  BADGE_TIER_META,
  issueDemoBadge,
  setBadgeFeatured,
  type ScanSignalKey,
  type ScanSourceKey,
  type DemoBadge,
} from "@/lib/demoMode";
import { toast } from "sonner";

type Step = 1 | 2 | 3 | 4;

const STEPS = ["Connecting source", "Reviewing record", "Matching signal", "Validating eligibility", "Issuing badge"] as const;

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Optional pre-selected signal to skip step 1. */
  initialSignal?: ScanSignalKey;
  onIssued?: (badge: DemoBadge) => void;
};

export const BadgeScanWizard = ({ open, onOpenChange, initialSignal, onIssued }: Props) => {
  const [step, setStep] = useState<Step>(1);
  const [signal, setSignal] = useState<ScanSignalKey | null>(initialSignal ?? null);
  const [source, setSource] = useState<ScanSourceKey | null>(null);
  const [progressIdx, setProgressIdx] = useState(0);
  const [issued, setIssued] = useState<DemoBadge | null>(null);

  useEffect(() => {
    if (!open) {
      // Reset on close after a tick.
      const t = setTimeout(() => {
        setStep(initialSignal ? 2 : 1);
        setSignal(initialSignal ?? null);
        setSource(null);
        setProgressIdx(0);
        setIssued(null);
      }, 150);
      return () => clearTimeout(t);
    }
    // On open, jump past step 1 if pre-selected.
    if (initialSignal) {
      setSignal(initialSignal);
      setStep(2);
    }
  }, [open, initialSignal]);

  // Step 3 simulated progress.
  useEffect(() => {
    if (step !== 3) return;
    setProgressIdx(0);
    let i = 0;
    const tick = () => {
      i += 1;
      setProgressIdx(i);
      if (i >= STEPS.length) {
        // Issue badge.
        const sig = SCAN_SIGNALS.find((s) => s.key === signal);
        const kind = sig?.suggestedBadgeKind ?? "verified_member";
        const { badge } = issueDemoBadge(kind, { featured: true });
        setIssued(badge);
        setStep(4);
        onIssued?.(badge);
        return;
      }
      timer = window.setTimeout(tick, 700);
    };
    let timer = window.setTimeout(tick, 600);
    return () => window.clearTimeout(timer);
  }, [step, signal, onIssued]);

  const sigMeta = SCAN_SIGNALS.find((s) => s.key === signal);
  const tierMeta = issued ? BADGE_TIER_META[issued.tierName] : null;
  const catMeta = issued ? BADGE_CATEGORY_META[issued.category] : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {step === 4 ? "Badge issued" : "Verify a signal"}
          </DialogTitle>
          <DialogDescription>
            {step === 1 && "Choose what you'd like XIONID to verify."}
            {step === 2 && "Pick how we should confirm this signal."}
            {step === 3 && "Hold tight — we're checking only what's needed."}
            {step === 4 && "Your new proof is ready. Decide how it shows."}
          </DialogDescription>
        </DialogHeader>

        {/* Step 1 */}
        {step === 1 && (
          <div className="grid sm:grid-cols-2 gap-2 mt-2 max-h-[55vh] overflow-y-auto pr-1">
            {SCAN_SIGNALS.map((s) => (
              <button
                key={s.key}
                onClick={() => { setSignal(s.key); setStep(2); }}
                className="text-left rounded-2xl border border-glass-border bg-background/30 hover:border-primary/40 transition-all p-3"
              >
                <div className="text-2xl">{s.emoji}</div>
                <div className="text-sm font-semibold mt-1">{s.label}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">{s.blurb}</div>
              </button>
            ))}
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <>
            {sigMeta && (
              <div className="rounded-xl bg-primary/5 border border-primary/20 px-3 py-2 text-xs flex items-center gap-2">
                <span>{sigMeta.emoji}</span>
                <span className="text-muted-foreground">Verifying:</span>
                <span className="font-medium">{sigMeta.label}</span>
              </div>
            )}
            <div className="grid sm:grid-cols-2 gap-2 mt-2 max-h-[50vh] overflow-y-auto pr-1">
              {SCAN_SOURCES.map((s) => (
                <button
                  key={s.key}
                  onClick={() => { setSource(s.key); setStep(3); }}
                  className="text-left rounded-2xl border border-glass-border bg-background/30 hover:border-primary/40 transition-all p-3"
                >
                  <div className="text-2xl">{s.emoji}</div>
                  <div className="text-sm font-semibold mt-1">{s.label}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">{s.blurb}</div>
                </button>
              ))}
            </div>
          </>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className="py-6 space-y-5">
            <div className="flex items-center justify-center">
              <div className="h-20 w-20 rounded-3xl bg-gradient-primary grid place-items-center shadow-glow-primary glow-primary animate-pulse">
                <ShieldCheck className="h-9 w-9 text-primary-foreground" />
              </div>
            </div>
            <Progress value={Math.min(100, (progressIdx / STEPS.length) * 100)} className="h-2" />
            <ul className="space-y-2">
              {STEPS.map((label, i) => {
                const done = i < progressIdx;
                const active = i === progressIdx;
                return (
                  <li key={label} className="flex items-center gap-2 text-sm">
                    <span className={`h-5 w-5 rounded-full grid place-items-center shrink-0 ${
                      done ? "bg-primary/20 text-primary"
                        : active ? "bg-primary/10 text-primary"
                        : "bg-muted/40 text-muted-foreground"
                    }`}>
                      {done ? <Check className="h-3 w-3" /> : active ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                    </span>
                    <span className={done || active ? "text-foreground" : "text-muted-foreground"}>{label}</span>
                  </li>
                );
              })}
            </ul>
            <p className="text-[11px] text-center text-muted-foreground">
              We check only the fact. Your underlying data never leaves the source.
            </p>
          </div>
        )}

        {/* Step 4 */}
        {step === 4 && issued && tierMeta && catMeta && (
          <div className="space-y-4">
            <div className="rounded-3xl border border-glass-border bg-gradient-to-br from-background/80 to-primary/5 p-5">
              <div className="flex items-start gap-4">
                <div className={`h-16 w-16 rounded-2xl grid place-items-center text-3xl bg-gradient-to-br ${tierMeta.ring}`}>
                  {issued.emoji}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-display text-lg font-semibold">{issued.label}</h3>
                    <Badge variant="secondary" className="text-[10px]">{tierMeta.emoji} {tierMeta.label}</Badge>
                  </div>
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground mt-0.5">
                    {catMeta.emoji} {catMeta.label}
                  </div>
                  <p className="text-sm text-foreground/80 mt-2 leading-relaxed">{issued.description}</p>
                </div>
              </div>
              <p className="mt-4 text-[11px] text-muted-foreground border-t border-border/40 pt-3 flex items-start gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                {issued.privacyNote}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setBadgeFeatured(issued.id, false);
                  toast.success("Kept private", { description: "Only you can see this badge." });
                  onOpenChange(false);
                }}
              >
                Keep private
              </Button>
              <Button
                onClick={() => {
                  setBadgeFeatured(issued.id, true);
                  toast.success("Now on your profile", { description: `${issued.label} is visible to visitors.` });
                  onOpenChange(false);
                }}
                className="bg-gradient-primary"
              >
                <Sparkles className="h-4 w-4" /> Show on profile
              </Button>
              <Button variant="ghost" onClick={() => onOpenChange(false)}>
                View inventory
              </Button>
              <Button
                variant="ghost"
                onClick={() => { setStep(1); setSignal(null); setSource(null); setIssued(null); }}
              >
                Continue scanning <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
